import React, { useState } from 'react';
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
} from '@mui/material';
import {
  StorefrontOutlined as StorefrontIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AssignmentReturn as ReturnsIcon,
  Receipt as ReceiptIcon,
  AccountBalance as TaxIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Error as DisputedIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

// Mock data based on API response structure
const reconciliationData = {
  duration: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  unitsSold: 2847,
  returns: 142,
  orders: {
    settled: 2456,
    unsettled: 391,
  },
  revenue: {
    settledAmount: 4567890.50,
    unsettledAmount: 892340.75,
    disputedAmount: 45670.25,
  },
  totalOfferAmount: 234560.80,
  marketplaceFees: {
    total: 567823.45,
    breakdown: [
      {
        marketplace: 'Flipkart',
        amount: 567823.45,
        logo: 'F', // Will be replaced with actual logo
      }
    ]
  },
  totalTaxPaid: 823456.78,
};

const MarketplaceReconciliation: React.FC = () => {
  const [feesExpanded, setFeesExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    const end = new Date(endDate).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  return (
    <Box sx={{ 
      p: 4, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            borderRadius: '16px',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <StorefrontIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Marketplace Reconciliation
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#64748b', 
              mt: 0.5,
              fontWeight: 500,
            }}>
              Financial reconciliation and analytics dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Duration and Key Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Duration Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            height: '100%',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ fontSize: 24, mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Duration
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                {formatDuration(reconciliationData.duration.startDate, reconciliationData.duration.endDate)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Reconciliation Period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Units Sold */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            height: '100%',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 24, mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Units Sold
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                {reconciliationData.unitsSold.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Units
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Returns */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: 'white',
            height: '100%',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReturnsIcon sx={{ fontSize: 24, mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Returns
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                {reconciliationData.returns.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Return Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Status Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            background: 'white',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1f2937' }}>
                Order Status
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CheckIcon sx={{ fontSize: 32, color: '#059669', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#059669', mb: 0.5 }}>
                    {reconciliationData.orders.settled.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Settled Orders
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <PendingIcon sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#f59e0b', mb: 0.5 }}>
                    {reconciliationData.orders.unsettled.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Unsettled Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            background: 'white',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1f2937' }}>
                Total Offer Amount
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 32, color: '#7c3aed', mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1f2937', mb: 0.5 }}>
                    {formatCurrency(reconciliationData.totalOfferAmount)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Promotional Offers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Center Section */}
      <Card sx={{ 
        mb: 4,
        borderRadius: '24px',
        border: 'none',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        color: 'white',
      }}>
        <CardContent sx={{ p: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>
            Revenue Analytics
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981', mb: 1 }}>
                  {formatCurrency(reconciliationData.revenue.settledAmount)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Settled Revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <PendingIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#f59e0b', mb: 1 }}>
                  {formatCurrency(reconciliationData.revenue.unsettledAmount)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Unsettled Revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <DisputedIcon sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#ef4444', mb: 1 }}>
                  {formatCurrency(reconciliationData.revenue.disputedAmount)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Disputed Amount
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bottom Row - Fees and Tax */}
      <Grid container spacing={3}>
        {/* Marketplace Fees */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            background: 'white',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                cursor: 'pointer',
              }}
              onClick={() => setFeesExpanded(!feesExpanded)}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  Marketplace Fees
                </Typography>
                {feesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#dc2626', mb: 2 }}>
                {formatCurrency(reconciliationData.marketplaceFees.total)}
              </Typography>
              
              <Collapse in={feesExpanded}>
                <Divider sx={{ mb: 3 }} />
                {reconciliationData.marketplaceFees.breakdown.map((fee, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    py: 2,
                    px: 3,
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    mb: 1,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        bgcolor: '#7c3aed', 
                        width: 32, 
                        height: 32, 
                        fontSize: 14,
                        fontWeight: 700,
                        mr: 2 
                      }}>
                        {fee.logo}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {fee.marketplace}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#dc2626' }}>
                      {formatCurrency(fee.amount)}
                    </Typography>
                  </Box>
                ))}
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Tax Paid */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            background: 'white',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1f2937' }}>
                Total Tax Paid
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TaxIcon sx={{ fontSize: 32, color: '#7c3aed', mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1f2937', mb: 0.5 }}>
                    {formatCurrency(reconciliationData.totalTaxPaid)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Including GST & Other Taxes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketplaceReconciliation;