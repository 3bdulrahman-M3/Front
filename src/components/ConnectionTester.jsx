import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ConnectionTester = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);

    try {
      // Test basic connection
      const response = await fetch(`${API_BASE_URL}health/`);
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({
          success: true,
          message: 'Connection successful!',
          data: data,
          url: `${API_BASE_URL}health/`
        });
      } else {
        setConnectionStatus({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          url: `${API_BASE_URL}health/`
        });
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error.message,
        url: `${API_BASE_URL}health/`
      });
    }

    setTesting(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          {connectionStatus?.success ? (
            <Wifi className="h-5 w-5 mr-2 text-green-500" />
          ) : connectionStatus?.success === false ? (
            <WifiOff className="h-5 w-5 mr-2 text-red-500" />
          ) : (
            <Wifi className="h-5 w-5 mr-2 text-gray-500" />
          )}
          Connection Status
        </h3>
        <button
          onClick={testConnection}
          disabled={testing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{testing ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-600">API Base URL:</span>
          <span className="text-sm text-gray-800 font-mono">{API_BASE_URL}</span>
        </div>
        
        {connectionStatus && (
          <div className={`p-3 rounded-lg ${connectionStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {connectionStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-medium ${connectionStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                {connectionStatus.success ? 'Connected' : 'Connection Failed'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <div><strong>URL:</strong> {connectionStatus.url}</div>
              <div><strong>Message:</strong> {connectionStatus.message}</div>
            </div>
            
            {connectionStatus.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
                  View Response Data
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(connectionStatus.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTester;

