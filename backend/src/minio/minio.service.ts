import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'file-management';
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      } else {
        this.logger.log(`Bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      this.logger.error(`Error creating bucket: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const objectName = this.generateObjectName(fileName);

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file,
        undefined,
        {
          'Content-Type': mimeType,
        }
      );

      this.logger.log(`File uploaded successfully: ${objectName}`);
      return objectName;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async getFileUrl(objectName: string): Promise<string> {
    try {
      // Generate presigned URL for 1 hour
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        3600
      );
      return url;
    } catch (error) {
      this.logger.error(`Error generating file URL: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  async getFileInfo(objectName: string): Promise<Minio.BucketItemStat> {
    try {
      const stat = await this.minioClient.statObject(this.bucketName, objectName);
      return stat;
    } catch (error) {
      this.logger.error(`Error getting file info: ${error.message}`);
      throw error;
    }
  }

  private generateObjectName(originalName: string): string {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }

  async listFiles(prefix?: string): Promise<Minio.BucketItem[]> {
    try {
      const stream = this.minioClient.listObjects(this.bucketName, prefix, true);
      const files: Minio.BucketItem[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => files.push(obj));
        stream.on('error', (error) => reject(error));
        stream.on('end', () => resolve(files));
      });
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`);
      throw error;
    }
  }
}