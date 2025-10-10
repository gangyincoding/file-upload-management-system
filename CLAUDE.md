# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于Vue.js（前端）和Nest.js（后端）构建的Monorepo企业文件管理系统，支持多用户协作和基于角色的权限控制。系统目前处于规划阶段，拥有完善的文档但尚未开始代码实现。

## 架构设计

### Monorepo结构
- **前端**: Vue.js 3 + Vite + TypeScript + Element Plus + TailwindCSS
- **后端**: Nest.js + MongoDB + MinIO + JWT
- **部署**: Docker Compose开发和生产环境配置

### 核心组件
- **认证系统**: 基于JWT的认证和基于角色的访问控制（管理员、部门领导、普通员工）
- **文件管理**: MinIO对象存储，元数据存储在MongoDB
- **权限系统**: 基于部门的文件访问控制
- **响应式设计**: 移动优先设计，同时支持PC和移动端

## 开发命令

### 环境搭建
```bash
# 使用Docker启动开发环境（当配置文件存在时）
docker-compose -f docker-compose.dev.yml up -d

# 本地开发（项目初始化后）
cd frontend && npm install && npm run dev
cd backend && npm install && npm run start:dev
```

### 项目初始化命令
```bash
# 前端项目初始化（第一阶段）
cd frontend
npm create vue@latest . -- --typescript --router --pinia --eslint --prettier
npm install element-plus @element-plus/icons-vue
npm install tailwindcss @tailwindcss/typography postcss autoprefixer
npm install axios uppy pdf.js sheetjs mammoth
npm install echarts dayjs
npm install -D @types/node

# 后端项目初始化（第一阶段）
cd backend
npm i @nestjs/core @nestjs/common @nestjs/platform-express
npm i @nestjs/mongoose @nestjs/config @nestjs/jwt @nestjs/passport
npm i mongoose bcrypt passport passport-jwt
npm i @nestjs/swagger class-validator class-transformer
npm i minio redis winston
npm i @casl/ability @casl/nest
npm i -D @nestjs/cli @nestjs/testing @types/node typescript
```

### 前端开发命令
```bash
cd frontend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
npm run format       # 代码格式化
npm run test         # 运行测试
```

### 后端开发命令
```bash
cd backend
npm run start:dev    # 启动开发服务器
npm run start:debug  # 启动调试模式
npm run build        # 构建生产版本
npm run start:prod   # 启动生产服务器
npm run lint         # 代码检查
npm run test         # 运行测试
npm run test:e2e     # 运行端到端测试
npm run test:watch   # 监视模式运行测试
```

### 数据库和存储命令
```bash
# MongoDB连接和操作
mongosh mongodb://localhost:27017/file_management

# MinIO操作（需要先启动MinIO服务）
# 访问控制台：http://localhost:9001
# 默认账号：minioadmin/minioadmin
```

### 开发工作流
```bash
# 创建新功能分支
git checkout -b feature/功能名称

# 安装依赖和启动服务
npm run setup        # 如果配置了setup脚本
docker-compose -f docker-compose.dev.yml up -d

# 开发完成后提交
git add .
git commit -m "feat: 添加功能描述"
git push origin feature/功能名称
```

## 项目状态

**当前阶段**: 规划/文档阶段
- ✅ 需求分析完成
- ✅ 技术设计完成
- ⏳ 前端项目初始化
- ⏳ 后端项目初始化
- ⏳ Docker环境搭建

## 重要注意事项

- 遵循`docs/technical-design.md`中的详细技术规范
- 按照`docs/requirements.md`中的权限矩阵实现基于角色的权限
- 确保响应式设计在PC和移动设备上都能正常工作
- 使用MongoDB存储元数据，MinIO存储文件
- 所有文件操作都应记录日志用于审计

## 核心架构说明

### Monorepo结构
- **前端目录**: `frontend/` - Vue.js 3 + Vite + TypeScript + Element Plus
- **后端目录**: `backend/` - Nest.js + MongoDB + MinIO + JWT
- **文档目录**: `docs/` - 需求文档、技术设计、API文档
- **配置文件**: Docker Compose配置（待创建）

### 技术栈详情
**前端核心依赖**:
- Vue 3 + Composition API
- Element Plus UI框架
- TailwindCSS响应式设计
- Pinia状态管理
- Vue Router路由
- Axios HTTP客户端

**后端核心依赖**:
- Nest.js框架
- MongoDB + Mongoose ODM
- MinIO对象存储
- JWT认证 + bcrypt加密
- CASL权限控制
- Swagger API文档

### 开发端口分配
- 前端开发服务器：`http://localhost:3000`
- 后端API服务器：`http://localhost:3001`
- API文档：`http://localhost:3001/api-docs`
- MinIO控制台：`http://localhost:9001`
- MongoDB：`mongodb://localhost:27017`

## 开发阶段

### 第一阶段详细任务清单 (1-2周)

#### 前端开发具体任务
**第1-3天：项目基础搭建**
- [ ] 创建Vue3项目并配置基础依赖
- [ ] 配置Vite构建工具和TypeScript
- [ ] 集成Element Plus UI框架
- [ ] 配置TailwindCSS响应式框架
- [ ] 设置项目目录结构（src/components, views, services等）

**第4-7天：认证系统开发**
- [ ] 创建登录页面（手机号+密码）
- [ ] 创建注册页面
- [ ] 实现用户信息管理页面
- [ ] 配置Axios拦截器处理JWT认证
- [ ] 创建Pinia状态管理（用户认证状态）

**第8-12天：文件管理基础功能**
- [ ] 创建主布局组件（Header, Sidebar, Main）
- [ ] 实现响应式导航（移动端汉堡菜单）
- [ ] 集成uppy.js文件上传组件
- [ ] 创建文件列表展示组件
- [ ] 实现基础文件操作按钮（下载、删除）

#### 后端开发具体任务
**第1-3天：项目基础搭建**
- [ ] 创建Nest.js项目并配置基础模块
- [ ] 连接MongoDB数据库
- [ ] 配置MinIO对象存储服务
- [ ] 设置JWT认证中间件
- [ ] 配置环境变量和配置文件

**第4-7天：用户认证模块**
- [ ] 创建User Schema（MongoDB模型）
- [ ] 实现用户注册API（POST /api/auth/register）
- [ ] 实现用户登录API（POST /api/auth/login）
- [ ] 实现JWT认证中间件
- [ ] 实现密码加密（bcrypt）

**第8-12天：文件管理模块**
- [ ] 创建File Schema（MongoDB模型）
- [ ] 实现文件上传API（POST /api/files/upload）
- [ ] 实现文件下载API（GET /api/files/:id/download）
- [ ] 实现文件列表API（GET /api/files）
- [ ] 实现文件删除API（DELETE /api/files/:id）

**第13-14天：权限控制**
- [ ] 实现基础权限验证中间件
- [ ] 配置CORS跨域设置
- [ ] 添加操作日志记录
- [ ] 配置Swagger API文档

#### 第一阶段验收标准
**功能性验收**
- [ ] 用户能够使用手机号+密码完成注册流程
- [ ] 用户能够正常登录系统并获取JWT令牌
- [ ] 用户能够查看和编辑个人信息
- [ ] 用户能够上传任意类型文件（≤20MB）
- [ ] 上传的文件能够正常下载和删除
- [ ] 文件列表能够正确显示（名称、大小、上传时间）
- [ ] 不同角色用户的权限控制正常工作

**技术性验收**
- [ ] 前端项目能够在本地环境正常启动（npm run dev）
- [ ] 后端API服务器正常运行（npm run start:dev）
- [ ] MongoDB数据库连接正常，数据正确存储
- [ ] MinIO对象存储服务正常，文件正确上传和下载
- [ ] JWT认证机制正常，未认证用户无法访问受保护接口
- [ ] API文档自动生成并可通过Swagger访问

**响应式设计验收**
- [ ] 在PC端（≥1024px）显示效果良好
- [ ] 在平板端（768px-1023px）布局自适应
- [ ] 在手机端（≤767px）触控操作友好
- [ ] 导航菜单在移动端能正确折叠为汉堡菜单
- [ ] 文件上传组件在不同设备上都能正常使用

#### 开发顺序建议
1. **并行开发**：前端和后端可以同时进行基础搭建
2. **接口约定**：先定义API接口格式，前后端按约定开发
3. **集成测试**：每个模块完成后立即进行前后端联调
4. **响应式优先**：从第一页面开始就要考虑响应式设计

### 后续开发阶段
2. **第二阶段** (2-3周): 完整功能，包括文件预览和管理系统
3. **第三阶段** (1-2周): 性能优化和安全增强
4. **第四阶段**: 移动应用开发