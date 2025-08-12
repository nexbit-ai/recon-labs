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
  const [apiData, setApiData] = useState<MarketplaceOverviewResponse>(mockMarketplaceData);
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
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
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
        setApiData(response.data);
      } else {
        // API call failed, use mock data
        setApiData(mockMarketplaceData);
        setUsingMockData(true);
        setApiError('Failed to fetch data from API, showing mock data');
      }
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      // API call failed, use mock data
      setApiData(mockMarketplaceData);
      setUsingMockData(true);
      setApiError('Network error, showing mock data for demonstration');
    } finally {
      setLoading(false);
      setApiLoading(false);
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
      <Box sx={{ p: 4, minHeight: '100vh' }}>
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

            {/* Sales Over Time Chart */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" mb={2}>
                Sales Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickFormatter={(value) => {
                          const d = new Date(value);
                          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickFormatter={(value) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip formatter={(value: any) => [formatCurrency(value), 'Sales']} labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} contentStyle={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                      <Area type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={2} fill="url(#colorSales)" dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No sales data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Shipping Over Time Chart */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" mb={2}>
                Shipping Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                {shippingChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={shippingChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorShipping" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickFormatter={(value) => {
                          const d = new Date(value);
                          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickFormatter={(value) => formatNumber(value)}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip formatter={(value: any) => [formatNumber(value), 'Shipping']} labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} contentStyle={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                      <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#colorShipping)" dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No shipping data available
                    </Typography>
                  </Box>
                )}
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
                                color: '#0ea5e9'
                              },
                              { 
                                name: 'Return Orders', 
                                value: apiData.kpis.returns,
                                color: '#64748b'
                              }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            labelLine={false}
                          >
                            <Cell fill="#0ea5e9" />
                            <Cell fill="#64748b" />
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [formatNumber(value), 'Orders']}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e2e8f0'
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