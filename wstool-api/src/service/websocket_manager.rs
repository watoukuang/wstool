use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use tokio_tungstenite::tungstenite::protocol::Message;
use futures::{SinkExt, StreamExt};
use serde_json::Value;
use uuid::Uuid;

use crate::models::{WebSocketConfig, WebSocketMessage, SendMessageRequest, SubscribeRequest};

pub type WebSocketConnection = WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>;

#[derive(Clone)]
pub struct ConnectionInfo {
    pub config: WebSocketConfig,
    pub is_connected: bool,
    pub connection_time: Option<i64>,
    pub last_message_time: Option<i64>,
    pub message_count: i64,
    pub error_count: i64,
    pub last_error: Option<String>,
}

#[derive(Clone)]
pub struct WebSocketManager {
    connections: Arc<RwLock<HashMap<String, Arc<Mutex<ConnectionInfo>>>>>,
    message_handlers: Arc<RwLock<HashMap<String, tokio::sync::mpsc::UnboundedSender<Message>>>>,
}

impl WebSocketManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
            message_handlers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    // 建立WebSocket连接
    pub async fn connect(&self, config: WebSocketConfig) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let config_id = config.id.clone();
        
        // 解析URL和headers
        let url = &config.ws_url;
        let mut request = url.parse::<http::Uri>()?;
        
        // 建立连接
        let (ws_stream, _) = connect_async(url).await?;
        
        // 创建连接信息
        let connection_info = Arc::new(Mutex::new(ConnectionInfo {
            config: config.clone(),
            is_connected: true,
            connection_time: Some(chrono::Utc::now().timestamp()),
            last_message_time: None,
            message_count: 0,
            error_count: 0,
            last_error: None,
        }));

        // 存储连接信息
        {
            let mut connections = self.connections.write().await;
            connections.insert(config_id.clone(), connection_info.clone());
        }

        // 创建消息通道
        let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<Message>();
        {
            let mut handlers = self.message_handlers.write().await;
            handlers.insert(config_id.clone(), tx);
        }

        // 分离读写流
        let (mut ws_sender, mut ws_receiver) = ws_stream.split();
        
        let manager = self.clone();
        let config_id_clone = config_id.clone();
        let connection_info_clone = connection_info.clone();

        // 启动消息发送任务
        let send_task = tokio::spawn(async move {
            while let Some(message) = rx.recv().await {
                if let Err(e) = ws_sender.send(message).await {
                    tracing::error!("Failed to send WebSocket message: {}", e);
                    let mut info = connection_info_clone.lock().await;
                    info.error_count += 1;
                    info.last_error = Some(e.to_string());
                    break;
                }
            }
        });

        // 启动消息接收任务
        let receive_task = tokio::spawn(async move {
            while let Some(message) = ws_receiver.next().await {
                match message {
                    Ok(msg) => {
                        let mut info = connection_info.lock().await;
                        info.message_count += 1;
                        info.last_message_time = Some(chrono::Utc::now().timestamp());
                        
                        // 处理接收到的消息
                        if let Message::Text(text) = msg {
                            tracing::info!("Received message from {}: {}", config_id, text);
                            
                            // 这里可以添加消息过滤和处理逻辑
                            manager.handle_received_message(&config_id, &text).await;
                        }
                    }
                    Err(e) => {
                        tracing::error!("WebSocket receive error for {}: {}", config_id, e);
                        let mut info = connection_info.lock().await;
                        info.error_count += 1;
                        info.last_error = Some(e.to_string());
                        info.is_connected = false;
                        break;
                    }
                }
            }
        });

        // 等待任务完成或连接断开
        tokio::select! {
            _ = send_task => {},
            _ = receive_task => {},
        }

        // 清理连接
        self.disconnect(&config_id).await;
        
        Ok(())
    }

    // 断开WebSocket连接
    pub async fn disconnect(&self, config_id: &str) {
        {
            let mut connections = self.connections.write().await;
            if let Some(connection_info) = connections.get(config_id) {
                let mut info = connection_info.lock().await;
                info.is_connected = false;
            }
            connections.remove(config_id);
        }

        {
            let mut handlers = self.message_handlers.write().await;
            handlers.remove(config_id);
        }
    }

    // 发送消息（功能一）
    pub async fn send_message(
        &self, 
        request: SendMessageRequest
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let handlers = self.message_handlers.read().await;
        
        if let Some(sender) = handlers.get(&request.config_id) {
            let message = Message::Text(request.message);
            sender.send(message)?;
            
            // 更新连接信息
            let connections = self.connections.read().await;
            if let Some(connection_info) = connections.get(&request.config_id) {
                let mut info = connection_info.lock().await;
                info.message_count += 1;
                info.last_message_time = Some(chrono::Utc::now().timestamp());
            }
            
            Ok(())
        } else {
            Err("WebSocket connection not found".into())
        }
    }

    // 订阅消息（功能二）
    pub async fn subscribe(
        &self,
        request: SubscribeRequest
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // 检查连接是否存在
        let connections = self.connections.read().await;
        if connections.contains_key(&request.config_id) {
            // 订阅逻辑已经在connect方法中的接收任务中处理
            tracing::info!("Subscribed to WebSocket config: {}", request.config_id);
            Ok(())
        } else {
            Err("WebSocket connection not found".into())
        }
    }

    // 获取连接状态
    pub async fn get_connection_status(&self, config_id: &str) -> Option<ConnectionInfo> {
        let connections = self.connections.read().await;
        if let Some(connection_info) = connections.get(config_id) {
            let info = connection_info.lock().await;
            Some(info.clone())
        } else {
            None
        }
    }

    // 获取所有连接状态
    pub async fn get_all_connection_status(&self) -> HashMap<String, ConnectionInfo> {
        let mut result = HashMap::new();
        let connections = self.connections.read().await;
        
        for (config_id, connection_info) in connections.iter() {
            let info = connection_info.lock().await;
            result.insert(config_id.clone(), info.clone());
        }
        
        result
    }

    // 处理接收到的消息
    async fn handle_received_message(&self, config_id: &str, message: &str) {
        // 这里可以添加消息处理逻辑，比如：
        // 1. 消息过滤
        // 2. 消息转发
        // 3. 消息存储到数据库
        // 4. 触发回调函数
        
        tracing::debug!("Processing received message from {}: {}", config_id, message);
        
        // 示例：简单的消息日志记录
        if let Ok(json_value) = serde_json::from_str::<Value>(message) {
            tracing::info!("Parsed JSON message: {:?}", json_value);
        }
    }

    // 重新连接
    pub async fn reconnect(&self, config: WebSocketConfig) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let config_id = config.id.clone();
        
        // 先断开现有连接
        self.disconnect(&config_id).await;
        
        // 等待一段时间后重新连接
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        
        // 重新建立连接
        self.connect(config).await
    }

    // 测试连接
    pub async fn test_connection(
        &self,
        ws_url: &str,
        headers: Option<Value>,
        auth_token: Option<String>,
        test_message: Option<String>,
    ) -> Result<(bool, String, Option<u64>), Box<dyn std::error::Error + Send + Sync>> {
        let start_time = std::time::Instant::now();
        
        // 尝试建立连接
        match connect_async(ws_url).await {
            Ok((ws_stream, _)) => {
                let elapsed = start_time.elapsed().as_millis() as u64;
                
                // 如果有测试消息，发送它
                if let Some(test_msg) = test_message {
                    let (mut sender, mut receiver) = ws_stream.split();
                    
                    // 发送测试消息
                    if let Err(e) = sender.send(Message::Text(test_msg)).await {
                        return Ok((false, format!("Failed to send test message: {}", e), Some(elapsed)));
                    }
                    
                    // 等待响应（最多等待5秒）
                    let timeout = tokio::time::Duration::from_secs(5);
                    match tokio::time::timeout(timeout, receiver.next()).await {
                        Ok(Some(Ok(Message::Text(response)))) => {
                            Ok((true, format!("Connection successful, received: {}", response), Some(elapsed)))
                        }
                        Ok(Some(Ok(_))) => {
                            Ok((true, "Connection successful, received non-text message".to_string(), Some(elapsed)))
                        }
                        Ok(Some(Err(e))) => {
                            Ok((false, format!("Connection error: {}", e), Some(elapsed)))
                        }
                        Ok(None) => {
                            Ok((false, "Connection closed unexpectedly".to_string(), Some(elapsed)))
                        }
                        Err(_) => {
                            Ok((true, "Connection successful, no response within timeout".to_string(), Some(elapsed)))
                        }
                    }
                } else {
                    Ok((true, "Connection successful".to_string(), Some(elapsed)))
                }
            }
            Err(e) => {
                let elapsed = start_time.elapsed().as_millis() as u64;
                Ok((false, format!("Connection failed: {}", e), Some(elapsed)))
            }
        }
    }
}

// 全局WebSocket管理器实例
lazy_static::lazy_static! {
    pub static ref WEBSOCKET_MANAGER: WebSocketManager = WebSocketManager::new();
}
