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
} from '@mui/icons-material';
import { Platform } from '../data/mockData';
import { MarketplaceOverviewResponse } from '../services/api/marketplaceApi';

// Enhanced mock data for demonstration
const mockMarketplaceData: MarketplaceOverviewResponse = {
  kpis: {
    totalSales: "1850000.00",
    totalCommission: "123500.00",
    totalOrders: 756,
    aov: "2447.09",
    returns: 16
  },
  chartData: {
    sales: [
      { date: "2025-04-01", value: "125000.00" },
      { date: "2025-04-02", value: "145000.00" },
      { date: "2025-04-03", value: "135000.00" },
      { date: "2025-04-04", value: "155000.00" },
      { date: "2025-04-05", value: "140000.00" },
      { date: "2025-04-06", value: "160000.00" },
      { date: "2025-04-07", value: "150000.00" },
      { date: "2025-04-08", value: "170000.00" },
      { date: "2025-04-09", value: "145000.00" },
      { date: "2025-04-10", value: "165000.00" },
      { date: "2025-04-11", value: "155000.00" },
      { date: "2025-04-12", value: "175000.00" },
      { date: "2025-04-13", value: "160000.00" },
      { date: "2025-04-14", value: "180000.00" },
      { date: "2025-04-15", value: "170000.00" }
    ],
    shipping: [
      { date: "2025-04-01", value: "45" },
      { date: "2025-04-02", value: "52" },
      { date: "2025-04-03", value: "48" },
      { date: "2025-04-04", value: "55" },
      { date: "2025-04-05", value: "50" },
      { date: "2025-04-06", value: "58" },
      { date: "2025-04-07", value: "53" },
      { date: "2025-04-08", value: "61" },
      { date: "2025-04-09", value: "56" },
      { date: "2025-04-10", value: "64" },
      { date: "2025-04-11", value: "59" },
      { date: "2025-04-12", value: "67" },
      { date: "2025-04-13", value: "62" },
      { date: "2025-04-14", value: "70" },
      { date: "2025-04-15", value: "65" }
    ]
  },
  insights: [
    {
      id: "1",
      type: "sales",
      severity: "high",
      title: "Strong Sales Growth",
      description: "Sales increased by 18% compared to last month",
      value: "18%",
      trend: "up",
      icon: "trending_up"
    },
    {
      id: "2",
      type: "orders",
      severity: "medium",
      title: "Order Volume Up",
      description: "Order volume increased by 12% with improved AOV",
      value: "12%",
      trend: "up",
      icon: "shopping_cart"
    },
    {
      id: "3",
      type: "returns",
      severity: "low",
      title: "Low Return Rate",
      description: "Return rate decreased to 2.11% from 2.5%",
      value: "2.11%",
      trend: "down",
      icon: "undo"
    }
  ],
  topProducts: [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      sku: "WH-001",
      revenue: "285000.00",
      unitsSold: 285,
      growth: "15%",
      platform: "Flipkart"
    },
    {
      id: "2",
      name: "Smart Fitness Band",
      sku: "FB-002",
      revenue: "245000.00",
      unitsSold: 245,
      growth: "12%",
      platform: "Amazon"
    },
    {
      id: "3",
      name: "Portable Power Bank",
      sku: "PB-003",
      revenue: "220000.00",
      unitsSold: 220,
      growth: "18%",
      platform: "Flipkart"
    },
    {
      id: "4",
      name: "Wireless Mouse",
      sku: "WM-004",
      revenue: "195000.00",
      unitsSold: 195,
      growth: "10%",
      platform: "Amazon"
    },
    {
      id: "5",
      name: "USB Type-C Cable",
      sku: "UC-005",
      revenue: "180000.00",
      unitsSold: 360,
      growth: "8%",
      platform: "Flipkart"
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

  // Fetch data using dummy data
  const fetchData = () => {
    setLoading(true);
    setApiLoading(true);
    setApiError(null);
    setUsingMockData(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Use mock data for demonstration
        setApiData(mockMarketplaceData);
        setApiError('Using demo data for demonstration purposes');
      } catch (err) {
        console.error('Error loading mock data:', err);
        setApiError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
        setApiLoading(false);
      }
    }, 800);
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

  // Simple fallback data
  const fallbackKPIs = [
    { title: 'Total Sales', value: 1250000, change: 15, icon: iconMap.totalRevenue },
    { title: 'Total Orders', value: 1250, change: 12, icon: iconMap.orders },
    { title: 'Average Order Value', value: 1000, change: 8, icon: iconMap.aov },
    { title: 'Returns', value: 125, change: 5, icon: iconMap.returns },
  ];

  // Use API data if available, otherwise use fallback
  const kpis = apiData?.kpis ? [
    { title: 'Total Sales', value: parseFloat(apiData.kpis.totalSales), change: 15, icon: iconMap.totalRevenue },
    { title: 'Total Orders', value: apiData.kpis.totalOrders, change: 12, icon: iconMap.orders },
    { title: 'Average Order Value', value: parseFloat(apiData.kpis.aov), change: 8, icon: iconMap.aov },
    { title: 'Returns', value: apiData.kpis.returns, change: 5, icon: iconMap.returns },
  ] : fallbackKPIs;

  // Chart data
  const salesChartData = formatChartData(apiData?.chartData?.sales || []);
  const shippingChartData = formatChartData(apiData?.chartData?.shipping || []);
  const topProducts = apiData?.topProducts || [];



  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ p: 4, minHeight: '100vh' }}>
        {/* Demo Data Alert */}
        {apiError && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: '6px', background: '#e3f2fd', border: '1px solid #bbdefb' }}>
            {apiError}
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
            <Typography variant="body2" color="text.secondary" mb={1}>
              Selected Platforms: {selectedPlatforms.join(', ')}
            </Typography>
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
            <Grid container spacing={3} mb={3}>
              {kpis.map((kpi, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <KPICard
                    title={kpi.title}
                    value={kpi.value}
                    change={kpi.change}
                    icon={kpi.icon}
                  />
                </Grid>
              ))}
            </Grid>

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
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" mb={3}>
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
                                color: '#14B8A6'
                              },
                              { 
                                name: 'Return Orders', 
                                value: apiData.kpis.returns,
                                color: '#EF4444'
                              }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            labelLine={false}
                          >
                            <Cell fill="#14B8A6" />
                            <Cell fill="#EF4444" />
                          </Pie>
                          <Tooltip formatter={(value: any) => [formatNumber(value), 'Orders']} />
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
                            tick={{ fontSize: 11, fill: '#888' }}
                            tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fill: '#888' }}
                            tickFormatter={(value) => formatNumber(value)}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value: any) => [formatNumber(value), 'Units Sold']}
                            labelStyle={{ color: '#333' }}
                          />
                          <Bar 
                            dataKey="unitsSold" 
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                          >
                            {topProducts.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index]} />
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
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
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