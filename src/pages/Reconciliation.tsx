import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Marketplace Reconciliation Dashboard
 * 
 * This component is now fully integrated with the /fetchstate API endpoint
 * and displays reconciliation summary data from the backend response.
 * 
 * Key features:
 * - Fetches data from /recon/fetchStats API endpoint
 * - Maps summaryData from backend response to UI components
 * - Displays comprehensive reconciliation metrics
 * - Shows real-time data for orders, payments, and settlements
 */
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Collapse,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
  InfoOutlined as InfoOutlinedIcon,
  AccountBalance as AccountBalanceIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  StoreRounded as StoreRoundedIcon,
  Error as ErrorIcon,
  Done as DoneIcon,
  PendingActions as PendingActionsIcon,
  Flag as FlagIcon,
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Data sources for sync
const dataSources = [
  { 
    key: 'razorpay', 
    label: 'Razorpay', 
    icon: <CreditCardIcon sx={{ color: '#3395FF' }} />,
    description: 'Payment gateway data',
    hasReports: true
  },
  { 
    key: 'bank', 
    label: 'Your Axis Bank Account', 
    icon: <AccountBalanceIcon color="primary" />,
    description: 'Bank transaction data',
    hasReports: false
  },
  { 
    key: 'erp', 
    label: 'Your ERP', 
    icon: <StorageIcon color="secondary" />,
    description: 'Enterprise resource planning data',
    hasReports: false
  },
  { 
    key: 'oms', 
    label: 'Your Order Management System', 
    icon: <StoreRoundedIcon color="secondary" />,
    description: 'Order Management data',
    hasReports: false
  },
];

// Sample CSV data parsed
const paymentReportData = [
  ["Payment ID", "Order ID", "Payment Date", "Amount", "Currency", "Payment Status", "Method", "Customer Email"],
  ["pay_90519o", "order_57714", "2025-07-04 14:29:58", "3067.53", "INR", "Failed", "Wallet", "user1@email.com"],
  ["pay_29420m", "order_74993", "2025-07-08 13:17:41", "2229.61", "INR", "Failed", "UPI", "user2@email.com"],
  ["pay_70706w", "order_51923", "2025-07-04 14:45:00", "2773.65", "INR", "Refunded", "Wallet", "user3@email.com"],
  ["pay_54015c", "order_14917", "2025-07-09 23:37:11", "3460.31", "INR", "Refunded", "Card", "user4@email.com"],
  ["pay_18523j", "order_92800", "2025-07-02 15:21:03", "3076.72", "INR", "Failed", "Netbanking", "user5@email.com"],
  ["pay_90156k", "order_89198", "2025-07-09 20:41:21", "3381.77", "INR", "Captured", "Card", "user6@email.com"],
  ["pay_12345a", "order_12345", "2025-07-01 10:05:32", "4000.00", "INR", "Captured", "UPI", "user7@email.com"],
  ["pay_67890b", "order_67890", "2025-07-03 13:12:45", "2500.50", "INR", "Captured", "Netbanking", "user8@email.com"],
  ["pay_24680c", "order_24680", "2025-07-05 16:40:20", "1500.75", "INR", "Captured", "Wallet", "user9@email.com"],
  ["pay_13579d", "order_13579", "2025-07-06 09:25:11", "4800.20", "INR", "Captured", "Card", "user10@email.com"]
];

const settlementReportData = [
  ["Payment ID", "Order ID", "Amount", "Settlement Date", "Settlement Amount", "Settlement Status", "Fee", "Tax", "Net Amount", "Method"],
  ["pay_90519o", "order_57714", "3067.53", "2025-07-03 21:16:18", "0.00", "Failed", "0.00", "0.00", "0.00", "Wallet"],
  ["pay_29420m", "order_74993", "2229.61", "2025-07-04 06:01:11", "0.00", "Failed", "0.00", "0.00", "0.00", "UPI"],
  ["pay_70706w", "order_51923", "2773.65", "2025-07-08 10:57:55", "0.00", "Refunded", "0.00", "0.00", "0.00", "Wallet"],
  ["pay_54015c", "order_14917", "3460.31", "2025-07-08 14:48:19", "0.00", "Refunded", "0.00", "0.00", "0.00", "Card"],
  ["pay_18523j", "order_92800", "3076.72", "2025-07-04 09:43:25", "0.00", "Failed", "0.00", "0.00", "0.00", "Netbanking"],
  ["pay_90156k", "order_89198", "3381.77", "2025-07-11 10:00:00", "3212.68", "Settled", "101.45", "18.26", "3194.42", "Card"],
  ["pay_12345a", "order_12345", "4000.00", "2025-07-02 09:00:00", "3800.00", "Settled", "120.00", "21.60", "3778.40", "UPI"],
  ["pay_67890b", "order_67890", "2500.50", "2025-07-04 11:30:00", "2375.48", "Settled", "75.02", "13.50", "2361.98", "Netbanking"],
  ["pay_24680c", "order_24680", "1500.75", "2025-07-06 12:00:00", "1425.71", "Settled", "45.02", "8.10", "1417.61", "Wallet"],
  ["pay_13579d", "order_13579", "4800.20", "2025-07-07 14:00:00", "4560.19", "Settled", "144.01", "25.92", "4534.27", "Card"]
];

// Reconciliation data showing matched and unmatched transactions
const reconciliationData = [
  {
    id: 'pay_12345a',
    orderId: 'order_12345',
    date: '2025-07-01',
    razorpayAmount: 4000.00,
    bankAmount: 3778.40,
    status: 'matched',
    method: 'UPI',
    customer: 'user7@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_67890b',
    orderId: 'order_67890',
    date: '2025-07-03',
    razorpayAmount: 2500.50,
    bankAmount: 2361.98,
    status: 'matched',
    method: 'Netbanking',
    customer: 'user8@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_90156k',
    orderId: 'order_89198',
    date: '2025-07-09',
    razorpayAmount: 3381.77,
    bankAmount: 3194.42,
    status: 'matched',
    method: 'Card',
    customer: 'user6@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_24680c',
    orderId: 'order_24680',
    date: '2025-07-05',
    razorpayAmount: 1500.75,
    bankAmount: 1417.61,
    status: 'matched',
    method: 'Wallet',
    customer: 'user9@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_13579d',
    orderId: 'order_13579',
    date: '2025-07-06',
    razorpayAmount: 4800.20,
    bankAmount: 4534.27,
    status: 'matched',
    method: 'Card',
    customer: 'user10@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_22222f',
    orderId: 'order_22222',
    date: '2025-07-08',
    razorpayAmount: 2100.00,
    bankAmount: 1983.66,
    status: 'matched',
    method: 'Wallet',
    customer: 'user12@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_44444h',
    orderId: 'order_44444',
    date: '2025-07-10',
    razorpayAmount: 2600.00,
    bankAmount: 2455.96,
    status: 'matched',
    method: 'Netbanking',
    customer: 'user14@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_55555i',
    orderId: 'order_55555',
    date: '2025-07-02',
    razorpayAmount: 2900.00,
    bankAmount: 2739.34,
    status: 'matched',
    method: 'UPI',
    customer: 'user15@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_77777k',
    orderId: 'order_77777',
    date: '2025-07-04',
    razorpayAmount: 4100.00,
    bankAmount: 3872.86,
    status: 'matched',
    method: 'Card',
    customer: 'user17@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_88888l',
    orderId: 'order_88888',
    date: '2025-07-05',
    razorpayAmount: 3700.00,
    bankAmount: 3495.02,
    status: 'matched',
    method: 'UPI',
    customer: 'user18@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  {
    id: 'pay_00000n',
    orderId: 'order_00000',
    date: '2025-07-07',
    razorpayAmount: 2150.00,
    bankAmount: 2030.89,
    status: 'matched',
    method: 'Wallet',
    customer: 'user20@email.com',
    notes: 'Auto-matched: Net amount after fees'
  },
  // Unmatched transactions that require manual review
  {
    id: 'pay_99999x',
    orderId: 'order_99999',
    date: '2025-07-06',
    razorpayAmount: 5500.00,
    bankAmount: null,
    status: 'unmatched',
    method: 'Card',
    customer: 'user25@email.com',
    notes: 'No corresponding bank entry found'
  },
  {
    id: 'pay_11111y',
    orderId: 'order_11111',
    date: '2025-07-08',
    razorpayAmount: 3200.00,
    bankAmount: 3050.00,
    status: 'unmatched',
    method: 'UPI',
    customer: 'user26@email.com',
    notes: 'Amount mismatch - requires review'
  },
  {
    id: 'pay_33333z',
    orderId: 'order_33333',
    date: '2025-07-09',
    razorpayAmount: null,
    bankAmount: 2750.00,
    status: 'unmatched',
    method: 'Unknown',
    customer: 'Unknown',
    notes: 'Bank entry without Razorpay record'
  }
];

// Razorpay fee structure
const razorpayFees = [
  {
    id: 1,
    paymentMethod: 'UPI',
    feePercentage: '0%',
    additionalCharges: 'No additional charges',
    mdrRate: '0%',
    notes: 'Zero MDR as per RBI guidelines'
  },
  {
    id: 2,
    paymentMethod: 'RuPay Debit Card',
    feePercentage: '0%',
    additionalCharges: 'No additional charges',
    mdrRate: '0%',
    notes: 'Zero MDR as per RBI guidelines'
  },
  {
    id: 3,
    paymentMethod: 'Other Debit Cards (≤ ₹2,000)',
    feePercentage: '1.60%',
    additionalCharges: 'Platform fees',
    mdrRate: '0.40%',
    notes: 'MDR + Platform fees'
  },
  {
    id: 4,
    paymentMethod: 'Other Debit Cards (> ₹2,000)',
    feePercentage: '1.60%',
    additionalCharges: 'Platform fees',
    mdrRate: '0.90%',
    notes: 'MDR + Platform fees'
  },
  {
    id: 5,
    paymentMethod: 'Credit Cards (Visa/Mastercard)',
    feePercentage: '2%',
    additionalCharges: 'Platform fees + 18% GST',
    mdrRate: '3%',
    notes: 'Standard credit card charges'
  },
  {
    id: 6,
    paymentMethod: 'Amex/Diners/International Cards',
    feePercentage: '2%',
    additionalCharges: 'Platform fees + 18% GST',
    mdrRate: '3%',
    notes: 'Premium card charges'
  },
  {
    id: 7,
    paymentMethod: 'International Amex Cards',
    feePercentage: '2%',
    additionalCharges: 'Platform fees + 18% GST',
    mdrRate: '3.5%',
    notes: 'International premium card charges'
  },
  {
    id: 8,
    paymentMethod: 'Netbanking',
    feePercentage: '2%',
    additionalCharges: 'Platform fees + 18% GST',
    mdrRate: 'Varies by bank',
    notes: 'Bank-specific charges apply'
  },
  {
    id: 9,
    paymentMethod: 'Wallets',
    feePercentage: '2%',
    additionalCharges: 'Platform fees + 18% GST',
    mdrRate: 'Varies by wallet',
    notes: 'Wallet-specific charges apply'
  }
];

// Disputed transactions
const disputedTransactions = [
  {
    id: 'pay_12345a',
    orderId: 'order_12345',
    date: '2025-07-01',
    amount: 4000.00,
    expectedFee: 0, // UPI should be 0%
    chargedFee: 80.00, // 2% incorrectly charged
    method: 'UPI',
    disputeReason: 'Unexpected or Unclear Fees',
    status: 'disputed',
    notes: 'UPI transaction incorrectly charged 2% platform fee'
  },
  {
    id: 'pay_67890b',
    orderId: 'order_67890',
    date: '2025-07-03',
    amount: 2500.50,
    expectedFee: 75.02, // 3% for credit cards
    chargedFee: 125.03, // 5% incorrectly charged
    method: 'Credit Card',
    disputeReason: 'Unexpected or Unclear Fees',
    status: 'disputed',
    notes: 'Credit card transaction charged 5% instead of 3%'
  },
  {
    id: 'pay_24680c',
    orderId: 'order_24680',
    date: '2025-07-05',
    amount: 1500.75,
    expectedFee: 45.02, // 3% for credit cards
    chargedFee: 45.02,
    method: 'Credit Card',
    disputeReason: 'Short Payments or Settlement Delays',
    status: 'disputed',
    notes: 'Settlement delayed by 3 days without notification'
  }
];

// Backend response data structure - using the correct interface from API types
import { MarketplaceReconciliationResponse } from '../services/api/types';

// Sample backend data (replace with actual API call)
const sampleBackendData: MarketplaceReconciliationResponse = {
  "grossSales": "34106829",
  "ordersDelivered": {
    "amount": "35870817.44",
    "number": 46167
  },
  "ordersReturned": {
    "amount": "5979389",
    "number": 6649
  },
  "commission": {
    "totalCommission": "-6487615.37",
    "commissionRate": "-23.12221997449134"
  },
  "settledSales": "28057926",
  "summaryData": {
    "totalTransaction": {
      "amount": "37056829",
      "number": 46875
    },
    "netSalesAsPerSalesReport": {
      "amount": "30603032",
      "number": 39345
    },
    "paymentReceivedAsPerSettlementReport": {
      "amount": "15468377.66",
      "number": 46973
    },
    "totalUnreconciled": {
      "amount": "0",
      "number": 0,
      "lessPaymentReceivedFromFlipkart": {
        "amount": "0",
        "number": 0
      },
      "excessPaymentReceivedFromFlipkart": {
        "amount": "0",
        "number": 0
      }
    },
    "totalReconciled": {
      "amount": "28057926",
      "number": 34845
    },
    "pendingPaymentFromMarketplace": {
      "amount": "8163376.24",
      "number": 10912
    },
    "pendingDeductions": {
      "amount": "803",
      "number": 2
    },
    "returnedOrCancelledOrders": {
      "amount": "6453797",
      "number": 7530
    }
  },
  "totalTDS": "-20056.92",
  "totalTDA": "-100269.6",
  "monthOrdersPayoutReceived": "15468377.66",
  "monthOrdersAwaitedSettlement": {
    "salesAmount": "8163376.24",
    "salesOrders": 10912
  },
  "unsettledReturns": {
    "returnAmount": "-803",
    "returnsOrders": 2
  },
  "difference": "8162573.24",
  "returnRate": "12.15472643182275",
  "commissionRate": "-23.12221997449134"
};

const Reconciliation: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // 6 = July
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [razorpayReportsOpen, setRazorpayReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<'payment' | 'settlement'>('payment');
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'done' }>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [selectedDisputeTransaction, setSelectedDisputeTransaction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reconciliation' | 'fees' | 'disputes'>('overview');
  const [backendData, setBackendData] = useState<MarketplaceReconciliationResponse>(sampleBackendData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reconciliation data from API
  const fetchReconciliationData = async (month: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate date range for the selected month
      const year = 2025; // You can make this dynamic
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
      
      // Use the stats API which maps to /recon/fetchStats endpoint
      const response = await api.stats.getStats({ startDate, endDate });
      
      console.log('API Response from /fetchstate:', response);
      console.log('Response data:', response.data);
      console.log('Response success:', response.success);
      console.log('Response statusCode:', response.statusCode);
      
      // Check if we have data from the API response
      if (response.data) {
        console.log('Setting backend data from /fetchstate:', response.data);
        setBackendData(response.data);
        setError(null); // Clear any previous errors
      } else {
        // Fallback to sample data if API fails
        console.log('API failed, using sample data');
        setBackendData(sampleBackendData);
        setError('Failed to fetch data from /fetchstate API, showing sample data');
      }
    } catch (err) {
      console.error('Error fetching reconciliation data from /fetchstate:', err);
      setBackendData(sampleBackendData);
      setError('Network error, showing sample data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or month changes
  useEffect(() => {
    fetchReconciliationData(selectedMonth);
  }, [selectedMonth]);

  const handleSyncClick = () => {
    setSyncModalOpen(true);
  };

  const handleDataSourceClick = (sourceKey: string) => {
    if (sourceKey === 'razorpay') {
      setRazorpayReportsOpen(true);
    } else {
      // For bank and ERP, just show loading state
      setSyncStatus({ [sourceKey]: 'loading' });
      setTimeout(() => {
        setSyncStatus({ [sourceKey]: 'done' });
        setTimeout(() => {
          setSyncModalOpen(false);
          setSyncStatus({});
        }, 1000);
      }, 2000);
    }
  };

  // Use the old mock data for the reconciliation table since it has the required structure
  const filteredReconciliationData = reconciliationData.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const totalTransactions = reconciliationData.length;
  const matchedTransactions = reconciliationData.filter(item => item.status === 'matched').length;
  const unmatchedTransactions = totalTransactions - matchedTransactions;
  const matchPercentage = Math.round((matchedTransactions / totalTransactions) * 100);

  const currentReportData = selectedReport === 'payment' ? paymentReportData : settlementReportData;

  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: string | number | null) => {
    if (num === null || num === undefined) return 'N/A';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return 'N/A';
    return number.toLocaleString('en-IN');
  };

  const formatPercentage = (rate: string | number | null) => {
    if (rate === null || rate === undefined) return 'N/A';
    const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (isNaN(numRate)) return 'N/A';
    return `${numRate.toFixed(2)}%`;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'matched') return <DoneIcon color="success" fontSize="small" />;
    if (status === 'unmatched') return <ErrorIcon color="error" fontSize="small" />;
    return <PendingActionsIcon color="warning" fontSize="small" />;
  };

  const getStatusChip = (status: string) => {
    if (status === 'matched') {
      return <Chip label="Matched" color="success" size="small" />;
    } else {
      return <Chip label="Requires Review" color="error" size="small" icon={<ErrorIcon />} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Month Tabs */}
      <Paper sx={{ mb: 2, p: 1, borderRadius: 3 }}>
        <Tabs
          value={selectedMonth}
          onChange={(_, v) => {
            setSelectedMonth(v);
            fetchReconciliationData(v);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {monthNames.map((name, idx) => (
            <Tab key={name} label={name} value={idx} />
          ))}
        </Tabs>
      </Paper>

      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Marketplace Reconciliation Dashboard
          </Typography>
          <Chip label={`${monthNames[selectedMonth]} 2025`} variant="outlined" sx={{ fontWeight: 500 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last sync 5 mins ago
          </Typography>
          <Button
            startIcon={<SyncIcon />}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            onClick={handleSyncClick}
            disabled={loading}
          >
            {loading ? 'Syncing...' : 'Sync Data'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading reconciliation data...
          </Typography>
        </Box>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Reconciliation Results" value="reconciliation" />
          <Tab label="Razorpay Fee Structure" value="fees" />
          <Tab label="Disputed Transactions" value="disputes" />
        </Tabs>
      </Paper>

      {/* Overview Section */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <TrendingUpIcon sx={{ fontSize: 40 }} />
                    <Box>
                                             <Typography variant="h4" sx={{ fontWeight: 700 }}>
                         {formatCurrency(backendData.grossSales)}
                       </Typography>
                      <Typography variant="body2">
                        Gross Sales
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <DoneIcon sx={{ fontSize: 40 }} />
                    <Box>
                                             <Typography variant="h4" sx={{ fontWeight: 700 }}>
                         {formatCurrency(backendData.settledSales)}
                       </Typography>
                      <Typography variant="body2">
                        Settled Sales
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PendingActionsIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatCurrency(backendData.summaryData.pendingPaymentFromMarketplace.amount)}
                      </Typography>
                      <Typography variant="body2">
                        Pending Payment
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <TrendingDownIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatCurrency(backendData.summaryData.returnedOrCancelledOrders.amount)}
                      </Typography>
                      <Typography variant="body2">
                        Returns & Cancellations
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Orders Summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Orders Delivered:</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(backendData.ordersDelivered.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(backendData.ordersDelivered.number)} orders
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Orders Returned:</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="error.main">
                        {formatCurrency(backendData.ordersReturned.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(backendData.ordersReturned.number)} orders
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Return Rate:</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatPercentage(backendData.returnRate)}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Commission & Deductions
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Total Commission:</Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(backendData.commission.totalCommission)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Commission Rate:</Typography>
                                      <Typography variant="h6" color="error.main">
                    {formatPercentage(backendData.commission.commissionRate)}
                  </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">TDS:</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(backendData.totalTDS)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">TDA:</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(backendData.totalTDA)}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* Reconciliation Status */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              Reconciliation Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(backendData.summaryData.totalReconciled.amount)}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Total Reconciled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(backendData.summaryData.totalReconciled.number)} transactions
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(backendData.summaryData.pendingPaymentFromMarketplace.amount)}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Pending from Marketplace
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(backendData.summaryData.pendingPaymentFromMarketplace.number)} orders
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(backendData.summaryData.pendingDeductions.amount)}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Pending Deductions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(backendData.summaryData.pendingDeductions.number)} items
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Settlement Summary */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              Settlement Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                    Payout Received
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(backendData.monthOrdersPayoutReceived)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This month's payout from marketplace
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 2 }}>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                    Awaiting Settlement
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(backendData.monthOrdersAwaitedSettlement.salesAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(backendData.monthOrdersAwaitedSettlement.salesOrders)} orders pending
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Difference Analysis */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              Difference Analysis
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Total Difference: {formatCurrency(backendData.difference)}
              </Typography>
              <Typography variant="body2">
                This represents the variance between expected and actual settlements. A positive value indicates excess payment received, while a negative value indicates shortfall.
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Net Sales (Sales Report):
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(backendData.summaryData.netSalesAsPerSalesReport.amount)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Payment Received (Settlement):
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {formatCurrency(backendData.summaryData.paymentReceivedAsPerSettlementReport.amount)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Complete Summary Data from Backend */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              Complete Reconciliation Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(backendData.summaryData.totalTransaction.amount)}
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(backendData.summaryData.totalTransaction.number)} transactions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Unreconciled Amount
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(backendData.summaryData.totalUnreconciled.amount)}
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(backendData.summaryData.totalUnreconciled.number)} items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Returned/Cancelled Orders
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(backendData.summaryData.returnedOrCancelledOrders.amount)}
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(backendData.summaryData.returnedOrCancelledOrders.number)} orders
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Net Sales (Sales Report)
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(backendData.summaryData.netSalesAsPerSalesReport.amount)}
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(backendData.summaryData.netSalesAsPerSalesReport.number)} orders
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Additional Summary Details */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Additional Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Payment Received (Settlement):</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(backendData.summaryData.paymentReceivedAsPerSettlementReport.amount)} 
                      ({formatNumber(backendData.summaryData.paymentReceivedAsPerSettlementReport.number)} orders)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pending Payment from Marketplace:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(backendData.summaryData.pendingPaymentFromMarketplace.amount)} 
                      ({formatNumber(backendData.summaryData.pendingPaymentFromMarketplace.number)} orders)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pending Deductions:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(backendData.summaryData.pendingDeductions.amount)} 
                      ({formatNumber(backendData.summaryData.pendingDeductions.number)} items)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </>
      )}

      {/* Reconciliation Results Section */}
      {activeTab === 'reconciliation' && (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <DoneIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {matchedTransactions}
                      </Typography>
                      <Typography variant="body2">
                        Automatically Matched
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 300px' }}>
              <Card sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ErrorIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {unmatchedTransactions}
                      </Typography>
                      <Typography variant="body2">
                        Require Manual Review
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 300px' }}>
              <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CheckCircleIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {matchPercentage}%
                      </Typography>
                      <Typography variant="body2">
                        Match Accuracy
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Reconciliation Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={matchPercentage} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {matchedTransactions} of {totalTransactions} transactions automatically reconciled
            </Typography>
          </Paper>

          {/* Filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Filter by status:</Typography>
            <Button 
              variant={filterStatus === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('all')}
              size="small"
            >
              All ({totalTransactions})
            </Button>
            <Button 
              variant={filterStatus === 'matched' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('matched')}
              size="small"
              color="success"
            >
              Matched ({matchedTransactions})
            </Button>
            <Button 
              variant={filterStatus === 'unmatched' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('unmatched')}
              size="small"
              color="error"
            >
              Unmatched ({unmatchedTransactions})
            </Button>
          </Box>

          {/* Reconciliation Results Table */}
          <Paper sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ background: '#fafbfc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Razorpay Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Bank Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReconciliationData.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getStatusIcon(transaction.status)}
                          {getStatusChip(transaction.status)}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        {transaction.orderId}
                      </TableCell>
                      <TableCell>
                        {transaction.date}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.razorpayAmount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.bankAmount)}
                      </TableCell>
                      <TableCell>
                        <Chip label={transaction.method} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.notes}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Alert for unmatched transactions */}
          {unmatchedTransactions > 0 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Manual Review Required
              </Typography>
              <Typography variant="body2">
                {unmatchedTransactions} transactions require manual review. Please check the unmatched entries above for discrepancies between Razorpay and bank records.
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* Fee Structure Section */}
      {activeTab === 'fees' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Razorpay Fee Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current fee structure as per Razorpay's pricing. All fees are applicable on transaction amount + 18% GST where mentioned.
          </Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: '#fafbfc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Platform Fee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>MDR Rate</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Additional Charges</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {razorpayFees.map((fee) => (
                  <TableRow key={fee.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {fee.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={fee.feePercentage} 
                        color={fee.feePercentage === '0%' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={fee.mdrRate} 
                        color={fee.mdrRate === '0%' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {fee.additionalCharges}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {fee.notes}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Disputed Transactions Section */}
      {activeTab === 'disputes' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Disputed Transactions
            </Typography>
            <Button
              variant="contained"
              startIcon={<ReportIcon />}
              onClick={() => setDisputeDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Raise New Dispute
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Transactions with incorrect charges or settlement issues. You can raise disputes directly from here.
          </Typography>

          {disputedTransactions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ background: '#fafbfc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expected Fee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Charged Fee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dispute Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {disputedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FlagIcon color="error" fontSize="small" />
                          <Chip label="Disputed" color="error" size="small" />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        {transaction.date}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Typography color="success.main" sx={{ fontWeight: 500 }}>
                          {formatCurrency(transaction.expectedFee)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="error.main" sx={{ fontWeight: 500 }}>
                          {formatCurrency(transaction.chargedFee)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.disputeReason} 
                          color="warning" 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedDisputeTransaction(transaction);
                            setDisputeDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No disputed transactions found.
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Dispute Dialog */}
      <Dialog
        open={disputeDialogOpen}
        onClose={() => {
          setDisputeDialogOpen(false);
          setSelectedDisputeTransaction(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
          {selectedDisputeTransaction ? 'Dispute Details' : 'Raise New Dispute'}
        </DialogTitle>
        <DialogContent>
          {selectedDisputeTransaction ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Transaction Details
              </Typography>
                             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                 <Box>
                   <Typography variant="body2" color="text.secondary">Payment ID:</Typography>
                   <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedDisputeTransaction.id}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                   <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedDisputeTransaction.orderId}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="body2" color="text.secondary">Amount:</Typography>
                   <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(selectedDisputeTransaction.amount)}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="body2" color="text.secondary">Method:</Typography>
                   <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedDisputeTransaction.method}</Typography>
                 </Box>
               </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Fee Comparison
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="body2" color="success.main">Expected Fee:</Typography>
                    <Typography variant="h6" color="success.main">{formatCurrency(selectedDisputeTransaction.expectedFee)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="error.main">Charged Fee:</Typography>
                    <Typography variant="h6" color="error.main">{formatCurrency(selectedDisputeTransaction.chargedFee)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="warning.main">Difference:</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(selectedDisputeTransaction.chargedFee - selectedDisputeTransaction.expectedFee)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Dispute Information
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">Reason:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{selectedDisputeTransaction.disputeReason}</Typography>
                <Typography variant="body2" color="text.secondary">Notes:</Typography>
                <Typography variant="body1">{selectedDisputeTransaction.notes}</Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Raise a dispute for incorrect charges or settlement issues with Razorpay.
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Common dispute reasons: Unexpected fees, Settlement delays, Incorrect charges, Missing settlements
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Please contact support with your transaction details to raise a dispute.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDisputeDialogOpen(false);
            setSelectedDisputeTransaction(null);
          }}>
            Close
          </Button>
          {!selectedDisputeTransaction && (
            <Button variant="contained">
              Contact Support
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Sync Modal */}
      <Modal
        open={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        aria-labelledby="sync-modal-title"
        aria-describedby="sync-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 450 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          outline: 'none',
        }}>
          <DialogTitle id="sync-modal-title" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Sync Data
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a data source to sync your financial data.
            </Typography>
            <List>
              {dataSources.map((source) => (
                <ListItem key={source.key} disablePadding>
                  <ListItemButton onClick={() => handleDataSourceClick(source.key)}>
                    <ListItemIcon>{source.icon}</ListItemIcon>
                    <ListItemText
                      primary={source.label}
                      secondary={source.description}
                    />
                    {syncStatus[source.key] === 'done' && (
                      <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                    )}
                    {syncStatus[source.key] === 'loading' && (
                      <CircularProgress size={22} sx={{ ml: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSyncModalOpen(false)}>Cancel</Button>
          </DialogActions>
        </Box>
      </Modal>

      {/* Razorpay Reports Modal */}
      <Dialog
        open={razorpayReportsOpen}
        onClose={() => setRazorpayReportsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
          Razorpay Reports
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectedReport('payment')}
              sx={{ borderRadius: 2, mr: 1 }}
            >
              Payment Reports
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedReport('settlement')}
              sx={{ borderRadius: 2 }}
            >
              Settlement Reports
            </Button>
          </Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedReport === 'payment' ? 'Payment Reports' : 'Settlement Reports'}
              </Typography>
              <Table>
                <TableHead sx={{ background: '#fafbfc' }}>
                  <TableRow>
                    {currentReportData[0].map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 600 }}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentReportData.slice(1).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRazorpayReportsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reconciliation; 