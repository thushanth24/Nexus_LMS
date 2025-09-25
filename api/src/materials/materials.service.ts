import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserRole } from "../prisma-enums.js";
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { UpdateMaterialDto } from "./dto/update-material.dto.js";

export interface SerializedMaterial {
  id: string;
  classId: string | null;
  title: string;
  type: string;
  url: string;
  createdAt?: string;
}

type AuthenticatedUser = { userId: string; role: UserRole };

type WritableClass = {
  type: "group" | "pair";
  id: string;
};

@Injectable()
export class MaterialsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.bucketName = this.configService.get<string>("aws.s3BucketName");
    this.s3Client = new S3Client({
      region: this.configService.get<string>("aws.region"),
      credentials: {
        accessKeyId: this.configService.get<string>("aws.accessKeyId"),
        secretAccessKey: this.configService.get<string>("aws.secretAccessKey"),
      },
    });
  }

  async createPresignedUrl(fileName: string, fileType: string) {
    const fileExtension = fileName.split(".").pop();
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
    const type = typeof material.type === "string" ? material.type.toLowerCase() : material.type;

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

  private async ensureWritableClass(
    classId: string,
    user: AuthenticatedUser,
  ): Promise<WritableClass> {
    const isAdmin = user.role === UserRole.ADMIN;

    const group = await this.prisma.group.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (group) {
      if (!isAdmin && group.teacherId !== user.userId) {
        throw new ForbiddenException("You do not have permission to modify materials for this class");
      }

      return { type: "group", id: group.id };
    }

    const pair = await this.prisma.pair.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (!pair) {
      throw new NotFoundException("Class not found");
    }

    if (!isAdmin && pair.teacherId !== user.userId) {
      throw new ForbiddenException("You do not have permission to modify materials for this class");
    }

    return { type: "pair", id: pair.id };
  }

  private normalizeMaterialType(type: "pdf" | "video"): "PDF" | "VIDEO" {
    return type.toUpperCase() as "PDF" | "VIDEO";
  }

  async listForClass(
    classId: string,
    user: AuthenticatedUser,
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
        throw new ForbiddenException("You do not have access to these materials");
      }

      const materials = await this.prisma.material.findMany({
        where: { groupId: classId },
        orderBy: { createdAt: "desc" },
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
      throw new NotFoundException("Class not found");
    }

    const isPairTeacher = pair.teacherId === user.userId;
    const isPairStudent = pair.studentId === user.userId;

    if (!isAdmin && !isPairTeacher && !isPairStudent) {
      throw new ForbiddenException("You do not have access to these materials");
    }

    const materials = await this.prisma.material.findMany({
      where: { pairId: classId },
      orderBy: { createdAt: "desc" },
    });

    return materials.map((material) => this.serializeMaterial(material));
  }

  async createForClass(
    classId: string,
    dto: CreateMaterialDto,
    user: AuthenticatedUser,
  ): Promise<SerializedMaterial> {
    const target = await this.ensureWritableClass(classId, user);

    const material = await this.prisma.material.create({
      data: {
        title: dto.title,
        type: this.normalizeMaterialType(dto.type),
        url: dto.url,
        groupId: target.type === "group" ? target.id : null,
        pairId: target.type === "pair" ? target.id : null,
      },
    });

    return this.serializeMaterial(material);
  }

  async updateMaterial(
    materialId: string,
    dto: UpdateMaterialDto,
    user: AuthenticatedUser,
  ): Promise<SerializedMaterial> {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        group: { select: { id: true, teacherId: true } },
        pair: { select: { id: true, teacherId: true } },
      },
    });

    if (!material) {
      throw new NotFoundException("Material not found");
    }

    const classId = material.group?.id ?? material.pair?.id;

    if (!classId) {
      throw new NotFoundException("Associated class not found for this material");
    }

    await this.ensureWritableClass(classId, user);

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.type !== undefined) {
      data.type = this.normalizeMaterialType(dto.type);
    }

    if (dto.url !== undefined) {
      data.url = dto.url;
    }

    const updated = await this.prisma.material.update({
      where: { id: materialId },
      data,
    });

    return this.serializeMaterial(updated);
  }

  async deleteMaterial(materialId: string, user: AuthenticatedUser): Promise<void> {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        group: { select: { id: true, teacherId: true } },
        pair: { select: { id: true, teacherId: true } },
      },
    });

    if (!material) {
      throw new NotFoundException("Material not found");
    }

    const classId = material.group?.id ?? material.pair?.id;

    if (!classId) {
      throw new NotFoundException("Associated class not found for this material");
    }

    await this.ensureWritableClass(classId, user);

    await this.prisma.material.delete({ where: { id: materialId } });
  }
}
