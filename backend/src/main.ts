import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from 'winston';
import { createLogger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 获取配置服务
  const configService = app.get(ConfigService);
  const logger = createLogger();

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 启用CORS
  app.enableCors({
    origin: [
      configService.get('frontend_url') || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    ],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // 暂时关闭白名单验证
      forbidNonWhitelisted: false, // 暂时关闭非白名单属性禁止
      transform: true,
    }),
  );

  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('文件管理系统 API')
    .setDescription('企业文件管理系统后端API接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 获取端口
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);

  logger.info(`🚀 Application is running on: http://localhost:${port}`);
  logger.info(`📚 API Documentation available at: http://localhost:${port}/api-docs`);
}

bootstrap();