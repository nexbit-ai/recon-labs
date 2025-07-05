import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Skeleton,
  Card,
  CardActionArea,
  Avatar,
  Button,
  TextField,
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
} from '../data/mockData';
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  ShowChart as ShowChartIcon,
  Undo as UndoIcon,
  Storefront as StorefrontIcon,
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

/* --------------------------- Overview Tab --------------------------- */
const OverviewContent: React.FC<{ data: FinanceMockData }> = ({ data }) => (
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
      <Typography variant="h6" mb={2}>
        Sales Over Time
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data.sales_over_time} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#14B8A6"
            fillOpacity={1}
            fill="url(#salesGradient)"
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
                data={data.sales_by_channel}
                innerRadius={100}
                outerRadius={180}
              >
                {data.sales_by_channel.map((_, idx) => (
                  <Cell key={idx} fill={accentColors[idx % accentColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0' }} />
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

/* --------------------------- Data Tables --------------------------- */
const SalesTable: React.FC<{ rows: SalesRow[] }> = ({ rows }) => {
  const columns: GridColDef[] = [
    { field: 'orderId', headerName: 'Order ID', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'channel', headerName: 'Channel', flex: 1 },
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'items', headerName: 'Items', type: 'number', flex: 1 },
    { field: 'total', headerName: 'Total Value', type: 'number', flex: 1 },
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

/* ------------------------ Main Page Component ----------------------- */
const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('Last 1 day');
  const [data, setData] = useState<FinanceMockData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate async fetch with dynamic data based on date range
    const timer = setTimeout(() => {
      setData(generateMockData(dateRange));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [dateRange]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ p: 4, minHeight: '100vh' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Finance Dashboard
          </Typography>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: '#14B8A6', height: 3 } }}
          sx={{ mb: 3 }}
        >
          {tabs.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

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
              {loading || !data ? <SkeletonOverview /> : <OverviewContent data={data} />}
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
      </Box>
    </motion.div>
  );
};

export default FinanceDashboard; 