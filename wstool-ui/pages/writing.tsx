import React from 'react';
import Layout from '../components/Layout';
import TwittersGrid from '../components/TwittersGrid';
import { api } from '../lib/api';
import { TwitterItem } from '../types';

export default function Writing(): React.ReactElement {
  const [items, setItems] = React.useState<TwitterItem[]>([]);
  React.useEffect(() => {
    let ignore = false;
    api.getTwitters().then((data) => { if (!ignore) setItems(data || []); }).catch(() => { if (!ignore) setItems([]); });
    return () => { ignore = true; };
  }, []);
  return (
    <Layout>
      <div className="container px-4 md:px-6 py-4 pb-20 lg:pb-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300 headline-glow">🚨 Twitter Radar | 推特情报雷达</h1>
          <p className="text-[13.5px] md:text-base leading-relaxed max-w-2xl subtle-muted">追踪顶级 KOL 实时发声，情报摘要一网打尽。</p>
        </div>

        <TwittersGrid items={items} />
      </div>
    </Layout>
  );
}
