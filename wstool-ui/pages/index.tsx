import React from 'react';
import Layout from '../components/Layout';
import Subscribe from '../components/Subscribe';
import {NewWebSocketConfig} from '../types';

export default function Home(): React.ReactElement {
    const handleSubscribe = async (config: NewWebSocketConfig) => {
        // 直接订阅，不保存配置
        console.log('订阅配置:', config);
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300 mb-3">
                            WebSocket 数据订阅
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
                            连接外部WebSocket数据源，实时接收和显示数据流
                        </p>
                    </div>
                    
                    <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 md:p-8 shadow-xl">
                        <Subscribe onSave={handleSubscribe} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
