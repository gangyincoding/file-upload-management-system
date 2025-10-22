import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '用户注册成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createUserDto: any) {
    const user = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '用户注册成功',
      data: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  async findAll() {
    const users = await this.userService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: '获取用户列表成功',
      data: users.map(user => ({
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: '用户不存在'
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: '获取用户成功',
      data: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    };
  }

  @Post('test-db')
  @ApiOperation({ summary: '测试数据库连接' })
  @ApiResponse({ status: 200, description: '数据库连接测试成功' })
  async testDatabase() {
    try {
      const userCount = await this.userService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'MongoDB连接测试成功！',
        data: {
          connected: true,
          userCount: userCount.length,
          timestamp: new Date().toISOString(),
          database: 'file_management'
        }
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '数据库连接失败',
        error: error.message
      };
    }
  }
}