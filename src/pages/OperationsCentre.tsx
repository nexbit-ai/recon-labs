import React, { useEffect, useState, useRef, Fragment, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Fade,
  Button,
  Checkbox,
  Radio,
  RadioGroup,
  Snackbar,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Portal,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  InputAdornment,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Drawer
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  StorefrontOutlined as StorefrontIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  UnfoldMore as UnfoldMoreIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import ColumnFilterControls from '../components/ColumnFilterControls';
import TransactionSheet from './TransactionSheet';
// Type definitions for transaction data based on API response
interface TransactionRow {
  "Order ID": string;
  "Amount": number;
  "Order Value"?: number; // Kept for compatibility
  "Settlement Value": number;
  "Invoice Date": string;
  "Order Date"?: string; // Kept for compatibility
  "Settlement Date": string;
  "Difference": number;
  "Remark": string;
  "Event Type": string;
  "Settlement Provider"?: string;
  // Preserve original API response data for popup access
  originalData?: any;
}

// Interface for grouped unreconciled data
interface GroupedUnreconciledData {
  reason: string;
  count: number;
  amount: number;
  orderIds: string[];
  transactions: any[]; // Store full transaction data for expansion
}

// API Response metadata types
interface TransactionMetadata {
  counts: {
    more_payment_received: number;
    settlement_matched: number;
    settled: number;
    less_payment_received: number;
    unsettled: number;
  };
  pagination: {
    current_count: number;
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  totals: {
    total_diff: string;
    total_sales_value: string;
    total_settlement_value: string;
  };
}

// Query parameters interface
interface TransactionQueryParams {
  page?: number;
  limit?: number;
  status_in?: string;
  order_date_from?: string;
  order_date_to?: string;
  buyer_invoice_date_from?: string;
  buyer_invoice_date_to?: string;
  diff_min?: number;
  diff_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  order_item_id?: string;
  remark?: string;
  pagination?: boolean;
  // D2C-specific parameters
  invoice_date_from?: string;
  invoice_date_to?: string;
  settlement_date_from?: string;
  settlement_date_to?: string;
  reason_in?: string;
  order_id?: string;
}

// Generate dummy unreconciled data for demonstration
const generateDummyUnreconciledData = () => {
  const reasons = [
    'customer_add_ons',
    'shipping_charges',
    'payment_gateway_fees',
    'platform_commission',
    'refund_processing_fee',
    'late_delivery_penalty',
    'inventory_mismatch',
    'promotional_discount',
    'tax_calculation_error',
    'currency_conversion_fee'
  ];

  const statuses = [
    'less_payment_received',
    'more_payment_received',
    'pending_reconciliation'
  ];

  const dummyData = [];

  for (let i = 1; i <= 25; i++) {
    const orderValue = Math.floor(Math.random() * 50000) + 1000; // 1000 to 51000
    const settlementValue = orderValue + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2000) + 100; // Add/subtract random amount
    const difference = settlementValue - orderValue;
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate dates within the last 30 days
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

    const settlementDate = new Date();
    settlementDate.setDate(settlementDate.getDate() - Math.floor(Math.random() * 15));

    dummyData.push({
      "Order ID": `ORD_${String(10000 + i).padStart(6, '0')}`,
      "Order Value": orderValue,
      "Settlement Value": settlementValue,
      "Order Date": orderDate.toISOString().split('T')[0],
      "Settlement Date": settlementDate.toISOString().split('T')[0],
      "Difference": difference,
      "Remark": difference > 0 ? "Short Amount Received" : "Excess Amount Received",
      "Event Type": "Sale",
      // Additional fields for compatibility
      order_id: `ORD_${String(10000 + i).padStart(6, '0')}`,
      order_value: orderValue.toString(),
      settlement_value: settlementValue.toString(),
      diff: difference.toString(),
      invoice_date: orderDate.toISOString().split('T')[0],
      settlement_date: settlementDate.toISOString().split('T')[0],
      breakups: {
        mismatch_reason: reason,
        recon_status: status
      },
      reason: reason,
      status: status,
      originalData: {
        order_id: `ORD_${String(10000 + i).padStart(6, '0')}`,
        order_value: orderValue,
        settlement_value: settlementValue,
        diff: difference,
        invoice_date: orderDate.toISOString().split('T')[0],
        settlement_date: settlementDate.toISOString().split('T')[0],
        breakups: {
          mismatch_reason: reason,
          recon_status: status
        }
      }
    });
  }

  return dummyData;
};

// Helper function to format settlement provider: capitalize first letter, replace underscores with spaces
const formatSettlementProvider = (value: string | null | undefined): string => {
  if (!value) return '';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to clean enum values for display (same as TransactionSheet)
const cleanEnumValue = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Transform API data to TransactionRow format
const transformOrderItemToTransactionRow = (orderItem: any): TransactionRow => {
  // Helper function to parse currency/numeric strings
  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    // Convert to string and clean it
    const cleanedValue = String(value)
      .replace(/[₹$,\s]/g, '') // Remove currency symbols, commas, and spaces
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus signs
      .trim();

    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
  };





  // Extract values from the API structure
  const orderValue = parseNumericValue(orderItem.order_value || orderItem.buyer_invoice_amount);
  const settlementValue = parseNumericValue(orderItem.settlement_value);
  const difference = parseNumericValue(orderItem.diff);

  // Handle missing or empty order_item_id
  let orderItemId = orderItem.order_item_id;
  if (!orderItemId || orderItemId.trim() === '') {
    orderItemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Determine remark based on API response
  let remark = "unsettled";
  if (orderItem.status === "settlement_matched") {
    if (difference === 0) {
      remark = "Matched";
    } else if (difference > 0) {
      remark = "Short Amount Received";
    } else {
      remark = "Excess Amount Received";
    }
  }

  // Determine settlement date from API response
  let settlementDate = "";
  if (orderItem.settlement_date && orderItem.settlement_date.trim() !== '') {
    try {
      settlementDate = new Date(orderItem.settlement_date).toISOString().split('T')[0];
    } catch (error) {
      settlementDate = "Invalid Date";
    }
  } else {
    settlementDate = "Invalid Date";
  }

  return {
    "Order ID": orderItemId,
    "Amount": orderValue,
    "Order Value": orderValue, // Kept for compatibility
    "Settlement Value": settlementValue,
    "Invoice Date": new Date(orderItem.order_date).toISOString().split('T')[0],
    "Order Date": new Date(orderItem.order_date).toISOString().split('T')[0], // Kept for compatibility
    "Settlement Date": settlementDate,
    "Difference": difference,
    "Remark": remark,
    "Event Type": orderItem.event_type || "Sale", // Default to "Sale" if not provided
    "Settlement Provider": formatSettlementProvider(orderItem.settlement_provider),
    // Preserve the original API response data for popup access
    originalData: orderItem,
  };
};

const OperationsCentrePage: React.FC = () => {
  const [disputeSubTab, setDisputeSubTab] = useState<number>(2); // 0: unreconciled, 1: manually reconciled, 2: disputed

  const [showTransactionSheet, setShowTransactionSheet] = useState(false);

  // State for date filtering
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  // Initialize date range synchronously from URL → localStorage → this month to avoid race before first fetch
  const initialFromTo = (() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const to = params.get('to');
    const kindParam = params.get('dateRange');
    if (from && to) return { start: from, end: to, kind: kindParam || 'custom' };
    try {
      const lsFrom = localStorage.getItem('recon_selected_date_from') || '';
      const lsTo = localStorage.getItem('recon_selected_date_to') || '';
      const lsKind = localStorage.getItem('recon_selected_date_kind') || '';
      if (lsFrom && lsTo) return { start: lsFrom, end: lsTo, kind: lsKind || 'custom' };
    } catch { }
    const now = new Date();
    const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().split('T')[0];
    const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)).toISOString().split('T')[0];
    return { start: firstDay, end: lastDay, kind: 'this-month' as const };
  })();
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | 'this-month' | 'last-month' | 'this-year' | 'last-fiscal-year' | 'custom'>(initialFromTo.kind as any);
  const [customStartDate, setCustomStartDate] = useState(initialFromTo.start);
  const [customEndDate, setCustomEndDate] = useState(initialFromTo.end);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Header date range state - for the date selector displayed at the top
  // removed legacy date range states

  // Calendar popup state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const calendarPopupRef = useRef<HTMLDivElement>(null);
  // StrictMode-safe initial-run guards
  const isInitialRenderRef = useRef(true);
  const hasFetchedOnInitialRef = useRef(false);

  // Initialize platform from URL or localStorage - single platform only
  const getInitialPlatform = (): 'flipkart' | 'amazon' | 'amazon_uk' | 'd2c' => {
    const params = new URLSearchParams(window.location.search);
    const platformsParam = params.get('platforms');
    if (platformsParam) {
      const platforms = platformsParam.split(',').filter(p => ['flipkart', 'amazon', 'amazon_uk', 'd2c'].includes(p)) as Array<'flipkart' | 'amazon' | 'amazon_uk' | 'd2c'>;
      if (platforms.length > 0) {
        // Return only the first platform for single-select
        return platforms[0];
      }
    }
    // Ignore localStorage to enforce Amazon as the absolute default
    try {
      // We still update localStorage when platform changes, but we don't read it for the initial load 
      // to ensure Amazon is the strict default when no URL param is present.
    } catch (e) {
      console.warn('Failed to handle platforms from localStorage:', e);
    }
    return 'amazon'; // default fallback
  };

  // Platform selector state for dropdown (single-select) - initialize from URL params
  const [platformMenuAnchorEl, setPlatformMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'flipkart' | 'amazon' | 'amazon_uk' | 'd2c'>(getInitialPlatform());

  // Initialize platform and tab from URL query params if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Also update platform from URL params if present (use first if multiple)
    const platformsParam = params.get('platforms');
    if (platformsParam) {
      const platforms = platformsParam.split(',').filter(p => ['flipkart', 'amazon', 'amazon_uk', 'd2c'].includes(p)) as Array<'flipkart' | 'amazon' | 'amazon_uk' | 'd2c'>;
      if (platforms.length > 0) {
        setSelectedPlatform(platforms[0]); // Use first platform only
      }
    }

    // Set tab from URL parameter if provided (0: unreconciled, 1: manually reconciled, 2: disputed)
    const tabParam = params.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 1 && tabIndex <= 2) {
        setDisputeSubTab(tabIndex);
      }
    }
  }, []);

  // Persist date selection to URL and localStorage whenever it changes
  useEffect(() => {
    try {
      if (customStartDate) localStorage.setItem('recon_selected_date_from', customStartDate);
      if (customEndDate) localStorage.setItem('recon_selected_date_to', customEndDate);
      if (selectedDateRange) localStorage.setItem('recon_selected_date_kind', selectedDateRange);
    } catch { }
    const params = new URLSearchParams(window.location.search);
    if (customStartDate && customEndDate) {
      params.set('from', customStartDate);
      params.set('to', customEndDate);
    } else {
      params.delete('from');
      params.delete('to');
    }
    params.set('dateRange', selectedDateRange || 'custom');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedDateRange, customStartDate, customEndDate]);

  // Date range menu state
  const [dateRangeMenuAnchor, setDateRangeMenuAnchor] = useState<HTMLElement | null>(null);

  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: 'Today', dates: 'Today' },
    { value: 'this-month', label: 'This month', dates: 'This month' },
    { value: 'this-year', label: 'Current Fiscal Year', dates: 'Current Fiscal Year' },
    { value: 'last-fiscal-year', label: 'Last Fiscal Year', dates: 'Last Fiscal Year' },
    { value: 'custom', label: 'Custom date range', dates: 'Custom' }
  ];

  // API data state - separate state for each tab
  const [unreconciledRows, setUnreconciledRows] = useState<TransactionRow[] | GroupedUnreconciledData[]>([]);
  const [manuallyReconciledRows, setManuallyReconciledRows] = useState<TransactionRow[]>([]);
  const [disputedRows, setDisputedRows] = useState<TransactionRow[]>([]);
  // Store API response with columns for settlement provider filter
  const [apiResponseData, setApiResponseData] = useState<any>(null);

  // Claim Batches State
  const [claimBatches, setClaimBatches] = useState<any[]>([]);
  const filteredBatches = claimBatches.filter(b => b.platform === selectedPlatform);
  const [activeClaimTag, setActiveClaimTag] = useState<string>('All');

  // Claims UI states
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimTicketInput, setClaimTicketInput] = useState('');
  const [pendingClaim, setPendingClaim] = useState<{ orderId: string, platform: string } | null>(null);

  // Helper to get current tab's data (for backward compatibility)
  const getApiRows = () => {
    if (disputeSubTab === 0) return unreconciledRows;
        return disputedRows;
  };

  const [mockRows, setMockRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'unreconciled' | 'open' | 'raised'; }>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pagination for unreconciled tab
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  // Total counts for each tab from API responses
  const [unreconciledCount, setUnreconciledCount] = useState(0);
  const [manuallyReconciledCount, setManuallyReconciledCount] = useState(0);
  const [disputedCount, setDisputedCount] = useState(0);
  // Legacy totalCount for backward compatibility
  const totalCount = unreconciledCount;


  // Column filter state
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');

  // Order ID search states (match TransactionSheet behavior)
  const [orderIdChips, setOrderIdChips] = useState<string[]>([]);
  const [orderIdSearch, setOrderIdSearch] = useState<string>('');
  const [showOrderIdSearch, setShowOrderIdSearch] = useState<boolean>(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Column metadata for filter types
  const COLUMN_META = {
    'Order ID': { type: 'string' },
    'Order Value': { type: 'number' },
    'Settlement Value': { type: 'number' },
    'Invoice Date': { type: 'date' },
    'Settlement Date': { type: 'date' },
    'Difference': { type: 'number' },
    'Reason': { type: 'enum' },
    'Event Type': { type: 'enum' },
    'Status': { type: 'enum' },
    'Settlement Provider': { type: 'enum' }
  };

  // Complete mapping of UI columns to API parameters (similar to TransactionSheet)
  const COLUMN_TO_API_PARAM_MAP: Record<string, {
    apiParam: string;
    type: 'string' | 'number' | 'date' | 'enum';
    supportedPlatforms?: ('flipkart' | 'amazon' | 'amazon_uk' | 'd2c' | 'all')[];
    usesInSuffix?: boolean; // For CSV filters like status_in
  }> = {
    // Common filters (both platforms)
    'Order ID': { apiParam: 'order_id', type: 'string' }, // Special: chips input
    'Status': { apiParam: 'status_in', type: 'enum', usesInSuffix: true },
    'Invoice Date': { apiParam: 'order_date', type: 'date' }, // → order_date_from/to
    'Settlement Date': { apiParam: 'settlement_date', type: 'date' },
    'Order Value': { apiParam: 'order_value', type: 'number' },
    'Settlement Value': { apiParam: 'settlement_value', type: 'number' },
    'Difference': { apiParam: 'diff', type: 'number' },
    'Reason': { apiParam: 'reason_in', type: 'enum', usesInSuffix: true },
    'Event Type': { apiParam: 'event_type', type: 'enum' },
    // D2C-specific CSV filters (with _in suffix support)
    'Settlement Provider': { apiParam: 'settlement_provider', type: 'enum', supportedPlatforms: ['d2c'] },
  };

  // Mapping of sortable UI columns to backend sort_by values
  const COLUMN_TO_SORT_BY_MAP: Record<string, string> = {
    'Order Value': 'order_value',
    'Settlement Value': 'settlement_value',
    'Invoice Date': 'invoice_date',
    'Settlement Date': 'settlement_date',
    'Difference': 'diff',
  };

  // Format backend reason keys like "customer_add_ons" into human-friendly labels like "Customer Add Ons"
  const formatReasonLabel = (reason?: string): string => {
    if (!reason || reason.trim() === '') return 'Unknown';
    const normalized = reason.replace(/[_-]+/g, ' ').trim();
    return normalized
      .split(' ')
      .filter(Boolean)
      .map(part => (part.charAt(0).toUpperCase() + part.slice(1)))
      .join(' ');
  };

  // Convert formatted reason label back to API format (lowercase with spaces)
  const formatReasonForAPI = (reason?: string): string => {
    if (!reason || reason.trim() === '') return '';
    return reason.toLowerCase();
  };

  // Create mapping from cleaned values to original values for settlement_provider
  const settlementProviderMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    if (apiResponseData?.columns) {
      const settlementProviderColumn = apiResponseData.columns.find(
        (col: any) => col.key === 'settlement_provider' && col.type === 'enum'
      );
      if (settlementProviderColumn?.values) {
        settlementProviderColumn.values.forEach((originalValue: string) => {
          const cleanedValue = cleanEnumValue(originalValue);
          mapping[cleanedValue] = originalValue;
        });
      }
    }
    return mapping;
  }, [apiResponseData]);

  // Get current date range display text
  const getCurrentDateRangeText = () => {
    if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }

    const today = new Date();
    let startDate, endDate;

    if (selectedDateRange === 'today') {
      startDate = endDate = today.toISOString().split('T')[0];
    } else if (selectedDateRange === 'this-month') {
      startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate = endOfMonth.toISOString().split('T')[0];
    } else if (selectedDateRange === 'this-year') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-11
      if (currentMonth >= 3) {
        startDate = `${currentYear}-04-01`;
        endDate = `${currentYear + 1}-03-31`;
      } else {
        startDate = `${currentYear - 1}-04-01`;
        endDate = `${currentYear}-03-31`;
      }
    } else if (selectedDateRange === 'last-fiscal-year') {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      if (currentMonth >= 3) {
        startDate = `${currentYear - 1}-04-01`;
        endDate = `${currentYear}-03-31`;
      } else {
        startDate = `${currentYear - 2}-04-01`;
        endDate = `${currentYear - 1}-03-31`;
      }
    }

    return startDate && endDate ? `${startDate} to ${endDate}` : 'Select date';
  };

  // Handle date range selection
  const handleDateRangeSelect = (value: string) => {
    setSelectedDateRange(value as any);
    if (value !== 'custom') {
      setDateRangeMenuAnchor(null);
      setPage(0);
      fetchAllTabsData();
    } else {
      setShowCustomDatePicker(true);
      setDateRangeMenuAnchor(null);
    }
  };

  // Initialize calendar dates when custom picker opens
  useEffect(() => {
    if (showCustomDatePicker) {
      if (!currentCalendarDate || currentCalendarDate.getTime() === 0) {
        const today = new Date();
        setCurrentCalendarDate(today);
        if (!customStartDate) {
          setCustomStartDate(today.toISOString().split('T')[0]);
        }
      } else if (!customStartDate) {
        const today = new Date();
        setCustomStartDate(today.toISOString().split('T')[0]);
      }
    }
  }, [showCustomDatePicker, customStartDate, currentCalendarDate]);

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

  const getDateFromCalendarPosition = (day: string) => {
    if (!day) return null;
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    return new Date(year, month, parseInt(day));
  };

  const getCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
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
    const dateString = clickedDate.toLocaleDateString('en-CA');

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(dateString);
      setTempEndDate('');
      setCustomStartDate(dateString);
      setCustomEndDate('');
    } else {
      if (new Date(dateString) < new Date(tempStartDate)) {
        setTempEndDate(tempStartDate);
        setTempStartDate(dateString);
        setCustomStartDate(dateString);
        setCustomEndDate(tempStartDate);
        setShowCustomDatePicker(false);
        setPage(0);
        fetchAllTabsData();
      } else {
        setTempEndDate(dateString);
        setCustomEndDate(dateString);
        setShowCustomDatePicker(false);
        setPage(0);
        fetchAllTabsData();
      }
    }
  };

  const isDateSelected = (day: string) => {
    if (!day) return false;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return false;
    const dateString = clickedDate.toLocaleDateString('en-CA');
    return dateString === customStartDate || dateString === customEndDate;
  };

  const isDateInRange = (day: string) => {
    if (!day || !customStartDate || !customEndDate) return false;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return false;
    const dateString = clickedDate.toLocaleDateString('en-CA');
    const date = new Date(dateString);
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    return date >= start && date <= end;
  };

  // Sorting functions
  const handleSort = (columnKey: string) => {
    // Only allow sorting for supported columns
    const sortBy = COLUMN_TO_SORT_BY_MAP[columnKey];
    if (!sortBy) return;

    // Compute next sort state deterministically
    let nextSort: { key: string; direction: 'asc' | 'desc' } | null;
    if (sortConfig?.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        nextSort = { key: columnKey, direction: 'desc' };
      } else {
        nextSort = null; // Remove sorting -> backend default applies
      }
    } else {
      nextSort = { key: columnKey, direction: 'asc' };
    }

    setSortConfig(nextSort);

    // Trigger server-side refetch with sorting (reset to first page) - fetch all tabs
    setPage(0);
    fetchAllTabsData(undefined, nextSort, true);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <UnfoldMoreIcon fontSize="small" />;
    }
    // Flipped: show Down arrow for ascending, Up arrow for descending
    return sortConfig.direction === 'asc'
      ? <ArrowDownwardIcon fontSize="small" />
      : <ArrowUpwardIcon fontSize="small" />;
  };

  // Match Transaction Sheet date display: e.g., "17th March, 2025"
  const formatDateWithOrdinal = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const getOrdinalSuffix = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
  };

  const formatDate = (dateString: string) => formatDateWithOrdinal(dateString);

  // Build query parameters for API calls
  const buildQueryParams = (
    filtersOverride?: Record<string, any>,
    orderIdsCsvOverride?: string,
    pageOverride?: number,
    rowsPerPageOverride?: number,
    tabOverride?: number
  ): TransactionQueryParams => {
    const params: TransactionQueryParams = {};
    const f = filtersOverride || columnFilters;
    const currentTab = tabOverride !== undefined ? tabOverride : disputeSubTab;

    // Set status for unreconciled orders (less_payment_received, more_payment_received)
    // Only set default if no status filter is explicitly applied
    if (currentTab === 0 && !f['Status']) {
      params.status_in = 'less_payment_received,more_payment_received';
    }

    // Use server-side pagination for all tabs
    params.page = (pageOverride !== undefined ? pageOverride : page) + 1;
    params.limit = rowsPerPageOverride !== undefined ? rowsPerPageOverride : rowsPerPage;

    // Add sorting parameters
    if (sortConfig && COLUMN_TO_SORT_BY_MAP[sortConfig.key]) {
      params.sort_by = COLUMN_TO_SORT_BY_MAP[sortConfig.key];
      params.sort_order = sortConfig.direction;
    }

    // Order ID filter → order_id (CSV) with explicit override support to avoid async state timing
    let orderIdsCsv: string | undefined;
    if (orderIdsCsvOverride !== undefined) {
      orderIdsCsv = orderIdsCsvOverride;
    } else {
      orderIdsCsv = orderIdChips.length > 0 ? orderIdChips.join(',') : '';
    }
    if (orderIdsCsv !== undefined && orderIdsCsv !== '') {
      (params as any).order_id = orderIdsCsv;
    }

    // Apply column filters using generic mapping (similar to TransactionSheet)
    Object.entries(f).forEach(([columnKey, filterValue]) => {
      if (!filterValue) return;

      // Skip Reason filter - it's handled on frontend only (backend doesn't support it)
      if (columnKey === 'Reason') return;

      const mapping = COLUMN_TO_API_PARAM_MAP[columnKey];
      if (!mapping) return;

      // Skip Order ID as it's handled separately above
      if (columnKey === 'Order ID') return;

      // Check platform compatibility
      if (mapping.supportedPlatforms) {
        const isSupported = mapping.supportedPlatforms.includes(selectedPlatform as any);
        if (!isSupported) {
          return; // Skip filters not supported by selected platform
        }
      }

      const baseParam = mapping.apiParam;

      switch (mapping.type) {
        case 'string':
          if (typeof filterValue === 'string' && filterValue.trim()) {
            (params as any)[baseParam] = filterValue.trim();
          }
          break;

        case 'number':
          if (typeof filterValue === 'object' && filterValue !== null) {
            if (filterValue.min !== undefined && filterValue.min !== '') {
              const v = parseFloat(filterValue.min);
              if (!Number.isNaN(v)) {
                (params as any)[`${baseParam}_min`] = v;
              }
            }
            if (filterValue.max !== undefined && filterValue.max !== '') {
              const v = parseFloat(filterValue.max);
              if (!Number.isNaN(v)) {
                (params as any)[`${baseParam}_max`] = v;
              }
            }
          }
          break;

        case 'date':
          if (typeof filterValue === 'object' && filterValue !== null) {
            if (filterValue.from) {
              (params as any)[`${baseParam}_from`] = filterValue.from;
            }
            if (filterValue.to) {
              (params as any)[`${baseParam}_to`] = filterValue.to;
            }
          }
          break;

        case 'enum':
          if (Array.isArray(filterValue) && filterValue.length > 0) {
            // For Settlement Provider, map cleaned values back to original values
            if (columnKey === 'Settlement Provider') {
              const originalValues = filterValue
                .map(cleanedValue => settlementProviderMapping[cleanedValue] || cleanedValue)
                .filter(Boolean);
              if (originalValues.length > 0) {
                (params as any)[baseParam] = originalValues.join(',');
              }
            } else {
              // For other enum filters, join directly
              (params as any)[baseParam] = filterValue.join(',');
            }
          }
          break;
      }
    });

    // Set date range based on selected date range
    // Only set if Invoice Date filter is not explicitly applied (to avoid overriding user's filter)
    if (!f['Invoice Date'] || !f['Invoice Date'].from || !f['Invoice Date'].to) {
      if (selectedDateRange === 'this-month') {
        const now = new Date();
        const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
        params.order_date_from = firstDay.toISOString().split('T')[0];
        params.order_date_to = lastDay.toISOString().split('T')[0];
      } else if (selectedDateRange === 'last-month') {
        const now = new Date();
        const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
        const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0));
        params.order_date_from = firstDay.toISOString().split('T')[0];
        params.order_date_to = lastDay.toISOString().split('T')[0];
      } else if (selectedDateRange === 'this-year') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        if (currentMonth >= 3) {
          params.order_date_from = `${currentYear}-04-01`;
          params.order_date_to = `${currentYear + 1}-03-31`;
        } else {
          params.order_date_from = `${currentYear - 1}-04-01`;
          params.order_date_to = `${currentYear}-03-31`;
        }
      } else if (selectedDateRange === 'last-fiscal-year') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        if (currentMonth >= 3) {
          params.order_date_from = `${currentYear - 1}-04-01`;
          params.order_date_to = `${currentYear}-03-31`;
        } else {
          params.order_date_from = `${currentYear - 2}-04-01`;
          params.order_date_to = `${currentYear - 1}-03-31`;
        }

      } else if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
        params.order_date_from = customStartDate;
        params.order_date_to = customEndDate;
      }

      // Ensure we always have default dates if none are set
      if (!(params as any).order_date_from || !(params as any).order_date_to) {
        const now = new Date();
        const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
        (params as any).order_date_from = firstDay.toISOString().split('T')[0];
        (params as any).order_date_to = lastDay.toISOString().split('T')[0];
      }
    }

    // Add platform parameter from selectedPlatform (single platform only)
    if (selectedPlatform) {
      (params as any).platform = selectedPlatform;
    }

    return params;
  };

  // Transform API response to TransactionRow format
  const transformTransactionData = (transactionData: any[]): TransactionRow[] => {
    const transformedRows: TransactionRow[] = [];

    if (Array.isArray(transactionData)) {
      transactionData.forEach((transaction: any) => {
        // Parse numeric values
        const parseNumeric = (value: any): number => {
          if (!value) return 0;
          const cleaned = String(value).replace(/[₹$,\s]/g, '').replace(/[^\d.-]/g, '').trim();
          return parseFloat(cleaned) || 0;
        };

        // Format dates
        const formatDate = (date: string | Date): string => {
          if (!date) return '';
          try {
            return new Date(date).toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        // For manually reconciled and disputed tabs, use manual_override_note if available
        // Otherwise, use mismatch_reason from breakups or metadata
        let remark = 'Not Available';
        if (transaction.metadata?.manual_override_note) {
          remark = transaction.metadata.manual_override_note;
        } else if (transaction.metadata?.breakups?.mismatch_reason) {
          remark = transaction.metadata.breakups.mismatch_reason;
        } else if (transaction.breakups?.mismatch_reason) {
          remark = transaction.breakups.mismatch_reason;
        } else if (transaction.remark) {
          remark = transaction.remark;
        }

        transformedRows.push({
          "Order ID": transaction.order_item_id || transaction.order_id || '',
          "Amount": parseNumeric(transaction.order_value || transaction.buyer_invoice_amount),
          "Order Value": parseNumeric(transaction.order_value || transaction.buyer_invoice_amount),
          "Settlement Value": parseNumeric(transaction.settlement_value || transaction.settlement_amount),
          "Invoice Date": formatDate(transaction.invoice_date || transaction.order_date || transaction.buyer_invoice_date),
          "Order Date": formatDate(transaction.invoice_date || transaction.order_date || transaction.buyer_invoice_date),
          "Settlement Date": formatDate(transaction.settlement_date),
          "Difference": parseNumeric(transaction.diff || transaction.difference),
          "Remark": remark,
          "Event Type": transaction.event_type || transaction.eventType || 'Sale',
          originalData: transaction
        });
      });
    }

    return transformedRows;
  };

  // Fetch unreconciled orders from API
  const fetchUnreconciledOrders = async (
    filtersOverride?: Record<string, any>,
    sortOverride?: { key: string; direction: 'asc' | 'desc' } | null,
    applySortOverride?: boolean,
    orderIdsCsvOverride?: string,
    pageOverride?: number,
    rowsPerPageOverride?: number,
    tabOverride?: number
  ) => {
    try {
      // Build query parameters
      const params = buildQueryParams(filtersOverride, orderIdsCsvOverride, pageOverride, rowsPerPageOverride, tabOverride);

      // If explicitly applying override: when null, clear sort; when provided, set it
      if (applySortOverride) {
        delete (params as any).sort_by;
        delete (params as any).sort_order;
        if (sortOverride && COLUMN_TO_SORT_BY_MAP[sortOverride.key]) {
          params.sort_by = COLUMN_TO_SORT_BY_MAP[sortOverride.key];
          params.sort_order = sortOverride.direction;
        }
      } else if (sortOverride && COLUMN_TO_SORT_BY_MAP[sortOverride.key]) {
        // Backward compatibility if called without applySortOverride
        params.sort_by = COLUMN_TO_SORT_BY_MAP[sortOverride.key];
        params.sort_order = sortOverride.direction;
      }

      // Add the unreconciled status filter (only if not overridden by user's Status filter)
      // buildQueryParams already handles this, but we ensure it's set if user hasn't filtered by status
      if (!params.status_in) {
        params.status_in = 'less_payment_received,more_payment_received';
      }
      // Add manual_override_status filter to exclude manually reconciled and disputed orders
      // Pass as string "null" since the API service filters out actual null values
      (params as any).manual_override_status = 'null';

      // Call the API
      const response = await api.transactions.getTotalTransactions(params as any);

      if (response.success && response.data) {
        const responseData = response.data as any;
        const transactionData = responseData.transactions || responseData.data || [];
        const transformedRows = transformTransactionData(transactionData);

        // Store API response with columns for settlement provider filter
        if (responseData.columns) {
          setApiResponseData(responseData);
        }

        setUnreconciledRows(transformedRows);

        // Update count from response
        if (response.data.pagination) {
          setUnreconciledCount(response.data.pagination.total_count ?? response.data.pagination.current_count ?? 0);
        } else {
          setUnreconciledCount(transformedRows.length);
        }

        console.log('Fetched unreconciled orders from API:', transformedRows.length);
      } else {
        console.error('API returned no data');
        setUnreconciledRows([]);
        setUnreconciledCount(0);
      }
    } catch (err) {
      console.error('Error fetching unreconciled orders:', err);
      setError('Failed to load unreconciled data. Please try again.');
      setUnreconciledRows([]);
      setUnreconciledCount(0);
    }
  };

  // Fetch disputed orders from API
  const fetchDisputeRaisedOrders = async (
    filtersOverride?: Record<string, any>,
    sortOverride?: { key: string; direction: 'asc' | 'desc' } | null,
    applySortOverride?: boolean,
    orderIdsCsvOverride?: string,
    pageOverride?: number,
    rowsPerPageOverride?: number,
    tabOverride?: number
  ) => {
    try {
      // Build base query parameters (date, filters, ids, sorting, etc.)
      const params = buildQueryParams(filtersOverride, orderIdsCsvOverride, pageOverride, rowsPerPageOverride, tabOverride);

      // If explicitly applying override: when null, clear sort; when provided, set it
      if (applySortOverride) {
        delete (params as any).sort_by;
        delete (params as any).sort_order;
        if (sortOverride && COLUMN_TO_SORT_BY_MAP[sortOverride.key]) {
          params.sort_by = COLUMN_TO_SORT_BY_MAP[sortOverride.key];
          params.sort_order = sortOverride.direction;
        }
      } else if (sortOverride && COLUMN_TO_SORT_BY_MAP[sortOverride.key]) {
        params.sort_by = COLUMN_TO_SORT_BY_MAP[sortOverride.key];
        params.sort_order = sortOverride.direction;
      }

      // Add manual override status filter for Disputed
      (params as any).manual_override_status = 'DISPUTED';

      // Call the API
      const response = await api.transactions.getTotalTransactions(params as any);

      if (response.success && response.data) {
        const responseData = response.data as any;
        const transactionData = responseData.transactions || responseData.data || [];
        const transformedRows = transformTransactionData(transactionData);

        // Store API response with columns for settlement provider filter
        if (responseData.columns) {
          setApiResponseData(responseData);
        }

        setDisputedRows(transformedRows);

        // Update count from response
        if (response.data.pagination) {
          setDisputedCount(response.data.pagination.total_count ?? response.data.pagination.current_count ?? 0);
        } else {
          setDisputedCount(transformedRows.length);
        }
      } else {
        setDisputedRows([]);
        setDisputedCount(0);
      }
    } catch (err) {
      console.error('Error fetching disputed orders:', err);
      setError('Failed to load disputed data. Please try again.');
      setDisputedRows([]);
      setDisputedCount(0);
    }
  };

  const fetchClaimBatchesData = async () => {
    try {
      const response = await api.claims.getClaimBatches();
      if (response && response.data) {
        setClaimBatches(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching claim batches:', err);
      setClaimBatches([]);
    }
  };

  // Fetch manually reconciled orders from API
  const fetchManuallyReconciledOrders = async (
    filtersOverride?: Record<string, any>,
    sortOverride?: { key: string; direction: 'asc' | 'desc' } | null,
    applySortOverride?: boolean,
    orderIdsCsvOverride?: string,
    pageOverride?: number,
    rowsPerPageOverride?: number,
    tabOverride?: number
  ) => {
    try {
      // Build base query parameters (date, filters, ids, sorting, etc.)
      const params = buildQueryParams(filtersOverride, orderIdsCsvOverride, pageOverride, rowsPerPageOverride, tabOverride);

      // If explicitly applying override: when null, clear sort; when provided, set it
      if (applySortOverride) {
        delete (params as any).sort_by;
        delete (params as any).sort_order;
        if (sortOverride && COLUMN_TO_SORT_BY_MAP[sortOverride.key]) {
          params.sort_by = COLUMN_TO_SORT_BY_MAP[sortOverride.key];
          params.sort_order = sortOverride.direction;
        }
      } else if (sortOverride && COLUMN_TO_SORT_BY_MAP[sortOverride.key]) {
        params.sort_by = COLUMN_TO_SORT_BY_MAP[sortOverride.key];
        params.sort_order = sortOverride.direction;
      }

      // Add manual override status filter for Manually Reconciled
      (params as any).manual_override_status = 'MANUALLY_RECONCILED';

      // Call the API
      const response = await api.transactions.getTotalTransactions(params as any);

      if (response.success && response.data) {
        const responseData = response.data as any;
        const transactionData = responseData.transactions || responseData.data || [];
        const transformedRows = transformTransactionData(transactionData);

        // Store API response with columns for settlement provider filter
        if (responseData.columns) {
          setApiResponseData(responseData);
        }

        setManuallyReconciledRows(transformedRows);

        // Update count from response
        if (response.data.pagination) {
          setManuallyReconciledCount(response.data.pagination.total_count ?? response.data.pagination.current_count ?? 0);
        } else {
          setManuallyReconciledCount(transformedRows.length);
        }
      } else {
        setManuallyReconciledRows([]);
        setManuallyReconciledCount(0);
      }
    } catch (err) {
      console.error('Error fetching manually reconciled orders:', err);
      setError('Failed to load manually reconciled data. Please try again.');
      setManuallyReconciledRows([]);
      setManuallyReconciledCount(0);
    }
  };

  // Load mock data for other tabs on mount
  useEffect(() => {
    if (mockRows.length === 0) {
      const remarks = ['Short Amount Received', 'Excess Amount Received', 'Pending Settlement'];
      const list: Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'unreconciled' | 'open' | 'raised'; }> = [];
      for (let i = 0; i < 12; i++) {
        list.push({
          id: `DISP_${1000 + i}`,
          orderItemId: `FK${12345 + i}`,
          orderDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
          difference: (i % 2 === 0 ? 1 : -1) * (500 + i * 25),
          remark: remarks[i % remarks.length],
          eventType: i % 3 === 0 ? 'Return' : 'Sale',
          status: i % 3 === 0 ? 'raised' : i % 2 === 0 ? 'open' : 'unreconciled',
        });
      }
      setMockRows(list);
    }
  }, []);

  // Fetch only the active tab data whenever filters or other inputs change
  const fetchAllTabsData = async (
    filtersOverride?: Record<string, any>,
    sortOverride?: { key: string; direction: 'asc' | 'desc' } | null,
    applySortOverride?: boolean,
    orderIdsCsvOverride?: string,
    pageOverride?: number,
    rowsPerPageOverride?: number,
    tabOverride?: number
  ) => {
    setApiLoading(true);
    setError(null);

    const activeTab = tabOverride !== undefined ? tabOverride : disputeSubTab;

    try {
      // Fetch only the active tab to prevent redundant over-fetching, or all if activeTab is -1
      const promises = [];
      if (activeTab === 0 || activeTab === -1) {
        promises.push(fetchUnreconciledOrders(filtersOverride, sortOverride, applySortOverride, orderIdsCsvOverride, pageOverride, rowsPerPageOverride, 0));
      }
      if (activeTab === 1 || activeTab === -1) {
        promises.push(fetchDisputeRaisedOrders(filtersOverride, sortOverride, applySortOverride, orderIdsCsvOverride, pageOverride, rowsPerPageOverride, 1));
      }
      if (activeTab === 2 || activeTab === -1) {
        promises.push(fetchClaimBatchesData());
      }
      await Promise.all(promises);
    } catch (err) {
      console.error('Error fetching tab data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Clear Settlement Provider filter when platform changes away from D2C
  useEffect(() => {
    if (selectedPlatform !== 'd2c' && columnFilters['Settlement Provider']) {
      setColumnFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters['Settlement Provider'];
        return newFilters;
      });
    }
  }, [selectedPlatform]);

  // Fetch active tab data whenever filters, platform, date range change
  useEffect(() => {
    if (isInitialRenderRef.current) {
      if (!hasFetchedOnInitialRef.current) {
        hasFetchedOnInitialRef.current = true;
        fetchAllTabsData(undefined, undefined, undefined, undefined, 0, undefined, -1);
        requestAnimationFrame(() => {
          isInitialRenderRef.current = false;
        });
      }
      return;
    }
    // After initial render, fetch when dependencies change
    fetchAllTabsData(undefined, undefined, undefined, undefined, 0, undefined, -1);
  }, [selectedDateRange, customStartDate, customEndDate, selectedPlatform]);

  // Get current rows based on active tab
  const getCurrentRows = () => {
    if (disputeSubTab === 0) return unreconciledRows;
        return disputedRows;
  };

  const current = getCurrentRows();

  // Apply column filters to current data (must be defined before usage below)
  // Calculate total count for unreconciled orders
  const getUnreconciledTotalCount = () => {
    return unreconciledCount;
  };

  // Get count for manually reconciled tab
  const getManuallyReconciledCount = () => {
    return manuallyReconciledCount;
  };

  // Get count for disputed tab
  const getDisputedCount = () => {
    return disputedCount;
  };

  const paginatedCurrent = current;

  // Selection helpers for visible rows in Unreconciled tab
  const visibleIds: string[] = disputeSubTab === 0
    ? (paginatedCurrent as any[]).map((r) => r["Order ID"] || r.originalData?.order_item_id || r.originalData?.order_id || r.order_id || '')
    : [];
  const allSelectedInView = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const someSelectedInView = visibleIds.some(id => selectedIds.includes(id)) && !allSelectedInView;
  const toggleSelectAllInView = () => {
    if (allSelectedInView) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Debug logging for data flow
  useEffect(() => {
    if (disputeSubTab === 0) {
      const currentTabRows = getApiRows();
      console.log('Current unreconciledRows:', currentTabRows);
      console.log('Current rows for display:', current);
      console.log('unreconciledRows length:', Array.isArray(currentTabRows) ? currentTabRows.length : 0);
      console.log('current length:', current.length);
      console.log('Column filters:', columnFilters);
      console.log('Active filter column:', activeFilterColumn);
    }
  }, [unreconciledRows, disputeSubTab, current, columnFilters, activeFilterColumn]);

  // Force re-render when data changes
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const currentTabRows = getApiRows();
    if (Array.isArray(currentTabRows) && currentTabRows.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [unreconciledRows, manuallyReconciledRows, disputedRows]);

  // Track which rows are expanded
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (reason: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reason)) {
        newSet.delete(reason);
      } else {
        newSet.add(reason);
      }
      return newSet;
    });
  };

  // Raise Dispute dialog state
  const [raiseDialogOpen, setRaiseDialogOpen] = useState(false);
  const [selectedRaiseGroup, setSelectedRaiseGroup] = useState<{ reason: string; count: number; orderIds: string[] } | null>(null);
  const [raiseDescription, setRaiseDescription] = useState<string>('');

  // Transaction history modal state (for manually reconciled and disputed tabs)
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTransactionRow, setSelectedTransactionRow] = useState<any>(null);
  const [historyAnchorEl, setHistoryAnchorEl] = useState<HTMLElement | null>(null);

  const openRaiseDispute = (group: any) => {
    setSelectedRaiseGroup({ reason: group?.reason || 'Unknown', count: group?.count || 0, orderIds: group?.orderIds || [] });
    setRaiseDescription('');
    setRaiseDialogOpen(true);
  };
  const closeRaiseDispute = () => setRaiseDialogOpen(false);
  const sendRaiseDispute = async () => {
    try {
      const orderIds = selectedRaiseGroup?.orderIds || [];
      if (orderIds.length === 0) {
        setRaiseDialogOpen(false);
        return;
      }

      await api.manualActions.manualAction(selectedPlatform, {
        manual_override_status: 'DISPUTED',
        order_ids: orderIds,
        note: raiseDescription || '',
      });

      setSnackbarMsg('Dispute raised successfully');
      setSnackbarOpen(true);

      setRaiseDialogOpen(false);

      // Refresh all tabs data with existing filters
      fetchAllTabsData();
    } catch (error) {
      console.error('Failed to raise dispute', error);
      setSnackbarMsg('Failed to raise dispute');
      setSnackbarOpen(true);
    }
  };

  // Column filter handlers
  const openFilterPopover = (column: string, anchorEl: HTMLElement) => {
    setActiveFilterColumn(column);
    setHeaderFilterAnchor(anchorEl);
  };

  const closeFilterPopover = () => {
    setHeaderFilterAnchor(null);
    setActiveFilterColumn('');
  };

  const isFilterActive = (column: string) => {
    const filter = columnFilters[column];
    if (!filter) return false;
    if (typeof filter === 'string') return filter.trim() !== '';
    if (Array.isArray(filter)) return filter.length > 0;
    return Object.values(filter).some(v => v !== undefined && v !== '' && v !== null);
  };

  // Persist a manual reconciliation notification for Checklist
  const pushManualReconNotification = (reason: string, count: number, orderIds: string[]) => {
    try {
      const notifKey = 'recon_notifications';
      const nudgeKey = 'recon_nudge_count';
      const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
      const entry = {
        id: Date.now(),
        text: `Orders with ${formatReasonLabel(reason)} manually reconciled`,
        time: new Date().toISOString(),
        meta: { reason, count, orderIds },
      };
      const updated = [entry, ...existing];
      localStorage.setItem(notifKey, JSON.stringify(updated));
      const prevCount = parseInt(localStorage.getItem(nudgeKey) || '0', 10) || 0;
      localStorage.setItem(nudgeKey, String(prevCount + 1));
      // Notify other parts of the app (e.g., sidebar) to refresh their nudge count
      try {
        window.dispatchEvent(new CustomEvent('recon_nudge_updated'));
      } catch (_) {
        // Fallback generic event
        window.dispatchEvent(new Event('recon_nudge_updated'));
      }
    } catch (e) {
      console.error('Failed to push manual recon notification', e);
    }
  };

  // Action handlers for unreconciled transactions
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [pendingOrderIds, setPendingOrderIds] = useState<string[]>([]);

  const openNoteDialog = (orderIds: string[]) => {
    setPendingOrderIds(orderIds);
    setNoteInput('');
    setNoteDialogOpen(true);
  };

  const closeNoteDialog = () => {
    setNoteDialogOpen(false);
    setPendingOrderIds([]);
    setNoteInput('');
  };

  const openClaimDialog = (orderId: string, platform: string) => {
    setPendingClaim({ orderId, platform });
    setClaimTicketInput('');
    setClaimDialogOpen(true);
  };

  const closeClaimDialog = () => {
    setClaimDialogOpen(false);
    setPendingClaim(null);
    setClaimTicketInput('');
  };

  // Claim Batch UI
  const [batchClaimDialogOpen, setBatchClaimDialogOpen] = useState(false);
  const [selectedBatchForClaim, setSelectedBatchForClaim] = useState<any>(null);

  const openBatchClaimDialog = (batch: any) => {
    setSelectedBatchForClaim(batch);
    setClaimTicketInput('');
    setBatchClaimDialogOpen(true);
  };

  const closeBatchClaimDialog = () => {
    setBatchClaimDialogOpen(false);
    setSelectedBatchForClaim(null);
  };

  // Track Claim UI
  const [trackClaimDialogOpen, setTrackClaimDialogOpen] = useState(false);
  const [selectedBatchForTracking, setSelectedBatchForTracking] = useState<any>(null);

  const openTrackClaimDialog = (batch: any) => {
    setSelectedBatchForTracking(batch);
    setTrackClaimDialogOpen(true);
  };

  const closeTrackClaimDialog = () => {
    setTrackClaimDialogOpen(false);
    setSelectedBatchForTracking(null);
  };

  const handleMarkBatchFiledSubmit = async () => {
    if (!claimTicketInput || !selectedBatchForClaim) return;
    try {
      setApiLoading(true);
      await api.claims.markBatchFiled({
        reason: selectedBatchForClaim.reason,
        platform: selectedBatchForClaim.platform,
        ticket_id: claimTicketInput,
      });
      closeBatchClaimDialog();
      fetchClaimBatchesData();
      if (selectedPlatform) {
         fetchDisputeRaisedOrders(undefined, undefined, undefined, undefined, 0, undefined, disputeSubTab);
      }
    } catch (err) {
      console.error('Failed to mark batch filed:', err);
    } finally {
      setApiLoading(false);
    }
  };

  const handleExportBatch = async (batch: any) => {
    try {
      setApiLoading(true);
      
      // Batch stats come from an endpoint that doesn't filter by date,
      // so we must fetch without date filters to get all matching orders.
      const params: any = {
        platform: selectedPlatform,
        claim_status: batch.status, // Matches GetClaimBatches WHERE claim_status IS NOT NULL / ELIGIBLE
        limit: 10000,
        page: 1,
      };
      
      const response = await api.transactions.getTotalTransactions(params);
      
      if (response.success && response.data) {
        const responseData = response.data as any;
        const transactionData = responseData.transactions || responseData.data || [];
        
        const batchOrders = transactionData.filter((r: any) => {
          const r1 = r.claim_reason;
          const r2 = r.metadata?.mismatch_reason;
          const r3 = r.metadata?.manual_override_note;
          const r4 = r.mismatch_reason;
          const b = batch.reason;
          return r1 === b || r2 === b || r3 === b || r4 === b;
        });

        if (batchOrders.length === 0) {
          const sample = transactionData.length > 0 
            ? (transactionData[0].claim_reason || transactionData[0].metadata?.mismatch_reason || transactionData[0].metadata?.manual_override_note || "unknown")
            : "no-data";
          setSnackbarMsg(`Found 0 for "${batch.reason}". Total fetched: ${transactionData.length}. Sample: ${sample}`);
          setSnackbarOpen(true);
          return;
        }
        
        let csv = 'Order ID,Original Sale Price,Reimbursement Received,Gap Amount,Claim Reason\n';
        batchOrders.forEach((o: any) => {
          const originalSalePrice = o.order_value || o.metadata?.order_value?.total || 0;
          const reimbursementReceived = o.settlement_amount || 0;
          const gapAmount = o.diff !== undefined ? o.diff : originalSalePrice;
          csv += `"${o.order_id}",${originalSalePrice},${reimbursementReceived},${gapAmount},"${o.claim_reason}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `claim_proof_${batch.reason.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
        a.click();
      } else {
        setSnackbarMsg("Failed to load prepared orders.");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Failed to export batch:', err);
      setSnackbarMsg("Failed to export batch");
      setSnackbarOpen(true);
    } finally {
      setApiLoading(false);
    }
  };

  const handleMarkClaimFiled = async () => {
    if (!pendingClaim) return;
    if (!claimTicketInput.trim()) {
      setSnackbarMsg('Please enter a valid ticket ID');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await api.claims.markClaimFiled(pendingClaim.orderId, {
        ticket_id: claimTicketInput,
        platform: pendingClaim.platform,
      });
      if (response && response.success) {
        setSnackbarMsg('Claim marked as filed successfully');
        setSnackbarOpen(true);
        closeClaimDialog();
        fetchAllTabsData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to mark claim filed', err);
      setSnackbarMsg('Failed to mark claim as filed');
      setSnackbarOpen(true);
    }
  };

  const confirmManualAction = async () => {
    if (pendingOrderIds.length === 0) return;
    try {
      await api.manualActions.manualAction(selectedPlatform, {
        order_ids: pendingOrderIds,
        note: noteInput || '',
        manual_override_status: 'MANUALLY_RECONCILED'
      });

      // Optimistically remove reconciled rows from unreconciled tab
      const ids = new Set(pendingOrderIds);
      setUnreconciledRows(prev => {
        if (Array.isArray(prev)) {
          return prev.filter((row: any) => {
            const orderId = row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || row.order_id || '';
            return !ids.has(orderId);
          }) as TransactionRow[];
        }
        return prev;
      });

      // Push notification for checklist
      try {
        // Derive a reason from the first matched row (from unreconciled tab)
        const currentRows = getApiRows();
        const first = (currentRows as any[]).find(row => {
          const orderId = row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || row.order_id || '';
          return orderId === pendingOrderIds[0];
        });
        const reason = first?.originalData?.breakups?.mismatch_reason || first?.["Remark"] || 'Unknown';
        pushManualReconNotification(reason, pendingOrderIds.length, pendingOrderIds);
      } catch (e) {
        console.error('Failed to push notification', e);
      }

      setSnackbarMsg('Manual action submitted successfully');
      setSnackbarOpen(true);

      // Refresh all tabs data to ensure consistency
      fetchAllTabsData();
    } catch (error) {
      console.error('Manual action failed', error);
      setSnackbarMsg('Failed to submit manual action');
      setSnackbarOpen(true);
    } finally {
      closeNoteDialog();
      setSelectedIds([]);
    }
  };

  const handleMarkReconciled = (id: string) => {
    openNoteDialog([id]);
  };

  const handleRaiseDispute = (id: string) => {
    console.log('Raising dispute:', id);

    // Find the transaction data from current tab's data
    const currentRows = getApiRows();
    const transaction = (currentRows as any[]).find(row => {
      const orderId = row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || row.order_id || '';
      return orderId === id;
    });
    if (transaction) {
      openRaiseDispute({
        reason: transaction.originalData?.breakups?.mismatch_reason || transaction["Remark"] || 'Unknown',
        count: 1,
        orderIds: [id]
      });
    }
  };

  // Column filter handlers
  const handleStringFilterChange = (column: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: event.target.value
    }));
  };

  const handleNumberRangeChange = (column: string, bound: 'min' | 'max') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        [bound]: event.target.value
      }
    }));
  };

  const handleDateRangeFilterChange = (column: string, bound: 'from' | 'to') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        [bound]: event.target.value
      }
    }));
  };

  const handleEnumFilterChange = (column: string) => (event: any) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: event.target.value
    }));
  };

  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const applyFilters = () => {
    // Reset to first page and refetch from backend with server-side filters
    setPage(0);
    closeFilterPopover();
    fetchAllTabsData(undefined, undefined, undefined, undefined, 0);
  };

  // Order ID search handlers (mirror TransactionSheet)
  const handleOrderIdSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrderIdSearch(value);
    // If cleared, immediately refetch without order_id filter
    if (value.trim() === '') {
      setOrderIdChips([]);
      setPage(0);
      fetchAllTabsData(undefined, undefined, undefined, '', 0);
    }
  };

  const handleOrderIdSearchClick = () => {
    const value = orderIdSearch;
    const ids = value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setOrderIdChips(ids);
    // Trigger API call
    setPage(0);
    fetchAllTabsData(undefined, undefined, undefined, ids.join(','), 0);
  };

  const handleOrderIdSearchClear = () => {
    setOrderIdSearch('');
    setOrderIdChips([]);
    setShowOrderIdSearch(false);
    // Trigger API call without order IDs
    setPage(0);
    fetchAllTabsData(undefined, undefined, undefined, '', 0);
  };

  const getUniqueValuesForColumn = (column: string) => {
    const values = new Set<string>();

    // For Event Type, show available event types
    if (column === 'Event Type') {
      return ['Sale', 'Return'];
    }

    // For Settlement Provider, get values from API columns response
    if (column === 'Settlement Provider') {
      if (apiResponseData?.columns) {
        const settlementProviderColumn = apiResponseData.columns.find(
          (col: any) => col.key === 'settlement_provider' && col.type === 'enum'
        );
        if (settlementProviderColumn?.values) {
          // Return cleaned values for display
          return settlementProviderColumn.values
            .map((value: string) => cleanEnumValue(value))
            .sort();
        }
      }
      // Fallback: return empty array if no values found
      return [];
    }

    // Helper function to extract mismatch_reason from transaction data
    const extractMismatchReason = (originalData: any): string | null => {
      if (!originalData) return null;
      // Priority: metadata.mismatch_reason > metadata.breakups.mismatch_reason > breakups.mismatch_reason
      if (originalData.metadata?.mismatch_reason) {
        return originalData.metadata.mismatch_reason;
      } else if (originalData.metadata?.breakups?.mismatch_reason) {
        return originalData.metadata.breakups.mismatch_reason;
      } else if (originalData.breakups?.mismatch_reason) {
        return originalData.breakups.mismatch_reason;
      }
      return null;
    };

    if (column === 'Reason') {
      // Check all tabs' data to get all unique reasons
      const allRows = [
        ...(Array.isArray(unreconciledRows) ? unreconciledRows : []),
        ...(Array.isArray(manuallyReconciledRows) ? manuallyReconciledRows : []),
        ...(Array.isArray(disputedRows) ? disputedRows : [])
      ];

      allRows.forEach((row: any) => {
        const originalData = row.originalData;
        if (originalData) {
          const mismatchReason = extractMismatchReason(originalData);
          if (mismatchReason && mismatchReason.trim() !== '') {
            // Store the raw value (not formatted) so we can match it properly when filtering
            values.add(mismatchReason.trim());
          }
        }
      });
    } else {
      // Include values from API rows when in Unreconciled tab
      if (disputeSubTab === 0 && Array.isArray(unreconciledRows)) {
        (unreconciledRows as any[]).forEach(row => {
          if (column === 'Status') {
            // For D2C, use breakups.recon_status, fallback to status
            const v = row.breakups?.recon_status || row.status;
            if (v) values.add(String(v));
          }
        });
      }
      // Also include mock rows to support the other tab
      mockRows.forEach(row => {
        let value: string | undefined;
        switch (column) {
          case 'Event Type':
            value = row.eventType;
            break;
          case 'Status':
            value = row.status;
            break;
          default:
            value = undefined;
        }
        if (value) values.add(value);
      });
    }

    return Array.from(values).sort();
  };


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

  // (moved filteredCurrent above for initialization order)



  const toggleRow = (id: string) => setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // Handler to open transaction history modal
  const handleHistoryOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedTransactionRow(row);
    setHistoryAnchorEl(event.currentTarget);
    setHistoryModalOpen(true);
  };

  // Transaction History Modal Component
  const TransactionHistoryModal: React.FC = () => {
    if (!historyModalOpen || !selectedTransactionRow || !historyAnchorEl) return null;

    const originalData = selectedTransactionRow.originalData || {};
    const metadata = originalData.metadata || {};

    const orderValueData = metadata.order_value || {};
    const settlementValueData = metadata.settlement_value || {};
    const diffRaw = metadata.diff ?? originalData.diff ?? 0;
    const mismatchReason = metadata.mismatch_reason || '';
    const reconStatus = metadata.recon_status || originalData.recon_status || '';
    const manualOverrideBy = metadata.manual_override_by || '';
    const orderId = selectedTransactionRow["Order ID"] || originalData.order_id || '';

    const parseNumericValue = (value: any): number => {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const sanitized = value.replace(/[₹,$\s]/g, '');
        if (sanitized === '') return 0;
        const parsed = parseFloat(sanitized);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    // Format key for display
    const formatKey = (key: string) => {
      return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formatValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return formatCurrency(value);
      }
      if (typeof value === 'string') {
        const sanitized = value.replace(/[₹,$\s]/g, '');
        if (sanitized !== '' && !Number.isNaN(Number(sanitized))) {
          return formatCurrency(Number(sanitized));
        }
        return value;
      }
      return String(value);
    };

    const buyerInvoiceAmountRaw = orderValueData?.buyer_invoice_amount ?? originalData?.buyer_invoice_amount;
    const buyerInvoiceAmount = parseNumericValue(buyerInvoiceAmountRaw);
    const hasBuyerInvoiceAmount = buyerInvoiceAmountRaw !== undefined && buyerInvoiceAmountRaw !== null && buyerInvoiceAmountRaw !== '';

    const settlementAmountRaw = settlementValueData?.settlement_amount ?? originalData?.settlement_amount;
    const settlementAmount = parseNumericValue(settlementAmountRaw);
    const hasSettlementAmount = settlementAmountRaw !== undefined && settlementAmountRaw !== null && settlementAmountRaw !== '';

    const diffNumber = parseNumericValue(diffRaw);
    const hasDiff = diffRaw !== undefined && diffRaw !== null && diffRaw !== '';
    const differenceIsZero = diffNumber === 0;

    const orderValueOtherFields = Object.entries(orderValueData)
      .filter(([key]) => key !== 'buyer_invoice_amount')
      .map(([key, value]) => ({ label: formatKey(key), value }));

    const settlementValueOtherFields = Object.entries(settlementValueData)
      .filter(([key]) => key !== 'settlement_amount')
      .map(([key, value]) => ({ label: formatKey(key), value }));

    // Calculate popup position
    const getPopupPosition = () => {
      const rect = historyAnchorEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const popupHeight = 500;
      const popupWidth = 420;
      const offset = 12;

      let top: number;
      let animationDirection: 'up' | 'down' = 'down';
      let maxHeight: number | undefined;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow >= popupHeight + offset) {
        top = rect.bottom + offset;
        animationDirection = 'down';
      } else if (spaceAbove >= popupHeight + offset) {
        top = rect.top - popupHeight - offset;
        animationDirection = 'up';
      } else {
        if (spaceBelow > spaceAbove) {
          top = Math.max(offset, viewportHeight - popupHeight - offset);
          maxHeight = popupHeight;
          animationDirection = 'down';
        } else {
          top = offset;
          maxHeight = popupHeight;
          animationDirection = 'up';
        }
      }

      if (maxHeight && maxHeight < 400) {
        maxHeight = 400;
      }

      let left: number;
      if (rect.left + popupWidth <= viewportWidth) {
        left = rect.left;
      } else {
        left = Math.max(offset, viewportWidth - popupWidth - offset);
      }

      if (top < offset) {
        top = offset;
        maxHeight = Math.min(popupHeight, viewportHeight - offset * 2);
      }
      if (top + (maxHeight || popupHeight) > viewportHeight - offset) {
        top = Math.max(offset, viewportHeight - (maxHeight || popupHeight) - offset);
      }

      if (left < offset) {
        left = offset;
      }
      if (left + popupWidth > viewportWidth - offset) {
        left = viewportWidth - popupWidth - offset;
      }

      return { top, left, animationDirection, maxHeight };
    };

    const position = getPopupPosition();

    return (
      <>
        {/* Backdrop */}
        <Box
          onClick={() => setHistoryModalOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1399,
            animation: 'fadeIn 0.2s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
          }}
        />

        {/* Modal */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: '420px',
            maxHeight: position.maxHeight ? `${position.maxHeight}px` : 'auto',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 1400,
            animation: position.animationDirection === 'down'
              ? 'fadeInScaleDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'fadeInScaleUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes fadeInScaleDown': {
              '0%': { opacity: 0, transform: 'scale(0.95) translateY(-10px)' },
              '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
            },
            '@keyframes fadeInScaleUp': {
              '0%': { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
              '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                Transaction History
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                Order ID: {orderId}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setHistoryModalOpen(false)}
              size="small"
              sx={{
                p: 0.5,
                '&:hover': { background: '#f3f4f6' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 2, maxHeight: position.maxHeight ? `${position.maxHeight - 80}px` : '420px', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Previous Status */}
              {(disputeSubTab === 1) && (
                <Box
                  sx={{
                    p: 1.5,
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.75rem', mb: 1 }}>
                    Previous Status
                  </Typography>
                  {reconStatus && (
                    <Box sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Recon Status:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500 }}>
                        {reconStatus.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Typography>
                    </Box>
                  )}
                  {mismatchReason && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Mismatch Reason:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500 }}>
                        {mismatchReason}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Order Value Section */}
              {hasBuyerInvoiceAmount && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    background: '#f0f9ff',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.875rem' }}>
                    Buyer Invoice Amount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0c4a6e', fontSize: '0.875rem' }}>
                    {formatCurrency(buyerInvoiceAmount)}
                  </Typography>
                </Box>
              )}

              {orderValueOtherFields.map((item, index) => (
                <Box
                  key={`order-value-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    pl: 3,
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', fontSize: '0.75rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.75rem' }}>
                    {formatValue(item.value)}
                  </Typography>
                </Box>
              ))}

              {(hasBuyerInvoiceAmount || orderValueOtherFields.length > 0) && (
                <Box sx={{ borderTop: '2px solid #e5e7eb' }} />
              )}

              {/* Settlement Value Section */}
              {hasSettlementAmount && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    background: '#fef2f2',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#991b1b', fontSize: '0.875rem' }}>
                    Settlement Amount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>
                    {formatCurrency(settlementAmount)}
                  </Typography>
                </Box>
              )}

              {settlementValueOtherFields.map((item, index) => (
                <Box
                  key={`settlement-value-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    pl: 3,
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', fontSize: '0.75rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.75rem' }}>
                    {formatValue(item.value)}
                  </Typography>
                </Box>
              ))}

              {(hasSettlementAmount || settlementValueOtherFields.length > 0) && (
                <Box sx={{ borderTop: '2px solid #e5e7eb' }} />
              )}

              {/* Difference */}
              {hasDiff && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    background: differenceIsZero ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '6px',
                    border: differenceIsZero ? '1px solid #86efac' : '1px solid #fca5a5',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, color: differenceIsZero ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
                    Difference
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: differenceIsZero ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
                    {formatCurrency(diffNumber)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </>
    );
  };

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
        <ArrowUpwardIcon sx={{ mb: 1, transform: 'rotate(90deg)', color: 'white' }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white', fontSize: '0.75rem' }}>
          View Transactions
        </Typography>
      </Fab>

      <Box sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        {/* Header Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          {/* Tabs */}
          <Tabs 
            value={disputeSubTab} 
            onChange={(_, v) => { setDisputeSubTab(v); setPage(0); }} 
            sx={{ 
              '& .MuiTab-root': { textTransform: 'none', minHeight: 32, minWidth: 'auto', px: 2, fontWeight: 500, fontSize: '0.875rem' } 
            }}
          >
            <Tab value={2} label="Home" />
            <Tab value={1} label={`Dispute Required (${getDisputedCount()})`} />
          </Tabs>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Applied filter chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', maxWidth: 520 }}>
              {orderIdChips.length > 0 && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, border: '1px solid #e5e7eb', borderRadius: '9999px', fontSize: '0.75rem', color: '#111827', background: '#e0f2fe' }}>
                  <span>{`Order IDs: ${orderIdChips.length} selected`}</span>
                  <IconButton size="small" onClick={() => handleOrderIdSearchClear()} sx={{ p: 0.25, color: '#6b7280', '&:hover': { color: '#111827' } }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}
              {Object.entries(columnFilters).map(([col, val]) => {
                if (!val || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0)) return null;
                let label = '';
                if (typeof val === 'string') label = `${col}: ${val}`;
                else if (Array.isArray(val)) label = `${col}: ${val.join(', ')}`;
                else if (val && (val.min || val.max)) label = `${col}: ${val.min ?? ''} - ${val.max ?? ''}`;
                else if (val && (val.from || val.to)) label = `${col}: ${val.from ?? ''} → ${val.to ?? ''}`;
                else return null;
                return (
                  <Box key={`${col}-${label}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, border: '1px solid #e5e7eb', borderRadius: '9999px', fontSize: '0.75rem', color: '#111827', background: '#f3f4f6' }}>
                    <span>{label}</span>
                    <IconButton size="small" onClick={() => {
                      const next = { ...columnFilters } as Record<string, any>;
                      delete next[col];
                      setColumnFilters(next);
                      setPage(0);
                      fetchAllTabsData(next);
                    }} sx={{ p: 0.25, color: '#6b7280', '&:hover': { color: '#111827' } }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>

            {/* Date Range Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<CalendarTodayIcon />}
                onClick={(event) => setDateRangeMenuAnchor(event.currentTarget)}
                sx={{
                  borderColor: '#6B7280', color: '#6B7280', textTransform: 'none',
                  minWidth: 200, minHeight: 36, px: 1.5, fontSize: '0.7875rem',
                  '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107, 114, 128, 0.04)' },
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
                    {getCurrentDateRangeText()}
                  </Typography>
                </Box>
              </Button>
            <Menu
              anchorEl={dateRangeMenuAnchor}
              open={Boolean(dateRangeMenuAnchor)}
              onClose={() => setDateRangeMenuAnchor(null)}
              PaperProps={{
                sx: { mt: 1, minWidth: 250, borderRadius: 0.5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }
              }}
            >
              {dateRangeOptions.map((option) => (
                <MenuItem key={option.value} onClick={() => handleDateRangeSelect(option.value)} sx={{ py: 1.5, px: 2, '&:hover': { backgroundColor: '#f9fafb' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>{option.label}</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>{option.dates}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            {/* Custom Calendar Popup */}
            {showCustomDatePicker && (
              <Box ref={calendarPopupRef} sx={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, mt: 1, bgcolor: 'white', borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb', p: 1.8, minWidth: 270 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8, px: 0.9 }}>
                  <IconButton size="small" onClick={() => handleCalendarMonthChange(-1)} sx={{ color: '#6b7280' }}>
                    <KeyboardArrowDownIcon sx={{ transform: 'rotate(90deg)' }} />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1.0125rem' }}>{currentCalendarMonth}</Typography>
                  <IconButton size="small" onClick={() => handleCalendarMonthChange(1)} sx={{ color: '#6b7280' }}>
                    <KeyboardArrowDownIcon sx={{ transform: 'rotate(-90deg)' }} />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.9, mb: 0.9 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <Typography key={day} variant="caption" sx={{ textAlign: 'center', color: '#6b7280', fontWeight: 500, py: 1 }}>{day}</Typography>
                  ))}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.9 }}>
                  {getCalendarDays().map((day, index) => (
                    <Box key={index} onClick={() => handleCalendarDateClick(day)} sx={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: day ? 'pointer' : 'default', borderRadius: 1, fontSize: '0.7875rem', fontWeight: 500, color: day ? '#1f2937' : 'transparent', border: day && isDateInRange(day) ? '1px solid #3b82f6' : 'none', '&:hover': day ? { backgroundColor: '#f3f4f6' } : {}, ...(day && isDateSelected(day) && { color: '#1d4ed8', fontWeight: 700 }), ...(day && isDateInRange(day) && !isDateSelected(day) && { color: '#3b82f6' }) }}>
                      {day}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            </Box>

            {/* Filter Button */}
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={(event) => openFilterPopover(activeFilterColumn || 'Order ID', event.currentTarget)} sx={{ borderColor: '#6B7280', color: '#6B7280', textTransform: 'none', minWidth: 120, minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107, 114, 128, 0.04)' } }}>
              Filter
            </Button>

            {/* Platform Selector */}
            <Button variant="outlined" endIcon={<KeyboardArrowDownIcon />} startIcon={<StorefrontIcon />} onClick={(e) => setPlatformMenuAnchorEl(e.currentTarget)} sx={{ borderColor: '#6B7280', color: '#6B7280', textTransform: 'none', minWidth: 'auto', minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107,114,128,0.04)' } }}>
              {selectedPlatform === 'flipkart' ? 'Flipkart' : selectedPlatform === 'amazon' ? 'Amazon' : selectedPlatform === 'amazon_uk' ? 'Amazon UK' : 'D2C'}
            </Button>
            <Menu anchorEl={platformMenuAnchorEl} open={Boolean(platformMenuAnchorEl)} onClose={() => setPlatformMenuAnchorEl(null)} PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', p: 0.75, backgroundColor: '#ffffff' } }}>
              <Box sx={{ p: 1, minWidth: 240 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>Select Platform</Typography>
                <RadioGroup value={selectedPlatform} onChange={(e) => { setSelectedPlatform(e.target.value as any); setPlatformMenuAnchorEl(null); }}>
                  {(['flipkart', 'amazon', 'amazon_uk', 'd2c'] as const).map((p) => (
                    <MenuItem key={p} onClick={() => { setSelectedPlatform(p); setPlatformMenuAnchorEl(null); }} sx={{ py: 1, px: 1, borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Radio size="small" checked={selectedPlatform === p} value={p} />
                        <Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{p === 'flipkart' ? 'Flipkart' : p === 'amazon' ? 'Amazon' : p === 'amazon_uk' ? 'Amazon UK' : 'D2C'}</Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>{p === 'd2c' ? 'Website / D2C' : 'E-commerce marketplace'}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </RadioGroup>
              </Box>
            </Menu>
          </Box>
        </Box>

      {/* Claims Dashboard */}
      {disputeSubTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Metrics Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <Card sx={{ width: 260, borderRadius: 1, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem' }}>Claims Raised</Typography>
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, background: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                    {filteredBatches.filter(b => b.status !== 'ELIGIBLE').length}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ width: 260, borderRadius: 1, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem' }}>Claims Approved</Typography>
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, background: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                      {filteredBatches.filter(b => ['APPROVED', 'REIMBURSED', 'SUCCESS'].includes(b.status)).length}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8125rem' }}>Value</Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: '1rem' }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(filteredBatches.filter(b => ['APPROVED', 'REIMBURSED', 'SUCCESS'].includes(b.status)).reduce((sum, b) => sum + (Number(b.total_gap) || 0), 0))}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ width: 260, borderRadius: 1, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem' }}>Reimbursed</Typography>
                  <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: '1.25rem' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(filteredBatches.filter(b => ['REIMBURSED', 'SUCCESS'].includes(b.status)).reduce((sum, b) => sum + (Number(b.total_gap) || 0), 0))}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Claim Tags */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['All', 'Action Required', 'In-progress', 'Approved'].map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => setActiveClaimTag(tag)}
                sx={{
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  backgroundColor: activeClaimTag === tag ? '#e5e7eb' : 'transparent',
                  color: activeClaimTag === tag ? '#111827' : '#6b7280',
                  border: activeClaimTag === tag ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                  '&:hover': {
                    backgroundColor: activeClaimTag === tag ? '#e5e7eb' : '#f9fafb',
                  }
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filteredBatches.length === 0 && !apiLoading && (
              <Typography sx={{ color: '#6b7280', width: '100%', textAlign: 'center', mt: 4 }}>No claim batches available.</Typography>
            )}
            {filteredBatches
              .filter((batch) => {
                if (activeClaimTag === 'All') return true;
                if (activeClaimTag === 'Action Required') return batch.status === 'ELIGIBLE';
                if (activeClaimTag === 'In-progress') return batch.status === 'FILED';
                if (activeClaimTag === 'Approved') return batch.status === 'APPROVED' || batch.status === 'SUCCESS';
                return true;
              })
              .map((batch, index) => {
            const isActionReq = batch.status === 'ELIGIBLE';
            const badgeBg = isActionReq ? '#f3f4f6' : '#f3e8ff';
            const badgeColor = isActionReq ? '#374151' : '#7e22ce';
            const badgeText = isActionReq ? 'Action Required' : (batch.status === 'FILED' ? 'In Progress' : batch.status);

            return (
              <Card key={index} sx={{ width: 280, borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={badgeText} size="small" sx={{ background: badgeBg, color: badgeColor, fontWeight: 600, fontSize: '0.75rem', height: 24 }} />

                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, mb: 2, lineHeight: 1.4, fontSize: '0.8125rem' }}>
                    Reason: <span style={{ color: '#111827', fontWeight: 700 }}>{batch.reason}</span>
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: 1, background: '#f9fafb' }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Total Gap</Typography>
                      <Typography variant="subtitle1" sx={{ color: '#111827', fontWeight: 700, mt: 0.5 }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(batch.total_gap)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: 1, background: '#f9fafb' }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Prepared Orders</Typography>
                      <Typography variant="subtitle1" sx={{ color: '#111827', fontWeight: 700, mt: 0.5 }}>
                        {batch.total_orders}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        sx={{ textTransform: 'none', fontWeight: 600, py: 0.75, fontSize: '0.8125rem', borderColor: '#e5e7eb', color: '#374151', '&:hover': { background: '#f9fafb' } }}
                        onClick={() => {
                          setDisputeSubTab(1); // Jump to Dispute Required tab
                        }}
                      >
                        View Orders
                      </Button>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        sx={{ textTransform: 'none', fontWeight: 600, py: 0.75, fontSize: '0.8125rem', borderColor: '#e5e7eb', color: '#374151', '&:hover': { background: '#f9fafb' } }}
                        onClick={() => handleExportBatch(batch)}
                      >
                        Export Proof
                      </Button>
                    </Box>
                    {batch.status === 'FILED' ? (
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        sx={{ 
                          textTransform: 'none', fontWeight: 600, py: 0.75, fontSize: '0.8125rem', borderColor: '#e5e7eb', color: '#374151', '&:hover': { background: '#f9fafb' } 
                        }}
                        onClick={() => openTrackClaimDialog(batch)}
                      >
                        Track Status
                      </Button>
                    ) : (
                      <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ 
                          background: '#7A5DBF', 
                          color: 'white', 
                          textTransform: 'none', fontWeight: 600, py: 0.75, fontSize: '0.8125rem', boxShadow: 'none', '&:hover': { background: '#624a9e', boxShadow: 'none' } 
                        }}
                        onClick={() => openBatchClaimDialog(batch)}
                      >
                        Mark Batch Filed
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
      )}

      {/* Legacy Tabs Table */}
      {disputeSubTab !== 2 && (
      <Card sx={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{
            height: 'calc(100vh - 140px)',
            overflowY: 'scroll',
            overflowX: 'auto',
          }}>
            <Table stickyHeader sx={{
              minWidth: 1200,
              borderCollapse: 'separate',
              borderSpacing: 0,
              '& .MuiTableCell-root': {
                border: 'none !important',
              },
              '& .MuiTableCell-head': {
                border: 'none !important',
                borderBottom: '0.5px solid #e5e7eb !important',
              },
              '& .MuiTableCell-body': {
                border: 'none !important',
                borderBottom: '0.5px solid #e5e7eb !important',
              }
            }}>
              <TableHead sx={{ '& .MuiTableCell-root': { border: 'none !important' } }}>
                <TableRow>
                  {disputeSubTab === 0 ? (
                    <>
                      {/* Unreconciled Orders tab - show all detail columns directly */}
                      <TableCell padding="checkbox" sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 60, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Checkbox
                          checked={allSelectedInView}
                          indeterminate={someSelectedInView}
                          onChange={toggleSelectAllInView}
                          sx={{
                            color: '#6b7280',
                            '&.Mui-checked': { color: '#1f2937' },
                            '&.MuiCheckbox-indeterminate': { color: '#1f2937' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Order ID</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowOrderIdSearch(!showOrderIdSearch);
                            }}
                            sx={{
                              ml: 0.5,
                              color: showOrderIdSearch ? '#1f2937' : '#6b7280',
                              background: showOrderIdSearch ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            aria-label="Toggle search"
                          >
                            <SearchIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                        {showOrderIdSearch && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mt: 0.5
                            }}
                          >
                            <TextField
                              size="small"
                              value={orderIdSearch}
                              onChange={handleOrderIdSearchChange}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleOrderIdSearchClick();
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={handleOrderIdSearchClick}
                                      sx={{ p: 0.5 }}
                                    >
                                      <SearchIcon sx={{ fontSize: '1rem', color: '#3b82f6' }} />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                width: '280px',
                                '& .MuiOutlinedInput-root': {
                                  height: '32px',
                                  fontSize: '0.75rem',
                                  background: 'white',
                                }
                              }}
                            />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Order Value</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Order Value');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Order Value' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Order Value' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Order Value']}
                            aria-label="Sort Order Value"
                          >
                            {getSortIcon('Order Value')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Value</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Settlement Value');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Settlement Value' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Settlement Value' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Settlement Value']}
                            aria-label="Sort Settlement Value"
                          >
                            {getSortIcon('Settlement Value')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                            {selectedPlatform === 'd2c' ? 'Order Date' : 'Invoice Date'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Invoice Date');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Invoice Date' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Invoice Date' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Invoice Date']}
                            aria-label="Sort Invoice Date"
                          >
                            {getSortIcon('Invoice Date')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Date</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Settlement Date');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Settlement Date' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Settlement Date' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Settlement Date']}
                            aria-label="Sort Settlement Date"
                          >
                            {getSortIcon('Settlement Date')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 120, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Difference</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Difference');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Difference' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Difference' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Difference']}
                            aria-label="Sort Difference"
                          >
                            {getSortIcon('Difference')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Reason</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Provider</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 120, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Status</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Status');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Status' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Status' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Status']}
                            aria-label="Sort Status"
                          >
                            {getSortIcon('Status')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 200, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>Action</TableCell>
                    </>
                  ) : (
                    <>
                      {/* Headers for Disputed and Manually Reconciled tabs (no checkbox, no actions) */}
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Order ID</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Order Value</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Order Value');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Order Value' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Order Value' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Order Value']}
                            aria-label="Sort Order Value"
                          >
                            {getSortIcon('Order Value')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Value</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Settlement Value');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Settlement Value' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Settlement Value' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Settlement Value']}
                            aria-label="Sort Settlement Value"
                          >
                            {getSortIcon('Settlement Value')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Order Date</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Date</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 120, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Difference</Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSort('Difference');
                            }}
                            sx={{
                              ml: 0.5,
                              color: sortConfig?.key === 'Difference' ? '#1f2937' : '#6b7280',
                              background: sortConfig?.key === 'Difference' ? '#e5e7eb' : 'transparent',
                              '&:hover': { background: '#f3f4f6' },
                            }}
                            disabled={!COLUMN_TO_SORT_BY_MAP['Difference']}
                            aria-label="Sort Difference"
                          >
                            {getSortIcon('Difference')}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Provider</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Status</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Remark</Typography>
                      </TableCell>
                      {disputeSubTab === 1 && (
                        <>
                          <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Claim Status</Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Claim Reason</Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Claim Action</Typography>
                          </TableCell>
                        </>
                      )}
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {apiLoading ? (
                  <TableRow>
                    <TableCell colSpan={disputeSubTab === 0 ? 10 : 9} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
                        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          Loading data...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (disputeSubTab === 0 ? paginatedCurrent : current).map((row: any, index: number) => {
                  if (disputeSubTab === 0) {
                    // Flat detailed row for unreconciled orders
                    const orderId = row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || '';
                    const amount = row["Amount"] || row["Order Value"] || 0;
                    const settlementValue = row["Settlement Value"] || 0;
                    const invoiceDate = row["Invoice Date"] || row["Order Date"] || '';
                    const settlementDate = row["Settlement Date"] || '';
                    const difference = row["Difference"] || 0;
                    const remark = row["Remark"] || 'Not Available';
                    const eventType = row["Event Type"] || 'Sale';
                    // Show reason from mismatch_reason metadata
                    let reason = (row.originalData?.metadata?.mismatch_reason || '').trim();
                    if (reason) {
                      reason = reason.charAt(0).toUpperCase() + reason.slice(1);
                    } else {
                      reason = '';
                    }
                    const status = row.originalData?.breakups?.recon_status || 'less_payment_received';

                    return (
                      <TableRow key={`flat-${index}`} sx={{ '&:hover': { background: '#f3f4f6' }, transition: 'all 0.3s ease' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.includes(orderId)}
                            onChange={() => toggleRow(orderId)}
                            sx={{
                              color: '#6b7280',
                              '&.Mui-checked': { color: '#1f2937' },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{orderId}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>₹{settlementValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(invoiceDate)}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(settlementDate)}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Chip label={reason} size="small" sx={{ fontWeight: 600, color: '#1f2937', backgroundColor: '#e5e7eb', '& .MuiChip-label': { px: 1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>
                            {row["Settlement Provider"] || row.originalData?.settlement_provider ? formatSettlementProvider(row["Settlement Provider"] || row.originalData?.settlement_provider) : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {(() => {
                              const reconStatus = (row as any).recon_status || row.originalData?.recon_status || row.originalData?.breakups?.recon_status || status;
                              let displayText = '';
                              let backgroundColor = '';
                              let textColor = '';
                              switch (reconStatus) {
                                case 'settlement_matched':
                                  displayText = 'Settlement Matched';
                                  backgroundColor = '#dcfce7';
                                  textColor = '#059669';
                                  break;
                                case 'less_payment_received':
                                  displayText = 'Less Payment Received';
                                  backgroundColor = '#fef3c7';
                                  textColor = '#d97706';
                                  break;
                                case 'more_payment_received':
                                  displayText = 'More Payment Received';
                                  backgroundColor = '#fef3c7';
                                  textColor = '#d97706';
                                  break;
                                default:
                                  displayText = 'Unsettled';
                                  backgroundColor = '#fee2e2';
                                  textColor = '#dc2626';
                              }
                              return (
                                <Chip
                                  label={displayText}
                                  size="small"
                                  sx={{
                                    background: backgroundColor,
                                    color: textColor,
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              );
                            })()}
                            {(() => {
                              const eventType = (row as any).event_type || row["Event Type"] || row.originalData?.event_type || 'Sale';
                              const isSale = String(eventType || '').toLowerCase() === 'sale';
                              return (
                                <Chip
                                  label={eventType}
                                  size="small"
                                  sx={{
                                    background: isSale ? '#dcfce7' : '#fee2e2',
                                    color: isSale ? '#059669' : '#dc2626',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              );
                            })()}
                            <IconButton
                              size="small"
                              onClick={(e) => handleHistoryOpen(e, row)}
                              sx={{
                                p: 0.25,
                                color: '#6b7280',
                                '&:hover': {
                                  color: '#111827',
                                  background: '#f3f4f6',
                                },
                              }}
                              aria-label="View transaction history"
                            >
                              <InfoIcon fontSize="small" sx={{ fontSize: '0.875rem' }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button size="small" variant="outlined" onClick={() => handleMarkReconciled(orderId)} sx={{ fontSize: '0.75rem', py: 0.5, px: 1, minHeight: 28, borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.04)' } }}>Mark Reconciled</Button>
                            <Button size="small" variant="outlined" onClick={() => handleRaiseDispute(orderId)} sx={{ fontSize: '0.75rem', py: 0.5, px: 1, minHeight: 28, borderColor: '#6b7280', color: '#6b7280', '&:hover': { borderColor: '#4b5563', backgroundColor: 'rgba(107, 114, 128, 0.04)' } }}>Raise Dispute</Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  } else if (disputeSubTab === 1) {
                    // Flat detailed row for Manually Reconciled or Disputed tabs
                    const orderId = row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || '';
                    const amount = row["Amount"] || row["Order Value"] || 0;
                    const settlementValue = row["Settlement Value"] || 0;
                    const invoiceDate = row["Invoice Date"] || row["Order Date"] || '';
                    const settlementDate = row["Settlement Date"] || '';
                    const difference = row["Difference"] || 0;
                    const remark = row["Remark"] || 'Not Available';
                    const eventType = row["Event Type"] || 'Sale';
                    const status = row.originalData?.breakups?.recon_status || row.originalData?.status || 'settlement_matched';
                    const claimStatus = row.originalData?.claim_status || null;
                    const claimReason = row.originalData?.claim_reason || null;
                    const claimTicketId = row.originalData?.claim_ticket_id || null;
                    const platform = row.originalData?.platform || 'amazon';

                    return (
                      <TableRow key={`flat-${index}`} sx={{ '&:hover': { background: '#f3f4f6' }, transition: 'all 0.3s ease' }}>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>{orderId}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>₹{settlementValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827' }}>{invoiceDate}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827' }}>{settlementDate || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: difference === 0 ? '#059669' : difference > 0 ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                            ₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>
                            {row["Settlement Provider"] || row.originalData?.settlement_provider ? formatSettlementProvider(row["Settlement Provider"] || row.originalData?.settlement_provider) : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              label='Dispute Required'
                              size="small"
                              sx={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                            {(() => {
                              const isSale = String(eventType || '').toLowerCase() === 'sale';
                              return (
                                <Chip
                                  label={eventType}
                                  size="small"
                                  sx={{
                                    background: isSale ? '#dcfce7' : '#fee2e2',
                                    color: isSale ? '#059669' : '#dc2626',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              );
                            })()}
                            <IconButton
                              size="small"
                              onClick={(e) => handleHistoryOpen(e, row)}
                              sx={{
                                p: 0.25,
                                color: '#6b7280',
                                '&:hover': {
                                  color: '#111827',
                                  background: '#f3f4f6',
                                },
                              }}
                              aria-label="View transaction history"
                            >
                              <InfoIcon fontSize="small" sx={{ fontSize: '0.875rem' }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>{remark}</Typography>
                        </TableCell>
                        {disputeSubTab === 1 && (
                          <>
                            <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <Chip label={claimStatus || 'ELIGIBLE'} size="small" sx={{ background: claimStatus === 'FILED' ? '#e0e7ff' : '#f3f4f6', color: claimStatus === 'FILED' ? '#4338ca' : '#4b5563', fontWeight: 600, fontSize: '0.75rem' }} />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.75rem' }}>{claimReason || row.originalData?.metadata?.mismatch_reason || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              {claimStatus !== 'FILED' ? (
                                <Button size="small" variant="contained" onClick={() => openClaimDialog(orderId, platform)} sx={{ background: '#7A5DBF', color: 'white', textTransform: 'none', fontSize: '0.75rem', py: 0.5, minHeight: 28, '&:hover': { background: '#624a9e' } }}>
                                  File Claim
                                </Button>
                              ) : (
                                <Chip
                                  label="Claim Raised"
                                  size="small"
                                  sx={{
                                    background: '#dcfce7',
                                    color: '#059669',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  }
                  return null;
                })}
                {!apiLoading && (disputeSubTab === 0 ? paginatedCurrent : current).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={disputeSubTab === 0 ? 10 : 9} align="center" sx={{ py: 4, color: '#6b7280' }}>No transactions</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {disputeSubTab === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <TablePagination
                component="div"
                count={getUnreconciledTotalCount()}
                page={page}
                onPageChange={(_, newPage) => {
                  setPage(newPage);
                  fetchAllTabsData(undefined, undefined, undefined, undefined, newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { 
                  const newRows = parseInt(e.target.value, 10);
                  setRowsPerPage(newRows); 
                  setPage(0);
                  fetchAllTabsData(undefined, undefined, undefined, undefined, 0, newRows);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Box>
          )}
        </CardContent>
      </Card>
      )}

      {/* Minimal Raise Dispute Dialog */}
      <Dialog open={raiseDialogOpen} onClose={closeRaiseDispute} PaperProps={{ sx: { borderRadius: 1, minWidth: 420 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Raise dispute to Flipkart</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#374151', mb: 2 }}>Total orders: {selectedRaiseGroup?.count || 0}</Typography>
          <TextField
            label="Description"
            placeholder="Add a short note for this dispute..."
            value={raiseDescription}
            onChange={(e) => setRaiseDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button variant="text" onClick={closeRaiseDispute} sx={{ color: '#111827' }}>Cancel</Button>
          <Button variant="contained" onClick={sendRaiseDispute} sx={{ boxShadow: 'none', background: '#7A5DBF', '&:hover': { background: '#624a9e' } }}>Send</Button>
        </DialogActions>
      </Dialog>

      {/* Transaction History Modal */}
      <TransactionHistoryModal />

      {/* Bulk Action Buttons */}
      {selectedIds.length > 0 && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}>
          <Card sx={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: 400,
            maxWidth: 500,
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => openNoteDialog(selectedIds)}
                    sx={{
                      fontSize: '0.875rem',
                      py: 0.5,
                      px: 2,
                      minHeight: 32,
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.04)',
                      },
                    }}
                  >
                    Mark All Reconciled
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (selectedIds.length === 1) {
                        handleRaiseDispute(selectedIds[0]);
                      } else if (selectedIds.length > 1) {
                        const currentRows = getApiRows();
                        const selectedTransactions = (currentRows as any[]).filter(row => {
                          const orderId = row["Order ID"] || row.originalData?.order_item_id || row.originalData?.order_id || row.order_id || '';
                          return selectedIds.includes(orderId);
                        });
                        const reasons = selectedTransactions.map(tr => tr?.originalData?.breakups?.mismatch_reason || tr["Remark"] || 'Unknown');
                        const uniqueReasons = Array.from(new Set(reasons.filter(r => r !== undefined && r !== null)));
                        let popupReason = '';
                        if (uniqueReasons.length === 1) {
                          popupReason = uniqueReasons[0];
                        } else {
                          popupReason = 'Multiple reasons';
                        }
                        openRaiseDispute({
                          reason: popupReason,
                          count: selectedIds.length,
                          orderIds: selectedIds.slice(),
                        });
                      }
                    }}
                    sx={{
                      fontSize: '0.875rem',
                      py: 0.5,
                      px: 2,
                      minHeight: 32,
                      borderColor: '#f59e0b',
                      color: '#f59e0b',
                      '&:hover': {
                        borderColor: '#d97706',
                        backgroundColor: 'rgba(245, 158, 11, 0.04)',
                      },
                    }}
                  >
                    Raise All Disputes
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                  {selectedIds.length} transaction(s) selected
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={() => setSnackbarOpen(false)} message={snackbarMsg || 'Done'} />

      {/* Note Dialog for Manual Action */}
      <Dialog open={noteDialogOpen} onClose={closeNoteDialog} PaperProps={{ sx: { borderRadius: 1, minWidth: 420 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add a note</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#374151', mb: 2 }}>Selected orders: {pendingOrderIds.length}</Typography>
          <TextField
            label="Note"
            placeholder="Add a short note..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button variant="text" onClick={closeNoteDialog} sx={{ color: '#111827' }}>Cancel</Button>
          <Button variant="contained" onClick={confirmManualAction} sx={{ boxShadow: 'none', background: '#7A5DBF', '&:hover': { background: '#624a9e' } }}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Claim Ticket Dialog */}
      <Dialog open={claimDialogOpen} onClose={closeClaimDialog} PaperProps={{ sx: { borderRadius: 2, minWidth: 400 } }}>
        <DialogTitle sx={{ pb: 1 }}>Mark Claim Filed</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
            Enter the ticket ID provided by {pendingClaim?.platform === 'flipkart' ? 'Flipkart' : 'Amazon'} after filing the claim.
          </Typography>
          <TextField
            label="Ticket ID"
            placeholder="e.g. TICK-123456"
            value={claimTicketInput}
            onChange={(e) => setClaimTicketInput(e.target.value)}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button variant="text" onClick={closeClaimDialog} sx={{ color: '#111827' }}>Cancel</Button>
          <Button variant="contained" onClick={handleMarkClaimFiled} sx={{ boxShadow: 'none', background: '#7A5DBF', '&:hover': { background: '#624a9e' } }}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Claim Batch Dialog */}
      <Dialog open={batchClaimDialogOpen} onClose={closeBatchClaimDialog} PaperProps={{ sx: { borderRadius: 2, minWidth: 400 } }}>
        <DialogTitle sx={{ pb: 1 }}>Mark Batch Claim Filed</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" sx={{ color: '#4b5563', mb: 3 }}>
            You are marking the entire batch of <b>{selectedBatchForClaim?.total_orders}</b> orders for <b>{selectedBatchForClaim?.reason}</b> as filed. Enter the Ticket ID (or Case ID) from {selectedBatchForClaim?.platform} Seller Central.
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Ticket ID / Case ID</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. CASE-98127391"
            value={claimTicketInput}
            onChange={(e) => setClaimTicketInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button variant="text" onClick={closeBatchClaimDialog} sx={{ color: '#111827' }}>Cancel</Button>
          <Button variant="contained" onClick={handleMarkBatchFiledSubmit} disabled={!claimTicketInput} sx={{ background: '#7A5DBF', color: 'white', '&:hover': { background: '#624a9e' } }}>
            Confirm File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Track Claim Status Dialog */}
      <Dialog open={trackClaimDialogOpen} onClose={closeTrackClaimDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Track Claim Status</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedBatchForTracking && (
            <Box>
              <Box sx={{ mb: 3, p: 2, background: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Batch Reason: <strong style={{ color: '#111827' }}>{selectedBatchForTracking.reason}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Total Orders: <strong style={{ color: '#111827' }}>{selectedBatchForTracking.total_orders}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Platform: <strong style={{ color: '#111827' }}>{selectedPlatform.toUpperCase()}</strong></Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Claim Ticket ID: <strong style={{ color: '#111827' }}>{selectedBatchForTracking.ticket_id || 'TICKET-XYZ-123'}</strong></Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Status Timeline</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
                <Box sx={{ position: 'absolute', left: 11, top: 20, bottom: 20, width: 2, background: '#e5e7eb', zIndex: 0 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, zIndex: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Claim Filed Successfully</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>Your batch has been successfully submitted to the platform.</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, zIndex: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Under Review</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>The marketplace is currently reviewing the evidence and order details.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, zIndex: 1, opacity: 0.5 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>Awaiting Platform Decision</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>Resolution expected within 3-5 business days.</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={closeTrackClaimDialog} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#e5e7eb', color: '#374151' }}>
            Close
          </Button>
          <Button onClick={closeTrackClaimDialog} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, background: '#7A5DBF', '&:hover': { background: '#624a9e' }, boxShadow: 'none' }}>
            View Full Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* Column Filter Popover */}
      <Popover
        open={Boolean(headerFilterAnchor) && Boolean(activeFilterColumn)}
        anchorEl={headerFilterAnchor}
        onClose={closeFilterPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              minWidth: 480,
              maxWidth: 560,
              zIndex: (theme) => theme.zIndex.modal + 1,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {/* Left: Full column list */}
          <Box sx={{ width: 240, maxHeight: 320, overflowY: 'auto', borderRight: '1px solid #eee', pr: 1.5, pl: 0.5 }}>
            <List dense subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent', px: 0, fontSize: '0.75rem', color: '#6b7280' }}></ListSubheader>}>
              {Object.keys(COLUMN_META)
                .filter((col) => {
                  // Exclude Order ID from filter sidebar
                  if (col === 'Order ID') return false;
                  // Filter columns based on selected platform
                  const mapping = COLUMN_TO_API_PARAM_MAP[col];
                  if (!mapping) return true; // Show columns without mapping
                  if (!mapping.supportedPlatforms) return true; // Show columns available on all platforms
                  // Show if supported by selected platform
                  return mapping.supportedPlatforms!.includes(selectedPlatform as any);
                })
                .map((col) => (
                  <ListItemButton
                    key={col}
                    selected={activeFilterColumn === col}
                    onClick={() => setActiveFilterColumn(col)}
                    sx={{ borderRadius: 0.75, py: 0.75, px: 1 }}
                  >
                    <ListItemText primary={col} primaryTypographyProps={{ fontSize: '0.82rem' }} />
                  </ListItemButton>
                ))}
            </List>
          </Box>
          {/* Right: Reusable controls */}
          <ColumnFilterControls
            columnMeta={COLUMN_META as any}
            activeColumn={activeFilterColumn}
            setActiveColumn={(c) => setActiveFilterColumn(c)}
            pendingFilters={columnFilters}
            handleStringChange={handleStringFilterChange}
            handleNumberRangeChange={handleNumberRangeChange}
            handleDateRangeChange={handleDateRangeFilterChange}
            handleEnumChange={handleEnumFilterChange}
            getEnumOptions={getUniqueValuesForColumn}
            onClear={clearColumnFilter}
            onApply={() => {
              applyFilters();
            }}
            statusFilterOptions={['more_payment_received', 'less_payment_received']}
          />
        </Box>
      </Popover>
      </Box>

      {/* Transaction Sheet Overlay */}
      <Drawer
        anchor="right"
        open={showTransactionSheet}
        onClose={() => {
          setShowTransactionSheet(false);
        }}
        PaperProps={{
          sx: { width: '100%', maxWidth: '100vw' }
        }}
        transitionDuration={350}
        keepMounted={false}
      >
        <TransactionSheet
          onBack={() => {
            setShowTransactionSheet(false);
          }}
          initialTab={1} // 1 = Mismatched
          dateRange={{ start: customStartDate, end: customEndDate }}
          initialPlatforms={
            selectedPlatform &&
            (selectedPlatform === 'flipkart' || selectedPlatform === 'amazon' || selectedPlatform === 'amazon_uk' || selectedPlatform === 'd2c')
              ? [selectedPlatform]
              : undefined
          }
        />
      </Drawer>

    </Box>
  );
};

export default OperationsCentrePage;

