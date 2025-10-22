import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 文件上传需要更长时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface FileInfo {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  description: string;
  tags: string[];
}

export interface FileListResponse {
  files: FileInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileUploadResponse {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
  description: string;
  tags: string[];
}

export interface FileUrlResponse {
  url: string;
  fileName: string;
  mimeType: string;
}

export class FileService {
  // 上传文件
  static async uploadFile(file: File, description?: string, tags?: string[]): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (description) {
      formData.append('description', description);
    }

    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // 获取用户文件列表
  static async getUserFiles(page = 1, limit = 10): Promise<FileListResponse> {
    const response = await apiClient.get('/files', {
      params: { page, limit },
    });

    return response.data;
  }

  // 获取文件信息
  static async getFileById(fileId: string): Promise<FileInfo> {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  }

  // 获取文件下载链接
  static async getFileUrl(fileId: string): Promise<FileUrlResponse> {
    const response = await apiClient.get(`/files/${fileId}/url`);
    return response.data;
  }

  // 获取文件详细信息
  static async getFileInfo(fileId: string): Promise<FileInfo & { minioInfo: any }> {
    const response = await apiClient.get(`/files/${fileId}/info`);
    return response.data;
  }

  // 更新文件信息
  static async updateFile(fileId: string, updateData: { description?: string; tags?: string[] }): Promise<FileInfo> {
    const response = await apiClient.put(`/files/${fileId}`, updateData);
    return response.data;
  }

  // 删除文件
  static async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 获取文件图标类型
  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Picture';
    if (mimeType.startsWith('video/')) return 'VideoPlay';
    if (mimeType.startsWith('audio/')) return 'Headphones';
    if (mimeType.includes('pdf')) return 'Document';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Edit';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Grid';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Monitor';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Folder';
    if (mimeType.includes('text')) return 'Document';

    return 'Document'; // 默认图标
  }

  // 判断是否为图片文件
  static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  // 判断是否为视频文件
  static isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  // 判断是否为音频文件
  static isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  // 判断是否为PDF文件
  static isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  // 判断是否可预览
  static canPreview(mimeType: string): boolean {
    return this.isImageFile(mimeType) ||
           this.isPdfFile(mimeType) ||
           this.isVideoFile(mimeType) ||
           this.isAudioFile(mimeType) ||
           mimeType.includes('text/');
  }
}

export default FileService;