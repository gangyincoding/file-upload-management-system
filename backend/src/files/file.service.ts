import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './schemas/file.schema';
import { MinioService } from '../minio/minio.service';
import * as crypto from 'crypto';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    private minioService: MinioService,
  ) {}

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    description?: string,
    tags?: string[],
  ) {
    try {
      // Validate file size (max 20MB)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (fileBuffer.length > maxSize) {
        throw new BadRequestException('文件大小不能超过20MB');
      }

      // Calculate file hash for integrity
      const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

      // Upload to MinIO
      const objectName = await this.minioService.uploadFile(
        fileBuffer,
        originalName,
        mimeType,
      );

      // Save to database
      const newFile = new this.fileModel({
        originalName,
        fileName: originalName,
        mimeType,
        size: fileBuffer.length,
        objectName,
        bucket: 'file-management',
        uploadedBy: userId,
        description: description || '',
        tags: tags || [],
        hash,
      });

      const savedFile = await newFile.save();

      this.logger.log(`File uploaded successfully: ${originalName} (${objectName})`);

      return {
        id: savedFile._id,
        originalName: savedFile.originalName,
        fileName: savedFile.fileName,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
        uploadedBy: savedFile.uploadedBy,
        createdAt: savedFile.createdAt,
        description: savedFile.description,
        tags: savedFile.tags,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async getUserFiles(userId: string, page = 1, limit = 10, options?: {
    search?: string;
    type?: string;
  }) {
    try {
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      };

      // Add search filter
      if (options?.search) {
        const searchRegex = new RegExp(options.search, 'i');
        query.$or = [
          { originalName: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ];
      }

      // Add type filter
      if (options?.type) {
        if (options.type === 'image') {
          query.mimeType = { $regex: '^image/' };
        } else if (options.type === 'video') {
          query.mimeType = { $regex: '^video/' };
        } else if (options.type === 'audio') {
          query.mimeType = { $regex: '^audio/' };
        } else if (options.type === 'document') {
          query.mimeType = {
            $in: [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'text/plain',
            ]
          };
        }
      }

      const files = await this.fileModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.fileModel.countDocuments(query);

      return {
        files: files.map(file => ({
          id: file._id,
          originalName: file.originalName,
          fileName: file.fileName,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt,
          description: file.description,
          tags: file.tags,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting user files: ${error.message}`);
      throw error;
    }
  }

  async getFileById(fileId: string, userId: string) {
    try {
      const file = await this.fileModel.findOne({
        _id: fileId,
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      });

      if (!file) {
        throw new NotFoundException('文件不存在');
      }

      return {
        id: file._id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdAt,
        description: file.description,
        tags: file.tags,
      };
    } catch (error) {
      this.logger.error(`Error getting file: ${error.message}`);
      throw error;
    }
  }

  async getFileUrl(fileId: string, userId: string) {
    try {
      const file = await this.fileModel.findOne({
        _id: fileId,
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      });

      if (!file) {
        throw new NotFoundException('文件不存在');
      }

      const url = await this.minioService.getFileUrl(file.objectName);
      return {
        url,
        fileName: file.originalName,
        mimeType: file.mimeType,
      };
    } catch (error) {
      this.logger.error(`Error getting file URL: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string) {
    try {
      const file = await this.fileModel.findOne({
        _id: fileId,
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      });

      if (!file) {
        throw new NotFoundException('文件不存在');
      }

      // Soft delete first
      file.isDeleted = true;
      file.deletedAt = new Date();
      file.deletedBy = userId;
      await file.save();

      // Optionally delete from MinIO after a delay
      // For now, we'll keep the file in MinIO for recovery purposes

      this.logger.log(`File deleted successfully: ${file.originalName}`);
      return { message: '文件删除成功' };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  async updateFile(
    fileId: string,
    userId: string,
    updateData: { description?: string; tags?: string[] },
  ) {
    try {
      const file = await this.fileModel.findOne({
        _id: fileId,
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      });

      if (!file) {
        throw new NotFoundException('文件不存在');
      }

      if (updateData.description !== undefined) {
        file.description = updateData.description;
      }

      if (updateData.tags !== undefined) {
        file.tags = updateData.tags;
      }

      await file.save();

      return {
        id: file._id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        description: file.description,
        tags: file.tags,
        updatedAt: file.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error updating file: ${error.message}`);
      throw error;
    }
  }

  async getFileStats(userId: string) {
    try {
      const matchStage = {
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      };

      // 获取基础统计
      const [
        totalFiles,
        totalSize,
        mimeTypeStats,
        recentFiles,
      ] = await Promise.all([
        this.fileModel.countDocuments(matchStage),
        this.fileModel.aggregate([
          { $match: matchStage },
          { $group: { _id: null, totalSize: { $sum: '$size' } } },
        ]).then(result => result[0]?.totalSize || 0),
        this.fileModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$mimeType', count: { $sum: 1 } } },
        ]),
        this.fileModel
          .find(matchStage)
          .sort({ createdAt: -1 })
          .limit(5)
          .select('originalName mimeType size createdAt')
          .exec(),
      ]);

      // 按类型分类统计
      const imageCount = mimeTypeStats
        .filter(stat => stat._id.startsWith('image/'))
        .reduce((sum, stat) => sum + stat.count, 0);

      const videoCount = mimeTypeStats
        .filter(stat => stat._id.startsWith('video/'))
        .reduce((sum, stat) => sum + stat.count, 0);

      const audioCount = mimeTypeStats
        .filter(stat => stat._id.startsWith('audio/'))
        .reduce((sum, stat) => sum + stat.count, 0);

      const documentCount = mimeTypeStats
        .filter(stat =>
          stat._id.includes('pdf') ||
          stat._id.includes('word') ||
          stat._id.includes('excel') ||
          stat._id.includes('powerpoint') ||
          stat._id.includes('text')
        )
        .reduce((sum, stat) => sum + stat.count, 0);

      return {
        totalFiles,
        totalSize,
        imageCount,
        videoCount,
        audioCount,
        documentCount,
        otherCount: totalFiles - imageCount - videoCount - audioCount - documentCount,
        recentFiles: recentFiles.map(file => ({
          id: file._id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt,
        })),
        mimeTypeDistribution: mimeTypeStats.map(stat => ({
          mimeType: stat._id,
          count: stat.count,
        })),
      };
    } catch (error) {
      this.logger.error(`Error getting file stats: ${error.message}`);
      throw error;
    }
  }

  async getFileInfo(fileId: string, userId: string) {
    try {
      const file = await this.fileModel.findOne({
        _id: fileId,
        uploadedBy: userId,
        isActive: true,
        isDeleted: false,
      });

      if (!file) {
        throw new NotFoundException('文件不存在');
      }

      const minioInfo = await this.minioService.getFileInfo(file.objectName);

      return {
        id: file._id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdAt,
        description: file.description,
        tags: file.tags,
        minioInfo: {
          etag: minioInfo.etag,
          lastModified: minioInfo.lastModified,
          size: minioInfo.size,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting file info: ${error.message}`);
      throw error;
    }
  }
}