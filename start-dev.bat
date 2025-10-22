@echo off
echo 🚀 启动文件管理系统开发环境...

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装，请先安装Docker
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose未安装，请先安装Docker Compose
    pause
    exit /b 1
)

REM 启动基础服务（MongoDB、MinIO、Redis）
echo 📦 启动基础服务...
docker-compose -f docker-compose.dev.yml up -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 基础服务启动完成！
echo.
echo 📋 服务信息：
echo    - MongoDB: mongodb://localhost:27017
echo    - MinIO API: http://localhost:9000
echo    - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
echo    - Redis: localhost:6379
echo.
echo 🔧 下一步：
echo    1. 启动后端服务: cd backend && npm run start:dev
echo    2. 启动前端服务: cd frontend && npm run dev
echo    3. 访问应用: http://localhost:3002 (或可用端口)
echo    4. API文档: http://localhost:3001/api-docs
echo.
echo 💾 测试账号：
echo    - 管理员: 13888888888 / admin123
echo.
pause