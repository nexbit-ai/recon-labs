import React, { useEffect, useState, useRef, Fragment } from 'react';
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
  DialogActions
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
  Info as InfoIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import ColumnFilterControls from '../components/ColumnFilterControls';

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
    // Preserve the original API response data for popup access
    originalData: orderItem,
  };
};

const OperationsCentrePage: React.FC = () => {
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: unreconciled, 1: manually reconciled, 2: disputed
  
  // State for date filtering
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'this-month' | 'last-month' | 'this-year' | 'custom'>('custom');
  const [customStartDate, setCustomStartDate] = useState('2025-04-01');
  const [customEndDate, setCustomEndDate] = useState('2025-04-30');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  
  // Header date range state - for the date selector displayed at the top
  const [headerDateRange, setHeaderDateRange] = useState<{start: string, end: string}>({ start: '2025-04-01', end: '2025-04-30' });
  const [pendingHeaderDateRange, setPendingHeaderDateRange] = useState<{start: string, end: string}>({ start: '2025-04-01', end: '2025-04-30' });

  // Calendar popup state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const calendarPopupRef = useRef<HTMLDivElement>(null);
  // StrictMode-safe initial-run guards
  const isInitialRenderRef = useRef(true);
  const hasFetchedOnInitialRef = useRef(false);
  
  // Initialize platform from URL or localStorage - single platform only
  const getInitialPlatform = (): 'flipkart' | 'amazon' | 'd2c' => {
    const params = new URLSearchParams(window.location.search);
    const platformsParam = params.get('platforms');
    if (platformsParam) {
      const platforms = platformsParam.split(',').filter(p => ['flipkart', 'amazon', 'd2c'].includes(p)) as Array<'flipkart' | 'amazon' | 'd2c'>;
      if (platforms.length > 0) {
        // Return only the first platform for single-select
        return platforms[0];
      }
    }
    // Fallback to localStorage if no URL param
    try {
      const stored = localStorage.getItem('recon_selected_platforms');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle both array format (old) and single string format (current)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validPlatforms = parsed.filter(p => ['flipkart', 'amazon', 'd2c'].includes(p)) as Array<'flipkart' | 'amazon' | 'd2c'>;
          if (validPlatforms.length > 0) {
            // Return only the first platform for single-select
            return validPlatforms[0];
          }
        } else if (typeof parsed === 'string' && ['flipkart', 'amazon', 'd2c'].includes(parsed)) {
          return parsed as 'flipkart' | 'amazon' | 'd2c';
        }
      }
    } catch (e) {
      console.warn('Failed to load platforms from localStorage:', e);
    }
    return 'd2c'; // default fallback
  };

  // Platform selector state for dropdown (single-select) - initialize from URL params
  const [platformMenuAnchorEl, setPlatformMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'flipkart' | 'amazon' | 'd2c'>(getInitialPlatform());

  // Initialize from URL query params if provided (e.g., from main page navigation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const to = params.get('to');
    if (from && to) {
      setSelectedDateRange('custom');
      setCustomStartDate(from);
      setCustomEndDate(to);
      // Initialize header date range display
      setHeaderDateRange({ start: from, end: to });
      setPendingHeaderDateRange({ start: from, end: to });
    } else {
      // If no URL params, initialize with customStartDate/customEndDate
      const initialDateRange = { start: customStartDate, end: customEndDate };
      setHeaderDateRange(initialDateRange);
      setPendingHeaderDateRange(initialDateRange);
    }
    
    // Also update platform from URL params if present (use first if multiple)
    const platformsParam = params.get('platforms');
    if (platformsParam) {
      const platforms = platformsParam.split(',').filter(p => ['flipkart', 'amazon', 'd2c'].includes(p)) as Array<'flipkart' | 'amazon' | 'd2c'>;
      if (platforms.length > 0) {
        setSelectedPlatform(platforms[0]); // Use first platform only
      }
    }
    
    // Set tab from URL parameter if provided (0: unreconciled, 1: manually reconciled, 2: disputed)
    const tabParam = params.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 2) {
        setDisputeSubTab(tabIndex);
      }
    }
  }, []);
  
  // Date range menu state
  const [dateRangeMenuAnchor, setDateRangeMenuAnchor] = useState<HTMLElement | null>(null);

  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: 'Today', dates: 'Today' },
    { value: 'this-week', label: 'This week', dates: 'This week' },
    { value: 'this-month', label: 'This month', dates: 'This month' },
    { value: 'this-year', label: 'This year', dates: 'Jan 1 - Dec 31' },
    { value: 'custom', label: 'Custom date range', dates: 'Custom' }
  ];

  // API data state - separate state for each tab
  const [unreconciledRows, setUnreconciledRows] = useState<TransactionRow[] | GroupedUnreconciledData[]>([]);
  const [manuallyReconciledRows, setManuallyReconciledRows] = useState<TransactionRow[]>([]);
  const [disputedRows, setDisputedRows] = useState<TransactionRow[]>([]);
  
  // Helper to get current tab's data (for backward compatibility)
  const getApiRows = () => {
    if (disputeSubTab === 0) return unreconciledRows;
    if (disputeSubTab === 1) return manuallyReconciledRows;
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
    'Status': { type: 'enum' }
  };

  // Complete mapping of UI columns to API parameters (similar to TransactionSheet)
  const COLUMN_TO_API_PARAM_MAP: Record<string, {
    apiParam: string;
    type: 'string' | 'number' | 'date' | 'enum';
    supportedPlatforms?: ('flipkart' | 'amazon' | 'd2c' | 'all')[];
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

  // Get current date range text for display
  const getCurrentDateRangeText = () => {
    if (selectedDateRange === 'this-month') {
      const now = new Date();
      return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    } else if (selectedDateRange === 'last-month') {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${lastMonth.toLocaleString('default', { month: 'long' })} ${lastMonth.getFullYear()}`;
    } else if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    return 'This Month';
  };

  // Handle date range selection
  const handleDateRangeSelect = (value: string) => {
    if (value === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setSelectedDateRange(value as 'this-month' | 'last-month' | 'this-year' | 'custom');
      if (value === 'this-month' || value === 'last-month' || value === 'this-year') {
        fetchAllTabsData();
      }
    }
    setDateRangeMenuAnchor(null);
  };

  // Apply header date range changes - called when Apply button next to date selector is clicked
  const applyHeaderDateRange = () => {
    if (!pendingHeaderDateRange.start || !pendingHeaderDateRange.end) return;
    setHeaderDateRange(pendingHeaderDateRange);
    setCustomStartDate(pendingHeaderDateRange.start);
    setCustomEndDate(pendingHeaderDateRange.end);
    setSelectedDateRange('custom');
    // Reset to first page and fetch data with new date range
    setPage(0);
    fetchAllTabsData();
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
    orderIdsCsvOverride?: string
  ): TransactionQueryParams => {
    const params: TransactionQueryParams = {};
    const f = filtersOverride || columnFilters;
    
    // Set status for unreconciled orders (less_payment_received, more_payment_received)
    // Only set default if no status filter is explicitly applied
    if (disputeSubTab === 0 && !f['Status']) {
      params.status_in = 'less_payment_received,more_payment_received';
      params.pagination = false; // Disable pagination to get all unreconciled orders
    }

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
            // For enum filters, join directly
            (params as any)[baseParam] = filterValue.join(',');
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
        
        // Use UTC dates to avoid timezone issues
        const firstDay = new Date(Date.UTC(currentYear, 0, 1)); // January 1st (month 0)
        const lastDay = new Date(Date.UTC(currentYear, 11, 31)); // December 31st (month 11)
        
        // Format dates as YYYY-MM-DD using UTC methods
        params.order_date_from = firstDay.toISOString().split('T')[0];
        params.order_date_to = lastDay.toISOString().split('T')[0];
        
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
    orderIdsCsvOverride?: string
  ) => {
    try {
      // Build query parameters
      const params = buildQueryParams(filtersOverride, orderIdsCsvOverride);

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
        
        setUnreconciledRows(transformedRows);
        
        // Update count from response
        if (response.data.pagination) {
          setUnreconciledCount(response.data.pagination.current_count || response.data.pagination.total_count || 0);
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
    orderIdsCsvOverride?: string
  ) => {
    try {
      // Build base query parameters (date, filters, ids, sorting, etc.)
      const params = buildQueryParams(filtersOverride, orderIdsCsvOverride);

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

        setDisputedRows(transformedRows);
        
        // Update count from response
        if (response.data.pagination) {
          setDisputedCount(response.data.pagination.current_count || response.data.pagination.total_count || 0);
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

  // Fetch manually reconciled orders from API
  const fetchManuallyReconciledOrders = async (
    filtersOverride?: Record<string, any>,
    sortOverride?: { key: string; direction: 'asc' | 'desc' } | null,
    applySortOverride?: boolean,
    orderIdsCsvOverride?: string
  ) => {
    try {
      // Build base query parameters (date, filters, ids, sorting, etc.)
      const params = buildQueryParams(filtersOverride, orderIdsCsvOverride);

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

        setManuallyReconciledRows(transformedRows);
        
        // Update count from response
        if (response.data.pagination) {
          setManuallyReconciledCount(response.data.pagination.current_count || response.data.pagination.total_count || 0);
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

  // Fetch all three APIs in parallel whenever filters or other inputs change
  const fetchAllTabsData = async (
    filtersOverride?: Record<string, any>,
    sortOverride?: { key: string; direction: 'asc' | 'desc' } | null,
    applySortOverride?: boolean,
    orderIdsCsvOverride?: string
  ) => {
    setApiLoading(true);
    setError(null);
    
    try {
      // Fetch all three APIs in parallel
      await Promise.all([
        fetchUnreconciledOrders(filtersOverride, sortOverride, applySortOverride, orderIdsCsvOverride),
        fetchManuallyReconciledOrders(filtersOverride, sortOverride, applySortOverride, orderIdsCsvOverride),
        fetchDisputeRaisedOrders(filtersOverride, sortOverride, applySortOverride, orderIdsCsvOverride)
      ]);
    } catch (err) {
      console.error('Error fetching all tabs data:', err);
      setError('Failed to load some data. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch all three APIs whenever filters or other inputs change (NOT when tab changes)
  useEffect(() => {
    // On initial render in dev StrictMode this effect runs twice.
    // Guard so we only fetch once on the true initial render, then allow future changes.
    if (isInitialRenderRef.current) {
      if (!hasFetchedOnInitialRef.current) {
        hasFetchedOnInitialRef.current = true;
        fetchAllTabsData();
        // Mark initial render complete on next render cycle to allow platform changes to trigger fetches
        requestAnimationFrame(() => {
          isInitialRenderRef.current = false;
        });
      }
      return;
    }
    // After initial render, always fetch when dependencies change (including platform changes)
    fetchAllTabsData();
  }, [selectedDateRange, customStartDate, customEndDate, selectedPlatform]);

  // Get current rows based on active tab
  const getCurrentRows = () => {
    if (disputeSubTab === 0) return unreconciledRows;
    if (disputeSubTab === 1) return manuallyReconciledRows;
    return disputedRows;
  };

  const current = getCurrentRows();

  // Apply column filters to current data (must be defined before usage below)
  const filteredCurrent = current.filter(row => {
    // Apply column filters
    for (const [column, filter] of Object.entries(columnFilters)) {
      if (!filter) continue;
      
      let value: any;
      
      // Handle both API data and mock data
      if ('Order ID' in row) {
        // API data (TransactionRow) - handle D2C specific fields
        switch (column) {
          case 'Order ID':
            value = (row as any)['Order ID'];
            break;
          case 'Invoice Date':
            value = (row as any).invoice_date;
            break;
          case 'Settlement Date':
            value = (row as any).settlement_date;
            break;
          case 'Difference':
            value = (row as any).diff;
            break;
          case 'Reason':
            // Extract mismatch_reason from originalData with priority:
            // metadata.mismatch_reason > metadata.breakups.mismatch_reason > breakups.mismatch_reason
            const originalData = (row as any).originalData;
            if (originalData) {
              if (originalData.metadata?.mismatch_reason) {
                value = originalData.metadata.mismatch_reason;
              } else if (originalData.metadata?.breakups?.mismatch_reason) {
                value = originalData.metadata.breakups.mismatch_reason;
              } else if (originalData.breakups?.mismatch_reason) {
                value = originalData.breakups.mismatch_reason;
              } else {
                value = null;
              }
            } else {
              value = (row as any).breakups?.mismatch_reason || null;
            }
            // Normalize value for comparison (trim whitespace)
            if (value) value = String(value).trim();
            break;
          case 'Status':
            value = (row as any).breakups?.recon_status;
            break;
          default:
            continue;
        }
      } else if ('reason' in row) {
        // Grouped data (unreconciled tab) - handle Reason filter
        if (column === 'Reason') {
          value = (row as any).reason;
          // Normalize value for comparison (trim whitespace)
          if (value) value = String(value).trim();
        } else {
          // Skip other filters for grouped data for now
          continue;
        }
      } else {
        // Mock data (old structure)
        switch (column) {
          case 'Order ID':
            value = (row as any).orderId;
            break;
          case 'Order Value':
            value = Math.abs((row as any).difference) + 1000;
            break;
          case 'Settlement Value':
            value = Math.abs((row as any).difference) + 900;
            break;
          case 'Settlement Date':
            value = '-';
            break;
          case 'Difference':
            value = Math.abs((row as any).difference);
            break;
          case 'Event Type':
            value = (row as any).eventType;
            break;
          default:
            continue;
        }
      }

      if (typeof filter === 'string') {
        // String filter
        if (!value.toString().toLowerCase().includes(filter.toLowerCase())) {
          return false;
        }
      } else if (typeof filter === 'object') {
        if (filter.min !== undefined && filter.min !== '') {
          if (typeof value === 'number' && value < parseFloat(filter.min)) {
            return false;
          }
        }
        if (filter.max !== undefined && filter.max !== '') {
          if (typeof value === 'number' && value > parseFloat(filter.max)) {
            return false;
          }
        }
        if (filter.from !== undefined && filter.from !== '') {
          if (new Date(value) < new Date(filter.from)) {
            return false;
          }
        }
        if (filter.to !== undefined && filter.to !== '') {
          if (new Date(value) > new Date(filter.to)) {
            return false;
          }
        }
        if (Array.isArray(filter) && filter.length > 0) {
          // For Reason filter, compare normalized values
          if (column === 'Reason') {
            const normalizedFilter = filter.map(f => String(f).trim().toLowerCase());
            const normalizedValue = value ? String(value).trim().toLowerCase() : '';
            if (!normalizedFilter.includes(normalizedValue)) {
              return false;
            }
          } else {
            // For other enum filters, use exact match
            if (!filter.includes(value)) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  });

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

  const paginatedCurrent = (() => {
    const base = filteredCurrent;
    if (disputeSubTab !== 0) return base;
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return base.slice(start, end);
  })();

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
    fetchAllTabsData();
  };

  // Order ID search handlers (mirror TransactionSheet)
  const handleOrderIdSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrderIdSearch(value);
    // If cleared, immediately refetch without order_id filter
    if (value.trim() === '') {
      setOrderIdChips([]);
      setPage(0);
      fetchAllTabsData(undefined, undefined, undefined, '');
    }
  };

  const handleOrderIdSearchClick = () => {
    const value = orderIdSearch;
    const ids = value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setOrderIdChips(ids);
    // Trigger API call
    setPage(0);
    fetchAllTabsData(undefined, undefined, undefined, ids.join(','));
  };

  const handleOrderIdSearchClear = () => {
    setOrderIdSearch('');
    setOrderIdChips([]);
    setShowOrderIdSearch(false);
    // Trigger API call without order IDs
    setPage(0);
    fetchAllTabsData(undefined, undefined, undefined, '');
  };

  const getUniqueValuesForColumn = (column: string) => {
    const values = new Set<string>();
    
    // For Event Type, show available event types
    if (column === 'Event Type') {
      return ['Sale', 'Return'];
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
    const breakupsObj = metadata.breakups || {};
    
    // Extract values
    const orderValue = originalData.order_value || 0;
    const settlementValue = originalData.settlement_amount || 0;
    const diff = originalData.diff || 0;
    const mismatchReason = metadata.mismatch_reason || '';
    const reconStatus = originalData.recon_status || '';
    const manualOverrideBy = metadata.manual_override_by || '';
    const orderId = selectedTransactionRow["Order ID"] || originalData.order_id || '';

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    // Format key for breakups
    const formatKey = (key: string) => {
      return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Get breakups data
    const breakupsData = Object.entries(breakupsObj).map(([key, value]) => ({
      label: formatKey(key),
      value: Number(value) || 0
    }));

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
              {/* Manual Override Info */}
              {manualOverrideBy && (
                <Box
                  sx={{
                    p: 1.5,
                    background: '#f0f9ff',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.75rem', mb: 0.5 }}>
                    Manually Overridden By
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0c4a6e', fontSize: '0.875rem' }}>
                    {manualOverrideBy}
                  </Typography>
                </Box>
              )}

              {/* Previous Status */}
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

              {/* Order Value */}
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
                  Order Value
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0c4a6e', fontSize: '0.875rem' }}>
                  {formatCurrency(orderValue)}
                </Typography>
              </Box>

              {/* Breakups */}
              {breakupsData.length > 0 && (
                <>
                  {breakupsData.map((item, index) => (
                    <Box
                      key={index}
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
                        {formatCurrency(item.value)}
                      </Typography>
                    </Box>
                  ))}
                  
                  {/* Divider */}
                  <Box sx={{ borderTop: '2px solid #e5e7eb' }} />
                  
                  {/* Settlement Value */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      pl: 3,
                      background: '#fef2f2',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#991b1b', fontSize: '0.75rem' }}>
                      Settlement Value
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#991b1b', fontSize: '0.75rem' }}>
                      {formatCurrency(-settlementValue)}
                    </Typography>
                  </Box>
                  
                  {/* Divider */}
                  <Box sx={{ borderTop: '2px solid #e5e7eb' }} />
                </>
              )}

              {/* Difference */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  background: diff === 0 ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '6px',
                  border: diff === 0 ? '1px solid #86efac' : '1px solid #fca5a5',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: diff === 0 ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
                  Difference
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: diff === 0 ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
                  {formatCurrency(diff)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={disputeSubTab} onChange={(_, v) => setDisputeSubTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 32 } }}>
              <Tab label={`Unreconciled Orders (${getUnreconciledTotalCount()})`} />
              <Tab label={`Manually Reconciled (${getManuallyReconciledCount()})`} />
              <Tab label={`Disputed (${getDisputedCount()})`} />
            </Tabs>
            {/* Right controls: applied filter chips + filter + platform + send button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Applied filter summary (left of Filter button) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', maxWidth: 520 }}>
                {/* Order ID chips summary (matches TransactionSheet behavior) */}
                {orderIdChips.length > 0 && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, border: '1px solid #e5e7eb', borderRadius: '9999px', fontSize: '0.75rem', color: '#111827', background: '#e0f2fe' }}>
                    <span>{`Order IDs: ${orderIdChips.length} selected`}</span>
                    <IconButton
                      size="small"
                      onClick={() => {
                        handleOrderIdSearchClear();
                      }}
                      sx={{ p: 0.25, color: '#6b7280', '&:hover': { color: '#111827' } }}
                      aria-label={`Clear Order IDs`}
                    >
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
                      <IconButton
                  size="small"
                        onClick={() => {
                          const next = { ...columnFilters } as Record<string, any>;
                          delete next[col];
                          setColumnFilters(next);
                          setPage(0);
                          fetchAllTabsData(next);
                        }}
                        sx={{ p: 0.25, color: '#6b7280', '&:hover': { color: '#111827' } }}
                        aria-label={`Clear ${col} filter`}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
              
              {/* Date Range Selector - Next to Filter button */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5,
                padding: '4px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                flexShrink: 0,
              }}>
                {/* Date label */}
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  Date Range:
                </Typography>
                
                {/* Date inputs */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5, 
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={pendingHeaderDateRange.start}
                    onChange={(e) => setPendingHeaderDateRange(prev => ({ ...prev, start: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      width: '110px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.7rem',
                      },
                      '& input': {
                        padding: '6px 4px',
                        fontSize: '0.7rem'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280', 
                    fontSize: '0.7rem',
                    flexShrink: 0,
                  }}>
                    to
                  </Typography>
                  <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={pendingHeaderDateRange.end}
                    onChange={(e) => setPendingHeaderDateRange(prev => ({ ...prev, end: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      width: '110px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.7rem',
                      },
                      '& input': {
                        padding: '6px 4px',
                        fontSize: '0.7rem'
                      }
                    }}
                  />
                </Box>
                
                {/* Divider */}
                <Box sx={{ 
                  width: '1px', 
                  height: '18px', 
                  backgroundColor: '#d1d5db', 
                  mx: 0.25, 
                  flexShrink: 0 
                }} />
                
                {/* Apply Button */}
                <Button
                  variant="contained"
                  size="small"
                  onClick={applyHeaderDateRange}
                  disabled={
                    !pendingHeaderDateRange.start || 
                    !pendingHeaderDateRange.end ||
                    (pendingHeaderDateRange.start === headerDateRange.start && 
                     pendingHeaderDateRange.end === headerDateRange.end)
                  }
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    padding: '3px 10px',
                    minWidth: 'auto',
                    backgroundColor: '#1f2937',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    '&:hover': { backgroundColor: '#374151' },
                    '&:disabled': {
                      backgroundColor: '#9ca3af',
                      color: '#ffffff',
                    },
                  }}
                >
                  Apply
                </Button>
              </Box>

              {/* New Filter button matching reconciliation behavior */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(event) => openFilterPopover(activeFilterColumn || 'Order ID', event.currentTarget)}
                sx={{
                  borderColor: '#6B7280',
                  color: '#6B7280',
                  textTransform: 'none',
                  minWidth: 120,
                  minHeight: 36,
                  px: 1.5,
                  fontSize: '0.7875rem',
                  '&:hover': {
                    borderColor: '#4B5563',
                    backgroundColor: 'rgba(107, 114, 128, 0.04)',
                  },
                }}
              >
                Filter
              </Button>
              
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<StorefrontIcon />}
                onClick={(e) => setPlatformMenuAnchorEl(e.currentTarget)}
                sx={{
                  borderColor: '#6B7280', color: '#6B7280', textTransform: 'none',
                  minWidth: 'auto', minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107,114,128,0.04)' }
                }}
              >
                {selectedPlatform === 'flipkart' ? 'Flipkart' : selectedPlatform === 'amazon' ? 'Amazon' : 'D2C'}
              </Button>
              <Menu
                anchorEl={platformMenuAnchorEl}
                open={Boolean(platformMenuAnchorEl)}
                onClose={() => setPlatformMenuAnchorEl(null)}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 220,
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    p: 0.75,
                    backgroundColor: '#ffffff'
                  }
                }}
              >
                <Box sx={{ p: 1, minWidth: 240 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>Select Platform</Typography>
                  <RadioGroup
                    value={selectedPlatform}
                    onChange={(e) => {
                      const newPlatform = e.target.value as 'flipkart' | 'amazon' | 'd2c';
                      setSelectedPlatform(newPlatform);
                      setPlatformMenuAnchorEl(null);
                      // Data fetch will be triggered by useEffect watching selectedPlatform
                    }}
                  >
                    {(['flipkart','amazon','d2c'] as const).map((p) => (
                      <MenuItem
                        key={p}
                        onClick={() => {
                          setSelectedPlatform(p);
                          setPlatformMenuAnchorEl(null);
                          // Data fetch will be triggered by useEffect watching selectedPlatform
                        }}
                        sx={{ py: 1, px: 1, borderRadius: '8px' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Radio size="small" checked={selectedPlatform === p} value={p} />
                          <Box>
                            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{p === 'flipkart' ? 'Flipkart' : p === 'amazon' ? 'Amazon' : 'D2C'}</Typography>
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
        </CardContent>
      </Card>



      <Card sx={{ 
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ 
            maxHeight: 'calc(100vh - 200px)',
            overflowX: 'auto',
          }}>
            <Table stickyHeader sx={{ 
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
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Invoice Date</Typography>
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Status</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Remark</Typography>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {(disputeSubTab === 0 ? paginatedCurrent : current).map((row: any, index: number) => {
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
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(invoiceDate)}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(settlementDate)}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Chip label={reason} size="small" sx={{ fontWeight: 600, color: '#1f2937', backgroundColor: '#e5e7eb', '& .MuiChip-label': { px: 1 } }} />
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
                  } else if (disputeSubTab === 1 || disputeSubTab === 2) {
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
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              label={disputeSubTab === 1 ? 'Manually Reconciled' : 'Disputed'}
                              size="small"
                              sx={{
                                background: disputeSubTab === 1 ? '#dcfce7' : '#fee2e2',
                                color: disputeSubTab === 1 ? '#059669' : '#dc2626',
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
                      </TableRow>
                    );
                  }
                  return null;
                 })}
                {(disputeSubTab === 0 ? paginatedCurrent : current).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={disputeSubTab === 0 ? 9 : 8} align="center" sx={{ py: 4, color: '#6b7280' }}>No transactions</TableCell>
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
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Box>
          )}
        </CardContent>
      </Card>

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
          <Button variant="contained" onClick={sendRaiseDispute} sx={{ boxShadow: 'none' }}>Send</Button>
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
          <Button variant="contained" onClick={confirmManualAction} sx={{ boxShadow: 'none' }}>Submit</Button>
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
              {Object.keys(COLUMN_META).filter(col => col !== 'Order ID').map((col) => (
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

      {/* Custom Date Picker Popup */}
      {showCustomDatePicker && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1399,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              background: '#ffffff',
              borderRadius: '12px',
              p: 3,
              maxWidth: '400px',
              width: '100%',
              mx: 2,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
              Select Custom Date Range
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                label="Start Date"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowCustomDatePicker(false);
                  setTempStartDate('');
                  setTempEndDate('');
                }}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (tempStartDate && tempEndDate) {
                    setCustomStartDate(tempStartDate);
                    setCustomEndDate(tempEndDate);
                    setSelectedDateRange('custom');
                    setShowCustomDatePicker(false);
                    fetchAllTabsData();
                  }
                }}
                disabled={!tempStartDate || !tempEndDate}
                sx={{
                  textTransform: 'none',
                  background: '#1f2937',
                  '&:hover': { background: '#374151' },
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OperationsCentrePage;

