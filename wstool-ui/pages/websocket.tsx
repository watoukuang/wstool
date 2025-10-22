import React, { useState, useEffect } from 'react';
import { WebSocketConfig, WebSocketStatus, NewWebSocketConfig } from '../types';

const WebSocketPage: React.FC = () => {
  const [configs, setConfigs] = useState<WebSocketConfig[]>([]);
  const [statuses, setStatuses] = useState<WebSocketStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('create');

  useEffect(() => {
    fetchConfigs();
    fetchStatuses();
    const id = setInterval(fetchStatuses, 5000);
    return () => clearInterval(id);
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/websocket/configs');
      const data = await response.json();
      if (data.success) setConfigs(data.data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/websocket/status');
      const data = await response.json();
      if (data.success) setStatuses(data.data);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusForConfig = (configId: string) => {
    return statuses.find(s => s.config_id === configId);
  };

  const handleSubscribe = async (configId: string) => {
    const status = getStatusForConfig(configId);
    const endpoint = status?.is_connected ? 'unsubscribe' : 'subscribe';
    
    try {
      const response = await fetch(`/api/websocket/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_id: configId })
      });
      
      if (response.ok) await fetchStatuses();
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const handleDelete = async (configId: string) => {
    if (confirm('确定要删除这个配置吗？')) {
      try {
        const response = await fetch(`/api/websocket/configs/${configId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) await fetchConfigs();
      } catch (error) {
        console.error('Failed to delete config:', error);
      }
    }
  };

  return (
    <div className="px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="pt-6 md:pt-8 lg:pt-10 text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-300 mb-3">
              WebSocket 连接管理
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
              🔧 连接管理 • 📊 实时监控 • 🧪 连接测试
            </p>
          </div>

          {/* 标签页导航（仅保留新建连接） */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                }`}
              >
                新建连接
              </button>
            </div>
          </div>

          {/* 连接列表（已隐藏） */}
          {false && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">暂无WebSocket连接配置</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    创建第一个连接
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {configs.map((config) => {
                    const status = getStatusForConfig(config.id);
                    const isConnected = status?.is_connected ?? false;
                    
                    return (
                      <div key={config.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{config.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                config.config_type === 'subscriber'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                              }`}>
                                {config.config_type === 'subscriber' ? '订阅器' : '发送器'}
                              </span>
                            </div>
                            {config.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            isConnected
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {isConnected ? '已连接' : '未连接'}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{config.ws_url}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">消息数</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{status?.message_count ?? 0}</div>
                          </div>
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">错误数</div>
                            <div className={`text-sm font-medium ${status?.error_count ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>{status?.error_count ?? 0}</div>
                          </div>
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">最近活动</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{status?.last_message_time ? new Date(status.last_message_time).toLocaleTimeString() : '-'}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleSubscribe(config.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                              isConnected ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isConnected ? '断开连接' : '连接'}
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-red-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 新建连接表单 */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">新建WebSocket连接</h2>
                <CreateConfigForm onSave={() => setActiveTab('list')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 简化的创建表单组件
const CreateConfigForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const [form, setForm] = useState<NewWebSocketConfig>({
    name: '',
    description: '',
    ws_url: '',
    config_type: 'subscriber',
    headers: '',
    auth_token: '',
    subscribe_message: '',
    auto_reconnect: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/websocket/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to create config:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名称</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="w-full h-11 px-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WebSocket地址</label>
        <input
          type="text"
          value={form.ws_url}
          onChange={e => setForm(prev => ({ ...prev, ws_url: e.target.value }))}
          placeholder="wss://example.com/ws"
          className="w-full h-11 px-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">类型</label>
          <select
            value={form.config_type}
            onChange={e => setForm(prev => ({ ...prev, config_type: e.target.value as any }))}
            className="w-full h-11 px-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none"
          >
            <option value="subscriber">订阅器</option>
            <option value="sender">发送器</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            id="auto_reconnect"
            type="checkbox"
            checked={!!form.auto_reconnect}
            onChange={e => setForm(prev => ({ ...prev, auto_reconnect: e.target.checked }))}
          />
          <label htmlFor="auto_reconnect" className="text-sm text-gray-700 dark:text-gray-300">自动重连</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述 (可选)</label>
        <input
          type="text"
          value={form.description || ''}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full h-11 px-3 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="submit" className="px-6 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700">创建连接</button>
      </div>
    </form>
  );
};

export default WebSocketPage;
