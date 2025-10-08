# 文件管理系统

一个基于Vue.js + Nest.js的企业级文件管理系统，支持多用户、角色权限控制、文件预览等功能。

## 📋 项目概述

本项目是一个现代化的企业文件管理系统，采用前后端分离架构，支持多用户协作和精细的权限控制。系统提供文件上传、下载、预览、搜索等核心功能，并具有完善的后台管理界面。

### 🎯 主要特性

- ✅ **多用户支持**：管理员、部门领导、普通员工三种角色
- ✅ **权限控制**：基于角色的细粒度权限管理
- ✅ **文件管理**：支持多种文件格式的上传、下载、预览
- ✅ **响应式设计**：完美适配PC端和移动端
- ✅ **实时搜索**：基础搜索和高级搜索功能
- ✅ **后台管理**：完整的用户、部门、系统配置管理
- ✅ **数据统计**：文件使用统计和可视化报表

### 🛠️ 技术栈

#### 前端技术
- **Vue.js 3** - 渐进式JavaScript框架
- **Vite** - 现代化前端构建工具
- **TypeScript** - 类型安全的JavaScript
- **Element Plus** - Vue 3组件库
- **TailwindCSS** - 实用优先的CSS框架
- **Pinia** - Vue状态管理库

#### 后端技术
- **Node.js** - JavaScript运行时
- **Nest.js** - 高效的Node.js框架
- **MongoDB** - NoSQL数据库
- **MinIO** - 对象存储服务
- **JWT** - 身份认证机制

## 📁 项目结构

```
file-upload-management-system/
├── docs/                    # 📚 项目文档
│   ├── requirements.md      # 需求分析文档
│   ├── technical-design.md  # 技术设计文档
│   ├── api/                 # API接口文档
│   ├── deployment/          # 部署相关文档
│   └── user-guide/          # 用户使用指南
│
├── frontend/                # 🎨 前端项目 (Vue.js)
│   ├── src/                 # 前端源代码
│   ├── package.json         # 前端依赖
│   └── vite.config.ts       # 前端构建配置
│
├── backend/                 # ⚙️ 后端项目 (Nest.js)
│   ├── src/                 # 后端源代码
│   ├── package.json         # 后端依赖
│   └── nest-cli.json        # 后端配置
│
├── docker-compose.yml       # 🐳 Docker容器编排
├── README.md               # 📖 项目说明
└── .gitignore             # Git忽略配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18.x LTS 或更高版本
- MongoDB 6.x 或更高版本
- MinIO 对象存储服务
- Docker 和 Docker Compose (推荐)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/gangyincoding/file-upload-management-system.git
   cd file-upload-management-system
   ```

2. **启动开发环境**
   ```bash
   # 使用Docker Compose启动所有服务
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **访问应用**
   - 前端应用：http://localhost:3000
   - 后端API：http://localhost:3001
   - API文档：http://localhost:3001/api-docs

### 本地开发

如果您希望本地开发而不是使用Docker：

1. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

## 📖 文档

- [需求分析文档](docs/requirements.md) - 详细的功能需求和用户故事
- [技术设计文档](docs/technical-design.md) - 系统架构和技术实现
- [API文档](docs/api/) - RESTful API接口说明
- [部署指南](docs/deployment/) - 开发和生产环境部署
- [用户指南](docs/user-guide/) - 系统使用说明

## 🗺️ 开发路线图

### 第一阶段 (1-2周) - 核心基础功能
- [x] 项目架构设计
- [x] 需求分析文档
- [ ] 用户认证系统
- [ ] 基础文件上传下载
- [ ] 响应式布局框架

### 第二阶段 (2-3周) - 完整功能实现
- [ ] 文件在线预览
- [ ] 文件夹管理
- [ ] 高级搜索功能
- [ ] 后台管理系统

### 第三阶段 (1-2周) - 优化与扩展
- [ ] 性能优化
- [ ] 安全增强
- [ ] 系统监控
- [ ] 数据统计报表

### 第四阶段 (后期规划)
- [ ] 手机小程序开发
- [ ] 企业级功能扩展

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- **您的名字** - *初始开发* - [gangyincoding](https://github.com/gangyincoding)

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系：

- 📧 邮箱：gangyincoding@163.com
- 🐛 问题反馈：[GitHub Issues](https://github.com/gangyincoding/file-upload-management-system/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/gangyincoding/file-upload-management-system/discussions)

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
