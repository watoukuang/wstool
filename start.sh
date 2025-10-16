#!/bin/bash

# WebSocket工具平台启动脚本

echo "🚀 启动 WebSocket 工具平台..."

# 检查是否安装了必要的依赖
command -v cargo >/dev/null 2>&1 || { echo "❌ 需要安装 Rust 和 Cargo"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ 需要安装 Node.js"; exit 1; }

# 创建日志目录
mkdir -p logs

echo "📦 安装前端依赖..."
cd wstool-ui
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🔧 构建后端..."
cd ../wstool-api
cargo build --release

echo "🗄️ 初始化数据库..."
# 确保数据库文件存在
touch watoukuang.db

echo "🎯 启动后端服务..."
# 后台启动后端服务
RUST_LOG=info cargo run > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

# 等待后端启动
sleep 3

echo "🌐 启动前端服务..."
cd ../wstool-ui
# 后台启动前端服务
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务 PID: $FRONTEND_PID"

# 保存进程ID
echo $BACKEND_PID > ../logs/backend.pid
echo $FRONTEND_PID > ../logs/frontend.pid

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📍 访问地址:"
echo "   前端界面: http://localhost:3000"
echo "   WebSocket工具: http://localhost:3000/websocket"
echo "   后端API: http://localhost:8181"
echo ""
echo "📋 管理命令:"
echo "   查看日志: tail -f logs/backend.log 或 tail -f logs/frontend.log"
echo "   停止服务: ./stop.sh"
echo ""
echo "🎉 开始使用 WebSocket 工具平台吧！"
