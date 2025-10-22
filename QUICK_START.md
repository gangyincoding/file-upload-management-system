# 文件管理系统 - 快速启动指南

## 🚀 一键启动（推荐）

### 前置条件
- 安装 Docker Desktop for Windows
- 安装 Node.js 18+
- 安装 npm 或 yarn

### 启动步骤

1. **启动基础服务**
   ```bash
   # Windows 用户
   start-dev.bat

   # Linux/Mac 用户
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

2. **启动后端服务**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```

4. **访问应用**
   - 前端应用: http://localhost:3000
   - API文档: http://localhost:3001/api-docs
   - MinIO控制台: http://localhost:9001

## 🔧 手动启动

### 1. 启动数据库服务
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 3. 启动应用
```bash
# 启动后端 (终端1)
cd backend
npm run start:dev

# 启动前端 (终端2)
cd frontend
npm run dev
```

## 📋 测试账号

| 用户类型 | 手机号 | 密码 | 权限 |
|---------|--------|------|------|
| 管理员 | 13888888888 | admin123 | 全部权限 |

## 🧪 功能测试

### 方式一：使用前端界面
1. 访问 http://localhost:3000
2. 使用测试账号登录
3. 测试文件上传、下载、管理功能

### 方式二：使用API测试
```bash
cd backend
npm install axios  # 如果未安装
node scripts/test-api.js
```

### 方式三：使用API文档
1. 访问 http://localhost:3001/api-docs
2. 使用 Swagger UI 测试各个API接口

## 📊 服务地址

| 服务 | 地址 | 用途 |
|------|------|------|
| 前端应用 | http://localhost:3000 | 用户界面 |
| 后端API | http://localhost:3001 | API服务 |
| API文档 | http://localhost:3001/api-docs | 接口文档 |
| MongoDB | mongodb://localhost:27017 | 数据库 |
| MinIO API | http://localhost:9000 | 文件存储 |
| MinIO控制台 | http://localhost:9001 | 存储管理 |
| Redis | localhost:6379 | 缓存服务 |

## 🛠️ 开发工具

### 数据库管理
- **MongoDB**: 使用 MongoDB Compass 连接 `mongodb://app_user:app_password@localhost:27017/file_management`
- **MinIO**: 访问 http://localhost:9001 (minioadmin/minioadmin123)

### 日志查看
```bash
# 查看Docker服务日志
docker-compose -f docker-compose.dev.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.dev.yml logs -f mongodb
docker-compose -f docker-compose.dev.yml logs -f minio
docker-compose -f docker-compose.dev.yml logs -f redis
```

## 🔍 故障排除

### Docker相关问题
```bash
# 重启Docker服务
docker-compose -f docker-compose.dev.yml restart

# 重建服务
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# 清理所有数据（危险操作）
docker-compose -f docker-compose.dev.yml down -v
```

### 端口冲突
```bash
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :27017
netstat -ano | findstr :9000

# 结束占用进程
taskkill /PID <进程ID> /F
```

### 数据库连接问题
```bash
# 测试MongoDB连接
mongosh "mongodb://app_user:app_password@localhost:27017/file_management"

# 重置数据库用户
mongosh mongodb://localhost:27017
use file_management
db.dropUser("app_user")
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: ["readWrite"]
})
```

## 📁 项目结构

```
file-upload-management-system/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── files/          # 文件管理模块
│   │   ├── users/          # 用户模块
│   │   ├── minio/          # MinIO服务模块
│   │   └── config/         # 配置模块
│   ├── scripts/            # 测试脚本
│   └── .env               # 环境配置
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # Vue组件
│   │   ├── views/         # 页面组件
│   │   ├── services/      # API服务
│   │   └── stores/        # 状态管理
│   └── package.json
├── docker-compose.dev.yml  # Docker开发环境
├── docs/                  # 项目文档
└── start-dev.bat          # Windows启动脚本
```

## 🎯 下一步

1. **开发新功能**: 参考 `docs/technical-design.md`
2. **API文档**: 访问 `/api-docs` 查看完整API文档
3. **数据库设计**: 查看 `docs/database-schema.md`
4. **部署指南**: 参考 `docs/deployment.md`

## 📞 获取帮助

1. 查看 `docs/` 目录下的详细文档
2. 检查项目 Issues 页面
3. 参考控制台错误信息
4. 确认所有服务状态正常

---

**🎉 祝您使用愉快！**