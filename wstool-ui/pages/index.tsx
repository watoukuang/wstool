import React from 'react';
import Subscribe from '../components/Subscribe';
import HeroTheme from '../components/HeroTheme';

export default function Home(): React.ReactElement {
    return (
        <div className="px-4">
            <HeroTheme title="WebSocket 数据订阅" subtitle="连接外部WebSocket数据源，实时接收和显示数据流"/>
            <div className="w-full max-w-7xl mx-auto">
                <Subscribe/>
            </div>
        </div>
    );
}
