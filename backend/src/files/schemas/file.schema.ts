import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class File {
  _id: string;

  createdAt: Date;

  updatedAt: Date;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  objectName: string; // MinIO object name

  @Prop({ required: true })
  bucket: string;

  @Prop({ type: String, required: true })
  uploadedBy: string; // User ID

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: String, default: null })
  deletedBy?: string;

  @Prop({ type: String, required: true })
  hash: string; // MD5 hash for file integrity
}

export const FileSchema = SchemaFactory.createForClass(File);

// Create indexes for better performance
FileSchema.index({ uploadedBy: 1, isActive: 1 });
FileSchema.index({ mimeType: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ objectName: 1 }, { unique: true });