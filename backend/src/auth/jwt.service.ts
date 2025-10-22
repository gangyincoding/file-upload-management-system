import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  generateToken(payload: any): string {
    return jwt.sign(payload, this.configService.get<string>('jwt.secret'), {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, this.configService.get<string>('jwt.secret'), {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.configService.get<string>('jwt.secret'));
    } catch (error) {
      return null;
    }
  }
}