import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import KPICard from '../components/KPICard';
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  ShowChart as ShowChartIcon,
  Undo as UndoIcon,
  Storefront as StorefrontIcon,
  Sync as SyncIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentReturn as AssignmentReturnIcon,
} from '@mui/icons-material';
import { Platform } from '../data/mockData';
import { apiService } from '../services/api/apiService';
import { API_CONFIG } from '../services/api/config';
import { MarketplaceOverviewResponse } from '../services/api/marketplaceApi';

// Mock data for fallback
const mockMarketplaceData: MarketplaceOverviewResponse = {
  kpis: {
    totalSales: "1250000.00",
    totalCommission: "125000.00",
    totalOrders: 1250,
    aov: "1000.00",
    returns: 125
  },
  chartData: {
    sales: [
      { date: "2025-04-01", value: "1146380.47" },
      { date: "2025-04-02", value: "949922.32" },
      { date: "2025-04-03", value: "1234567.89" },
      { date: "2025-04-04", value: "987654.32" },
      { date: "2025-04-05", value: "1111111.11" }
    ],
    shipping: [
      { date: "2025-04-01", value: "500" },
      { date: "2025-04-02", value: "450" },
      { date: "2025-04-03", value: "600" },
      { date: "2025-04-04", value: "480" },
      { date: "2025-04-05", value: "520" }
    ]
  },
  insights: [
    {
      id: "1",
      type: "sales",
      severity: "high",
      title: "Sales Increase",
      description: "Sales increased by 15% compared to last month",
      value: "15%",
      trend: "up",
      icon: "trending_up"
    }
  ],
  topProducts: [
    {
      id: "1",
      name: "Product A",
      sku: "SKU001",
      revenue: "250000.00",
      unitsSold: 250,
      growth: "12%",
      platform: "Flipkart"
    },
    {
      id: "2",
      name: "Product B",
      sku: "SKU002",
      revenue: "200000.00",
      unitsSold: 200,
      growth: "8%",
      platform: "Amazon"
    }
  ]
};

// Enhanced mock data for the new sales dashboard
const enhancedMockData = {
  // Enhanced KPIs with growth indicators
  enhancedKPIs: {
    netRevenue: {
      value: 3857600,
      growth: 10,
      trend: 'up',
      label: 'Net Revenue'
    },
    grossRevenue: {
      value: 4030000,
      growth: -8,
      trend: 'down',
      label: 'Gross Revenue'
    },
    returns: {
      value: 172399,
      growth: 10,
      trend: 'up',
      label: 'Returns'
    }
  },
  
  // Monthly data for the 3-line graph (Oct 2024 - Sep 2024)
  monthlyData: [
    { month: 'Oct 2024', gross: 1000000, net: 500000, returns: 0 },
    { month: 'Nov 2024', gross: 1200000, net: 600000, returns: 0 },
    { month: 'Dec 2024', gross: 4000000, net: 2500000, returns: 800000 },
    { month: 'Jan 2024', gross: 3000000, net: 2000000, returns: 1200000 },
    { month: 'Feb 2024', gross: 3500000, net: 2200000, returns: 1200000 },
    { month: 'Mar 2024', gross: 4200000, net: 3200000, returns: 800000 },
    { month: 'Apr 2024', gross: 3800000, net: 2800000, returns: 600000 },
    { month: 'May 2024', gross: 3500000, net: 2200000, returns: 1000000 },
    { month: 'Jun 2024', gross: 4000000, net: 2800000, returns: 800000 },
    { month: 'Jul 2024', gross: 4200000, net: 3000000, returns: 600000 },
    { month: 'Aug 2024', gross: 4400000, net: 3200000, returns: 400000 },
    { month: 'Sep 2024', gross: 4500000, net: 3000000, returns: 200000 }
  ]
};

const iconMap: Record<string, React.ReactNode> = {
  totalRevenue: <AttachMoneyIcon />,
  orders: <ShoppingCartIcon />,
  aov: <ShowChartIcon />,
  returns: <UndoIcon />,
};

const tabs = ['Overview', 'Sales Overview'];

const platforms: { value: Platform; label: string }[] = [
  { value: 'shopify', label: 'Shopify' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'myntra', label: 'Myntra' },
];

const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['flipkart', 'amazon']);
  const [apiData, setApiData] = useState<MarketplaceOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [monthMenuAnchorEl, setMonthMenuAnchorEl] = useState<null | HTMLElement>(null);

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

  // Get start and end dates for a given month
  const getMonthDateRange = (monthString: string) => {
    const [year, month] = monthString.split('-').map(Number);
    
    // Create dates explicitly
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0);       // Last day of month
    
    // Format dates manually to avoid timezone issues
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

  // Fetch data from API with fallback to mock data
  const fetchData = async () => {
    setLoading(true);
    setApiLoading(true);
    setApiError(null);
    setUsingMockData(false);
    
    const { startDate, endDate } = getMonthDateRange(selectedMonth);
    
    try {
      const response = await apiService.get<MarketplaceOverviewResponse>(
        '/recon/stats/sales',
        { start_date: startDate, end_date: endDate },
        {
          headers: {
            'X-API-Key': API_CONFIG.API_KEY,
            'X-Org-ID': API_CONFIG.ORG_ID,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
          retryAttempts: 3
        }
      );

      if (response.success && response.data) {
        console.log("Raw API Response:", response);
        setApiData(response.data);
        setUsingMockData(false);
        setLoading(false);
        setApiLoading(false);
      } else {
        // API succeeded but no data - wait longer before showing mock
        console.log("API succeeded but no data received");
        setApiError('API returned no data, retrying...');
        
        // Wait additional time and retry once more
        setTimeout(async () => {
          try {
            const retryResponse = await apiService.get<MarketplaceOverviewResponse>(
              '/recon/stats/sales',
              { start_date: startDate, end_date: endDate },
              {
                headers: {
                  'X-API-Key': API_CONFIG.API_KEY,
                  'X-Org-ID': API_CONFIG.ORG_ID,
                  'Content-Type': 'application/json'
                },
                timeout: 15000,
                retryAttempts: 1
              }
            );
            
            if (retryResponse.success && retryResponse.data) {
              setApiData(retryResponse.data);
              setUsingMockData(false);
              setApiError(null);
            } else {
              // After retry, still no data - show mock data
              setApiData(mockMarketplaceData);
              setUsingMockData(true);
              setApiError('API returned no data after retry, showing mock data');
            }
          } catch (retryErr) {
            // Retry also failed - show mock data
            setApiData(mockMarketplaceData);
            setUsingMockData(true);
            setApiError('API retry failed, showing mock data');
          } finally {
            setLoading(false);
            setApiLoading(false);
          }
        }, 5000); // Wait 5 seconds before retry
        
        return; // Don't set loading to false yet, wait for retry
      }
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      
      // On first load, wait longer before showing mock data
      if (!apiData) {
        setApiError('API request failed, retrying in 10 seconds...');
        
        setTimeout(async () => {
          try {
            const retryResponse = await apiService.get<MarketplaceOverviewResponse>(
              '/recon/stats/sales',
              { start_date: startDate, end_date: endDate },
              {
                headers: {
                  'X-API-Key': API_CONFIG.API_KEY,
                  'X-Org-ID': API_CONFIG.ORG_ID,
                  'Content-Type': 'application/json'
                },
                timeout: 20000,
                retryAttempts: 2
              }
            );
            
            if (retryResponse.success && retryResponse.data) {
              setApiData(retryResponse.data);
              setUsingMockData(false);
              setApiError(null);
            } else {
              // After retry, still no data - show mock data
              setApiData(mockMarketplaceData);
              setUsingMockData(true);
              setApiError('API failed after retry, showing mock data');
            }
          } catch (retryErr) {
            // Retry also failed - show mock data
            setApiData(mockMarketplaceData);
            setUsingMockData(true);
            setApiError('API retry failed, showing mock data');
          } finally {
            setLoading(false);
            setApiLoading(false);
          }
        }, 10000); // Wait 10 seconds before retry
        
        return; // Don't set loading to false yet, wait for retry
      } else {
        // Not first load, show mock data immediately
        setApiData(mockMarketplaceData);
        setUsingMockData(true);
        setApiError('Network error, showing mock data for demonstration');
        setLoading(false);
        setApiLoading(false);
      }
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedPlatforms]);

  const handleRefreshClick = () => {
    fetchData();
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
  };

  // Helper function to format chart data
  const formatChartData = (data: any[]) => {
    return data?.map(item => ({
      ...item,
      value: parseFloat(item.value) || 0,
      sales: parseFloat(item.sales) || 0,
      revenue: parseFloat(item.revenue) || 0,
    })) || [];
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Helper function to format number
  const formatNumber = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  // Get KPI icon based on title
  const getKpiIcon = (title: string) => {
    switch (title) {
      case 'Total Sales':
        return <TrendingUpIcon />;
      case 'Total Orders':
        return <ShoppingCartIcon />;
      case 'Average Order Value':
        return <AttachMoneyIcon />;
      case 'Returns':
        return <AssignmentReturnIcon />;
      default:
        return <TrendingUpIcon />;
    }
  };

  // Simple fallback data
  const fallbackKPIs = [
    { title: 'Total Sales', value: 1250000},
    { title: 'Total Orders', value: 1250},
    { title: 'Average Order Value', value: 1000},
    { title: 'Returns', value: 125},
  ];

  // Use API data if available, otherwise use fallback
  const kpis = apiData?.kpis ? [
    { title: 'Total Sales', value: parseFloat(apiData.kpis.totalSales)},
    { title: 'Total Orders', value: apiData.kpis.totalOrders},
    { title: 'Average Order Value', value: parseFloat(apiData.kpis.aov)},
    { title: 'Returns', value: apiData.kpis.returns},
  ] : fallbackKPIs;

  // Chart data
  const salesChartData = formatChartData(apiData?.chartData?.sales || []);
  const shippingChartData = formatChartData(apiData?.chartData?.shipping || []);
  const topProducts = apiData?.topProducts || [];



  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ p: 4, minHeight: '100vh', mt: -2 }}>
        {/* Alerts */}
        {apiError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}
        
        {usingMockData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Using mock data for demonstration purposes
          </Alert>
        )}
        
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Finance Dashboard
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
              <Button
              variant="outlined"
              startIcon={apiLoading ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={handleRefreshClick}
              disabled={apiLoading}
                sx={{
                  borderColor: '#6B7280',
                color: '#6B7280',
                  textTransform: 'none',
                  minHeight: 40,
                  px: 2,
                  '&:hover': {
                    borderColor: '#4B5563',
                  backgroundColor: 'rgba(107, 114, 128, 0.04)',
                  },
                }}
              >
              {apiLoading ? 'Loading...' : 'Refresh'}
              </Button>
            
            {/* Month Selector */}
                <Button
                  variant="outlined"
                  endIcon={<KeyboardArrowDownIcon />}
              startIcon={<CalendarTodayIcon />}
              onClick={(event) => setMonthMenuAnchorEl(event.currentTarget)}
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    textTransform: 'none',
                minWidth: 200,
                    minHeight: 40,
                    px: 2,
                fontSize: '1rem',
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
          </Box>
        </Box>

        {/* Tabs */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: '#14B8A6', height: 3 } }}
          >
            {tabs.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          
          {/* Platform selector */}
          <Box>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#e2e8f0',
                color: '#64748b',
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#0ea5e9',
                  color: '#0ea5e9',
                  backgroundColor: 'rgba(14, 165, 233, 0.04)',
                },
              }}
            >
              Platform: Flipkart
            </Button>
          </Box>
        </Box>

        {/* Tab Panels */}
          {activeTab === 0 && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
            {/* KPI Cards */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                {kpis.map((kpi, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <KPICard
                      title={kpi.title}
                      value={kpi.value}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Enhanced Sales Dashboard with 3-Line Graph and KPI Cards */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <Typography variant="h6" mb={3} sx={{ color: '#1f2937', fontWeight: 600 }}>
                Enhanced Sales Dashboard
              </Typography>
              
              {/* Enhanced KPI Cards */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1.5, 
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                  maxWidth: 'fit-content'
                }}>
                  {Object.entries(enhancedMockData.enhancedKPIs).map(([key, kpi]) => (
                    <Paper 
                      key={key}
                      sx={{ 
                        flex: '0 0 auto',
                        width: 140,
                        p: 2, 
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        minHeight: 70
                      }}
                    >
                      {/* KPI Content */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#6b7280', 
                          fontWeight: 500, 
                          mb: 0.5,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {kpi.label}
                      </Typography>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: key === 'grossRevenue' ? '#a79cdb' : 
                                 key === 'netRevenue' ? '#F59E0B ' : '#1f2937',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                          lineHeight: 1.2,
                          mb: 0.5
                        }}
                      >
                        ₹{(kpi.value / 100000).toFixed(1)}L
                      </Typography>
                      
                    </Paper>
                  ))}
                </Box>
                
                {/* Tax note */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#6b7280', 
                    fontStyle: 'italic',
                    mt: 1.5,
                    display: 'block',
                    fontSize: '0.625rem'
                  }}
                >
                  * Amount represented are exclusive of taxes
                </Typography>
              </Box>
              
              {/* Enhanced 3-Line Graph */}
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enhancedMockData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      label={{ 
                        value: 'In Lakhs', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#6b7280' }
                      }}
                      tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`}
                    />
                    
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `₹${(value / 100000).toFixed(1)}L`, 
                        name === 'gross' ? 'Gross Revenue' : 
                        name === 'net' ? 'Net Revenue' : 'Returns'
                      ]}
                      contentStyle={{ 
                        borderRadius: 8, 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    
                    
                    {/* Gross Revenue Line (Purple) */}
                    <Line 
                      type="monotone" 
                      dataKey="gross" 
                      stroke="#a79cdb" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, stroke: '#a79cdb', strokeWidth: 2, fill: '#a79cdb' }}
                      name="gross"
                    />
                    
                    {/* Net Revenue Line (Green) */}
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#F59E0B" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#F59E0B' }}
                      name="net"
                    />
                    
                    {/* Returns Line (Black) */}
                    <Line 
                      type="monotone" 
                      dataKey="returns" 
                      stroke="#1f2937" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, stroke: '#1f2937', strokeWidth: 2, fill: '#1f2937' }}
                      name="returns"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              {/* Graph Labels Below */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 4, 
                mt: 2,
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 3, 
                    backgroundColor: '#a79cdb', 
                    borderRadius: '2px' 
                  }} />
                  <Typography variant="body2" sx={{ color: '#a79cdb', fontWeight: 500, fontSize: '0.875rem' }}>
                    Gross Revenue
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 3, 
                    backgroundColor: '#F59E0B', 
                    borderRadius: '2px' 
                  }} />
                  <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 500, fontSize: '0.875rem' }}>
                    Net Revenue
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 3, 
                    backgroundColor: '#1f2937', 
                    borderRadius: '2px' 
                  }} />
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem' }}>
                    Returns
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Revenue Overview Charts */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <Typography variant="h6" mb={3} sx={{ color: '#0f172a', fontWeight: 600 }}>
                Revenue Overview
              </Typography>
              <Grid container spacing={3}>
                {/* Revenue Pie Chart */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 350 }}>
                    {apiData?.kpis ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { 
                                name: 'Sales Orders', 
                                value: apiData.kpis.totalOrders - apiData.kpis.returns,
                                color: '#a79cdb'
                              },
                              { 
                                name: 'Return Orders', 
                                value: apiData.kpis.returns,
                                color: '#D3C8EC'
                              }
                            ]}
                            cx="50%"
                            cy="50%"
                            stroke="none" 
                            innerRadius={100} 
                            outerRadius={125}
                            paddingAngle={1}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            labelLine={false}
                          >
                            <Cell fill="#a79cdb" />
                            <Cell fill="#D3C8EC" />
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [formatNumber(value), 'Orders']}
                            contentStyle={{ 
                              borderRadius: '8px', 
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No order data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Top 5 SKUs Chart */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 350 }}>
                    {topProducts.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={topProducts.slice(0, 5)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(value) => formatNumber(value)}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value: any) => [formatNumber(value), 'Units Sold']}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e2e8f0'
                            }}
                          />
                          <Bar 
                            dataKey="unitsSold" 
                            fill="#0ea5e9"
                            radius={[4, 4, 0, 0]}
                          >
                            {topProducts.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#0ea5e9', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'][index]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No SKU data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Insights */}
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" mb={2}>
                Insights & Analytics
              </Typography>
              <Grid container spacing={2}>
                {apiData?.insights?.slice(0, 3).map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )) || (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No insights available
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            </motion.div>
          )}

        {activeTab === 1 && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
            {/* KPI Cards moved to Overview tab */}

            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h5" sx={{ mb: 3, color: '#0f172a', fontWeight: 600 }}>
                Product Performance
              </Typography>
              <Typography variant="h6" mb={2}>
                Top SKUs
              </Typography>
              {topProducts.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Revenue</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Units Sold</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Growth</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Platform</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">{formatCurrency(parseFloat(product.revenue))}</TableCell>
                          <TableCell align="right">{formatNumber(product.unitsSold)}</TableCell>
                          <TableCell align="right">{product.growth}</TableCell>
                          <TableCell align="right">{product.platform}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No product data available
                  </Typography>
                </Box>
              )}
            </Paper>
            </motion.div>
          )}
      </Box>
    </motion.div>
  );
};

export default FinanceDashboard; 