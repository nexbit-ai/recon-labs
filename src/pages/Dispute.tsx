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
  TextField,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CalendarToday as CalendarTodayIcon, 
  KeyboardArrowDown as KeyboardArrowDownIcon, 
  StorefrontOutlined as StorefrontIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { api } from '../services/api';

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
    excess_received: number;
    settlement_matched: number;
    settled: number;
    short_received: number;
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
}

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

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');

  // Column metadata for filter types
  const COLUMN_META = {
    'Order ID': { type: 'string' },
    'Order Value': { type: 'number' },
    'Settlement Value': { type: 'number' },
    'Order Date': { type: 'date' },
    'Settlement Date': { type: 'date' },
    'Difference': { type: 'number' },
    'Remark': { type: 'enum' },
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
  const buildQueryParams = (): TransactionQueryParams => {
    const params: TransactionQueryParams = {};
    // Set status for unreconciled orders (short_received, excess_received)
    if (disputeSubTab === 0) {
      params.status_in = 'short_received,excess_received';
      params.pagination = false; // Disable pagination to get all unreconciled orders
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
      
      // Debug logging for this-year selection
      console.log('This year date calculation:', {
        currentYear: currentYear,
        firstDay: firstDay.toISOString().split('T')[0],
        lastDay: lastDay.toISOString().split('T')[0],
        firstDayDate: firstDay,
        lastDayDate: lastDay,
        firstDayMonth: firstDay.getUTCMonth(), // Should be 0 (January)
        lastDayMonth: lastDay.getUTCMonth()    // Should be 11 (December)
      });
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
  const fetchUnreconciledOrders = async () => {
    if (disputeSubTab !== 0) return; // Only fetch for unreconciled tab
    
    setApiLoading(true);
    setError(null);
    
    try {
      const queryParams = buildQueryParams();
      console.log('Fetching unreconciled orders with params:', queryParams);
      console.log('Date range:', queryParams.buyer_invoice_date_from, 'to', queryParams.buyer_invoice_date_to);
      console.log('Selected date range:', selectedDateRange);
      console.log('Full queryParams object:', JSON.stringify(queryParams, null, 2));
      
      // Use the existing API service for transactions - pass queryParams directly like TransactionSheet does
      const response = await api.transactions.getTransactions(queryParams as any);
      
      if (response.success && response.data) {
        const responseData = response.data;
        console.log('API Response:', responseData);
        console.log('Response data type:', typeof responseData);
        console.log('Response data keys:', Object.keys(responseData));
        
        // The data is directly in responseData.data array
        const transactionData = responseData.data;
        
        console.log('Transaction data to process:', transactionData);
        console.log('Transaction data length:', transactionData.length);
        
        if (Array.isArray(transactionData) && transactionData.length > 0) {
          // Log first transaction to see structure
          console.log('First transaction structure:', transactionData[0]);
          console.log('Total transactions to process:', transactionData.length);
          
          // Check if we have the expected fields
          const sampleTransaction = transactionData[0];
          console.log('Sample transaction fields:', {
            reason: sampleTransaction.reason,
            status: sampleTransaction.status,
            context: sampleTransaction.context,
            buyer_invoice_amount: sampleTransaction.context?.buyer_invoice_amount,
            order_value: sampleTransaction.order_value,
            order_item_id: sampleTransaction.order_item_id,
            diff: sampleTransaction.diff,
            order_date: sampleTransaction.order_date,
            settlement_date: sampleTransaction.settlement_date
          });
          
          // Log all available keys to see what we can use for grouping
          console.log('All available transaction keys:', Object.keys(sampleTransaction));
          
          // Transform API data to grouped format for unreconciled tab
          const groupedData = transactionData.reduce((acc: any, transaction: any, index: number) => {
            // Group by the actual reason from API response
            const reason = transaction.reason || 'Unknown';
            
            // Use buyer_invoice_amount from context
            const amount = parseFloat(transaction.context?.buyer_invoice_amount || '0');
            
            console.log(`Processing transaction ${index + 1}/${transactionData.length}:`, { 
              reason: transaction.reason, 
              status: transaction.status, 
              amount, 
              order_item_id: transaction.order_item_id,
              buyer_invoice_amount: transaction.context?.buyer_invoice_amount,
              diff: transaction.diff
            });
            
            if (!acc[reason]) {
              acc[reason] = {
                reason: reason, // Use the actual reason from API
                count: 0,
                amount: 0,
                orderIds: [],
                transactions: [] // Store full transaction data for expansion
              };
              console.log(`Created new group for reason: ${reason}`);
            }
            
            acc[reason].count += 1;
            acc[reason].amount += amount;
            acc[reason].orderIds.push(transaction.order_item_id);
            acc[reason].transactions.push(transaction); // Store full transaction
            
            console.log(`Updated group ${reason}: count=${acc[reason].count}, amount=${acc[reason].amount}`);
            
            return acc;
          }, {});
          
          console.log('Final grouped data object:', groupedData);
          console.log('Number of groups created:', Object.keys(groupedData).length);
          
          console.log('Grouped data before conversion:', groupedData);
          
          // Convert grouped data to array format
          const groupedArray = Object.values(groupedData);
          console.log('Final grouped array:', groupedArray);
          
          // Test: Log each item to verify structure
          groupedArray.forEach((item: any, index) => {
            console.log(`Item ${index}:`, {
              reason: item.reason,
              count: item.count,
              amount: item.amount,
              orderIds: item.orderIds
            });
          });
          
          setApiRows(groupedArray as GroupedUnreconciledData[]);
          console.log('setApiRows called with:', groupedArray);
        } else {
          console.error('No valid transaction data found');
          setError('No transaction data received from API');
        }
      } else {
        console.error('API response not successful:', response);
        setError('Failed to fetch unreconciled orders data');
      }
    } catch (err) {
      console.error('Error fetching unreconciled orders:', err);
      setError('Failed to load unreconciled orders data. Please try again.');
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
  }, []);

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
      // For unreconciled tab, return the grouped data directly
      // The data is already grouped by the API call
      return apiRows;
    }
    return mockRows.filter(r => {
      if (disputeSubTab === 1) return r.status === 'open';
      return r.status === 'raised';
    });
  };

  // Calculate total count for unreconciled orders
  const getUnreconciledTotalCount = () => {
    if (disputeSubTab === 0 && Array.isArray(apiRows)) {
      return apiRows.reduce((total, item) => {
        if (item && typeof item === 'object' && 'count' in item) {
          return total + (item.count || 0);
        }
        return total;
      }, 0);
    }
    return 0;
  };

  const current = getCurrentRows();
  
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
    // For API data, we can't modify the status directly
    // This would typically call an API to update the status
    console.log('Marking as reconciled:', id);

    // Derive metadata from grouped unreconciled data to store a notification for Checklist
    try {
      if (disputeSubTab === 0 && Array.isArray(apiRows)) {
        const groups = apiRows as any[];
        const matched = groups.find(g => Array.isArray(g?.orderIds) && g.orderIds.includes(id));
        if (matched) {
          pushManualReconNotification(matched.reason || 'Unknown', matched.count || 1, matched.orderIds || [id]);
        }
      }
    } catch (err) {
      console.error('Failed to derive group for manual recon notification', err);
    }
  };

  const handleRaiseDispute = (id: string) => {
    // For API data, we can't modify the status directly
    // This would typically call an API to update the status
    console.log('Raising dispute:', id);
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
    closeFilterPopover();
    // Filter logic will be applied in the current variable
  };

  const getUniqueValuesForColumn = (column: string) => {
    const values = new Set<string>();
    mockRows.forEach(row => {
      let value: string;
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
        default:
          return;
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

  // Apply column filters to current data
  const filteredCurrent = current.filter(row => {
    // Apply column filters
    for (const [column, filter] of Object.entries(columnFilters)) {
      if (!filter) continue;
      
      let value: any;
      
      // Handle both API data and mock data
      if ('Order ID' in row) {
        // API data (TransactionRow)
        switch (column) {
          case 'Order ID':
            value = row['Order ID'];
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
            {/* Right controls: date range + platform + send button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {loading && (
                <CircularProgress size={24} sx={{ color: '#1a1a1a' }} />
              )}
              {/* Clear All Filters Button */}
              {Object.keys(columnFilters).length > 0 && (
              <Button
                  size="small"
                variant="outlined"
                  onClick={() => setColumnFilters({})}
                sx={{
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1,
                    minHeight: 28,
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    },
                  }}
                >
                  Clear Filters
              </Button>
              )}
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
              
              <Menu
                anchorEl={dateRangeMenuAnchor}
                open={Boolean(dateRangeMenuAnchor)}
                onClose={() => setDateRangeMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 250,
                    borderRadius: 0.5,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb'
                  }
                }}
              >
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
              
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<StorefrontIcon />}
                sx={{
                  borderColor: '#6B7280', color: '#6B7280', textTransform: 'none',
                  minWidth: 'auto', minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107,114,128,0.04)' }
                }}
              >
                Flipkart
              </Button>
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
                    // Unreconciled Orders tab - show only 4 columns
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
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        textAlign: 'center',
                        minWidth: 200,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                          Reason
                        </Typography>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        textAlign: 'center',
                        minWidth: 120,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                          Count
                        </Typography>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        textAlign: 'center',
                        minWidth: 150,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                          Amount
                        </Typography>
                      </TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: '#111827',
                        background: '#f9fafb',
                        textAlign: 'center',
                        minWidth: 200,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        py: 1,
                      }}>
                        Action
                      </TableCell>
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
                                 {current.map((row, index) => {
                   // Check if this is grouped data (unreconciled tab) or mock data (other tabs)
                   const isGroupedData = 'reason' in row && 'count' in row && 'amount' in row;
                   
                                      if (isGroupedData) {
                     // Render grouped data for unreconciled tab
                     return (
                       <Fragment key={`grouped-${index}`}>
                         <TableRow 
                           sx={{ 
                             '&:hover': { background: '#f3f4f6' },
                             transition: 'all 0.3s ease',
                           }}
                         >
                           <TableCell 
                             padding="checkbox"
                             sx={{
                               textAlign: 'center',
                               verticalAlign: 'middle',
                             }}
                           >
                             <Checkbox
                               checked={false}
                               disabled
                               sx={{
                                 color: '#6b7280',
                               }}
                             />
                    </TableCell>
                           <TableCell sx={{
                             textAlign: 'center',
                             verticalAlign: 'middle',
                             fontWeight: 500,
                           }}>
                             <Chip
                               label={formatReasonLabel(row.reason)}
                               size="small"
                               sx={{
                                 fontWeight: 600,
                                 color: '#1f2937',
                                 backgroundColor: '#e5e7eb',
                                 '& .MuiChip-label': { px: 1 }
                               }}
                             />
                           </TableCell>
                           <TableCell sx={{
                             textAlign: 'center',
                             verticalAlign: 'middle',
                             fontWeight: 500,
                           }}>
                             {row.count}
                           </TableCell>
                           <TableCell sx={{
                             textAlign: 'center',
                             verticalAlign: 'middle',
                             fontWeight: 500,
                           }}>
                             ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                           </TableCell>
                           <TableCell sx={{
                             textAlign: 'center',
                             verticalAlign: 'middle',
                           }}>
                             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                               <Button
                                 size="small"
                                 variant="outlined"
                                 onClick={() => handleMarkReconciled(row.orderIds[0])}
                                 sx={{
                                   fontSize: '0.75rem',
                                   py: 0.5,
                                   px: 1,
                                   minHeight: 28,
                                   borderColor: '#10b981',
                                   color: '#10b981',
                                   '&:hover': {
                                     borderColor: '#059669',
                                     backgroundColor: 'rgba(16, 185, 129, 0.04)',
                                   },
                                 }}
                               >
                                 Mark Reconciled
                               </Button>
                               <Button
                                 size="small"
                                 variant="outlined"
                                 onClick={() => openRaiseDispute(row)}
                                 sx={{
                                   fontSize: '0.75rem',
                                   py: 0.5,
                                   px: 1,
                                   minHeight: 28,
                                   borderColor: '#6b7280',
                                   color: '#6b7280',
                                   '&:hover': {
                                     borderColor: '#4b5563',
                                     backgroundColor: 'rgba(107, 114, 128, 0.04)',
                                   },
                                 }}
                               >
                                 Raise Dispute
                               </Button>
                               <Button
                                 size="small"
                                 variant="outlined"
                                 onClick={() => toggleRowExpansion(row.reason)}
                                 sx={{
                                   fontSize: '0.75rem',
                                   py: 0.5,
                                   px: 1,
                                   minHeight: 28,
                                   borderColor: '#6b7280',
                                   color: '#6b7280',
                                   '&:hover': {
                                     borderColor: '#4b5563',
                                     backgroundColor: 'rgba(107, 114, 128, 0.04)',
                                   },
                                 }}
                               >
                                 {expandedRows.has(row.reason) ? 'Collapse' : 'Expand'}
                               </Button>
                             </Box>
                           </TableCell>
                  </TableRow>
                         
                         {/* Expandable rows showing individual transactions */}
                         {expandedRows.has(row.reason) && row.transactions && (
                           <>
                             {/* Column headers for expanded rows */}
                             <TableRow sx={{ background: '#f1f5f9' }}>
                               <TableCell sx={{ border: 'none' }} />
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 pl: 4,
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Order ID
                               </TableCell>
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Amount
                               </TableCell>
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Order Date
                               </TableCell>
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Settlement Date
                               </TableCell>
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Difference
                               </TableCell>
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Reason
                               </TableCell>
                               <TableCell sx={{ 
                                 textAlign: 'center', 
                                 verticalAlign: 'middle',
                                 fontWeight: 600,
                                 color: '#374151',
                                 fontSize: '0.75rem',
                                 py: 1
                               }}>
                                 Status
                               </TableCell>
                               <TableCell sx={{ border: 'none' }} />
                             </TableRow>
                             
                             {/* Individual transaction rows */}
                             {row.transactions.map((transaction: any, transIndex: number) => (
                               <TableRow 
                                 key={`expanded-${row.reason}-${transIndex}`}
                                 sx={{ 
                                   background: '#f9fafb',
                                   '&:hover': { background: '#f3f4f6' },
                                   transition: 'all 0.3s ease',
                                 }}
                               >
                                 <TableCell sx={{ border: 'none' }} />
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   pl: 4,
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   {transaction.order_id}
                                 </TableCell>
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   ₹{parseFloat(transaction.context?.buyer_invoice_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                 </TableCell>
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   {transaction.order_date}
                                 </TableCell>
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   {transaction.settlement_date}
                                 </TableCell>
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   ₹{parseFloat(transaction.diff || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                 </TableCell>
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   <Chip
                                     label={formatReasonLabel(transaction.reason || 'N/A')}
                                     size="small"
                                     sx={{
                                       fontWeight: 600,
                                       color: '#1f2937',
                                       backgroundColor: '#e5e7eb',
                                       '& .MuiChip-label': { px: 1 }
                                     }}
                                   />
                                 </TableCell>
                                 <TableCell sx={{ 
                                   textAlign: 'center', 
                                   verticalAlign: 'middle',
                                   color: '#6b7280',
                                   fontSize: '0.875rem'
                                 }}>
                                   {transaction.status}
                                 </TableCell>
                                 <TableCell sx={{ border: 'none' }} />
                  </TableRow>
                ))}
                           </>
                         )}
                       </Fragment>
                     );
                   }
                 })}
                {current.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6b7280' }}>No transactions</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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

      <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={() => setSnackbarOpen(false)} message="Sent selected disputes to Flipkart" />

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
              minWidth: 280,
              zIndex: (theme) => theme.zIndex.modal + 1,
            },
          },
        }}
      >
        {(() => {
          const meta = (COLUMN_META as any)[activeFilterColumn]?.type || 'string';
          if (meta === 'string') {
            const val = (columnFilters[activeFilterColumn] || '') as string;
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Contains</Typography>
                <TextField 
                  size="small" 
                  value={val} 
                  onChange={handleStringFilterChange(activeFilterColumn)} 
                  placeholder={`Filter ${activeFilterColumn}`} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Button size="small" onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                  <Button size="small" variant="contained" onClick={applyFilters}>Apply</Button>
                </Box>
              </Box>
            );
          }
          if (meta === 'number') {
            const minVal = (columnFilters[activeFilterColumn]?.min ?? '') as string;
            const maxVal = (columnFilters[activeFilterColumn]?.max ?? '') as string;
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Between</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" type="number" placeholder="Min" value={minVal} onChange={handleNumberRangeChange(activeFilterColumn, 'min')} />
                  <TextField size="small" type="number" placeholder="Max" value={maxVal} onChange={handleNumberRangeChange(activeFilterColumn, 'max')} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Button size="small" onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                  <Button size="small" variant="contained" onClick={applyFilters}>Apply</Button>
                </Box>
              </Box>
            );
          }
          if (meta === 'date') {
            const fromVal = (columnFilters[activeFilterColumn]?.from ?? '') as string;
            const toVal = (columnFilters[activeFilterColumn]?.to ?? '') as string;
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Between dates</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField 
                    size="small" 
                    type="date" 
                    value={fromVal} 
                    onChange={handleDateRangeFilterChange(activeFilterColumn, 'from')}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField 
                    size="small" 
                    type="date" 
                    value={toVal} 
                    onChange={handleDateRangeFilterChange(activeFilterColumn, 'to')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Button size="small" onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                  <Button size="small" variant="contained" onClick={applyFilters}>Apply</Button>
                </Box>
              </Box>
            );
          }
          if (meta === 'enum') {
            const options = getUniqueValuesForColumn(activeFilterColumn);
            const value: string[] = Array.isArray(columnFilters[activeFilterColumn]) ? columnFilters[activeFilterColumn] : [];
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Select values</Typography>
                <FormControl size="small">
                  <Select
                    multiple
                    value={value}
                    onChange={handleEnumFilterChange(activeFilterColumn)}
                    input={<OutlinedInput />}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                    MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                  >
                    {options.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        <Checkbox checked={value.indexOf(opt) > -1} />
                        <Typography variant="caption">{opt}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Button size="small" onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                  <Button size="small" variant="contained" onClick={applyFilters}>Apply</Button>
                </Box>
              </Box>
            );
          }
          return null;
        })()}
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

