import { useState, useEffect, useCallback, useRef } from 'react';
import { api, apiUtils, ApiResponse, ApiError } from './index';

// Hook for making API calls with loading and error states
export const useApiCall = <T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiCall();
      setData(response.data);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    execute();
  }, dependencies);

  return {
    data,
    loading,
    error,
    success,
    execute,
    reset: () => {
      setData(null);
      setLoading(false);
      setError(null);
      setSuccess(false);
    },
  };
};

// Hook for data fetching with automatic refresh
export const useApiData = <T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  refreshInterval?: number,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      setData(response.data);
      return response;
    } catch (err: any) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for paginated data
export const usePaginatedData = <T = any>(
  apiCall: (params: any) => Promise<ApiResponse<T[]>>,
  initialParams: any = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (newParams?: any) => {
    setLoading(true);
    setError(null);

    try {
      const currentParams = { ...params, ...newParams };
      const response = await apiCall(currentParams);
      
      if (response.data) {
        setData(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
      
      setParams(currentParams);
      return response;
    } catch (err: any) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchData({ page: pagination.page + 1 });
    }
  }, [fetchData, pagination]);

  const goToPage = useCallback((page: number) => {
    fetchData({ page });
  }, [fetchData]);

  const updateParams = useCallback((newParams: any) => {
    fetchData({ ...params, ...newParams, page: 1 });
  }, [fetchData, params]);

  return {
    data,
    loading,
    error,
    pagination,
    params,
    fetchData,
    loadMore,
    goToPage,
    updateParams,
  };
};

// Hook for form submission
export const useApiSubmit = <T = any>(
  apiCall: (data: any) => Promise<ApiResponse<T>>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const submit = useCallback(async (formData: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiCall(formData);
      setData(response.data);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    data,
    reset,
  };
};

// Hook for file upload
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    setUploadedFile(null);

    try {
      const response = await api.files.uploadFile(file, (progress) => {
        setProgress(progress);
      });
      
      setUploadedFile(response.data);
      return response;
    } catch (err: any) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return {
    upload,
    uploading,
    progress,
    error,
    uploadedFile,
    reset,
  };
};

// Hook for authentication state
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(apiUtils.isAuthenticated());
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.auth.login(credentials);
      if (response.data.tokens) {
        // Token manager will handle storing tokens
        setIsAuthenticated(true);
        setUser(response.data.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiUtils.logout();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    if (isAuthenticated && !user) {
      setLoading(true);
      try {
        const response = await api.user.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user, logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    loadUser,
  };
};

// Hook for real-time updates (WebSocket or polling)
export const useRealtimeData = <T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 5000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiCall();
      setData(response.data);
      setError(null);
    } catch (err: any) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
    
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}; 