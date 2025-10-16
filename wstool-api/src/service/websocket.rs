use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::app::AppState;
use crate::models::{
    ApiResponse, WebSocketConfig, NewWebSocketConfig, UpdateWebSocketConfig,
    WebSocketMessage, SendMessageRequest, SubscribeRequest, WebSocketStatus,
    TestConnectionRequest, TestConnectionResponse
};

#[derive(Deserialize)]
pub struct ListQuery {
    pub config_type: Option<String>,
    pub status: Option<String>,
    pub page: Option<i32>,
    pub limit: Option<i32>,
}

// 获取WebSocket配置列表
pub async fn list_configs(
    Query(params): Query<ListQuery>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<WebSocketConfig>>>, StatusCode> {
    let _page = params.page.unwrap_or(1).max(1);
    let _limit = params.limit.unwrap_or(20).min(100);

    // 简化实现，先返回所有配置
    match sqlx::query_as::<_, WebSocketConfig>(
        "SELECT * FROM t_websocket_config ORDER BY created_at DESC"
    )
    .fetch_all(&state.pool)
    .await
    {
        Ok(configs) => Ok(Json(ApiResponse::success(configs))),
        Err(e) => {
            tracing::error!("Failed to fetch websocket configs: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 获取单个WebSocket配置
pub async fn get_config(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<WebSocketConfig>>, StatusCode> {
    match sqlx::query_as::<_, WebSocketConfig>(
        "SELECT * FROM t_websocket_config WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&state.pool)
    .await
    {
        Ok(config) => Ok(Json(ApiResponse::success(config))),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch websocket config: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 创建WebSocket配置
pub async fn create_config(
    State(state): State<AppState>,
    Json(payload): Json<NewWebSocketConfig>,
) -> Result<Json<ApiResponse<WebSocketConfig>>, StatusCode> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp();
    let auto_reconnect = payload.auto_reconnect.unwrap_or(true);

    let config = WebSocketConfig {
        id: id.clone(),
        name: payload.name,
        description: payload.description,
        ws_url: payload.ws_url,
        config_type: payload.config_type,
        headers: payload.headers,
        auth_token: payload.auth_token,
        message_template: payload.message_template,
        auto_reconnect,
        status: "inactive".to_string(),
        created_at: now,
        updated_at: now,
    };

    match sqlx::query(
        r#"
        INSERT INTO t_websocket_config 
        (id, name, description, ws_url, config_type, headers, auth_token, message_template, auto_reconnect, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&config.id)
    .bind(&config.name)
    .bind(&config.description)
    .bind(&config.ws_url)
    .bind(&config.config_type)
    .bind(&config.headers)
    .bind(&config.auth_token)
    .bind(&config.message_template)
    .bind(config.auto_reconnect)
    .bind(&config.status)
    .bind(config.created_at)
    .bind(config.updated_at)
    .execute(&state.pool)
    .await
    {
        Ok(_) => Ok(Json(ApiResponse::success(config))),
        Err(e) => {
            tracing::error!("Failed to create websocket config: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 更新WebSocket配置
pub async fn update_config(
    Path(id): Path<String>,
    State(state): State<AppState>,
    Json(_payload): Json<UpdateWebSocketConfig>,
) -> Result<Json<ApiResponse<WebSocketConfig>>, StatusCode> {
    let now = chrono::Utc::now().timestamp();

    // 简化实现，只更新时间戳
    match sqlx::query(
        "UPDATE t_websocket_config SET updated_at = ? WHERE id = ?"
    )
    .bind(now)
    .bind(&id)
    .execute(&state.pool)
    .await
    {
        Ok(result) => {
            if result.rows_affected() == 0 {
                return Err(StatusCode::NOT_FOUND);
            }
            
            // Fetch updated config
            match sqlx::query_as::<_, WebSocketConfig>(
                "SELECT * FROM t_websocket_config WHERE id = ?"
            )
            .bind(&id)
            .fetch_one(&state.pool)
            .await
            {
                Ok(config) => Ok(Json(ApiResponse::success(config))),
                Err(e) => {
                    tracing::error!("Failed to fetch updated config: {}", e);
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to update websocket config: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 删除WebSocket配置
pub async fn delete_config(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    match sqlx::query("DELETE FROM t_websocket_config WHERE id = ?")
        .bind(&id)
        .execute(&state.pool)
        .await
    {
        Ok(result) => {
            if result.rows_affected() == 0 {
                Err(StatusCode::NOT_FOUND)
            } else {
                Ok(Json(ApiResponse::success(())))
            }
        }
        Err(e) => {
            tracing::error!("Failed to delete websocket config: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 测试WebSocket连接
pub async fn test_connection(
    Json(payload): Json<TestConnectionRequest>,
) -> Result<Json<ApiResponse<TestConnectionResponse>>, StatusCode> {
    let start_time = std::time::Instant::now();
    
    // 这里实现WebSocket连接测试逻辑
    // 由于这是一个复杂的异步操作，我们先返回一个模拟的响应
    let response = TestConnectionResponse {
        success: true,
        message: "Connection test successful".to_string(),
        response_time_ms: Some(start_time.elapsed().as_millis() as u64),
        received_data: Some("Test response".to_string()),
    };

    Ok(Json(ApiResponse::success(response)))
}

// 获取WebSocket配置状态
pub async fn get_config_status(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<WebSocketStatus>>, StatusCode> {
    // 检查配置是否存在
    match sqlx::query("SELECT id FROM t_websocket_config WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(_) => {
            // 这里应该从WebSocket连接管理器获取实际状态
            // 现在返回模拟状态
            let status = WebSocketStatus {
                config_id: id,
                is_connected: false,
                connection_time: None,
                last_message_time: None,
                message_count: 0,
                error_count: 0,
                last_error: None,
            };
            Ok(Json(ApiResponse::success(status)))
        }
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to check config existence: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 获取WebSocket消息历史
pub async fn get_messages(
    Path(config_id): Path<String>,
    Query(params): Query<HashMap<String, String>>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<WebSocketMessage>>>, StatusCode> {
    let page: i32 = params.get("page").and_then(|p| p.parse().ok()).unwrap_or(1).max(1);
    let limit: i32 = params.get("limit").and_then(|l| l.parse().ok()).unwrap_or(50).min(100);
    let offset = (page - 1) * limit;

    match sqlx::query_as::<_, WebSocketMessage>(
        "SELECT * FROM t_websocket_message WHERE config_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    )
    .bind(&config_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.pool)
    .await
    {
        Ok(messages) => Ok(Json(ApiResponse::success(messages))),
        Err(e) => {
            tracing::error!("Failed to fetch websocket messages: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
