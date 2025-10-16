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
export interface TwitterItem {
    id: number;
    name: string;      // 账号或分组名
    icon: string;      // 头像占位（可用 emoji 或后续换成图片）
    bg_color?: string;  // 卡片图标背景色
    messages: string;  // 最新情报/摘要
    created: number;   // 最新消息时间戳（秒或毫秒）
}

export interface TwitterCardProps {
    twitter: TwitterItem;
}

export interface TwittersGridProps {
    items: TwitterItem[];
}

// KOL 页面
export type KolPlatform = 'twitter' | 'reddit' | 'youtube';

export interface KolItem {
    id: number;
    name: string;         // 昵称
    avatar?: string;      // 头像链接或 emoji
    description: string;  // 简介
    url: string;          // 跳转地址
    platform: KolPlatform;// 平台
}

export interface KolCardProps {
    kol: KolItem;
}

export interface KolsGridProps {
    items: KolItem[];
    platform?: KolPlatform | 'all';
}

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
