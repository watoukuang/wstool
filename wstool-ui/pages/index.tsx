import React from 'react';
import Layout from '../components/Layout';
import Subscribe from '../components/Subscribe';
import SeoHead from '../components/SeoHead';

export default function Home(): React.ReactElement {

    return (
        <Layout>
            <SeoHead
                title="WebSocket 数据订阅"
                description="通用 WebSocket 订阅工具：连接外部WS数据源，实时接收与查看数据流，支持模板与参数拼接。"
                url="https://wstool.example.com/"
            />
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-7xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300 mb-3">
                            WebSocket 数据订阅
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
                            连接外部WebSocket数据源，实时接收和显示数据流
                        </p>
                    </div>
                    <Subscribe/>
                </div>
            </div>
        </Layout>
    );
}
