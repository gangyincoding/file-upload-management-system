import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { File, FileSchema } from './schemas/file.schema';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    MulterModule.register({
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
    MinioModule,
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FilesModule {}