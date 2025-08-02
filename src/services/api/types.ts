// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

// Token Types
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface TokenConfig {
  storageKey: string;
  refreshEndpoint?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number; // seconds before expiry to refresh
}

// Request Types
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  withCredentials?: boolean;
}

export interface ApiRequestConfig extends RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
}

// Marketplace Reconciliation Types
export interface ReconciliationData {
  totalSales: number;
  totalCommission: number;
  totalTDS: number;
  totalTCS: number;
  totalRefunds: number;
  totalReversals: number;
  finalDifference: number;
  totalOrders: number;
  matchedOrders: number;
  mismatchedOrders: number;
  totalDiscrepancyValue: number;
  trends: {
    salesVsSettled: Array<{
      date: string;
      sales: number;
      settled: number;
    }>;
    refundPercentage: Array<{
      date: string;
      percentage: number;
    }>;
    commissionPercentage: Array<{
      date: string;
      percentage: number;
    }>;
    reconciliationMatchTrend: Array<{
      date: string;
      matched: number;
      mismatched: number;
    }>;
  };
}

// API Response for Reconciliation Analytics
export interface ReconciliationAnalyticsResponse {
  totalSales: string;
  totalCommission: string;
  totalTDS: string;
  totalTCS: string;
  totalRefunds: string;
  totalReversals: string;
  finalDifference: string;
  totalOrders: number;
  settledOrders: number;
  unsettledOrders: number;
  disputedOrders: number;
  totalDiscrepancyValue: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

// Common Query Parameters
export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  [key: string]: any;
} 