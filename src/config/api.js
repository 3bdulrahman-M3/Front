// API Configuration - Smart Auto-Detection
const API_CONFIG = {
  // For local development
  LOCAL: "http://localhost:8000/api/",
  
  // For production
  PRODUCTION: "https://educational-platform-production.up.railway.app/api/",
  
  // For Railway production
  RAILWAY: "https://educational-platform-production.up.railway.app/api/",
  
  // For Netlify production
  NETLIFY: "https://educational-platform-production.up.railway.app/api/",
};

// Smart detection function
const detectEnvironment = () => {
  // Check if there's a manual override in localStorage
  const manualOverride = localStorage.getItem('api_environment');
  if (manualOverride && manualOverride !== 'AUTO') {
    return manualOverride;
  }
  
  // Auto-detection logic
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return "LOCAL";
  }
  
  // Check if we're on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "LOCAL";
  }
  
  // Check if we're on Railway
  if (window.location.hostname.includes('railway')) {
    return "RAILWAY";
  }
  
  // Check if we're on Netlify
  if (window.location.hostname.includes('netlify')) {
    return "NETLIFY";
  }
  
  // Default to production
  return "PRODUCTION";
};

// Get the current environment
const CURRENT_ENV = detectEnvironment();

// Export the API base URL
export const API_BASE_URL = API_CONFIG[CURRENT_ENV];

// Export environment info for debugging
export const ENV_INFO = {
  current: CURRENT_ENV,
  url: API_BASE_URL,
  hostname: window.location.hostname,
  isDev: import.meta.env.DEV
};

export default API_BASE_URL;
