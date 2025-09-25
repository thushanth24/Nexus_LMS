import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../prisma-enums.js';

export interface SerializedMaterial {
  id: string;
  classId: string | null;
  title: string;
  type: string;
  url: string;
  createdAt?: string;
}

@Injectable()
export class MaterialsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.bucketName = this.configService.get<string>('aws.s3BucketName');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
  }

  async createPresignedUrl(fileName: string, fileType: string) {
    const fileExtension = fileName.split('.').pop();
    const s3Key = `materials/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      url: signedUrl,
      key: s3Key,
    };
  }

  private serializeMaterial(material: any): SerializedMaterial {
    const type = typeof material.type === 'string' ? material.type.toLowerCase() : material.type;

    return {
      id: material.id,
      classId: material.groupId ?? material.pairId ?? null,
      title: material.title,
      type,
      url: material.url,
      createdAt:
        material.createdAt instanceof Date
          ? material.createdAt.toISOString()
          : material.createdAt,
    };
  }

  async listForClass(
    classId: string,
    user: { userId: string; role: UserRole },
  ): Promise<SerializedMaterial[]> {
    const isAdmin = user.role === UserRole.ADMIN;

    const group = await this.prisma.group.findUnique({
      where: { id: classId },
      include: {
        members: { select: { id: true } },
        teacher: { select: { id: true } },
      },
    });

    if (group) {
      const isTeacher = group.teacherId === user.userId;
      const isMember = group.members.some((member) => member.id === user.userId);

      if (!isAdmin && !isTeacher && !isMember) {
        throw new ForbiddenException('You do not have access to these materials');
      }

      const materials = await this.prisma.material.findMany({
        where: { groupId: classId },
        orderBy: { createdAt: 'desc' },
      });

      return materials.map((material) => this.serializeMaterial(material));
    }

    const pair = await this.prisma.pair.findUnique({
      where: { id: classId },
      select: {
        teacherId: true,
        studentId: true,
      },
    });

    if (!pair) {
      throw new NotFoundException('Class not found');
    }

    const isPairTeacher = pair.teacherId === user.userId;
    const isPairStudent = pair.studentId === user.userId;

    if (!isAdmin && !isPairTeacher && !isPairStudent) {
      throw new ForbiddenException('You do not have access to these materials');
    }

    const materials = await this.prisma.material.findMany({
      where: { pairId: classId },
      orderBy: { createdAt: 'desc' },
    });

    return materials.map((material) => this.serializeMaterial(material));
  }
}
