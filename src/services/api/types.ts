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
  useD2CHeaders?: boolean;
}

export interface ApiRequestConfig extends RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  useD2CHeaders?: boolean;
}

// Marketplace Reconciliation Types - Updated to match new API contract
// New Main Summary API types (v1/recon/main-summary)
export interface MainSummaryFilters {
  status: string;
  platform: string[];
  date_field: string; // invoice_date | settlement_date
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  organization_id?: string;
}

export interface MainSummaryProviderEntry {
  platform: string; // provider code
  total_count: number; // orders count
  total_sale_amount: number; // monetary
  total_comission?: number; // note: spelling per backend
  total_gst_on_comission?: number; // note: spelling per backend
}

export interface MainSummaryResponse {
  filters: MainSummaryFilters;
  summary: {
    total_transactions_amount: number; // monetary amount (per clarification)
    total_transaction_orders: number;
    net_sales_amount: number;
    net_sales_orders: number;
    total_return_amount: number;
    total_return_orders: number;
    total_cancellations_amount: number;
    total_cancellations_orders: number;
    total_reconciled_amount: number;
    total_reconciled_count: number;
    total_unreconciled_amount: number;
    total_unreconciled_count: number;
  };
  // Top-level commission summary for payment providers
  commission?: Array<{
    platform: string; // e.g., 'paytm' | 'payu'
    total_amount_settled: number;
    total_commission: number;
    total_gst_on_commission: number;
  }>;
  Reconcile: {
    providers: {
      paytm?: MainSummaryProviderEntry;
      payU?: MainSummaryProviderEntry;
      flipkart?: MainSummaryProviderEntry;
      cod?: MainSummaryProviderEntry[];
      [key: string]: any;
    };
  };
  UnReconcile: {
    summary: {
      total_difference_amount: number;
      total_orders_count: number;
      total_matched_orders: number;
      total_less_payment_received_orders: number;
      total_less_payment_received_amount: number; // FE to show as negative
      total_more_payment_received_orders: number;
      total_more_payment_received_amount: number;
    };
    providers: {
      paytm?: MainSummaryProviderEntry;
      payU?: MainSummaryProviderEntry;
      flipkart?: MainSummaryProviderEntry;
      cod?: MainSummaryProviderEntry[];
      [key: string]: any;
    };
    reasons: Array<{
      name: string;
      count: number;
      amount: number;
    }>;
  };
}

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
  status: string;
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

// Total Transactions API Types
export interface TransactionColumn {
  key: string;
  title: string;
  type: 'string' | 'currency' | 'date' | 'enum';
  values?: string[]; // For enum type
}

export interface TransactionBreakup {
  marketplace_fee?: number;
  taxes?: number;
  tcs?: number;
  tds?: number;
  shipping_courier?: string;
  settlement_provider?: string;
  recon_status?: string;
  sale_order_status?: string;
  shipping_package_status_code?: string;
}

export interface TransactionRow {
  order_id: string;
  order_value: number;
  settlement_amount: number;
  invoice_date: string;
  settlement_date?: string;
  diff: number;
  recon_status: string;
  platform: string;
  event_type: string;
  event_subtype: string;
  settlement_provider: string;
  metadata?: {
    breakups?: {
      marketplace_fee?: number;
      taxes?: number;
      tcs?: number;
      tds?: number;
    };
  };
  breakups?: TransactionBreakup;
}

export interface TotalTransactionsResponse {
  columns: TransactionColumn[];
  data: TransactionRow[];
  message: string;
  pagination: {
    current_count: number;
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
}

// Ageing Analysis Types
export interface ProviderAgeingDistribution {
  '<=1d': number;
  '2-3d': number;
  '4-7d': number;
  '8-14d': number;
  '15-30d': number;
  '>30d': number;
}

export interface ProviderAgeingData {
  settlement_provider: string;
  averageDaysToSettle: number;
  distribution: ProviderAgeingDistribution;
}

export interface AgeingAnalysisResponse {
  data: {
    providerAgeingData: ProviderAgeingData[];
  };
}

export interface AgeingAnalysisParams {
  platform?: string;
  invoice_date_from: string;
  invoice_date_to: string;
} 