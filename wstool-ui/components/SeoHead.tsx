import Head from 'next/head';
import React from 'react';

export interface SeoProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export default function SeoHead({ title, description, url, image }: SeoProps): React.ReactElement {
  const siteName = 'WsTool - 通用 WebSocket 工具平台';
  const defaultTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDesc = description || 'WsTool 提供通用的 WebSocket 消息订阅与消息发送工具，支持任意 WS 服务，现代化 UI 与高可用交互。';
  const defaultUrl = url || 'https://wstool.example.com/';
  const defaultImage = image || '/og-wstool.png';

  return (
    <Head>
      <title>{defaultTitle}</title>
      <meta name="description" content={defaultDesc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={defaultTitle} />
      <meta property="og:description" content={defaultDesc} />
      <meta property="og:url" content={defaultUrl} />
      <meta property="og:image" content={defaultImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={defaultTitle} />
      <meta name="twitter:description" content={defaultDesc} />
      <meta name="twitter:image" content={defaultImage} />

      {/* PWA basics (optional) */}
      <meta name="theme-color" content="#0ea5e9" />
    </Head>
  );
}
