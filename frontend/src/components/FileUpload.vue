<template>
  <div class="file-upload-container">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :before-upload="beforeUpload"
      :on-success="onUploadSuccess"
      :on-error="onUploadError"
      :on-progress="onUploadProgress"
      :show-file-list="false"
      :auto-upload="false"
      multiple
      drag
    >
      <div class="upload-area">
        <el-icon class="upload-icon" :size="48">
          <UploadFilled />
        </el-icon>
        <div class="upload-text">
          <p>将文件拖拽到此处，或<em>点击选择文件</em></p>
          <p class="upload-hint">支持多种文件格式，单个文件不超过 20MB</p>
        </div>
      </div>
    </el-upload>

    <!-- 上传进度 -->
    <div v-if="uploadingFiles.length > 0" class="upload-progress">
      <h3>上传进度</h3>
      <div v-for="file in uploadingFiles" :key="file.id" class="progress-item">
        <div class="file-info">
          <el-icon :size="16">
            <Document />
          </el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
        </div>
        <div class="progress-bar">
          <el-progress
            :percentage="file.progress"
            :status="file.status"
            :stroke-width="6"
          />
        </div>
        <div class="file-status">
          <span :class="['status', file.status]">
            {{ getStatusText(file.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="showMetadataDialog"
      title="文件信息"
      width="500px"
      :before-close="handleCancelUpload"
    >
      <el-form
        ref="metadataFormRef"
        :model="metadataForm"
        :rules="metadataRules"
        label-width="80px"
      >
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="metadataForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入文件描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="metadataForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签（可选）"
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelUpload">取消</el-button>
          <el-button type="primary" @click="handleConfirmUpload" :loading="uploading">
            上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile, type UploadProps } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { FileService } from '@/services/file.service'
import type { FileUploadResponse } from '@/services/file.service'

interface UploadingFile {
  id: string
  file: File
  name: string
  size: number
  progress: number
  status: 'uploading' | 'success' | 'error' | 'paused'
  response?: FileUploadResponse
  error?: string
}

const emit = defineEmits<{
  success: [file: FileUploadResponse]
  error: [error: any, file: File]
}>()

const uploadRef = ref()
const uploadingFiles = ref<UploadingFile[]>([])
const showMetadataDialog = ref(false)
const uploading = ref(false)
const metadataFormRef = ref<FormInstance>()

// 待上传的文件
const pendingFiles = ref<File[]>([])

const metadataForm = reactive({
  description: '',
  tags: [] as string[]
})

const metadataRules: FormRules = {
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  tags: [
    { type: 'array', max: 10, message: '标签不能超过10个', trigger: 'change' }
  ]
}

// 常用标签
const commonTags = [
  '工作', '个人', '重要', '临时', '文档', '图片', '视频', '音频', '其他'
]

// 上传URL（不使用，我们手动处理）
const uploadUrl = computed(() => '#')

// 上传头
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  return FileService.formatFileSize(bytes)
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap = {
    uploading: '上传中...',
    success: '上传成功',
    error: '上传失败',
    paused: '已暂停'
  }
  return statusMap[status] || '未知状态'
}

// 上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (file: File) => {
  // 文件大小检查
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    ElMessage.error('文件大小不能超过 20MB!')
    return false
  }

  // 添加到待上传列表
  pendingFiles.value.push(file)

  // 显示元数据对话框
  showMetadataDialog.value = true

  // 重置表单
  metadataForm.description = ''
  metadataForm.tags = []

  return false // 阻止自动上传
}

// 确认上传
const handleConfirmUpload = async () => {
  try {
    // 验证表单
    if (metadataFormRef.value) {
      await metadataFormRef.value.validate()
    }

    uploading.value = true
    showMetadataDialog.value = false

    // 逐个上传文件
    for (const file of pendingFiles.value) {
      await uploadSingleFile(file, metadataForm.description, metadataForm.tags)
    }

    // 清空待上传列表
    pendingFiles.value = []

  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

// 取消上传
const handleCancelUpload = () => {
  showMetadataDialog.value = false
  pendingFiles.value = []
}

// 上传单个文件
const uploadSingleFile = async (file: File, description: string, tags: string[]) => {
  const uploadingFile: UploadingFile = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    file,
    name: file.name,
    size: file.size,
    progress: 0,
    status: 'uploading'
  }

  uploadingFiles.value.push(uploadingFile)

  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)

    if (description) {
      formData.append('description', description)
    }

    if (tags.length > 0) {
      formData.append('tags', tags.join(','))
    }

    // 创建XMLHttpRequest来跟踪进度
    const xhr = new XMLHttpRequest()

    // 上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        uploadingFile.progress = progress
      }
    })

    // 上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        const response = JSON.parse(xhr.responseText)
        uploadingFile.status = 'success'
        uploadingFile.response = response.data
        emit('success', response.data)
        ElMessage.success(`${file.name} 上传成功`)
      } else {
        uploadingFile.status = 'error'
        uploadingFile.error = `HTTP ${xhr.status}: ${xhr.statusText}`
        const error = new Error(`HTTP ${xhr.status}: ${xhr.statusText}`)
        emit('error', error, file)
        ElMessage.error(`${file.name} 上传失败`)
      }
    })

    // 上传错误
    xhr.addEventListener('error', () => {
      uploadingFile.status = 'error'
      uploadingFile.error = '网络错误'
      const error = new Error('网络错误')
      emit('error', error, file)
      ElMessage.error(`${file.name} 上传失败`)
    })

    // 设置请求头
    const token = localStorage.getItem('accessToken')
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    // 发送请求
    xhr.open('POST', 'http://localhost:3001/api/files/upload')
    xhr.send(formData)

  } catch (error) {
    uploadingFile.status = 'error'
    uploadingFile.error = error instanceof Error ? error.message : '未知错误'
    emit('error', error, file)
    ElMessage.error(`${file.name} 上传失败`)
  }
}

// 上传成功回调
const onUploadSuccess = (response: any, file: UploadFile) => {
  // 由于我们使用手动上传，这里不会被调用
  console.log('Upload success:', response, file)
}

// 上传错误回调
const onUploadError = (error: any, file: UploadFile) => {
  // 由于我们使用手动上传，这里不会被调用
  console.error('Upload error:', error, file)
}

// 上传进度回调
const onUploadProgress = (event: any, file: UploadFile) => {
  // 由于我们使用手动上传，这里不会被调用
  console.log('Upload progress:', event, file)
}

// 清理已完成的文件
const clearCompletedFiles = () => {
  uploadingFiles.value = uploadingFiles.value.filter(
    file => file.status === 'uploading' || file.status === 'paused'
  )
}

// 暴露方法给父组件
defineExpose({
  clearCompletedFiles
})
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

.upload-area {
  padding: 40px;
  text-align: center;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 8px 0;
  color: #606266;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-progress {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.upload-progress h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
}

.progress-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #303133;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.progress-bar {
  min-width: 150px;
  flex: 2;
}

.file-status {
  min-width: 80px;
  text-align: right;
}

.status {
  font-size: 12px;
  font-weight: 500;
}

.status.uploading {
  color: #409eff;
}

.status.success {
  color: #67c23a;
}

.status.error {
  color: #f56c6c;
}

.status.paused {
  color: #e6a23c;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .progress-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .file-info,
  .progress-bar,
  .file-status {
    width: 100%;
    min-width: unset;
  }
}
</style>