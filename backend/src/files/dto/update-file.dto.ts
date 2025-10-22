import { IsOptional, IsString, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '描述不能超过200个字符' })
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: '标签不能超过10个' })
  @IsString({ each: true })
  tags?: string[];
}