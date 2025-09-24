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
  TotalTransactionsResponse
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
    apiService.get<MarketplaceReconciliationResponse>(API_CONFIG.ENDPOINTS.FETCH_STATS, params),

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
  // Get transactions list
  getTransactions: (params?: DateRangeParams & PaginationParams & FilterParams) =>
    apiService.get<PaginatedResponse<any>>(API_CONFIG.ENDPOINTS.TRANSACTIONS, params),

  // Get total transactions list with dynamic columns
  getTotalTransactions: (params?: PaginationParams & FilterParams) =>
    apiService.get<TotalTransactionsResponse>(API_CONFIG.ENDPOINTS.TOTAL_TRANSACTIONS, params),

  // Get single transaction
  getTransaction: (id: string) =>
    apiService.get<any>(replaceUrlParams(API_CONFIG.ENDPOINTS.TRANSACTION_DETAILS, { id })),

  // Update transaction
  updateTransaction: (id: string, data: any) =>
    apiService.put<any>(replaceUrlParams(API_CONFIG.ENDPOINTS.TRANSACTION_UPDATE, { id }), data),

  // Delete transaction
  deleteTransaction: (id: string) =>
    apiService.delete(replaceUrlParams(API_CONFIG.ENDPOINTS.TRANSACTION_DELETE, { id })),

  // Bulk operations
  bulkUpdate: (ids: string[], data: any) =>
    apiService.post(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/bulk-update`, { ids, data }),

  bulkDelete: (ids: string[]) =>
    apiService.post(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/bulk-delete`, { ids }),
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
  // Get reconciliation stats
  getStats: (params?: DateRangeParams) =>
    apiService.get<MarketplaceReconciliationResponse>(API_CONFIG.ENDPOINTS.FETCH_STATS, params),
};

// Main Summary API (D2C / Marketplace unified summary)
export const mainSummaryAPI = {
  getMainSummary: (params: { start_date: string; end_date: string; date_field: 'invoice_date' | 'settlement_date' | string; platform?: string; status?: string }) =>
    apiService.get<any>('/recon/main-summary', params),
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

// Export all APIs
export const api = {
  auth: authAPI,
  user: userAPI,
  reconciliation: reconciliationAPI,
  transactions: transactionsAPI,
  orders: ordersAPI,
  stats: statsAPI,
  mainSummary: mainSummaryAPI,
  reports: reportsAPI,
  dataSources: dataSourcesAPI,
  ai: aiAPI,
  settings: settingsAPI,
  files: fileAPI,
};

export default api; 