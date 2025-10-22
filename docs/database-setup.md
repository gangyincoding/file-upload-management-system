# 数据库和存储服务设置指南

## 概述

文件管理系统需要以下服务支持：
- **MongoDB**: 文档数据库，存储用户信息和文件元数据
- **MinIO**: 对象存储服务，存储实际文件
- **Redis** (可选): 缓存服务

## 方式一：Docker Compose（推荐）

### 前置条件
1. 安装 Docker Desktop for Windows
2. 启动 Docker Desktop

### 启动服务
```bash
# 在项目根目录执行
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps
```

### 服务地址
- **MongoDB**: `mongodb://localhost:27017`
- **MinIO API**: `http://localhost:9000`
- **MinIO Console**: `http://localhost:9001`
- **Redis**: `localhost:6379`

### MinIO管理
- 访问控制台：http://localhost:9001
- 用户名：`minioadmin`
- 密码：`minioadmin123`

## 方式二：本地安装

### MongoDB 安装

1. **下载 MongoDB Community Server**
   - 访问 https://www.mongodb.com/try/download/community
   - 下载 Windows 版本并安装

2. **配置 MongoDB**
   ```bash
   # 连接到 MongoDB
   mongosh

   # 创建数据库和用户
   use file_management
   db.createUser({
     user: "app_user",
     pwd: "app_password",
     roles: ["readWrite"]
   })
   ```

3. **启动 MongoDB 服务**
   ```bash
   # Windows 服务管理器中启动 MongoDB 服务
   # 或使用命令行
   net start MongoDB
   ```

### MinIO 安装

1. **下载 MinIO Server**
   ```bash
   # 下载 MinIO 可执行文件
   curl https://dl.min.io/server/minio/release/windows-amd64/minio.exe -o minio.exe
   ```

2. **启动 MinIO**
   ```bash
   # 设置环境变量
   set MINIO_ROOT_USER=minioadmin
   set MINIO_ROOT_PASSWORD=minioadmin123

   # 启动 MinIO
   minio.exe server D:\minio-data --console-address ":9001"
   ```

3. **访问 MinIO**
   - API: http://localhost:9000
   - 控制台: http://localhost:9001

### Redis 安装（可选）

1. **下载 Redis for Windows**
   - 访问 https://github.com/microsoftarchive/redis/releases
   - 下载最新版本并安装

2. **启动 Redis**
   ```bash
   redis-server
   ```

## 环境配置

更新 `backend/.env` 文件：

```env
# MongoDB配置
MONGODB_URI=mongodb://app_user:app_password@localhost:27017/file_management

# MinIO配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=file-management

# Redis配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 验证安装

### 测试 MongoDB 连接
```bash
# 使用 MongoDB Shell 测试
mongosh "mongodb://app_user:app_password@localhost:27017/file_management"
```

### 测试 MinIO 连接
```bash
# 使用 curl 测试
curl http://localhost:9000/minio/health/live
```

### 测试 Redis 连接
```bash
# 使用 Redis CLI 测试
redis-cli ping
```

## 数据库初始化

MongoDB 启动后会自动执行 `docker/mongodb/init-mongo.js` 脚本，完成：
- 创建数据库和用户
- 设置索引
- 创建默认管理员账号

**默认管理员账号**：
- 手机号：`13888888888`
- 密码：`admin123`

## 故障排除

### Docker 相关问题
1. **Docker Desktop 未启动**
   - 启动 Docker Desktop 应用程序
   - 等待服务完全启动

2. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -ano | findstr :27017
   netstat -ano | findstr :9000

   # 停止占用端口的进程
   taskkill /PID <进程ID> /F
   ```

### MongoDB 相关问题
1. **连接失败**
   - 检查 MongoDB 服务是否启动
   - 验证用户名和密码
   - 检查防火墙设置

2. **认证失败**
   ```bash
   # 重新创建用户
   mongosh mongodb://localhost:27017
   use file_management
   db.dropUser("app_user")
   db.createUser({
     user: "app_user",
     pwd: "app_password",
     roles: ["readWrite"]
   })
   ```

### MinIO 相关问题
1. **MinIO 启动失败**
   - 检查端口 9000 和 9001 是否被占用
   - 确保数据目录有写入权限
   - 检查 MinIO 配置文件

2. **访问控制台失败**
   - 清除浏览器缓存
   - 检查用户名和密码
   - 尝试使用 http://127.0.0.1:9001

## 生产环境注意事项

1. **安全设置**
   - 修改默认密码
   - 使用强密码
   - 启用 HTTPS
   - 配置防火墙规则

2. **数据备份**
   - 定期备份 MongoDB
   - 配置 MinIO 复制策略
   - 监控存储空间

3. **性能优化**
   - 调整 MongoDB 缓存设置
   - 配置 MinIO 存储策略
   - 监控系统资源使用

## 开发工作流

1. **启动开发环境**
   ```bash
   # 1. 启动基础服务
   docker-compose -f docker-compose.dev.yml up -d

   # 2. 启动后端
   cd backend
   npm run start:dev

   # 3. 启动前端
   cd frontend
   npm run dev
   ```

2. **停止服务**
   ```bash
   # 停止 Docker 服务
   docker-compose -f docker-compose.dev.yml down

   # 停止应用服务（Ctrl+C）
   ```

3. **重置数据**
   ```bash
   # 删除所有数据和容器
   docker-compose -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.dev.yml up -d
   ```