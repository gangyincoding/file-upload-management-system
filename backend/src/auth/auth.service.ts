import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 检查用户是否已存在
    const existingUser = await this.userModel.findOne({
      phoneNumber: registerDto.phoneNumber,
    });

    if (existingUser) {
      throw new ConflictException('该手机号已注册');
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      role: 'user',
    });

    const savedUser = await newUser.save();

    // 生成JWT令牌
    const payload = {
      sub: savedUser._id,
      phoneNumber: savedUser.phoneNumber,
      username: savedUser.username,
      role: savedUser.role,
    };

    const accessToken = this.jwtService.generateToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return {
      statusCode: 201,
      message: '注册成功',
      data: {
        user: {
          id: savedUser._id,
          phoneNumber: savedUser.phoneNumber,
          username: savedUser.username,
          role: savedUser.role,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // 查找用户
    const user = await this.userModel.findOne({
      phoneNumber: loginDto.phoneNumber,
    });

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 生成JWT令牌
    const payload = {
      sub: user._id,
      phoneNumber: user.phoneNumber,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.generateToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return {
      statusCode: 200,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          username: user.username,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  async validateUser(phoneNumber: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ phoneNumber });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }
}