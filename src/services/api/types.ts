// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  statusCode?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

// Marketplace Reconciliation Types - Updated to match new API contract
export interface MarketplaceReconciliationResponse {
  grossSales: string;
  ordersDelivered: {
    amount: string;
    number: number;
  };
  ordersReturned: {
    amount: string;
    number: number;
  };
  commission: {
    totalCommission: string;
    commissionRate: string;
  };
  settledSales: string;
  summaryData: {
    totalTransaction: {
      amount: string;
      number: number;
    };
    netSalesAsPerSalesReport: {
      amount: string;
      number: number;
    };
    paymentReceivedAsPerSettlementReport: {
      amount: string;
      number: number;
    };
    totalUnreconciled: {
      amount: string;
      number: number;
      lessPaymentReceivedFromFlipkart: {
        amount: string;
        number: number;
      };
      excessPaymentReceivedFromFlipkart: {
        amount: string;
        number: number;
      };
    };
    totalReconciled: {
      amount: string;
      number: number;
    };
    pendingPaymentFromMarketplace: {
      amount: string;
      number: number;
    };
    pendingDeductions: {
      amount: string;
      number: number;
    };
    returnedOrCancelledOrders: {
      amount: string;
      number: number;
    };
  };
  totalTDS: string;
  totalTDA: string;
  monthOrdersPayoutReceived: string;
  monthOrdersAwaitedSettlement: {
    salesAmount: string;
    salesOrders: number;
  };
  unsettledReturns: {
    returnAmount: string;
    returnsOrders: number;
  };
  difference: string;
  returnRate: string;
  commissionRate: string;
}

// Legacy types - keeping for backward compatibility
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

// Orders API Types
export interface OrderItem {
  order_item_id: string;
  event_type: string;
  event_sub_type: string;
  payment_date: string | null;
  order_date: string;
  item_quantity: number;
  last_month_sales: string;
  next_month_sales: string;
  buyer_invoice_amount: string;
  settlement_value: string;
  marketplace_fee: string;
  taxes: string;
  tds: string;
  tcs: string;
  customer_addons_amount: string;
  total_offer_amount: string;
  seller_share_offer: string;
  offer_adjustments: string;
  diff: string;
  remark: string;
}

export interface CommissionBreakdown {
  marketplace_fee: string;
  tds: string;
  tcs: string;
  taxes: string;
  customer_addons_amount: string;
  total_offer_amount: string;
  seller_share_offer: string;
  offer_adjustments: string;
}

export interface Commission {
  total: string;
  breakdown: CommissionBreakdown;
}

export interface Order {
  order_id: string;
  item_quantity: number;
  last_month_sales: string;
  next_month_sales: string;
  buyer_invoice_amount: string;
  settlement_value: string;
  diff: string;
  remarks: string[];
  commission: Commission;
  order_items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 