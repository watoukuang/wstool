import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WebSocketConfigCard from '../components/WebSocketConfigCard';
import WebSocketConfigModal from '../components/WebSocketConfigModal';
import WebSocketMessageModal from '../components/WebSocketMessageModal';
import WebSocketTestModal from '../components/WebSocketTestModal';
import { WebSocketConfig, WebSocketStatus, NewWebSocketConfig, SendMessageRequest } from '../types';

export default function Sender(): React.ReactElement {
  const [configs, setConfigs] = useState<WebSocketConfig[]>([]);
  const [statuses, setStatuses] = useState<WebSocketStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<WebSocketConfig | null>(null);
  const [editingConfig, setEditingConfig] = useState<WebSocketConfig | null>(null);

  useEffect(() => {
    fetchConfigs();
    fetchStatuses();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/websocket/configs?config_type=sender');
      const data = await response.json();
      if (data.success) {
        setConfigs(data.data.filter((config: WebSocketConfig) => config.config_type === 'sender'));
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/websocket/status');
      const data = await response.json();
      if (data.success) {
        setStatuses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusForConfig = (configId: string) => {
    return statuses.find(s => s.config_id === configId);
  };

  const handleCreateConfig = async (newConfig: NewWebSocketConfig) => {
    try {
      const response = await fetch('/api/websocket/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newConfig, config_type: 'sender' })
      });
      
      if (response.ok) {
        await fetchConfigs();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create config:', error);
    }
  };

  const handleSendMessage = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (config) {
      setSelectedConfig(config);
      setShowMessageModal(true);
    }
  };

  const handleEdit = (config: WebSocketConfig) => {
    setEditingConfig(config);
    setShowCreateModal(true);
  };

  const handleTest = (config: WebSocketConfig) => {
    setSelectedConfig(config);
    setShowTestModal(true);
  };

  const handleDelete = async (configId: string) => {
    if (confirm('确定要删除这个配置吗？')) {
      try {
        const response = await fetch(`/api/websocket/configs/${configId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchConfigs();
        }
      } catch (error) {
        console.error('Failed to delete config:', error);
      }
    }
  };

  const handleSendWebSocketMessage = async (request: SendMessageRequest) => {
    try {
      const response = await fetch('/api/websocket/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      if (response.ok) {
        await fetchStatuses();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">消息发送</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              配置WebSocket连接参数，向目标服务发送自定义消息
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新建发送器
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              还没有消息发送配置
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              创建您的第一个WebSocket消息发送配置，开始发送自定义消息
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建发送配置
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {configs.map((config) => {
              const status = getStatusForConfig(config.id);
              return (
                <WebSocketConfigCard
                  key={config.id}
                  config={config}
                  status={status}
                  onSendMessage={handleSendMessage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTest={handleTest}
                />
              );
            })}
          </div>
        )}

        {/* Modals */}
        <WebSocketConfigModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingConfig(null);
          }}
          onSave={handleCreateConfig}
          editConfig={editingConfig || undefined}
        />

        {selectedConfig && (
          <WebSocketMessageModal
            isOpen={showMessageModal}
            onClose={() => {
              setShowMessageModal(false);
              setSelectedConfig(null);
            }}
            config={selectedConfig}
            onSend={handleSendWebSocketMessage}
          />
        )}

        {selectedConfig && (
          <WebSocketTestModal
            isOpen={showTestModal}
            onClose={() => {
              setShowTestModal(false);
              setSelectedConfig(null);
            }}
            config={selectedConfig}
          />
        )}
      </div>
    </Layout>
  );
}
