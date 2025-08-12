// Environment Configuration
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://43.204.236.42:8080',
  AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL || 'http://43.204.236.42:8080/auth',
  
  // API Keys and Organization ID
  API_KEY: import.meta.env.VITE_API_KEY || 'kapiva-7b485b6a865b2b4a3d728ef2fd4f3',
  ORG_ID: import.meta.env.VITE_ORG_ID || '6ce6ee73-e1ef-4020-ad74-4ee45e731201',
  
  // API Version
  API_VERSION: 'v1',
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  REFRESH_TIMEOUT: 10000, // 10 seconds
  
  // Retry Configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Rate Limiting
  RATE_LIMIT_DELAY: 1000, // 1 second between requests
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    
    // User Management
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    
    // Marketplace Reconciliation
    RECONCILIATION: '/reconciliation',
    RECONCILIATION_SUMMARY: '/reconciliation/summary',
    RECONCILIATION_DETAILS: '/reconciliation/details',
    RECONCILIATION_TRENDS: '/reconciliation/trends',
    RECONCILIATION_EXPORT: '/reconciliation/export',
    RECONCILIATION_UPLOAD: '/recon/upload',
    
    // Transactions
    TRANSACTIONS: '/recon/transactions',
    TRANSACTION_DETAILS: '/recon/transactions/:id',
    TRANSACTION_UPDATE: '/recon/transactions/:id',
    TRANSACTION_DELETE: '/recon/transactions/:id',
    
    // Orders
    ORDERS: '/recon/orders',
    
    // Stats
    FETCH_STATS: '/recon/fetchStats',
    
    // Reports
    REPORTS: '/reports',
    REPORT_GENERATE: '/reports/generate',
    REPORT_DOWNLOAD: '/reports/download',
    
    // Data Sources
    DATA_SOURCES: '/data-sources',
    DATA_SOURCE_CONNECT: '/data-sources/connect',
    DATA_SOURCE_DISCONNECT: '/data-sources/disconnect',
    DATA_SOURCE_SYNC: '/data-sources/sync',
    
    // AI Services
    AI_RECONCILIATION: '/ai/reconciliation',
    AI_WORKFLOWS: '/ai/workflows',
    AI_ASSISTANT: '/ai/assistant',
    
    // Settings
    SETTINGS: '/settings',
    NOTIFICATIONS: '/notifications',
    SECURITY: '/security',
  },
  
  // Feature Flags
  FEATURES: {
    AI_RECONCILIATION: import.meta.env.VITE_ENABLE_AI_RECONCILIATION === 'true',
    REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
    ADVANCED_ANALYTICS: import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS === 'true',
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.csv', '.xlsx', '.xls', '.json'],
  
  // Cache Configuration
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  CACHE_ENABLED: import.meta.env.VITE_ENABLE_CACHE === 'true',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, version?: string): string => {
  const apiVersion = version || API_CONFIG.API_VERSION;
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  return `${baseUrl}/${apiVersion}/${cleanEndpoint}`;
};

// Helper function to build auth URL
export const buildAuthUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.AUTH_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to replace URL parameters
export const replaceUrlParams = (url: string, params: Record<string, string | number>): string => {
  let result = url;
  
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  
  return result;
};

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTest = import.meta.env.MODE === 'test';

// Debug configuration
export const DEBUG_CONFIG = {
  LOG_REQUESTS: isDevelopment,
  LOG_RESPONSES: isDevelopment,
  LOG_ERRORS: true,
  LOG_TOKEN_REFRESH: isDevelopment,
}; 