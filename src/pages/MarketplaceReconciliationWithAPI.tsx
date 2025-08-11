import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Stack,
  Card,
  Collapse as MuiCollapse,
  TablePagination,
  Alert,
  Badge,
  LinearProgress,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  StorefrontOutlined as StorefrontIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AssignmentReturn as ReturnsIcon,
  Receipt as ReceiptIcon,
  AccountBalance as TaxIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Error as DisputedIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MonetizationOn as MonetizationIcon,
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as SwapHorizIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';

// Import the API service system
import { 
  api, 
  apiUtils, 
  useApiData, 
  useApiSubmit, 
  ReconciliationData,
  DateRangeParams 
} from '../services/api';

// Example component using the API service system
const MarketplaceReconciliationWithAPI: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeParams>({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch reconciliation summary data using the API hook
  const { 
    data: reconciliationData, 
    loading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useApiData(
    () => api.reconciliation.getSummary(dateRange),
    30000, // Refresh every 30 seconds
    [dateRange]
  );

  // Fetch reconciliation trends
  const { 
    data: trendsData, 
    loading: trendsLoading, 
    error: trendsError 
  } = useApiData(
    () => api.reconciliation.getTrends(dateRange),
    60000, // Refresh every minute
    [dateRange]
  );

  // Run reconciliation job
  const { 
    submit: runReconciliation, 
    loading: reconciliationRunning, 
    error: reconciliationError,
    success: reconciliationSuccess 
  } = useApiSubmit(
    (data: any) => api.reconciliation.runReconciliation(data)
  );

  // Export data
  const { 
    submit: exportData, 
    loading: exportLoading, 
    error: exportError 
  } = useApiSubmit(
    (params: any) => api.reconciliation.exportData(params)
  );

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRangeParams) => {
    setDateRange(newDateRange);
  };

  // Handle reconciliation run
  const handleRunReconciliation = async () => {
    try {
      await runReconciliation({
        dateRange,
        options: {
          includeRefunds: true,
          includeReversals: true,
          matchThreshold: 0.95
        }
      });
      
      showNotification('Reconciliation job started successfully!', 'success');
      refetchSummary(); // Refresh data after starting reconciliation
    } catch (error) {
      showNotification(apiUtils.formatError(error), 'error');
    }
  };

  // Handle data export
  const handleExportData = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      await exportData({
        ...dateRange,
        format
      });
      showNotification(`Data exported successfully in ${format.toUpperCase()} format!`, 'success');
    } catch (error) {
      showNotification(apiUtils.formatError(error), 'error');
    }
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle transaction selection
  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionSheet(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Loading state
  if (summaryLoading && !reconciliationData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>
          Loading reconciliation data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (summaryError) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={refetchSummary}>
            Retry
          </Button>
        }>
          Failed to load reconciliation data: {summaryError}
        </Alert>
      </Box>
    );
  }

  // Use mock data as fallback if API data is not available
  const data = reconciliationData || {
    totalSales: 1250000,
    totalCommission: 175000,
    totalTDS: 15000,
    totalTCS: 12000,
    totalRefunds: 45000,
    totalReversals: 10000,
    finalDifference: 0,
    totalOrders: 2140,
    matchedOrders: 2110,
    mismatchedOrders: 30,
    totalDiscrepancyValue: 18420,
    trends: {
      salesVsSettled: [
        { date: '2024-01-01', sales: 42000, settled: 41000 },
        { date: '2024-01-02', sales: 45000, settled: 44000 },
        { date: '2024-01-03', sales: 38000, settled: 37500 },
        { date: '2024-01-04', sales: 52000, settled: 51000 },
        { date: '2024-01-05', sales: 48000, settled: 47000 },
      ],
      refundPercentage: [
        { date: '2024-01-01', percentage: 3.2 },
        { date: '2024-01-02', percentage: 2.8 },
        { date: '2024-01-03', percentage: 4.1 },
        { date: '2024-01-04', percentage: 3.5 },
        { date: '2024-01-05', percentage: 2.9 },
      ],
      commissionPercentage: [
        { date: '2024-01-01', percentage: 14.2 },
        { date: '2024-01-02', percentage: 13.8 },
        { date: '2024-01-03', percentage: 14.5 },
        { date: '2024-01-04', percentage: 13.9 },
        { date: '2024-01-05', percentage: 14.1 },
      ],
      reconciliationMatchTrend: [
        { date: '2024-01-01', matched: 95, mismatched: 5 },
        { date: '2024-01-02', matched: 97, mismatched: 3 },
        { date: '2024-01-03', matched: 94, mismatched: 6 },
        { date: '2024-01-04', matched: 96, mismatched: 4 },
        { date: '2024-01-05', matched: 98, mismatched: 2 },
      ]
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with API integration */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Marketplace Reconciliation
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refetchSummary}
            disabled={summaryLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleRunReconciliation}
            disabled={reconciliationRunning}
            startIcon={reconciliationRunning ? <CircularProgress size={16} /> : <AssessmentIcon />}
          >
            {reconciliationRunning ? 'Running...' : 'Run Reconciliation'}
          </Button>
        </Stack>
      </Box>

      {/* Loading indicator for summary */}
      {summaryLoading && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Transaction Sheet */}
      <TransactionSheet
        open={showTransactionSheet}
        onBack={() => setShowTransactionSheet(false)}
        transaction={selectedTransaction}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketplaceReconciliationWithAPI; 