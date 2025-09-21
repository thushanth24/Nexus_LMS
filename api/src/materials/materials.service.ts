import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class MaterialsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
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
    
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour

    return {
      url: signedUrl,
      key: s3Key,
    };
  }
}
