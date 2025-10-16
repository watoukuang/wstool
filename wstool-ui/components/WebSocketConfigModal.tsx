import React, { useState, useEffect } from 'react';
import { WebSocketConfig, NewWebSocketConfig } from '../types';

interface WebSocketConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: NewWebSocketConfig) => void;
  editConfig?: WebSocketConfig;
}

const WebSocketConfigModal: React.FC<WebSocketConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editConfig
}) => {
  const [formData, setFormData] = useState<NewWebSocketConfig>({
    name: '',
    description: '',
    ws_url: '',
    config_type: 'sender',
    headers: '',
    auth_token: '',
    message_template: '',
    auto_reconnect: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editConfig) {
      setFormData({
        name: editConfig.name,
        description: editConfig.description || '',
        ws_url: editConfig.ws_url,
        config_type: editConfig.config_type,
        headers: editConfig.headers || '',
        auth_token: editConfig.auth_token || '',
        message_template: editConfig.message_template || '',
        auto_reconnect: editConfig.auto_reconnect
      });
    } else {
      setFormData({
        name: '',
        description: '',
        ws_url: '',
        config_type: 'sender',
        headers: '',
        auth_token: '',
        message_template: '',
        auto_reconnect: true
      });
    }
    setErrors({});
  }, [editConfig, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '配置名称不能为空';
    }

    if (!formData.ws_url.trim()) {
      newErrors.ws_url = 'WebSocket URL不能为空';
    } else if (!formData.ws_url.match(/^wss?:\/\/.+/)) {
      newErrors.ws_url = 'WebSocket URL格式不正确，应以ws://或wss://开头';
    }

    if (formData.headers && formData.headers.trim()) {
      try {
        JSON.parse(formData.headers);
      } catch {
        newErrors.headers = '请求头必须是有效的JSON格式';
      }
    }

    if (formData.message_template && formData.message_template.trim() && formData.config_type === 'sender') {
      try {
        JSON.parse(formData.message_template);
      } catch {
        newErrors.message_template = '消息模板必须是有效的JSON格式';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      
      // 清理空字符串字段
      if (!submitData.description?.trim()) delete submitData.description;
      if (!submitData.headers?.trim()) delete submitData.headers;
      if (!submitData.auth_token?.trim()) delete submitData.auth_token;
      if (!submitData.message_template?.trim()) delete submitData.message_template;

      onSave(submitData);
    }
  };

  const handleChange = (field: keyof NewWebSocketConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editConfig ? '编辑WebSocket配置' : '新建WebSocket配置'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配置名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="输入配置名称"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入配置描述"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WebSocket URL *
              </label>
              <input
                type="text"
                value={formData.ws_url}
                onChange={(e) => handleChange('ws_url', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ws_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ws://example.com/websocket 或 wss://example.com/websocket"
              />
              {errors.ws_url && <p className="text-red-500 text-sm mt-1">{errors.ws_url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配置类型 *
              </label>
              <select
                value={formData.config_type}
                onChange={(e) => handleChange('config_type', e.target.value as 'sender' | 'subscriber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sender">消息发送器</option>
                <option value="subscriber">数据订阅器</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                请求头 (JSON格式)
              </label>
              <textarea
                value={formData.headers}
                onChange={(e) => handleChange('headers', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                  errors.headers ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                rows={3}
              />
              {errors.headers && <p className="text-red-500 text-sm mt-1">{errors.headers}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                认证Token
              </label>
              <input
                type="text"
                value={formData.auth_token}
                onChange={(e) => handleChange('auth_token', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入认证Token"
              />
            </div>

            {formData.config_type === 'sender' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  消息模板 (JSON格式)
                </label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => handleChange('message_template', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                    errors.message_template ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='{"type": "message", "data": "{{content}}"}'
                  rows={4}
                />
                {errors.message_template && <p className="text-red-500 text-sm mt-1">{errors.message_template}</p>}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_reconnect"
                checked={formData.auto_reconnect}
                onChange={(e) => handleChange('auto_reconnect', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto_reconnect" className="ml-2 block text-sm text-gray-700">
                自动重连
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editConfig ? '更新配置' : '创建配置'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WebSocketConfigModal;
