import React from 'react';
import Layout from '../components/Layout';
import WebSocketSender from '../components/Sender';
import SeoHead from '../components/SeoHead';

export default function SendLive(): React.ReactElement {
  return (
    <Layout>
      <SeoHead
        title="WebSocket 消息发送（实时）"
        description="在浏览器中直接连接WebSocket并发送消息，实时查看回执与日志。"
        url="https://wstool.example.com/send-live"
      />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300 mb-3">
              WebSocket 消息发送
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
              连接目标WebSocket服务并发送自定义消息，实时查看回执
            </p>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 md:p-8 shadow-xl">
            <WebSocketSender />
          </div>
        </div>
      </div>
    </Layout>
  );
}
