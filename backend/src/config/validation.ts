import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 应用配置
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),

  // MongoDB配置
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/file_management'),

  // JWT配置
  JWT_SECRET: Joi.string().default('your-secret-key-change-in-production'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // MinIO配置
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().default(9000),
  MINIO_USE_SSL: Joi.boolean().default(false),
  MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
  MINIO_BUCKET: Joi.string().default('file-management'),

  // Redis配置
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // 文件上传配置
  MAX_FILE_SIZE: Joi.number().default(20 * 1024 * 1024), // 20MB
  ALLOWED_MIME_TYPES: Joi.string().optional(),

  // 日志配置
  LOG_LEVEL: Joi.string().default('info'),
  LOG_FILENAME: Joi.string().default('logs/app.log'),
});