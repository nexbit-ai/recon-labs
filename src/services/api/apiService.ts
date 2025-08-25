import { tokenManager } from './tokenManager';
import { API_CONFIG, buildApiUrl, buildAuthUrl, replaceUrlParams, DEBUG_CONFIG } from './config';
import { ApiResponse, ApiError, ApiRequestConfig, RequestConfig } from './types';
import JWTService from '../auth/jwtService';

class ApiService {
  private baseURL: string;
  private authURL: string;
  private requestQueue: Array<() => void> = [];
  private isRefreshing = false;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.authURL = API_CONFIG.AUTH_BASE_URL;
  }

  // Main request method
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { method, url, data, params, ...requestConfig } = config;
    
    // Build full URL
    const fullUrl = this.buildFullUrl(url, params);
    
    // Prepare request configuration
    const requestOptions: RequestInit = {
      method,
      headers: await this.buildHeaders(requestConfig.headers),
      ...requestConfig,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout || API_CONFIG.REQUEST_TIMEOUT);
    requestOptions.signal = controller.signal;

    try {
      // Log request in development
      if (DEBUG_CONFIG.LOG_REQUESTS) {
        console.log(`🚀 API Request: ${method} ${fullUrl}`, { data, params });
      }

      // Make the request with retry logic
      const response = await this.makeRequestWithRetry(fullUrl, requestOptions, requestConfig);
      
      clearTimeout(timeoutId);
      
      // Handle response
      return await this.handleResponse<T>(response);
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  // Retry logic for failed requests
  private async makeRequestWithRetry(
    url: string, 
    options: RequestInit, 
    config: RequestConfig
  ): Promise<Response> {
    const maxAttempts = config.retryAttempts || API_CONFIG.MAX_RETRY_ATTEMPTS;
    const retryDelay = config.retryDelay || API_CONFIG.RETRY_DELAY;
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Don't retry on 4xx errors (except 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return response;
        }
        
        // Retry on 5xx errors and 429
        if (response.status >= 500 || response.status === 429) {
          if (attempt === maxAttempts) {
            return response;
          }
          
          // Wait before retrying
          await this.delay(retryDelay * attempt);
          continue;
        }
        
        return response;
        
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // Wait before retrying
        await this.delay(retryDelay * attempt);
      }
    }
    
    throw lastError!;
  }

  // Build full URL with query parameters
  private buildFullUrl(url: string, params?: Record<string, any>): string {
    let fullUrl = url.startsWith('http') ? url : buildApiUrl(url);
    
    if (params) {
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
      
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    
    return fullUrl;
  }

  // Build headers with authentication
  private async buildHeaders(customHeaders?: Record<string, string>): Promise<HeadersInit> {
    const headers: HeadersInit = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...customHeaders,
    };

    // Get authentication headers (JWT takes priority, falls back to legacy API key + org ID)
    const authHeaders = tokenManager.getApiHeaders();
    Object.assign(headers, authHeaders);

    // Log the authentication method being used
    const authMethod = tokenManager.getAuthMethod();
    if (authMethod === 'jwt') {
    } else if (authMethod === 'legacy') {
      console.log('⚠️ Using legacy API key + organization ID authentication for API request');
    } else {
      console.warn('⚠️ No authentication credentials available for API request');
    }

    return headers;
  }

  // Handle response and parse JSON
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Log response in development
    if (DEBUG_CONFIG.LOG_RESPONSES) {
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);
    }

    // Handle JWT token refresh if needed
    if (response.status === 401) {
      const authMethod = tokenManager.getAuthMethod();
      if (authMethod === 'jwt') {
        console.log('🔐 JWT token expired, attempting to refresh...');
        try {
          const jwtToken = tokenManager.getJWTToken();
          if (jwtToken) {
            const refreshedToken = await JWTService.refreshToken(jwtToken);
            // Update the stored JWT token
            localStorage.setItem('jwt_token', refreshedToken);
            console.log('✅ JWT token refreshed, retrying request...');
            throw new Error('TOKEN_REFRESHED');
          }
        } catch (error) {
          console.error('❌ Failed to refresh JWT token:', error);
        }
      }
    }

    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as any;
    }

    // Check if response is successful
    if (!response.ok) {
      throw this.createApiError(response.status, response.statusText, data);
    }

    return {
      data,
      success: true,
      statusCode: response.status,
    };
  }

  // Handle token refresh
  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        this.requestQueue.push(() => resolve(true));
      });
    }

    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(buildAuthUrl(API_CONFIG.ENDPOINTS.REFRESH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        tokenManager.setTokens(tokens);
        
        // Execute queued requests
        this.requestQueue.forEach(callback => callback());
        this.requestQueue = [];
        
        if (DEBUG_CONFIG.LOG_TOKEN_REFRESH) {
          console.log('🔄 Token refreshed successfully');
        }
        
        return true;
      }
    } catch (error) {
      if (DEBUG_CONFIG.LOG_ERRORS) {
        console.error('❌ Token refresh failed:', error);
      }
    } finally {
      this.isRefreshing = false;
    }

    // Clear tokens on refresh failure
    tokenManager.clearTokens();
    return false;
  }

  // Handle errors
  private handleError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout',
        statusCode: 408,
        error: 'TIMEOUT',
      };
    }

    if (error.message === 'TOKEN_REFRESHED') {
      return {
        message: 'Token refreshed, retry request',
        statusCode: 401,
        error: 'TOKEN_REFRESHED',
      };
    }

    return {
      message: error.message || 'Network error',
      statusCode: 0,
      error: 'NETWORK_ERROR',
      details: error,
    };
  }

  // Create API error
  private createApiError(status: number, statusText: string, data?: any): ApiError {
    return {
      message: data?.message || statusText || 'API Error',
      statusCode: status,
      error: data?.error || 'API_ERROR',
      details: data,
    };
  }

  // Utility method for delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods for HTTP verbs
  async get<T = any>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    });
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  // File upload method
  async upload<T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = await this.buildHeaders();
    const headersObj = headers as Record<string, string>;
    delete headersObj['Content-Type']; // Let browser set content-type for FormData

    const response = await fetch(buildApiUrl(url), {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  // Download file method
  async download(url: string, filename?: string): Promise<void> {
    const headers = await this.buildHeaders();
    
    const response = await fetch(buildApiUrl(url), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw this.createApiError(response.status, response.statusText);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default ApiService; 