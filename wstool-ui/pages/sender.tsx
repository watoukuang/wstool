import React from 'react';
import WebSocketSender from '../components/Sender';

export default function Sender(): React.ReactElement {
    return (
        <div className="px-4">
            <div className="w-full max-w-7xl mx-auto">
                <div className="pt-6 md:pt-8 lg:pt-10 text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300 mb-3">
                        WebSocket 消息发送
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
                        连接目标WebSocket服务并发送自定义消息，实时查看回执
                    </p>
                </div>

                <WebSocketSender/>
            </div>
        </div>
    );
}
