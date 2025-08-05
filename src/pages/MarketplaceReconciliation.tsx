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
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';
import { apiService } from '../services/api/apiService';
import { MarketplaceReconciliationResponse } from '../services/api/types';
import { mockReconciliationData, getSafeReconciliationData, isValidReconciliationData } from '../data/mockReconciliationData';

const MarketplaceReconciliation: React.FC = () => {
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [reconciliationData, setReconciliationData] = useState<MarketplaceReconciliationResponse>(mockReconciliationData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Sync data sources state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago

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

      <Box sx={{ p: { xs: 2, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 4,
              background: 'white',
              borderRadius: '8px',
              p: 4,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  background: '#1a1a1a',
                  borderRadius: '6px',
                  p: 2,
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <StorefrontIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600, 
                    color: '#1a1a1a',
                    letterSpacing: '-0.01em',
                    mb: 1,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    Marketplace Reconciliation
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#666666', 
                    fontWeight: 400,
                    fontSize: '1rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    Financial reconciliation and analytics dashboard
                  </Typography>
                </Box>
              </Box>
              
              {/* Month Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {loading && (
                  <CircularProgress size={24} sx={{ color: '#1a1a1a' }} />
                )}
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="month-select-label">Select Month</InputLabel>
                  <Select
                    labelId="month-select-label"
                    value={selectedMonth}
                    label="Select Month"
                    onChange={(e) => handleMonthChange(e.target.value)}
                    sx={{
                      borderRadius: '6px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d0d0d0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a1a1a',
                      },
                      '& .MuiSelect-select': {
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      },
                    }}
                  >
                    {availableMonths.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sync Data Sources Button */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncDataSources}
                    disabled={syncLoading}
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
                      '&:disabled': {
                        borderColor: '#d0d0d0',
                        color: '#d0d0d0',
                      },
                    }}
                  >
                    {syncLoading ? 'Syncing...' : 'Sync Data'}
                  </Button>
                  
                  {/* Last Synced Text */}
                  <Typography variant="caption" sx={{
                    color: '#666666',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}>
                    <ScheduleIcon sx={{ fontSize: '0.75rem' }} />
                    Last synced: {formatLastSynced(lastSynced)}
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

        {/* Reconciliation Difference */}
        <Card sx={{ 
          mb: 4,
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              textAlign: 'left',
            }}>
              Reconciled Difference
            </Typography>
            
            {/* Simplified Difference Display */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 1,
            }}>
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
                          - Collection: {formatCurrency(parseAmount(reconciliationData.MonthOrdersPayoutReceived))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - Platform Commissions: {formatCurrency(parseAmount(reconciliationData.commission.totalCommission))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - TDS (Tax Deducted): {formatCurrency(parseAmount(reconciliationData.TotalTDS))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - TCS (Tax Collected): {formatCurrency(parseAmount(reconciliationData.TotalTDA))}
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
                    fontWeight: 100,
                    color: parseAmount(reconciliationData.difference) === 0 ? '#155724' : '#d32f2f',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '3.5rem',
                    mb: 1,
                    textAlign: 'center',
                    lineHeight: 1,
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.difference))}
                  </Typography>
                  <Typography variant="h6" sx={{
                    color: parseAmount(reconciliationData.difference) === 0 ? '#155724' : '#d32f2f',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    textAlign: 'center',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {parseAmount(reconciliationData.difference) === 0 ? 'Perfectly Reconciled' : 'Reconciliation Required'}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* Financial Breakdown and Reconciliation Status Charts */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Financial Breakdown Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              height: '100%',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}>
                  Financial Breakdown
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Net Receivable',
                          value: parseAmount(reconciliationData.grossSales) - parseAmount(reconciliationData.commission.totalCommission) - parseAmount(reconciliationData.TotalTDS) - parseAmount(reconciliationData.TotalTDA),
                          color: '#14B8A6',
                          percentage: (((parseAmount(reconciliationData.grossSales) - parseAmount(reconciliationData.commission.totalCommission) - parseAmount(reconciliationData.TotalTDS) - parseAmount(reconciliationData.TotalTDA)) / parseAmount(reconciliationData.grossSales)) * 100).toFixed(1)
                        },
                        {
                          name: 'Commission',
                          value: parseAmount(reconciliationData.commission.totalCommission),
                          color: '#F59E0B',
                          percentage: ((parseAmount(reconciliationData.commission.totalCommission) / parseAmount(reconciliationData.grossSales)) * 100).toFixed(1)
                        },
                        {
                          name: 'TDS',
                          value: parseAmount(reconciliationData.TotalTDS),
                          color: '#EF4444',
                          percentage: ((parseAmount(reconciliationData.TotalTDS) / parseAmount(reconciliationData.grossSales)) * 100).toFixed(1)
                        },
                        {
                          name: 'TCS',
                          value: parseAmount(reconciliationData.TotalTDA),
                          color: '#3B82F6',
                          percentage: ((parseAmount(reconciliationData.TotalTDA) / parseAmount(reconciliationData.grossSales)) * 100).toFixed(1)
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Net Receivable', value: parseAmount(reconciliationData.grossSales) - parseAmount(reconciliationData.commission.totalCommission) - parseAmount(reconciliationData.TotalTDS) - parseAmount(reconciliationData.TotalTDA), color: '#14B8A6' },
                        { name: 'Commission', value: parseAmount(reconciliationData.commission.totalCommission), color: '#F59E0B' },
                        { name: 'TDS', value: parseAmount(reconciliationData.TotalTDS), color: '#EF4444' },
                        { name: 'TCS', value: parseAmount(reconciliationData.TotalTDA), color: '#3B82F6' }
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
                                Amount: {formatCurrency(data.value)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666666' }}>
                                Percentage: {((data.value / parseAmount(reconciliationData.grossSales)) * 100).toFixed(1)}%
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
                          {value} ({entry.payload && ((entry.payload.value / parseAmount(reconciliationData.grossSales)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Reconciliation Match Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              height: '100%',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}>
                  Reconciliation Status
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                }}>
                  {/* Gauge Chart */}
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Box sx={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: `conic-gradient(
                        ${parseAmount(reconciliationData.difference) === 0 ? '#14B8A6' : '#EF4444'} 0deg,
                        ${parseAmount(reconciliationData.difference) === 0 ? '#14B8A6' : '#EF4444'} ${parseAmount(reconciliationData.difference) === 0 ? 360 : Math.min((1 - (parseAmount(reconciliationData.difference) / parseAmount(reconciliationData.grossSales))) * 360, 360)}deg,
                        #f0f0f0 ${parseAmount(reconciliationData.difference) === 0 ? 360 : Math.min((1 - (parseAmount(reconciliationData.difference) / parseAmount(reconciliationData.grossSales))) * 360, 360)}deg,
                        #f0f0f0 360deg
                      )`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <Box sx={{
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}>
                        <Typography variant="h4" sx={{
                          fontWeight: 700,
                          color: parseAmount(reconciliationData.difference) === 0 ? '#14B8A6' : '#EF4444',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          mb: 1,
                        }}>
                          {parseAmount(reconciliationData.difference) === 0 ? '100%' : `${Math.max(0, 100 - ((parseAmount(reconciliationData.difference) / parseAmount(reconciliationData.grossSales)) * 100)).toFixed(1)}%`}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: '#666666',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                        }}>
                          {parseAmount(reconciliationData.difference) === 0 ? 'Matched' : 'Reconciled'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Status Details */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: parseAmount(reconciliationData.difference) === 0 ? '#14B8A6' : '#EF4444',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 2,
                    }}>
                      {parseAmount(reconciliationData.difference) === 0 ? 'Perfect Match' : 'Reconciliation Required'}
                    </Typography>
                    
                    <Box sx={{
                      p: 2,
                      borderRadius: '6px',
                      background: parseAmount(reconciliationData.difference) === 0 ? '#d4edda' : '#f8d7da',
                      border: parseAmount(reconciliationData.difference) === 0 ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                      mb: 2,
                    }}>
                                              <Typography variant="body2" sx={{
                          color: parseAmount(reconciliationData.difference) === 0 ? '#155724' : '#721c24',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          fontWeight: 600,
                          mb: 1,
                        }}>
                          Difference Amount
                        </Typography>
                      <Typography variant="h6" sx={{
                        color: parseAmount(reconciliationData.difference) === 0 ? '#155724' : '#721c24',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 700,
                      }}>
                        {formatCurrency(parseAmount(reconciliationData.difference))}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{
                      color: '#666666',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.875rem',
                    }}>
                      {parseAmount(reconciliationData.difference) === 0 
                        ? 'All transactions are perfectly reconciled' 
                        : 'Some transactions require attention for reconciliation'
                      }
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Settlement Status Visualization */}
        <Card sx={{ 
          mb: 4,
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}>
              Settlement and Unsettled Summary
            </Typography>
            
            <Grid container spacing={4}>
              {/* Settlement Status Chart */}
              <Grid item xs={12} md={8}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Settled Orders',
                            value: reconciliationData.ordersDelivered.number - reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders,
                            amount: parseAmount(reconciliationData.MonthOrdersPayoutReceived),
                            color: '#14B8A6',
                            type: 'settled'
                          },
                          {
                            name: 'Unsettled Orders',
                            value: reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders,
                            amount: parseAmount(reconciliationData.MonthOrdersAwaitedSettlement.SalesAmount),
                            color: '#F59E0B',
                            type: 'unsettled'
                          },
                          {
                            name: 'Unsettled Returns',
                            value: reconciliationData.unsettledReturns.returnsOrders,
                            amount: parseAmount(reconciliationData.unsettledReturns.returnAmount),
                            color: '#EF4444',
                            type: 'returns'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {[
                          { name: 'Settled Orders', value: reconciliationData.ordersDelivered.number - reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders, color: '#14B8A6' },
                          { name: 'Unsettled Orders', value: reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders, color: '#F59E0B' },
                          { name: 'Unsettled Returns', value: reconciliationData.unsettledReturns.returnsOrders, color: '#EF4444' }
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
                            {value} ({entry.payload && entry.payload.value} orders)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              {/* Settlement Details */}
              <Grid item xs={12} md={4}>
                <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
                  {/* Settled Orders */}
                  <Box sx={{
                    p: 1,
                    borderRadius: '8px',
                    background: '#d4edda',
                    border: '1px solid #c3e6cb',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: '#155724',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                    }}>
                      Settled Orders
                    </Typography>
                    <Typography variant="h4" sx={{
                      fontWeight: 700,
                      color: '#155724',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                    }}>
                      {reconciliationData.ordersDelivered.number - reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#155724',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.MonthOrdersPayoutReceived))}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#155724',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      opacity: 0.8,
                    }}>
                      Payment Received
                    </Typography>
                  </Box>

                  {/* Unsettled Orders */}
                  <Box sx={{
                    p: 1,
                    borderRadius: '8px',
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: '#856404',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                    }}>
                      Unsettled Orders
                    </Typography>
                    <Typography variant="h4" sx={{
                      fontWeight: 700,
                      color: '#856404',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                    }}>
                      {reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#856404',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.MonthOrdersAwaitedSettlement.SalesAmount))}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#856404',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      opacity: 0.8,
                    }}>
                      Awaiting Settlement
                    </Typography>
                  </Box>

                  {/* Unsettled Returns */}
                  <Box sx={{
                    p: 1,
                    borderRadius: '8px',
                    background: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: '#721c24',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                    }}>
                      Unsettled Returns
                    </Typography>
                    <Typography variant="h4" sx={{
                      fontWeight: 700,
                      color: '#721c24',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                    }}>
                      {reconciliationData.unsettledReturns.returnsOrders}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#721c24',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.unsettledReturns.returnAmount))}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#721c24',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      opacity: 0.8,
                    }}>
                      Deduction Pending
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Settlement Summary */}
            <Box sx={{ mt: 4, p: 3, borderRadius: '6px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                mb: 2,
              }}>
                Settlement Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {reconciliationData.ordersDelivered.number}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Settlement Rate
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#14B8A6', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {((reconciliationData.ordersDelivered.number - reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders) / reconciliationData.ordersDelivered.number * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Pending Settlement
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#F59E0B', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {reconciliationData.MonthOrdersAwaitedSettlement.SalesOrders}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Pending Returns
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF4444', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {reconciliationData.unsettledReturns.returnsOrders}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>





        {/* Sales Calculation */}
        <Card sx={{ 
          mb: 4,
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              textAlign: 'left',
            }}>
              Sales Calculation
            </Typography>
            
            {/* Sales Calculation - Boxed Sections with Separations */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
              mt: 1,
            }}>
              {/* Section 1: Order Sales Value */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 180,
                p: 3,
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 2,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Order Sales Value
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#14B8A6',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2.25rem',
                  mb: 1,
                  textAlign: 'center',
                }}>
                  {formatCurrency(parseAmount(reconciliationData.ordersDelivered.amount))}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: '#e9ecef',
                  px: 2,
                  py: 0.5,
                  borderRadius: '12px',
                }}>
                  {reconciliationData.ordersDelivered.number} orders
                </Typography>
              </Box>

              {/* Minus Sign with Background */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#f8f9fa',
                border: '2px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h3" sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                }}>
                  −
                </Typography>
              </Box>

              {/* Section 2: Returns Value */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 180,
                p: 3,
                borderRadius: '8px',
                background: '#fff5f5',
                border: '1px solid #fed7d7',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 2,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Returns Value
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#EF4444',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2.25rem',
                  mb: 1,
                  textAlign: 'center',
                }}>
                  {formatCurrency(parseAmount(reconciliationData.ordersReturned.amount))}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: '#fed7d7',
                  px: 2,
                  py: 0.5,
                  borderRadius: '12px',
                }}>
                  {reconciliationData.ordersReturned.number} returns
                </Typography>
              </Box>

              {/* Equals Sign with Background */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#f8f9fa',
                border: '2px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h3" sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                }}>
                  =
                </Typography>
              </Box>

              {/* Section 3: Gross Sales */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 180,
                p: 3,
                borderRadius: '8px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 2,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Gross Sales
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#3B82F6',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2.25rem',
                  mb: 1,
                  textAlign: 'center',
                }}>
                  {formatCurrency(parseAmount(reconciliationData.grossSales))}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: '#bae6fd',
                  px: 2,
                  py: 0.5,
                  borderRadius: '12px',
                }}>
                  Net Revenue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tax Breakdown */}
        <Card sx={{ 
          mb: 4,
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#1a1a1a',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}>
              Tax Breakdown
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '6px', 
                  background: '#e3f2fd',
                  border: '1px solid #bbdefb',
                  textAlign: 'center',
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#1565c0', 
                    mb: 2,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    TCS (Tax Collected at Source)
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1565c0',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.TotalTDA))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '6px', 
                  background: '#f3e5f5',
                  border: '1px solid #e1bee7',
                  textAlign: 'center',
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#7b1fa2', 
                    mb: 2,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    TDS (Tax Deducted at Source)
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#7b1fa2',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.TotalTDS))}
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