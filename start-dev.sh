#!/bin/bash

# 文件管理系统开发环境启动脚本

echo "🚀 启动文件管理系统开发环境..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 启动基础服务（MongoDB、MinIO、Redis）
echo "📦 启动基础服务..."
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查MongoDB连接
echo "🔍 检查MongoDB连接..."
until mongosh mongodb://app_user:app_password@localhost:27017/file_management --eval "db.runCommand('ping')" > /dev/null 2>&1; do
    echo "等待MongoDB启动..."
    sleep 2
done
echo "✅ MongoDB连接成功"

# 检查MinIO连接
echo "🔍 检查MinIO连接..."
until curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; do
    echo "等待MinIO启动..."
    sleep 2
done
echo "✅ MinIO连接成功"

# 检查Redis连接
echo "🔍 检查Redis连接..."
until redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; do
    echo "等待Redis启动..."
    sleep 2
done
echo "✅ Redis连接成功"

echo ""
echo "🎉 所有服务启动成功！"
echo ""
echo "📋 服务信息："
echo "   - MongoDB: mongodb://localhost:27017"
echo "   - MinIO API: http://localhost:9000"
echo "   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "   - Redis: localhost:6379"
echo ""
echo "🔧 下一步："
echo "   1. 启动后端服务: cd backend && npm run start:dev"
echo "   2. 启动前端服务: cd frontend && npm run dev"
echo "   3. 访问应用: http://localhost:3000"
echo "   4. API文档: http://localhost:3001/api-docs"
echo ""
echo "💾 测试账号："
echo "   - 管理员: 13888888888 / admin123"
echo ""