use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WebSocketConfig {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub ws_url: String,
    pub config_type: String, // "sender" or "subscriber"
    pub headers: Option<String>, // JSON string for headers
    pub auth_token: Option<String>,
    pub message_template: Option<String>, // For sender type
    pub auto_reconnect: bool,
    pub status: String, // "active", "inactive", "error"
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewWebSocketConfig {
    pub name: String,
    pub description: Option<String>,
    pub ws_url: String,
    pub config_type: String,
    pub headers: Option<String>,
    pub auth_token: Option<String>,
    pub message_template: Option<String>,
    pub auto_reconnect: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateWebSocketConfig {
    pub name: Option<String>,
    pub description: Option<String>,
    pub ws_url: Option<String>,
    pub config_type: Option<String>,
    pub headers: Option<String>,
    pub auth_token: Option<String>,
    pub message_template: Option<String>,
    pub auto_reconnect: Option<bool>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WebSocketMessage {
    pub id: String,
    pub config_id: String,
    pub message_type: String, // "sent", "received"
    pub content: String,
    pub timestamp: i64,
    pub status: String, // "success", "failed", "pending"
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendMessageRequest {
    pub config_id: String,
    pub message: String,
    pub custom_headers: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubscribeRequest {
    pub config_id: String,
    pub filters: Option<serde_json::Value>, // Message filters
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketStatus {
    pub config_id: String,
    pub is_connected: bool,
    pub connection_time: Option<i64>,
    pub last_message_time: Option<i64>,
    pub message_count: i64,
    pub error_count: i64,
    pub last_error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestConnectionRequest {
    pub ws_url: String,
    pub headers: Option<serde_json::Value>,
    pub auth_token: Option<String>,
    pub test_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestConnectionResponse {
    pub success: bool,
    pub message: String,
    pub response_time_ms: Option<u64>,
    pub received_data: Option<String>,
}
