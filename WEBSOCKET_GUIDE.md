# WebSocket 工具平台使用指南

## 概述

这是一个通用的WebSocket工具平台，提供两个核心功能：
1. **消息发送器** - 向目标WebSocket服务发送消息
2. **数据订阅器** - 订阅其他平台的WebSocket数据

## 技术架构

- **后端**: Rust + Axum + SQLite
- **前端**: Next.js + TypeScript + TailwindCSS

## 功能特性

### 🚀 核心功能

#### 功能一：WebSocket消息发送
- 配置目标WebSocket服务器
- 支持自定义消息模板
- 支持认证Token和自定义请求头
- 实时发送消息并查看状态

#### 功能二：WebSocket数据订阅
- 订阅外部WebSocket数据源
- 自动重连机制
- 实时消息接收和显示
- 连接状态监控

### 🛠 管理功能

- **配置管理**: 创建、编辑、删除WebSocket配置
- **连接测试**: 测试WebSocket连接可用性
- **状态监控**: 实时查看连接状态和消息统计
- **消息历史**: 查看发送和接收的消息记录

## 快速开始

### 1. 启动后端服务

```bash
cd wstool-api
cargo run
```

后端服务将在 `http://localhost:8181` 启动

### 2. 启动前端服务

```bash
cd wstool-ui
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

### 3. 访问WebSocket工具

在浏览器中访问 `http://localhost:3000/websocket`

## 使用说明

### 创建WebSocket配置

1. 点击"新建配置"按钮
2. 填写配置信息：
   - **配置名称**: 给配置起一个易识别的名字
   - **描述**: 可选的配置说明
   - **WebSocket URL**: 目标WebSocket服务地址 (ws:// 或 wss://)
   - **配置类型**: 选择"消息发送器"或"数据订阅器"
   - **请求头**: JSON格式的自定义请求头
   - **认证Token**: 可选的认证令牌
   - **消息模板**: (仅发送器) JSON格式的消息模板
   - **自动重连**: 是否启用自动重连

### 发送消息 (消息发送器)

1. 在配置卡片上点击"发送消息"
2. 输入要发送的消息内容
3. 可选择使用消息模板或直接发送JSON
4. 点击"发送消息"

### 订阅数据 (数据订阅器)

1. 在配置卡片上点击"开始订阅"
2. 系统会自动建立WebSocket连接
3. 实时接收并显示来自服务器的消息
4. 点击"停止订阅"可断开连接

### 测试连接

1. 点击"测试连接"按钮
2. 可选择发送测试消息
3. 查看连接结果和响应时间

## API 接口

### WebSocket配置管理

- `GET /websocket/configs` - 获取配置列表
- `POST /websocket/configs` - 创建新配置
- `GET /websocket/configs/{id}` - 获取单个配置
- `PUT /websocket/configs/{id}` - 更新配置
- `DELETE /websocket/configs/{id}` - 删除配置

### WebSocket操作

- `POST /websocket/test` - 测试连接
- `POST /websocket/send` - 发送消息
- `POST /websocket/subscribe` - 开始订阅
- `POST /websocket/unsubscribe/{id}` - 停止订阅
- `GET /websocket/status` - 获取所有连接状态
- `GET /websocket/messages/{id}` - 获取消息历史

## 配置示例

### 消息发送器配置

```json
{
  "name": "交易所API",
  "description": "向交易所发送交易指令",
  "ws_url": "wss://api.exchange.com/ws",
  "config_type": "sender",
  "headers": "{\"Authorization\": \"Bearer your-token\"}",
  "message_template": "{\"type\": \"order\", \"data\": \"{{content}}\"}"
}
```

### 数据订阅器配置

```json
{
  "name": "价格数据订阅",
  "description": "订阅实时价格数据",
  "ws_url": "wss://stream.exchange.com/ws/btcusdt",
  "config_type": "subscriber",
  "auto_reconnect": true
}
```

## 故障排除

### 连接失败
- 检查WebSocket URL是否正确
- 确认目标服务器是否可访问
- 验证认证信息是否有效

### 消息发送失败
- 检查消息格式是否正确
- 确认WebSocket连接是否建立
- 查看错误日志获取详细信息

### 订阅中断
- 检查网络连接
- 确认自动重连是否启用
- 查看连接状态和错误信息

## 开发说明

### 后端开发

主要文件结构：
- `src/models/websocket.rs` - 数据模型定义
- `src/service/websocket.rs` - WebSocket配置CRUD
- `src/service/websocket_manager.rs` - WebSocket连接管理
- `src/service/websocket_actions.rs` - WebSocket操作API

### 前端开发

主要文件结构：
- `pages/websocket.tsx` - 主页面
- `components/WebSocketConfigCard.tsx` - 配置卡片
- `components/WebSocketConfigModal.tsx` - 配置编辑模态框
- `components/WebSocketMessageModal.tsx` - 消息发送模态框
- `components/WebSocketTestModal.tsx` - 连接测试模态框

## 扩展功能

可以考虑添加的功能：
- 消息过滤和转换
- 批量消息发送
- 消息模板库
- 连接池管理
- 监控和告警
- 数据导出功能

## 许可证

MIT License
