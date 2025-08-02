# API Service System Documentation

This document describes the comprehensive API service system designed for the Recon Labs application. The system provides a centralized way to handle API calls, token management, and data fetching with React hooks.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Usage Examples](#usage-examples)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Overview

The API service system consists of several key components:

- **ApiService**: Core HTTP client with interceptors and retry logic
- **TokenManager**: Centralized token storage and management
- **API Endpoints**: Type-safe API endpoint definitions
- **React Hooks**: Easy integration with React components
- **Configuration**: Environment-based configuration management

## Architecture

```
src/services/api/
├── index.ts          # Main exports
├── apiService.ts     # Core HTTP client
├── tokenManager.ts   # Token management
├── config.ts         # Configuration
├── types.ts          # TypeScript types
├── endpoints.ts      # API endpoint definitions
├── hooks.ts          # React hooks
└── README.md         # Documentation
```

## Installation & Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH_BASE_URL=http://localhost:3000/auth

# Feature Flags
VITE_ENABLE_AI_RECONCILIATION=true
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_CACHE=true
```

### 2. Basic Usage

```typescript
import { api, apiUtils } from '@/services/api';

// Make API calls
const response = await api.reconciliation.getSummary({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Check authentication
if (apiUtils.isAuthenticated()) {
  // User is logged in
}
```

## Usage Examples

### 1. Basic API Calls

```typescript
import { api } from '@/services/api';

// GET request
const summary = await api.reconciliation.getSummary({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// POST request
const newReport = await api.reports.generateReport({
  type: 'reconciliation',
  dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' }
});

// PUT request
const updatedUser = await api.user.updateProfile({
  name: 'John Doe',
  email: 'john@example.com'
});

// DELETE request
await api.transactions.deleteTransaction('transaction-id');
```

### 2. Using React Hooks

```typescript
import { useApiData, useApiSubmit, useAuth } from '@/services/api/hooks';

function ReconciliationDashboard() {
  // Fetch data with automatic refresh
  const { data, loading, error } = useApiData(
    () => api.reconciliation.getSummary(),
    30000 // Refresh every 30 seconds
  );

  // Form submission
  const { submit, loading: submitting, error: submitError } = useApiSubmit(
    (data) => api.reconciliation.runReconciliation(data)
  );

  // Authentication
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleSubmit = async (formData) => {
    try {
      await submit(formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Reconciliation Summary</h1>
      {/* Render data */}
    </div>
  );
}
```

### 3. Paginated Data

```typescript
import { usePaginatedData } from '@/services/api/hooks';

function TransactionsList() {
  const {
    data: transactions,
    loading,
    error,
    pagination,
    goToPage,
    updateParams
  } = usePaginatedData(
    (params) => api.transactions.getTransactions(params),
    { page: 1, limit: 20 }
  );

  const handlePageChange = (page) => {
    goToPage(page);
  };

  const handleFilter = (filters) => {
    updateParams(filters);
  };

  return (
    <div>
      {/* Render transactions */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

### 4. File Upload

```typescript
import { useFileUpload } from '@/services/api/hooks';

function FileUploader() {
  const { upload, uploading, progress, error, uploadedFile } = useFileUpload();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await upload(file);
        // Handle success
      } catch (error) {
        // Handle error
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <ProgressBar value={progress} />}
      {error && <div>Error: {error}</div>}
      {uploadedFile && <div>Uploaded: {uploadedFile.url}</div>}
    </div>
  );
}
```

### 5. Authentication

```typescript
import { useAuth } from '@/services/api/hooks';

function LoginForm() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      // Redirect or show success message
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## API Reference

### Core Services

#### `apiService`
Main HTTP client with methods:
- `get<T>(url, params?, config?)`
- `post<T>(url, data?, config?)`
- `put<T>(url, data?, config?)`
- `patch<T>(url, data?, config?)`
- `delete<T>(url, config?)`
- `upload<T>(url, file, onProgress?)`
- `download(url, filename?)`

#### `tokenManager`
Token management with methods:
- `setTokens(tokens)`
- `getTokens()`
- `getAccessToken()`
- `isAuthenticated()`
- `clearTokens()`
- `shouldRefreshToken()`

### API Endpoints

#### Authentication
```typescript
api.auth.login(credentials)
api.auth.logout()
api.auth.register(userData)
api.auth.forgotPassword(email)
api.auth.resetPassword(token, password)
```

#### Reconciliation
```typescript
api.reconciliation.getSummary(params?)
api.reconciliation.getDetails(params?)
api.reconciliation.getTrends(params?)
api.reconciliation.exportData(params?)
api.reconciliation.runReconciliation(data)
```

#### Transactions
```typescript
api.transactions.getTransactions(params?)
api.transactions.getTransaction(id)
api.transactions.updateTransaction(id, data)
api.transactions.deleteTransaction(id)
api.transactions.bulkUpdate(ids, data)
```

#### Reports
```typescript
api.reports.getReports(params?)
api.reports.generateReport(config)
api.reports.getReportStatus(reportId)
api.reports.downloadReport(reportId, format)
```

### React Hooks

#### `useApiCall<T>`
Hook for single API calls with loading and error states.

#### `useApiData<T>`
Hook for data fetching with automatic refresh.

#### `usePaginatedData<T>`
Hook for paginated data with built-in pagination controls.

#### `useApiSubmit<T>`
Hook for form submission with loading and success states.

#### `useFileUpload`
Hook for file upload with progress tracking.

#### `useAuth`
Hook for authentication state management.

#### `useRealtimeData<T>`
Hook for real-time data updates via polling.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL | `http://localhost:3000/api` |
| `VITE_AUTH_BASE_URL` | Auth base URL | `http://localhost:3000/auth` |
| `VITE_ENABLE_AI_RECONCILIATION` | Enable AI features | `false` |
| `VITE_ENABLE_REAL_TIME_UPDATES` | Enable real-time updates | `false` |
| `VITE_ENABLE_CACHE` | Enable response caching | `false` |

### API Configuration

```typescript
import { API_CONFIG } from '@/services/api';

// Available configuration options
console.log(API_CONFIG.REQUEST_TIMEOUT); // 30000ms
console.log(API_CONFIG.MAX_RETRY_ATTEMPTS); // 3
console.log(API_CONFIG.DEFAULT_PAGE_SIZE); // 20
```

## Error Handling

The API service provides comprehensive error handling:

### Error Types

```typescript
interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}
```

### Error Handling Examples

```typescript
import { apiUtils } from '@/services/api';

try {
  const response = await api.reconciliation.getSummary();
} catch (error) {
  const errorMessage = apiUtils.formatError(error);
  console.error('API Error:', errorMessage);
  
  // Handle specific error types
  if (error.statusCode === 401) {
    // Handle unauthorized
  } else if (error.statusCode === 404) {
    // Handle not found
  }
}
```

### Global Error Handling

```typescript
// In your app initialization
import { apiService } from '@/services/api';

// Add global error interceptor
apiService.onError((error) => {
  if (error.statusCode === 401) {
    // Redirect to login
    window.location.href = '/login';
  }
});
```

## Best Practices

### 1. Use TypeScript Types

```typescript
import { ReconciliationData, User } from '@/services/api';

// Type-safe API calls
const summary: ReconciliationData = await api.reconciliation.getSummary();
const user: User = await api.user.getProfile();
```

### 2. Use React Hooks for State Management

```typescript
// Good: Use hooks for loading states
const { data, loading, error } = useApiData(() => api.reconciliation.getSummary());

// Avoid: Manual state management
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
```

### 3. Handle Loading and Error States

```typescript
function MyComponent() {
  const { data, loading, error } = useApiData(() => api.someEndpoint.getData());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

### 4. Use Proper Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### 5. Implement Proper Caching

```typescript
// Use React Query or SWR for advanced caching
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data } = useQuery({
    queryKey: ['reconciliation', params],
    queryFn: () => api.reconciliation.getSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 6. Optimize Bundle Size

```typescript
// Import only what you need
import { api } from '@/services/api';
// Instead of
import { apiService, tokenManager, config } from '@/services/api';
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Token Expiry**: The system automatically handles token refresh
3. **Network Errors**: Check your internet connection and API endpoint availability
4. **Type Errors**: Ensure you're using the correct TypeScript types

### Debug Mode

Enable debug logging in development:

```typescript
// Debug configuration is automatically enabled in development
// Check browser console for detailed request/response logs
```

### Performance Monitoring

```typescript
// Monitor API performance
const startTime = performance.now();
const response = await api.someEndpoint.getData();
const duration = performance.now() - startTime;
console.log(`API call took ${duration}ms`);
```

## Contributing

When adding new API endpoints:

1. Add the endpoint to `config.ts`
2. Create the corresponding method in `endpoints.ts`
3. Add TypeScript types in `types.ts`
4. Update this documentation
5. Add tests if applicable

## License

This API service system is part of the Recon Labs application. 