import { apiService } from './apiService';
import { API_CONFIG, replaceUrlParams } from './config';
import { 
  ApiResponse, 
  ReconciliationData, 
  User, 
  DateRangeParams, 
  PaginationParams, 
  FilterParams,
  PaginatedResponse,
  MarketplaceReconciliationResponse,
  TotalTransactionsResponse,
  AgeingAnalysisResponse,
  SalesTransactionsResponse,
  ExportListResponse
} from './types';

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiService.post<{ user: User; tokens: any }>(API_CONFIG.ENDPOINTS.LOGIN, credentials),

  logout: () =>
    apiService.post(API_CONFIG.ENDPOINTS.LOGOUT),

  register: (userData: { email: string; password: string; name: string }) =>
    apiService.post<{ user: User; tokens: any }>(API_CONFIG.ENDPOINTS.REGISTER, userData),

  forgotPassword: (email: string) =>
    apiService.post(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, { email }),

  resetPassword: (token: string, password: string) =>
    apiService.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, { token, password }),

  refreshToken: (refreshToken: string) =>
    apiService.post<{ tokens: any }>(API_CONFIG.ENDPOINTS.REFRESH, { refreshToken }),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiService.get<User>(API_CONFIG.ENDPOINTS.PROFILE),

  updateProfile: (profileData: Partial<User>) =>
    apiService.put<User>(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, profileData),

  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    apiService.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwords),
};

// Marketplace Reconciliation API
export const reconciliationAPI = {
  // Get reconciliation summary
  getSummary: (params?: DateRangeParams) =>
    apiService.get<ReconciliationData>(API_CONFIG.ENDPOINTS.RECONCILIATION_SUMMARY, params),

  // Get detailed reconciliation data
  getDetails: (params?: DateRangeParams & PaginationParams & FilterParams) =>
    apiService.get<PaginatedResponse<any>>(API_CONFIG.ENDPOINTS.RECONCILIATION_DETAILS, params),

  // Get reconciliation trends
  getTrends: (params?: DateRangeParams) =>
    apiService.get<ReconciliationData['trends']>(API_CONFIG.ENDPOINTS.RECONCILIATION_TRENDS, params),

  // Export reconciliation data
  exportData: (params?: DateRangeParams & { format: 'csv' | 'xlsx' | 'pdf' }) =>
    apiService.get(API_CONFIG.ENDPOINTS.RECONCILIATION_EXPORT, params),

  // Upload reconciliation files
  uploadFile: (fileData: { file_name: string; file_type: string; file_size: number; description: string; report_type: string }) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.RECONCILIATION_UPLOAD, fileData),

  // Run reconciliation
  runReconciliation: (data: { dateRange: DateRangeParams; options?: any }) =>
    apiService.post<{ jobId: string; status: string }>(API_CONFIG.ENDPOINTS.RECONCILIATION, data),

  // Get reconciliation status
  getReconciliationStatus: (jobId: string) =>
    apiService.get<{ status: string; progress: number; result?: any }>(
      replaceUrlParams(API_CONFIG.ENDPOINTS.RECONCILIATION, { id: jobId })
    ),
};

// Transactions API
export const transactionsAPI = {
  // Get total transactions list with dynamic columns
  getTotalTransactions: (params?: PaginationParams & FilterParams) =>
    apiService.get<TotalTransactionsResponse>(API_CONFIG.ENDPOINTS.TOTAL_TRANSACTIONS, params),

  // Get D2C transactions with specific parameters
  getD2CTransactions: (params?: { page?: number; limit?: number; recon_status?: string; platform?: string; pagination?: boolean }) =>
    apiService.get<TotalTransactionsResponse>(API_CONFIG.ENDPOINTS.D2C_TRANSACTIONS, params, { useD2CHeaders: true }),

  // Get sales transactions
  getSalesTransactions: (params?: { 
    platform?: string; 
    order_date_from?: string; 
    order_date_to?: string; 
    limit?: number;
    page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    business_mode?: 'B2C' | 'B2B';
  }) =>
    apiService.get<SalesTransactionsResponse>(API_CONFIG.ENDPOINTS.SALES_TRANSACTIONS, params),

  // Request export for transactions
  requestExport: (params?: FilterParams & { order_date_from?: string; order_date_to?: string; platform?: string }) =>
    apiService.request<{ job_id: string; status: string }>({
      method: 'POST',
      url: API_CONFIG.ENDPOINTS.EXPORT_TRANSACTIONS,
      params,
    }),

  // Get export list
  getExportList: (params?: PaginationParams) =>
    apiService.get<ExportListResponse>(API_CONFIG.ENDPOINTS.EXPORT_LIST, params),
};

// Reconciliation manual actions API
export const manualActionsAPI = {
  // Trigger manual action for selected orders on a specific platform
  manualAction: (
    platform: string,
    payload: { order_ids: string[]; note: string; manual_override_status?: string }
  ) =>
    apiService.post<any>(
      `${API_CONFIG.ENDPOINTS.RECON_MANUAL_ACTION}?platform=${encodeURIComponent(platform)}`,
      payload
    ),
};

// Claims API
export const claimsAPI = {
  // Evaluate aged claims
  evaluateAgedClaims: () =>
    apiService.post<{ success: boolean; message: string; data: { newly_eligible_orders: number } }>(
      '/claims/evaluate'
    ),

  markClaimFiled: (orderId: string, payload: { ticket_id: string; platform: string }) =>
    apiService.put<{ success: boolean; message: string }>(
      `/claims/${orderId}/file`,
      payload
    ),
  markBatchFiled: (payload: { reason: string; ticket_id: string; platform: string }) =>
    apiService.put<{ success: boolean; message: string }>(
      `/claims/batches/file`,
      payload
    ),
  getClaimBatches: () =>
    apiService.get<{ success: boolean; data: any[] }>('/claims/batches'),
};

// Orders API
export const ordersAPI = {
  // Get orders list
  getOrders: (params?: DateRangeParams & PaginationParams & FilterParams) =>
    apiService.get<{ orders: any[] }>(API_CONFIG.ENDPOINTS.ORDERS, params),

  // Get single order
  getOrder: (id: string) =>
    apiService.get<any>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`),
};

// Stats API
export const statsAPI = {
  // Deprecated: removed legacy stats API
};

// Main Summary API (D2C / Marketplace unified summary)
export const mainSummaryAPI = {
  getMainSummary: (params: { start_date: string; end_date: string; date_field: 'invoice_date' | 'settlement_date' | string; platform?: string; status?: string }) =>
    apiService.get<any>('/recon/main-summary', params),
};

// Ageing Analysis API
export const ageingAnalysisAPI = {
  getAgeingAnalysis: (params: { platform?: string; invoice_date_from: string; invoice_date_to: string }) =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.AGEING_ANALYSIS, params),
};

// Month on Month Growth API
export const monthOnMonthGrowthAPI = {
  getMonthOnMonthGrowth: (params: { platform: 'amazon' | 'flipkart' | 'd2c' | 'other' | 'amazon_uk'; start_date: string; end_date: string }) =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.MONTH_ON_MONTH_GROWTH, { ...params, date_field: 'settlement_date' }),
};

// Upload List API
export const uploadListAPI = {
  getUploadList: (params: { report_type: string; platform?: string }) =>
    apiService.get<any>('/recon/upload-list', params),
};

// Reports API
export const reportsAPI = {
  // Get reports list
  getReports: (params?: PaginationParams & FilterParams) =>
    apiService.get<PaginatedResponse<any>>(API_CONFIG.ENDPOINTS.REPORTS, params),

  // Generate new report
  generateReport: (config: { type: string; dateRange: DateRangeParams; options?: any }) =>
    apiService.post<{ reportId: string; status: string }>(API_CONFIG.ENDPOINTS.REPORT_GENERATE, config),

  // Get report status
  getReportStatus: (reportId: string) =>
    apiService.get<{ status: string; progress: number; downloadUrl?: string }>(
      replaceUrlParams(API_CONFIG.ENDPOINTS.REPORTS, { id: reportId })
    ),

  // Download report
  downloadReport: (reportId: string, format: 'pdf' | 'csv' | 'xlsx') =>
    apiService.get(
      replaceUrlParams(API_CONFIG.ENDPOINTS.REPORT_DOWNLOAD, { id: reportId }),
      { format }
    ),
};

// Data Sources API
export const dataSourcesAPI = {
  // Get connected data sources
  getDataSources: () =>
    apiService.get<any[]>(API_CONFIG.ENDPOINTS.DATA_SOURCES),

  // Connect new data source
  connectDataSource: (config: { type: string; credentials: any; options?: any }) =>
    apiService.post<{ sourceId: string; status: string }>(API_CONFIG.ENDPOINTS.DATA_SOURCE_CONNECT, config),

  // Disconnect data source
  disconnectDataSource: (sourceId: string) =>
    apiService.post(replaceUrlParams(API_CONFIG.ENDPOINTS.DATA_SOURCE_DISCONNECT, { id: sourceId })),

  // Sync data source
  syncDataSource: (sourceId: string, options?: any) =>
    apiService.post<{ syncId: string; status: string }>(
      replaceUrlParams(API_CONFIG.ENDPOINTS.DATA_SOURCE_SYNC, { id: sourceId }),
      options
    ),

  // Get sync status
  getSyncStatus: (syncId: string) =>
    apiService.get<{ status: string; progress: number; lastSync?: string }>(
      `${API_CONFIG.ENDPOINTS.DATA_SOURCES}/sync/${syncId}`
    ),
};

// AI Services API
export const aiAPI = {
  // AI-powered reconciliation
  runAIReconciliation: (data: { transactions: any[]; rules?: any[] }) =>
    apiService.post<{ jobId: string; status: string }>(API_CONFIG.ENDPOINTS.AI_RECONCILIATION, data),

  // Get AI reconciliation status
  getAIReconciliationStatus: (jobId: string) =>
    apiService.get<{ status: string; progress: number; result?: any }>(
      `${API_CONFIG.ENDPOINTS.AI_RECONCILIATION}/${jobId}`
    ),

  // AI workflows
  getAIWorkflows: () =>
    apiService.get<any[]>(API_CONFIG.ENDPOINTS.AI_WORKFLOWS),

  createAIWorkflow: (workflow: { name: string; steps: any[]; triggers?: any[] }) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.AI_WORKFLOWS, workflow),

  updateAIWorkflow: (workflowId: string, workflow: any) =>
    apiService.put<any>(`${API_CONFIG.ENDPOINTS.AI_WORKFLOWS}/${workflowId}`, workflow),

  deleteAIWorkflow: (workflowId: string) =>
    apiService.delete(`${API_CONFIG.ENDPOINTS.AI_WORKFLOWS}/${workflowId}`),

  // AI Assistant
  chatWithAssistant: (message: string, context?: any) =>
    apiService.post<{ response: string; suggestions?: string[] }>(
      API_CONFIG.ENDPOINTS.AI_ASSISTANT,
      { message, context }
    ),
};

// Settings API
export const settingsAPI = {
  // Get settings
  getSettings: () =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.SETTINGS),

  // Update settings
  updateSettings: (settings: any) =>
    apiService.put<any>(API_CONFIG.ENDPOINTS.SETTINGS, settings),

  // Get notifications
  getNotifications: (params?: PaginationParams) =>
    apiService.get<PaginatedResponse<any>>(API_CONFIG.ENDPOINTS.NOTIFICATIONS, params),

  // Mark notification as read
  markNotificationRead: (notificationId: string) =>
    apiService.post(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`),

  // Get security settings
  getSecuritySettings: () =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.SECURITY),

  // Update security settings
  updateSecuritySettings: (settings: any) =>
    apiService.put<any>(API_CONFIG.ENDPOINTS.SECURITY, settings),
};

// File Upload API
export const fileAPI = {
  // Upload file
  uploadFile: (file: File, onProgress?: (progress: number) => void) =>
    apiService.upload<{ fileId: string; url: string }>('/upload', file, onProgress),

  // Download file
  downloadFile: (fileId: string, filename?: string) =>
    apiService.download(`/files/${fileId}`, filename),
};

// Amazon Auth API
export const amazonAuthAPI = {
  saveConfig: (config: {
    client_id: string;
    client_secret: string;
    marketplace_regions: string[];
  }) =>
    apiService.post<{ message: string }>('/amazon/auth/config', config),

  getStatus: () =>
    apiService.get<{ connected: boolean; client_id?: string; marketplace_regions?: string[] }>(API_CONFIG.ENDPOINTS.AMAZON_STATUS),

  start: (state?: string) =>
    apiService.get<{ authorization_url: string; state: string }>(API_CONFIG.ENDPOINTS.AMAZON_AUTH_START, { state }),
};

// Shopify Auth API
export const shopifyAuthAPI = {
  start: (shop: string) =>
    apiService.get<{ authorization_url: string }>(API_CONFIG.ENDPOINTS.SHOPIFY_AUTH_START, { shop }),

  callback: (shop: string, code: string, state?: string | null) =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.SHOPIFY_AUTH_CALLBACK, { shop, code, state }),

  getStatus: () =>
    apiService.get<{ stores: any[] }>(API_CONFIG.ENDPOINTS.SHOPIFY_STATUS),

  testFetch: (shopDomain: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.SHOPIFY_TEST_FETCH, { shop_domain: shopDomain }),
};

export const razorpayAuthAPI = {
  saveConfig: (keyId: string, keySecret: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.RAZORPAY_CONFIG, { key_id: keyId, key_secret: keySecret }),

  getStatus: () =>
    apiService.get<{ connected: boolean, key_id?: string }>(API_CONFIG.ENDPOINTS.RAZORPAY_STATUS),

  testFetch: (year: string, month: string, day: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.RAZORPAY_TEST_FETCH, { year, month, day }),
};

export const clickpostAuthAPI = {
  saveConfig: (password: string, username: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.CLICKPOST_CONFIG, { password, username }),

  getStatus: () =>
    apiService.get<{ connected: boolean, username?: string }>(API_CONFIG.ENDPOINTS.CLICKPOST_STATUS),

  testFetch: () =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.CLICKPOST_TEST_FETCH, {}),
};

export const payuAuthAPI = {
  saveConfig: (merchant_key: string, merchant_salt: string, client_id: string, client_secret: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.PAYU_CONFIG, { merchant_key, merchant_salt, client_id, client_secret }),

  getStatus: () =>
    apiService.get<{ connected: boolean, merchant_key?: string }>(API_CONFIG.ENDPOINTS.PAYU_STATUS),

  testFetch: () =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.PAYU_TEST_FETCH, {}),
};

export const paytmAuthAPI = {
  saveConfig: (client_id: string, client_secret: string, merchant_id: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.PAYTM_CONFIG, { client_id, client_secret, merchant_id }),

  getStatus: () =>
    apiService.get<{ connected: boolean, merchant_id?: string }>(API_CONFIG.ENDPOINTS.PAYTM_STATUS),

  testFetch: () =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.PAYTM_TEST_FETCH, {}),
};

export const shiprocketAuthAPI = {
  saveConfig: (email: string, password: string) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.SHIPROCKET_CONFIG, { email, password }),

  getStatus: () =>
    apiService.get<{ connected: boolean, email?: string }>(API_CONFIG.ENDPOINTS.SHIPROCKET_STATUS),

  testFetch: () =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.SHIPROCKET_TEST_FETCH, {}),
};

export const unicommerceAuthAPI = {
  saveConfig: (config: { tenant: string, username: string, password: string, client_id?: string }) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.UNICOMMERCE_CONFIG, config),

  getStatus: () =>
    apiService.get<{ connected: boolean, tenant?: string, username?: string }>(API_CONFIG.ENDPOINTS.UNICOMMERCE_STATUS),

  testFetch: () =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.UNICOMMERCE_TEST_FETCH, {}),
};

// Export all APIs


 
// Logistics API
export const logisticsAPI = {
  getLogisticCostDashboard: (params?: {
    provider?: string;
    page?: number;
    limit?: number;
    view?: 'all' | 'mismatch';
    start_date?: string;
    end_date?: string;
    search?: string;
    reason?: string;
  }) =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.LOGISTIC_DELHIVERY_COST, params),

  getRateCardConfig: (params?: {
    provider?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    apiService.get<any>(API_CONFIG.ENDPOINTS.LOGISTIC_RATE_CARD, params),

  updateRateCardConfig: (payload: {
    updates: Array<{ id: string; raw_value: string }>;
  }) => apiService.post<any>(API_CONFIG.ENDPOINTS.LOGISTIC_RATE_CARD_UPDATE, payload),

  uploadMasterWeight: (file: File) =>
    apiService.upload<any>(API_CONFIG.ENDPOINTS.LOGISTIC_MASTER_WEIGHT_UPLOAD, file, undefined),

  recalculate: (params: { provider: string }) =>
    apiService.post<any>(API_CONFIG.ENDPOINTS.LOGISTIC_RECALCULATE, params),
};



export const api = {
  logistics: logisticsAPI,
  auth: authAPI,
  user: userAPI,
  reconciliation: reconciliationAPI,
  transactions: transactionsAPI,
  manualActions: manualActionsAPI,
  claims: claimsAPI,
  orders: ordersAPI,
  stats: statsAPI,
  mainSummary: mainSummaryAPI,
  ageingAnalysis: ageingAnalysisAPI,
  monthOnMonthGrowth: monthOnMonthGrowthAPI,
  uploadList: uploadListAPI,
  reports: reportsAPI,
  dataSources: dataSourcesAPI,
  ai: aiAPI,
  settings: settingsAPI,
  files: fileAPI,
  amazonAuth: amazonAuthAPI,
  shopifyAuth: shopifyAuthAPI,
  razorpayAuth: razorpayAuthAPI,
  clickpostAuth: clickpostAuthAPI,
  payuAuth: payuAuthAPI,
  paytmAuth: paytmAuthAPI,
  shiprocketAuth: shiprocketAuthAPI,
  unicommerceAuth: unicommerceAuthAPI,
};
export default api;
