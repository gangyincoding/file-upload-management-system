<template>
  <div class="files-container">
    <!-- 页面头部 -->
    <div class="files-header">
      <div class="header-left">
        <h1>文件管理</h1>
        <p class="welcome-text">欢迎回来，{{ authStore.userName }}！</p>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleUserMenu">
          <div class="user-info">
            <el-avatar :size="32" :icon="UserFilled" />
            <span class="user-name">{{ authStore.userName }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <el-row :gutter="24">
        <el-col :span="6" :xs="12" :sm="6">
          <div class="stat-item">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-content">
              <h3>{{ fileStats.totalFiles }}</h3>
              <p>文件总数</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6" :xs="12" :sm="6">
          <div class="stat-item">
            <el-icon class="stat-icon"><DataLine /></el-icon>
            <div class="stat-content">
              <h3>{{ formatFileSize(fileStats.totalSize) }}</h3>
              <p>存储空间</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6" :xs="12" :sm="6">
          <div class="stat-item">
            <el-icon class="stat-icon"><Picture /></el-icon>
            <div class="stat-content">
              <h3>{{ fileStats.imageCount }}</h3>
              <p>图片文件</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6" :xs="12" :sm="6">
          <div class="stat-item">
            <el-icon class="stat-icon"><Folder /></el-icon>
            <div class="stat-content">
              <h3>{{ fileStats.folderCount }}</h3>
              <p>文件夹</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区 -->
    <div class="files-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <h2>
          <el-icon><Upload /></el-icon>
          上传文件
        </h2>
        <FileUpload @success="handleUploadSuccess" @error="handleUploadError" />
      </div>

      <!-- 文件列表 -->
      <div class="list-section">
        <h2>
          <el-icon><Files /></el-icon>
          我的文件
        </h2>
        <FileList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  ArrowDown,
  Document,
  DataLine,
  Picture,
  Folder,
  Upload,
  Files
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { FileService, type FileUploadResponse } from '@/services/file.service'
import FileUpload from '@/components/FileUpload.vue'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const authStore = useAuthStore()

// 文件统计
const fileStats = reactive({
  totalFiles: 0,
  totalSize: 0,
  imageCount: 0,
  folderCount: 0
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  return FileService.formatFileSize(bytes)
}

// 获取文件统计
const fetchFileStats = async () => {
  try {
    const response = await FileService.getUserFiles(1, 1)
    fileStats.totalFiles = response.total

    // 计算总大小（这里需要分批获取所有文件）
    let totalSize = 0
    let imageCount = 0
    let allFiles: any[] = []

    // 获取所有文件（分批）
    const totalPages = Math.ceil(response.total / 100)
    for (let page = 1; page <= totalPages; page++) {
      try {
        const pageResponse = await FileService.getUserFiles(page, 100)
        allFiles = allFiles.concat(pageResponse.files)
      } catch (error) {
        console.error(`获取第${page}页文件失败:`, error)
        break
      }
    }

    // 统计信息
    allFiles.forEach(file => {
      totalSize += file.size
      if (FileService.isImageFile(file.mimeType)) {
        imageCount++
      }
    })

    fileStats.totalSize = totalSize
    fileStats.imageCount = imageCount
    fileStats.folderCount = 0 // 暂时没有文件夹功能

  } catch (error) {
    console.error('获取文件统计失败:', error)
  }
}

// 处理用户菜单
const handleUserMenu = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('设置功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 处理上传成功
const handleUploadSuccess = (file: FileUploadResponse) => {
  ElMessage.success(`文件 "${file.originalName}" 上传成功`)
  fetchFileStats() // 重新获取统计
}

// 处理上传错误
const handleUploadError = (error: any, file: File) => {
  console.error('文件上传失败:', error)
  ElMessage.error(`文件 "${file.name}" 上传失败`)
}

// 组件挂载
onMounted(async () => {
  // 检查认证状态
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // 获取文件统计
  await fetchFileStats()
})
</script>

<style scoped>
.files-container {
  padding: 2rem;
  min-height: 100vh;
  background: #f5f7fa;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.welcome-text {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background: #f8fafc;
}

.user-name {
  font-weight: 500;
  color: #374151;
}

.dropdown-icon {
  color: #9ca3af;
  transition: transform 0.3s;
}

.user-card {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  color: #3b82f6;
  margin-right: 1rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-content p {
  margin: 0.25rem 0 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.files-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.upload-section,
.list-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.upload-section h2,
.list-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem 0;
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 600;
}

.upload-section h2 .el-icon,
.list-section h2 .el-icon {
  color: #3b82f6;
}

@media (max-width: 1024px) {
  .files-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .files-container {
    padding: 1rem;
  }

  .files-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    text-align: center;
  }

  .user-card {
    padding: 1.5rem;
  }

  .stat-item {
    padding: 0.75rem;
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }

  .stat-content h3 {
    font-size: 1.25rem;
  }

  .upload-section,
  .list-section {
    padding: 1.5rem;
  }

  .upload-section h2,
  .list-section h2 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .files-container {
    padding: 0.5rem;
  }

  .files-header {
    padding: 1rem;
  }

  .user-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .stat-item {
    padding: 0.5rem;
  }

  .upload-section,
  .list-section {
    padding: 1rem;
  }
}
</style>