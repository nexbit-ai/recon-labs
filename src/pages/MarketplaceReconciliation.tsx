import React, { useState, useEffect, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Checkbox,
  Snackbar,
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
  Menu,
  TextField,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LabelList,
} from 'recharts';

// Enhanced mock data for the new sales dashboard
const enhancedMockData = {
  enhancedKPIs: {
    netRevenue: { value: 3857600, growth: 10, trend: 'up', label: 'Net Revenue' },
    grossRevenue: { value: 4030000, growth: -8, trend: 'down', label: 'Gross Revenue' },
    returns: { value: 172399, growth: 10, trend: 'up', label: 'Returns' }
  },
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

// Payment Ageing Analysis (providers and distributions)
type ProviderType = 'Logistics (COD)' | 'Payment Gateway';
type AgeBucketKey = '<=1d' | '2-3d' | '4-7d' | '8-14d' | '15-30d' | '>30d';

interface ProviderAgeing {
  provider: string;
  type: ProviderType;
  averageDaysToSettle: number;
  distribution: Record<AgeBucketKey, number>;
}

const AGE_BUCKETS: AgeBucketKey[] = ['<=1d', '2-3d', '4-7d', '8-14d', '15-30d', '>30d'];

// Minimal, desaturated palette (single green accent + neutral grays)
const BUCKET_COLORS: Record<AgeBucketKey, string> = {
  '<=1d': '#2e7d32',   // accent for fastest
  '2-3d': '#cbd5e1',   // slate-200
  '4-7d': '#94a3b8',   // slate-400
  '8-14d': '#64748b',  // slate-500
  '15-30d': '#475569', // slate-600
  '>30d': '#1f2937',   // slate-800
};

const PROVIDER_AGEING_DATA: ProviderAgeing[] = [
  { provider: 'Blue Dart', type: 'Logistics (COD)', averageDaysToSettle: 6.2, distribution: { '<=1d': 5, '2-3d': 18, '4-7d': 42, '8-14d': 25, '15-30d': 8, '>30d': 2 } },
  { provider: 'DTDC', type: 'Logistics (COD)', averageDaysToSettle: 7.9, distribution: { '<=1d': 4, '2-3d': 15, '4-7d': 38, '8-14d': 28, '15-30d': 12, '>30d': 3 } },
  { provider: 'Delhivery', type: 'Logistics (COD)', averageDaysToSettle: 5.6, distribution: { '<=1d': 7, '2-3d': 22, '4-7d': 45, '8-14d': 20, '15-30d': 5, '>30d': 1 } },
  { provider: 'Ecom Express', type: 'Logistics (COD)', averageDaysToSettle: 6.8, distribution: { '<=1d': 6, '2-3d': 20, '4-7d': 40, '8-14d': 24, '15-30d': 8, '>30d': 2 } },
  { provider: 'PayU', type: 'Payment Gateway', averageDaysToSettle: 2.3, distribution: { '<=1d': 35, '2-3d': 45, '4-7d': 15, '8-14d': 4, '15-30d': 1, '>30d': 0 } },
  { provider: 'Paytm', type: 'Payment Gateway', averageDaysToSettle: 2.0, distribution: { '<=1d': 40, '2-3d': 42, '4-7d': 12, '8-14d': 4, '15-30d': 2, '>30d': 0 } },
  { provider: 'Razorpay', type: 'Payment Gateway', averageDaysToSettle: 1.8, distribution: { '<=1d': 48, '2-3d': 40, '4-7d': 9, '8-14d': 2, '15-30d': 1, '>30d': 0 } },
  { provider: 'Cashfree', type: 'Payment Gateway', averageDaysToSettle: 2.5, distribution: { '<=1d': 32, '2-3d': 46, '4-7d': 17, '8-14d': 4, '15-30d': 1, '>30d': 0 } },
];

// Helper function to map provider code to display name
const getProviderDisplayName = (code: string): string => {
  const displayMap: Record<string, string> = {
    'bluedart': 'Blue Dart',
    'delhivery': 'Delhivery',
    'dtdc': 'DTDC',
    'grow_simple': 'Grow Simple',
    'paytm': 'Paytm',
    'payu': 'PayU',
    'shadowfax': 'Shadowfax',
    'shiprocket': 'Shiprocket',
  };
  return displayMap[code.toLowerCase()] || code;
};
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
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowRight,
  Download as DownloadIcon,
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';
import { apiService } from '../services/api/apiService';
import { MarketplaceReconciliationResponse, MainSummaryResponse, ProviderAgeingData, AgeingAnalysisResponse } from '../services/api/types';
import { api as apiIndex } from '../services/api';
import { mockReconciliationData, getSafeReconciliationData, isValidReconciliationData } from '../data/mockReconciliationData';
import { Platform } from '../data/mockData';
import { padding } from '@mui/system';

const MarketplaceReconciliation: React.FC = () => {
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [initialTsTab, setInitialTsTab] = useState<number>(0);
  const [selectedProviderPlatform, setSelectedProviderPlatform] = useState<'flipkart' | 'd2c' | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [reconciliationData, setReconciliationData] = useState<MarketplaceReconciliationResponse>(mockReconciliationData);
  const [mainSummary, setMainSummary] = useState<MainSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isCodExpanded, setIsCodExpanded] = useState(false);
  const [expandedProviderKey, setExpandedProviderKey] = useState<string | null>(null);
  
  // Sales overview data state
  const [salesOverview, setSalesOverview] = useState({
    netRevenue: { value: "33836255", label: "Net Revenue" },
    grossRevenue: { value: "42126513", label: "Gross Revenue" },
    returns: { value: "8290258", label: "Returns" },
    monthData: [
      { month: "March 2025", gross: "44112585", net: "37085655", returns: "7026930" },
      { month: "April 2025", gross: "35614873", net: "29894054", returns: "5720819" }
    ]
  });
  const [activeMainTab, setActiveMainTab] = useState<'recon' | 'dispute'>('recon');
  const handleMainTabChange = (_: any, value: number) => setActiveMainTab(value === 0 ? 'recon' : 'dispute');

  // Dispute tab states
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: open, 1: raised
  const handleDisputeSubTabChange = (_: any, value: number) => setDisputeSubTab(value);
  const [disputeRows, setDisputeRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }>>([]);
  const [selectedDisputeIds, setSelectedDisputeIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Main transactions tab state
  const [transactionsTab, setTransactionsTab] = useState<number>(0); // 0: reconciled, 1: unreconciled
  const handleTransactionsTabChange = (_: any, value: number) => setTransactionsTab(value);

  // Underline for first two transaction tabs (Matched + Mismatched)
  const tabsGroupRef = useRef<HTMLDivElement | null>(null);
  const [tabsUnderline, setTabsUnderline] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const computeUnderline = () => {
      if (!tabsGroupRef.current) return;
      const wrapper = tabsGroupRef.current;
      const tabEls = wrapper.querySelectorAll('[role="tab"]');
      if (tabEls.length < 2) return;
      const firstRect = (tabEls[0] as HTMLElement).getBoundingClientRect();
      const secondRect = (tabEls[1] as HTMLElement).getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const left = firstRect.left - wrapperRect.left;
      const right = secondRect.left - wrapperRect.left + secondRect.width;
      const width = Math.max(0, right - left);
      setTabsUnderline({ left, width });
    };

    computeUnderline();
    window.addEventListener('resize', computeUnderline);
    return () => window.removeEventListener('resize', computeUnderline);
  }, [transactionsTab]);
  
  // Unreconciled tab state
  const [unreconciledTab, setUnreconciledTab] = useState<number>(0); // 0: by reasons, 1: by providers
  const handleUnreconciledTabChange = (_: any, value: number) => setUnreconciledTab(value);

  // Ageing analysis state
  const [ageingData, setAgeingData] = useState<ProviderAgeingData[]>([]);
  const [ageingLoading, setAgeingLoading] = useState(false);

  // Sync data sources state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
  
  // Month selector menu state
  const [monthMenuAnchorEl, setMonthMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Date range filter state
  const [selectedDateRange, setSelectedDateRange] = useState('custom');
  const [dateRangeMenuAnchor, setDateRangeMenuAnchor] = useState<null | HTMLElement>(null);
  const [customStartDate, setCustomStartDate] = useState<string>('2025-03-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2025-03-31');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  // Date field filter for transactions-related queries
  const [dateField, setDateField] = useState<'settlement' | 'invoice'>('invoice');
  const [unreconciledReasons, setUnreconciledReasons] = useState<Array<{ reason: string; count: number }>>([]);
  
  // Ageing summary (Avg TAT across providers) - use real data if available, otherwise dummy
  const overallAvgTAT = ageingData.length > 0 
    ? (ageingData.reduce((sum, p) => sum + p.averageDaysToSettle, 0) / ageingData.length).toFixed(1)
    : (PROVIDER_AGEING_DATA.reduce((sum, p) => sum + p.averageDaysToSettle, 0) / PROVIDER_AGEING_DATA.length).toFixed(1);

  // Generate chart data from ageing data (convert counts to percentages for display)
  const generateAgeingChartData = () => {
    if (ageingData.length === 0) {
      // Fallback to dummy data
      return PROVIDER_AGEING_DATA.map((p) => {
        const row: any = { provider: p.provider, avgTat: p.averageDaysToSettle };
        AGE_BUCKETS.forEach((b) => { row[b] = p.distribution[b]; });
        return row;
      });
    }

    return ageingData.map((item) => {
      const row: any = { 
        provider: getProviderDisplayName(item.settlement_provider), 
        avgTat: item.averageDaysToSettle 
      };
      
      // Calculate total for percentage conversion
      const total = AGE_BUCKETS.reduce((sum, bucket) => sum + (item.distribution[bucket] || 0), 0);
      
      // Convert counts to percentages
      AGE_BUCKETS.forEach((bucket) => { 
        row[bucket] = total > 0 ? (item.distribution[bucket] || 0) / total * 100 : 0;
      });
      
      return row;
    });
  };

  const ageingChartData = generateAgeingChartData();

  // Calendar popup state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');
  const calendarPopupRef = useRef<HTMLDivElement>(null);

  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: 'Today', dates: 'Today' },
    { value: 'this-week', label: 'This week', dates: 'This week' },
    { value: 'this-month', label: 'This month', dates: 'This month' },
    { value: 'this-year', label: 'This year', dates: 'This year' },
    { value: 'custom', label: 'Custom date range', dates: 'Custom' }
  ];

  const handleDownloadCSV = () => {
    try {
      const dateRangeText = getCurrentDateRangeText();
      const startDateText = customStartDate || '';
      const endDateText = customEndDate || '';

      const csvEscape = (value: any) => {
        const str = value == null ? '' : String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const safeNum = (n: any) => (typeof n === 'number' && isFinite(n) ? n : parseFloat(n || '0') || 0);
      const amt = (s: any) => safeNum(parseAmount(String(s || '0')));

      const rows: Array<string[]> = [];

      // Meta
      rows.push(['Section', 'Key', 'Value']);
      rows.push(['Context', 'Date Range', dateRangeText]);
      rows.push(['Context', 'Start Date', startDateText]);
      rows.push(['Context', 'End Date', endDateText]);
      rows.push(['Context', 'Date Field', dateField]);
      rows.push(['Context', 'Platforms', (selectedPlatforms || []).join(' | ')]);
      rows.push(['Context', 'Main Tab', activeMainTab]);

      // High-level summary (what is currently shown on cards)
      const s = (mainSummary as any)?.summary;
      if (s) {
        rows.push(['', '', '']);
        rows.push(['Summary', 'Total Transactions (count)', String(safeNum(s.total_transactions_count))]);
        rows.push(['Summary', 'Total Transactions (amount)', String(safeNum(s.total_transactions_amount))]);
        rows.push(['Summary', 'Total Reconciled (count)', String(safeNum(s.total_reconciled_count))]);
        rows.push(['Summary', 'Total Reconciled (amount)', String(safeNum(s.total_reconciled_amount))]);
        rows.push(['Summary', 'Total Unreconciled (count)', String(safeNum(s.total_unreconciled_count))]);
        rows.push(['Summary', 'Total Unreconciled (amount)', String(safeNum(s.total_unreconciled_amount))]);
      } else if (reconciliationData?.summaryData) {
        const sd = reconciliationData.summaryData as any;
        const grossSales = amt(reconciliationData.grossSales);
        rows.push(['', '', '']);
        rows.push(['Summary', 'Gross Sales', String(grossSales)]);
        rows.push(['Summary', 'Total Transactions (count)', String(safeNum(sd?.totalTransaction?.number))]);
        rows.push(['Summary', 'Total Transactions (amount)', String(amt(sd?.totalTransaction?.amount))]);
        rows.push(['Summary', 'Reconciled Orders (count)', String(safeNum(sd?.totalReconciled?.number))]);
        rows.push(['Summary', 'Reconciled Orders (amount)', String(amt(sd?.totalReconciled?.amount))]);
        rows.push(['Summary', 'Unreconciled (count)', String(safeNum(sd?.totalUnreconciled?.number))]);
        rows.push(['Summary', 'Unreconciled (amount)', String(amt(sd?.totalUnreconciled?.amount))]);
      }

      // Unreconciled section: whatever is visible
      if (activeMainTab === 'recon') {
        rows.push(['', '', '']);
        if (unreconciledTab === 0) {
          rows.push(['Unreconciled Reasons', 'Reason', 'Count']);
          if (unreconciledReasons && unreconciledReasons.length > 0) {
            unreconciledReasons.forEach((r) => {
              rows.push(['Unreconciled Reasons', String(r.reason), String(safeNum(r.count))]);
            });
          } else {
            rows.push(['Unreconciled Reasons', 'None', '0']);
          }
        } else if (unreconciledTab === 1) {
          // Providers view: export what the screen shows using UnReconcile/Reconcile splits
          const splitRec = splitGatewaysAndCod((mainSummary as any)?.Reconcile);
          const splitUnrec = splitGatewaysAndCod((mainSummary as any)?.UnReconcile);
          // Matched by Providers
          if (splitRec) {
            rows.push(['Matched by Providers', 'Provider', 'Amount']);
            [...(splitRec.gateways || []), ...(splitRec.cod || [])].forEach((p: any) => {
              rows.push(['Matched by Providers', String(p.name), String(safeNum(p.amount))]);
            });
          }
          // Unreconciled by Providers
          if (splitUnrec) {
            rows.push(['Unreconciled by Providers', 'Provider', 'Amount']);
            [...(splitUnrec.gateways || []), ...(splitUnrec.cod || [])].forEach((p: any) => {
              rows.push(['Unreconciled by Providers', String(p.name), String(safeNum(p.totalSaleAmount ?? p.amount))]);
            });
          }
        }
      }

      const csv = rows
        .map((r) => r.map(csvEscape).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `reconciliation_${dateField}_${(startDateText || 'start')}_${(endDateText || 'end')}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  // Get current date range display text
  const getCurrentDateRangeText = () => {
    if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    
    const today = new Date();
    let startDate, endDate;
    
    if (selectedDateRange === 'today') {
      startDate = endDate = today.toISOString().split('T')[0];
    } else if (selectedDateRange === 'this-week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = endOfWeek.toISOString().split('T')[0];
    } else if (selectedDateRange === 'this-month') {
      startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate = endOfMonth.toISOString().split('T')[0];
    } else if (selectedDateRange === 'this-year') {
      startDate = `${today.getFullYear()}-01-01`;
      endDate = `${today.getFullYear()}-12-31`;
    }
    
    return startDate && endDate ? `${startDate} to ${endDate}` : 'Select date';
  };

  // Handle date range selection
  const handleDateRangeSelect = (value: string) => {
    console.log('handleDateRangeSelect called with:', value);
    setSelectedDateRange(value);
    if (value !== 'custom') {
      setDateRangeMenuAnchor(null);
    } else {
      console.log('Setting showCustomDatePicker to true');
      setShowCustomDatePicker(true);
      setDateRangeMenuAnchor(null);
    }
  };



  // Initialize calendar dates when custom picker opens
  useEffect(() => {
    console.log('showCustomDatePicker changed to:', showCustomDatePicker);
    if (showCustomDatePicker) {
      // Only set calendar date if it hasn't been set before
      if (!currentCalendarDate || currentCalendarDate.getTime() === 0) {
        const today = new Date();
        setCurrentCalendarDate(today);
        if (!customStartDate) {
          setCustomStartDate(today.toISOString().split('T')[0]);
        }
      } else if (!customStartDate) {
        // If calendar date is already set but no custom start date, set it
        const today = new Date();
        setCustomStartDate(today.toISOString().split('T')[0]);
      }
    }
  }, [showCustomDatePicker, customStartDate, currentCalendarDate]);

  // Removed redundant fetch on dateField; consolidated in unified effect below

  // Removed separate initial reasons fetch; handled in unified effect

  // Handle click outside calendar popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarPopupRef.current && !calendarPopupRef.current.contains(event.target as Node)) {
        setShowCustomDatePicker(false);
      }
    };

    if (showCustomDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomDatePicker]);

  // Calendar helper functions
  const currentCalendarMonth = currentCalendarDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const handleCalendarMonthChange = (direction: number) => {
    setCurrentCalendarDate(new Date(
      currentCalendarDate.getFullYear(),
      currentCalendarDate.getMonth() + direction,
      1
    ));
  };

  // Function to jump to a specific month (useful for selecting dates from different months)
  const jumpToMonth = (year: number, month: number) => {
    setCurrentCalendarDate(new Date(year, month, 1));
  };

  // Helper function to calculate the actual date from calendar grid position
  const getDateFromCalendarPosition = (day: string) => {
    if (!day) return null;
    
    // The day parameter is the actual day number (1-31) from the current month
    // We need to create the correct date object
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Create the date for the clicked day in the current month
    const clickedDate = new Date(year, month, parseInt(day));
    
    return clickedDate;
  };

  const getCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      if (date.getMonth() === month) {
        days.push(date.getDate().toString());
      } else {
        days.push('');
      }
    }
    return days;
  };

  const handleCalendarDateClick = (day: string) => {
    if (!day) return;
    
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return;
    
    // Use toLocaleDateString to avoid timezone issues with toISOString
    const dateString = clickedDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
    
    console.log('Calendar date clicked:', { 
      day, 
      dateString, 
      tempStartDate, 
      tempEndDate, 
      clickedDate,
      currentCalendarDate: currentCalendarDate.toISOString(),
      clickedDateMonth: clickedDate.getMonth(),
      clickedDateDate: clickedDate.getDate(),
      clickedDateYear: clickedDate.getFullYear()
    });
    
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(dateString);
      setTempEndDate('');
      setCustomStartDate(dateString);
      setCustomEndDate('');
      console.log('Started new selection with:', dateString);
    } else {
      // Complete selection
      if (new Date(dateString) < new Date(tempStartDate)) {
        // If second date is before first date, swap them
        setTempEndDate(tempStartDate);
        setTempStartDate(dateString);
        setCustomStartDate(dateString);
        setCustomEndDate(tempStartDate);
        console.log('Completed selection (reversed):', { start: dateString, end: tempStartDate });
        
        // Auto-call API when selection is completed with current values
        const currentStartDate = dateString;
        const currentEndDate = tempStartDate;
        
        // Update the state first
        setCustomStartDate(currentStartDate);
        setCustomEndDate(currentEndDate);
        
        // Then update state; unified effect will fetch
        setCustomStartDate(currentStartDate);
        setCustomEndDate(currentEndDate);
        fetchUnreconciledReasonsWithDates(currentStartDate, currentEndDate);
        setShowCustomDatePicker(false); // Hide popup
      } else {
        // Normal case: second date is after first date
        setTempEndDate(dateString);
        setCustomEndDate(dateString);
        console.log('Completed selection:', { start: tempStartDate, end: dateString });
        
        // Auto-call API when selection is completed with current values
        // Use the current values directly instead of waiting for state update
        const currentStartDate = tempStartDate;
        const currentEndDate = dateString;
        
        // Update the state first
        setCustomStartDate(currentStartDate);
        setCustomEndDate(currentEndDate);
        
        // Then update state; unified effect will fetch
        setCustomStartDate(currentStartDate);
        setCustomEndDate(currentEndDate);
        fetchUnreconciledReasonsWithDates(currentStartDate, currentEndDate);
        setShowCustomDatePicker(false); // Hide popup
      }
    }
    
    // Keep the calendar on the same month when selecting dates
    // Don't change currentCalendarDate here
  };

  const isDateSelected = (day: string) => {
    if (!day) return false;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return false;
    
    // Use toLocaleDateString to avoid timezone issues with toISOString
    const dateString = clickedDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
    return dateString === customStartDate || dateString === customEndDate;
  };

  const isDateInRange = (day: string) => {
    if (!day || !customStartDate || !customEndDate) return false;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return false;
    
    // Use toLocaleDateString to avoid timezone issues with toISOString
    const dateString = clickedDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
    const date = new Date(dateString);
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    return date >= start && date <= end;
  };

  // Helpers for INR formatting and normalization for main summary
  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
  const ensureNegative = (n: number) => (n == null ? 0 : -Math.abs(n));

  const DISPLAY_NAME_MAP: Record<string, string> = {
    paytm: 'Paytm',
    payU: 'PayU',
    flipkart: 'Flipkart',
    grow_simple: 'Grow Simple',
    shiprocket: 'Shiprocket',
    delhivery: 'Delhivery',
    dtdc: 'DTDC',
    bluedart: 'Blue Dart',
    shadowfax: 'Shadowfax',
  };

  type NormalizedProvider = {
    code: string;
    displayName: string;
    totalCount: number;
    totalSaleAmount: number;
    totalCommission: number;
    totalGstOnCommission: number;
  };

  const normalizeProvidersBlock = (block?: any): NormalizedProvider[] => {
    if (!block || !block.providers) return [];
    const { providers } = block;
    const out: NormalizedProvider[] = [];
    const pushOne = (p: any) => {
      if (!p) return;
      out.push({
        code: p.platform,
        displayName: DISPLAY_NAME_MAP[p.platform] || p.platform,
        totalCount: Number(p.total_count || 0),
        totalSaleAmount: Number(p.total_sale_amount || 0),
        totalCommission: Number(p.total_comission || 0),
        totalGstOnCommission: Number(p.total_gst_on_comission || 0),
      });
    };
    // Known keys
    pushOne(providers.paytm);
    pushOne(providers.payU);
    pushOne(providers.flipkart);
    if (Array.isArray(providers.cod)) providers.cod.forEach(pushOne);
    // Any other dynamic providers
    Object.keys(providers).forEach((k) => {
      if (k === 'paytm' || k === 'payU' || k === 'flipkart' || k === 'cod') return;
      const val = providers[k];
      if (Array.isArray(val)) val.forEach(pushOne); else pushOne(val);
    });
    return out;
  };

  const splitGatewaysAndCod = (block?: any): { gateways: NormalizedProvider[]; cod: NormalizedProvider[] } => {
    if (!block || !block.providers) return { gateways: [], cod: [] };
    const { providers } = block;
    const mapOne = (p: any): NormalizedProvider => ({
      code: p.platform,
      displayName: DISPLAY_NAME_MAP[p.platform] || p.platform,
      totalCount: Number(p.total_count || 0),
      totalSaleAmount: Number(p.total_sale_amount || 0),
      totalCommission: Number(p.total_comission || 0),
      totalGstOnCommission: Number(p.total_gst_on_comission || 0),
    });
    const gateways: NormalizedProvider[] = [];
    Object.keys(providers).forEach((k) => {
      if (k === 'cod') return;
      const val = providers[k];
      if (val && typeof val === 'object') gateways.push(mapOne(val));
    });
    const codArray: NormalizedProvider[] = Array.isArray(providers.cod) ? providers.cod.map(mapOne) : [];
    return { gateways, cod: codArray };
  };

  // Fetch reconciliation data based on date range (legacy fetch for existing UI)
  const fetchReconciliationDataByDateRange = async (dateRange: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let startDate: string;
      let endDate: string;
      
      if (dateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
        console.log('Custom date range selected:', { customStartDate, customEndDate, startDate, endDate });
      } else if (dateRange === 'today') {
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'this-week') {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = endOfWeek.toISOString().split('T')[0];
      } else if (dateRange === 'this-month') {
        const today = new Date();
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = endOfMonth.toISOString().split('T')[0];
              } else if (dateRange === 'this-year') {
          const today = new Date();
          startDate = `${today.getFullYear()}-01-01`;
          endDate = `${today.getFullYear()}-12-31`;
                } else {
          // Fallback to current month
          const today = new Date();
          startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endDate = endOfMonth.toISOString().split('T')[0];
        }
      
      // Call main-summary for unified sections
      try {
        const mainSummaryParams = {
          start_date: startDate,
          end_date: endDate,
          date_field: dateField === 'invoice' ? 'invoice_date' : 'settlement_date',
          platform: selectedPlatforms,
        };
        const ms = await apiIndex.mainSummary.getMainSummary(mainSummaryParams);
        // ms is ApiResponse<any>; data is payload
        const payload = (ms as any).data as MainSummaryResponse;
        setMainSummary(payload);
        // Update reasons from UnReconcile for UI where needed
        if (payload?.UnReconcile?.reasons?.length) {
          setUnreconciledReasons(payload.UnReconcile.reasons.map(r => ({ reason: r.name, count: r.count })));
        }
      } catch (e) {
        // Non-fatal for now
        console.warn('main-summary fetch failed', e);
      }
    } catch (err) {
      console.error('Error fetching reconciliation data:', err);
      // Fallback to mock data on error
      setReconciliationData(mockReconciliationData);
      setUsingMockData(true);
      setError('Network error, showing sample data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reconciliation data with specific start and end dates
  const fetchReconciliationDataByDateRangeWithDates = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call main-summary for unified sections
      try {
        const mainSummaryParams = {
          start_date: startDate,
          end_date: endDate,
          date_field: dateField === 'invoice' ? 'invoice_date' : 'settlement_date',
          platform: selectedPlatforms,
        };
        const ms = await apiIndex.mainSummary.getMainSummary(mainSummaryParams);
        const payload = (ms as any).data as MainSummaryResponse;
        setMainSummary(payload);
        if (payload?.UnReconcile?.reasons?.length) {
          setUnreconciledReasons(payload.UnReconcile.reasons.map(r => ({ reason: r.name, count: r.count })));
        }
      } catch (e) {
        console.warn('main-summary fetch failed', e);
      }
    } catch (err) {
      console.error('Error fetching reconciliation data:', err);
      // Fallback to mock data on error
      setReconciliationData(mockReconciliationData);
      setUsingMockData(true);
      setError('Network error, showing sample data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch unreconciled reasons by date range preset
  const fetchUnreconciledReasonsByDateRange = async (dateRange: string) => {
    try {
      let startDate: string;
      let endDate: string;
      const today = new Date();
      if (dateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
      } else if (dateRange === 'today') {
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'this-week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = endOfWeek.toISOString().split('T')[0];
      } else if (dateRange === 'this-month') {
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = endOfMonth.toISOString().split('T')[0];
      } else if (dateRange === 'this-year') {
        startDate = `${today.getFullYear()}-01-01`;
        endDate = `${today.getFullYear()}-12-31`;
      } else {
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = endOfMonth.toISOString().split('T')[0];
      }
      await fetchUnreconciledReasonsWithDates(startDate, endDate);
    } catch (e) {
      // ignore
    }
  };

  // Fetch unreconciled reasons with explicit dates
  const fetchUnreconciledReasonsWithDates = async (startDate: string, endDate: string) => {
    try {
      // Call /recon/main-summary to get UnReconcile.reasons
      // Reasons are available for platform=d2c or platform=all/combined
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        date_field: dateField === 'invoice' ? 'invoice_date' : 'settlement_date',
        platform: selectedPlatforms.length > 0 ? selectedPlatforms : ['d2c']
      };
      
      const resp = await apiIndex.mainSummary.getMainSummary(params);
      
      if (resp.success && resp.data) {
        const summaryData = resp.data as any;
        const unreconciledReasons = summaryData.UnReconcile?.reasons || [];
        
        // Transform the reasons data to match the expected format
        const list = Object.entries(unreconciledReasons)
          .map(([reason, count]) => ({ reason, count: count as number }))
          .sort((a, b) => b.count - a.count);
        
        setUnreconciledReasons(list);
      } else {
        setUnreconciledReasons([]);
      }
    } catch (e) {
      console.error('Error fetching unreconciled reasons:', e);
      setUnreconciledReasons([]);
    }
  };

  // Fetch ageing analysis data
  const fetchAgeingAnalysis = async () => {
    try {
      setAgeingLoading(true);
      
      // Get current date range
      let startDate: string;
      let endDate: string;
      const today = new Date();
      
      if (selectedDateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
      } else if (selectedDateRange === 'today') {
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (selectedDateRange === 'this-week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = endOfWeek.toISOString().split('T')[0];
      } else if (selectedDateRange === 'this-month') {
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = endOfMonth.toISOString().split('T')[0];
      } else if (selectedDateRange === 'this-year') {
        startDate = `${today.getFullYear()}-01-01`;
        endDate = `${today.getFullYear()}-12-31`;
      } else {
        // Fallback to current month
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = endOfMonth.toISOString().split('T')[0];
      }
      
      // Determine platform parameter
      const platformParam = selectedPlatforms.length > 0 ? selectedPlatforms.join(',') : undefined;
      
      const params = {
        platform: platformParam,
        invoice_date_from: startDate,
        invoice_date_to: endDate,
      };
      
      const response = await apiIndex.ageingAnalysis.getAgeingAnalysis(params);
      
      if (response.success && response.data?.data?.providerAgeingData) {
        setAgeingData(response.data.data.providerAgeingData);
      } else {
        console.warn('Ageing analysis API returned unexpected format:', response);
        setAgeingData([]);
      }
    } catch (error) {
      console.error('Error fetching ageing analysis:', error);
      setAgeingData([]);
    } finally {
      setAgeingLoading(false);
    }
  };
  
  // Platform selector state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['flipkart']);
  const [platformMenuAnchorEl, setPlatformMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [tempSelectedPlatforms, setTempSelectedPlatforms] = useState<Platform[]>([]);
  
  // Available platforms
  const availablePlatforms = [
    { value: 'flipkart' as Platform, label: 'Flipkart' },
    { value: 'amazon' as Platform, label: 'Amazon' },
    { value: 'd2c' as Platform, label: 'D2C' }
  ];

  // Generate D2C dummy data
  const buildD2CDemoData = (): MarketplaceReconciliationResponse => {
    return {
      grossSales: "850000",
      ordersDelivered: {
        amount: "850000",
        number: 1250
      },
      ordersReturned: {
        amount: "15000",
        number: 25
      },
      commission: {
        totalCommission: "0",
        commissionRate: "0.00"
      },
      settledSales: "850000",
      summaryData: {
        totalTransaction: {
          amount: "850000",
          number: 1250
        },
        netSalesAsPerSalesReport: {
          amount: "835000",
          number: 1225
        },
        paymentReceivedAsPerSettlementReport: {
          amount: "820000",
          number: 1200
        },
        totalUnreconciled: {
          amount: "15000",
          number: 25,
          lessPaymentReceivedFromFlipkart: {
            amount: "5000",
            number: 10
          },
          excessPaymentReceivedFromFlipkart: {
            amount: "10000",
            number: 15
          }
        },
        totalReconciled: {
          amount: "820000",
          number: 1200
        },
        pendingPaymentFromMarketplace: {
          amount: "0",
          number: 0
        },
        pendingDeductions: {
          amount: "0",
          number: 0
        },
        returnedOrCancelledOrders: {
          amount: "15000",
          number: 25
        }
      },
      totalTDS: "0",
      totalTDA: "0",
      monthOrdersPayoutReceived: "820000",
      monthOrdersAwaitedSettlement: {
        salesAmount: "0",
        salesOrders: 0
      },
      unsettledReturns: {
        returnAmount: "5000",
        returnsOrders: 5
      },
      difference: "15000",
      returnRate: "1.8",
      commissionRate: "0.00"
    };
  };

  // Apply D2C demo data
  const applyD2CDemoData = () => {
    const d2cData = buildD2CDemoData();
    setReconciliationData(d2cData);
  };

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

  // Function to get gradient color based on reconciliation percentage
  const getReconciliationColor = (percentage: number): string => {
    if (percentage >= 98) {
      // 98-100%: Green to light green
      return '#10b981';
    } else if (percentage >= 90) {
      // 90-97%: Light green to yellow-green
      return '#22c55e';
    } else if (percentage >= 80) {
      // 80-89%: Yellow-green to yellow
      return '#84cc16';
    } else if (percentage >= 70) {
      // 70-79%: Yellow to orange
      return '#eab308';
    } else if (percentage >= 60) {
      // 60-69%: Orange to dark orange
      return '#f97316';
    } else if (percentage >= 50) {
      // 50-59%: Dark orange to red-orange
      return '#ea580c';
    } else {
      // Below 50%: Red
      return '#ef4444';
    }
  };

  const parsePercentage = (percentage: string): number => {
    return parseFloat(percentage) || 0;
  };

  // Fetch Flipkart data (from API) for the currently selected date range
  const fetchFlipkartDataForCurrentRange = async (): Promise<MarketplaceReconciliationResponse> => {
    let startDate = customStartDate;
    let endDate = customEndDate;
    const today = new Date();
    const format = (d: Date) => d.toISOString().split('T')[0];
    if (selectedDateRange !== 'custom') {
      if (selectedDateRange === 'today') {
        startDate = format(today);
        endDate = format(today);
      } else if (selectedDateRange === 'this-week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        startDate = format(startOfWeek);
        endDate = format(endOfWeek);
      } else if (selectedDateRange === 'this-month') {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        endDate = format(endOfMonth);
      } else if (selectedDateRange === 'this-year') {
        startDate = `${today.getFullYear()}-01-01`;
        endDate = `${today.getFullYear()}-12-31`;
      }
    }

    // Flipkart-only: until backend supports legacy dataset via main-summary, fallback to mock
    return mockReconciliationData;
  };

  // Build Amazon demo data (for Amazon-only and All aggregation)
  const buildAmazonDemoData = (): MarketplaceReconciliationResponse => {
    return {
      grossSales: '28500000',
      ordersDelivered: { number: 15180, amount: '26800000' } as any,
      ordersReturned: { number: 520, amount: '700000' } as any,
      commission: { totalCommission: '0', commissionRate: '0' } as any,
      settledSales: '0',
      summaryData: {
        totalTransaction: { number: 18425, amount: '31250000' } as any,
        netSalesAsPerSalesReport: { number: 16230, amount: '28500000' } as any,
        paymentReceivedAsPerSettlementReport: { number: 15080, amount: '26200000' } as any,
        pendingPaymentFromMarketplace: { number: 1150, amount: '600000' } as any,
        totalReconciled: { number: 15080, amount: '26200000' } as any,
        totalUnreconciled: {
          number: 3345,
          amount: '600000',
          lessPaymentReceivedFromFlipkart: { number: 2100, amount: '1450000' } as any,
          excessPaymentReceivedFromFlipkart: { number: 1245, amount: '850000' } as any,
        } as any,
        pendingDeductions: { number: 0, amount: '0' } as any,
        returnedOrCancelledOrders: { number: 720, amount: '980000' } as any,
      } as any,
      totalTDS: '320000',
      totalTDA: '450000',
      monthOrdersPayoutReceived: '26200000',
      monthOrdersAwaitedSettlement: { salesOrders: 0, salesAmount: '0' } as any,
      unsettledReturns: { returnsOrders: 0, returnAmount: '0' } as any,
      difference: '0',
      returnRate: '0',
      commissionRate: '0',
    } as any;
  };

  // Helper to convert numeric to API string amount
  const toAmountString = (value: number): string => {
    return String(Math.round(value || 0));
  };

  // Merge two reconciliation datasets by summing relevant numeric fields
  const mergeReconciliationData = (
    a: MarketplaceReconciliationResponse,
    b: MarketplaceReconciliationResponse
  ): MarketplaceReconciliationResponse => {
    const sumAmount = (x?: string, y?: string) => toAmountString(parseAmount(x || '0') + parseAmount(y || '0'));
    const sumNum = (x?: number, y?: number) => (x || 0) + (y || 0);

    return {
      grossSales: sumAmount(a.grossSales, b.grossSales),
      ordersDelivered: {
        number: sumNum(a.ordersDelivered?.number, b.ordersDelivered?.number),
        amount: sumAmount(a.ordersDelivered?.amount, b.ordersDelivered?.amount),
      } as any,
      ordersReturned: {
        number: sumNum(a.ordersReturned?.number, b.ordersReturned?.number),
        amount: sumAmount(a.ordersReturned?.amount, b.ordersReturned?.amount),
      } as any,
      commission: {
        totalCommission: sumAmount(a.commission?.totalCommission as any, b.commission?.totalCommission as any),
        commissionRate: a.commission?.commissionRate || '0',
      } as any,
      settledSales: sumAmount(a.settledSales as any, b.settledSales as any),
      summaryData: {
        totalTransaction: {
          number: sumNum(a.summaryData?.totalTransaction?.number, b.summaryData?.totalTransaction?.number),
          amount: sumAmount(a.summaryData?.totalTransaction?.amount, b.summaryData?.totalTransaction?.amount),
        } as any,
        netSalesAsPerSalesReport: {
          number: sumNum(a.summaryData?.netSalesAsPerSalesReport?.number, b.summaryData?.netSalesAsPerSalesReport?.number),
          amount: sumAmount(a.summaryData?.netSalesAsPerSalesReport?.amount, b.summaryData?.netSalesAsPerSalesReport?.amount),
        } as any,
        paymentReceivedAsPerSettlementReport: {
          number: sumNum(a.summaryData?.paymentReceivedAsPerSettlementReport?.number, b.summaryData?.paymentReceivedAsPerSettlementReport?.number),
          amount: sumAmount(a.summaryData?.paymentReceivedAsPerSettlementReport?.amount, b.summaryData?.paymentReceivedAsPerSettlementReport?.amount),
        } as any,
        pendingPaymentFromMarketplace: {
          number: sumNum(a.summaryData?.pendingPaymentFromMarketplace?.number, b.summaryData?.pendingPaymentFromMarketplace?.number),
          amount: sumAmount(a.summaryData?.pendingPaymentFromMarketplace?.amount, b.summaryData?.pendingPaymentFromMarketplace?.amount),
        } as any,
        totalReconciled: {
          number: sumNum(a.summaryData?.totalReconciled?.number, b.summaryData?.totalReconciled?.number),
          amount: sumAmount(a.summaryData?.totalReconciled?.amount, b.summaryData?.totalReconciled?.amount),
        } as any,
        totalUnreconciled: {
          number: sumNum(a.summaryData?.totalUnreconciled?.number, b.summaryData?.totalUnreconciled?.number),
          amount: sumAmount(a.summaryData?.totalUnreconciled?.amount, b.summaryData?.totalUnreconciled?.amount),
          lessPaymentReceivedFromFlipkart: {
            number: sumNum(
              a.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.number,
              b.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.number
            ),
            amount: sumAmount(
              a.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.amount,
              b.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.amount
            ),
          } as any,
          excessPaymentReceivedFromFlipkart: {
            number: sumNum(
              a.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.number,
              b.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.number
            ),
            amount: sumAmount(
              a.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.amount,
              b.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.amount
            ),
          } as any,
        } as any,
        pendingDeductions: {
          number: sumNum(a.summaryData?.pendingDeductions?.number, b.summaryData?.pendingDeductions?.number),
          amount: sumAmount(a.summaryData?.pendingDeductions?.amount, b.summaryData?.pendingDeductions?.amount),
        } as any,
        returnedOrCancelledOrders: {
          number: sumNum(a.summaryData?.returnedOrCancelledOrders?.number, b.summaryData?.returnedOrCancelledOrders?.number),
          amount: sumAmount(a.summaryData?.returnedOrCancelledOrders?.amount, b.summaryData?.returnedOrCancelledOrders?.amount),
        } as any,
      } as any,
      totalTDS: sumAmount(a.totalTDS as any, b.totalTDS as any),
      totalTDA: sumAmount(a.totalTDA as any, b.totalTDA as any),
      monthOrdersPayoutReceived: sumAmount(a.monthOrdersPayoutReceived as any, b.monthOrdersPayoutReceived as any),
      monthOrdersAwaitedSettlement: {
        salesOrders: sumNum(a.monthOrdersAwaitedSettlement?.salesOrders, b.monthOrdersAwaitedSettlement?.salesOrders),
        salesAmount: sumAmount(a.monthOrdersAwaitedSettlement?.salesAmount, b.monthOrdersAwaitedSettlement?.salesAmount),
      } as any,
      unsettledReturns: {
        returnsOrders: sumNum(a.unsettledReturns?.returnsOrders, b.unsettledReturns?.returnsOrders),
        returnAmount: sumAmount(a.unsettledReturns?.returnAmount, b.unsettledReturns?.returnAmount),
      } as any,
      difference: sumAmount(a.difference as any, b.difference as any),
      returnRate: a.returnRate || '0',
      commissionRate: a.commissionRate || '0',
    } as any;
  };

  // Apply demo data for Amazon selection
  const applyAmazonDemoData = () => {
    try {
      const demo: MarketplaceReconciliationResponse = JSON.parse(JSON.stringify(reconciliationData));

      // High-level sales numbers
      (demo as any).grossSales = '28500000';
      (demo as any).totalTDA = '450000';
      (demo as any).totalTDS = '320000';

      // Summary data
      demo.summaryData.totalTransaction = { number: 18425, amount: '31250000' } as any;
      demo.summaryData.netSalesAsPerSalesReport = { number: 16230, amount: '28500000' } as any;
      demo.summaryData.paymentReceivedAsPerSettlementReport = { number: 15080, amount: '26200000' } as any;
      demo.summaryData.pendingPaymentFromMarketplace = { number: 1150, amount: '600000' } as any;
      demo.summaryData.totalReconciled = { number: 15080, amount: '26200000' } as any;
      demo.summaryData.totalUnreconciled = {
        number: 3345,
        amount: '600000',
        lessPaymentReceivedFromFlipkart: { number: 2100, amount: '1450000' },
        excessPaymentReceivedFromFlipkart: { number: 1245, amount: '850000' },
      } as any;
      demo.summaryData.returnedOrCancelledOrders = { number: 720, amount: '980000' } as any;

      // Orders delivered/returned (if present on the shape)
      (demo as any).ordersDelivered = { number: 15180, amount: '26800000' };
      (demo as any).ordersReturned = { number: 520, amount: '700000' };

      setReconciliationData(demo);

      // Demo unreconciled reasons (AI insight)
      setUnreconciledReasons([
        { reason: 'Commission mismatch', count: 132 },
        { reason: 'Weight discrepancy fee', count: 97 },
        { reason: 'Return not received in time', count: 74 },
        { reason: 'Shipping overcharge', count: 58 },
        { reason: 'Promotional fee variance', count: 41 },
      ]);

      // Demo sales overview
      setSalesOverview({
        netRevenue: { value: '26200000', label: 'Net Revenue' },
        grossRevenue: { value: '28500000', label: 'Gross Revenue' },
        returns: { value: '980000', label: 'Returns' },
        monthData: [
          { month: 'February 2025', gross: '25500000', net: '23200000', returns: '600000' },
          { month: 'March 2025', gross: '28500000', net: '26200000', returns: '980000' },
        ],
      });
    } catch (e) {
      // no-op
    }
  };

  // Fetch sales overview data from backend
  const fetchSalesOverview = async () => {
    try {
      // In a real implementation, you would make an API call here
      // const response = await apiService.getSalesOverview();
      // setSalesOverview(response.data.salesOverview);
      
      // For now, using the mock data that represents the backend response
      console.log('Sales overview data loaded from backend');
      
      // You can uncomment and modify this when the actual API is ready:
      // const response = await apiService.getSalesOverview();
      // if (response.success && response.data) {
      //   setSalesOverview(response.data.salesOverview);
      // }
      
    } catch (err) {
      console.error('Error fetching sales overview:', err);
      // Keep using the default state data if API fails
    }
  };

  // Init dispute mock data
  useEffect(() => {
    if (disputeRows.length === 0) {
      const remarks = ['Short Amount Received', 'Excess Amount Received', 'Pending Settlement'];
      const rows: Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }> = [];
      for (let i = 0; i < 12; i++) {
        rows.push({
          id: `DISP_${1000 + i}`,
          orderItemId: `FK${12345 + i}`,
          orderDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
          difference: (i % 2 === 0 ? 1 : -1) * (500 + i * 25),
          remark: remarks[i % remarks.length],
          eventType: i % 3 === 0 ? 'Return' : 'Sale',
          status: i % 3 === 0 ? 'raised' : 'open',
        });
      }
      setDisputeRows(rows);
    }
  }, []);

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

  // Dispute helpers
  const currentDisputeRows = disputeRows.filter(r => (disputeSubTab === 0 ? r.status === 'open' : r.status === 'raised'));
  const allSelectedInView = currentDisputeRows.length > 0 && currentDisputeRows.every(r => selectedDisputeIds.includes(r.id));
  const toggleSelectAllInView = () => {
    if (allSelectedInView) {
      setSelectedDisputeIds(prev => prev.filter(id => !currentDisputeRows.some(r => r.id === id)));
    } else {
      setSelectedDisputeIds(prev => Array.from(new Set([...prev, ...currentDisputeRows.map(r => r.id)])));
    }
  };
  const toggleSelectRow = (id: string) => {
    setSelectedDisputeIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const sendSelectedToFlipkart = () => {
    if (selectedDisputeIds.length === 0) return;
    setSnackbarOpen(true);
    setDisputeRows(prev => prev.map(r => (selectedDisputeIds.includes(r.id) ? { ...r, status: 'raised' } : r)));
    setSelectedDisputeIds([]);
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
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        date_field: dateField === 'invoice' ? 'buyer_invoice_date' : 'settlement_date'
      };
      
      const response = await apiService.get('/recon/fetchStats', params);
      
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

  // Unified data fetch effect: triggers on relevant inputs; guarded for dev StrictMode
  const didInitRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (didInitRef.current) return;
      didInitRef.current = true;
    }
    if (selectedDateRange === 'custom') {
      if (customStartDate && customEndDate) {
        fetchReconciliationDataByDateRangeWithDates(customStartDate, customEndDate);
      }
    } else {
      fetchReconciliationDataByDateRange(selectedDateRange);
    }
    // Keep unreconciled reasons in sync
    if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      fetchUnreconciledReasonsWithDates(customStartDate, customEndDate);
    } else {
      fetchUnreconciledReasonsByDateRange(selectedDateRange);
    }
    // Fetch ageing analysis data
    fetchAgeingAnalysis();
  }, [selectedDateRange, customStartDate, customEndDate, dateField, selectedPlatforms]);

  // Load sales overview data
  useEffect(() => {
    fetchSalesOverview();
  }, []);

  // Open Transaction Sheet overlay when query params indicate so
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openTs = params.get('openTs') || params.get('openTransactionSheet');
    const tabParam = params.get('tab');

    if (openTs && !showTransactionSheet) {
      const normalizedTab = (tabParam || '').toLowerCase().trim();
      if (normalizedTab === 'unreconciled' || normalizedTab === 'unreconciled orders') {
        setInitialTsTab(0);
      } else if (normalizedTab === 'settled') {
        setInitialTsTab(1);
      } else if (normalizedTab === 'unsettled') {
        setInitialTsTab(2);
      } else {
        setInitialTsTab(0);
      }
      setShowTransactionSheet(true);
      // Clear query params after opening to avoid re-triggering
      navigate('/marketplace-reconciliation', { replace: true });
    }
  }, [location.search, showTransactionSheet, navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#fafafa',
      position: 'relative',
      overflow: 'hidden',
      mt: -4
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
          borderRadius: '20px',
        }}
        onClick={() => {
          console.log('Button clicked, setting showTransactionSheet to true');
          setShowTransactionSheet(true);
        }}
      >
        <ArrowUpIcon sx={{ mb: 1, transform: 'rotate(90deg)', color: 'white' }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white', fontSize: '0.75rem' }}>
          View Transactions
        </Typography>
      </Fab>

      <Box sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
              }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#1a1a1a',
                letterSpacing: '-0.01em',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}>
                Reconciliation
              </Typography>
              
              {/* Date Range Filter */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading && (
                  <CircularProgress size={24} sx={{ color: '#1a1a1a' }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
                <Button
                  variant="outlined"
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={<CalendarTodayIcon />}
                  onClick={(event) => setDateRangeMenuAnchor(event.currentTarget)}
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    textTransform: 'none',
                    minWidth: 200,
                    minHeight: 36,
                    px: 1.5,
                    fontSize: '0.7875rem',
                    '&:hover': {
                      borderColor: '#4B5563',
                      backgroundColor: 'rgba(107, 114, 128, 0.04)',
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
                      {getCurrentDateRangeText()}
                    </Typography>
                  </Box>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadCSV}
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    textTransform: 'none',
                    minHeight: 36,
                    fontSize: '0.7875rem',
                    '&:hover': {
                      borderColor: '#4B5563',
                      backgroundColor: 'rgba(107, 114, 128, 0.04)',
                    },
                  }}
                >
                  Download CSV
                </Button>
                <Menu
                  anchorEl={dateRangeMenuAnchor}
                  open={Boolean(dateRangeMenuAnchor)}
                  onClose={() => setDateRangeMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 250,
                      borderRadius: 0.5, // Reduced from 2 to 0.5 for less rounded corners
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb'
                    }
                  }}
                >
                  <Box sx={{ p: 2, pt: 1.5, padding: '10px 14px' }}>
                    <Typography variant="caption" sx={{ color: '#6b7280', mb: 0.75, display: 'block' }}>Filter by</Typography>
                    <FormControl size="small" fullWidth >
                      <Select
                        labelId="date-field-label"
                        value={dateField}
                        onChange={(e) => { setDateField(e.target.value as any); }}
                        sx={{padding: '4px 6px',
                        }}
                      >
                        <MenuItem value="settlement">Settlement Date</MenuItem>
                        <MenuItem value="invoice">Invoice Date</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  {dateRangeOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      onClick={() => handleDateRangeSelect(option.value)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {option.dates}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>

                {/* Custom Calendar Popup - Appears below date range filter */}
                {showCustomDatePicker && (
                  <Box 
                    ref={calendarPopupRef}
                    sx={{ 
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 1000,
                      mt: 1,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb',
                      p: 1.8, // Reduced from 2 to 1.8 (10% reduction)
                      minWidth: 270 // Reduced from 300 to 270 (10% reduction)
                    }}
                  >
                    {/* Calendar Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 1.8, // Reduced from 2 to 1.8 (10% reduction)
                      px: 0.9 // Reduced from 1 to 0.9 (10% reduction)
                    }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCalendarMonthChange(-1)}
                        sx={{ color: '#6b7280' }}
                      >
                        <KeyboardArrowDownIcon sx={{ transform: 'rotate(90deg)' }} />
                      </IconButton>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1.0125rem' }}>
                        {currentCalendarMonth}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCalendarMonthChange(1)}
                        sx={{ color: '#6b7280' }}
                      >
                        <KeyboardArrowDownIcon sx={{ transform: 'rotate(-90deg)' }} />
                      </IconButton>
                    </Box>

                    {/* Days of Week */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.9, mb: 0.9 }}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <Typography 
                          key={day} 
                          variant="caption" 
                          sx={{ 
                            textAlign: 'center', 
                            color: '#6b7280', 
                            fontWeight: 500,
                            py: 1
                          }}
                        >
                          {day}
                        </Typography>
                      ))}
                    </Box>

                    {/* Calendar Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.9 }}>
                      {getCalendarDays().map((day, index) => (
                        <Box
                          key={index}
                          onClick={() => handleCalendarDateClick(day)}
                          sx={{
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: day ? 'pointer' : 'default',
                            borderRadius: 1,
                            fontSize: '0.7875rem', // Reduced from 0.875rem (10% reduction)
                            fontWeight: 500,
                            color: day ? '#1f2937' : 'transparent',
                            backgroundColor: day ? 'transparent' : 'transparent',
                            border: day && isDateInRange(day) ? '1px solid #3b82f6' : 'none',
                            '&:hover': day ? {
                              backgroundColor: '#f3f4f6'
                            } : {},
                            ...(day && isDateSelected(day) && {
                              color: '#1d4ed8',
                              fontWeight: 700
                            }),
                            ...(day && isDateInRange(day) && !isDateSelected(day) && {
                              color: '#3b82f6'
                            })
                          }}
                        >
                          {day}
                        </Box>
                      ))}
                    </Box>






                  </Box>
                )}

                {/* Platform Selector */}
                <Button
                  variant="outlined"
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={<StorefrontIcon />}
                  onClick={(event) => { setTempSelectedPlatforms(selectedPlatforms); setPlatformMenuAnchorEl(event.currentTarget); }}
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    textTransform: 'none',
                    minWidth: 'auto',
                    minHeight: 36,
                    px: 1.5,
                    fontSize: '0.7875rem',
                    '&:hover': {
                      borderColor: '#4B5563',
                      backgroundColor: 'rgba(107, 114, 128, 0.04)',
                    },
                  }}
                >
                  {selectedPlatforms.length === availablePlatforms.length
                    ? 'All'
                    : (selectedPlatforms.length > 0 
                        ? (availablePlatforms.find(p => p.value === selectedPlatforms[0])?.label || 'Select Platforms')
                        : 'Select Platforms')
                  }
                </Button>
                <Menu
                  anchorEl={platformMenuAnchorEl}
                  open={Boolean(platformMenuAnchorEl)}
                  onClose={() => setPlatformMenuAnchorEl(null)}
                  MenuListProps={{
                    'aria-labelledby': 'platform-select-button',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 260,
                    }
                  }}
                >
                  <Box sx={{ px: 1, py: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>Platforms</Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          if (tempSelectedPlatforms.length === availablePlatforms.length) {
                            setTempSelectedPlatforms([]);
                          } else {
                            setTempSelectedPlatforms(availablePlatforms.map(p => p.value) as Platform[]);
                          }
                        }}
                        sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                      >
                        {tempSelectedPlatforms.length === availablePlatforms.length ? 'Clear all' : 'Select all'}
                      </Button>
                    </Box>
                    {availablePlatforms.map((p) => (
                      <MenuItem
                        key={p.value}
                        onClick={() => {
                          setTempSelectedPlatforms(prev => {
                            const has = prev.includes(p.value);
                            return has ? (prev.filter(x => x !== p.value) as Platform[]) : ([...prev, p.value] as Platform[]);
                          });
                        }}
                        sx={{ py: 1, px: 1, borderRadius: '8px' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox size="small" checked={tempSelectedPlatforms.includes(p.value)} />
                          <Box>
                            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{p.label}</Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>{p.value === 'd2c' ? 'Website / D2C' : 'E-commerce marketplace'}</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={() => setPlatformMenuAnchorEl(null)} sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#e5e7eb' }}>Cancel</Button>
                      <Button
                        variant="contained"
                        disabled={tempSelectedPlatforms.length === 0}
                        onClick={async () => {
                          const next = tempSelectedPlatforms;
                          setSelectedPlatforms(next);
                          try {
                            let data: MarketplaceReconciliationResponse | null = null;
                            if (next.includes('flipkart' as Platform)) {
                              data = await fetchFlipkartDataForCurrentRange();
                            }
                            if (next.includes('amazon' as Platform)) {
                              const amazonDemo = buildAmazonDemoData();
                              data = data ? mergeReconciliationData(data, amazonDemo) : amazonDemo;
                            }
                            if (next.includes('d2c' as Platform)) {
                              const d2cDemo = buildD2CDemoData();
                              data = data ? mergeReconciliationData(data, d2cDemo) : d2cDemo;
                            }
                            if (data) setReconciliationData(data);

                            // Also fetch unified summary from main-summary using selected platforms
                            try {
                              let startDate = customStartDate;
                              let endDate = customEndDate;
                              const today = new Date();
                              const fmt = (d: Date) => d.toISOString().split('T')[0];
                              if (selectedDateRange !== 'custom') {
                                if (selectedDateRange === 'today') {
                                  startDate = fmt(today);
                                  endDate = fmt(today);
                                } else if (selectedDateRange === 'this-week') {
                                  const startOfWeek = new Date(today);
                                  startOfWeek.setDate(today.getDate() - today.getDay());
                                  const endOfWeek = new Date(startOfWeek);
                                  endOfWeek.setDate(startOfWeek.getDate() + 6);
                                  startDate = fmt(startOfWeek);
                                  endDate = fmt(endOfWeek);
                                } else if (selectedDateRange === 'this-month') {
                                  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                  startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
                                  endDate = fmt(endOfMonth);
                                } else if (selectedDateRange === 'this-year') {
                                  startDate = `${today.getFullYear()}-01-01`;
                                  endDate = `${today.getFullYear()}-12-31`;
                                }
                              }

                              const mainSummaryParams = {
                                start_date: startDate,
                                end_date: endDate,
                                platform: next,
                              } as any;
                              const ms = await apiIndex.mainSummary.getMainSummary(mainSummaryParams);
                              const payload = (ms as any).data as MainSummaryResponse;
                              setMainSummary(payload);
                              if (payload?.UnReconcile?.reasons?.length) {
                                setUnreconciledReasons(payload.UnReconcile.reasons.map((r: any) => ({ reason: r.name, count: r.count })));
                              }
                            } catch (e) {
                              console.warn('main-summary fetch failed', e);
                            }
                          } finally {
                            setPlatformMenuAnchorEl(null);
                          }
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </Box>
                </Menu>
                </Box>

                {/* Sync Data Sources Button */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncDataSources}
                    disabled={syncLoading}
                    sx={{
                      mt: 1.5,
                      borderRadius: '6px',
                      borderColor: '#6B7280',
                      color: '#6B7280',
                      textTransform: 'none',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                      minHeight: 36,
                      px: 1.5,
                      fontSize: '0.7875rem',
                      '&:hover': {
                        borderColor: '#4B5563',
                        backgroundColor: 'rgba(107, 114, 128, 0.04)',
                      },
                      '&:disabled': {
                        borderColor: '#d0d0d0',
                        color: '#d0d0d0',
                      },
                    }}
                  >
                    {syncLoading ? 'Syncing...' : 'Sync Data'}
                  </Button>
                  {/* Last Synced Text (below) */}
                  <Typography variant="caption" sx={{
                    color: '#666666',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}>
                    <ScheduleIcon sx={{ fontSize: '0.75rem' }} />
                     synced: {formatLastSynced(lastSynced)}
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

        <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6 }}>
          <Grid item xs={12} md={7}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '16px',
              border: '1px solid #f1f3f4',
              boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
              height: '100%',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent sx={{ p: 0 }}>
                {/* Title */}
                <Box sx={{ 
                  px: 3, 
                  py: 2,
                  background: 'transparent',
                  borderBottom: 'none'
                }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 600,
                    color: '#1f2937',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em', 
                  }}>
                    Reconciliation Summary
                  </Typography>
                </Box>
                <Box sx={{ px: 3, pb: 2, mt: 6 }}>
                  {(() => {
                    // Use main-summary as the sole source for the summary math
                    const s = mainSummary?.summary as any;
                    const totalSalesAmount = Number(s?.total_transactions_amount || 0);
                    const totalSalesCount = Number(s?.total_transaction_orders || 0);

                    const returnsAmount = Number(s?.total_return_amount || 0);
                    const returnsCount = Number(s?.total_return_orders || 0);

                    const cancellationsAmount = Number(s?.total_cancellations_amount || 0);
                    const cancellationsCount = Number(s?.total_cancellations_orders || 0);

                    // Use API-provided net sales values
                    const netSalesAmount = Number(s?.net_sales_amount || 0);
                    const netSalesCount = Number(s?.net_sales_orders || 0);

                    const sections = [
                      { type: 'metric', label: 'Net Sales', amount: netSalesAmount, count: netSalesCount },
                      { type: 'operator', symbol: '=' },
                      { type: 'metric', label: 'Total Sales', amount: totalSalesAmount, count: totalSalesCount },
                      { type: 'operator', symbol: '-' },
                      { type: 'metric', label: 'Returns', amount: returnsAmount, count: returnsCount },
                      { type: 'operator', symbol: '-' },
                      { type: 'metric', label: 'Cancellations', amount: cancellationsAmount, count: cancellationsCount }
                    ];

                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        p: 3
                      }}>
                        {sections.map((section, idx) => (
                          <Box key={idx} sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            textAlign: 'center',
                            minWidth: section.type === 'operator' ? '30px' : '120px'
                          }}>
                            {section.type === 'metric' ? (
                              <>
                                <Typography sx={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 500, 
                                  color: '#6b7280',
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                  mb: 0.5
                                }}>
                                  {section.label}
                                </Typography>
                                <Typography sx={{ 
                                  fontSize: '1.5rem', 
                                  fontWeight: 300, 
                                  color: '#111827',
                                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                                  letterSpacing: '-0.02em',
                                  mb: 0.25
                                }}>
                                  ₹{Math.round(Number(section.amount || 0)).toLocaleString('en-IN')}
                                </Typography>
                                <Typography sx={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 300, 
                                  color: '#9ca3af',
                                  letterSpacing: '0.025em'
                                }}>
                                  {Number(section.count || 0).toLocaleString('en-IN')} orders
                                </Typography>
                              </>
                            ) : (
                              <Typography sx={{ 
                                fontSize: '1.75rem', 
                                fontWeight: 300, 
                                color: '#6b7280',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                                lineHeight: 1
                              }}>
                                {section.symbol}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Reconciliation Status */}
          <Grid item xs={12} md={5}>
                          <Card 
                onClick={() => navigate('/dispute')}
                sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                borderRadius: '16px',
                border: '1px solid #f1f3f4',
                boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
                minHeight: 'fit-content',
                maxHeight: '520px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#1f2937',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  letterSpacing: '-0.025em',
                  textAlign: 'center'
                }}>
                  Reconciliation Status
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 2,
                }}>
                  {/* Gauge Chart */}
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                      width: 140,
                      height: 140,
                      borderRadius: '100%',
                      background: (() => {
                        const s = mainSummary?.summary as any;
                        const reconciledCount = Number(s?.total_reconciled_count || 0);
                        const unreconciledCount = Number(s?.total_unreconciled_count || 0);
                        const totalCount = reconciledCount + unreconciledCount;
                        const matchedPct = totalCount === 0 ? 100 : Math.max(0, Math.min(100, (reconciledCount / totalCount) * 100));
                        const matchedDeg = (matchedPct / 100) * 360;
                        return `conic-gradient(#10b981 0deg, #10b981 ${matchedDeg}deg, #ef4444 ${matchedDeg}deg, #ef4444 360deg)`;
                      })(),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <Box sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      }}>
                        <Typography variant="h4" sx={{
                          fontWeight: 500,
                          color: (() => {
                            const s = mainSummary?.summary as any;
                            const reconciledCount = Number(s?.total_reconciled_count || 0);
                            const unreconciledCount = Number(s?.total_unreconciled_count || 0);
                            const totalCount = reconciledCount + unreconciledCount;
                            const pct = totalCount === 0 ? 100 : Math.max(0, (reconciledCount / totalCount) * 100);
                            return getReconciliationColor(pct);
                          })(),
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          mb: 0.5,
                          fontSize: '1.5rem',
                          letterSpacing: '-0.02em'
                        }}>
                          {(() => {
                            const s = mainSummary?.summary as any;
                            const reconciledCount = Number(s?.total_reconciled_count || 0);
                            const unreconciledCount = Number(s?.total_unreconciled_count || 0);
                            const totalCount = reconciledCount + unreconciledCount;
                            const pct = totalCount === 0 ? 100 : Math.max(0, (reconciledCount / totalCount) * 100);
                            return `${pct.toFixed(1)}%`;
                          })()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Total Unreconciled Transactions Card */}
                    <Box sx={{
                    width: '100%',
                    p: 2,
                    textAlign: 'center',
                    }}>
                                              <Typography variant="body2" sx={{
                        color: '#1f2937',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 500,
                          mb: 1,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                        }}>
                          Total Unreconciled Transactions
                        </Typography>
                    <Typography variant="h5" sx={{
                      color: '#1f2937',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 700,
                      letterSpacing: '-0.02em'
                      }}>
                      {Number(mainSummary?.summary?.total_unreconciled_count || 0).toLocaleString()}
                      </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Comprehensive Unreconciled Section */}
          <Grid item xs={12} md={12}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '16px',
              border: '1px solid #f1f3f4',
              boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                {(() => {
                  // Use UnReconcile.summary strictly for mismatched transactions hero
                  const unrecSummary = (mainSummary as any)?.UnReconcile?.summary || {};
                  const totalUnrecAmount = Number(unrecSummary.total_difference_amount || 0);
                  const totalUnrecCount = Number(unrecSummary.total_orders_count || 0);
                  const lessPaymentAmount = Number(unrecSummary.total_less_payment_received_amount || 0);
                  const lessPaymentCount = Number(unrecSummary.total_less_payment_received_orders || 0);
                  const morePaymentAmount = Number(unrecSummary.total_more_payment_received_amount || 0);
                  const morePaymentCount = Number(unrecSummary.total_more_payment_received_orders || 0);
                  const amountColor = (v: number) => (v > 0 ? '#10b981' : v < 0 ? '#ef4444' : '#1f2937');
                  
                  // Providers for mismatched transactions from main-summary API (fallback to mock if unavailable)
                  const providerData = mainSummary
                    ? (() => {
                        const split = splitGatewaysAndCod(mainSummary.UnReconcile);
                        const gateways = split.gateways.map(p => ({ name: p.displayName, amount: p.totalSaleAmount, count: p.totalCount, type: 'payment' as const }));
                        const codPartners = split.cod.map(p => ({ name: p.displayName, amount: p.totalSaleAmount, count: p.totalCount, type: 'logistics' as const }));
                        return [...gateways, ...codPartners];
                      })()
                    : [
                        { name: 'PayU', amount: 15000, count: 45, type: 'payment' as const },
                        { name: 'Paytm', amount: 12000, count: 38, type: 'payment' as const },
                        { name: 'Delhivery', amount: 8500, count: 25, type: 'logistics' as const },
                        { name: 'Blue Dart', amount: 6200, count: 18, type: 'logistics' as const },
                        { name: 'DTDC', amount: 4800, count: 15, type: 'logistics' as const },
                        { name: 'Shadowfax', amount: 3200, count: 12, type: 'logistics' as const },
                        { name: 'BlitzNow', amount: 2100, count: 8, type: 'logistics' as const }
                      ];

                  return (
                    <Box>
                      {/* Header with Total Unreconciled */}
                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 700, 
                          color: '#1f2937',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          letterSpacing: '-0.025em'
                        }}>
                          Transactions Summary
                        </Typography>
                        {transactionsTab === 1 && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/dispute')}
                            sx={{
                              borderColor: '#6366f1',
                              color: '#6366f1',
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#4f46e5',
                                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                              }
                            }}
                          >
                            View Mismatched Transactions
                          </Button>
                        )}
                      </Box>

                      {/* Settled/Unsettled Switch + Tabs */}
                      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: transactionsTab === 2 ? 2 : 0 }}>
                        {/* Two-way switch with external labels */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ fontWeight: 700, color: transactionsTab !== 2 ? '#065f46' : '#6b7280' }}>
                            Settled
                          </Typography>
                          <Box
                            role="switch"
                            aria-checked={transactionsTab === 2}
                            tabIndex={0}
                            onClick={() => setTransactionsTab(transactionsTab === 2 ? 0 : 2)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setTransactionsTab(transactionsTab === 2 ? 0 : 2);
                              }
                            }}
                            sx={{
                              position: 'relative',
                              width: 64,
                              height: 32,
                              borderRadius: 9999,
                              cursor: 'pointer',
                              backgroundColor: transactionsTab === 2 ? '#fee2e2' : '#d1fae5',
                              transition: 'background-color 150ms ease',
                              boxShadow: 'inset 0 0 0 1px #e5e7eb',
                            }}
                          >
                            {/* Active track tint */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 4,
                                bottom: 4,
                                left: transactionsTab === 2 ? '50%' : 4,
                                right: transactionsTab === 2 ? 4 : '50%',
                                borderRadius: 9999,
                                backgroundColor: transactionsTab === 2 ? '#ef4444' : '#10b981',
                                opacity: 0.25,
                                transition: 'all 150ms ease',
                              }}
                            />
                            {/* Knob */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 3,
                                left: transactionsTab === 2 ? 33 : 3,
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px #e5e7eb',
                                transition: 'left 150ms ease',
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontWeight: 700, color: transactionsTab === 2 ? '#991b1b' : '#6b7280' }}>
                            Unsettled
                          </Typography>
                        </Box>

                        {/* Settled sub-tabs (Matched / Mismatched) */}
                        <Box ref={tabsGroupRef as any} sx={{ position: 'relative', display: transactionsTab !== 2 ? 'inline-block' : 'none' }}>
                          {/* removed decorative underline under settled tabs */}
                          {transactionsTab !== 2 && (
                            <Tabs
                              value={transactionsTab}
                              onChange={handleTransactionsTabChange}
                              sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                mb: 1,
                                '& .MuiTab-root': {
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  minHeight: 48,
                                },
                                '& .MuiTabs-indicator': {
                                  backgroundColor: '#10b981'
                                }
                              }}
                            >
                              <Tab label="Matched Transactions" />
                              <Tab label="Mismatched Transactions" />
                            </Tabs>
                          )}
                        </Box>
                      </Box>

                      {/* Tab Content */}
                        {transactionsTab === 0 && (
                        <Box>
                          {/* Reconciled Transactions Summary */}
                          {(() => {
                            const s = mainSummary?.summary as any;
                            
                            // Revenue from API summary: net_sales_amount
                            const expectedSalesAmount = Number(s?.net_sales_amount || 0);
                            const expectedSalesCount = Number(s?.net_sales_orders || 0);

                            // Matched totals from API response (reconciled)
                            const matchedAmount = Number(s?.total_reconciled_amount || 0);
                            const matchedCount = Number(s?.total_reconciled_count || 0);
                            const percentSettled = expectedSalesAmount === 0 ? 0 : Math.min(100, (matchedAmount / expectedSalesAmount) * 100);

                            // Keep the existing provider calculation for display purposes
                            const { gateways, cod } = splitGatewaysAndCod(mainSummary?.Reconcile);
                            const sumAmount = (arr: any[]) => arr.reduce((acc, x) => acc + Number(x?.totalSaleAmount || 0), 0);
                            const sumCount = (arr: any[]) => arr.reduce((acc, x) => acc + Number(x?.totalCount || 0), 0);
                            const gatewaysAmount = sumAmount(gateways);
                            const gatewaysCount = sumCount(gateways);
                            const codAmount = sumAmount(cod);
                            const codCount = sumCount(cod);
                            const settledAmount = matchedAmount;
                            const settledCount = matchedCount;

                            // Providers list using raw Reconcile values
                            const totalSettledAmount = settledAmount || 0;
                            const totalSettledCount = settledCount || 0; // retained if needed elsewhere
                            const providersBase = [
                              ...gateways.map(g => ({
                                name: g.displayName,
                                key: g.code,
                                type: 'payment' as const,
                                color: '#2563eb',
                                amount: Number(g.totalSaleAmount || 0),
                                count: Number(g.totalCount || 0),
                              })),
                              ...(cod.length > 0 ? [{
                                name: 'Cash on Delivery',
                                key: 'cod',
                                type: 'cod' as const,
                                color: '#10b981',
                                amount: codAmount,
                                count: codCount,
                              }] : []),
                            ];

                            // Compute provider-level matched% = matched / (matched + unmatched)
                            const unrecSplit = splitGatewaysAndCod(mainSummary?.UnReconcile);
                            const codUnrecAmount = unrecSplit.cod.reduce((s, c) => s + Number(c.totalSaleAmount || 0), 0);

                            const providers = providersBase.map((p) => {
                              if (p.key === 'cod') {
                                const matchedAmount = Number(p.amount || 0);
                                const unmatchedAmount = Number(codUnrecAmount || 0);
                                const denom = matchedAmount + unmatchedAmount;
                                const percentMatched = denom === 0 ? 0 : (matchedAmount / denom) * 100;
                                return {
                                  ...p,
                                  share: totalSettledAmount === 0 ? 0 : (Number(p.amount) / totalSettledAmount),
                                  percentMatched,
                                };
                              }
                              // gateways (payment providers)
                              const matchedAmount = Number(p.amount || 0);
                              const unrecForProvider = unrecSplit.gateways.find(g => g.code === p.key);
                              const unmatchedAmount = Number(unrecForProvider?.totalSaleAmount || 0);
                              const denom = matchedAmount + unmatchedAmount;
                              const percentMatched = denom === 0 ? 0 : (matchedAmount / denom) * 100;
                              return {
                                ...p,
                                share: totalSettledAmount === 0 ? 0 : (Number(p.amount) / totalSettledAmount),
                                percentMatched,
                              };
                            });

                            return (
                              <>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  mb: 1,
                                  p: 3,
                                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0'
                                }}>
                                  <Box>
                                    <Typography variant="h4" sx={{ 
                                      fontWeight: 800, 
                                      color: '#1f2937', 
                                      letterSpacing: '-0.02em',
                                      fontSize: '2rem'
                                    }}>
                                      {formatCurrency(settledAmount)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.1rem' }}>
                                      {(settledCount).toLocaleString('en-IN')} Orders Matched
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.75 }}>
                                      Expected vs Settled
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                        <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600, fontSize: '1.1rem' }}>
                                          Revenue
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.2rem' }}>
                                          {formatCurrency(expectedSalesAmount)}
                                        </Typography>
                                      </Box>
                                      <Typography variant="caption" sx={{ color: '#6b7280', textAlign: 'right' }}>
                                        {(expectedSalesCount).toLocaleString('en-IN')} Orders
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                        <Typography variant="body1" sx={{ color: '#065f46', fontWeight: 600, fontSize: '1.1rem' }}>
                                          Matched&nbsp;<span style={{ marginLeft: 130 }}>{percentSettled.toFixed(1)}%</span>
                                        </Typography>
                                        {/* <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700, fontSize: '1.2rem' }}>
                                          {formatCurrency(matchedAmount)}
                                        </Typography> */}
                                      </Box>
                                      {/* <Typography variant="caption" sx={{ color: '#6b7280', textAlign: 'right' }}>
                                        {(matchedCount).toLocaleString('en-IN')} Orders ({percentSettled.toFixed(1)}%)
                                      </Typography> */}
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Settlements by Providers - only for D2C */}
                                {selectedPlatforms.includes('d2c') && (
                                  <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 600, 
                                      color: '#1f2937', 
                                      mb: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      Settlements by Providers
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          {providers.map((provider, idx) => (
                                        <Grow in key={`${provider.key}-${idx}`} timeout={350} style={{ transitionDelay: `${idx * 200}ms` }}>
                                          <Box>
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              justifyContent: 'space-between', 
                                                  py: 1.25, 
                                              px: 3, 
                                              borderRadius: 2, 
                                              background: '#f9fafb', 
                                              border: '1px solid #f1f3f4',
                                              transition: 'all 0.2s ease',
                                              cursor: 'pointer',
                                              '&:hover': {
                                                background: '#f3f4f6',
                                                borderColor: '#e5e7eb'
                                              }
                                            }}
                                              onClick={() => {
                                                if (provider.key === 'cod') {
                                                  setIsCodExpanded((v) => !v);
                                                  setExpandedProviderKey(null);
                                                } else {
                                                  setExpandedProviderKey((prev) => (prev === provider.key ? null : provider.key));
                                                  setIsCodExpanded(false);
                                                }
                                              }}
                                              role={'button'}
                                              aria-expanded={provider.key === 'cod' ? isCodExpanded : expandedProviderKey === provider.key}
                                            >
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                  width: 8,
                                                  height: 8,
                                                  borderRadius: '50%',
                                                  backgroundColor: provider.color
                                                }} />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>
                                                    {provider.name}
                                                  </Typography>
                                                  <ExpandMoreIcon 
                                                    sx={{ 
                                                      fontSize: 22,
                                                      color: '#6b7280',
                                                      transition: 'transform 0.2s',
                                                      transform: (provider.key === 'cod' ? (isCodExpanded ? 'rotate(180deg)' : 'rotate(0deg)') : (expandedProviderKey === provider.key ? 'rotate(180deg)' : 'rotate(0deg)'))
                                                    }}
                                                  />
                                                </Box>
                                                <Chip 
                                                  label={provider.key === 'cod' ? 'COD' : 'Payment'} 
                                                  size="small" 
                                                  sx={{ 
                                                    fontSize: '0.75rem',
                                                    height: 20,
                                                    backgroundColor: provider.key === 'cod' ? '#d1fae5' : '#dbeafe',
                                                    color: provider.key === 'cod' ? '#065f46' : '#1e40af'
                                                  }} 
                                                />
                                              </Box>
                                              <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f2937', fontSize: '1rem' }}>
                                                  {formatCurrency(provider.amount)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                                  {provider.count.toLocaleString('en-IN')} orders
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                                                  {Number(provider.percentMatched || 0).toFixed(1)}% matched
                                                </Typography>
                                              </Box>
                                            </Box>
                                            {/* COD logistics partners expandable details */}
                                            {provider.key === 'cod' && (
                                              <MuiCollapse in={isCodExpanded} timeout="auto" unmountOnExit>
                                                <Box sx={{ mt: 1.5, ml: { xs: 0, md: 4 } }}>
                                                  <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                                    Logistics partners who settled
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    {(splitGatewaysAndCod(mainSummary?.Reconcile).cod).map((lpRaw) => {
                                                      const settledAmountForLp = Number(lpRaw.totalSaleAmount || 0);
                                                      const ordersForLp = Number(lpRaw.totalCount || 0);
                                                      // Find unmatched for this logistics partner within UnReconcile.cod by same code
                                                      const unrecCodArray = splitGatewaysAndCod(mainSummary?.UnReconcile).cod;
                                                      const unmatchedForLp = Number((unrecCodArray.find(c => c.code === lpRaw.code))?.totalSaleAmount || 0);
                                                      const denom = settledAmountForLp + unmatchedForLp;
                                                      const percentMatched = denom === 0 ? 0 : (settledAmountForLp / denom) * 100;
                                                      const lp = { name: lpRaw.displayName, settledAmount: settledAmountForLp, orders: ordersForLp, percentMatched };
                                                      return (
                                                        <Box key={lp.name}>
                                                          <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            py: 1,
                                                            px: 2,
                                                            borderRadius: 1.5,
                                                            background: '#ffffff',
                                                            border: '1px solid #e5e7eb'
                                                          }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                              <DeliveryIcon fontSize="small" sx={{ color: '#059669' }} />
                                                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{lp.name}</Typography>
                                                              <Chip label="Logistics" size="small" sx={{ height: 18, fontSize: '0.7rem', bgcolor: '#ecfeff', color: '#164e63' }} />
                                                            </Box>
                                                            <Box sx={{ textAlign: 'right' }}>
                                                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(lp.settledAmount)}</Typography>
                                                              <Typography variant="caption" sx={{ color: '#6b7280' }}>{lp.orders.toLocaleString('en-IN')} orders • </Typography>
                                                              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                                                                {Number(lp.percentMatched || 0).toFixed(1)}% matched
                                                              </Typography>
                                                            </Box>
                                                          </Box>
                                                        </Box>
                                                      );
                                                    })}
                                                  </Box>
                                                  {/* Minimal View Transactions Button for COD */}
                                                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                                                    <Button
                                                      variant="text"
                                                      size="small"
                                                      endIcon={<ArrowRight sx={{ fontSize: 14, transform: 'rotate(-45deg)' }} />}
                                                      sx={{
                                                        textTransform: 'none',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500,
                                                        color: '#2563eb',
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        '&:hover': {
                                                          backgroundColor: 'transparent',
                                                          color: '#1d4ed8',
                                                        }
                                                      }}
                                                      onClick={() => {
                                                        // TODO: Replace with actual link when provided
                                                        console.log('View Cash on Delivery transactions');
                                                      }}
                                                    >
                                                      View Cash on Delivery transactions
                                                    </Button>
                                                  </Box>
                                                </Box>
                                              </MuiCollapse>
                                            )}
                                            {/* Gateway provider charges breakdown expandable details */}
                                            {provider.key !== 'cod' && (
                                              <MuiCollapse in={expandedProviderKey === provider.key} timeout="auto" unmountOnExit>
                                                <Box sx={{ mt: 1.5, ml: { xs: 0, md: 4 } }}>
                                                  <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                                    Charges & Settlement details
                                                  </Typography>
                                                  {(() => {
                                                    const grossSales = provider.amount; // amount displayed above
                                                    const assumedCommissionRate = 0.018; // 1.8%
                                                    const commissionAmount = Math.round(grossSales * assumedCommissionRate);
                                                    const gstRate = 0.18; // 18% GST on commission
                                                    const gstOnCommission = Math.round(commissionAmount * gstRate);
                                                    const totalCharges = commissionAmount + gstOnCommission;
                                                    const paymentReceived = Math.max(0, grossSales - totalCharges);
                                                    return (
                                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#fff' }}>
                                                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Gross sales via {provider.name}</Typography>
                                                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(grossSales)}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#ffffff' }}>
                                                          <Typography variant="body2" sx={{ color: '#374151' }}>Commission ({(assumedCommissionRate*100).toFixed(2)}%)</Typography>
                                                          <Typography variant="body2" sx={{ color: '#374151' }}>-{formatCurrency(commissionAmount)}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#ffffff' }}>
                                                          <Typography variant="body2" sx={{ color: '#374151' }}>GST on commission (18%)</Typography>
                                                          <Typography variant="body2" sx={{ color: '#374151' }}>-{formatCurrency(gstOnCommission)}</Typography>
                                                        </Box>
                                                        <Divider sx={{ my: 0.5 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#f9fafb' }}>
                                                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>Payment received</Typography>
                                                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>{formatCurrency(paymentReceived)}</Typography>
                                                        </Box>
                                                      </Box>
                                                    );
                                                  })()}
                                                  {/* Minimal View Transactions Button */}
                                                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                                                    <Button
                                                      variant="text"
                                                      size="small"
                                                      endIcon={<ArrowRight sx={{ fontSize: 14, transform: 'rotate(-45deg)' }} />}
                                                      sx={{
                                                        textTransform: 'none',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500,
                                                        color: '#2563eb',
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        '&:hover': {
                                                          backgroundColor: 'transparent',
                                                          color: '#1d4ed8',
                                                        }
                                                      }}
                                                      onClick={() => {
                                                        // TODO: Replace with actual link when provided
                                                        console.log(`View ${provider.name} transactions`);
                                                      }}
                                                    >
                                                      View {provider.name} transactions
                                                    </Button>
                                                  </Box>
                                                </Box>
                                              </MuiCollapse>
                                            )}
                                            
                                          </Box>
                                        </Grow>
                                          ))}
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, border: '1px solid #f1f3f4', borderRadius: 2, background: '#fff', height: '100%' }}>
                                          <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                            Provider Breakdown (Gateways + COD partners)
                                          </Typography>
                                          {(() => {
                                            const split = splitGatewaysAndCod(mainSummary?.Reconcile);
                                            const total = split.gateways.reduce((s, g) => s + g.totalSaleAmount, 0) + split.cod.reduce((s, c) => s + c.totalSaleAmount, 0);
                                            const palette = ['#2563eb', '#1e40af', '#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#7c3aed'];
                                            const gatewaysPie = split.gateways.map((g, i) => ({ name: g.displayName, value: g.totalSaleAmount, color: palette[i % palette.length] }));
                                            const codPie = split.cod.map((c, i) => ({ name: c.displayName, value: c.totalSaleAmount, color: palette[(i + gatewaysPie.length) % palette.length] }));
                                            const pieData = [...gatewaysPie, ...codPie];
                                            return (
                                              <>
                                                <Box sx={{ width: '100%', height: 240 }}>
                                                  <ResponsiveContainer>
                                                    <PieChart>
                                                      <Pie
                                                        data={pieData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                      innerRadius={66}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                      >
                                                        {pieData.map((item, i) => (
                                                          <Cell key={`cell-${i}`} fill={item.color} />
                                                        ))}
                                                      </Pie>
                                                      <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                                                    </PieChart>
                                                  </ResponsiveContainer>
                                                </Box>
                                                <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                                                  {pieData.map((item) => (
                                                    <Box key={`legend-${item.name}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                                                      <Typography variant="caption" sx={{ color: '#374151' }}>{item.name}: {formatCurrency(item.value)}</Typography>
                                                    </Box>
                                                  ))}
                                                </Box>
                                              </>
                                            );
                                          })()}
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      )}

                      {transactionsTab === 2 && (
                        <Box>
                          {(() => {
                            // Use API mainSummary.Unsettled for this section
                            const unsettled = (mainSummary as any)?.Unsettled as any;
                            const pendingPaymentAmount = Number(unsettled?.summary?.pending_payment_amount || 0);
                            const pendingPaymentCount = Number(unsettled?.summary?.pending_payment_orders || 0);
                            const totalUnsettledAmount = pendingPaymentAmount;

                            // Split providers into gateways and COD using helpers
                            const { gateways, cod } = splitGatewaysAndCod(unsettled);

                            const COLOR_MAP: Record<string, string> = {
                              paytm: '#1e40af',
                              payU: '#2563eb',
                              razorpay: '#0ea5e9',
                              stripe: '#38bdf8',
                              grow_simple: '#0ea5e9',
                              shiprocket: '#10b981',
                              delhivery: '#6366f1',
                              dtdc: '#f59e0b',
                              bluedart: '#14b8a6',
                              shadowfax: '#ef4444',
                            };

                            const mapGateway = (g: any) => ({
                              name: g.displayName,
                              key: g.code,
                              amount: Number(g.totalSaleAmount || 0),
                              count: Number(g.totalCount || 0),
                              color: COLOR_MAP[g.code] || '#3b82f6',
                              type: 'payment' as const,
                            });
                            const mapCod = (c: any) => ({
                              name: c.displayName,
                              key: c.code,
                              amount: Number(c.totalSaleAmount || 0),
                              count: Number(c.totalCount || 0),
                              color: COLOR_MAP[c.code] || '#10b981',
                              type: 'cod' as const,
                            });

                            // Aggregate COD providers into a single expandable item
                            const codTotalAmount = cod.reduce((sum, c) => sum + Number(c.totalSaleAmount || 0), 0);
                            const codTotalCount = cod.reduce((sum, c) => sum + Number(c.totalCount || 0), 0);
                            const pendingPaymentProviders = [
                              ...gateways.map(mapGateway),
                              ...(cod.length > 0
                                ? [{
                                    name: 'Cash on Delivery',
                                    key: 'cod',
                                    amount: codTotalAmount,
                                    count: codTotalCount,
                                    color: '#10b981',
                                    type: 'cod' as const,
                                  }]
                                : []),
                            ];

                            // Pie should reflect all providers including individual COD partners
                            const pendingPaymentPieData = [
                              ...gateways.map(mapGateway),
                              ...cod.map(mapCod),
                            ].map((p) => ({
                              name: p.name,
                              value: p.amount,
                              color: p.color,
                            }));
                            // Pending deductions UI removed as requested

                            return (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                  <Box>
                                    <Typography sx={{ fontWeight: 800, color: '#1f2937', letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' }, lineHeight: 1 }}>
                                      {formatCurrency(pendingPaymentAmount)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6b7280' }}>Pending Payment Amount</Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ fontWeight: 800, color: '#1f2937', letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' }, lineHeight: 1 }}>
                                      {pendingPaymentCount.toLocaleString('en-IN')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6b7280' }}>Orders</Typography>
                                  </Box>
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f2937' }}>Pending Payment by Providers</Typography>
                                      {pendingPaymentProviders.map((provider, idx) => (
                                        <Box key={`up-${provider.key}-${idx}`}>
                                          <Box
                                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 2, borderRadius: 1.5, background: '#f9fafb', border: '1px solid #f1f3f4', cursor: provider.key === 'cod' ? 'pointer' : 'default', transition: 'background 0.2s', '&:hover': { background: provider.key === 'cod' ? '#f3f4f6' : '#f9fafb' } }}
                                            onClick={() => {
                                              if (provider.key === 'cod') {
                                                setIsCodExpanded((v) => !v);
                                              }
                                            }}
                                            role={provider.key === 'cod' ? 'button' : undefined}
                                            aria-expanded={provider.key === 'cod' ? isCodExpanded : undefined}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: provider.color }} />
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{provider.name}</Typography>
                                                {provider.key === 'cod' && (
                                                  <ExpandMoreIcon 
                                                    sx={{ 
                                                      fontSize: 20,
                                                      color: '#6b7280', 
                                                      transition: 'transform 0.2s', 
                                                      transform: isCodExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                                    }} 
                                                  />
                                                )}
                                              </Box>
                                              <Chip label={provider.type === 'cod' ? 'COD' : 'Payment'} size="small" sx={{ height: 18, fontSize: '0.7rem', bgcolor: provider.type === 'cod' ? '#d1fae5' : '#dbeafe', color: provider.type === 'cod' ? '#065f46' : '#1e40af' }} />
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(provider.amount)}</Typography>
                                              <Typography variant="caption" sx={{ color: '#6b7280' }}>{provider.count.toLocaleString('en-IN')} orders</Typography>
                                            </Box>
                                          </Box>
                                          {/* Minimal View Transactions Button for Payment Gateways in Unsettled */}
                                          {provider.key !== 'cod' && (
                                            <Box sx={{ mt: 1, textAlign: 'right' }}>
                                              <Button
                                                variant="text"
                                                size="small"
                                                endIcon={<ArrowRight sx={{ fontSize: 14, transform: 'rotate(-45deg)' }} />}
                                                sx={{
                                                  textTransform: 'none',
                                                  fontSize: '0.8rem',
                                                  fontWeight: 500,
                                                  color: '#2563eb',
                                                  p: 0,
                                                  minWidth: 'auto',
                                                  '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    color: '#1d4ed8',
                                                  }
                                                }}
                                                onClick={() => {
                                                  // Navigate to TransactionSheet with unsettled tab and platform filter
                                                  setInitialTsTab(1); // Unsettled tab (0 = Settled, 1 = Unsettled)
                                                  // Determine platform based on provider
                                                  // Provider names like "Flipkart" indicate the platform
                                                  const providerName = provider.name.toLowerCase();
                                                  const providerKey = provider.key.toLowerCase();
                                                  
                                                  let platform: 'flipkart' | 'd2c' = 'flipkart'; // Default to flipkart
                                                  
                                                  if (providerKey === 'flipkart' || providerName.includes('flipkart')) {
                                                    platform = 'flipkart';
                                                  } else if (providerKey === 'd2c' || providerName.includes('d2c') || providerName.includes('direct')) {
                                                    platform = 'd2c';
                                                  }
                                                  
                                                  setSelectedProviderPlatform(platform);
                                                  setShowTransactionSheet(true);
                                                }}
                                              >
                                                View {provider.name} transactions
                                              </Button>
                                            </Box>
                                          )}
                                          {/* Expandable list of COD partners for unsettled pending payment */}
                                          {provider.key === 'cod' && (
                                            <MuiCollapse in={isCodExpanded} timeout="auto" unmountOnExit>
                                              <Box sx={{ mt: 1, ml: { xs: 0, md: 4 } }}>
                                                <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                                  Logistics partners with pending payment
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                  {cod.map((lp) => (
                                                    <Box key={lp.code} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 2, borderRadius: 1.5, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <DeliveryIcon fontSize="small" sx={{ color: '#059669' }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{lp.displayName}</Typography>
                                                        <Chip label="Logistics" size="small" sx={{ height: 18, fontSize: '0.7rem', bgcolor: '#ecfeff', color: '#164e63' }} />
                                                      </Box>
                                                      <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(Number(lp.totalSaleAmount || 0))}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>{Number(lp.totalCount || 0).toLocaleString('en-IN')} orders</Typography>
                                                      </Box>
                                                    </Box>
                                                  ))}
                                                </Box>
                                                {/* Minimal View Transactions Button for COD in Unsettled */}
                                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                                  <Button
                                                    variant="text"
                                                    size="small"
                                                    endIcon={<ArrowRight sx={{ fontSize: 14, transform: 'rotate(-45deg)' }} />}
                                                    sx={{
                                                      textTransform: 'none',
                                                      fontSize: '0.8rem',
                                                      fontWeight: 500,
                                                      color: '#2563eb',
                                                      p: 0,
                                                      minWidth: 'auto',
                                                      '&:hover': {
                                                        backgroundColor: 'transparent',
                                                        color: '#1d4ed8',
                                                      }
                                                    }}
                                                    onClick={() => {
                                                      // TODO: Replace with actual link when provided
                                                      console.log('View Cash on Delivery unsettled transactions');
                                                    }}
                                                  >
                                                    View Cash on Delivery transactions
                                                  </Button>
                                                </Box>
                                              </Box>
                                            </MuiCollapse>
                                          )}
                                        </Box>
                                      ))}
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Box sx={{ p: 2, border: '1px solid #f1f3f4', borderRadius: 2, background: '#fff', height: '100%' }}>
                                      <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>Provider Breakdown (Pending Payment)</Typography>
                                      <Box sx={{ width: '100%', height: 200 }}>
                                        <ResponsiveContainer>
                                          <PieChart>
                                            <Pie data={pendingPaymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={2}>
                                              {(() => {
                                                const PIE_COLORS = ['#2563eb','#1e40af','#0ea5e9','#38bdf8','#10b981','#6366f1','#f59e0b','#14b8a6','#ef4444','#9333ea','#c2410c','#059669','#0f766e','#84cc16','#64748b'];
                                                return pendingPaymentPieData.map((_, i) => (
                                                  <Cell key={`upp-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ));
                                              })()}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                                          </PieChart>
                                        </ResponsiveContainer>
                                      </Box>
                                      {/* legend removed as per request */}
                                    </Box>
                                  </Grid>
                                </Grid>
                              </>
                            );
                          })()}
                        </Box>
                      )}
                      {transactionsTab === 1 && (
                        <Box>
                          {/* Total Unreconciled Summary */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            mb: 1,
                            p: 3,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                          }}>
                        <Box>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 800, 
                            color: '#1f2937', 
                            letterSpacing: '-0.02em',
                            fontSize: '2rem'
                          }}>
                            {formatCurrency(Math.abs(totalUnrecAmount))}
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.1rem' }}>
                            {(totalUnrecCount).toLocaleString('en-IN')} Orders
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.75 }}>
                            Unreconciled = Less Payment Received − More Payment Received from Marketplace
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                              <Typography variant="body1" sx={{ color: '#b91c1c', fontWeight: 600, fontSize: '1.1rem' }}>
                                Less Payment Received
                              </Typography>
                              <Typography variant="h6" sx={{ color: amountColor(lessPaymentAmount), fontWeight: 700, fontSize: '1.2rem' }}>
                                {formatCurrency(Math.abs(lessPaymentAmount))}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#6b7280', textAlign: 'right' }}>
                              {lessPaymentCount.toLocaleString('en-IN')} Orders
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                              <Typography variant="body1" sx={{ color: '#065f46', fontWeight: 600, fontSize: '1.1rem' }}>
                                More Payment Received
                              </Typography>
                              <Typography variant="h6" sx={{ color: amountColor(morePaymentAmount), fontWeight: 700, fontSize: '1.2rem' }}>
                                {formatCurrency(morePaymentAmount)}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#6b7280', textAlign: 'right' }}>
                              {morePaymentCount.toLocaleString('en-IN')} Orders
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Conditional Content based on selected platform */}
                      {selectedPlatforms.includes('d2c') ? (
                        <>
                          {/* Tabs for By Reasons and By Providers - Only for D2C */}
                          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Tabs
                              value={unreconciledTab}
                              onChange={handleUnreconciledTabChange}
                              sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                mb: 3,
                                '& .MuiTab-root': {
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  minHeight: 48,
                                }
                              }}
                            >
                              <Tab label="By Reasons" />
                              <Tab label="By Providers" />
                            </Tabs>
                          </Box>

                          {/* Tab Content for D2C */}
                          {unreconciledTab === 0 && (
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: '#1f2937', 
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                ✨ Unreconciled by Reasons
                              </Typography>
                              {unreconciledReasons.length === 0 ? (
                                <Box sx={{ 
                                  py: 4, 
                                  px: 2, 
                                  borderRadius: 1, 
                                  background: '#f9fafb', 
                                  border: '1px solid #f1f3f4',
                                  textAlign: 'center'
                                }}>
                                  <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                                    All Good! No unreconciled transactions by reasons.
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  {unreconciledReasons.map((r, idx) => (
                                    <Grow in key={`${r.reason}-${idx}`} timeout={350} style={{ transitionDelay: `${idx * 200}ms` }}>
                                      <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        py: 2, 
                                        px: 3, 
                                        borderRadius: 2, 
                                        background: '#f9fafb', 
                                        border: '1px solid #f1f3f4',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                          background: '#f3f4f6',
                                          borderColor: '#e5e7eb'
                                        }
                                      }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>
                                          {r.reason}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f2937', fontSize: '1.1rem' }}>
                                          {r.count.toLocaleString('en-IN')}
                                        </Typography>
                                      </Box>
                                    </Grow>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          )}

                          {unreconciledTab === 1 && (
                            <Box>
                              {(() => {
                                // Build providers UI identical to matched section, but source numbers from UnReconcile
                                const splitUnrec = splitGatewaysAndCod(mainSummary?.UnReconcile);
                                const gatewaysUnrec = splitUnrec.gateways;
                                const codUnrec = splitUnrec.cod;

                                const gatewaysAmount = gatewaysUnrec.reduce((sum, g) => sum + Number(g.totalSaleAmount || 0), 0);
                                const gatewaysCount = gatewaysUnrec.reduce((sum, g) => sum + Number(g.totalCount || 0), 0);
                                const codAmount = codUnrec.reduce((sum, c) => sum + Number(c.totalSaleAmount || 0), 0);
                                const codCount = codUnrec.reduce((sum, c) => sum + Number(c.totalCount || 0), 0);

                                const providersBase = [
                                  ...gatewaysUnrec.map(g => ({
                                    name: g.displayName,
                                    key: g.code,
                                    type: 'payment' as const,
                                    color: '#2563eb',
                                    amount: Number(g.totalSaleAmount || 0),
                                    count: Number(g.totalCount || 0),
                                    commission: Number(g.totalCommission || 0),
                                    gstOnCommission: Number(g.totalGstOnCommission || 0),
                                  })),
                                  ...(codUnrec.length > 0 ? [{
                                    name: 'Cash on Delivery',
                                    key: 'cod',
                                    type: 'cod' as const,
                                    color: '#10b981',
                                    amount: codAmount,
                                    count: codCount,
                                  }] : []),
                                ];

                                // Compute percent matched using Reconcile vs UnReconcile split (same logic as matched section)
                                const splitRec = splitGatewaysAndCod(mainSummary?.Reconcile);
                                const codRecAmount = splitRec.cod.reduce((sum, c) => sum + Number(c.totalSaleAmount || 0), 0);

                                const providers = providersBase.map((p) => {
                                  if (p.key === 'cod') {
                                    const matchedAmount = Number(codRecAmount || 0);
                                    const unmatchedAmount = Number(codAmount || 0);
                                    const denom = matchedAmount + unmatchedAmount;
                                    const percentMismatched = denom === 0 ? 0 : (unmatchedAmount / denom) * 100;
                                    return {
                                      ...p,
                                      share: (gatewaysAmount + codAmount) === 0 ? 0 : (Number(p.amount) / (gatewaysAmount + codAmount)),
                                      percentMismatched,
                                    };
                                  }
                                  const matchedForProvider = Number((splitRec.gateways.find(g => g.code === p.key))?.totalSaleAmount || 0);
                                  const unmatchedForProvider = Number(p.amount || 0);
                                  const denom = matchedForProvider + unmatchedForProvider;
                                  const percentMismatched = denom === 0 ? 0 : (unmatchedForProvider / denom) * 100;
                                  return {
                                    ...p,
                                    share: (gatewaysAmount + codAmount) === 0 ? 0 : (Number(p.amount) / (gatewaysAmount + codAmount)),
                                    percentMismatched,
                                  };
                                });

                                return (
                                  <>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 600, 
                                      color: '#1f2937', 
                                      mb: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      🏢 Unreconciled by Providers
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          {providers.map((provider, idx) => (
                                            <Grow in key={`${provider.key}-${idx}`} timeout={350} style={{ transitionDelay: `${idx * 200}ms` }}>
                                              <Box>
                                                <Box sx={{ 
                                                  display: 'flex', 
                                                  alignItems: 'center', 
                                                  justifyContent: 'space-between', 
                                                  py: 1.25, 
                                                  px: 3, 
                                                  borderRadius: 2, 
                                                  background: '#f9fafb', 
                                                  border: '1px solid #f1f3f4',
                                                  transition: 'all 0.2s ease',
                                                  cursor: 'pointer',
                                                  '&:hover': {
                                                    background: '#f3f4f6',
                                                    borderColor: '#e5e7eb'
                                                  }
                                                }}
                                                  onClick={() => {
                                                    if (provider.key === 'cod') {
                                                      setIsCodExpanded((v) => !v);
                                                      setExpandedProviderKey(null);
                                                    } else {
                                                      setExpandedProviderKey((prev) => (prev === provider.key ? null : provider.key));
                                                      setIsCodExpanded(false);
                                                    }
                                                  }}
                                                  role={'button'}
                                                  aria-expanded={provider.key === 'cod' ? isCodExpanded : expandedProviderKey === provider.key}
                                                >
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{
                                                      width: 8,
                                                      height: 8,
                                                      borderRadius: '50%',
                                                      backgroundColor: provider.color
                                                    }} />
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>
                                                        {provider.name}
                                                      </Typography>
                                                      <ExpandMoreIcon 
                                                        sx={{ 
                                                          fontSize: 22,
                                                          color: '#6b7280',
                                                          transition: 'transform 0.2s',
                                                          transform: (provider.key === 'cod' ? (isCodExpanded ? 'rotate(180deg)' : 'rotate(0deg)') : (expandedProviderKey === provider.key ? 'rotate(180deg)' : 'rotate(0deg)'))
                                                        }}
                                                      />
                                                    </Box>
                                                    <Chip 
                                                      label={provider.key === 'cod' ? 'COD' : 'Payment'} 
                                                      size="small" 
                                                      sx={{ 
                                                        fontSize: '0.75rem',
                                                        height: 20,
                                                        backgroundColor: provider.key === 'cod' ? '#d1fae5' : '#dbeafe',
                                                        color: provider.key === 'cod' ? '#065f46' : '#1e40af'
                                                      }} 
                                                    />
                                                  </Box>
                                                  <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f2937', fontSize: '1rem' }}>
                                                      {formatCurrency(provider.amount)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                                      {provider.count.toLocaleString('en-IN')} orders
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                                                      {Number(provider.percentMismatched || 0).toFixed(1)}% mismatched
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                                {/* COD logistics partners expandable details (sourced from UnReconcile for amounts/counts) */}
                                                {provider.key === 'cod' && (
                                                  <MuiCollapse in={isCodExpanded} timeout="auto" unmountOnExit>
                                                    <Box sx={{ mt: 1.5, ml: { xs: 0, md: 4 } }}>
                                                      <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                                        Logistics partners who settled
                                                      </Typography>
                                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {codUnrec.map((lpRaw) => {
                                                          const unrecAmountForLp = Number(lpRaw.totalSaleAmount || 0);
                                                          const ordersForLp = Number(lpRaw.totalCount || 0);
                                                          // matched for this LP from Reconcile.cod
                                                          const recCodArray = splitRec.cod;
                                                          const matchedForLp = Number((recCodArray.find(c => c.code === lpRaw.code))?.totalSaleAmount || 0);
                                                          const denom = matchedForLp + unrecAmountForLp;
                                                          const percentMismatched = denom === 0 ? 0 : (unrecAmountForLp / denom) * 100;
                                                          const lp = { name: lpRaw.displayName, amount: unrecAmountForLp, orders: ordersForLp, percentMismatched };
                                                          return (
                                                            <Box key={lp.name} sx={{
                                                              display: 'flex',
                                                              alignItems: 'center',
                                                              justifyContent: 'space-between',
                                                              py: 1,
                                                              px: 2,
                                                              borderRadius: 1.5,
                                                              background: '#ffffff',
                                                              border: '1px solid #e5e7eb'
                                                            }}>
                                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <DeliveryIcon fontSize="small" sx={{ color: '#059669' }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{lp.name}</Typography>
                                                                <Chip label="Logistics" size="small" sx={{ height: 18, fontSize: '0.7rem', bgcolor: '#ecfeff', color: '#164e63' }} />
                                                              </Box>
                                                              <Box sx={{ textAlign: 'right' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(lp.amount)}</Typography>
                                                                <Typography variant="caption" sx={{ color: '#6b7280' }}>{lp.orders.toLocaleString('en-IN')} orders • </Typography>
                                                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                                                                  {Number(lp.percentMismatched || 0).toFixed(1)}% mismatched
                                                                </Typography>
                                                              </Box>
                                                            </Box>
                                                          );
                                                        })}
                                                      </Box>
                                                      {/* Minimal View Transactions Button for COD in Mismatched */}
                                                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                                                        <Button
                                                          variant="text"
                                                          size="small"
                                                          endIcon={<ArrowRight sx={{ fontSize: 14, transform: 'rotate(-45deg)' }} />}
                                                          sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            color: '#2563eb',
                                                            p: 0,
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                              backgroundColor: 'transparent',
                                                              color: '#1d4ed8',
                                                            }
                                                          }}
                                                          onClick={() => {
                                                            // TODO: Replace with actual link when provided
                                                            console.log('View Cash on Delivery mismatched transactions');
                                                          }}
                                                        >
                                                          View Cash on Delivery transactions
                                                        </Button>
                                                      </Box>
                                                    </Box>
                                                  </MuiCollapse>
                                                )}
                                                {/* Gateway provider details area (kept placeholder for parity) */}
                                                {provider.key !== 'cod' && (
                                                  <MuiCollapse in={expandedProviderKey === provider.key} timeout="auto" unmountOnExit>
                                                    <Box sx={{ mt: 1.5, ml: { xs: 0, md: 4 } }}>
                                                      <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                                        Charges & Settlement details
                                                      </Typography>
                                                      {(() => {
                                                        const grossSales = Number(provider.amount || 0);
                                                        const gateway = gatewaysUnrec.find(g => g.code === provider.key);
                                                        const commissionAmount = Number(gateway?.totalCommission || 0);
                                                        const gstOnCommission = Number(gateway?.totalGstOnCommission || 0);
                                                        const totalCharges = commissionAmount + gstOnCommission;
                                                        const settlementReceivable = Math.max(0, grossSales - totalCharges);
                                                        return (
                                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#fff' }}>
                                                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Gross sales via {provider.name}</Typography>
                                                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(grossSales)}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#ffffff' }}>
                                                              <Typography variant="body2" sx={{ color: '#374151' }}>Total commission</Typography>
                                                              <Typography variant="body2" sx={{ color: '#374151' }}>-{formatCurrency(commissionAmount)}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#ffffff' }}>
                                                              <Typography variant="body2" sx={{ color: '#374151' }}>GST on commission</Typography>
                                                              <Typography variant="body2" sx={{ color: '#374151' }}>-{formatCurrency(gstOnCommission)}</Typography>
                                                            </Box>
                                                            <Divider sx={{ my: 0.5 }} />
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, border: '1px solid #e5e7eb', borderRadius: 1.5, bgcolor: '#ffffff' }}>
                                                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Settlement receivable</Typography>
                                                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{formatCurrency(settlementReceivable)}</Typography>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: '#6b7280', px: 1 }}>
                                                              Orders: {provider.count?.toLocaleString('en-IN')}
                                                            </Typography>
                                                          </Box>
                                                        );
                                                      })()}
                                                      {/* Minimal View Transactions Button for Gateway in Mismatched */}
                                                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                                                        <Button
                                                          variant="text"
                                                          size="small"
                                                          endIcon={<ArrowRight sx={{ fontSize: 14, transform: 'rotate(-45deg)' }} />}
                                                          sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            color: '#2563eb',
                                                            p: 0,
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                              backgroundColor: 'transparent',
                                                              color: '#1d4ed8',
                                                            }
                                                          }}
                                                          onClick={() => {
                                                            // TODO: Replace with actual link when provided
                                                            console.log(`View ${provider.name} mismatched transactions`);
                                                          }}
                                                        >
                                                          View {provider.name} transactions
                                                        </Button>
                                                      </Box>
                                                    </Box>
                                                  </MuiCollapse>
                                                )}
                                              </Box>
                                            </Grow>
                                          ))}
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2, border: '1px solid #f1f3f4', borderRadius: 2, background: '#fff', height: '100%' }}>
                                          <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                            Provider Breakdown (Gateways + COD partners)
                                          </Typography>
                                          {(() => {
                                            const split = splitGatewaysAndCod(mainSummary?.UnReconcile);
                                            const palette = ['#2563eb', '#1e40af', '#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#7c3aed'];
                                            const gatewaysPie = split.gateways.map((g, i) => ({ name: g.displayName, value: Number(g.totalSaleAmount || 0), color: palette[i % palette.length] }));
                                            const codPie = split.cod.map((c, i) => ({ name: c.displayName, value: Number(c.totalSaleAmount || 0), color: palette[(i + gatewaysPie.length) % palette.length] }));
                                            const pieData = [...gatewaysPie, ...codPie];
                                            return (
                                              <>
                                                <Box sx={{ width: '100%', height: 240 }}>
                                                  <ResponsiveContainer>
                                                    <PieChart>
                                                      <Pie
                                                        data={pieData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={66}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                      >
                                                        {pieData.map((item, i) => (
                                                          <Cell key={`unrec-cell-${i}`} fill={item.color} />
                                                        ))}
                                                      </Pie>
                                                      <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                                                    </PieChart>
                                                  </ResponsiveContainer>
                                                </Box>
                                                <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                                                  {pieData.map((item) => (
                                                    <Box key={`unrec-legend-${item.name}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                                                      <Typography variant="caption" sx={{ color: '#374151' }}>{item.name}: {formatCurrency(item.value)}</Typography>
                                                    </Box>
                                                  ))}
                                                </Box>
                                              </>
                                            );
                                          })()}
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </>
                                );
                              })()}
                            </Box>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Direct Reasons Display for Flipkart/Amazon */}
                          <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600, 
                              color: '#1f2937', 
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              ✨ Unreconciled by Reasons
                            </Typography>
                            {unreconciledReasons.length === 0 ? (
                              <Box sx={{ 
                                py: 4, 
                                px: 2, 
                                borderRadius: 1, 
                                background: '#f9fafb', 
                                border: '1px solid #f1f3f4',
                                textAlign: 'center'
                              }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                                  All Good! No unreconciled transactions by reasons.
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {unreconciledReasons.map((r, idx) => (
                                  <Grow in key={`${r.reason}-${idx}`} timeout={350} style={{ transitionDelay: `${idx * 200}ms` }}>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between', 
                                      py: 2, 
                                      px: 3, 
                                      borderRadius: 2, 
                                      background: '#f9fafb', 
                                      border: '1px solid #f1f3f4',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        background: '#f3f4f6',
                                        borderColor: '#e5e7eb'
                                      }
                                    }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>
                                        {r.reason}
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f2937', fontSize: '1.1rem' }}>
                                        {r.count.toLocaleString('en-IN')}
                                      </Typography>
                                    </Box>
                                  </Grow>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </>
                      )}
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Commission & Charges Summary (replaces Settlement/Unsettled section) */}
        <Card sx={{ 
          mb: 6,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          borderRadius: '16px',
          border: '1px solid #f1f3f4',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          }
        }}>
          <CardContent sx={{ p: 5 }}>
            {(() => {
              const commissionArray = (mainSummary as any)?.commission as Array<{
                platform: string;
                total_amount_settled: number;
                total_commission: number;
                total_gst_on_commission: number;
              }> | undefined;
              if (!commissionArray || commissionArray.length === 0) return null;

              const fmtPct = (commissionPlusGst: number, base: number) => {
                if (!base || base === 0) return '0.00%';
                return `${((commissionPlusGst / base) * 100).toFixed(2)}%`;
              };

              // Platform color mapping (extensible for all platforms)
              const palette2 = ['#7A5DBF', '#A79CDB', '#10B981', '#F59E0B', '#0EA5E9', '#6366F1', '#EF4444'];
              const platformColors: Record<string, string> = {
                'paytm': palette2[0],
                'payu': palette2[1],
                'flipkart': palette2[2],
                'amazon': palette2[3],
                'myntra': palette2[4],
              };

              // Build providerData dynamically from API data
              // Commission values are typically negative (charges/deductions), so we use absolute value for display
              const providerData = commissionArray
                .map((item, idx) => {
                  const commissionValue = (item.total_commission || 0) + (item.total_gst_on_commission || 0);
                  return {
                    name: item.platform?.charAt(0).toUpperCase() + item.platform?.slice(1) || `Platform ${idx + 1}`,
                    value: Math.abs(commissionValue), // Use absolute value for display
                    originalSignedValue: commissionValue, // Keep original for calculations
                    color: platformColors[item.platform?.toLowerCase() || ''] || palette2[idx % palette2.length],
                    originalData: item
                  };
                })
                .filter(item => item.value !== 0); // Only show providers with actual charges (positive or negative)

              // Calculate totals dynamically from all providers (use absolute values for display)
              const totalCommissionCharges = Math.abs(commissionArray.reduce((sum, item) => sum + (item.total_commission || 0), 0));
              const totalGstOnCommission = Math.abs(commissionArray.reduce((sum, item) => sum + (item.total_gst_on_commission || 0), 0));

              return (
                <>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 600, 
                    mb: 4, 
                    color: '#1f2937',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    Commission & Charges Summary
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Conditional rendering based on provider count */}
                    <Grid item xs={12} md={8}>
                      <Box sx={{ height: 360 }}>
                        {providerData.length === 1 ? (
                          // Single Provider - Show detailed gradient card
                          <Box sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${providerData[0].color}22 0%, ${providerData[0].color}11 100%)`,
                            borderRadius: '20px',
                            border: `2px solid ${providerData[0].color}`,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              textAlign: 'center',
                              position: 'relative',
                              zIndex: 2,
                              p: 4
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1f2937' }}>
                                {providerData[0].name}
                              </Typography>
                              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: providerData[0].color }}>
                                {formatCurrency(providerData[0].value)}
                              </Typography>
                              <Box sx={{ 
                                display: 'inline-block',
                                px: 3, 
                                py: 1.5,
                                borderRadius: '20px',
                                background: `${providerData[0].color}15`,
                                border: `1px solid ${providerData[0].color}`,
                                color: providerData[0].color,
                                fontWeight: 600
                              }}>
                                {fmtPct(
                                  providerData[0].value,
                                  providerData[0].originalData.total_amount_settled || 0
                                )} of settled amount
                              </Box>
                            </Box>
                          </Box>
                        ) : providerData.length > 1 ? (
                          // Multiple Providers - Show pie chart
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={providerData}
                                cx="50%"
                                cy="50%"
                                innerRadius={122}
                                outerRadius={140}
                                paddingAngle={1}
                                cornerRadius={1}
                                dataKey="value"
                              >
                                {providerData.map((p, idx) => (
                                  <Cell key={`prov-${idx}`} fill={p.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip formatter={(value: any, name: string) => [formatCurrency(Number(value)), name]} />
                              <Legend verticalAlign="bottom" height={36} formatter={(value, entry) => (
                                <span style={{ color: '#1a1a1a', fontSize: '12px', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>{value}</span>
                              )} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          // No data - show message
                          <Box sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6b7280',
                            border: '2px dashed #e5e7eb',
                            borderRadius: '20px'
                          }}>
                            <Typography variant="h6">No commission data available</Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    {/* KPI cards (totals) */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ p: 4, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(229, 231, 235, 0.6)', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Total Commission Charges</Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: '#1f2937', fontWeight: 600 }}>{formatCurrency(totalCommissionCharges)}</Typography>
                        </Box>
                        <Box sx={{ p: 4, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(229, 231, 235, 0.6)', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Total GST on Commission</Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: '#1f2937', fontWeight: 600 }}>{formatCurrency(totalGstOnCommission)}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Dynamic provider breakdown */}
                  <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                      {commissionArray.map((item, idx) => (
                        <Grid key={idx} item xs={12} md={providerData.length === 1 ? 12 : 6}>
                          <Box sx={{ p: 3, borderRadius: '14px', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(229,231,235,0.6)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" sx={{ color: '#374151', fontWeight: 700 }}>
                                {item.platform?.charAt(0).toUpperCase() + item.platform?.slice(1) || 'Unknown Platform'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                {fmtPct(
                                  Math.abs((item.total_commission || 0) + (item.total_gst_on_commission || 0)),
                                  item.total_amount_settled || 0
                                )} of settled
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                              <Typography variant="body2" sx={{ color: '#374151' }}>Commission</Typography>
                              <Typography variant="subtitle2" sx={{ color: '#1f2937', fontWeight: 700 }}>
                                {formatCurrency(Math.abs(item.total_commission))}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="body2" sx={{ color: '#374151' }}>GST</Typography>
                              <Typography variant="subtitle2" sx={{ color: '#1f2937', fontWeight: 700 }}>
                                {formatCurrency(Math.abs(item.total_gst_on_commission))}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Payment Ageing Analysis (replaces Sales Dashboard) */}
        <Paper sx={{ 
          p: 3, 
          mb: 6, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h3" sx={{ color: '#1f2937', fontWeight: 600 }}>
              Payment Ageing Analysis
            </Typography>
            <Chip 
              label={ageingLoading ? 'Loading...' : `Avg TAT: ${overallAvgTAT} days`} 
              sx={{ bgcolor: '#e6f4ea', color: '#1b5e20', fontWeight: 700 }} 
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {AGE_BUCKETS.map((b) => (
              <Chip 
                key={b} 
                size="small" 
                label={b} 
                variant="outlined"
                sx={{ 
                  borderColor: BUCKET_COLORS[b], 
                  color: BUCKET_COLORS[b], 
                  fontWeight: 700 
                }} 
              />
            ))}
          </Box>
          <Box sx={{ width: '100%', height: 380 }}>
            {ageingLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageingChartData} margin={{ top: 40, right: 10, left: 0, bottom: 0 }} barCategoryGap={"25%"} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="provider" tick={{ fontSize: 12 }} interval={0} height={60} angle={-15} textAnchor="end" />
                  <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <RechartsTooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                  {AGE_BUCKETS.map((b, idx) => (
                    <Bar key={b} dataKey={b} stackId="a" fill={BUCKET_COLORS[b]} radius={0} barSize={22}>
                      {idx === AGE_BUCKETS.length - 1 && (
                        <LabelList
                          dataKey="avgTat"
                          position="top"
                          formatter={(v: number) => `Avg TAT: ${Number(v).toFixed(1)}d`}
                        />
                      )}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>

        {/* Provider TAT Summary removed; avg TAT is annotated on bars above */}

        {/* Tax Breakdown (TCS/TDS) section commented out as requested */}
        {/*
        <Card sx={{ 
          mb: 6,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          borderRadius: '16px',
          border: '1px solid #f1f3f4',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          }
        }}>
          <CardContent sx={{ p: 5 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 4, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #bfdbfe',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#1e40af', 
                    mb: 3,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    TCS (Tax Collected at Source)
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1d4ed8',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.02em'
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.totalTDA))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 4, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  border: '1px solid #e9d5ff',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)',
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#7c2d12', 
                    mb: 3,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    TDS (Tax Deducted at Source)
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#a855f7',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.02em'
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.totalTDS))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        */}
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
            onBack={() => {
              setShowTransactionSheet(false);
              setSelectedProviderPlatform(undefined);
            }} 
            statsData={reconciliationData}
            initialTab={initialTsTab}
            dateRange={{ start: customStartDate, end: customEndDate }}
            initialPlatforms={selectedProviderPlatform && initialTsTab === 1 ? [selectedProviderPlatform] : undefined}
          />
        </Box>
      )}


    </Box>
  );
};

export default MarketplaceReconciliation;