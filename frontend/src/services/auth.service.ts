import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    user: {
      id: string;
      phoneNumber: string;
      username: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

// 认证服务
export class AuthService {
  // 用户登录
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    return await apiClient.post('/auth/login', credentials);
  }

  // 用户注册
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await apiClient.post('/auth/register', userData);
  }

  // 测试认证API
  static async testAuth() {
    return await apiClient.post('/auth/test');
  }

  // 保存认证信息
  static saveAuthData(response: AuthResponse) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  // 清除认证信息
  static clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // 获取当前用户信息
  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 检查是否已登录
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default AuthService;