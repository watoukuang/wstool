import {ReactNode} from 'react';

export interface Tag {
    title: string;
    created: number
    href: string
}

export interface Tool {
    id: number;
    type?: string,
    name: string;
    icon: string;
    bg_color?: string;
    messages: Tag[];
    category?: string;
}

export interface FilterDropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

export interface ToolCardProps {
    cex: Tool;
}

export interface ToolsGridProps {
    tools: Tool[];
    selectedCategory: string;
    selectedType: string;
}

// 推特情报站数据结构
// (removed) Twitter related types

// KOL 页面
// (removed) KOL related types

export interface TabItem {
    key: string;
    label: string;
}

export interface LayoutProps {
    children: ReactNode;
}

export interface HeaderProps {
    toggleSidebar: () => void;
}

// WebSocket 相关类型定义
export interface WebSocketConfig {
    id: string;
    name: string;
    description?: string;
    ws_url: string;
    config_type: 'sender' | 'subscriber';
    headers?: string;
    auth_token?: string;
    message_template?: string;
    // 连接成功后发送的订阅消息（原始字符串，一般为JSON字符串）
    subscribe_message?: string;
    auto_reconnect: boolean;
    status: 'active' | 'inactive' | 'error';
    created_at: number;
    updated_at: number;
}

export interface NewWebSocketConfig {
    name: string;
    description?: string;
    ws_url: string;
    config_type: 'sender' | 'subscriber';
    headers?: string;
    auth_token?: string;
    message_template?: string;
    // 连接成功后发送的订阅消息（原始字符串，一般为JSON字符串）
    subscribe_message?: string;
    auto_reconnect?: boolean;
}

export interface WebSocketMessage {
    id: string;
    config_id: string;
    message_type: 'sent' | 'received';
    content: string;
    timestamp: number;
    status: 'success' | 'failed' | 'pending';
    error_message?: string;
}

export interface WebSocketStatus {
    config_id: string;
    is_connected: boolean;
    connection_time?: number;
    last_message_time?: number;
    message_count: number;
    error_count: number;
    last_error?: string;
}

export interface SendMessageRequest {
    config_id: string;
    message: string;
    custom_headers?: any;
}

export interface TestConnectionRequest {
    ws_url: string;
    headers?: any;
    auth_token?: string;
    test_message?: string;
}

export interface TestConnectionResponse {
    success: boolean;
    message: string;
    response_time_ms?: number;
    received_data?: string;
}
