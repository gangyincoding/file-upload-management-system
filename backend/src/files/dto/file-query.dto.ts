import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class FileQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @IsOptional()
  @IsIn(['image', 'video', 'audio', 'document'], {
    message: '文件类型必须是: image, video, audio, document 之一'
  })
  type?: string;
}