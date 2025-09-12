import React, { useState, useEffect } from 'react';
import { Settings, Monitor, Globe, RefreshCw } from 'lucide-react';

const EnvironmentSwitcher = () => {
  const [currentEnv, setCurrentEnv] = useState('AUTO');
  const [isOpen, setIsOpen] = useState(false);

  const environments = [
    { key: 'AUTO', label: 'Auto Detect', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-gray-500' },
    { key: 'LOCAL', label: 'Local Development', icon: <Monitor className="h-4 w-4" />, color: 'bg-green-500' },
    { key: 'PRODUCTION', label: 'Production', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500' },
  ];

  const getApiUrl = (env) => {
    switch (env) {
      case 'LOCAL':
        return 'http://localhost:8000/api/';
      case 'PRODUCTION':
        return 'https://educational-platform-production.up.railway.app/api/';
      default:
        return 'Auto-detected';
    }
  };

  const handleEnvironmentChange = (env) => {
    setCurrentEnv(env);
    setIsOpen(false);
    
    if (env !== 'AUTO') {
      // Store the preference in localStorage
      localStorage.setItem('api_environment', env);
      
      // Reload the page to apply the new environment
      window.location.reload();
    } else {
      // Remove the preference to use auto-detection
      localStorage.removeItem('api_environment');
      window.location.reload();
    }
  };

  useEffect(() => {
    // Check if there's a saved preference
    const savedEnv = localStorage.getItem('api_environment');
    if (savedEnv) {
      setCurrentEnv(savedEnv);
    }
  }, []);

  const currentEnvInfo = environments.find(env => env.key === currentEnv);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${currentEnvInfo?.color || 'bg-gray-500'} text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90 transition-opacity`}
      >
        {currentEnvInfo?.icon}
        <span className="text-sm font-medium">{currentEnvInfo?.label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-64 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              API Environment
            </div>
          </div>
          
          {environments.map((env) => (
            <button
              key={env.key}
              onClick={() => handleEnvironmentChange(env.key)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                currentEnv === env.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className={`p-1 rounded ${env.color}`}>
                {env.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{env.label}</div>
                <div className="text-xs text-gray-500">{getApiUrl(env.key)}</div>
              </div>
              {currentEnv === env.key && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default EnvironmentSwitcher;

