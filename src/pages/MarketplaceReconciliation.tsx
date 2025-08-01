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
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';

// Mock data based on API response structure
const reconciliationData = {
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
  },
  issues: [
    "7 orders with negative settlements",
    "12 refund mismatches", 
    "4 TDS not deducted",
    "4 flagged for manual review"
  ]
};



const MarketplaceReconciliation: React.FC = () => {
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate match percentage
  const matchPercentage = (reconciliationData.matchedOrders / reconciliationData.totalOrders) * 100;
  const mismatchPercentage = (reconciliationData.mismatchedOrders / reconciliationData.totalOrders) * 100;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        rgba(248, 250, 252, 1) 0%, 
        rgba(241, 245, 249, 1) 25%, 
        rgba(226, 232, 240, 1) 50%, 
        rgba(241, 245, 249, 1) 75%, 
        rgba(248, 250, 252, 1) 100%)`,
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none',
      },
      '@keyframes gradientShift': {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
      },
    }}>
      {/* Floating Elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 200,
        height: 200,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        transition: 'transform 0.3s ease',
      }} />
      <Box sx={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: 300,
        height: 300,
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        transition: 'transform 0.3s ease',
      }} />

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
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5855eb 0%, #9333ea 100%)',
            transform: 'translateY(-50%) scale(1.05)',
            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
          },
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          height: 200,
          width: 60,
          borderRadius: '30px',
        }}
        onClick={() => {
          console.log('Button clicked, setting showTransactionSheet to true');
          setShowTransactionSheet(true);
        }}
      >
        <ArrowForwardIcon sx={{ mb: 1, transform: 'rotate(90deg)' }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          View Detailed Transactions
        </Typography>
      </Fab>

      <Box sx={{ p: { xs: 2, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              p: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                borderRadius: '20px',
                p: 2,
                mr: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                },
              }}>
                <StorefrontIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  mb: 1,
                }}>
                  Marketplace Reconciliation
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#64748b', 
                  fontWeight: 500,
                  fontSize: '1.1rem',
                }}>
                  Financial reconciliation and analytics dashboard
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Key Financial Metrics */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grow in timeout={1000}>
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '16px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}>
                      <MonetizationIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Total Sales
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: '#1e293b' }}>
                    {formatCurrency(reconciliationData.totalSales)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Gross Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grow>

          <Grow in timeout={1200}>
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '16px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    }}>
                      <ReceiptIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Total Commission
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: '#1e293b' }}>
                    {formatCurrency(reconciliationData.totalCommission)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Platform Fees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grow>

          <Grow in timeout={1400}>
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '16px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}>
                      <AccountBalanceIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Final Difference
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 900, 
                    mb: 2, 
                    color: reconciliationData.finalDifference === 0 ? '#10b981' : '#ef4444'
                  }}>
                    {formatCurrency(reconciliationData.finalDifference)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {reconciliationData.finalDifference === 0 ? 'Perfect Match' : 'Discrepancy Found'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grow>

          <Grow in timeout={1600}>
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      borderRadius: '16px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    }}>
                      <AssessmentIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Total Orders
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: '#1e293b' }}>
                    {reconciliationData.totalOrders.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Processed Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grow>
        </Grid>

        {/* Tax and Refund Details */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Slide direction="up" in timeout={1600}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
                    Tax Details
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      textAlign: 'center',
                      flex: 1,
                      p: 3,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      mr: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
                      },
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#6366f1', mb: 1 }}>
                        {formatCurrency(reconciliationData.totalTDS)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Total TDS
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      textAlign: 'center',
                      flex: 1,
                      p: 3,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      ml: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 24px rgba(168, 85, 247, 0.15)',
                      },
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#a855f7', mb: 1 }}>
                        {formatCurrency(reconciliationData.totalTCS)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Total TCS
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          <Grid item xs={12} md={6}>
            <Slide direction="up" in timeout={1800}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
                    Refunds & Reversals
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ 
                      textAlign: 'center',
                      flex: 1,
                      p: 3,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      mr: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
                      },
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#ef4444', mb: 1 }}>
                        {formatCurrency(reconciliationData.totalRefunds)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Total Refunds
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      textAlign: 'center',
                      flex: 1,
                      p: 3,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      ml: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
                      },
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#f59e0b', mb: 1 }}>
                        {formatCurrency(reconciliationData.totalReversals)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Total Reversals
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        </Grid>

        {/* Order Reconciliation Status */}
        <Slide direction="up" in timeout={2000}>
          <Card sx={{ 
            mb: 5,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 0%, #ec4899 100%)',
            },
          }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                mb: 5, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Order Reconciliation Status
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 4,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(16, 185, 129, 0.15)',
                    },
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 3 }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#10b981', mb: 2 }}>
                      {reconciliationData.matchedOrders.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                      Matched Orders
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {formatPercentage(matchPercentage)} Match Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 4,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(239, 68, 68, 0.15)',
                    },
                  }}>
                    <ErrorIcon sx={{ fontSize: 48, color: '#ef4444', mb: 3 }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#ef4444', mb: 2 }}>
                      {reconciliationData.mismatchedOrders.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                      Mismatched Orders
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {formatPercentage(mismatchPercentage)} Mismatch Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 4,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(245, 158, 11, 0.15)',
                    },
                  }}>
                    <WarningIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 3 }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#f59e0b', mb: 2 }}>
                      {formatCurrency(reconciliationData.totalDiscrepancyValue)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                      Discrepancy Value
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      Total Variance Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 4,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(99, 102, 241, 0.15)',
                    },
                  }}>
                    <SwapHorizIcon sx={{ fontSize: 48, color: '#6366f1', mb: 3 }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#6366f1', mb: 2 }}>
                      {formatPercentage(matchPercentage)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                      Reconciliation Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      Overall Success Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Slide>

        {/* Issues Needing Attention */}
        <Slide direction="up" in timeout={2200}>
          <Card sx={{ 
            mb: 5,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
            },
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '16px',
                  p: 1.5,
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}>
                  <WarningIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Issues Needing Attention
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {reconciliationData.issues.map((issue, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        '& .MuiAlert-icon': {
                          color: '#f59e0b',
                        },
                        '& .MuiAlert-message': {
                          color: '#1e293b',
                          fontWeight: 600,
                        },
                      }}
                    >
                      {issue}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Slide>

        {/* Trend Charts Placeholder */}
        <Slide direction="up" in timeout={2400}>
          <Card sx={{ 
            mb: 5,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
                Trend Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                      Total Sales vs Total Settled
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Chart placeholder - Sales vs Settled trend
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                      Refund % Over Time
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Chart placeholder - Refund percentage trend
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                      Commission % Over Time
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Chart placeholder - Commission percentage trend
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    textAlign: 'center',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                      Reconciliation Trend
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Chart placeholder - Matched vs mismatched trend
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Slide>
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