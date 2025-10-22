import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import AuthService, { type LoginRequest, type RegisterRequest, type AuthResponse } from '@/services/auth.service';

export interface User {
  id: string;
  phoneNumber: string;
  username: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userRole = computed(() => user.value?.role || 'guest');
  const userName = computed(() => user.value?.username || '');

  // 初始化 - 从localStorage恢复状态
  const initAuth = () => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');

      if (savedUser && savedToken) {
        user.value = JSON.parse(savedUser);
        accessToken.value = savedToken;
        refreshToken.value = savedRefreshToken;
      }
    } catch (err) {
      console.error('Failed to restore auth state:', err);
      clearAuth();
    }
  };

  // 登录
  const login = async (credentials: LoginRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await AuthService.login(credentials);

      if (response.statusCode === 200) {
        user.value = response.data.user;
        accessToken.value = response.data.accessToken;
        refreshToken.value = response.data.refreshToken;

        AuthService.saveAuthData(response);
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '登录失败';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // 注册
  const register = async (userData: RegisterRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await AuthService.register(userData);

      if (response.statusCode === 201) {
        user.value = response.data.user;
        accessToken.value = response.data.accessToken;
        refreshToken.value = response.data.refreshToken;

        AuthService.saveAuthData(response);
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '注册失败';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // 登出
  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    error.value = null;

    AuthService.clearAuthData();
  };

  // 清除认证状态
  const clearAuth = () => {
    logout();
  };

  // 刷新用户信息
  const refreshUserInfo = () => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      user.value = currentUser;
    }
  };

  return {
    // 状态
    user,
    accessToken,
    refreshToken,
    loading,
    error,

    // 计算属性
    isAuthenticated,
    userRole,
    userName,

    // 方法
    initAuth,
    login,
    register,
    logout,
    clearAuth,
    refreshUserInfo,
  };
});