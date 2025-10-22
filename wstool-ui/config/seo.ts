export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

// 全局默认 SEO 配置
export const defaultSEO: SEOConfig = {
  title: 'WsTool - WebSocket工具平台',
  description: 'WsTool - 专业的WebSocket测试与开发工具平台，提供消息发送、数据订阅、连接管理等功能',
  keywords: 'WebSocket,WS工具,消息发送,数据订阅,连接管理,实时通信,开发工具',
  ogImage: '/og-image.jpg',
};

// 页面级 SEO 配置
export const pageSEO: Record<string, Partial<SEOConfig>> = {
  '/': {
    title: 'WebSocket数据订阅 - WsTool',
    description: '连接外部WebSocket数据源，实时接收和显示数据流，支持模板与参数配置',
  },
  '/sender': {
    title: 'WebSocket消息发送 - WsTool', 
    description: '连接目标WebSocket服务并发送自定义消息，实时查看回执和响应',
  },
  '/subscribe': {
    title: 'WebSocket数据订阅 - WsTool',
    description: '连接外部WebSocket数据源，实时接收和显示数据流，支持模板与参数配置',
  },
  '/websocket': {
    title: 'WebSocket连接管理 - WsTool',
    description: '管理WebSocket连接配置，实时监控连接状态和消息统计，支持连接测试',
  },
  '/about': {
    title: '关于我们 - WsTool',
    description: 'WsTool团队致力于为开发者提供专业的WebSocket测试与开发工具',
  },
};

// 获取页面 SEO 配置
export function getPageSEO(pathname: string): SEOConfig {
  const pageSEOConfig = pageSEO[pathname] || {};
  return {
    ...defaultSEO,
    ...pageSEOConfig,
    canonical: `https://wstool.example.com${pathname}`,
  };
}
