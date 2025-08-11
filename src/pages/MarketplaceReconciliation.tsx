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
  CardContent,
  Collapse,
  Divider,
  Avatar,
  Fade,
  Grow,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Fab,
  Collapse as MuiCollapse,
  TablePagination,
  Alert,
  Badge,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
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
  LocalShipping as DeliveryIcon,
  KeyboardReturn as ReturnIcon,
  Payment as PaymentIcon,
  PendingActions as PendingPaymentIcon,
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';
import { apiService } from '../services/api/apiService';
import { MarketplaceReconciliationResponse } from '../services/api/types';
import { mockReconciliationData, getSafeReconciliationData, isValidReconciliationData } from '../data/mockReconciliationData';
import { Platform } from '../data/mockData';

const MarketplaceReconciliation: React.FC = () => {
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [reconciliationData, setReconciliationData] = useState<MarketplaceReconciliationResponse>(mockReconciliationData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'recon' | 'dispute'>('recon');
  const handleMainTabChange = (_: any, value: number) => setActiveMainTab(value === 0 ? 'recon' : 'dispute');

  // Dispute tab states
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: open, 1: raised
  const handleDisputeSubTabChange = (_: any, value: number) => setDisputeSubTab(value);
  const [disputeRows, setDisputeRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }>>([]);
  const [selectedDisputeIds, setSelectedDisputeIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Sync data sources state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
  
  // Month selector menu state
  const [monthMenuAnchorEl, setMonthMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Platform selector state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['flipkart']);
  const [platformMenuAnchorEl, setPlatformMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Available platforms (only Flipkart for now)
  const availablePlatforms = [
    { value: 'flipkart' as Platform, label: 'Flipkart' }
  ];

  // Generate available months (last 12 months)
  const generateAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({
        value: `${year}-${month}`,
        label: monthName
      });
    }
    return months;
  };

  const availableMonths = generateAvailableMonths();

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Helper functions to convert string values to numbers
  const parseAmount = (amount: string): number => {
    return Math.abs(parseFloat(amount) || 0);
  };

  const parsePercentage = (percentage: string): number => {
    return parseFloat(percentage) || 0;
  };

  // Init dispute mock data
  useEffect(() => {
    if (disputeRows.length === 0) {
      const remarks = ['Short Amount Received', 'Excess Amount Received', 'Pending Settlement'];
      const rows: Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }> = [];
      for (let i = 0; i < 12; i++) {
        rows.push({
          id: `DISP_${1000 + i}`,
          orderItemId: `FK${12345 + i}`,
          orderDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
          difference: (i % 2 === 0 ? 1 : -1) * (500 + i * 25),
          remark: remarks[i % remarks.length],
          eventType: i % 3 === 0 ? 'Return' : 'Sale',
          status: i % 3 === 0 ? 'raised' : 'open',
        });
      }
      setDisputeRows(rows);
    }
  }, []);

  // Get start and end dates for a given month
  const getMonthDateRange = (monthString: string) => {
    const [year, month] = monthString.split('-').map(Number);
    // The month value is already 1-indexed (April = 4), so we use it directly
    // JavaScript Date constructor expects 0-indexed months, so we use month-1
    const startDate = new Date(year, month - 1, 1); // First day of month
    // For end date, we want the last day of the current month
    // new Date(year, month, 0) gives the last day of the previous month
    // So we use new Date(year, month, 0) to get the last day of the current month
    const endDate = new Date(year, month, 0); // Last day of month
    
    // Use toLocaleDateString to avoid timezone issues with toISOString()
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  // Dispute helpers
  const currentDisputeRows = disputeRows.filter(r => (disputeSubTab === 0 ? r.status === 'open' : r.status === 'raised'));
  const allSelectedInView = currentDisputeRows.length > 0 && currentDisputeRows.every(r => selectedDisputeIds.includes(r.id));
  const toggleSelectAllInView = () => {
    if (allSelectedInView) {
      setSelectedDisputeIds(prev => prev.filter(id => !currentDisputeRows.some(r => r.id === id)));
    } else {
      setSelectedDisputeIds(prev => Array.from(new Set([...prev, ...currentDisputeRows.map(r => r.id)])));
    }
  };
  const toggleSelectRow = (id: string) => {
    setSelectedDisputeIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const sendSelectedToFlipkart = () => {
    if (selectedDisputeIds.length === 0) return;
    setSnackbarOpen(true);
    setDisputeRows(prev => prev.map(r => (selectedDisputeIds.includes(r.id) ? { ...r, status: 'raised' } : r)));
    setSelectedDisputeIds([]);
  };

  // Sync data sources function
  const handleSyncDataSources = async () => {
    setSyncLoading(true);
    setShowSyncModal(true);
    
    // Simulate API call for 2-3 seconds
    setTimeout(() => {
      setSyncLoading(false);
      setLastSynced(new Date());
      // Close modal after showing success for a moment
      setTimeout(() => {
        setShowSyncModal(false);
      }, 1000);
    }, 2500);
  };

  // Format last synced time
  const formatLastSynced = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Fetch reconciliation data
  const fetchReconciliationData = async (month: string) => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);
    
    const { startDate, endDate } = getMonthDateRange(month);
    
    try {
      const response = await apiService.get<MarketplaceReconciliationResponse>(
        '/recon/fetchStats',
        { start_date: startDate, end_date: endDate }
      );
      
      if (response.success && response.data) {
        // Validate the response data and use mock data if invalid
        const safeData = getSafeReconciliationData(response.data);
        setReconciliationData(safeData);
        
        // Check if we're using mock data
        if (!isValidReconciliationData(response.data)) {
          setUsingMockData(true);
          setError('API response was incomplete, showing mock data for demonstration');
        }
      } else {
        // API call failed, use mock data
        setReconciliationData(mockReconciliationData);
        setUsingMockData(true);
        setError('Failed to fetch data from API, showing mock data');
      }
    } catch (err) {
      console.error('Error fetching reconciliation data:', err);
      // API call failed, use mock data
      setReconciliationData(mockReconciliationData);
      setUsingMockData(true);
      setError('Network error, showing mock data for demonstration');
    } finally {
      setLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    fetchReconciliationData(newMonth);
  };

  // Load initial data
  useEffect(() => {
    fetchReconciliationData(selectedMonth);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#fafafa',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* View Detailed Transactions Button */}
      <Fab
        variant="extended"
        color="primary"
        aria-label="View detailed transactions"
        sx={{
          position: 'fixed',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          background: '#1a1a1a',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            background: '#000000',
            transform: 'translateY(-50%) scale(1.02)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
          },
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          height: 180,
          width: 50,
          borderRadius: '25px',
        }}
        onClick={() => {
          console.log('Button clicked, setting showTransactionSheet to true');
          setShowTransactionSheet(true);
        }}
      >
        <ArrowForwardIcon sx={{ mb: 1, transform: 'rotate(90deg)', color: 'white' }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white', fontSize: '0.75rem' }}>
          View Transactions
        </Typography>
      </Fab>

      <Box sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
              }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#1a1a1a',
                letterSpacing: '-0.01em',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}>
                Reconciliation
              </Typography>
              
              {/* Month Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading && (
                  <CircularProgress size={24} sx={{ color: '#1a1a1a' }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={<CalendarTodayIcon />}
                  onClick={(event) => setMonthMenuAnchorEl(event.currentTarget)}
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    textTransform: 'none',
                    minWidth: 'auto',
                    minHeight: 36,
                    px: 1.5,
                    fontSize: '0.7875rem',
                    '&:hover': {
                      borderColor: '#4B5563',
                      backgroundColor: 'rgba(107, 114, 128, 0.04)',
                    },
                  }}
                >
                  {availableMonths.find(month => month.value === selectedMonth)?.label || 'Select Month'}
                </Button>
                <Menu
                  anchorEl={monthMenuAnchorEl}
                  open={Boolean(monthMenuAnchorEl)}
                  onClose={() => setMonthMenuAnchorEl(null)}
                  MenuListProps={{
                    'aria-labelledby': 'month-select-button',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 280,
                      maxWidth: 320,
                    }
                  }}
                >
                  {availableMonths.map((month) => (
                    <MenuItem
                      key={month.value}
                      onClick={() => {
                        handleMonthChange(month.value);
                        setMonthMenuAnchorEl(null);
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <CalendarTodayIcon sx={{ mr: 2, fontSize: 20, color: '#6B7280' }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {month.label}
                        </Typography>
                        {selectedMonth === month.value && (
                          <Chip 
                            label="Selected" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>

                {/* Platform Selector */}
                <Button
                  variant="outlined"
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={<StorefrontIcon />}
                  onClick={(event) => setPlatformMenuAnchorEl(event.currentTarget)}
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    textTransform: 'none',
                    minWidth: 'auto',
                    minHeight: 36,
                    px: 1.5,
                    fontSize: '0.7875rem',
                    '&:hover': {
                      borderColor: '#4B5563',
                      backgroundColor: 'rgba(107, 114, 128, 0.04)',
                    },
                  }}
                >
                  {selectedPlatforms.length > 0 
                    ? availablePlatforms.find(p => p.value === selectedPlatforms[0])?.label || 'Flipkart'
                    : 'Select Platforms'
                  }
                </Button>
                <Menu
                  anchorEl={platformMenuAnchorEl}
                  open={Boolean(platformMenuAnchorEl)}
                  onClose={() => setPlatformMenuAnchorEl(null)}
                  MenuListProps={{
                    'aria-labelledby': 'platform-select-button',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                    }
                  }}
                >
                  {availablePlatforms.map((platform) => (
                    <MenuItem
                      key={platform.value}
                      onClick={() => {
                        setSelectedPlatforms([platform.value]);
                        setPlatformMenuAnchorEl(null);
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <StorefrontIcon sx={{ mr: 2, fontSize: 20, color: '#6B7280' }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {platform.label}
                        </Typography>
                        {selectedPlatforms.includes(platform.value) && (
                          <Chip 
                            label="Selected" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
                </Box>

                {/* Sync Data Sources Button */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncDataSources}
                    disabled={syncLoading}
                    sx={{
                      mt: 1.5,
                      borderRadius: '6px',
                      borderColor: '#6B7280',
                      color: '#6B7280',
                      textTransform: 'none',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                      minHeight: 36,
                      px: 1.5,
                      fontSize: '0.7875rem',
                      '&:hover': {
                        borderColor: '#4B5563',
                        backgroundColor: 'rgba(107, 114, 128, 0.04)',
                      },
                      '&:disabled': {
                        borderColor: '#d0d0d0',
                        color: '#d0d0d0',
                      },
                    }}
                  >
                    {syncLoading ? 'Syncing...' : 'Sync Data'}
                  </Button>
                  {/* Last Synced Text (below) */}
                  <Typography variant="caption" sx={{
                    color: '#666666',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}>
                    <ScheduleIcon sx={{ fontSize: '0.75rem' }} />
                     synced: {formatLastSynced(lastSynced)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Error Alert */}
            {error && (
              <Alert 
                severity={usingMockData ? "warning" : "error"}
                sx={{ 
                  mb: 3,
                  borderRadius: '6px',
                  background: usingMockData ? '#fff3cd' : '#f8d7da',
                  border: usingMockData ? '1px solid #ffeaa7' : '1px solid #f5c6cb',
                  '& .MuiAlert-message': {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  },
                }}
              >
                {error}
                {usingMockData && (
                  <Box sx={{ mt: 1, p: 2, borderRadius: '4px', background: 'rgba(255, 255, 255, 0.7)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Mock Data Values:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Gross Sales: ₹12,00,000 • Orders Delivered: 480 orders (₹12,30,000) • Returns: 12 orders (-₹30,000)
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={7}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '16px',
              border: '1px solid #f1f3f4',
              boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
              height: '100%',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent sx={{ p: 0, minHeight: 520 }}>
                {/* Title */}
                <Box sx={{ 
                  px: 4, 
                  py: 3,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  borderBottom: '1px solid #f1f3f4'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: '#1f2937',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    Reconciliation Summary
                  </Typography>
                </Box>
                <TableContainer sx={{ px: 4, pb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          background: 'transparent',
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          border: 'none',
                          py: 2
                        }}>
                          Buckets
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          fontWeight: 600, 
                          background: 'transparent',
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          border: 'none',
                          py: 2
                        }}>
                          Count
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          fontWeight: 600, 
                          background: 'transparent',
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          border: 'none',
                          py: 2
                        }}>
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const totalTransactions = (reconciliationData.ordersDelivered?.number || 0) + (reconciliationData.ordersReturned?.number || 0);
                        const totalTransactionsAmount = parseAmount(reconciliationData.summaryData.totalTransaction.amount);
                        const totalTransactionsCount = reconciliationData.summaryData.totalTransaction.number;
                        const netSalesSalesReports = parseAmount(reconciliationData.grossSales);
                        const netSalesSalesReportsCount = reconciliationData.summaryData.netSalesAsPerSalesReport.number;
                        const netSalesSalesReportsAmount = parseAmount(reconciliationData.summaryData.netSalesAsPerSalesReport.amount);
                        const netPaymentReceivedAsPerPaymentAmount = parseAmount(reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.amount);
                        const netPaymentReceivedAsPerPaymentCount = reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number;
                        const pendingPaymentCount = reconciliationData.summaryData?.pendingPaymentFromMarketplace?.number || 0;
                        const pendingPaymentAmount = parseAmount(reconciliationData.summaryData?.pendingPaymentFromMarketplace?.amount || '0');
                        const reconciledOrdersAmount = parseAmount(reconciliationData.summaryData?.totalReconciled?.amount || '0');
                        const reconciledOrdersCount = reconciliationData.summaryData?.totalReconciled?.number || 0;
                        const lessPaymentAmount = parseAmount(reconciliationData.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.amount || '0');
                        const lessPaymentCount = reconciliationData.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.number || 0;
                        const morePaymentAmount = parseAmount(reconciliationData.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.amount || '0');
                        const morePaymentCount = reconciliationData.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.number || 0;
                        const totalUnrecAmount = parseAmount(reconciliationData.summaryData?.totalUnreconciled?.amount || '0');
                        const totalUnrecCount = reconciliationData.summaryData?.totalUnreconciled?.number || 0;
                        const cancelledOrdersCount = reconciliationData.summaryData.returnedOrCancelledOrders.number;
                        const cancelledOrdersAmount = parseAmount(reconciliationData.summaryData?.returnedOrCancelledOrders?.amount || '0');
                        const rows = [
                          { label: 'Total Transactions', count: totalTransactionsCount, amount: totalTransactionsAmount, highlight: false },
                          { label: 'Net Sales as per Sales Reports', count: netSalesSalesReportsCount, amount: netSalesSalesReportsAmount, highlight: false },
                          { label: 'Payment Received as per Payment Report', count: netPaymentReceivedAsPerPaymentCount, amount: netPaymentReceivedAsPerPaymentAmount, highlight: false },
                          { label: 'Total Unreconciled Amount', count: totalUnrecCount, amount: totalUnrecAmount, highlight: false },
                          { label: 'Reconciled Orders', count: reconciledOrdersCount, amount: reconciledOrdersAmount, highlight: false },
                          { label: 'Less Payment Received', count: lessPaymentCount, amount: lessPaymentAmount, highlight: false },
                          { label: 'More Payment Received', count: morePaymentCount, amount: morePaymentAmount, highlight: false },
                          { label: 'Pending Payment', count: pendingPaymentCount, amount: pendingPaymentAmount, highlight: false },
                          { label: 'Cancelled Orders', count: cancelledOrdersCount, amount: cancelledOrdersAmount, highlight: false },
                        ];
                        return rows.map((r, idx) => (
                          <TableRow key={idx} sx={{ 
                            background: r.highlight ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' : 'transparent',
                            borderBottom: idx === rows.length - 1 ? 'none' : '1px solid #f3f4f6',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: r.highlight ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#f9fafb',
                            }
                          }}>
                            <TableCell sx={{ 
                              fontWeight: 500, 
                              color: r.highlight ? 'white' : '#374151',
                              border: 'none',
                              py: 2.5,
                              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                              fontSize: '0.875rem'
                            }}>
                              {r.label}
                            </TableCell>
                            <TableCell align="right" sx={{ 
                              fontWeight: 600, 
                              color: r.highlight ? 'white' : '#1f2937',
                              border: 'none',
                              py: 2.5,
                              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                              fontSize: '0.875rem'
                            }}>
                              {r.count.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell align="right" sx={{ 
                              fontWeight: 600, 
                              color: r.highlight ? 'white' : '#1f2937',
                              border: 'none',
                              py: 2.5,
                              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(r.amount)}
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              mb: 3, 
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '16px',
              border: '1px solid #f1f3f4',
              boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent sx={{ p: 5 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 4, 
                  color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
                  textAlign: 'center',
                  letterSpacing: '-0.025em'
                }}>
                  Reconciled Difference
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                        Reconciliation Calculation:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          Total Sales: {formatCurrency(parseAmount(reconciliationData.grossSales))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - Collection: {formatCurrency(parseAmount(reconciliationData.summaryData?.paymentReceivedAsPerSettlementReport?.amount || '0'))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - Platform Commissions: {formatCurrency(parseAmount(reconciliationData.commission?.totalCommission || '0'))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - TDS (Tax Deducted): {formatCurrency(parseAmount(reconciliationData.totalTDS))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - TCS (Tax Collected): {formatCurrency(parseAmount(reconciliationData.totalTDA))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mt: 1 }}>
                          = Difference: {formatCurrency(parseAmount(reconciliationData.difference))}
                        </Typography>
                      </Box>
                    </Box>
                  }
                arrow
                placement="top"
                enterDelay={1000}
                leaveDelay={0}
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      padding: '12px',
                      maxWidth: 350,
                    },
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(0, 0, 0, 0.9)',
                    },
                  },
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'help',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}>
                  <Typography variant="h2" sx={{
                    fontWeight: 300,
                    color: parseAmount(reconciliationData.difference) === 0 ? '#059669' : '#dc2626',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '3rem',
                    mb: 2,
                    textAlign: 'center',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.difference))}
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: parseAmount(reconciliationData.difference) === 0 ? '#065f46' : '#991b1b',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    textAlign: 'center',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    opacity: 0.8,
                  }}>
                    {parseAmount(reconciliationData.difference) === 0 ? 'Perfectly Reconciled' : 'Reconciliation Required'}
                  </Typography>
                </Box>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            {/* Reconciliation Status */}
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '16px',
              border: '1px solid #f1f3f4',
              boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
              minHeight: 'fit-content',
              maxHeight: '520px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#1f2937',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  letterSpacing: '-0.025em',
                  textAlign: 'center'
                }}>
                  Reconciliation Status
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 3,
                }}>
                  {/* Gauge Chart */}
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                      width: 200,
                      height: 200,
                      borderRadius: '100%',
                      background: `conic-gradient(
                        ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#10b981' : '#ef4444'} 0deg,
                        ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#10b981' : '#ef4444'} ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? 360 : Math.min((1 - (parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) / parseAmount(reconciliationData.grossSales))) * 360, 360)}deg,
                        #f1f5f9 ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? 360 : Math.min((1 - (parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) / parseAmount(reconciliationData.grossSales))) * 360, 360)}deg,
                        #f1f5f9 360deg
                      )`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <Box sx={{
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      }}>
                        <Typography variant="h3" sx={{
                          fontWeight: 500,
                          color: parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#059669' : '#dc2626',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          mb: 0.5,
                          fontSize: '2rem',
                          letterSpacing: '-0.02em'
                        }}>
                          {parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '100%' : `${Math.max(0, 100 - ((parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) / parseAmount(reconciliationData.grossSales)) * 100)).toFixed(1)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Difference Amount Card */}
                    <Box sx={{
                    width: '100%',
                    p: 3,
                    textAlign: 'center',
                    }}>
                                              <Typography variant="body2" sx={{
                        color: '#1f2937',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                          mb: 1,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                        }}>
                          Difference Amount
                        </Typography>
                    <Typography variant="h5" sx={{
                      color: parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#047857' : '#dc2626',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 700,
                      letterSpacing: '-0.02em'
                      }}>
                      {formatCurrency(parseAmount(reconciliationData.summaryData.totalUnreconciled.amount))}
                      </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Settlement Status Visualization */}
        <Card sx={{ 
          mb: 6,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          borderRadius: '16px',
          border: '1px solid #f1f3f4',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          }
        }}>
          <CardContent sx={{ p: 5 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 4, 
              color: '#1f2937',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              letterSpacing: '-0.025em'
            }}>
              Settlement and Unsettled Summary
            </Typography>
            
            <Grid container spacing={3}>
              {/* Settlement Status Chart */}
              <Grid item xs={12} md={8}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Settled Orders',
                            value: reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number,
                            amount: parseAmount(reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.amount),
                            color: '#059669',
                            type: 'settled'
                          },
                          {
                            name: 'Unsettled Orders',
                            value: reconciliationData.summaryData.netSalesAsPerSalesReport.number,
                            amount: parseAmount(reconciliationData.summaryData.netSalesAsPerSalesReport.amount),
                            color: '#F59E0B',
                            type: 'unsettled'
                          },
                          {
                            name: 'cancelled Orders',
                            value: reconciliationData.summaryData.returnedOrCancelledOrders.number,
                            amount: parseAmount(reconciliationData.summaryData.returnedOrCancelledOrders.amount),
                            color: '#EF4444',
                            type: 'returns'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={115}
                        outerRadius={140}
                        paddingAngle={10}
                        cornerRadius={8}
                        dataKey="value"
                      >
                        {[
                          { name: 'Settled Orders', value: reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number, color: '#047857' },
                          { name: 'Unsettled Orders', value: reconciliationData.summaryData.netSalesAsPerSalesReport.number, color: '#F59E0B' },
                          { name: 'cancelled Returns', value: reconciliationData.summaryData.returnedOrCancelledOrders.number, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <Box sx={{
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                p: 2,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                                  {data.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>
                                  Orders: {data.value}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666666' }}>
                                  Amount: {formatCurrency(data.amount)}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: '#1a1a1a', fontSize: '12px', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                            {value} ({entry.payload && entry.payload.value})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              {/* Settlement Details */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Settled Orders */}
                  <Box sx={{
                    position: 'relative',
                    p: 5,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      borderRadius: '20px 20px 0 0',
                    }
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      color: '#6b7280',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem'
                    }}>
                      Settled Orders
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 300,
                      color: '#1f2937',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 2,
                      letterSpacing: '-0.02em'
                    }}>
                      {(reconciliationData.ordersDelivered?.number || 0) - (reconciliationData.monthOrdersAwaitedSettlement?.salesOrders || 0)}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: '#059669',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 600,
                      letterSpacing: '-0.01em'
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.monthOrdersPayoutReceived || '0'))}
                    </Typography>
                  </Box>

                  {/* Unsettled Orders */}
                  <Box sx={{
                    position: 'relative',
                    p: 5,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      borderRadius: '20px 20px 0 0',
                    }
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      color: '#6b7280',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem'
                    }}>
                      Unsettled Orders
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 300,
                      color: '#1f2937',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 2,
                      letterSpacing: '-0.02em'
                    }}>
                      {reconciliationData.monthOrdersAwaitedSettlement?.salesOrders || 0}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: '#d97706',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 600, 
                      letterSpacing: '-0.01em'
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.monthOrdersAwaitedSettlement?.salesAmount || '0'))}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Settlement Summary */}
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={4}>
                {/* Total Orders */}
                <Grid item xs={12} md={4}>
                  <Box sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.4)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      borderRadius: '0 0 20px 20px',
                    }
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#9ca3af', 
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      mb: 2,
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h2" sx={{
                      fontWeight: 200,
                      color: '#1f2937', 
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.03em',
                      fontSize: '2.5rem'
                    }}>
                      {reconciliationData.summaryData.netSalesAsPerSalesReport.number}
                    </Typography>
                  </Box>
                </Grid>

                {/* Settlement Rate */}
                <Grid item xs={12} md={4}>
            <Box sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(187, 247, 208, 0.4)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      borderRadius: '0 0 20px 20px',
                    }
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#065f46', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                  mb: 2,
                      display: 'block',
                  textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                }}>
                      Settlement Rate
                </Typography>
                    <Typography variant="h2" sx={{
                      fontWeight: 200,
                      color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.03em',
                      fontSize: '2.5rem'
                    }}>
                      {((reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number) / (reconciliationData.summaryData.netSalesAsPerSalesReport.number) * 100).toFixed(1)}%
                </Typography>
              </Box>
                </Grid>

                {/* Net Pending Amount */}
                <Grid item xs={12} md={4}>
              <Box sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(253, 230, 138, 0.4)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      borderRadius: '0 0 20px 20px',
                    }
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#92400e', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                  mb: 2,
                      display: 'block',
                  textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                }}>
                      Net Pending Amount
                </Typography>
                    <Typography variant="h5" sx={{
                      fontWeight: 300,
                      color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.02em',
                      fontSize: '1.5rem'
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.summaryData.netSalesAsPerSalesReport.amount) - parseAmount(reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.amount))}
                </Typography>
              </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Tax Breakdown */}
        <Card sx={{ 
          mb: 6,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          borderRadius: '16px',
          border: '1px solid #f1f3f4',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          }
        }}>
          <CardContent sx={{ p: 5 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 4, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #bfdbfe',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#1e40af', 
                    mb: 3,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    TCS (Tax Collected at Source)
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1d4ed8',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.02em'
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.totalTDA))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 4, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  border: '1px solid #e9d5ff',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)',
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#7c2d12', 
                    mb: 3,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    TDS (Tax Deducted at Source)
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#a855f7',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.02em'
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.totalTDS))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Sync Data Sources Modal */}
      <Dialog
        open={showSyncModal}
        onClose={() => !syncLoading && setShowSyncModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid #e0e0e0',
          pb: 2,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudSyncIcon sx={{ color: '#1a1a1a' }} />
            Sync Data Sources
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {syncLoading ? (
            // Loading State
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 4,
              gap: 2 
            }}>
              <CircularProgress size={60} sx={{ color: '#1a1a1a' }} />
              <Typography variant="h6" sx={{
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
              }}>
                Syncing Data Sources...
              </Typography>
              <Typography variant="body2" sx={{
                color: '#666666',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                textAlign: 'center',
                maxWidth: 300,
              }}>
                Please wait while we sync your connected marketplace data sources
              </Typography>
            </Box>
          ) : (
            // Success State
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 4,
              gap: 2 
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#d4edda',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 32, color: '#155724' }} />
              </Box>
              <Typography variant="h6" sx={{
                color: '#155724',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 600,
              }}>
                Sync Completed Successfully!
              </Typography>
              <Typography variant="body2" sx={{
                color: '#666666',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                textAlign: 'center',
                maxWidth: 300,
              }}>
                All connected data sources have been synchronized
              </Typography>
            </Box>
          )}

          {/* Connected Sources List */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              mb: 2,
            }}>
              Connected Data Sources
            </Typography>
            
            <List sx={{ p: 0 }}>
              <ListItem sx={{
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                mb: 1,
              }}>
                <ListItemIcon>
                  <Box
                    component="img"
                    src="https://cdn.worldvectorlogo.com/logos/flipkart.svg"
                    alt="Flipkart"
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain',
                      borderRadius: '4px',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Flipkart"
                  secondary="E-commerce marketplace"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    },
                    '& .MuiListItemText-secondary': {
                      color: '#666666',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    },
                  }}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label="Connected"
                    color="success"
                    size="small"
                    sx={{
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            {/* Add More Sources Button */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<CloudSyncIcon />}
                sx={{
                  borderRadius: '6px',
                  borderColor: '#1a1a1a',
                  color: '#1a1a1a',
                  textTransform: 'none',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    borderColor: '#000000',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Connect More Sources
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid #e0e0e0',
          pt: 2,
          px: 3,
          pb: 3,
        }}>
          <Button
            onClick={() => setShowSyncModal(false)}
            disabled={syncLoading}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              fontWeight: 500,
              px: 3,
              py: 1,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* TransactionSheet Overlay */}
      {showTransactionSheet && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <TransactionSheet 
          onBack={() => setShowTransactionSheet(false)} 
          statsData={reconciliationData}
        />
        </Box>
      )}
    </Box>
  );
};

export default MarketplaceReconciliation;