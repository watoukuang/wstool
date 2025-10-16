import React from 'react';
import { ToolCardProps, Tag } from '../types';

export default function CexCard({ cex }: ToolCardProps): React.ReactElement {
  // 相对时间格式
  const formatTime = (ts: number) => {
    try {
      const diff = Date.now() - (ts * (ts > 1e12 ? 1 : 1000)); // 兼容秒/毫秒
      const abs = Math.max(0, diff);
      const m = Math.floor(abs / 60000);
      if (m < 1) return '刚刚';
      if (m < 60) return `${m} 分钟前`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} 小时前`;
      const d = Math.floor(h / 24);
      if (d < 7) return `${d} 天前`;
      const date = new Date(ts * (ts > 1e12 ? 1 : 1000));
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    } catch { return ''; }
  };

  return (
    <div className="card group transition-transform hover:-translate-y-0.5 duration-200 hover:shadow-lg">
      <div className="flex items-start mb-3">
        <div
          className="h-10 w-10 mr-3 rounded-xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/5"
          style={{ backgroundColor: cex.bg_color || '#f3f4f6' }}
          aria-hidden
        >
          <span
            className="text-base select-none"
            style={{
              color: 'initial',
              filter: 'none',
              mixBlendMode: 'normal',
              fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, emoji'
            }}
          >
            {cex.icon}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] md:text-base leading-snug truncate">{cex.name}</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">最新快讯</p>
        </div>
      </div>

      {/* 快讯列表 */}
      {cex.messages?.length ? (
        <ul className="space-y-2">
          {cex.messages.slice(0, 4).map((m: Tag, i: number) => (
            <li key={i} className="text-[13px] leading-snug">
              <a
                className="text-gray-900 dark:text-gray-100 hover:underline"
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.title}
              </a>
              <span className="ml-2 text-[11px] text-gray-500 dark:text-gray-400">{formatTime(m.created)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">暂无快讯</div>
      )}

      {cex.messages && cex.messages.length > 4 && (
        <div className="mt-2 text-right">
          <a className="text-[12px] text-indigo-600 dark:text-indigo-400 hover:underline" href={cex.messages[0].href} target="_blank" rel="noopener noreferrer">
            查看更多
          </a>
        </div>
      )}
    </div>
  );
}
