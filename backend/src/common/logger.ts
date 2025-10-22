import * as winston from 'winston';
import * as path from 'path';

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

// 创建logger实例
export const createLogger = (): winston.Logger => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'file-management-backend' },
    transports: [
      // 错误日志文件
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
      }),
      // 所有日志文件
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
      }),
    ],
  });

  // 开发环境添加控制台输出
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    );
  }

  return logger;
};

// 导出默认logger实例
export const logger = createLogger();