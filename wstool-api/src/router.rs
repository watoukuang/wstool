use axum::{routing::get, Router};
use axum::routing::{post, put, delete};
use crate::service::{items, cex, kol, twitter, health, websocket, websocket_actions};
use crate::app::AppState;
use crate::service::binlog::{binlog_add_batch_handler, binlog_add_handler, binlog_list_handler};

pub fn build_router() -> Router<AppState> {
    Router::new()
        .merge(health_router())
        .merge(items_router())
        .merge(feeds_router())
        .merge(binlog_router())
        .merge(websocket_router())
}

fn health_router() -> Router<AppState> {
    Router::new().route("/health", get(health::health))
}

fn items_router() -> Router<AppState> {
    Router::new()
        .route("/items", get(items::list).post(items::create))
        .route("/items/:id", get(items::get).put(items::update).delete(items::delete))
}

fn feeds_router() -> Router<AppState> {
    Router::new()
        .route("/cexs", get(cex::list))
        .route("/kols", get(kol::list))
        .route("/twitters", get(twitter::list))
}

pub fn binlog_router() -> Router<AppState> {
    Router::new()
        .route("/binlog", get(binlog_list_handler))          // 查询
        .route("/binlog/add", post(binlog_add_handler))     // 添加单条
        .route("/binlog/add_batch", post(binlog_add_batch_handler)) // 添加多条
}

fn websocket_router() -> Router<AppState> {
    Router::new()
        // WebSocket配置管理
        .route("/websocket/configs", get(websocket::list_configs).post(websocket::create_config))
        .route("/websocket/configs/:id", get(websocket::get_config).put(websocket::update_config).delete(websocket::delete_config))
        
        // WebSocket连接操作
        .route("/websocket/test", post(websocket_actions::test_websocket_connection))
        .route("/websocket/send", post(websocket_actions::send_message))
        .route("/websocket/subscribe", post(websocket_actions::subscribe_websocket))
        .route("/websocket/unsubscribe/:id", post(websocket_actions::unsubscribe_websocket))
        
        // WebSocket连接控制
        .route("/websocket/start/:id", post(websocket_actions::start_connection))
        .route("/websocket/stop/:id", post(websocket_actions::stop_connection))
        
        // WebSocket状态和消息
        .route("/websocket/status", get(websocket_actions::get_all_connection_status))
        .route("/websocket/status/:id", get(websocket::get_config_status))
        .route("/websocket/messages/:id", get(websocket::get_messages))
}