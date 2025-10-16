import React, { useState } from 'react';
import { WebSocketConfig, WebSocketStatus } from '../types';

interface WebSocketConfigCardProps {
  config: WebSocketConfig;
  status?: WebSocketStatus;
  onSendMessage?: (configId: string) => void;
  onSubscribe?: (configId: string) => void;
  onEdit?: (config: WebSocketConfig) => void;
  onDelete?: (configId: string) => void;
  onTest?: (config: WebSocketConfig) => void;
}

const WebSocketConfigCard: React.FC<WebSocketConfigCardProps> = ({
  config,
  status,
  onSendMessage,
  onSubscribe,
  onEdit,
  onDelete,
  onTest
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusColor = (configStatus: string) => {
    switch (configStatus) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{config.name}</h3>
            {config.description && (
              <p className="text-sm text-gray-600 mb-2">{config.description}</p>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(config.status)}`}>
            {config.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 w-16">类型:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              config.config_type === 'sender' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {config.config_type === 'sender' ? '消息发送' : '数据订阅'}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 w-16">URL:</span>
            <span className="text-gray-600 truncate">{config.ws_url}</span>
          </div>

          {status && (
            <div className="bg-gray-50 rounded p-3 mt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">连接状态:</span>
                  <span className={`ml-1 ${status.is_connected ? 'text-green-600' : 'text-red-600'}`}>
                    {status.is_connected ? '已连接' : '未连接'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">消息数:</span>
                  <span className="ml-1 text-gray-600">{status.message_count}</span>
                </div>
                {status.connection_time && (
                  <div className="col-span-2">
                    <span className="font-medium">连接时间:</span>
                    <span className="ml-1 text-gray-600">{formatTimestamp(status.connection_time)}</span>
                  </div>
                )}
                {status.error_count > 0 && (
                  <div className="col-span-2">
                    <span className="font-medium text-red-600">错误次数:</span>
                    <span className="ml-1 text-red-600">{status.error_count}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {config.config_type === 'sender' ? (
            <button
              onClick={() => onSendMessage?.(config.id)}
              className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              发送消息
            </button>
          ) : (
            <button
              onClick={() => onSubscribe?.(config.id)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                status?.is_connected
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {status?.is_connected ? '停止订阅' : '开始订阅'}
            </button>
          )}
          
          <button
            onClick={() => onTest?.(config)}
            className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600 transition-colors"
          >
            测试连接
          </button>
          
          <button
            onClick={() => onEdit?.(config)}
            className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            编辑
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-400 transition-colors"
          >
            {isExpanded ? '收起' : '详情'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              {config.headers && (
                <div>
                  <span className="font-medium text-gray-700">请求头:</span>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {config.headers}
                  </pre>
                </div>
              )}
              
              {config.message_template && (
                <div>
                  <span className="font-medium text-gray-700">消息模板:</span>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {config.message_template}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>创建时间: {formatTimestamp(config.created_at)}</span>
                <span>更新时间: {formatTimestamp(config.updated_at)}</span>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => onDelete?.(config.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                >
                  删除配置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketConfigCard;
