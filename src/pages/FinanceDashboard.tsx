import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Skeleton,
  Card,
  CardActionArea,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Grid,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DateRangeSelector from '../components/DateRangeSelector';
import KPICard from '../components/KPICard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import mockData, {
  FinanceMockData,
  KPI,
  SalesRow,
  ProductRow,
  generateMockData,
  Platform,
} from '../data/mockData';
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  ShowChart as ShowChartIcon,
  Undo as UndoIcon,
  Storefront as StorefrontIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const accentColors = ['#14B8A6', '#3B82F6', '#F59E0B', '#EF4444'];

const iconMap: Record<string, React.ReactNode> = {
  totalRevenue: <AttachMoneyIcon />,
  orders: <ShoppingCartIcon />,
  aov: <ShowChartIcon />,
  returns: <UndoIcon />,
};

const tabs = [
  'Overview',
  'Detailed Sales',
  'Product Performance',
];

const platforms: { value: Platform; label: string }[] = [
  { value: 'shopify', label: 'Shopify' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'myntra', label: 'Myntra' },
];

const dataTypes = [
  { value: 'sales', label: 'Sales Revenue', color: '#14B8A6' },
  { value: 'commissions', label: 'Marketplace Commissions', color: '#3B82F6' },
  { value: 'shipping', label: 'Shipping Fees', color: '#F59E0B' },
];

const dataSources = [
  { id: 'shopify', name: 'Shopify', logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg' },
  { id: 'amazon', name: 'Amazon', logo: 'https://cdn.worldvectorlogo.com/logos/amazon-icon-1.svg' },
  { id: 'flipkart', name: 'Flipkart', logo: 'https://cdn.worldvectorlogo.com/logos/flipkart-1.svg' },
  { id: 'myntra', name: 'Myntra', logo: 'https://cdn.worldvectorlogo.com/logos/myntra-1.svg' },
  { id: 'nykaa', name: 'Nykaa', logo: 'https://cdn.worldvectorlogo.com/logos/nykaa-1.svg' },
  { id: 'offline', name: 'Offline Stores', logo: '', icon: <StorefrontIcon fontSize="large" /> },
  { id: 'tally', name: 'Tally', logo: 'https://cdn.worldvectorlogo.com/logos/tally.svg' },
  { id: 'xero', name: 'Xero', logo: 'https://cdn.worldvectorlogo.com/logos/xero-1.svg' },
  { id: 'sap', name: 'SAP', logo: 'https://cdn.worldvectorlogo.com/logos/sap-1.svg' },
  { id: 'netsuite', name: 'Netsuite', logo: 'https://cdn.worldvectorlogo.com/logos/netsuite-1.svg' },
  { id: 'oracle', name: 'Oracle', logo: 'https://cdn.worldvectorlogo.com/logos/oracle-4.svg' },
];

// Types for order sync functionality
interface OrderData {
  id: string;
  platform: string;
  orderId: string;
  merchantOrderId?: string;
  purchaseDate: string;
  lastUpdatedDate: string;
  orderStatus: string;
  fulfillmentChannel: string;
  salesChannel: string;
  shipServiceLevel: string;
  productName: string;
  sku: string;
  asin?: string;
  itemStatus: string;
  quantity: number;
  currency: string;
  itemPrice: number;
  itemTax: number;
  shippingPrice: number;
  shippingTax: number;
  giftWrapPrice: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface PlatformSyncStatus {
  platform: string;
  status: 'pending' | 'syncing' | 'completed' | 'error';
  progress: number;
  orderCount: number;
  logo: string;
}

// Mock data generators
const generateRandomOrderData = (platform: string, count: number): OrderData[] => {
  const orders: OrderData[] = [];
  const statuses = ['Shipped', 'Delivered', 'Processing', 'Cancelled', 'Pending'];
  const fulfillmentChannels = ['Amazon', 'Merchant', 'AFN', 'Self-Fulfilled'];
  const currencies = ['INR', 'USD'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana'];
  
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Smartphone Case with Card Holder',
    'LED Desk Lamp with USB Charging',
    'Organic Cotton T-Shirt',
    'Stainless Steel Water Bottle',
    'Gaming Mouse with RGB Lighting',
    'Yoga Mat with Carrying Strap',
    'Coffee Mug with Temperature Display',
    'Portable Power Bank 10000mAh',
    'Bluetooth Speaker Waterproof'
  ];

  for (let i = 0; i < count; i++) {
    const basePrice = Math.random() * 5000 + 500;
    const tax = basePrice * 0.18;
    const shipping = Math.random() * 200 + 50;
    const shippingTax = shipping * 0.18;
    
    orders.push({
      id: `${platform}-${Date.now()}-${i}`,
      platform,
      orderId: `${platform.toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      merchantOrderId: platform === 'amazon' ? `MO-${Math.random().toString(36).substr(2, 8).toUpperCase()}` : undefined,
      purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
      fulfillmentChannel: fulfillmentChannels[Math.floor(Math.random() * fulfillmentChannels.length)],
      salesChannel: platform,
      shipServiceLevel: Math.random() > 0.5 ? 'Standard' : 'Expedited',
      productName: productNames[Math.floor(Math.random() * productNames.length)],
      sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      asin: platform === 'amazon' ? `B${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
      itemStatus: statuses[Math.floor(Math.random() * statuses.length)],
      quantity: Math.floor(Math.random() * 5) + 1,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      itemPrice: Math.round(basePrice * 100) / 100,
      itemTax: Math.round(tax * 100) / 100,
      shippingPrice: Math.round(shipping * 100) / 100,
      shippingTax: Math.round(shippingTax * 100) / 100,
      giftWrapPrice: Math.random() > 0.8 ? Math.round(Math.random() * 100 * 100) / 100 : 0,
      customerName: `Customer ${Math.random().toString(36).substr(2, 6)}`,
      customerEmail: `customer${Math.random().toString(36).substr(2, 4)}@email.com`,
      shippingAddress: {
        line1: `${Math.floor(Math.random() * 999) + 1}, Street ${Math.floor(Math.random() * 50) + 1}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        postalCode: `${Math.floor(Math.random() * 900000) + 100000}`,
        country: 'India'
      }
    });
  }
  
  return orders;
};

/* ----------------------------- Skeletons ----------------------------- */
const SkeletonOverview = () => (
  <Box>
    <Grid container spacing={3} mb={3}>
      {[...Array(4)].map((_, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton
      variant="rectangular"
      height={320}
      sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}
    />
    <Grid container direction="column" spacing={3}>
      {[...Array(3)].map((_, idx) => (
        <Grid item xs={12} key={idx}>
          <Skeleton
            variant="rectangular"
            height={420}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const SkeletonTable = () => (
  <Skeleton
    variant="rectangular"
    height={500}
    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
  />
);

/* --------------------------- Platform Selector --------------------------- */
const PlatformSelector: React.FC<{
  selectedPlatforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}> = ({ selectedPlatforms, onChange }) => {
  const handleChange = (event: any) => {
    const value = event.target.value;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Platforms</InputLabel>
      <Select
        multiple
        value={selectedPlatforms}
        onChange={handleChange}
        input={<OutlinedInput label="Platforms" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip
                key={value}
                label={platforms.find(p => p.value === value)?.label}
                size="small"
              />
            ))}
          </Box>
        )}
      >
        {platforms.map((platform) => (
          <MenuItem key={platform.value} value={platform.value}>
            {platform.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

/* --------------------------- Overview Tab --------------------------- */
const OverviewContent: React.FC<{ 
  data: FinanceMockData; 
  selectedDataType: string;
  onDataTypeChange: (dataType: string) => void;
}> = ({ data, selectedDataType, onDataTypeChange }) => {
  // Get the appropriate data and styling based on selected type
  const getChartData = () => {
    switch (selectedDataType) {
      case 'commissions':
        return data.marketplace_commissions_over_time;
      case 'shipping':
        return data.shipping_fees_over_time;
      default:
        return data.sales_over_time;
    }
  };

  const getChartConfig = () => {
    const dataTypeConfig = dataTypes.find(dt => dt.value === selectedDataType);
    return {
      title: dataTypeConfig?.label || 'Sales Revenue',
      color: dataTypeConfig?.color || '#14B8A6',
      gradientId: `${selectedDataType}Gradient`,
    };
  };

  const chartData = getChartData();
  const chartConfig = getChartConfig();

  return (
  <Box>
    {/* KPI ROW */}
    <Grid container spacing={3} mb={3}>
      {data.kpis.map((kpi: KPI) => (
        <Grid item xs={12} sm={6} md={3} key={kpi.id}>
          <KPICard
            title={kpi.label}
            value={kpi.value}
            change={kpi.change}
            icon={iconMap[kpi.id]}
          />
        </Grid>
      ))}
    </Grid>

    {/* PRIMARY CHART */}
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {chartConfig.title} Over Time
        </Typography>
        <Tabs
          value={selectedDataType}
          onChange={(_, newValue) => onDataTypeChange(newValue)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: chartConfig.color, height: 2 } }}
          sx={{ minHeight: 'auto' }}
        >
          {dataTypes.map((dataType) => (
            <Tab 
              key={dataType.value} 
              label={dataType.label} 
              value={dataType.value}
              sx={{ 
                minHeight: 'auto', 
                py: 1, 
                minWidth: 80,
                fontSize: '0.875rem',
                textTransform: 'none'
              }}
            />
          ))}
        </Tabs>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={chartConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={chartConfig.color}
            fillOpacity={1}
            fill={`url(#${chartConfig.gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>

    {/* SECONDARY ROW */}
    <Grid container direction="row" spacing={3}>
      {/* Sales by Channel */}
      <Grid item xs={12} md={6} sx={{ flexGrow: 1 }}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper', minHeight: 420, width: '100%' }}>
          <Typography variant="h6" mb={2}>
            Sales by Channel
          </Typography>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                dataKey="revenue"
                nameKey="channel"
                data={data.sales_by_channel}
                innerRadius={100}
                outerRadius={180}
                label={({ channel, percent }) => `${channel} ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.sales_by_channel.map((_, idx) => (
                  <Cell key={idx} fill={accentColors[idx % accentColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0' }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Top Products */}
      <Grid item xs={12} md={6} sx={{ flexGrow: 1 }}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper', minHeight: 420, width: '100%' }}>
          <Typography variant="h6" mb={2}>
            Top Products
          </Typography>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={data.top_products}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis
                type="category"
                dataKey="product"
                stroke="#9CA3AF"
                width={100}
              />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0' }} />
              <Bar dataKey="revenue" fill="#3B82F6" barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>

    {/* INSIGHTS ROW */}
    <Grid container spacing={3} mt={3}>
      <Grid item xs={12}>
        <Paper
          sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', maxHeight: 400, overflow: 'auto' }}
        >
          <Typography variant="h6" mb={2}>
            Insights & Anomalies
          </Typography>
          {data.anomalies.map((item, idx) => (
            <Box key={idx} mb={2}>
              <Typography variant="body2">
                {item.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.timestamp}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  </Box>
  );
};

/* --------------------------- Data Tables --------------------------- */
const SalesTable: React.FC<{ rows: SalesRow[] }> = ({ rows }) => {
  const columns: GridColDef[] = [
    { field: 'orderId', headerName: 'Order ID', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'channel', headerName: 'Channel', flex: 1 },
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'items', headerName: 'Items', type: 'number', flex: 1 },
    { 
      field: 'total', 
      headerName: 'Total Value', 
      type: 'number', 
      flex: 1,
      renderCell: (params) => `$${params.value?.toFixed(2) || '0.00'}`
    },
    { 
      field: 'shippingFees', 
      headerName: 'Shipping Fees', 
      type: 'number', 
      flex: 1,
      renderCell: (params) => `$${params.value?.toFixed(2) || '0.00'}`
    },
    { 
      field: 'marketplaceCommission', 
      headerName: 'Marketplace Commission', 
      type: 'number', 
      flex: 1,
      renderCell: (params) => `$${params.value?.toFixed(2) || '0.00'}`
    },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      pageSizeOptions={[10, 25, 50]}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 0,
        '.MuiDataGrid-columnHeaders': { backgroundColor: 'background.default', color: 'text.primary' },
        '.MuiDataGrid-virtualScrollerRenderZone': { '& .MuiDataGrid-row': { borderColor: 'divider' } },
      }}
    />
  );
};

const ProductsTable: React.FC<{ rows: ProductRow[] }> = ({ rows }) => {
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'unitsSold', headerName: 'Units Sold', type: 'number', flex: 1 },
    { field: 'revenue', headerName: 'Revenue', type: 'number', flex: 1 },
    { field: 'returns', headerName: 'Returns', type: 'number', flex: 1 },
    { field: 'returnRate', headerName: 'Return Rate %', type: 'number', flex: 1 },
  ];
  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      pageSizeOptions={[10, 25, 50]}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 0,
        '.MuiDataGrid-columnHeaders': { backgroundColor: 'background.default', color: 'text.primary' },
      }}
    />
  );
};

/* ---------------------- Connect Data Sources Tab -------------------- */
const ConnectDataSourcesContent: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCredChange = (id: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // Here you would trigger the connect flow / API call
    // For now just log selections
    console.log('Selected sources:', selected);
    console.log('Credentials:', credentials);
  };

  const isSubmitDisabled =
    selected.length === 0 || selected.some((id) => !credentials[id]);

  return (
    <Box>
      <Typography variant="h6" mb={2} textAlign="center">
        Connect your sales and accounting data sources
      </Typography>

      {/* Data Source Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
        }}
      >
        {dataSources.map((ds) => {
          const isSelected = selected.includes(ds.id);
          return (
            <Card
              key={ds.id}
              sx={{
                height: '100%',
                border: isSelected ? '2px solid #14B8A6' : '1px solid',
                borderColor: isSelected ? '#14B8A6' : 'divider',
                borderRadius: 3,
                boxShadow: 'none',
              }}
            >
              <CardActionArea
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                }}
                onClick={() => toggleSelect(ds.id)}
              >
                {ds.logo ? (
                  <Avatar src={ds.logo} alt={ds.name} sx={{ width: 64, height: 64, mb: 2 }} />
                ) : (
                  <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: '#f0f0f0' }}>
                    {ds.icon}
                  </Avatar>
                )}
                <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                  {ds.name}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* Credential Inputs */}
      {selected.length > 0 && (
        <Box mt={4}>
          <Typography variant="subtitle1" mb={2}>
            Provide Credentials
          </Typography>
          {selected.map((id) => {
            const ds = dataSources.find((d) => d.id === id)!;
            return (
              <Box key={id} mb={2}>
                <TextField
                  fullWidth
                  label={`${ds.name} Credentials`}
                  placeholder="Enter API key, token, or login details"
                  value={credentials[id] || ''}
                  onChange={(e) => handleCredChange(id, e.target.value)}
                />
              </Box>
            );
          })}

          <Box mt={4} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              sx={{ px: 4, py: 1.25 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

/* ------------------------ Sync Modal Component ----------------------- */
const SyncModal: React.FC<{
  open: boolean;
  onClose: () => void;
  selectedPlatforms: Platform[];
}> = ({ open, onClose, selectedPlatforms }) => {
  const [syncStatuses, setSyncStatuses] = useState<PlatformSyncStatus[]>([]);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [currentStep, setCurrentStep] = useState<'syncing' | 'completed'>('syncing');

  useEffect(() => {
    if (open) {
      // Initialize sync statuses
      const initialStatuses: PlatformSyncStatus[] = selectedPlatforms.map(platform => ({
        platform,
        status: 'pending',
        progress: 0,
        orderCount: 0,
        logo: dataSources.find(ds => ds.id === platform)?.logo || ''
      }));
      setSyncStatuses(initialStatuses);
      setCurrentStep('syncing');
      setAllOrders([]);

      // Simulate sync process
      const syncPlatforms = async () => {
        for (let i = 0; i < selectedPlatforms.length; i++) {
          const platform = selectedPlatforms[i];
          
          // Update status to syncing
          setSyncStatuses(prev => prev.map(status => 
            status.platform === platform 
              ? { ...status, status: 'syncing' as const }
              : status
          ));

          // Simulate progress
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setSyncStatuses(prev => prev.map(status => 
              status.platform === platform 
                ? { ...status, progress }
                : status
            ));
          }

          // Generate mock orders for this platform
          const orderCount = Math.floor(Math.random() * 15) + 5;
          const newOrders = generateRandomOrderData(platform, orderCount);
          
          // Update status to completed
          setSyncStatuses(prev => prev.map(status => 
            status.platform === platform 
              ? { ...status, status: 'completed' as const, orderCount, progress: 100 }
              : status
          ));

          setAllOrders(prev => [...prev, ...newOrders]);
        }

        // All platforms synced, move to completed step
        setTimeout(() => {
          setCurrentStep('completed');
        }, 500);
      };

      syncPlatforms();
    }
  }, [open, selectedPlatforms]);

  const orderColumns: GridColDef[] = [
    { field: 'platform', headerName: 'Platform', width: 100 },
    { field: 'orderId', headerName: 'Order ID', width: 150 },
    { field: 'purchaseDate', headerName: 'Purchase Date', width: 120 },
    { field: 'customerName', headerName: 'Customer', width: 150 },
    { field: 'productName', headerName: 'Product', width: 200 },
    { field: 'quantity', headerName: 'Qty', width: 80, type: 'number' },
    { 
      field: 'itemPrice', 
      headerName: 'Item Price', 
      width: 100,
      renderCell: (params) => `₹${params.value?.toFixed(2) || '0.00'}`
    },
    { 
      field: 'itemTax', 
      headerName: 'Tax', 
      width: 90,
      renderCell: (params) => `₹${params.value?.toFixed(2) || '0.00'}`
    },
    { 
      field: 'shippingPrice', 
      headerName: 'Shipping', 
      width: 100,
      renderCell: (params) => `₹${params.value?.toFixed(2) || '0.00'}`
    },
    { field: 'orderStatus', headerName: 'Status', width: 120 },
    { field: 'sku', headerName: 'SKU', width: 120 },
  ];

  const totalOrders = allOrders.length;
  const totalValue = allOrders.reduce((sum, order) => sum + order.itemPrice + order.itemTax + order.shippingPrice, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <SyncIcon />
          <Typography variant="h6">
            Syncing Order Data from Platforms
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {currentStep === 'syncing' && (
          <Box>
            <Typography variant="body1" mb={3} color="text.secondary">
              Fetching latest order data from your connected platforms...
            </Typography>
            
            <List>
              {syncStatuses.map((status, index) => (
                <React.Fragment key={status.platform}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={status.logo} sx={{ width: 40, height: 40 }}>
                        {status.status === 'completed' ? (
                          <CheckCircleIcon color="success" />
                        ) : status.status === 'syncing' ? (
                          <CircularProgress size={24} />
                        ) : null}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                            {status.platform}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {status.status === 'completed' 
                              ? `${status.orderCount} orders fetched`
                              : status.status === 'syncing' 
                              ? `${status.progress}%`
                              : 'Waiting...'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={status.progress} 
                            sx={{ height: 6, borderRadius: 3 }}
                            color={status.status === 'completed' ? 'success' : 'primary'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < syncStatuses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {currentStep === 'completed' && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" color="success.main">
                Sync Completed Successfully!
              </Typography>
              <Box display="flex" gap={3}>
                <Typography variant="body2">
                  <strong>{totalOrders}</strong> new orders
                </Typography>
                <Typography variant="body2">
                  <strong>₹{totalValue.toFixed(2)}</strong> total value
                </Typography>
              </Box>
            </Box>

            <Paper sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ height: 500 }}>
                <DataGrid
                  rows={allOrders}
                  columns={orderColumns}
                  pageSizeOptions={[10, 25, 50]}
                  checkboxSelection
                  disableRowSelectionOnClick
                  sx={{
                    bgcolor: 'background.paper',
                    '& .MuiDataGrid-columnHeaders': { 
                      backgroundColor: 'action.hover',
                      fontWeight: 600
                    },
                    '& .MuiDataGrid-row': {
                      '&:nth-of-type(even)': {
                        backgroundColor: 'action.hover'
                      }
                    }
                  }}
                />
              </Box>
            </Paper>

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Data fetched from platform APIs at {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          {currentStep === 'syncing' ? 'Cancel' : 'Close'}
        </Button>
        {currentStep === 'completed' && (
          <Button variant="outlined" onClick={() => {
            // Here you would typically save/import the data
            console.log('Importing orders:', allOrders);
            onClose();
          }}>
            Import All Orders
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

/* ------------------------ Main Page Component ----------------------- */
const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('Last 1 day');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['shopify', 'amazon', 'flipkart', 'myntra']);
  const [selectedDataType, setSelectedDataType] = useState('sales');
  const [data, setData] = useState<FinanceMockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate async fetch with dynamic data based on date range and selected platforms
    const timer = setTimeout(() => {
      setData(generateMockData(dateRange, selectedPlatforms));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [dateRange, selectedPlatforms]);

  const handleRefreshClick = () => {
    setSyncModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ p: 4, minHeight: '100vh' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Finance Dashboard
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={handleRefreshClick}
              sx={{
                borderColor: '#14B8A6',
                color: '#14B8A6',
                '&:hover': {
                  borderColor: '#0F766E',
                  backgroundColor: 'rgba(20, 184, 166, 0.04)',
                },
              }}
            >
              Refresh
            </Button>
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
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
          
          {/* Platform selector - positioned near tabs */}
          <PlatformSelector 
            selectedPlatforms={selectedPlatforms} 
            onChange={setSelectedPlatforms} 
          />
        </Box>

        {/* Tab Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {loading || !data ? <SkeletonOverview /> : <OverviewContent data={data} selectedDataType={selectedDataType} onDataTypeChange={setSelectedDataType} />}
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="sales"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {loading || !data ? <SkeletonTable /> : <SalesTable rows={data.sales_table} />}
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {loading || !data ? <SkeletonTable /> : <ProductsTable rows={data.products_table} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Modal */}
        <SyncModal
          open={syncModalOpen}
          onClose={() => setSyncModalOpen(false)}
          selectedPlatforms={selectedPlatforms}
        />
      </Box>
    </motion.div>
  );
};

export default FinanceDashboard; 