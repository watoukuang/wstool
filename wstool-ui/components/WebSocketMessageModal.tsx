import React, { useState } from 'react';
import { WebSocketConfig, SendMessageRequest } from '../types';

interface WebSocketMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebSocketConfig;
  onSend: (request: SendMessageRequest) => void;
}

const WebSocketMessageModal: React.FC<WebSocketMessageModalProps> = ({
  isOpen,
  onClose,
  config,
  onSend
}) => {
  const [message, setMessage] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      let finalMessage = message;
      
      // 如果使用模板且配置了模板
      if (useTemplate && config.message_template) {
        try {
          const template = JSON.parse(config.message_template);
          // 简单的模板替换，将{{content}}替换为实际消息
          const templateStr = JSON.stringify(template).replace(/\{\{content\}\}/g, message);
          finalMessage = templateStr;
        } catch (e) {
          console.error('Template parsing error:', e);
        }
      }

      let headers = undefined;
      if (customHeaders.trim()) {
        try {
          headers = JSON.parse(customHeaders);
        } catch (e) {
          alert('自定义请求头格式错误，请输入有效的JSON');
          return;
        }
      }

      await onSend({
        config_id: config.id,
        message: finalMessage,
        custom_headers: headers
      });

      setMessage('');
      setCustomHeaders('');
      onClose();
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              发送WebSocket消息
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">配置信息</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">名称:</span> {config.name}</p>
              <p><span className="font-medium">URL:</span> {config.ws_url}</p>
              <p><span className="font-medium">状态:</span> 
                <span className={`ml-1 ${config.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {config.status}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {config.message_template && (
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="useTemplate"
                    checked={useTemplate}
                    onChange={(e) => setUseTemplate(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useTemplate" className="ml-2 text-sm font-medium text-gray-700">
                    使用消息模板
                  </label>
                </div>
                
                {useTemplate && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm font-medium text-emerald-900 mb-2">消息模板:</p>
                    <pre className="text-xs text-emerald-800 bg-white p-2 rounded border overflow-x-auto">
                      {config.message_template}
                    </pre>
                    <p className="text-xs text-emerald-700 mt-2">
                      提示: 模板中的 {`{{content}}`} 将被替换为您输入的消息内容
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {useTemplate && config.message_template ? '消息内容 (将替换模板中的{{content}})' : '消息内容'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={useTemplate && config.message_template ? '输入要发送的内容...' : '输入JSON格式的消息...'}
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定义请求头 (可选, JSON格式)
              </label>
              <textarea
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder='{"Authorization": "Bearer token"}'
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    确保WebSocket连接处于活跃状态后再发送消息。如果连接未建立，系统会自动尝试建立连接。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                !message.trim() || sending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {sending ? '发送中...' : '发送消息'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketMessageModal;
