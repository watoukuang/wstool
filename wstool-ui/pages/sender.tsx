import React from 'react';
import WebSocketSender from '../components/Sender';
import HeroTheme from '../components/HeroTheme';

export default function Sender(): React.ReactElement {
    return (
        <div className="px-4">
            <HeroTheme title="WebSocket 消息发送" subtitle="连接目标WebSocket服务并发送自定义消息，实时查看回执" />
            <div className="w-full max-w-7xl mx-auto">
                <WebSocketSender/>
            </div>
        </div>
    );
}
