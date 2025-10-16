use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::app::AppState;
use crate::models::{
    ApiResponse, WebSocketConfig, SendMessageRequest, SubscribeRequest,
    WebSocketStatus, TestConnectionRequest, TestConnectionResponse, WebSocketMessage
};
use crate::service::websocket_manager::WEBSOCKET_MANAGER;

// 发送WebSocket消息（功能一）
pub async fn send_message(
    State(state): State<AppState>,
    Json(payload): Json<SendMessageRequest>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    // 首先验证配置是否存在
    let config = match sqlx::query_as::<_, WebSocketConfig>(
        "SELECT * FROM t_websocket_config WHERE id = ? AND config_type = 'sender'"
    )
    .bind(&payload.config_id)
    .fetch_one(&state.pool)
    .await
    {
        Ok(config) => config,
        Err(sqlx::Error::RowNotFound) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch websocket config: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // 检查连接状态，如果未连接则先建立连接
    if WEBSOCKET_MANAGER.get_connection_status(&payload.config_id).await.is_none() {
        if let Err(e) = WEBSOCKET_MANAGER.connect(config.clone()).await {
            tracing::error!("Failed to establish WebSocket connection: {}", e);
            return Err(StatusCode::SERVICE_UNAVAILABLE);
        }
    }

    // 发送消息
    match WEBSOCKET_MANAGER.send_message(payload.clone()).await {
        Ok(_) => {
            // 记录消息到数据库
            let message_id = Uuid::new_v4().to_string();
            let now = chrono::Utc::now().timestamp();
            
            if let Err(e) = sqlx::query(
                r#"
                INSERT INTO t_websocket_message 
                (id, config_id, message_type, content, timestamp, status)
                VALUES (?, ?, 'sent', ?, ?, 'success')
                "#
            )
            .bind(&message_id)
            .bind(&payload.config_id)
            .bind(&payload.message)
            .bind(now)
            .execute(&state.pool)
            .await
            {
                tracing::error!("Failed to save message to database: {}", e);
            }

            Ok(Json(ApiResponse::success(())))
        }
        Err(e) => {
            tracing::error!("Failed to send WebSocket message: {}", e);
            
            // 记录失败的消息
            let message_id = Uuid::new_v4().to_string();
            let now = chrono::Utc::now().timestamp();
            
            let _ = sqlx::query(
                r#"
                INSERT INTO t_websocket_message 
                (id, config_id, message_type, content, timestamp, status, error_message)
                VALUES (?, ?, 'sent', ?, ?, 'failed', ?)
                "#
            )
            .bind(&message_id)
            .bind(&payload.config_id)
            .bind(&payload.message)
            .bind(now)
            .bind(e.to_string())
            .execute(&state.pool)
            .await;

            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

// 订阅WebSocket数据（功能二）
pub async fn subscribe_websocket(
    State(state): State<AppState>,
    Json(payload): Json<SubscribeRequest>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    // 验证配置是否存在且类型为subscriber
    let config = match sqlx::query_as::<_, WebSocketConfig>(
        "SELECT * FROM t_websocket_config WHERE id = ? AND config_type = 'subscriber'"
    )
    .bind(&payload.config_id)
    .fetch_one(&state.pool)
    .await
    {
        Ok(config) => config,
        Err(sqlx::Error::RowNotFound) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch websocket config: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // 检查是否已经连接
    if let Some(status) = WEBSOCKET_MANAGER.get_connection_status(&payload.config_id).await {
        if status.is_connected {
            return Ok(Json(ApiResponse::success(())));
        }
    }

    // 建立订阅连接
    match WEBSOCKET_MANAGER.connect(config.clone()).await {
        Ok(_) => {
            // 更新配置状态为active
            let _ = sqlx::query("UPDATE t_websocket_config SET status = 'active' WHERE id = ?")
                .bind(&payload.config_id)
                .execute(&state.pool)
                .await;

            Ok(Json(ApiResponse::success(())))
        }
        Err(e) => {
            tracing::error!("Failed to establish WebSocket subscription: {}", e);
            
            // 更新配置状态为error
            let _ = sqlx::query("UPDATE t_websocket_config SET status = 'error' WHERE id = ?")
                .bind(&payload.config_id)
                .execute(&state.pool)
                .await;

            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

// 取消订阅WebSocket
pub async fn unsubscribe_websocket(
    Path(config_id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    // 验证配置是否存在
    match sqlx::query("SELECT id FROM t_websocket_config WHERE id = ?")
        .bind(&config_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(_) => {},
        Err(sqlx::Error::RowNotFound) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch websocket config: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    // 断开连接
    WEBSOCKET_MANAGER.disconnect(&config_id).await;

    // 更新配置状态为inactive
    let _ = sqlx::query("UPDATE t_websocket_config SET status = 'inactive' WHERE id = ?")
        .bind(&config_id)
        .execute(&state.pool)
        .await;

    Ok(Json(ApiResponse::success(())))
}

// 启动WebSocket连接
pub async fn start_connection(
    Path(config_id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    // 获取配置
    let config = match sqlx::query_as::<_, WebSocketConfig>(
        "SELECT * FROM t_websocket_config WHERE id = ?"
    )
    .bind(&config_id)
    .fetch_one(&state.pool)
    .await
    {
        Ok(config) => config,
        Err(sqlx::Error::RowNotFound) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch websocket config: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // 检查是否已经连接
    if let Some(status) = WEBSOCKET_MANAGER.get_connection_status(&config_id).await {
        if status.is_connected {
            return Ok(Json(ApiResponse::success(())));
        }
    }

    // 启动连接
    let manager = WEBSOCKET_MANAGER.clone();
    let config_clone = config.clone();
    let pool = state.pool.clone();
    
    tokio::spawn(async move {
        match manager.connect(config_clone).await {
            Ok(_) => {
                let _ = sqlx::query("UPDATE t_websocket_config SET status = 'active' WHERE id = ?")
                    .bind(&config_id)
                    .execute(&pool)
                    .await;
            }
            Err(e) => {
                tracing::error!("Failed to start WebSocket connection: {}", e);
                let _ = sqlx::query("UPDATE t_websocket_config SET status = 'error' WHERE id = ?")
                    .bind(&config_id)
                    .execute(&pool)
                    .await;
            }
        }
    });

    Ok(Json(ApiResponse::success(())))
}

// 停止WebSocket连接
pub async fn stop_connection(
    Path(config_id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    // 验证配置是否存在
    match sqlx::query("SELECT id FROM t_websocket_config WHERE id = ?")
        .bind(&config_id)
        .fetch_one(&state.pool)
        .await
    {
        Ok(_) => {},
        Err(sqlx::Error::RowNotFound) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch websocket config: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    // 停止连接
    WEBSOCKET_MANAGER.disconnect(&config_id).await;

    // 更新配置状态
    let _ = sqlx::query("UPDATE t_websocket_config SET status = 'inactive' WHERE id = ?")
        .bind(&config_id)
        .execute(&state.pool)
        .await;

    Ok(Json(ApiResponse::success(())))
}

// 测试WebSocket连接
pub async fn test_websocket_connection(
    Json(payload): Json<TestConnectionRequest>,
) -> Result<Json<ApiResponse<TestConnectionResponse>>, StatusCode> {
    match WEBSOCKET_MANAGER.test_connection(
        &payload.ws_url,
        payload.headers,
        payload.auth_token,
        payload.test_message,
    ).await {
        Ok((success, message, response_time)) => {
            let response = TestConnectionResponse {
                success,
                message,
                response_time_ms: response_time,
                received_data: None,
            };
            Ok(Json(ApiResponse::success(response)))
        }
        Err(e) => {
            tracing::error!("WebSocket connection test failed: {}", e);
            let response = TestConnectionResponse {
                success: false,
                message: e.to_string(),
                response_time_ms: None,
                received_data: None,
            };
            Ok(Json(ApiResponse::success(response)))
        }
    }
}

// 获取所有WebSocket连接状态
pub async fn get_all_connection_status() -> Result<Json<ApiResponse<Vec<WebSocketStatus>>>, StatusCode> {
    let all_status = WEBSOCKET_MANAGER.get_all_connection_status().await;
    
    let status_list: Vec<WebSocketStatus> = all_status
        .into_iter()
        .map(|(config_id, info)| WebSocketStatus {
            config_id,
            is_connected: info.is_connected,
            connection_time: info.connection_time,
            last_message_time: info.last_message_time,
            message_count: info.message_count,
            error_count: info.error_count,
            last_error: info.last_error,
        })
        .collect();

    Ok(Json(ApiResponse::success(status_list)))
}
