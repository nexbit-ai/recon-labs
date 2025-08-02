// Import services
import { apiService } from './apiService';
import { tokenManager } from './tokenManager';
import { API_CONFIG } from './config';
import { api } from './endpoints';

// Import hooks
import { 
  useApiCall, 
  useApiData, 
  useApiSubmit, 
  usePaginatedData, 
  useFileUpload, 
  useAuth, 
  useRealtimeData 
} from './hooks';

// Main API service exports
export { default as ApiService, apiService } from './apiService';
export { default as TokenManager, tokenManager } from './tokenManager';
export { API_CONFIG, buildApiUrl, buildAuthUrl, replaceUrlParams } from './config';
export { api } from './endpoints';

// Individual API exports
export { authAPI } from './endpoints';
export { userAPI } from './endpoints';
export { reconciliationAPI } from './endpoints';
export { transactionsAPI } from './endpoints';
export { reportsAPI } from './endpoints';
export { dataSourcesAPI } from './endpoints';
export { aiAPI } from './endpoints';
export { settingsAPI } from './endpoints';
export { fileAPI } from './endpoints';

// Hook exports
export { 
  useApiCall, 
  useApiData, 
  useApiSubmit, 
  usePaginatedData, 
  useFileUpload, 
  useAuth, 
  useRealtimeData 
};

// Type exports
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  AuthTokens,
  TokenConfig,
  RequestConfig,
  ApiRequestConfig,
  ReconciliationData,
  User,
  DateRangeParams,
  PaginationParams,
  FilterParams,
} from './types';

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => tokenManager.isAuthenticated(),
  
  // Get current user token
  getToken: () => tokenManager.getAccessToken(),
  
  // Clear authentication
  logout: () => {
    tokenManager.clearTokens();
    // You can add additional logout logic here
  },

  // Initialize API credentials
  initializeApiCredentials: (apiKey?: string, orgId?: string) => {
    const key = apiKey || API_CONFIG.API_KEY;
    const id = orgId || API_CONFIG.ORG_ID;
    tokenManager.setApiCredentials(key, id);
  },

  // Get API credentials
  getApiCredentials: () => ({
    apiKey: tokenManager.getApiKey(),
    orgId: tokenManager.getOrgId(),
  }),
  
  // Format API error for display
  formatError: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  },
  
  // Build query string from params
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    return searchParams.toString();
  },
  
  // Parse query string to params
  parseQueryString: (queryString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  },
};

// Default export for convenience
export default {
  apiService,
  tokenManager,
  api,
  apiUtils,
  config: API_CONFIG,
}; 