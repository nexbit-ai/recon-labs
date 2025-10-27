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
  Close as CloseIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import ColumnFilterControls from '../components/ColumnFilterControls';

// Type definitions for transaction data based on API response
interface TransactionRow {
  "Order ID": string;
  "Order Value": number;
  "Settlement Value": number;
  "Order Date": string;
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
    "Order Value": orderValue,
    "Settlement Value": settlementValue,
    "Order Date": new Date(orderItem.order_date).toISOString().split('T')[0],
    "Settlement Date": settlementDate,
    "Difference": difference,
    "Remark": remark,
    "Event Type": orderItem.event_type || "Sale", // Default to "Sale" if not provided
    // Preserve the original API response data for popup access
    originalData: orderItem,
  };
};

const DisputePage: React.FC = () => {
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: unreconciled, 1: open, 2: raised
  
  // State for date filtering
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'this-month' | 'last-month' | 'this-year' | 'custom'>('custom');
  const [customStartDate, setCustomStartDate] = useState('2025-03-01');
  const [customEndDate, setCustomEndDate] = useState('2025-03-31');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Calendar popup state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const calendarPopupRef = useRef<HTMLDivElement>(null);
  
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

  // API data state - can be either TransactionRow[] or grouped data for unreconciled tab
  const [apiRows, setApiRows] = useState<TransactionRow[] | GroupedUnreconciledData[]>([]);
  const [mockRows, setMockRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'unreconciled' | 'open' | 'raised'; }>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pagination for unreconciled tab
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Platform selector state for dropdown (multi-select)
  const [platformMenuAnchorEl, setPlatformMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Array<'flipkart' | 'amazon' | 'd2c'>>(['d2c']);
  const [tempSelectedPlatforms, setTempSelectedPlatforms] = useState<Array<'flipkart' | 'amazon' | 'd2c'>>([]);

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');

  // Column metadata for filter types
  const COLUMN_META = {
    'Order ID': { type: 'string' },
    'Order Value': { type: 'number' },
    'Amount': { type: 'number' },
    'Settlement Value': { type: 'number' },
    'Order Date': { type: 'date' },
    'Invoice Date': { type: 'date' },
    'Settlement Date': { type: 'date' },
    'Difference': { type: 'number' },
    'Remark': { type: 'enum' },
    'Reason': { type: 'enum' },
    'Event Type': { type: 'enum' },
    'Status': { type: 'enum' }
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
        fetchUnreconciledOrders();
      }
    }
    setDateRangeMenuAnchor(null);
  };

  // Build query parameters for API calls
  const buildQueryParams = (filtersOverride?: Record<string, any>): TransactionQueryParams => {
    const params: TransactionQueryParams = {};
    const f = filtersOverride || columnFilters;
    // Set status for unreconciled orders (less_payment_received, more_payment_received)
    if (disputeSubTab === 0) {
      params.status_in = 'less_payment_received,more_payment_received';
      params.pagination = false; // Disable pagination to get all unreconciled orders
    }

    // Map applied column filters to API params (server-side filtering)
    const statusFilter = f['Status'];
    if (statusFilter && Array.isArray(statusFilter) && statusFilter.length > 0) {
      params.status_in = statusFilter.join(',');
    }

    const orderIdFilter = f['Order ID'];
    if (orderIdFilter && typeof orderIdFilter === 'string' && orderIdFilter.trim() !== '') {
      // Backend expects order_id here (not order_item_id)
      (params as any).order_id = orderIdFilter.trim();
    }

    const diffFilter = f['Difference'];
    if (diffFilter && typeof diffFilter === 'object') {
      if (diffFilter.min !== undefined && diffFilter.min !== '') {
        const v = parseFloat(diffFilter.min);
        if (!Number.isNaN(v)) params.diff_min = v;
      }
      if (diffFilter.max !== undefined && diffFilter.max !== '') {
        const v = parseFloat(diffFilter.max);
        if (!Number.isNaN(v)) params.diff_max = v;
      }
    }

    const orderDateFilter = f['Order Date'];
    if (orderDateFilter && typeof orderDateFilter === 'object') {
      if (orderDateFilter.from) params.order_date_from = orderDateFilter.from;
      if (orderDateFilter.to) params.order_date_to = orderDateFilter.to;
    }

    // Invoice Date range (for D2C platform)
    const invoiceDateFilter = f['Invoice Date'];
    if (invoiceDateFilter && typeof invoiceDateFilter === 'object') {
      if (invoiceDateFilter.from) (params as any).invoice_date_from = invoiceDateFilter.from;
      if (invoiceDateFilter.to) (params as any).invoice_date_to = invoiceDateFilter.to;
    }

    // Settlement Date range
    const settlementDateFilter = f['Settlement Date'];
    if (settlementDateFilter && typeof settlementDateFilter === 'object') {
      if (settlementDateFilter.from) (params as any).settlement_date_from = settlementDateFilter.from;
      if (settlementDateFilter.to) (params as any).settlement_date_to = settlementDateFilter.to;
    }

    // Reason enum → reason_in
    const reasonFilter = f['Reason'];
    if (reasonFilter && Array.isArray(reasonFilter) && reasonFilter.length > 0) {
      (params as any).reason_in = reasonFilter.map(formatReasonForAPI).join(',');
    }

    // Remark (string or enums). Prefer remark_in for arrays, else remark
    const remarkFilter = f['Remark'];
    if (remarkFilter) {
      if (Array.isArray(remarkFilter) && remarkFilter.length > 0) {
        (params as any).remark_in = remarkFilter.join(',');
      } else if (typeof remarkFilter === 'string' && remarkFilter.trim() !== '') {
        params.remark = remarkFilter.trim();
      }
    }

    // Event Type enum → event_type_in
    const eventTypeFilter = f['Event Type'];
    if (eventTypeFilter && Array.isArray(eventTypeFilter) && eventTypeFilter.length > 0) {
      (params as any).event_type_in = eventTypeFilter.join(',');
    }

    // Set date range based on selected date range
    if (selectedDateRange === 'this-month') {
      const now = new Date();
      const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
      params.buyer_invoice_date_from = firstDay.toISOString().split('T')[0];
      params.buyer_invoice_date_to = lastDay.toISOString().split('T')[0];
    } else if (selectedDateRange === 'last-month') {
      const now = new Date();
      const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
      const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0));
      params.buyer_invoice_date_from = firstDay.toISOString().split('T')[0];
      params.buyer_invoice_date_to = lastDay.toISOString().split('T')[0];
    } else if (selectedDateRange === 'this-year') {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Use UTC dates to avoid timezone issues
      const firstDay = new Date(Date.UTC(currentYear, 0, 1)); // January 1st (month 0)
      const lastDay = new Date(Date.UTC(currentYear, 11, 31)); // December 31st (month 11)
      
      // Format dates as YYYY-MM-DD using UTC methods
      params.buyer_invoice_date_from = firstDay.toISOString().split('T')[0];
      params.buyer_invoice_date_to = lastDay.toISOString().split('T')[0];
      
    } else if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      params.buyer_invoice_date_from = customStartDate;
      params.buyer_invoice_date_to = customEndDate;
    }
    
    // Ensure we always have default dates if none are set
    if (!params.buyer_invoice_date_from || !params.buyer_invoice_date_to) {
      const now = new Date();
      const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
      params.buyer_invoice_date_from = firstDay.toISOString().split('T')[0];
      params.buyer_invoice_date_to = lastDay.toISOString().split('T')[0];
    }

    return params;
  };

  // Fetch unreconciled orders from API
  // NOTE: Dispute API endpoint not yet available - using dummy data
  const fetchUnreconciledOrders = async (filtersOverride?: Record<string, any>) => {
    if (disputeSubTab !== 0) return; // Only fetch for unreconciled tab
    
    setApiLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate and set dummy data
      const dummyData = generateDummyUnreconciledData();
      setApiRows(dummyData as TransactionRow[]);
      
      console.log('Using dummy data for disputes (API not yet available)');
    } catch (err) {
      console.error('Error generating dummy dispute data:', err);
      setError('Failed to load dispute data. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Load mock data for other tabs and fetch unreconciled orders on mount
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

    // Add dummy data for unreconciled orders
    if (disputeSubTab === 0 && apiRows.length === 0) {
      const dummyUnreconciledData = generateDummyUnreconciledData();
      setApiRows(dummyUnreconciledData as TransactionRow[]);
    }
  }, [disputeSubTab]);

  // Fetch unreconciled orders on component mount
  useEffect(() => {
    if (disputeSubTab === 0) {
      // On initial load, selectedDateRange is 'custom' with March 2025 defaults,
      // so buildQueryParams will use buyer_invoice_date_from/to accordingly.
      fetchUnreconciledOrders();
    }
  }, []);

  // Fetch API data when switching to unreconciled tab
  useEffect(() => {
    if (disputeSubTab === 0) {
      fetchUnreconciledOrders();
    }
  }, [disputeSubTab, selectedDateRange, customStartDate, customEndDate]);

  // Get current rows based on active tab
  const getCurrentRows = () => {
    if (disputeSubTab === 0) {
      // For unreconciled tab now return the flat API data directly
      return apiRows;
    }
    return mockRows.filter(r => {
      if (disputeSubTab === 1) return r.status === 'open';
      return r.status === 'raised';
    });
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
          case 'Amount':
            value = (row as any).order_value;
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
            value = (row as any).breakups?.mismatch_reason;
            break;
          case 'Status':
            value = (row as any).breakups?.recon_status;
            break;
          default:
            continue;
        }
      } else if ('reason' in row) {
        // Grouped data (unreconciled tab) - skip filtering for now
        continue;
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
          case 'Order Date':
            value = (row as any).orderDate;
            break;
          case 'Settlement Date':
            value = '-';
            break;
          case 'Difference':
            value = Math.abs((row as any).difference);
            break;
          case 'Remark':
            value = (row as any).remark;
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
          if (!filter.includes(value)) {
            return false;
          }
        }
      }
    }
    
    return true;
  });

  // Calculate total count for unreconciled orders (flat count)
  const getUnreconciledTotalCount = () => {
    if (disputeSubTab === 0 && Array.isArray(apiRows)) return filteredCurrent.length;
    return 0;
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
    ? (paginatedCurrent as any[]).map((r) => r.order_id)
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
      console.log('Current apiRows:', apiRows);
      console.log('Current rows for display:', current);
      console.log('apiRows length:', apiRows.length);
      console.log('current length:', current.length);
      console.log('Column filters:', columnFilters);
      console.log('Active filter column:', activeFilterColumn);
    }
  }, [apiRows, disputeSubTab, current, columnFilters, activeFilterColumn]);
  
  // Force re-render when apiRows changes
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    if (apiRows.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [apiRows]);
  
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

  const openRaiseDispute = (group: any) => {
    setSelectedRaiseGroup({ reason: group?.reason || 'Unknown', count: group?.count || 0, orderIds: group?.orderIds || [] });
    setRaiseDescription('');
    setRaiseDialogOpen(true);
  };
  const closeRaiseDispute = () => setRaiseDialogOpen(false);
  const sendRaiseDispute = () => {
    // TODO: Integrate API to send disputes with selectedRaiseGroup
    setRaiseDialogOpen(false);
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
  const handleMarkReconciled = (id: string) => {
    console.log('Marking as reconciled:', id);
    
    // Remove the transaction from the list (simulate reconciliation)
    setApiRows(prev => {
      if (Array.isArray(prev)) {
        return prev.filter((row: any) => row.order_id !== id) as TransactionRow[];
      }
      return prev;
    });
    
    // Show success message
    setSnackbarOpen(true);
    
    // Store notification for Checklist
    try {
      const matched = (apiRows as any[]).find(row => row.order_id === id);
      if (matched) {
        pushManualReconNotification(matched.breakups?.mismatch_reason || 'Unknown', 1, [id]);
      }
    } catch (err) {
      console.error('Failed to derive group for manual recon notification', err);
    }
  };

  const handleRaiseDispute = (id: string) => {
    console.log('Raising dispute:', id);
    
    // Find the transaction data
    const transaction = (apiRows as any[]).find(row => row.order_id === id);
    if (transaction) {
      openRaiseDispute({ 
        reason: transaction.breakups?.mismatch_reason || 'Unknown', 
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
    fetchUnreconciledOrders();
  };

  const getUniqueValuesForColumn = (column: string) => {
    const values = new Set<string>();
    // Include values from API rows when in Unreconciled tab
    if (disputeSubTab === 0 && Array.isArray(apiRows)) {
      (apiRows as any[]).forEach(row => {
        if (column === 'Reason') {
          // For D2C, use breakups.mismatch_reason, fallback to reason
          const v = row.breakups?.mismatch_reason || row.reason || row.Remark;
          if (v) values.add(formatReasonLabel(String(v)));
        } else if (column === 'Status') {
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
        case 'Remark':
          value = row.remark;
          break;
        case 'Event Type':
          value = row.eventType;
          break;
        case 'Status':
          value = row.status;
          break;
        case 'Reason':
          value = undefined; // mock rows do not have reason
          break;
        default:
          value = undefined;
      }
      if (value) values.add(value);
    });
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
  
  const sendToFlipkart = () => {
    if (selectedIds.length === 0) return;
    setSnackbarOpen(true);
    // For API data, we can't modify the status directly
    // This would typically call an API to update the status
    console.log('Sending to Flipkart:', selectedIds);
    setSelectedIds([]);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={disputeSubTab} onChange={(_, v) => setDisputeSubTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 32 } }}>
              <Tab label={`Unreconciled Orders (${getUnreconciledTotalCount()})`} />
              <Tab label="Dispute Raised" />
            </Tabs>
            {/* Right controls: applied filter chips + filter + platform + send button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Applied filter summary (left of Filter button) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', maxWidth: 520 }}>
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
                          fetchUnreconciledOrders(next);
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
                onClick={(e) => { setTempSelectedPlatforms(selectedPlatforms); setPlatformMenuAnchorEl(e.currentTarget); }}
                sx={{
                  borderColor: '#6B7280', color: '#6B7280', textTransform: 'none',
                  minWidth: 'auto', minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107,114,128,0.04)' }
                }}
              >
                {selectedPlatforms.length === 3 ? 'All' : selectedPlatforms.length === 2 ? `${selectedPlatforms[0] === 'flipkart' ? 'Flipkart' : selectedPlatforms[0] === 'amazon' ? 'Amazon' : 'D2C'}, ${selectedPlatforms[1] === 'flipkart' ? 'Flipkart' : selectedPlatforms[1] === 'amazon' ? 'Amazon' : 'D2C'}` : (selectedPlatforms[0] === 'amazon' ? 'Amazon' : selectedPlatforms[0] === 'd2c' ? 'D2C' : 'Flipkart')}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>Platforms</Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        if (tempSelectedPlatforms.length === 3) setTempSelectedPlatforms([]);
                        else setTempSelectedPlatforms(['flipkart','amazon','d2c']);
                      }}
                      sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
                    >
                      {tempSelectedPlatforms.length === 3 ? 'Clear all' : 'Select all'}
                    </Button>
                  </Box>
                  {(['flipkart','amazon','d2c'] as const).map((p) => (
                    <MenuItem
                      key={p}
                      onClick={() => {
                        setTempSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) as any : ([...prev, p] as any));
                      }}
                      sx={{ py: 1, px: 1, borderRadius: '8px' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox size="small" checked={tempSelectedPlatforms.includes(p)} />
                        <Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{p === 'flipkart' ? 'Flipkart' : p === 'amazon' ? 'Amazon' : 'D2C'}</Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>{p === 'd2c' ? 'Website / D2C' : 'E-commerce marketplace'}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => setPlatformMenuAnchorEl(null)} sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#e5e7eb' }}>Cancel</Button>
                    <Button
                      variant="contained"
                      disabled={tempSelectedPlatforms.length === 0}
                      onClick={() => {
                        setSelectedPlatforms(tempSelectedPlatforms);
                        setPlatformMenuAnchorEl(null);
                        fetchUnreconciledOrders();
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Apply
                    </Button>
                  </Box>
                </Box>
              </Menu>
              <Button variant="contained" onClick={sendToFlipkart} disabled={selectedIds.length === 0} sx={{ backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' }, textTransform: 'none', fontWeight: 600 }}>
                Send to Flipkart ({selectedIds.length})
              </Button>
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
                    // Unreconciled Orders tab - show all detail columns directly
                    <>
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
                          <IconButton size="small" onClick={(e) => openFilterPopover('Order ID', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Order ID') ? '#1f2937' : '#6b7280', background: isFilterActive('Order ID') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Order ID">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Amount</Typography>
                          <IconButton size="small" onClick={(e) => openFilterPopover('Amount', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Amount') ? '#1f2937' : '#6b7280', background: isFilterActive('Amount') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Amount">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Invoice Date</Typography>
                          <IconButton size="small" onClick={(e) => openFilterPopover('Invoice Date', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Invoice Date') ? '#1f2937' : '#6b7280', background: isFilterActive('Invoice Date') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Invoice Date">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 140, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Settlement Date</Typography>
                          <IconButton size="small" onClick={(e) => openFilterPopover('Settlement Date', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Settlement Date') ? '#1f2937' : '#6b7280', background: isFilterActive('Settlement Date') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Settlement Date">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 120, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Difference</Typography>
                          <IconButton size="small" onClick={(e) => openFilterPopover('Difference', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Difference') ? '#1f2937' : '#6b7280', background: isFilterActive('Difference') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Difference">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 160, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Reason</Typography>
                          <IconButton size="small" onClick={(e) => openFilterPopover('Reason', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Reason') ? '#1f2937' : '#6b7280', background: isFilterActive('Reason') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Reason">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 120, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Status</Typography>
                          <IconButton size="small" onClick={(e) => openFilterPopover('Status', e.currentTarget)} sx={{ ml: 0.5, color: isFilterActive('Status') ? '#1f2937' : '#6b7280', background: isFilterActive('Status') ? '#e5e7eb' : 'transparent', '&:hover': { background: '#f3f4f6' } }} aria-label="Filter Status">
                            <FilterIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', background: '#f9fafb', textAlign: 'center', minWidth: 200, transition: 'all 0.3s ease', position: 'relative', py: 1 }}>Action</TableCell>
                    </>
                  ) : (
                    // Other tabs - show original columns with checkbox
                    <>
                      <TableCell 
                        padding="checkbox" 
                        sx={{
                          fontWeight: 700,
                          color: '#111827',
                          background: '#f9fafb',
                          textAlign: 'center',
                          minWidth: 60,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          py: 1,
                        }}
                      >
                        <Checkbox
                          checked={false}
                          disabled
                          sx={{
                            color: '#6b7280',
                            '&.Mui-checked': {
                              color: '#1f2937',
                            },
                            '&.MuiCheckbox-indeterminate': {
                              color: '#1f2937',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        textAlign: 'center',
                        minWidth: 160,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Order ID
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Order ID', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Order ID') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Order ID') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Order ID"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        borderRight: 'none',
                        textAlign: 'center',
                        minWidth: 140,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Order Value
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Order Value', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Order Value') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Order Value') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Order Value"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                        textAlign: 'center',
                        minWidth: 140,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Settlement Value
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Settlement Value', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Settlement Value') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Settlement Value') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Settlement Value"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        textAlign: 'center',
                        minWidth: 140,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Order Date
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Order Date', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Order Date') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Order Date') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Order Date"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        textAlign: 'center',
                        minWidth: 140,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Settlement Date
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Settlement Date', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Settlement Date') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Settlement Date') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Settlement Date"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        textAlign: 'center',
                        minWidth: 120,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Difference
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Difference', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Difference') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Difference') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Difference"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        textAlign: 'center',
                        minWidth: 160,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Remark
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Remark', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Remark') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Remark') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Remark"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        textAlign: 'center',
                        minWidth: 120,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Event Type
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilterPopover('Event Type', e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive('Event Type') ? '#1f2937' : '#6b7280',
                                background: isFilterActive('Event Type') ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label="Filter Event Type"
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        border: '0.5px solid #e5e7eb',
                        borderRight: 'none',
                        textAlign: 'center',
                        minWidth: 200,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        Action
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {(disputeSubTab === 0 ? paginatedCurrent : current).map((row: any, index: number) => {
                  if (disputeSubTab === 0) {
                    // Flat detailed row for unreconciled orders
                     return (
                      <TableRow key={`flat-${index}`} sx={{ '&:hover': { background: '#f3f4f6' }, transition: 'all 0.3s ease' }}>
                        <TableCell padding="checkbox">
                             <Checkbox
                            checked={selectedIds.includes(row.order_id)}
                            onChange={() => toggleRow(row.order_id)}
                               sx={{
                                 color: '#6b7280',
                              '&.Mui-checked': { color: '#1f2937' },
                               }}
                             />
                    </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{row.order_id}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>₹{parseFloat(row.order_value || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.invoice_date}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.settlement_date}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>₹{parseFloat(row.diff || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <Chip label={formatReasonLabel(row.breakups?.mismatch_reason || 'N/A')} size="small" sx={{ fontWeight: 600, color: '#1f2937', backgroundColor: '#e5e7eb', '& .MuiChip-label': { px: 1 } }} />
                           </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.breakups?.recon_status || 'N/A'}</TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button size="small" variant="outlined" onClick={() => handleMarkReconciled(row.order_id)} sx={{ fontSize: '0.75rem', py: 0.5, px: 1, minHeight: 28, borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.04)' } }}>Mark Reconciled</Button>
                            <Button size="small" variant="outlined" onClick={() => openRaiseDispute({ reason: row.reason, count: 1, orderIds: [row.order_id] })} sx={{ fontSize: '0.75rem', py: 0.5, px: 1, minHeight: 28, borderColor: '#6b7280', color: '#6b7280', '&:hover': { borderColor: '#4b5563', backgroundColor: 'rgba(107, 114, 128, 0.04)' } }}>Raise Dispute</Button>
                             </Box>
                           </TableCell>
                  </TableRow>
                    );
                  }
                  return null;
                 })}
                {(disputeSubTab === 0 ? paginatedCurrent : current).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6b7280' }}>No transactions</TableCell>
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
          <Typography variant="body2" sx={{ color: '#374151', mb: 0.5 }}>Reason: {formatReasonLabel(selectedRaiseGroup?.reason || 'Unknown')}</Typography>
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
                    onClick={() => {
                      selectedIds.forEach(id => handleMarkReconciled(id));
                      setSelectedIds([]);
                    }}
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
                      selectedIds.forEach(id => handleRaiseDispute(id));
                      setSelectedIds([]);
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

      <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={() => setSnackbarOpen(false)} message="Transaction marked as reconciled successfully" />

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
              {Object.keys(COLUMN_META).map((col) => (
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
                    fetchUnreconciledOrders();
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

export default DisputePage;

