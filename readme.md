# WSTools - WebSocket工具平台

一个通用的WebSocket工具平台，提供WebSocket连接管理、消息发送和数据订阅功能。

## 功能特性

- 🚀 **消息发送器** - 向目标WebSocket服务发送自定义消息
- 📡 **数据订阅器** - 订阅外部WebSocket数据源
- 🔧 **连接管理** - 可视化管理WebSocket连接配置
- 📊 **实时监控** - 连接状态和消息统计
- 🧪 **连接测试** - 测试WebSocket连接可用性

## 快速启动

### 使用启动脚本（推荐）

```shell
# 启动所有服务
./start.sh

# 停止所有服务
./stop.sh
```

### 手动启动

#### 后端服务
```shell
cd wstool-api
cargo run
```

#### 前端服务
```shell
cd wstool-ui
npm install
npm run dev
```

## 访问地址

- 前端界面: http://localhost:3000
- WebSocket工具: http://localhost:3000/websocket
- 后端API: http://localhost:8181

## Docker部署

```shell
# 构建后端镜像
cd wstool-api
docker build -t wstool-api:latest .

# 构建前端镜像
cd wstool-ui
docker build -t wstool-ui:latest .

# 运行后端
docker run -d \
  -p 8181:8181 \
  -v ./data:/app/data \
  -e DATABASE_URL=sqlite:///app/data/wstool.db?mode=rw \
  --name wstool-api \
  wstool-api:latest

# 运行前端
docker run -d \
  -p 3000:3000 \
  --name wstool-ui \
  wstool-ui:latest
```