<template>
  <div class="file-list-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文件名..."
          prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button
            :type="viewMode === 'list' ? 'primary' : 'default'"
            @click="viewMode = 'list'"
          >
            <el-icon><List /></el-icon>
            列表
          </el-button>
          <el-button
            :type="viewMode === 'grid' ? 'primary' : 'default'"
            @click="viewMode = 'grid'"
          >
            <el-icon><Grid /></el-icon>
            网格
          </el-button>
        </el-button-group>
        <el-button @click="refreshFileList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 文件列表 - 列表视图 -->
    <div v-else-if="viewMode === 'list'" class="file-table">
      <el-table :data="files" stripe style="width: 100%">
        <el-table-column prop="originalName" label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon :size="20" class="file-icon">
                <component :is="getFileIcon(row.mimeType)" />
              </el-icon>
              <span class="file-name" :title="row.originalName">
                {{ row.originalName }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="mimeType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getFileTypeText(row.mimeType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags.slice(0, 3)"
              :key="tag"
              size="small"
              style="margin-right: 4px; margin-bottom: 4px;"
            >
              {{ tag }}
            </el-tag>
            <span v-if="row.tags.length > 3" class="more-tags">
              +{{ row.tags.length - 3 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button
                type="primary"
                link
                @click="handleDownload(row)"
              >
                下载
              </el-button>
              <el-button
                type="warning"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 文件列表 - 网格视图 -->
    <div v-else class="file-grid">
      <el-row :gutter="16">
        <el-col
          v-for="file in files"
          :key="file.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card class="file-card" shadow="hover">
            <div class="file-preview">
              <el-icon :size="48" class="preview-icon">
                <component :is="getFileIcon(file.mimeType)" />
              </el-icon>
            </div>
            <div class="file-info">
              <h4 class="file-name" :title="file.originalName">
                {{ file.originalName }}
              </h4>
              <p class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-type">{{ getFileTypeText(file.mimeType) }}</span>
              </p>
              <p class="file-date">{{ formatDate(file.createdAt) }}</p>
              <div class="file-tags">
                <el-tag
                  v-for="tag in file.tags.slice(0, 2)"
                  :key="tag"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="file-actions">
              <el-button-group size="small">
                <el-button
                  type="primary"
                  circle
                  @click="handleDownload(file)"
                >
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button
                  type="warning"
                  circle
                  @click="handleEdit(file)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  circle
                  @click="handleDelete(file)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && files.length === 0" class="empty-state">
      <el-empty description="暂无文件" />
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑文件信息"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="文件名">
          <el-input v-model="editForm.originalName" disabled />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入文件描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="editForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签"
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
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit" :loading="saving">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  List,
  Grid,
  Refresh,
  Search,
  Download,
  Edit,
  Delete,
  Picture,
  VideoPlay,
  Headphones,
  Document,
  Monitor,
  Folder
} from '@element-plus/icons-vue'
import { FileService, type FileInfo } from '@/services/file.service'

const emit = defineEmits<{
  fileSelected: [file: FileInfo]
}>()

// 响应式数据
const loading = ref(false)
const files = ref<FileInfo[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const viewMode = ref<'list' | 'grid'>('list')

// 编辑相关
const showEditDialog = ref(false)
const saving = ref(false)
const editFormRef = ref<FormInstance>()
const currentEditFile = ref<FileInfo | null>(null)

const editForm = reactive({
  description: '',
  tags: [] as string[]
})

const editRules: FormRules = {
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

// 获取文件列表
const fetchFiles = async () => {
  try {
    loading.value = true
    const response = await FileService.getUserFiles(currentPage.value, pageSize.value)
    files.value = response.files
    total.value = response.total
  } catch (error) {
    console.error('获取文件列表失败:', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新文件列表
const refreshFileList = () => {
  fetchFiles()
}

// 搜索文件
const handleSearch = () => {
  // TODO: 实现搜索功能
  ElMessage.info('搜索功能开发中...')
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchFiles()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchFiles()
}

// 获取文件图标
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Picture
  if (mimeType.startsWith('video/')) return VideoPlay
  if (mimeType.startsWith('audio/')) return Headphones
  if (mimeType.includes('pdf')) return Document
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return Monitor
  if (mimeType.includes('zip') || mimeType.includes('rar')) return Folder
  return Document
}

// 获取文件类型文本
const getFileTypeText = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '图片'
  if (mimeType.startsWith('video/')) return '视频'
  if (mimeType.startsWith('audio/')) return '音频'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return '文档'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '表格'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '演示文稿'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '压缩包'
  if (mimeType.includes('text')) return '文本'
  return '其他'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  return FileService.formatFileSize(bytes)
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 下载文件
const handleDownload = async (file: FileInfo) => {
  try {
    const response = await FileService.getFileUrl(file.id)

    // 创建临时链接并触发下载
    const link = document.createElement('a')
    link.href = response.url
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('开始下载文件')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 编辑文件
const handleEdit = (file: FileInfo) => {
  currentEditFile.value = file
  editForm.description = file.description
  editForm.tags = [...file.tags]
  showEditDialog.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value || !currentEditFile.value) return

  try {
    await editFormRef.value.validate()
    saving.value = true

    const updatedFile = await FileService.updateFile(currentEditFile.value.id, {
      description: editForm.description,
      tags: editForm.tags
    })

    // 更新本地文件列表
    const index = files.value.findIndex(f => f.id === currentEditFile.value!.id)
    if (index !== -1) {
      files.value[index] = updatedFile
    }

    showEditDialog.value = false
    ElMessage.success('文件信息更新成功')
  } catch (error) {
    console.error('更新文件失败:', error)
    ElMessage.error('更新文件失败')
  } finally {
    saving.value = false
  }
}

// 删除文件
const handleDelete = async (file: FileInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.originalName}" 吗？删除后无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await FileService.deleteFile(file.id)

    // 从本地列表中移除
    files.value = files.value.filter(f => f.id !== file.id)
    total.value--

    ElMessage.success('文件删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error('删除文件失败')
    }
  }
}

// 组件挂载时获取文件列表
onMounted(() => {
  fetchFiles()
})
</script>

<style scoped>
.file-list-container {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.loading-container {
  padding: 20px;
}

.file-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #909399;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-tags {
  font-size: 12px;
  color: #909399;
}

.file-grid {
  margin-bottom: 20px;
}

.file-card {
  height: 280px;
  transition: all 0.3s;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.file-preview {
  text-align: center;
  padding: 20px 0 10px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-icon {
  color: #c0c4cc;
}

.file-info {
  padding: 0 16px;
}

.file-info h4 {
  margin: 8px 0;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
}

.file-date {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 8px;
}

.file-tags {
  margin-bottom: 8px;
  min-height: 24px;
}

.file-actions {
  text-align: center;
  padding: 0 16px 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }

  .file-card {
    height: 240px;
  }
}
</style>