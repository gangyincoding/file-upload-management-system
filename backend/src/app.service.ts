import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '文件管理系统后端API服务正在运行';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'file-management-backend',
      version: '1.0.0',
    };
  }
}