#!/bin/bash

# WebSocket工具平台停止脚本

echo "🛑 停止 WebSocket 工具平台..."

# 读取进程ID并停止服务
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm logs/backend.pid
    else
        echo "后端服务已停止"
    fi
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm logs/frontend.pid
    else
        echo "前端服务已停止"
    fi
fi

# 清理可能残留的进程
pkill -f "cargo run"
pkill -f "npm run dev"
pkill -f "next dev"

echo "✅ 所有服务已停止"
