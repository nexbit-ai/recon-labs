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
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';
import { apiService } from '../services/api/apiService';
import { MarketplaceReconciliationResponse } from '../services/api/types';
import { mockReconciliationData, getSafeReconciliationData, isValidReconciliationData } from '../data/mockReconciliationData';

const MarketplaceReconciliation: React.FC = () => {
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [reconciliationData, setReconciliationData] = useState<MarketplaceReconciliationResponse>(mockReconciliationData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

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

  // Get start and end dates for a given month
  const getMonthDateRange = (monthString: string) => {
    const [year, month] = monthString.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0); // Last day of month
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch reconciliation data
  const fetchReconciliationData = async (month: string) => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);
    
    const { startDate, endDate } = getMonthDateRange(month);
    
    try {
      const response = await apiService.get<MarketplaceReconciliationResponse>(
        '/recon/analytics',
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

        {/* Reconciliation Calculation */}
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
              Reconciliation Calculation
            </Typography>
            
            {/* Reconciliation Calculation - Boundaryless Sections */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
              mt: 1,
            }}>
              {/* Section 1: Total Sales Value */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 140,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Total Sales
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.grossSales)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Gross Sales
                </Typography>
              </Box>

              {/* Minus Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2rem',
                alignSelf: 'center',
                mt: 0.5,
              }}>
                −
              </Typography>

              {/* Section 2: Collection Received */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 140,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Collection
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.payoutReceived)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Payout
                </Typography>
              </Box>

              {/* Minus Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2rem',
                alignSelf: 'center',
                mt: 0.5,
              }}>
                −
              </Typography>

              {/* Section 3: TDS */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 140,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  TDS
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.tds)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Tax Deducted
                </Typography>
              </Box>

              {/* Minus Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2rem',
                alignSelf: 'center',
                mt: 0.5,
              }}>
                −
              </Typography>

              {/* Section 4: TCS */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 140,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  TCS
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.tcs)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Tax Collected
                </Typography>
              </Box>

              {/* Minus Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2rem',
                alignSelf: 'center',
                mt: 0.5,
              }}>
                −
              </Typography>

              {/* Section 5: Commissions */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 140,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Commissions
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.commission)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Platform Fees
                </Typography>
              </Box>

              {/* Equals Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2rem',
                alignSelf: 'center',
                mt: 1,
              }}>
                =
              </Typography>

              {/* Section 6: Difference */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 140,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: reconciliationData.difference === 0 ? '#155724' : '#d32f2f',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  Difference
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: reconciliationData.difference === 0 ? '#155724' : '#d32f2f',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(Math.abs(reconciliationData.difference))}
                </Typography>
                <Typography variant="body2" sx={{
                  color: reconciliationData.difference === 0 ? '#155724' : '#d32f2f',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {reconciliationData.difference === 0 ? 'Matched' : 'Reconciliation Required'}
                </Typography>
              </Box>
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
                          value: reconciliationData.netReceivable,
                          color: '#14B8A6',
                          percentage: ((reconciliationData.netReceivable / reconciliationData.grossSales) * 100).toFixed(1)
                        },
                        {
                          name: 'Commission',
                          value: reconciliationData.commission,
                          color: '#F59E0B',
                          percentage: ((reconciliationData.commission / reconciliationData.grossSales) * 100).toFixed(1)
                        },
                        {
                          name: 'TDS',
                          value: reconciliationData.tds,
                          color: '#EF4444',
                          percentage: ((reconciliationData.tds / reconciliationData.grossSales) * 100).toFixed(1)
                        },
                        {
                          name: 'TCS',
                          value: reconciliationData.tcs,
                          color: '#3B82F6',
                          percentage: ((reconciliationData.tcs / reconciliationData.grossSales) * 100).toFixed(1)
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
                        { name: 'Net Receivable', value: reconciliationData.netReceivable, color: '#14B8A6' },
                        { name: 'Commission', value: reconciliationData.commission, color: '#F59E0B' },
                        { name: 'TDS', value: reconciliationData.tds, color: '#EF4444' },
                        { name: 'TCS', value: reconciliationData.tcs, color: '#3B82F6' }
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
                                Percentage: {((data.value / reconciliationData.grossSales) * 100).toFixed(1)}%
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
                          {value} ({entry.payload && ((entry.payload.value / reconciliationData.grossSales) * 100).toFixed(1)}%)
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
                        ${reconciliationData.difference === 0 ? '#14B8A6' : '#EF4444'} 0deg,
                        ${reconciliationData.difference === 0 ? '#14B8A6' : '#EF4444'} ${reconciliationData.difference === 0 ? 360 : Math.min((1 - (reconciliationData.difference / reconciliationData.grossSales)) * 360, 360)}deg,
                        #f0f0f0 ${reconciliationData.difference === 0 ? 360 : Math.min((1 - (reconciliationData.difference / reconciliationData.grossSales)) * 360, 360)}deg,
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
                          color: reconciliationData.difference === 0 ? '#14B8A6' : '#EF4444',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          mb: 1,
                        }}>
                          {reconciliationData.difference === 0 ? '100%' : `${Math.max(0, 100 - ((reconciliationData.difference / reconciliationData.grossSales) * 100)).toFixed(1)}%`}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: '#666666',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                        }}>
                          {reconciliationData.difference === 0 ? 'Matched' : 'Reconciled'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Status Details */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: reconciliationData.difference === 0 ? '#14B8A6' : '#EF4444',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 2,
                    }}>
                      {reconciliationData.difference === 0 ? 'Perfect Match' : 'Reconciliation Required'}
                    </Typography>
                    
                    <Box sx={{
                      p: 2,
                      borderRadius: '6px',
                      background: reconciliationData.difference === 0 ? '#d4edda' : '#f8d7da',
                      border: reconciliationData.difference === 0 ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                      mb: 2,
                    }}>
                      <Typography variant="body2" sx={{
                        color: reconciliationData.difference === 0 ? '#155724' : '#721c24',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 600,
                        mb: 1,
                      }}>
                        Difference Amount
                      </Typography>
                      <Typography variant="h6" sx={{
                        color: reconciliationData.difference === 0 ? '#155724' : '#721c24',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 700,
                      }}>
                        {formatCurrency(Math.abs(reconciliationData.difference))}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{
                      color: '#666666',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.875rem',
                    }}>
                      {reconciliationData.difference === 0 
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
                            value: reconciliationData.ordersDelivered.number - reconciliationData.awaitedSettlement.orders,
                            amount: reconciliationData.payoutReceived,
                            color: '#14B8A6',
                            type: 'settled'
                          },
                          {
                            name: 'Unsettled Orders',
                            value: reconciliationData.awaitedSettlement.orders,
                            amount: reconciliationData.awaitedSettlement.amount,
                            color: '#F59E0B',
                            type: 'unsettled'
                          },
                          {
                            name: 'Unsettled Returns',
                            value: reconciliationData.unsettledReturns.returns,
                            amount: reconciliationData.unsettledReturns.amount,
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
                          { name: 'Settled Orders', value: reconciliationData.ordersDelivered.number - reconciliationData.awaitedSettlement.orders, color: '#14B8A6' },
                          { name: 'Unsettled Orders', value: reconciliationData.awaitedSettlement.orders, color: '#F59E0B' },
                          { name: 'Unsettled Returns', value: reconciliationData.unsettledReturns.returns, color: '#EF4444' }
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
                      {reconciliationData.ordersDelivered.number - reconciliationData.awaitedSettlement.orders}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#155724',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}>
                      {formatCurrency(reconciliationData.payoutReceived)}
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
                      {reconciliationData.awaitedSettlement.orders}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#856404',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}>
                      {formatCurrency(reconciliationData.awaitedSettlement.amount)}
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
                      {reconciliationData.unsettledReturns.returns}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#721c24',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                    }}>
                      {formatCurrency(reconciliationData.unsettledReturns.amount)}
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
                      {((reconciliationData.ordersDelivered.number - reconciliationData.awaitedSettlement.orders) / reconciliationData.ordersDelivered.number * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Pending Settlement
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#F59E0B', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {reconciliationData.awaitedSettlement.orders}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      Pending Returns
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF4444', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {reconciliationData.unsettledReturns.returns}
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
            
            {/* Sales Calculation - Three Boundaryless Sections */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              flexWrap: 'wrap',
              mt: 1,
            }}>
              {/* Section 1: Order Sales Value */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 160,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1.5,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}>
                  Order Sales Value
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2.5rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.ordersDelivered.amount)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}>
                  ({reconciliationData.ordersDelivered.number} orders)
                </Typography>
              </Box>

              {/* Minus Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2.5rem',
                alignSelf: 'center',
                mt: 0.5,
              }}>
                −
              </Typography>

              {/* Section 2: Returns Value */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 160,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1.5,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}>
                  Returns Value
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2.5rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(Math.abs(reconciliationData.ordersReturned.amount))}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}>
                  ({reconciliationData.ordersReturned.number} returns)
                </Typography>
              </Box>

              {/* Equals Sign */}
              <Typography variant="h3" sx={{
                fontWeight: 400,
                color: '#1a1a1a',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '2.5rem',
                alignSelf: 'center',
                mt: 1.5,
              }}>
                =
              </Typography>

              {/* Section 3: Gross Sales */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 160,
              }}>
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  mb: 1.5,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}>
                  Gross Sales
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 100,
                  color: '#1a1a1a',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '2.5rem',
                  mb: 0.5,
                  textAlign: 'center',
                }}>
                  {formatCurrency(reconciliationData.grossSales)}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#666666',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textAlign: 'center',
                  fontSize: '0.875rem',
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
                    {formatCurrency(reconciliationData.tcs)}
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
                    {formatCurrency(reconciliationData.tds)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

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
          <TransactionSheet onBack={() => setShowTransactionSheet(false)} />
        </Box>
      )}
    </Box>
  );
};

export default MarketplaceReconciliation;