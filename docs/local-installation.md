# 本地软件安装指南

## 📦 需要安装的软件

### 1. Docker Desktop（推荐）

**用途：** 运行MongoDB、MinIO、Redis等开发服务

**安装步骤：**
1. 访问 [Docker Desktop官网](https://www.docker.com/products/docker-desktop/)
2. 下载 Windows 版本
3. 运行安装程序，按提示完成安装
4. 重启电脑
5. 启动 Docker Desktop 应用程序
6. 等待服务启动完成（系统托盘显示绿色图标）

**验证安装：**
```bash
docker --version
docker-compose --version
docker run hello-world
```

### 2. MongoDB（可选）

如果你不想使用Docker，可以本地安装MongoDB：

**安装方式一：使用 Chocolatey（推荐）**
```bash
# 首先安装 Chocolatey（如果未安装）
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 MongoDB
choco install mongodb

# 启动 MongoDB 服务
net start MongoDB
```

**安装方式二：手动安装**
1. 访问 [MongoDB官网](https://www.mongodb.com/try/download/community)
2. 下载 Windows 版本（MSI安装包）
3. 运行安装程序，选择 "Complete" 安装
4. 安装 MongoDB Compass（图形化管理工具）
5. 配置 MongoDB 作为 Windows 服务

**验证安装：**
```bash
mongosh --version
# 或者旧版本
mongo --version
```

### 3. Git（版本控制）

**检查是否已安装：**
```bash
git --version
```

**如果未安装，安装方法：**
1. 访问 [Git官网](https://git-scm.com/download/win)
2. 下载 Windows 版本
3. 运行安装程序，使用默认设置

## 🚀 快速启动验证

### 启动方式一：使用 Docker（推荐）

```bash
# 1. 启动 Docker Desktop
# 在开始菜单找到并启动 Docker Desktop

# 2. 验证 Docker 状态
docker run hello-world

# 3. 启动项目服务
docker-compose -f docker-compose.dev.yml up -d

# 4. 检查服务状态
docker-compose -f docker-compose.dev.yml ps
```

### 启动方式二：本地安装

如果你本地安装了MongoDB：

```bash
# 1. 启动 MongoDB 服务
net start MongoDB

# 2. 创建数据库用户
mongosh
use file_management
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: ["readWrite"]
})

# 3. 手动安装和启动 MinIO
# 参考 docs/database-setup.md 中的 MinIO 安装说明
```

## 🔍 故障排除

### Docker Desktop 问题

**问题：Docker Desktop 无法启动**
- 解决方案：
  1. 确保 Windows 10/11 专业版或企业版
  2. 启用 Hyper-V 和 WSL 2 功能
  3. 更新到最新的 Windows 版本
  4. 重新安装 Docker Desktop

**问题：Docker 命令权限错误**
- 解决方案：以管理员身份运行 PowerShell 或 CMD

### MongoDB 问题

**问题：MongoDB 服务启动失败**
```bash
# 检查服务状态
Get-Service MongoDB

# 重新启动服务
net stop MongoDB
net start MongoDB

# 查看错误日志
# 通常在 C:\Program Files\MongoDB\Server\X.X\log\mongod.log
```

**问题：连接 MongoDB 被拒绝**
```bash
# 检查端口占用
netstat -ano | findstr :27017

# 修改配置文件
# 通常在 C:\Program Files\MongoDB\Server\X.X\bin\mongod.cfg
```

### 网络问题

**问题：端口被占用**
```bash
# 查看端口占用
netstat -ano | findstr :3000  # 前端
netstat -ano | findstr :3001  # 后端
netstat -ano | findstr :27017  # MongoDB
netstat -ano | findstr :9000  # MinIO

# 结束占用进程
taskkill /PID <进程ID> /F
```

## 📋 环境检查清单

安装完成后，请确认以下环境正常：

- [ ] Docker Desktop 已启动且运行正常
- [ ] Node.js 和 npm 可正常使用
- [ ] 可以运行 `docker run hello-world`
- [ ] 项目可以正常启动（前后端服务）
- [ ] 数据库连接正常
- [ ] MinIO 控制台可以访问（http://localhost:9001）

## 🎯 推荐的开发工具

### 必装工具
- **VS Code** - 代码编辑器
- **Docker Desktop** - 容器化开发环境
- **Git** - 版本控制

### 可选工具
- **MongoDB Compass** - MongoDB 图形化管理工具
- **Postman** - API 测试工具
- **Chrome DevTools** - 前端调试工具

### VS Code 推荐插件
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-vscode-remote.remote-containers",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-jest"
  ]
}
```

## 📞 获取帮助

如果遇到安装问题：

1. **Docker 相关问题**：查看 Docker Desktop 日志
2. **MongoDB 问题**：查看 MongoDB 官方文档
3. **Node.js 问题**：查看 Node.js 官方文档
4. **项目问题**：查看项目的 GitHub Issues 或文档

---

**💡 提示**：推荐使用 Docker 方式，因为环境一致性更好，配置更简单！