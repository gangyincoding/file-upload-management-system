import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '手机号已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '手机号或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('test')
  @ApiOperation({ summary: '测试认证API' })
  @ApiResponse({ status: 200, description: '认证API测试成功' })
  async testAuth() {
    return {
      statusCode: HttpStatus.OK,
      message: '认证API测试成功！',
      data: {
        available: true,
        endpoints: [
          'POST /api/auth/register - 用户注册',
          'POST /api/auth/login - 用户登录',
          'POST /api/auth/test - 测试接口',
        ],
        timestamp: new Date().toISOString(),
      },
    };
  }
}