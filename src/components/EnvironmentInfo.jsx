import React, { useState, useEffect } from 'react';
import { ENV_INFO } from '../config/api';
import { Monitor, Globe, Settings } from 'lucide-react';

const EnvironmentInfo = ({ showDetails = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [envInfo, setEnvInfo] = useState(ENV_INFO);

  useEffect(() => {
    // Update environment info when component mounts
    setEnvInfo(ENV_INFO);
  }, []);

  const getEnvironmentColor = () => {
    switch (envInfo.current) {
      case 'LOCAL':
        return 'bg-green-500';
      case 'RAILWAY':
        return 'bg-blue-500';
      case 'NETLIFY':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEnvironmentIcon = () => {
    switch (envInfo.current) {
      case 'LOCAL':
        return <Monitor className="h-4 w-4" />;
      case 'RAILWAY':
      case 'NETLIFY':
        return <Globe className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (!showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`${getEnvironmentColor()} text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all`}
          title={`Environment: ${envInfo.current}`}
        >
          {getEnvironmentIcon()}
        </button>
        
        {isVisible && (
          <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64">
            <div className="text-sm">
              <div className="font-semibold text-gray-800 mb-2">Environment Info</div>
              <div className="space-y-1 text-gray-600">
                <div><span className="font-medium">Mode:</span> {envInfo.current}</div>
                <div><span className="font-medium">Hostname:</span> {envInfo.hostname}</div>
                <div><span className="font-medium">API URL:</span> {envInfo.url}</div>
                <div><span className="font-medium">Dev Mode:</span> {envInfo.isDev ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <Settings className="h-5 w-5 mr-2" />
        Environment Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-600">Current Environment:</span>
            <span className={`px-2 py-1 rounded text-xs text-white ${getEnvironmentColor()}`}>
              {envInfo.current}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-600">Hostname:</span>
            <span className="text-gray-800">{envInfo.hostname}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-600">API Base URL:</span>
            <span className="text-gray-800 text-sm break-all">{envInfo.url}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-600">Development Mode:</span>
            <span className={`px-2 py-1 rounded text-xs ${envInfo.isDev ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {envInfo.isDev ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentInfo;

