import React, { useState } from 'react';
import { WebSocketConfig, TestConnectionRequest, TestConnectionResponse } from '../types';

interface WebSocketTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebSocketConfig;
}

const WebSocketTestModal: React.FC<WebSocketTestModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [testMessage, setTestMessage] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      let headers = undefined;
      if (customHeaders.trim()) {
        try {
          headers = JSON.parse(customHeaders);
        } catch (e) {
          setTestResult({
            success: false,
            message: '自定义请求头格式错误，请输入有效的JSON',
            response_time_ms: undefined,
            received_data: undefined
          });
          return;
        }
      }

      const testRequest: TestConnectionRequest = {
        ws_url: config.ws_url,
        headers,
        auth_token: config.auth_token,
        test_message: testMessage.trim() || undefined
      };

      const response = await fetch('/api/websocket/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(data.data);
      } else {
        setTestResult({
          success: false,
          message: data.message || '测试失败',
          response_time_ms: undefined,
          received_data: undefined
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
        response_time_ms: undefined,
        received_data: undefined
      });
    } finally {
      setTesting(false);
    }
  };

  const resetTest = () => {
    setTestResult(null);
    setTestMessage('');
    setCustomHeaders('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              测试WebSocket连接
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">配置信息</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">名称:</span> {config.name}</p>
              <p><span className="font-medium">URL:</span> {config.ws_url}</p>
              <p><span className="font-medium">类型:</span> {config.config_type === 'sender' ? '消息发送' : '数据订阅'}</p>
              {config.auth_token && (
                <p><span className="font-medium">认证:</span> 已配置Token</p>
              )}
            </div>
          </div>

          {!testResult && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试消息 (可选)
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入测试消息，留空则只测试连接..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义请求头 (可选, JSON格式)
                </label>
                <textarea
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder='{"Authorization": "Bearer token"}'
                  rows={3}
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-emerald-800">
                      测试将尝试建立WebSocket连接。如果提供了测试消息，系统会发送该消息并等待响应。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {testResult && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">测试结果</h3>
              <div className={`p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? '连接成功' : '连接失败'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {testResult.message}
                    </p>
                    
                    {testResult.response_time_ms && (
                      <p className="text-sm text-gray-600 mt-2">
                        响应时间: {testResult.response_time_ms}ms
                      </p>
                    )}
                    
                    {testResult.received_data && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">收到的数据:</p>
                        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                          {testResult.received_data}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!testResult ? (
              <>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    testing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {testing ? '测试中...' : '开始测试'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={resetTest}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  重新测试
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  关闭
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTestModal;
