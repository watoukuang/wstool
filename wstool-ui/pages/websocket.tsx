import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WebSocketConfigCard from '../components/WebSocketConfigCard';
import WebSocketConfigModal from '../components/WebSocketConfigModal';
import WebSocketMessageModal from '../components/WebSocketMessageModal';
import WebSocketTestModal from '../components/WebSocketTestModal';
import { WebSocketConfig, WebSocketStatus, NewWebSocketConfig, SendMessageRequest } from '../types';

const WebSocketPage: React.FC = () => {
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
      const response = await fetch('/api/websocket/configs');
      const data = await response.json();
      if (data.success) {
        setConfigs(data.data);
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
        body: JSON.stringify(newConfig)
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

  const handleSubscribe = async (configId: string) => {
    const status = getStatusForConfig(configId);
    const endpoint = status?.is_connected ? 'unsubscribe' : 'subscribe';
    
    try {
      const response = await fetch(`/api/websocket/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_id: configId })
      });
      
      if (response.ok) {
        await fetchStatuses();
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">WebSocket 工具平台</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            新建配置
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
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
                  onSubscribe={handleSubscribe}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTest={handleTest}
                />
              );
            })}
          </div>
        )}

        {/* 配置创建/编辑模态框 */}
        <WebSocketConfigModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingConfig(null);
          }}
          onSave={handleCreateConfig}
          editConfig={editingConfig || undefined}
        />

        {/* 消息发送模态框 */}
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

        {/* 连接测试模态框 */}
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
};

export default WebSocketPage;
