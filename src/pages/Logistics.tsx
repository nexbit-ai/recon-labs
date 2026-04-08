import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  ErrorOutline as ErrorOutlineIcon,
  WarningAmber as WarningAmberIcon,
  InfoOutlined as InfoIcon,
  Download as DownloadIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { api, apiUtils } from '../services/api';

const REASON_SIMPLE_LABELS: Record<string, string> = {
  // No mapping; show raw backend labels for consistency
};

const REASON_DEFINITIONS: Record<string, string> = {
  'Wrong Slab Mapping': 'The courier has billed based on a different geographical zone than what your contract justifies according to the pincode-to-pincode mapping.',
  'Physical Weight Mismatch': 'High Confidence Overcharge: Billed weight exceeds both Physical SKU weight and calculated Volumetric weight.',
  'Operational: Box Too Large': 'Inefficient Packaging: Billed weight matches box dimensions, but the box is much larger than the actual product.',
  'Master Data Gap (0g)': 'Audit Incomplete: SKU weight is missing in Master Weight table. Audit is currently based on calculated volumetric weight only.',
  'SKU Discrepancy (Sales Override)': 'The logistics record SKU differs from the sales manifest. Audit weight was calculated using actual sold items.',
  'Weight Slab Inconsistency': 'The billed weight belongs to a higher cost slab than your verified product record indicates.',
  'Shipping Rate Dispute': 'The base freight rate applied by the courier does not match the agreed rate-card for this zone.',
  'COD Service Fee Variance': 'Discrepancy in the cash-handling commissions charged versus the expected logic.',
  'Financial: Courier Overcharge': 'Generic billing discrepancy detected across freight or service tax components.'
};

type ViewType = 'all' | 'mismatch';

type LogisticOrder = {
  id: string;
  display_order_code: string;
  awb: string;
  order_date?: string | null;
  payment_mode?: string | null;
  courier_partner?: string | null;
  account_code?: string | null;
  shipping_address_city?: string | null;
  uploaded_pincode_zone?: string | null;
  clickpost_unified_status?: string | null;
  charged_weight?: number | null;
  expected_weight?: number | null;
  items_quantity?: number | null;
  product_sku_code?: string | null;
  total_cost?: number | null;
  expected_cost?: number | null;
  difference?: number | null;
  reason?: string | null;
  breakups?: string | null;
  dispute_raised?: boolean;
};

type LogisticDashboardResponse = {
  summary?: {
    total_orders?: number;
    mismatch_orders?: number;
    matched_orders?: number;
    disputed_orders?: number;
    total_actual_cost?: number;
    total_expected_cost?: number;
    net_difference?: number;
    abs_difference?: number;
    match_rate?: number;
    reason_distribution?: { label: string; value: number; count: number }[];
    zone_distribution?: { label: string; value: number; count: number }[];
    slab_distribution?: {
      label: string;
      count: number;
      order_share: number;
      revenue_share: number;
      avg_cost: number;
    }[];
  };
  orders?: LogisticOrder[];
  mismatch_orders?: LogisticOrder[];
  pagination?: {
    page?: number;
    limit?: number;
    total_count?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
};

const getFiscalYearStart = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const fiscalYearStart = now.getMonth() < 3 ? currentYear - 1 : currentYear;
  return `${fiscalYearStart}-04-01`;
};

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const toInteger = (value?: number | null): string => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.trunc(num));
};

const toCurrency = (value?: number | null): string => {
  const safe = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
};

const transactionSheetTableSx = {
  borderCollapse: 'separate',
  borderSpacing: 0,
  '& .MuiTableCell-root': {
    border: 'none !important',
  },
  '& .MuiTableCell-head': {
    border: 'none !important',
    borderBottom: '0.5px solid #e5e7eb !important',
    backgroundColor: '#f9fafb',
    color: '#111827',
    fontWeight: 700,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    textAlign: 'center',
  },
  '& .MuiTableCell-body': {
    border: 'none !important',
    borderBottom: '0.5px solid #e5e7eb !important',
  },
};

const Logistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orders, setOrders] = useState<LogisticOrder[]>([]);
  const [summary, setSummary] = useState<LogisticDashboardResponse['summary']>({});
  const [pagination, setPagination] = useState<LogisticDashboardResponse['pagination']>({});

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const view: ViewType = 'mismatch';
  const [startDate, setStartDate] = useState(getFiscalYearStart());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [debugSkipCOD, setDebugSkipCOD] = useState(false);

  type Platform = 'delhivery' | 'shadowfax' | 'bluedart' | 'shiprocket';
  const [platform, setPlatform] = useState<Platform>('delhivery');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const [filtersMenuAnchor, setFiltersMenuAnchor] = useState<HTMLElement | null>(null);
  const isFiltersMenuOpen = Boolean(filtersMenuAnchor);

  type LogisticRateCardRow = {
    id: string;
    section_name: string;
    provider_name: string;
    service_type: string;
    zone: string;
    row_label: string;
    slab_label: string;
    raw_value: string;
    numeric_value?: number | null;
    formula_text?: string | null;
  };

  const [configOpen, setConfigOpen] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [rateCardRows, setRateCardRows] = useState<LogisticRateCardRow[]>([]);
  const [configEdits, setConfigEdits] = useState<Record<string, string>>({});
  const [configServiceType, setConfigServiceType] = useState<string>('');
  const [masterWeightUploadLoading, setMasterWeightUploadLoading] = useState(false);

  const getCurrentDateRangeLabel = () => {
    if (startDate === getFiscalYearStart() && endDate === getTodayDate()) {
      return "Current Fiscal Year";
    }
    return `${startDate} to ${endDate}`;
  };

  const handleMasterWeightUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMasterWeightUploadLoading(true);
    try {
      await api.logistics.uploadMasterWeight(file);
      await fetchDashboard();
    } catch (err: any) {
      setError(apiUtils.formatError(err));
    } finally {
      setMasterWeightUploadLoading(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      if (platform !== 'delhivery' && platform !== 'shadowfax') {
        setError(`Cost audit for ${platform} is not implemented yet.`);
        setOrders([]);
        setSummary({});
        setPagination({});
        return;
      }

      const params: Record<string, any> = { provider: platform, page, limit, view };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (search) params.search = search;
      if (selectedReason) params.reason = selectedReason;
      if (debugSkipCOD) params.debug_skip = 'cod';

      const response = await api.logistics.getLogisticCostDashboard(params);
      const payload = (response.data || {}) as LogisticDashboardResponse;
      setSummary(payload.summary || {});
      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
      setPagination(payload.pagination || {});
    } catch (err: any) {
      setError(apiUtils.formatError(err));
      setSummary({});
      setOrders([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const loadRateCardConfig = async () => {
    if (platform !== 'delhivery' && platform !== 'shadowfax') {
      setConfigError(`Rate-card editing for ${platform} is not implemented yet.`);
      return;
    }

    setConfigLoading(true);
    setConfigError(null);
    try {
      const resp = await api.logistics.getRateCardConfig({
        provider: platform,
        start_date: startDate,
        end_date: endDate,
      });
      const payload = resp.data || {};
      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      setRateCardRows(rows);
      setConfigEdits({});
      const firstServiceType = rows[0]?.service_type || '';
      setConfigServiceType(firstServiceType);
    } catch (err: any) {
      setConfigError(apiUtils.formatError(err));
      setRateCardRows([]);
      setConfigEdits({});
      setConfigServiceType('');
    } finally {
      setConfigLoading(false);
    }
  };

  const saveRateCardConfig = async () => {
    if (platform !== 'delhivery' && platform !== 'shadowfax') return;
    const updates = Object.entries(configEdits).map(([id, raw_value]) => ({ id, raw_value }));
    if (updates.length === 0) return;

    setConfigLoading(true);
    setConfigError(null);
    try {
      await api.logistics.updateRateCardConfig({ updates });
      setConfigEdits({});
      await loadRateCardConfig();
    } catch (err: any) {
      setConfigError(apiUtils.formatError(err));
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, page, limit, startDate, endDate, search, debugSkipCOD, selectedReason]);

  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

  const dateRangeOptions = [
    { value: 'last-fiscal', label: 'Last Fiscal Year' },
  ];

  const handleDateRangeSelect = (value: string) => {
    if (value === 'custom') return;

    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    let start = '';
    let end = '';

    if (value === 'last-fiscal') {
      // If today is Mar 2026, last FY is Apr 2024 to Mar 2025.
      // If today is Jun 2025 (current FY 2025), last FY is Apr 2024 to Mar 2025.
      const fiscalYearStart = currentMonth < 3 ? currentYear - 2 : currentYear - 1;
      start = `${fiscalYearStart}-04-01`;
      end = `${fiscalYearStart + 1}-03-31`;
    }

    setStartDate(start);
    setEndDate(end);
    setFiltersMenuAnchor(null);
  };

  return (
    <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Logistics Cost Intelligence
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value as Platform);
                setPage(1);
              }}
              sx={{ borderRadius: '10px', bgcolor: '#fff' }}
            >
              <MenuItem value="delhivery">Delhivery</MenuItem>
              <MenuItem value="shadowfax">Shadowfax</MenuItem>
              <MenuItem value="bluedart">Bluedart</MenuItem>
              <MenuItem value="shiprocket">Shiprocket</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            variant="outlined"
            onClick={(e) => setFiltersMenuAnchor(e.currentTarget)}
            startIcon={<SearchIcon fontSize="small" />}
            endIcon={<KeyboardArrowDownIcon fontSize="small" />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
              borderColor: '#e2e8f0',
              color: '#475569',
              fontWeight: 600,
              bgcolor: '#fff',
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
            }}
          >
            {getCurrentDateRangeLabel()}
          </Button>


          <Button
            size="small"
            variant="outlined"
            onClick={() => setConfigOpen(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
              borderColor: '#e2e8f0',
              color: '#475569',
              fontWeight: 600,
              bgcolor: '#fff',
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
            }}
          >
            Config
          </Button>

          <Button
            size="small"
            variant="outlined"
            type="button"
            disabled={isDownloading}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDownloading(true);
              try {
                // Fetch ALL results for CSV export (limit 100k)
                const params = { provider: platform, page: 1, limit: 100000, view, start_date: startDate, end_date: endDate, search };
                const resp = await api.logistics.getLogisticCostDashboard(params);
                const allOrders = (resp.data?.orders || []) as LogisticOrder[];

                const headers = ['Order ID', 'Order Date', 'Zone', 'Item Qty', 'SKUs', 'Billed Wt', 'Expected Cost', 'Actual Cost', 'Difference', 'Breakup'];
                const csvContent = allOrders.map(o => [
                  o.display_order_code,
                  o.order_date,
                  o.uploaded_pincode_zone,
                  o.items_quantity,
                  `"${o.product_sku_code}"`,
                  o.charged_weight,
                  o.expected_cost,
                  o.total_cost,
                  o.difference,
                  `"${o.reason}"`
                ].join(',')).join('\n');

                const blob = new Blob([[headers.join(','), csvContent].join('\n')], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `logistics_mismatch_${platform}_${startDate}_to_${endDate}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              } catch (err: any) {
                setError("Failed to generate export: " + apiUtils.formatError(err));
              } finally {
                setIsDownloading(false);
              }
            }}
            startIcon={isDownloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
              fontWeight: 600,
              color: '#475569',
              borderColor: '#e2e8f0',
              bgcolor: '#fff',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
            }}
          >
            {isDownloading ? 'Preparing Export...' : 'Download Mismatches'}
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Section */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { title: 'Matching Orders', value: summary?.matched_orders, color: '#16a34a', percent: summary?.match_rate, icon: <RefreshIcon /> },
          { title: 'Mismatching Orders', value: summary?.mismatch_orders, color: '#6366F1', icon: <ErrorOutlineIcon /> },
          { title: 'Absolute Leakage', value: summary?.abs_difference, isCurrency: true, color: '#0f172a', icon: <AssessmentIcon /> }
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              bgcolor: '#fff'
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: '#0f172a' }}>
                      {loading ? '---' : (kpi.isCurrency ? toCurrency(Number(kpi.value)) : toInteger(Number(kpi.value)))}
                    </Typography>
                  </Box>
                  {kpi.percent !== undefined && (
                    <Box sx={{ px: 1.5, py: 0.75, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: kpi.color, display: 'block', textAlign: 'right' }}>
                        {kpi.percent?.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600 }}>RECON RATE</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Slab Analysis Section - Modern High-Density Chart */}
      <Card sx={{ mb: 4, px: 3, py: 3, border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', bgcolor: '#fff' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
            Weight Slab Efficiency Matrix
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary?.slab_distribution || []}>
                  <defs>
                    <linearGradient id="slabGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `${val}%`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar
                    yAxisId="left"
                    name="Order Share %"
                    dataKey="order_share"
                    fill="url(#slabGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    animationDuration={1500}
                  />
                  <Line yAxisId="right" type="monotone" name="Cost per Order (Avg)" dataKey="avg_cost" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {(summary?.slab_distribution || []).map((s, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>{s.label} Slab</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#6366F1' }}>Avg ₹{s.avg_cost?.toFixed(0)} / order</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Order Volume</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{toInteger(s.count)} orders</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Revenue Contribution</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.revenue_share?.toFixed(1)}%</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Distribution & Reason Breakdown Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Zonal Leakage Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', bgcolor: '#fff' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                Leakage Distribution by Zone
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.zone_distribution || []}>
                    <defs>
                      <linearGradient id="zoneGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#0f172a',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val: number) => [toCurrency(val), 'Leakage']}
                    />
                    <Bar dataKey="value" fill="url(#zoneGradient)" radius={[6, 6, 0, 0]} barSize={32} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reason Breakdown Table */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', bgcolor: '#fff' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                Mismatch Reason Breakdown
              </Typography>
              {selectedReason && (
                <Button
                  size="small"
                  onClick={() => setSelectedReason(null)}
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': { borderColor: '#4f46e5', bgcolor: '#f5f3ff' }
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </Box>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 380 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b', py: 1.5 }}>Reasons</TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b', py: 1.5 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b', py: 1.5 }}>Total Leakage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(summary?.reason_distribution || []).length === 0 ? (
                      <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: '#94a3b8' }}>No reason data available</TableCell></TableRow>
                    ) : (
                      summary?.reason_distribution?.map((r, i) => (
                        <TableRow
                          key={i}
                          hover
                          onClick={() => {
                            setSelectedReason(r.label);
                            const el = document.getElementById('mismatch-orders-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: selectedReason === r.label ? '#eef2ff' : 'inherit',
                            '&:hover': { bgcolor: selectedReason === r.label ? '#e0e7ff' : '#f9fafb' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {r.label}
                              <Tooltip
                                title={
                                  r.label.includes('|')
                                    ? r.label.split('|').map(part => {
                                      const cleanPart = part.trim();
                                      return `${cleanPart}: ${REASON_DEFINITIONS[cleanPart] || 'Audit discrepancy'}`;
                                    }).join(' | ')
                                    : (REASON_DEFINITIONS[r.label] || 'Unspecified audit reason')
                                }
                                arrow
                                placement="right"
                              >
                                <InfoIcon sx={{ fontSize: 14, color: '#94a3b8', cursor: 'help' }} />
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>{toInteger(r.count)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 900, color: '#6366F1' }}>{toCurrency(r.value)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Section */}
      <Card sx={{ border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', bgcolor: '#fff', overflow: 'hidden', mt: 4 }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
          <Box id="mismatch-orders-section" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                Mismatched Orders
              </Typography>
              {selectedReason && (
                <Chip
                  label={`Filtered by: ${selectedReason}`}
                  onDelete={() => setSelectedReason(null)}
                  sx={{ bgcolor: '#eef2ff', color: '#6366f1', fontWeight: 700, borderRadius: '8px' }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Showing {orders.length} orders from {toInteger(pagination?.total_count)} total
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small" sx={transactionSheetTableSx}>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell align="center">Zone</TableCell>
                <TableCell align="center">Item Qty</TableCell>
                <TableCell sx={{ minWidth: 150 }}>SKUs</TableCell>
                <TableCell align="center">Billed Wt</TableCell>
                <TableCell align="center">Expected</TableCell>
                <TableCell align="center">Billed</TableCell>
                <TableCell align="center">Difference</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Reason</TableCell>
                <TableCell sx={{ minWidth: 250 }}>Breakup</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 8 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 8, color: '#64748b' }}>No discrepancies found for selected filters.</TableCell></TableRow>
              ) : (
                orders.map((order) => {
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{order.display_order_code}</TableCell>
                      <TableCell sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>{order.order_date}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#1e293b' }}>{order.uploaded_pincode_zone || '-'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{order.items_quantity || 1}</TableCell>
                      <TableCell sx={{
                        color: '#475569',
                        fontSize: '0.7rem',
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <Tooltip title={order.product_sku_code || 'N/A'}>
                          <span>{order.product_sku_code || '-'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{order.charged_weight}g</TableCell>
                      <TableCell align="center">{toCurrency(order.expected_cost)}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{toCurrency(order.total_cost)}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900, color: '#6366F1' }}>{toCurrency(order.difference)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {order.reason || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.65rem', fontStyle: 'italic' }}>
                        {order.breakups || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page === 1}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || !pagination?.has_next}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Next
            </Button>
          </Stack>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Page {page} of {pagination?.total_pages || 1}
          </Typography>
        </Box>
      </Card>

      {/* Filters Menu */}
      <Menu
        anchorEl={filtersMenuAnchor}
        open={isFiltersMenuOpen}
        onClose={() => setFiltersMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: '12px', p: 1, minWidth: 220, mt: 1, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search AWB or Order ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Divider sx={{ my: 0.5 }} />
          {dateRangeOptions.map((opt) => (
            <MenuItem
              key={opt.value}
              onClick={() => handleDateRangeSelect(opt.value)}
              sx={{ borderRadius: '8px', fontSize: '0.875rem' }}
            >
              {opt.label}
            </MenuItem>
          ))}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setFiltersMenuAnchor(null);
            }}
            sx={{ borderRadius: '8px', bgcolor: '#0f172a', mt: 1 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Menu>

      {/* Rate Card Dialog */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 900 }}>Global Rate Card Config</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Section</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>Slab</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rateCardRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.section_name}</TableCell>
                  <TableCell>{r.zone}</TableCell>
                  <TableCell>{r.slab_label}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={configEdits[r.id] ?? r.raw_value}
                      onChange={(e) => setConfigEdits(prev => ({ ...prev, [r.id]: e.target.value }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={saveRateCardConfig} sx={{ bgcolor: '#0f172a' }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logistics;

