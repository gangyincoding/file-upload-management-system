# 文件管理系统 - 前端

基于 Vue.js 3 + TypeScript + Element Plus 的现代化文件管理前端应用。

## 技术栈

- **Vue.js 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 现代化前端构建工具
- **Element Plus** - Vue 3组件库
- **TailwindCSS** - 实用优先的CSS框架
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP客户端

## 开发环境

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 代码检查和格式化

```bash
npm run lint      # 代码检查
npm run format    # 代码格式化
```

## 项目结构

```
src/
├── assets/           # 静态资源
│   └── css/          # 样式文件
├── components/       # Vue组件
├── router/           # 路由配置
├── services/         # API服务
├── stores/           # Pinia状态管理
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── auth/         # 认证相关页面
│   ├── files/        # 文件管理页面
│   └── user/         # 用户相关页面
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 功能特性

- ✅ 用户认证（登录/注册）
- ✅ 响应式设计（PC/移动端适配）
- ✅ 路由权限控制
- ✅ TypeScript类型支持
- ✅ Element Plus UI组件
- ✅ TailwindCSS样式框架

## 开发说明

1. 使用 Composition API 编写组件
2. 遵循 TypeScript 严格模式
3. 使用 Element Plus 作为UI组件库
4. 响应式设计优先，确保移动端体验
5. 代码提交前先运行 lint 检查