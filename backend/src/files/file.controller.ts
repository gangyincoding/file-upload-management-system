import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传文件' })
  @ApiResponse({ status: 201, description: '文件上传成功' })
  @ApiResponse({ status: 400, description: '文件格式或大小错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: /(.*?)/ }), // Accept all file types for now
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('description') description?: string,
    @Body('tags') tags?: string,
    @Request() req?: any,
  ) {
    try {
      const userId = req.user.userId;
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      const result = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId,
        description,
        tagsArray,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: '文件上传成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || '文件上传失败',
        error: error.message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: '获取用户文件列表' })
  @ApiResponse({ status: 200, description: '获取文件列表成功' })
  async getUserFiles(
    @Query() query: FileQueryDto,
    @Request() req?: any,
  ) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10, search, type } = query;

      const result = await this.fileService.getUserFiles(userId, page, limit, {
        search,
        type,
      });

      return {
        statusCode: HttpStatus.OK,
        message: '获取文件列表成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '获取文件列表失败',
        error: error.message,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件信息' })
  @ApiResponse({ status: 200, description: '获取文件信息成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFileById(@Param('id') id: string, @Request() req?: any) {
    try {
      const userId = req.user.userId;
      const result = await this.fileService.getFileById(id, userId);

      return {
        statusCode: HttpStatus.OK,
        message: '获取文件信息成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || '获取文件信息失败',
        error: error.message,
      };
    }
  }

  @Get(':id/url')
  @ApiOperation({ summary: '获取文件下载链接' })
  @ApiResponse({ status: 200, description: '获取下载链接成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFileUrl(@Param('id') id: string, @Request() req?: any) {
    try {
      const userId = req.user.userId;
      const result = await this.fileService.getFileUrl(id, userId);

      return {
        statusCode: HttpStatus.OK,
        message: '获取下载链接成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || '获取下载链接失败',
        error: error.message,
      };
    }
  }

  @Get(':id/info')
  @ApiOperation({ summary: '获取文件详细信息' })
  @ApiResponse({ status: 200, description: '获取文件信息成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFileInfo(@Param('id') id: string, @Request() req?: any) {
    try {
      const userId = req.user.userId;
      const result = await this.fileService.getFileInfo(id, userId);

      return {
        statusCode: HttpStatus.OK,
        message: '获取文件信息成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || '获取文件信息失败',
        error: error.message,
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文件信息' })
  @ApiResponse({ status: 200, description: '文件信息更新成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async updateFile(
    @Param('id') id: string,
    @Body() updateData: UpdateFileDto,
    @Request() req?: any,
  ) {
    try {
      const userId = req.user.userId;
      const result = await this.fileService.updateFile(id, userId, updateData);

      return {
        statusCode: HttpStatus.OK,
        message: '文件信息更新成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || '文件信息更新失败',
        error: error.message,
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户文件统计信息' })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  async getFileStats(@Request() req?: any) {
    try {
      const userId = req.user.userId;
      const result = await this.fileService.getFileStats(userId);

      return {
        statusCode: HttpStatus.OK,
        message: '获取统计信息成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '获取统计信息失败',
        error: error.message,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除文件' })
  @ApiResponse({ status: 200, description: '文件删除成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async deleteFile(@Param('id') id: string, @Request() req?: any) {
    try {
      const userId = req.user.userId;
      const result = await this.fileService.deleteFile(id, userId);

      return {
        statusCode: HttpStatus.OK,
        message: '文件删除成功',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || '文件删除失败',
        error: error.message,
      };
    }
  }
}