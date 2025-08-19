import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/icons-material';
import TransactionSheet from './TransactionSheet';
import { apiService } from '../services/api/apiService';
import { MarketplaceReconciliationResponse } from '../services/api/types';
import { mockReconciliationData, getSafeReconciliationData, isValidReconciliationData } from '../data/mockReconciliationData';
import { Platform } from '../data/mockData';

const MarketplaceReconciliation: React.FC = () => {
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [initialTsTab, setInitialTsTab] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [reconciliationData, setReconciliationData] = useState<MarketplaceReconciliationResponse>(mockReconciliationData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'recon' | 'dispute'>('recon');
  const handleMainTabChange = (_: any, value: number) => setActiveMainTab(value === 0 ? 'recon' : 'dispute');

  // Dispute tab states
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: open, 1: raised
  const handleDisputeSubTabChange = (_: any, value: number) => setDisputeSubTab(value);
  const [disputeRows, setDisputeRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }>>([]);
  const [selectedDisputeIds, setSelectedDisputeIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Sync data sources state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
  
  // Month selector menu state
  const [monthMenuAnchorEl, setMonthMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Date range filter state
  const [selectedDateRange, setSelectedDateRange] = useState('this-month');
  const [dateRangeMenuAnchor, setDateRangeMenuAnchor] = useState<null | HTMLElement>(null);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

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
      // Fetch data based on the selected date range
      fetchReconciliationDataByDateRange(value);
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
        setTempEndDate(tempStartDate);
        setTempStartDate(dateString);
        setCustomStartDate(dateString);
        setCustomEndDate(tempStartDate);
        console.log('Completed selection (reversed):', { start: dateString, end: tempStartDate });
        
        // Auto-call API when selection is completed
        fetchReconciliationDataByDateRange('custom');
        setShowCustomDatePicker(false); // Hide popup
      } else {
        setTempEndDate(dateString);
        setCustomEndDate(dateString);
        console.log('Completed selection:', { start: tempStartDate, end: dateString });
        
        // Auto-call API when selection is completed
        fetchReconciliationDataByDateRange('custom');
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

  // Fetch reconciliation data based on date range
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
      
      // Call the backend API with date range
      console.log('API call with dates:', { start_date: startDate, end_date: endDate });
      const response = await apiService.get('/recon/fetchStats', {
        start_date: startDate,
        end_date: endDate
      });
      
      if (response.success && response.data) {
        setReconciliationData(response.data);
        setUsingMockData(false);
      } else {
        // Fallback to mock data if API fails
        setReconciliationData(mockReconciliationData);
        setUsingMockData(true);
        setError('Failed to fetch data from API, showing sample data');
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
  
  // Platform selector state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['flipkart']);
  const [platformMenuAnchorEl, setPlatformMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Available platforms (only Flipkart for now)
  const availablePlatforms = [
    { value: 'flipkart' as Platform, label: 'Flipkart' }
  ];

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

  const parsePercentage = (percentage: string): number => {
    return parseFloat(percentage) || 0;
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
      const response = await apiService.get<MarketplaceReconciliationResponse>(
        '/recon/fetchStats',
        { start_date: startDate, end_date: endDate }
      );
      
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

  // Load initial data
  useEffect(() => {
    fetchReconciliationData(selectedMonth);
    const params = new URLSearchParams(location.search);
    const openTs = params.get('openTs') || params.get('openTransactionSheet');
    const tabParam = params.get('tab');
    if (openTs && !showTransactionSheet) {
      if (tabParam === 'unreconciled') setInitialTsTab(2);
      else if (tabParam === 'unsettled') setInitialTsTab(1);
      else setInitialTsTab(0);
      setShowTransactionSheet(true);
      navigate('/marketplace-reconciliation', { replace: true });
    }
  }, []);

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
          borderRadius: '25px',
        }}
        onClick={() => {
          console.log('Button clicked, setting showTransactionSheet to true');
          setShowTransactionSheet(true);
        }}
      >
        <ArrowForwardIcon sx={{ mb: 1, transform: 'rotate(90deg)', color: 'white' }} />
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
                  onClick={(event) => setPlatformMenuAnchorEl(event.currentTarget)}
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
                  {selectedPlatforms.length > 0 
                    ? availablePlatforms.find(p => p.value === selectedPlatforms[0])?.label || 'Flipkart'
                    : 'Select Platforms'
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
                      minWidth: 200,
                    }
                  }}
                >
                  {availablePlatforms.map((platform) => (
                    <MenuItem
                      key={platform.value}
                      onClick={() => {
                        setSelectedPlatforms([platform.value]);
                        setPlatformMenuAnchorEl(null);
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
                        <StorefrontIcon sx={{ mr: 2, fontSize: 20, color: '#6B7280' }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {platform.label}
                        </Typography>
                        {selectedPlatforms.includes(platform.value) && (
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

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12}>
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
                  px: 4, 
                  py: 3,
                  background: 'transparent',
                  borderBottom: 'none'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: '#1f2937',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    letterSpacing: '-0.025em'
                  }}>
                    Reconciliation Summary
                  </Typography>
                </Box>
                <Box sx={{ px: 4, pb: 2 }}>
                  {(() => {
                    const totalTransactions = (reconciliationData.ordersDelivered?.number || 0) + (reconciliationData.ordersReturned?.number || 0);
                    const totalTransactionsAmount = parseAmount(reconciliationData.summaryData.totalTransaction.amount);
                    const totalTransactionsCount = reconciliationData.summaryData.totalTransaction.number;
                    const netSalesSalesReports = parseAmount(reconciliationData.grossSales);
                    const netSalesSalesReportsCount = reconciliationData.summaryData.netSalesAsPerSalesReport.number;
                    const netSalesSalesReportsAmount = parseAmount(reconciliationData.summaryData.netSalesAsPerSalesReport.amount);
                    const netPaymentReceivedAsPerPaymentAmount = parseAmount(reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.amount);
                    const netPaymentReceivedAsPerPaymentCount = reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number;
                    const pendingPaymentCount = reconciliationData.summaryData?.pendingPaymentFromMarketplace?.number || 0;
                    const pendingPaymentAmount = parseAmount(reconciliationData.summaryData?.pendingPaymentFromMarketplace?.amount || '0');
                    const reconciledOrdersAmount = parseAmount(reconciliationData.summaryData?.totalReconciled?.amount || '0');
                    const reconciledOrdersCount = reconciliationData.summaryData?.totalReconciled?.number || 0;
                    const lessPaymentAmount = parseAmount(reconciliationData.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.amount || '0');
                    const lessPaymentCount = reconciliationData.summaryData?.totalUnreconciled?.lessPaymentReceivedFromFlipkart?.number || 0;
                    const morePaymentAmount = parseAmount(reconciliationData.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.amount || '0');
                    const morePaymentCount = reconciliationData.summaryData?.totalUnreconciled?.excessPaymentReceivedFromFlipkart?.number || 0;
                    const totalUnrecAmount = parseAmount(reconciliationData.summaryData?.totalUnreconciled?.amount || '0');
                    const totalUnrecCount = reconciliationData.summaryData?.totalUnreconciled?.number || 0;
                    const cancelledOrdersCount = reconciliationData.summaryData.returnedOrCancelledOrders.number;
                    const cancelledOrdersAmount = parseAmount(reconciliationData.summaryData?.returnedOrCancelledOrders?.amount || '0');
                    const cards = [
                      { label: 'Total Transactions', count: totalTransactionsCount, amount: totalTransactionsAmount },
                      { label: 'Net Sales as per Sales Reports', count: netSalesSalesReportsCount, amount: netSalesSalesReportsAmount },
                      { label: 'Payment Received as per Payment Report', count: netPaymentReceivedAsPerPaymentCount, amount: netPaymentReceivedAsPerPaymentAmount },
                      { label: 'Total Unreconciled Amount', count: totalUnrecCount, amount: totalUnrecAmount },
                      { label: 'Reconciled Orders', count: reconciledOrdersCount, amount: reconciledOrdersAmount },
                      { label: 'Less Payment Received', count: lessPaymentCount, amount: lessPaymentAmount },
                      // Removed: More Payment Received
                      { label: 'Pending Payment', count: pendingPaymentCount, amount: pendingPaymentAmount },
                      { label: 'Cancelled Orders', count: cancelledOrdersCount, amount: cancelledOrdersAmount },
                    ];
                    return (
                      <Box sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                          xs: 'repeat(1, minmax(220px, 1fr))',
                          sm: 'repeat(2, minmax(220px, 1fr))',
                          md: 'repeat(4, minmax(220px, 1fr))',
                        },
                      }}>
                        {cards.map((r, idx) => (
                          <Box key={idx} sx={{
                            p: 1.5,
                            borderRadius: 0,
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                          }}>
                            <Box sx={{ mb: 0.5 }}>
                              <Typography 
                                variant="caption" 
                                sx={{ fontWeight: 600, color: '#9ca3af', letterSpacing: '0.02em' }}
                              >
                                {r.label}
                              </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', lineHeight: 1.1 }}>
                              {`₹${Math.round(r.amount).toLocaleString('en-IN')}`}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'grid', gap: 2 }}>
            <Card sx={{ 
              mb: 3, 
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
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 4, 
                  color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
                  textAlign: 'center',
                  letterSpacing: '-0.025em'
                }}>
                  Reconciled Difference
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                        Reconciliation Calculation:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          Total Sales: {formatCurrency(parseAmount(reconciliationData.grossSales))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - Collection: {formatCurrency(parseAmount(reconciliationData.summaryData?.paymentReceivedAsPerSettlementReport?.amount || '0'))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - Platform Commissions: {formatCurrency(parseAmount(reconciliationData.commission?.totalCommission || '0'))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - TDS (Tax Deducted): {formatCurrency(parseAmount(reconciliationData.totalTDS))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          - TCS (Tax Collected): {formatCurrency(parseAmount(reconciliationData.totalTDA))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mt: 1 }}>
                          = Difference: {formatCurrency(parseAmount(reconciliationData.difference))}
                        </Typography>
                      </Box>
                    </Box>
                  }
                arrow
                placement="top"
                enterDelay={1000}
                leaveDelay={0}
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      padding: '12px',
                      maxWidth: 350,
                    },
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(0, 0, 0, 0.9)',
                    },
                  },
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'help',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}>
                  <Typography variant="h2" sx={{
                    fontWeight: 300,
                    color: parseAmount(reconciliationData.difference) === 0 ? '#059669' : '#dc2626',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '3rem',
                    mb: 2,
                    textAlign: 'center',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {formatCurrency(parseAmount(reconciliationData.difference))}
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: parseAmount(reconciliationData.difference) === 0 ? '#065f46' : '#991b1b',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    textAlign: 'center',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    opacity: 0.8,
                  }}>
                    {parseAmount(reconciliationData.difference) === 0 ? 'Perfectly Reconciled' : 'Reconciliation Required'}
                  </Typography>
                </Box>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            {/* Pending payment (new card) */}
            <Card sx={{ 
              mb: 3, 
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
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 4, 
                  color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
                  textAlign: 'center',
                  letterSpacing: '-0.025em'
                }}>
                  Pending payment
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}>
                    <Typography variant="h2" sx={{
                      fontWeight: 300,
                      color: '#0f172a',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '3rem',
                      mb: 2,
                      textAlign: 'center',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.summaryData?.pendingPaymentFromMarketplace?.amount || '0'))}
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: '#6b7280',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      textAlign: 'center',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.875rem',
                      opacity: 0.9,
                    }}>
                      Awaiting settlement
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Box>
          </Grid>

          {/* Reconciliation Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '16px',
              border: '1px solid #f1f3f4',
              boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
              minHeight: 'fit-content',
              maxHeight: '520px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
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
                  gap: 3,
                }}>
                  {/* Gauge Chart */}
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                      width: 200,
                      height: 200,
                      borderRadius: '100%',
                      background: `conic-gradient(
                        ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#10b981' : '#ef4444'} 0deg,
                        ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#10b981' : '#ef4444'} ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? 360 : Math.min((1 - (parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) / parseAmount(reconciliationData.grossSales))) * 360, 360)}deg,
                        #f1f5f9 ${parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? 360 : Math.min((1 - (parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) / parseAmount(reconciliationData.grossSales))) * 360, 360)}deg,
                        #f1f5f9 360deg
                      )`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <Box sx={{
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      }}>
                        <Typography variant="h3" sx={{
                          fontWeight: 500,
                          color: parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#059669' : '#dc2626',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          mb: 0.5,
                          fontSize: '2rem',
                          letterSpacing: '-0.02em'
                        }}>
                          {parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '100%' : `${Math.max(0, 100 - ((parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) / parseAmount(reconciliationData.grossSales)) * 100)).toFixed(1)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Difference Amount Card */}
                    <Box sx={{
                    width: '100%',
                    p: 3,
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
                          Difference Amount
                        </Typography>
                    <Typography variant="h5" sx={{
                      color: parseAmount(reconciliationData.summaryData.totalUnreconciled.amount) === 0 ? '#047857' : '#dc2626',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 700,
                      letterSpacing: '-0.02em'
                      }}>
                      {formatCurrency(parseAmount(reconciliationData.summaryData.totalUnreconciled.amount))}
                      </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Settlement Status Visualization */}
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
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 4, 
              color: '#1f2937',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              letterSpacing: '-0.025em'
            }}>
              Settlement and Unsettled Summary
            </Typography>
            
            <Grid container spacing={3}>
              {/* Settlement Status Chart */}
              <Grid item xs={12} md={8}>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Settled Orders',
                            value: reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number,
                            amount: parseAmount(reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.amount),
                            color: '#7A5DBF',
                            type: 'settled'
                          },
                          {
                            name: 'Unsettled Orders',
                            value: reconciliationData.summaryData.netSalesAsPerSalesReport.number,
                            amount: parseAmount(reconciliationData.summaryData.netSalesAsPerSalesReport.amount),
                            color: '#A79CDB',
                            type: 'unsettled'
                          },
                          {
                            name: 'cancelled Orders',
                            value: reconciliationData.summaryData.returnedOrCancelledOrders.number,
                            amount: parseAmount(reconciliationData.summaryData.returnedOrCancelledOrders.amount),
                            color: '#D3C8EC',
                            type: 'returns'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={125}
                        outerRadius={140}
                        paddingAngle={1}
                        cornerRadius={1}
                        dataKey="value"
                      >
                        {[
                          { name: 'Settled Orders', value: reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number, color: '#7A5DBF' },
                          { name: 'Unsettled Orders', value: reconciliationData.summaryData.netSalesAsPerSalesReport.number, color: '#A79CDB' },
                          { name: 'cancelled Returns', value: reconciliationData.summaryData.returnedOrCancelledOrders.number, color: '#D3C8EC' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <Box sx={{
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                p: 2,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                                  {data.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>
                                  Orders: {data.value}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666666' }}>
                                  Amount: {formatCurrency(data.amount)}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: '#1a1a1a', fontSize: '12px', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                            {value} ({entry.payload && entry.payload.value})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              {/* Settlement Details */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Settled Orders */}
                  <Box sx={{
                    position: 'relative',
                    p: 5,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      borderRadius: '20px 20px 0 0',
                    }
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      color: '#6b7280',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem'
                    }}>
                      Settled Orders
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 300,
                      color: '#1f2937',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 2,
                      letterSpacing: '-0.02em'
                    }}>
                      {(reconciliationData.ordersDelivered?.number || 0) - (reconciliationData.monthOrdersAwaitedSettlement?.salesOrders || 0)}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: '#059669',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 600,
                      letterSpacing: '-0.01em'
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.monthOrdersPayoutReceived || '0'))}
                    </Typography>
                  </Box>

                  {/* Unsettled Orders */}
                  <Box sx={{
                    position: 'relative',
                    p: 5,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      borderRadius: '20px 20px 0 0',
                    }
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      color: '#6b7280',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem'
                    }}>
                      Unsettled Orders
                    </Typography>
                    <Typography variant="h3" sx={{
                      fontWeight: 300,
                      color: '#1f2937',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      mb: 2,
                      letterSpacing: '-0.02em'
                    }}>
                      {reconciliationData.monthOrdersAwaitedSettlement?.salesOrders || 0}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: '#d97706',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 600, 
                      letterSpacing: '-0.01em'
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.monthOrdersAwaitedSettlement?.salesAmount || '0'))}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Settlement Summary */}
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={4}>
                {/* Total Orders */}
                <Grid item xs={12} md={4}>
                  <Box sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(229, 231, 235, 0.4)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      borderRadius: '0 0 20px 20px',
                    }
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#9ca3af', 
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      mb: 2,
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h2" sx={{
                      fontWeight: 200,
                      color: '#1f2937', 
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.03em',
                      fontSize: '2.5rem'
                    }}>
                      {reconciliationData.summaryData.netSalesAsPerSalesReport.number}
                    </Typography>
                  </Box>
                </Grid>

                {/* Settlement Rate */}
                <Grid item xs={12} md={4}>
            <Box sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(187, 247, 208, 0.4)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      borderRadius: '0 0 20px 20px',
                    }
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#065f46', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                  mb: 2,
                      display: 'block',
                  textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                }}>
                      Settlement Rate
                </Typography>
                    <Typography variant="h2" sx={{
                      fontWeight: 200,
                      color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.03em',
                      fontSize: '2.5rem'
                    }}>
                      {((reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.number) / (reconciliationData.summaryData.netSalesAsPerSalesReport.number) * 100).toFixed(1)}%
                </Typography>
              </Box>
                </Grid>

                {/* Net Pending Amount */}
                <Grid item xs={12} md={4}>
              <Box sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(253, 230, 138, 0.4)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      borderRadius: '0 0 20px 20px',
                    }
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#92400e', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                  mb: 2,
                      display: 'block',
                  textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                }}>
                      Net Pending Amount
                </Typography>
                    <Typography variant="h5" sx={{
                      fontWeight: 300,
                      color: '#1f2937', 
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.02em',
                      fontSize: '1.5rem'
                    }}>
                      {formatCurrency(parseAmount(reconciliationData.summaryData.netSalesAsPerSalesReport.amount) - parseAmount(reconciliationData.summaryData.paymentReceivedAsPerSettlementReport.amount))}
                </Typography>
              </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Enhanced Sales Dashboard with 3-Line Graph and KPI Cards */}
        <Paper sx={{ 
          p: 3, 
          mb: 6, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <Typography variant="h6" mb={3} sx={{ color: '#1f2937', fontWeight: 600 }}>
            Enhanced Sales Dashboard
          </Typography>

          {/* Enhanced KPI Cards */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5, 
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              maxWidth: 'fit-content'
            }}>
              {Object.entries(enhancedMockData.enhancedKPIs).map(([key, kpi]) => (
                <Paper 
                  key={key}
                  sx={{ 
                    flex: '0 0 auto',
                    width: 140,
                    p: 2, 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 70
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6b7280', 
                      fontWeight: 500, 
                      mb: 0.5,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {kpi.label as any}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: key === 'grossRevenue' ? '#a79cdb' : 
                             key === 'netRevenue' ? '#F59E0B' : '#1f2937',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      lineHeight: 1.2,
                      mb: 0.5
                    }}
                  >
                    ₹{((kpi as any).value / 100000).toFixed(1)}L
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6b7280', 
                fontStyle: 'italic',
                mt: 1.5,
                display: 'block',
                fontSize: '0.625rem'
              }}
            >
              * Amount represented are exclusive of taxes
            </Typography>
          </Box>

          {/* Enhanced 3-Line Graph */}
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedMockData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ 
                    value: 'In Lakhs', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#6b7280' } as any
                  }}
                  tickFormatter={(value: number) => `${(value / 100000).toFixed(0)}L`}
                />
                <RechartsTooltip 
                  formatter={(value: any, name: string) => [
                    `₹${(Number(value) / 100000).toFixed(1)}L`, 
                    name === 'gross' ? 'Gross Revenue' : 
                    name === 'net' ? 'Net Revenue' : 'Returns'
                  ]}
                  contentStyle={{ 
                    borderRadius: 8, 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gross" 
                  stroke="#a79cdb" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#a79cdb', strokeWidth: 2, fill: '#a79cdb' }}
                  name="gross"
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#F59E0B" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#F59E0B' }}
                  name="net"
                />
                <Line 
                  type="monotone" 
                  dataKey="returns" 
                  stroke="#1f2937" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#1f2937', strokeWidth: 2, fill: '#1f2937' }}
                  name="returns"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Tax Breakdown */}
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
            onBack={() => setShowTransactionSheet(false)} 
            statsData={reconciliationData}
            initialTab={initialTsTab}
          />
        </Box>
      )}


    </Box>
  );
};

export default MarketplaceReconciliation;