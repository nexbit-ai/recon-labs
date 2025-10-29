import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Card,
  CardContent,
  Slide,
  Fade,
  Tooltip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  OutlinedInput,
  Popover,
  Menu,
  Portal,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Autocomplete,
} from '@mui/material';
import ColumnFilterControls from '../components/ColumnFilterControls';
import { api } from '../services/api';
import { apiService } from '../services/api/apiService';
import { API_CONFIG } from '../services/api/config';
import { OrdersResponse, OrderItem, MarketplaceReconciliationResponse, TotalTransactionsResponse, TransactionRow as ApiTransactionRow, TransactionColumn } from '../services/api/types';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  UnfoldMore as UnfoldMoreIcon,
  InfoOutlined,
} from '@mui/icons-material';


// Type definitions for transaction data based on actual API response
interface TransactionRow {
  "Order ID"?: string;
  "Order Item ID"?: string;
  "Order Value": number;
  "Settlement Value": number;
  "Invoice Date": string;
  "Settlement Date": string;
  "Difference": number;
  "Remark": string;
  "Event Type": string;
  // Preserve original API response data for popup access
  originalData?: TransactionApiResponse;
  // Store recon_status and event_type directly for Status column rendering
  recon_status?: string;
  event_type?: string;
  event_subtype?: string;
}

// API Response structure based on actual data
interface TransactionApiResponse {
  order_id: string;
  order_value: number;
  settlement_amount: number;
  invoice_date: string;
  settlement_date: string;
  diff: number;
  platform: string;
  event_type: string;
  event_subtype: string;
  recon_status: string;
  settlement_provider: string;
  metadata?: {
    breakups?: {
      marketplace_fee: number;
      taxes: number;
      tcs: number;
      tds: number;
    };
  };
}

interface TransactionData {
  columns: string[];
  rows: TransactionRow[];
}

// API Response metadata types
interface TransactionMetadata {
  counts: {
    more_payment_received: number;
    settlement_matched: number;
    settled: number
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
  status?: string;
  status_in?: string;
  order_date_from?: string;
  order_date_to?: string;
  invoice_date_from?: string;
  invoice_date_to?: string;
  diff_min?: number;
  diff_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  order_id?: string;
  remark?: string;
  platform?: string;
  // Dynamic parameters for any column filtering
  [key: string]: any;
}

// Transform API data to TransactionRow format
const transformOrderItemToTransactionRow = (orderItem: any): TransactionRow => {
  // Debug logging to see what we're getting from the API
  console.log('OrderItem from API:', orderItem);
  console.log('Available fields in OrderItem:', Object.keys(orderItem));
  
  // Helper function to parse numeric values
  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // If already a number, return it
    if (typeof value === 'number') {
      return value;
    }
    
    // Convert to string and clean it
    const cleanedValue = String(value)
      .replace(/[₹$,\s]/g, '') // Remove currency symbols, commas, and spaces
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus signs
      .trim();
    
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Extract values from the new API structure
  const orderValue = parseNumericValue(orderItem.order_value);
  const settlementValue = parseNumericValue(orderItem.settlement_amount); // Changed from settlement_value to settlement_amount
  const difference = parseNumericValue(orderItem.diff);
  
  console.log('Parsed values - orderValue:', orderValue, 'settlementValue:', settlementValue, 'difference:', difference);
  
  // Determine remark based on recon_status
  let remark = "Unsettled";
  const reconStatus = orderItem.recon_status;
  if (reconStatus === "settlement_matched") {
    remark = "Settlement Matched";
  } else if (reconStatus === "less_payment_received") {
    remark = "Less Payment Received";
  } else if (reconStatus === "more_payment_received") {
    remark = "More Payment Received";
  }
  
  // Determine settlement date from API response
  let settlementDate = "";
  if (orderItem.settlement_date && orderItem.settlement_date.trim() !== '') {
    try {
      settlementDate = new Date(orderItem.settlement_date).toISOString().split('T')[0];
    } catch (error) {
      settlementDate = "Pending";
    }
  } else {
    settlementDate = "Pending";
  }
  
  // Determine IDs from API response
  const backendOrderId: string | undefined = orderItem.order_id;
  
  // Get invoice date
  let invoiceDate = "";
  if (orderItem.invoice_date) {
    try {
      invoiceDate = new Date(orderItem.invoice_date).toISOString().split('T')[0];
    } catch (error) {
      invoiceDate = orderItem.invoice_date;
    }
  }
  
  return {
    "Order ID": backendOrderId || `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    "Order Item ID": undefined,
    "Order Value": orderValue,
    "Settlement Value": settlementValue,
    "Invoice Date": invoiceDate,
    "Settlement Date": settlementDate,
    "Difference": difference,
    "Remark": remark,
    // Use event_type from API response
    "Event Type": orderItem.event_type || "Sale",
    // Preserve the original API response data for popup access
    originalData: orderItem as TransactionApiResponse,
    // Store recon_status and event_type directly for Status column rendering
    recon_status: orderItem.recon_status,
    event_type: orderItem.event_type,
    event_subtype: orderItem.event_subtype,
  };
};

// Mock data with new structure as per requirements
const mockTransactionData: TransactionData = {
  columns: [
    "Order Item ID",
    "Order Value",
    "Settlement Value",
    "Invoice Date",
    "Settlement Date",
    "Difference",
    "Remark",
    "Event Type"
  ],
  rows: [
    // Settled Transactions (25 entries)
    {
      "Order Item ID": "FK12345",
      "Order Value": 1200,
      "Settlement Value": 1200,
      "Invoice Date": "2025-01-15",
      "Settlement Date": "2025-01-20",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12346",
      "Order Value": 850,
      "Settlement Value": 850,
      "Invoice Date": "2025-01-16",
      "Settlement Date": "2025-01-21",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12347",
      "Order Value": 2100,
      "Settlement Value": 2100,
      "Invoice Date": "2025-01-17",
      "Settlement Date": "2025-01-22",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12349",
      "Order Value": 1600,
      "Settlement Value": 1600,
      "Invoice Date": "2025-01-19",
      "Settlement Date": "2025-01-24",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12350",
      "Order Value": 950,
      "Settlement Value": 950,
      "Invoice Date": "2025-01-20",
      "Settlement Date": "2025-01-25",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12351",
      "Order Value": 1800,
      "Settlement Value": 1800,
      "Invoice Date": "2025-01-21",
      "Settlement Date": "2025-01-26",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12352",
      "Order Value": 1350,
      "Settlement Value": 1350,
      "Invoice Date": "2025-01-22",
      "Settlement Date": "2025-01-27",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12353",
      "Order Value": 2200,
      "Settlement Value": 2200,
      "Invoice Date": "2025-01-23",
      "Settlement Date": "2025-01-28",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12354",
      "Order Value": 1100,
      "Settlement Value": 1100,
      "Invoice Date": "2025-01-24",
      "Settlement Date": "2025-01-29",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12355",
      "Order Value": 1700,
      "Settlement Value": 1700,
      "Invoice Date": "2025-01-25",
      "Settlement Date": "2025-01-30",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12356",
      "Order Value": 1400,
      "Settlement Value": 1400,
      "Invoice Date": "2025-01-26",
      "Settlement Date": "2025-02-01",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12357",
      "Order Value": 1900,
      "Settlement Value": 1900,
      "Invoice Date": "2025-01-27",
      "Settlement Date": "2025-02-02",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12358",
      "Order Value": 1250,
      "Settlement Value": 1250,
      "Invoice Date": "2025-01-28",
      "Settlement Date": "2025-02-03",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12359",
      "Order Value": 2300,
      "Settlement Value": 2300,
      "Invoice Date": "2025-01-29",
      "Settlement Date": "2025-02-04",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12360",
      "Order Value": 1000,
      "Settlement Value": 1000,
      "Invoice Date": "2025-01-30",
      "Settlement Date": "2025-02-05",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12361",
      "Order Value": 1550,
      "Settlement Value": 1550,
      "Invoice Date": "2025-02-01",
      "Settlement Date": "2025-02-06",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12362",
      "Order Value": 2000,
      "Settlement Value": 2000,
      "Invoice Date": "2025-02-02",
      "Settlement Date": "2025-02-07",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12363",
      "Order Value": 1150,
      "Settlement Value": 1150,
      "Invoice Date": "2025-02-03",
      "Settlement Date": "2025-02-08",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12364",
      "Order Value": 1750,
      "Settlement Value": 1750,
      "Invoice Date": "2025-02-04",
      "Settlement Date": "2025-02-09",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12365",
      "Order Value": 1300,
      "Settlement Value": 1300,
      "Invoice Date": "2025-02-05",
      "Settlement Date": "2025-02-10",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12366",
      "Order Value": 1850,
      "Settlement Value": 1850,
      "Invoice Date": "2025-02-06",
      "Settlement Date": "2025-02-11",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12367",
      "Order Value": 1450,
      "Settlement Value": 1450,
      "Invoice Date": "2025-02-07",
      "Settlement Date": "2025-02-12",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12368",
      "Order Value": 1950,
      "Settlement Value": 1950,
      "Invoice Date": "2025-02-08",
      "Settlement Date": "2025-02-13",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12369",
      "Order Value": 1200,
      "Settlement Value": 1200,
      "Invoice Date": "2025-02-09",
      "Settlement Date": "2025-02-14",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    // Settled Transactions with Discrepancies (10 entries)
    {
      "Order Item ID": "FK12348",
      "Order Value": 750,
      "Settlement Value": 750,
      "Invoice Date": "2025-01-18",
      "Settlement Date": "2025-01-23",
      "Difference": -50,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12370",
      "Order Value": 800,
      "Settlement Value": 800,
      "Invoice Date": "2025-02-10",
      "Settlement Date": "2025-02-15",
      "Difference": 25,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12371",
      "Order Value": 650,
      "Settlement Value": 650,
      "Invoice Date": "2025-02-11",
      "Settlement Date": "2025-02-16",
      "Difference": -30,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12372",
      "Order Value": 900,
      "Settlement Value": 900,
      "Invoice Date": "2025-02-12",
      "Settlement Date": "2025-02-17",
      "Difference": 45,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12373",
      "Order Value": 550,
      "Settlement Value": 550,
      "Invoice Date": "2025-02-13",
      "Settlement Date": "2025-02-18",
      "Difference": -20,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12374",
      "Order Value": 700,
      "Settlement Value": 700,
      "Invoice Date": "2025-02-14",
      "Settlement Date": "2025-02-19",
      "Difference": 35,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12375",
      "Order Value": 450,
      "Settlement Value": 450,
      "Invoice Date": "2025-02-15",
      "Settlement Date": "2025-02-20",
      "Difference": -15,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12376",
      "Order Value": 600,
      "Settlement Value": 600,
      "Invoice Date": "2025-02-16",
      "Settlement Date": "2025-02-21",
      "Difference": 40,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12377",
      "Order Value": 850,
      "Settlement Value": 850,
      "Invoice Date": "2025-02-17",
      "Settlement Date": "2025-02-22",
      "Difference": -25,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12378",
      "Order Value": 500,
      "Settlement Value": 500,
      "Invoice Date": "2025-02-18",
      "Settlement Date": "2025-02-23",
      "Difference": 30,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    // Unsettled Transactions (15 entries)
    {
      "Order Item ID": "FK12379",
      "Order Value": 750,
      "Settlement Value": 750,
      "Invoice Date": "2025-02-19",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12380",
      "Order Value": 400,
      "Settlement Value": 400,
      "Invoice Date": "2025-02-20",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12381",
      "Order Value": 650,
      "Settlement Value": 650,
      "Invoice Date": "2025-02-21",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12382",
      "Order Value": 900,
      "Settlement Value": 900,
      "Invoice Date": "2025-02-22",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12383",
      "Order Value": 550,
      "Settlement Value": 550,
      "Invoice Date": "2025-02-23",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12384",
      "Order Value": 800,
      "Settlement Value": 800,
      "Invoice Date": "2025-02-24",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12385",
      "Order Value": 700,
      "Settlement Value": 700,
      "Invoice Date": "2025-02-25",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12386",
      "Order Value": 600,
      "Settlement Value": 600,
      "Invoice Date": "2025-02-26",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12387",
      "Order Value": 850,
      "Settlement Value": 850,
      "Invoice Date": "2025-02-27",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12388",
      "Order Value": 500,
      "Settlement Value": 500,
      "Invoice Date": "2025-02-28",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12389",
      "Order Value": 750,
      "Settlement Value": 750,
      "Invoice Date": "2025-03-01",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12390",
      "Order Value": 650,
      "Settlement Value": 650,
      "Invoice Date": "2025-03-02",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12391",
      "Order Value": 900,
      "Settlement Value": 900,
      "Invoice Date": "2025-03-03",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12392",
      "Order Value": 550,
      "Settlement Value": 550,
      "Invoice Date": "2025-03-04",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12393",
      "Order Value": 800,
      "Settlement Value": 800,
      "Invoice Date": "2025-03-05",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12394",
      "Order Value": 700,
      "Settlement Value": 700,
      "Invoice Date": "2025-03-06",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12395",
      "Order Value": 600,
      "Settlement Value": 600,
      "Invoice Date": "2025-03-07",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12396",
      "Order Value": 850,
      "Settlement Value": 850,
      "Invoice Date": "2025-03-08",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12397",
      "Order Value": 500,
      "Settlement Value": 500,
      "Invoice Date": "2025-03-09",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12398",
      "Order Value": 750,
      "Settlement Value": 750,
      "Invoice Date": "2025-03-10",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    }
  ]
};

// Transaction Details Popup Component
const TransactionDetailsPopup: React.FC<{ 
  transaction: TransactionRow | null; 
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  anchorEl: HTMLElement | null;
}> = ({ transaction, onClose, formatCurrency, formatDate, anchorEl }) => {
  const [formulaAnchorEl, setFormulaAnchorEl] = useState<HTMLElement | null>(null);
  
  if (!transaction || !anchorEl) return null;

  // Extract calculation data from the transaction
  // Access the preserved original API response data
  const originalData = (transaction as any)?.originalData || {};
  
  // Debug logging to see what data we have
  console.log('Transaction for popup:', transaction);
  console.log('Original API data:', originalData);
  console.log('Available fields in originalData:', Object.keys(originalData));
  
  // Get values from the actual API response structure
  const orderValue = transaction["Order Value"] || 0;

  // Extract values from calculation.inputs
  const calculationInputs = originalData.calculation?.inputs || {};
  const context = originalData.context || {};
  
  // Map the exact fields from the API response
  const collectionReceived = parseFloat(calculationInputs.settlement_value || 0);
  const marketplaceFee = parseFloat(calculationInputs.marketplace_fee || 0);
  const taxes = parseFloat(calculationInputs.taxes || 0);
  const totalOfferAmount = parseFloat(calculationInputs.total_offer_amount || 0);
  const sellerShareOffer = parseFloat(calculationInputs.seller_share_offer || 0);
  const offerAdjustments = parseFloat(calculationInputs.offer_adjustments || 0);
  const customerAddonsAmount = parseFloat(calculationInputs.customer_addons_amount || 0);
  const refund = parseFloat(calculationInputs.refund || 0);
  const reverse = parseFloat(calculationInputs.reverse || 0);
  
  // Extract from context
  const tdsDeducted = parseFloat(context.tds || 0);
  const tcsDeducted = parseFloat(context.tds || 0);
  
  const difference = parseFloat(originalData.diff || 0);
  const status = transaction["Remark"] || "Nan";
  
  // Debug logging for individual field values
  console.log('Field values extracted:');
  console.log('- Collection Received:', {
    settlement_value: calculationInputs.settlement_value,
    final: collectionReceived
  });
  console.log('- Marketplace Fee:', {
    marketplace_fee: calculationInputs.marketplace_fee,
    final: marketplaceFee
  });
  console.log('- Taxes:', {
    taxes: calculationInputs.taxes,
    final: taxes
  });
  console.log('- Total Offer Amount:', {
    total_offer_amount: calculationInputs.total_offer_amount,
    final: totalOfferAmount
  });
  console.log('- Seller Share Offer:', {
    seller_share_offer: calculationInputs.seller_share_offer,
    final: sellerShareOffer
  });
  console.log('- TDS Deducted:', {
    tds: context.tds,
    final: tdsDeducted
  });
  console.log('- TCS Deducted:', {
    tcs: context.tcs,
    final: tcsDeducted
  });
  console.log('- Difference:', {
    diff: originalData.diff,
    final: difference
  });

  // Calculate smart positioning
  const getPopupPosition = () => {
    const rect = anchorEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 280; // Much smaller height for compact popup
    const popupWidth = 320;
    const offset = 12;

    // Calculate vertical position with better viewport awareness
    let top: number;
    let animationDirection: 'up' | 'down' = 'down';
    let maxHeight: number | undefined;
    
    // Check available space above and below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow >= popupHeight + offset) {
      // Enough space below - show below
      top = rect.bottom + offset;
      animationDirection = 'down';
    } else if (spaceAbove >= popupHeight + offset) {
      // Enough space above - show above
      top = rect.top - popupHeight - offset;
      animationDirection = 'up';
    } else {
      // Not enough space either way - find optimal position
      if (spaceBelow > spaceAbove) {
        // More space below - position at bottom with scroll
        top = Math.max(offset, viewportHeight - popupHeight - offset);
        maxHeight = popupHeight;
        animationDirection = 'down';
      } else {
        // More space above - position at top with scroll
        top = offset;
        maxHeight = popupHeight;
        animationDirection = 'up';
      }
    }

    // Ensure minimum height for scrollable content
    if (maxHeight && maxHeight < 300) {
      maxHeight = 300;
    }

    // Calculate horizontal position
    let left: number;
    if (rect.left + popupWidth <= viewportWidth) {
      // Enough space to the right - align with left edge
      left = rect.left;
    } else {
      // Not enough space - align with right edge
      left = Math.max(offset, viewportWidth - popupWidth - offset);
    }

    // Final validation: ensure popup is always within viewport bounds
    if (top < offset) {
      top = offset;
      maxHeight = Math.min(popupHeight, viewportHeight - offset * 2);
    }
    if (top + (maxHeight || popupHeight) > viewportHeight - offset) {
      top = Math.max(offset, viewportHeight - (maxHeight || popupHeight) - offset);
    }

    // Ensure horizontal position is also within viewport
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
        onClick={onClose}
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
            '0%': {
              opacity: 0,
            },
            '100%': {
              opacity: 1,
            },
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
          width: '320px',
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
            '0%': {
              opacity: 0,
              transform: 'scale(0.95) translateY(-10px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
          '@keyframes fadeInScaleUp': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95) translateY(10px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
      {/* Header */}
      <Box sx={{ 
        p: 1.5, 
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box>
          <Typography variant="body2" sx={{ 
            fontWeight: 700, 
            color: '#111827',
            mb: 0.5,
            fontSize: '0.9rem',
          }}>
            Transaction Details
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
            Order ID: {transaction["Order ID"] || transaction["Order Item ID"]}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            background: '#f3f4f6',
            color: '#374151',
            p: 0.5,
            '&:hover': {
              background: '#e5e7eb',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ 
        p: 1.5, 
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f5f9',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '2px',
          '&:hover': {
            background: '#94a3b8',
          },
        },
      }}>
        {/* Order Value - Primary Information */}
        <Box sx={{ 
          p: 1.5, 
          background: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          mb: 1.5,
        }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
            ORDER VALUE
          </Typography>
          <Typography variant="body1" sx={{ 
            fontWeight: 800, 
            color: orderValue < 0 ? '#dc2626' : '#0f172a',
            mt: 0.25,
            fontSize: '1rem',
          }}>
            {formatCurrency(orderValue)}
          </Typography>
        </Box>

        {/* Transaction Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
              Collection Received
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(collectionReceived)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            Marketplace Fee
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(marketplaceFee)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            Taxes
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(taxes)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            TDS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(tdsDeducted)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            TCS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(tcsDeducted)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            Total Offer Amount
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(totalOfferAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            Seller Share Offer
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(sellerShareOffer)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            Offer Adjustments
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(offerAdjustments)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
            Customer Addons Amount
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(customerAddonsAmount)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
              Refund
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(refund)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
              Reverse
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>
              {formatCurrency(reverse)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
                Difference
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Info icon clicked!');
                  console.log('Current formulaAnchorEl:', formulaAnchorEl);
                  console.log('Setting new anchor:', e.currentTarget);
                  setFormulaAnchorEl(e.currentTarget);
                  console.log('After setting - formulaAnchorEl:', e.currentTarget);
                }}
                sx={{
                  p: 0,
                  color: '#64748b',
                  '&:hover': {
                    color: '#0f172a',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <InfoIcon sx={{ fontSize: '0.8rem' }} />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: difference === 0 ? '#059669' : '#dc2626',
              fontSize: '0.75rem'
            }}>
              {formatCurrency(difference)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
              Status
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: status === 'Settlement Matched' ? '#059669' : '#dc2626',
              fontSize: '0.75rem'
            }}>
              {status}
            </Typography>
          </Box>
        </Box>
        
        {/* Formula Popover */}
        <Popover
          open={Boolean(formulaAnchorEl)}
          anchorEl={formulaAnchorEl}
          onClose={() => {
            console.log('Closing formula popover');
            setFormulaAnchorEl(null);
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            zIndex: 9999,
          }}
        >
          <Box sx={{ p: 2, maxWidth: '300px', bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', mb: 1, fontSize: '0.7rem' }}>
              Formula
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.6rem', lineHeight: 1.5 }}>
              abs(buyer_invoice_amount) + marketplace_fee + taxes + customer_addons_amount + total_offer_amount + seller_share_offer + offer_adjustments + refund + reverse - settlement_value
            </Typography>
          </Box>
        </Popover>
      </Box>
    </Box>
    </>
  );
};

// Breakups Modal Component
const BreakupsModal: React.FC<{ 
  open: boolean;
  onClose: () => void;
  breakups: any; // This is now the full row
  orderId: string;
  anchorEl: HTMLElement | null;
}> = ({ open, onClose, breakups, orderId, anchorEl }) => {
  if (!open || !breakups || !anchorEl) return null;

  // Extract the breakups object from metadata
  // The metadata.breakups is directly on the row object
  const breakupsObj = (breakups as any)?.metadata?.breakups;
  if (!breakupsObj) return null;

  // Convert snake_case keys to readable format: remove underscores and capitalize first letter
  const formatKey = (key: string) => {
    return key.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Extract main values from the row
  // The row object has the data directly at the top level
  const orderValue = (breakups as any)?.order_value || 0;
  const settlementValue = (breakups as any)?.settlement_amount || 0;
  const diff = (breakups as any)?.diff || 0;

  // Get entries from breakups object
  const breakupsData = Object.entries(breakupsObj).map(([key, value]) => ({
    label: formatKey(key),
    value: Number(value) || 0
  }));

  // Calculate smart positioning similar to TransactionDetailsPopup
  const getPopupPosition = () => {
    const rect = anchorEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 400; // Height for breakups popup
    const popupWidth = 400;
    const offset = 12;

    // Calculate vertical position with better viewport awareness
    let top: number;
    let animationDirection: 'up' | 'down' = 'down';
    let maxHeight: number | undefined;
    
    // Check available space above and below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow >= popupHeight + offset) {
      // Enough space below - show below
      top = rect.bottom + offset;
      animationDirection = 'down';
    } else if (spaceAbove >= popupHeight + offset) {
      // Enough space above - show above
      top = rect.top - popupHeight - offset;
      animationDirection = 'up';
    } else {
      // Not enough space either way - find optimal position
      if (spaceBelow > spaceAbove) {
        // More space below - position at bottom with scroll
        top = Math.max(offset, viewportHeight - popupHeight - offset);
        maxHeight = popupHeight;
        animationDirection = 'down';
      } else {
        // More space above - position at top with scroll
        top = offset;
        maxHeight = popupHeight;
        animationDirection = 'up';
      }
    }

    // Ensure minimum height for scrollable content
    if (maxHeight && maxHeight < 300) {
      maxHeight = 300;
    }

    // Calculate horizontal position
    let left: number;
    if (rect.left + popupWidth <= viewportWidth) {
      // Enough space to the right - align with left edge
      left = rect.left;
    } else {
      // Not enough space - align with right edge
      left = Math.max(offset, viewportWidth - popupWidth - offset);
    }

    // Final validation: ensure popup is always within viewport bounds
    if (top < offset) {
      top = offset;
      maxHeight = Math.min(popupHeight, viewportHeight - offset * 2);
    }
    if (top + (maxHeight || popupHeight) > viewportHeight - offset) {
      top = Math.max(offset, viewportHeight - (maxHeight || popupHeight) - offset);
    }

    // Ensure horizontal position is also within viewport
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
        onClick={onClose}
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
            '0%': {
              opacity: 0,
            },
            '100%': {
              opacity: 1,
            },
          },
        }}
      />
      
      {/* Popup */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: '400px',
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
            '0%': {
              opacity: 0,
              transform: 'scale(0.95) translateY(-10px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
          '@keyframes fadeInScaleUp': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95) translateY(10px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
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
              Transaction Breakups
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Order ID: {orderId}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              p: 0.5,
              '&:hover': {
                background: '#f3f4f6',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, maxHeight: position.maxHeight ? `${position.maxHeight - 80}px` : '300px', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#0c4a6e',
                  fontSize: '0.875rem',
                }}
              >
                Order Value
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#0c4a6e',
                  fontSize: '0.875rem',
                }}
              >
                {formatCurrency(orderValue)}
              </Typography>
            </Box>

            {/* Breakups */}
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
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#374151',
                    fontSize: '0.75rem',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: '0.75rem',
                  }}
                >
                  {formatCurrency(item.value)}
                </Typography>
              </Box>
            ))}

            {/* Divider */}
            <Box sx={{ borderTop: '2px solid #e5e7eb', my: 1 }} />

            {/* Settlement Value (Negative) */}
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
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#991b1b',
                  fontSize: '0.75rem',
                }}
              >
                Settlement Value
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#991b1b',
                  fontSize: '0.75rem',
                }}
              >
                {formatCurrency(-settlementValue)}
              </Typography>
            </Box>

            {/* Divider */}
            <Box sx={{ borderTop: '2px solid #e5e7eb', my: 1 }} />

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
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: diff === 0 ? '#166534' : '#991b1b',
                  fontSize: '0.875rem',
                }}
              >
                Difference
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: diff === 0 ? '#166534' : '#991b1b',
                  fontSize: '0.875rem',
                }}
              >
                {formatCurrency(diff)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

interface TransactionSheetProps {
  onBack: () => void;
  open?: boolean;
  transaction?: any;
  statsData?: MarketplaceReconciliationResponse | null;
  initialTab?: number;
  dateRange?: { start: string; end: string };
  initialPlatforms?: ('flipkart' | 'd2c')[];
}

// Complete mapping of UI columns to API parameters
const COLUMN_TO_API_PARAM_MAP: Record<string, {
  apiParam: string;
  type: 'string' | 'number' | 'date' | 'enum';
  supportedPlatforms?: ('flipkart' | 'd2c' | 'all')[];
  usesInSuffix?: boolean; // For CSV filters like status_in
}> = {
  // Common filters (both platforms)
  'Order ID': { apiParam: 'order_id', type: 'string' }, // Special: chips input
  'Status': { apiParam: 'status_in', type: 'enum', usesInSuffix: true },
  'Order Date': { apiParam: 'order_date', type: 'date' }, // → order_date_from/to
  'Settlement Date': { apiParam: 'settlement_date', type: 'date' },
  'Order Value': { apiParam: 'order_value', type: 'number', supportedPlatforms: ['flipkart'] },
  'Settlement Value': { apiParam: 'settlement_value', type: 'number' },
  'Difference': { apiParam: 'diff', type: 'number' },
  
  // D2C-specific CSV filters (with _in suffix support)
  'Settlement Provider': { apiParam: 'settlement_provider_in', type: 'enum', supportedPlatforms: ['d2c'] },
  'Recon Status': { apiParam: 'recon_status_in', type: 'enum', supportedPlatforms: ['d2c'] },
  'Shipping Courier': { apiParam: 'shipping_courier_in', type: 'enum', supportedPlatforms: ['d2c'] },
  'Mismatch Reason': { apiParam: 'mismatch_reason_in', type: 'enum', supportedPlatforms: ['d2c'] },
};

// Mapping of sortable UI columns to backend sort_by values
const COLUMN_TO_SORT_BY_MAP: Record<string, string> = {
  'Order Date': 'order_date',
  'Settlement Date': 'settlement_date',
  'Order Value': 'order_value',
  'Settlement Value': 'settlement_value',
  'Difference': 'diff',
  'Status': 'status',
};

const TransactionSheet: React.FC<TransactionSheetProps> = ({ onBack, open, transaction, statsData: propsStatsData, initialTab = 0, dateRange: propDateRange, initialPlatforms }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initialTab from navigation state or props
  const getInitialTab = () => {
    if (location.state?.initialTab !== undefined) {
      return location.state.initialTab;
    }
    return initialTab;
  };
  const [searchTerm, setSearchTerm] = useState('');
  // Use date range from props if provided, otherwise use empty state
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(
    propDateRange || { start: '', end: '' }
  );
  // Column filters can be string (contains), number range {min,max}, date range {from,to}, or enum string[]
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: any }>({});
  // Pending filters that haven't been applied yet
  const [pendingColumnFilters, setPendingColumnFilters] = useState<{ [key: string]: any }>({});
  const [pendingDateRange, setPendingDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  // Header date range state - for the date selector in the header next to platform selector
  const [headerDateRange, setHeaderDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [pendingHeaderDateRange, setPendingHeaderDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  // Platform filter state - now supports multi-select
  const availablePlatforms = ['flipkart', 'd2c'] as const;
  type Platform = typeof availablePlatforms[number];
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initialPlatforms || ['flipkart']); // Default: flipkart only
  const [pendingSelectedPlatforms, setPendingSelectedPlatforms] = useState<Platform[]>(initialPlatforms || ['flipkart']); // Pending platforms before apply
  // Order ID chips state
  const [orderIdChips, setOrderIdChips] = useState<string[]>([]);
  // Order ID search in header
  const [orderIdSearch, setOrderIdSearch] = useState<string>('');
  // Order ID search bar visibility
  const [showOrderIdSearch, setShowOrderIdSearch] = useState(false);
  const [filteredData, setFilteredData] = useState<TransactionRow[]>([]);
  const [allTransactionData, setAllTransactionData] = useState<TransactionRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = getInitialTab();
    return tab === 1 ? 1 : 0; // 0 = Settled, 1 = Unsettled
  });
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [breakupsModalOpen, setBreakupsModalOpen] = useState(false);
  const [selectedBreakups, setSelectedBreakups] = useState<any>(null);
  const [breakupsAnchorEl, setBreakupsAnchorEl] = useState<HTMLElement | null>(null);
  const [breakupsOrderId, setBreakupsOrderId] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  // Separate total counts for settled and unsettled tabs
  const [settledTotalCount, setSettledTotalCount] = useState<number | null>(null);
  const [unsettledTotalCount, setUnsettledTotalCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [tabCounts, setTabCounts] = useState<{ settled: number | null; unsettled: number | null }>({ settled: null, unsettled: null });
  const [metadata, setMetadata] = useState<TransactionMetadata | null>(null);
  
  // New state for total transactions API
  const [totalTransactionsData, setTotalTransactionsData] = useState<TotalTransactionsResponse | null>(null);
  const [useNewAPI, setUseNewAPI] = useState(true); // Always use new API

  // Dual API state management for settled and unsettled data
  const [settledData, setSettledData] = useState<TotalTransactionsResponse | null>(null);
  const [unsettledData, setUnsettledData] = useState<TotalTransactionsResponse | null>(null);
  const [dualApiLoading, setDualApiLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const isFetchingRef = React.useRef(false);

  // Get current data based on which API is being used
  const getCurrentData = (): any[] => {
    // Use dual API data if available (either can be null when filtering)
    if (settledData !== null || unsettledData !== null) {
      const currentData = activeTab === 0 ? settledData : unsettledData;
      // Handle case where currentData is null (e.g., only settled statuses selected and on unsettled tab)
      if (!currentData) {
        return [];
      }
      return currentData.data || [];
    }
    
    // Fallback to legacy single API data
    if (useNewAPI && totalTransactionsData) {
      // Handle null data case (0 results)
      return totalTransactionsData.data || [];
    }
    return allTransactionData;
  };

  // Get current columns based on which API is being used
  const getCurrentColumns = () => {
    // Use dual API data if available (either can be null when filtering)
    if (settledData !== null || unsettledData !== null) {
      const currentData = activeTab === 0 ? settledData : unsettledData;
      // Handle case where currentData is null (e.g., only settled statuses selected and on unsettled tab)
      if (!currentData) {
        return [];
      }
      return currentData.columns?.map(col => col.title) || [];
    }
    
    // Fallback to legacy single API data
    if (useNewAPI && totalTransactionsData) {
      // Handle null columns case - only return actual API columns, not breakup fields
      return totalTransactionsData.columns?.map(col => col.title) || [];
    }
    return visibleColumns;
  };


  // Rely on MUI Menu's built-in outside click handling
  
  // Dropdown menu state for Status column


  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Helper function to generate random date for demo purposes
  const generateRandomDate = () => {
    // Generate random dates between Jan 2025 and Feb 2025
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-02-28');
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);
    return randomDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  };

  // Helper function to format date in "17th March, 2025" format
  const formatDateWithOrdinal = (dateString: string) => {
    // If no date provided, generate a random one for demo
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      dateString = generateRandomDate();
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return formatDateWithOrdinal(dateString);
  };

  // Get dynamic column metadata from API response
  const getColumnMeta = (): Record<string, { type: 'string' | 'number' | 'date' | 'enum' }> => {
    const meta: Record<string, { type: 'string' | 'number' | 'date' | 'enum' }> = {};
    
    // Use dual API data if available (either can be null when filtering)
    if (settledData !== null || unsettledData !== null) {
      const currentData = activeTab === 0 ? settledData : unsettledData;
      if (currentData?.columns) {
        currentData.columns.forEach(col => {
          // Map API column types to our filter types
          let filterType: 'string' | 'number' | 'date' | 'enum';
          switch (col.type) {
            case 'currency':
              filterType = 'number';
              break;
            case 'date':
              filterType = 'date';
              break;
            case 'enum':
              filterType = 'enum';
              break;
            default:
              filterType = 'string';
          }
          meta[col.title] = { type: filterType };
        });
      }
    } else if (useNewAPI && totalTransactionsData?.columns) {
      totalTransactionsData.columns.forEach(col => {
        // Map API column types to our filter types
        let filterType: 'string' | 'number' | 'date' | 'enum';
        switch (col.type) {
          case 'currency':
            filterType = 'number';
            break;
          case 'date':
            filterType = 'date';
            break;
          case 'enum':
            filterType = 'enum';
            break;
          default:
            filterType = 'string';
        }
        meta[col.title] = { type: filterType };
      });
    } else {
      // Fallback to hardcoded metadata for backward compatibility
      meta['Order ID'] = { type: 'string' };
      meta['Order Value'] = { type: 'number' };
      meta['Settlement Value'] = { type: 'number' };
      meta['Settlement Date'] = { type: 'date' };
      meta['Difference'] = { type: 'number' };
      meta['Status'] = { type: 'enum' };
      meta['Reason'] = { type: 'string' };
    }
    
    // Always add breakup fields for filtering (regardless of API type)
    meta['Shipping Courier'] = { type: 'enum' };
    meta['Recon Status'] = { type: 'enum' };
    meta['Settlement Provider'] = { type: 'enum' };
    meta['Mismatch Reason'] = { type: 'enum' };
    
    console.log('[getColumnMeta] Final COLUMN_META keys:', Object.keys(meta));
    console.log('[getColumnMeta] Breakup fields included:', {
      'Shipping Courier': meta['Shipping Courier'],
      'Recon Status': meta['Recon Status'],
      'Settlement Provider': meta['Settlement Provider'],
      'Mismatch Reason': meta['Mismatch Reason']
    });
    
    return meta;
  };

  // Make COLUMN_META reactive to data changes - initialize with breakup fields
  const [COLUMN_META, setCOLUMN_META] = useState<Record<string, { type: 'string' | 'number' | 'date' | 'enum' }>>({
    'Shipping Courier': { type: 'enum' },
    'Recon Status': { type: 'enum' },
    'Settlement Provider': { type: 'enum' },
    'Mismatch Reason': { type: 'enum' },
  });

  // Update COLUMN_META when totalTransactionsData changes
  useEffect(() => {
    console.log('[DEBUG] totalTransactionsData changed:', totalTransactionsData);
    const newMeta = getColumnMeta();
    setCOLUMN_META(newMeta);
    console.log('[DEBUG] Updated COLUMN_META keys:', Object.keys(newMeta));
    console.log('[DEBUG] Breakup fields in COLUMN_META:', {
      'Shipping Courier': newMeta['Shipping Courier'],
      'Recon Status': newMeta['Recon Status'],
      'Settlement Provider': newMeta['Settlement Provider']
    });
  }, [totalTransactionsData, useNewAPI]);

  // Force update COLUMN_META on mount
  useEffect(() => {
    const initialMeta = getColumnMeta();
    setCOLUMN_META(initialMeta);
    console.log('[DEBUG] Initial COLUMN_META keys:', Object.keys(initialMeta));
  }, []);

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

    // Trigger server-side refetch with sorting (reset to first page)
    setPage(0);
    setCurrentPage(1);
    fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <UnfoldMoreIcon fontSize="small" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" /> 
      : <ArrowDownwardIcon fontSize="small" />;
  };

  const sortData = (data: TransactionRow[]) => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof TransactionRow];
      const bValue = b[sortConfig.key as keyof TransactionRow];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  // Helpers to get enum options from current data
  const getUniqueValuesForColumn = (columnName: string): string[] => {
    // For Status, show unique backend statuses
    if (columnName === 'Status') {
      return ['more_payment_received', 'less_payment_received', 'settlement_matched'];
    }

    // For breakup fields, extract values from actual data
    if (columnName === 'Shipping Courier' || columnName === 'Recon Status' || columnName === 'Settlement Provider' || columnName === 'Mismatch Reason') {
      const values = new Set<string>();
      const dataToCheck = [
        ...allTransactionData,
        ...(useNewAPI && totalTransactionsData?.data ? totalTransactionsData.data : [])
      ];
      
      dataToCheck.forEach(row => {
        let value: string | undefined;
        
        // Check in originalData first (new API structure has these at root level)
        const originalData = (row as any)?.originalData;
        
        switch (columnName) {
          case 'Shipping Courier':
            value = (row as any)?.shipping_courier || originalData?.shipping_courier;
            break;
          case 'Recon Status':
            value = (row as any)?.recon_status || originalData?.recon_status;
            break;
          case 'Settlement Provider':
            value = (row as any)?.settlement_provider || originalData?.settlement_provider;
            break;
          case 'Mismatch Reason':
            value = (row as any)?.mismatch_reason || originalData?.mismatch_reason;
            break;
        }
        
        if (typeof value === 'string' && value.trim()) {
          values.add(value.trim());
        }
      });
      
      // If no values found, return empty array
      return Array.from(values).sort();
    }

    // For other columns, try to get values from data
    const values = new Set<string>();
    const dataToCheck = [
      ...allTransactionData,
      ...(useNewAPI && totalTransactionsData?.data ? totalTransactionsData.data : [])
    ];
    
    dataToCheck.forEach(row => {
      const value = (row as any)[columnName];
      if (typeof value === 'string' && value) {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  // Helper: chip colors for remark values
  const getRemarkChipColors = (remark: string): { background: string; color: string } => {
    switch (remark) {
      case 'Settlement Matched':
        return { background: '#dcfce7', color: '#059669' };
      case 'Excess Amount Received':
        return { background: '#fef3c7', color: '#d97706' };
      case 'Short Amount Received':
        return { background: '#fee2e2', color: '#dc2626' };
      case 'Pending Settlement':
      return { background: '#e5e7eb', color: '#111111' };
      case 'Return Initiated':
        return { background: '#f3e8ff', color: '#7c3aed' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  // Helper: chip colors for event type
  const getEventTypeChipColors = (eventType: string): { background: string; color: string } => {
    if (eventType === 'Sale') return { background: '#dcfce7', color: '#059669' };
    return { background: '#fee2e2', color: '#dc2626' };
  };

  // Calculate count from stats data
  const getCountFromStats = () => {
    if (!propsStatsData) return 0;
    
    const ordersDelivered = parseInt(propsStatsData.ordersDelivered?.number?.toString() || '0');
    const ordersReturned = parseInt(propsStatsData.ordersReturned?.number?.toString() || '0');
    
    return ordersDelivered + ordersReturned;
  };

  // Calculate total from stats data
  const getTotalFromStats = () => {
    if (!propsStatsData) return 0;
    
    return parseFloat(propsStatsData.grossSales || '0');
  };



  // Fetch orders from API with pagination
  // Build query parameters from filters
  const buildQueryParams = (
    pageNumber: number = 1, 
    remark?: string, 
    overrideFilters?: { [key: string]: any }, 
    overrideDateRange?: {start: string, end: string},
    overridePlatforms?: Platform[]
  ): TransactionQueryParams => {
    const params: TransactionQueryParams = {
      page: pageNumber,
      limit: 50
    };

    // Set status based on remark or activeTab
    const remarkToUse = remark || (activeTab === 0 ? 'settlement_matched' : 'unsettled');
    if (remarkToUse === 'settlement_matched') {
      // For settled tab, use status_in with comma-separated values
      params.status_in = 'settlement_matched,less_payment_received,more_payment_received';
      console.log('Setting API parameter: status_in = settlement_matched,less_payment_received,more_payment_received (for Settled tab)');
    } else if (remarkToUse === 'unsettled') {
      // For unsettled tab, use status=unsettled (not status_in)
      params.status = 'unsettled';
      console.log('Setting API parameter: status = unsettled (for Unsettled tab)');
    }

    // ALWAYS add invoice date range - this is required for all API calls
    const dateRangeToUse = overrideDateRange || dateRange;
    if (dateRangeToUse.start && dateRangeToUse.end) {
      params.order_date_from = dateRangeToUse.start;
      params.order_date_to = dateRangeToUse.end;
      console.log('[buildQueryParams] Adding order date range:', { order_date_from: dateRangeToUse.start, order_date_to: dateRangeToUse.end });
    } else {
      console.warn('[buildQueryParams] No date range provided - API call may fail');
    }

    // ALWAYS add platform parameter as comma-separated list of selected platforms
    const platformsToUse = overridePlatforms !== undefined ? overridePlatforms : selectedPlatforms;
    if (platformsToUse.length > 0) {
      params.platform = platformsToUse.join(',');
      console.log('[buildQueryParams] Platform parameter:', {
        selectedPlatforms: platformsToUse,
        platformParam: params.platform,
        isAllSelected: platformsToUse.length === availablePlatforms.length
      });
    } else {
      console.warn('[buildQueryParams] No platforms selected - API call may not return data');
    }

    // Only add additional parameters if filters are explicitly applied
    if (overrideFilters || Object.keys(columnFilters).some(key => columnFilters[key])) {
      // Add sorting
      params.sort_by = 'order_date';
      params.sort_order = 'desc';
      
      // Apply column filters (use override filters if provided, otherwise use current state)
      const filtersToUse = overrideFilters || columnFilters;
      Object.entries(filtersToUse).forEach(([columnKey, filterValue]) => {
        if (!filterValue) return;

        const mapping = COLUMN_TO_API_PARAM_MAP[columnKey];
        if (!mapping) return;

        // Check platform compatibility - allow if any selected platform supports it
        if (mapping.supportedPlatforms) {
          const isSupported = platformsToUse.some(p => mapping.supportedPlatforms!.includes(p as any));
          if (!isSupported) {
            return; // Skip filters not supported by any selected platform
          }
        }

        const baseParam = mapping.apiParam;

        switch (mapping.type) {
          case 'string':
            if (columnKey === 'Order ID') {
              // For Order ID, use chips array joined by comma
              if (orderIdChips.length > 0) {
                (params as any)[baseParam] = orderIdChips.join(',');
              }
            } else if (typeof filterValue === 'string' && filterValue.trim()) {
              (params as any)[baseParam] = filterValue.trim();
            }
            break;
          
          case 'number':
            if (typeof filterValue === 'object' && filterValue !== null) {
              if (filterValue.min !== undefined && filterValue.min !== '') {
                (params as any)[`${baseParam}_min`] = parseFloat(filterValue.min);
              }
              if (filterValue.max !== undefined && filterValue.max !== '') {
                (params as any)[`${baseParam}_max`] = parseFloat(filterValue.max);
              }
            }
            break;
          
          case 'date':
            if (typeof filterValue === 'object' && filterValue !== null) {
              if (filterValue.from && filterValue.to) {
                (params as any)[`${baseParam}_from`] = filterValue.from;
                (params as any)[`${baseParam}_to`] = filterValue.to;
              }
            }
            break;
          
          case 'enum':
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              // Use the mapped API param which already includes _in suffix if needed
              (params as any)[baseParam] = filterValue.join(',');
            }
            break;
        }
      });
    }

    return params;
  };

  // Fetch orders with specific filters (used when applying filters)
  const fetchOrdersWithFilters = async (
    pageNumber: number = 1, 
    remark?: string, 
    filters?: { [key: string]: any }, 
    dateRangeFilter?: {start: string, end: string}
  ) => {
    const isInitialLoad = pageNumber === 1 && allTransactionData.length === 0;
    
    if (!isInitialLoad) {
      setPaginationLoading(true);
    }
    setError(null);
    
    try {
      const queryParams = buildQueryParams(pageNumber, remark, filters, dateRangeFilter);
      console.log(`Fetching orders with applied filters:`, queryParams);
      
      // Example query string that would be sent to API:
      // status_in=unsettled&order_date_from=2025-04-01&order_date_to=2025-04-30&diff_min=-500&diff_max=0&sort_by=order_date&sort_order=desc&order_item_id=333981993553920100
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      console.log(`Query string with applied filters:`, queryString);
      
      const response = await api.transactions.getTotalTransactions(queryParams as any);
      
      if (response.success && response.data) {
        // Debug: Log the API response structure
        console.log('API Response:', response.data);
        const responseData = response.data as any;
        const transactionData = responseData.transactions || responseData.orders || responseData;
        console.log('Transactions:', transactionData);
        
        // Handle metadata if available
        if ((response.data as any).meta) {
          const meta = (response.data as any).meta as TransactionMetadata;
          setMetadata(meta);
          
          // Update tab counts from metadata
          setTabCounts({
            settled: (meta.counts as any).settlement_matched ?? meta.counts.settled,
            unsettled: meta.counts.unsettled,
          });
          
          // Update total count from metadata
          if (meta.pagination) {
            setTotalCount(meta.pagination.total_count);
          }
        }
        
        // Transform all transaction/order items to transaction rows
        const transactionRows: TransactionRow[] = [];
        
        if (Array.isArray(transactionData)) {
          // If transactionData is directly an array of transactions
          transactionData.forEach((transaction: any, transactionIndex: number) => {
            console.log(`Transaction ${transactionIndex}:`, transaction);
            if (transaction.order_items) {
              // If it's in the old orders format
              transaction.order_items.forEach((orderItem: OrderItem, itemIndex: number) => {
                console.log(`OrderItem ${itemIndex} in Transaction ${transactionIndex}:`, orderItem);
                transactionRows.push(transformOrderItemToTransactionRow(orderItem));
              });
            } else {
              // If it's a direct transaction item
              transactionRows.push(transformOrderItemToTransactionRow(transaction));
            }
          });
        } else if (transactionData && typeof transactionData === 'object') {
          // If transactionData is an object, check if it has array properties
          console.log('TransactionData is an object:', transactionData);
          
          // Try to find array properties that might contain the actual data
          const possibleArrays = ['transactions', 'orders', 'data', 'items'];
          let foundData = false;
          
          for (const key of possibleArrays) {
            if (Array.isArray(transactionData[key])) {
              console.log(`Found data array in property: ${key}`);
              transactionData[key].forEach((item: any, index: number) => {
                console.log(`${key} ${index}:`, item);
                if (item.order_items) {
                  // If it's in the old orders format
                  item.order_items.forEach((orderItem: OrderItem, itemIndex: number) => {
                    console.log(`OrderItem ${itemIndex} in ${key} ${index}:`, orderItem);
                    transactionRows.push(transformOrderItemToTransactionRow(orderItem));
                  });
                } else {
                  // If it's a direct transaction item
                  transactionRows.push(transformOrderItemToTransactionRow(item));
                }
              });
              foundData = true;
              break;
            }
          }
          
          if (!foundData) {
            console.warn('No recognizable data array found in response');
          }
        } else {
          console.error('TransactionData is neither an array nor an object:', transactionData);
        }
        
        // For pagination, we show only the current page data
        setAllTransactionData(transactionRows);
        setFilteredData(transactionRows);
        setCurrentPage(pageNumber);
        
        // Fallback total count if metadata not available
        if (!metadata?.pagination && (response.data as any).pagination) {
          setTotalCount((response.data as any).pagination.total);
        } else if (!metadata?.pagination) {
          // Estimate total count based on current data
          setTotalCount(transactionRows.length);
        }
      } else {
        setError('Failed to fetch orders data');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load transaction data. Please try again.');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setPaginationLoading(false);
      }
    }
  };

  const fetchOrders = async (pageNumber: number = 1, remark?: string, overridePlatforms?: Platform[]) => {
    const isInitialLoad = pageNumber === 1 && allTransactionData.length === 0;
    
    if (!isInitialLoad) {
      setPaginationLoading(true);
    }
    setError(null);
    
    try {
      const queryParams = buildQueryParams(pageNumber, remark, undefined, undefined, overridePlatforms);
      const platformsToUse = overridePlatforms !== undefined ? overridePlatforms : selectedPlatforms;
      console.log(`[fetchOrders] Current selectedPlatforms state:`, platformsToUse);
      console.log(`[fetchOrders] Fetching orders with params:`, queryParams);
      console.log(`[fetchOrders] Platform in params:`, queryParams.platform);
      
      // Example query string that would be sent to API:
      // status_in=unsettled&order_date_from=2025-04-01&order_date_to=2025-04-30&diff_min=-500&diff_max=0&sort_by=order_date&sort_order=desc&order_item_id=333981993553920100
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      console.log(`Query string:`, queryString);
      
      const response = await api.transactions.getTotalTransactions(queryParams as any);
      
      if (response.success && response.data) {
        // Debug: Log the API response structure
        console.log('API Response:', response.data);
        const responseData = response.data as any;
        const transactionData = responseData.transactions || responseData.orders || responseData;
        console.log('Transactions:', transactionData);
        
        // Handle metadata if available
        if ((response.data as any).meta) {
          const meta = (response.data as any).meta as TransactionMetadata;
          setMetadata(meta);
          
          // Update tab counts from metadata
          setTabCounts({
            settled: meta.counts.settled,
            unsettled: meta.counts.unsettled,
          });
          
          // Update total count from metadata
          if (meta.pagination) {
            setTotalCount(meta.pagination.total_count);
          }
        }
        
        // Transform all transaction/order items to transaction rows
        const transactionRows: TransactionRow[] = [];
        
        if (Array.isArray(transactionData)) {
          // If transactionData is directly an array of transactions
          transactionData.forEach((transaction: any, transactionIndex: number) => {
            console.log(`Transaction ${transactionIndex}:`, transaction);
            if (transaction.order_items) {
              // If it's in the old orders format
              transaction.order_items.forEach((orderItem: OrderItem, itemIndex: number) => {
                console.log(`OrderItem ${itemIndex} in Transaction ${transactionIndex}:`, orderItem);
                transactionRows.push(transformOrderItemToTransactionRow(orderItem));
              });
            } else {
              // If it's a direct transaction item
              transactionRows.push(transformOrderItemToTransactionRow(transaction));
            }
          });
        } else if (transactionData && typeof transactionData === 'object') {
          // If transactionData is an object, check if it has array properties
          console.log('TransactionData is an object:', transactionData);
          
          // Try to find array properties that might contain the actual data
          const possibleArrays = ['transactions', 'orders', 'data', 'items'];
          let foundData = false;
          
          for (const key of possibleArrays) {
            if (Array.isArray(transactionData[key])) {
              console.log(`Found data array in property: ${key}`);
              transactionData[key].forEach((item: any, index: number) => {
                console.log(`${key} ${index}:`, item);
                if (item.order_items) {
                  // If it's in the old orders format
                  item.order_items.forEach((orderItem: OrderItem, itemIndex: number) => {
                    console.log(`OrderItem ${itemIndex} in ${key} ${index}:`, orderItem);
                    transactionRows.push(transformOrderItemToTransactionRow(orderItem));
                  });
                } else {
                  // If it's a direct transaction item
                  transactionRows.push(transformOrderItemToTransactionRow(item));
                }
              });
              foundData = true;
              break;
            }
          }
          
          if (!foundData) {
            console.warn('No recognizable data array found in response');
          }
        } else {
          console.error('TransactionData is neither an array nor an object:', transactionData);
        }
        
        // For pagination, we show only the current page data
        setAllTransactionData(transactionRows);
        setFilteredData(transactionRows);
        setCurrentPage(pageNumber);
        
        // Fallback total count if metadata not available
        if (!metadata?.pagination && (response.data as any).pagination) {
          setTotalCount((response.data as any).pagination.total);
        } else if (!metadata?.pagination) {
          // Estimate total count based on current data
          setTotalCount(transactionRows.length);
        }
      } else {
        setError('Failed to fetch orders data');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load transaction data. Please try again.');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setPaginationLoading(false);
      }
    }
  };

  // Handle navigation state changes
  useEffect(() => {
    if (location.state?.initialTab !== undefined) {
      const newTab = location.state.initialTab;
      setActiveTab(newTab);
      // Clear the state to prevent re-triggering on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Handle initialTab prop changes (when opening TransactionSheet with different initialTab)
  useEffect(() => {
    if (initialTab !== undefined) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sync propDateRange with local dateRange state
  useEffect(() => {
    if (propDateRange && (propDateRange.start !== dateRange.start || propDateRange.end !== dateRange.end)) {
      setDateRange(propDateRange);
      setPendingDateRange(propDateRange);
      setHeaderDateRange(propDateRange);
      setPendingHeaderDateRange(propDateRange);
    }
  }, [propDateRange]);

  // Fetch data on component mount
  useEffect(() => {
    // Use date range from props if provided, otherwise use default
    const initialDateRange = propDateRange || { start: '2025-04-01', end: '2025-04-30' };
    setHeaderDateRange(initialDateRange);
    setPendingHeaderDateRange(initialDateRange);
    fetchDualTransactions(1, undefined, initialDateRange);
    setHasInitialLoad(true);
  }, []);

  // Apply filters function - called when Apply button is clicked
  const applyFilters = () => {
    // Copy pending filters to active filters
    setColumnFilters(pendingColumnFilters);
    setDateRange(pendingDateRange);
    setSelectedPlatforms(pendingSelectedPlatforms);
    
    // Use dual API with filters and pending platforms
    fetchDualTransactions(1, pendingColumnFilters, pendingDateRange, pendingSelectedPlatforms);
    
    // Close the filter popover
    closeFilterPopover();
  };

  // Apply platform changes - called when Apply button next to platform selector is clicked
  const applyPlatformFilter = () => {
    const platformsCommaSeparated = pendingSelectedPlatforms.join(',');
    console.log('[Apply Platform Filter] Applying platforms:', pendingSelectedPlatforms);
    console.log('[Apply Platform Filter] Comma-separated platform parameter:', platformsCommaSeparated || 'EMPTY');
    setSelectedPlatforms(pendingSelectedPlatforms);
    setPage(0);
    setCurrentPage(1);
    fetchDualTransactions(1, columnFilters, dateRange, pendingSelectedPlatforms);
  };

  // Apply header date range changes - called when Apply button next to date selector is clicked
  const applyHeaderDateRange = () => {
    console.log('[Apply Header Date Range] Applying date range:', pendingHeaderDateRange);
    setHeaderDateRange(pendingHeaderDateRange);
    setDateRange(pendingHeaderDateRange);
    setPage(0);
    setCurrentPage(1);
    fetchDualTransactions(1, columnFilters, pendingHeaderDateRange, selectedPlatforms);
  };

  // Only refresh data when rowsPerPage changes (not filters)
  useEffect(() => {
    if (hasInitialLoad && (settledData || unsettledData)) { // Only refetch if data has been loaded initially
      fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
    }
  }, [rowsPerPage]);

  // Close filter on outside click with proper event handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on the filter icon or inside the popup
      const target = event.target as Element;
      const isFilterIcon = target?.closest('[aria-label*="Filter"]');
      const isInsidePopup = target?.closest('[data-filter-popup="true"]');
      
      if (!isFilterIcon && !isInsidePopup && headerFilterAnchor) {
        closeFilterPopover();
      }
    };
    
    if (headerFilterAnchor) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 100);
      
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  }, [headerFilterAnchor]);

  // Fetch tab count with specific filters (used when applying filters)
  const fetchTabCountWithFilters = async (
    remark: 'settlement_matched' | 'unsettled', 
    filters?: { [key: string]: any }, 
    dateRangeFilter?: {start: string, end: string}
  ) => {
    try {
      const queryParams = buildQueryParams(1, remark, filters, dateRangeFilter);
      queryParams.limit = 1; // Only need metadata, not actual data
      
      const response = await api.transactions.getTotalTransactions(queryParams as any);
      let count = 0;
      
      // Try to get count from metadata first
      if ((response.data as any)?.meta?.counts) {
        const meta = (response.data as any).meta as TransactionMetadata;
        count = remark === 'settlement_matched' ? meta.counts.settled : meta.counts.unsettled;
      } else if ((response.data as any)?.pagination?.total != null) {
        count = (response.data as any).pagination.total;
      } else if (Array.isArray((response.data as any)?.transactions)) {
        // Fallback to number of transactions if pagination not provided
        const transactions = (response.data as any).transactions;
        count = transactions.length;
      } else if (Array.isArray((response.data as any)?.orders)) {
        // Fallback to number of order_items across first order if pagination not provided
        const orders = (response.data as any).orders;
        count = orders.reduce((acc: number, o: any) => acc + (Array.isArray(o?.order_items) ? o.order_items.length : 0), 0);
      }
      
      setTabCounts(prev => ({
        ...prev,
        [remark === 'settlement_matched' ? 'settled' : remark === 'unsettled' ? 'unsettled' : 'unreconciled']: count,
      }));
    } catch (e) {
      // Ignore count errors
    }
  };

  // Fetch only the count for a given remark without altering the table data
  const fetchTabCount = async (remark: 'settlement_matched' | 'unsettled' | 'unreconciled') => {
    try {
      const queryParams = buildQueryParams(1, remark);
      queryParams.limit = 1; // Only need metadata, not actual data
      
      const response = await api.transactions.getTotalTransactions(queryParams as any);
      let count = 0;
      
      // Try to get count from metadata first
      if ((response.data as any)?.meta?.counts) {
        const meta = (response.data as any).meta as TransactionMetadata;
        count = remark === 'settlement_matched' ? meta.counts.settled : meta.counts.unsettled;
      } else if ((response.data as any)?.pagination?.total != null) {
        count = (response.data as any).pagination.total;
      } else if (Array.isArray((response.data as any)?.transactions)) {
        // Fallback to number of transactions if pagination not provided
        const transactions = (response.data as any).transactions;
        count = transactions.length;
      } else if (Array.isArray((response.data as any)?.orders)) {
        // Fallback to number of order_items across first order if pagination not provided
        const orders = (response.data as any).orders;
        count = orders.reduce((acc: number, o: any) => acc + (Array.isArray(o?.order_items) ? o.order_items.length : 0), 0);
      }
      
      setTabCounts(prev => ({
        ...prev,
        [remark === 'settlement_matched' ? 'settled' : remark === 'unsettled' ? 'unsettled' : 'unreconciled']: count,
      }));
    } catch (e) {
      // Ignore count errors
    }
  };

  // Dual API call function - fetches both settled and unsettled data simultaneously
  const fetchDualTransactions = async (
    pageNumber: number = 1, 
    filters?: { [key: string]: any }, 
    dateRangeFilter?: {start: string, end: string},
    overridePlatforms?: Platform[],
    orderIds?: string[]
  ) => {
    console.log('[fetchDualTransactions] Called with:', { pageNumber, filters, dateRangeFilter, overridePlatforms, orderIds });
    
    // Prevent duplicate calls from React Strict Mode
    if (isFetchingRef.current) {
      console.log('[fetchDualTransactions] Already fetching, skipping duplicate call');
      return;
    }
    
    const isInitialLoad = pageNumber === 1 && !settledData && !unsettledData;
    
    // Set the flag to prevent duplicate calls
    isFetchingRef.current = true;
    
    if (!isInitialLoad) {
      setPaginationLoading(true);
    }
    setDualApiLoading(true);
    setError(null);
    
    try {
      // Build base parameters
      const platformsToUse = overridePlatforms !== undefined ? overridePlatforms : selectedPlatforms;
      
      // Create settled API call parameters
      const settledParams: any = {
        page: pageNumber,
        limit: rowsPerPage,
      };
      
      // Convert filters to API parameters
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([columnKey, filterValue]) => {
          if (!filterValue) return;

          const mapping = COLUMN_TO_API_PARAM_MAP[columnKey];
          if (!mapping) {
            // If no mapping, pass through as-is for backward compatibility
            (settledParams as any)[columnKey] = filterValue;
            return;
          }

          // Check platform compatibility
          if (mapping.supportedPlatforms) {
            const isSupported = platformsToUse.some(p => mapping.supportedPlatforms!.includes(p as any));
            if (!isSupported) {
              return; // Skip filters not supported by any selected platform
            }
          }

          const baseParam = mapping.apiParam;

          switch (mapping.type) {
            case 'string':
              if (columnKey === 'Order ID') {
                // For Order ID, use chips array joined by comma
                const orderIdsToUse = orderIds !== undefined ? orderIds : orderIdChips;
                if (orderIdsToUse.length > 0) {
                  settledParams[baseParam] = orderIdsToUse.join(',');
                }
              } else if (typeof filterValue === 'string' && filterValue.trim()) {
                settledParams[baseParam] = filterValue.trim();
              }
              break;
            
            case 'number':
              if (typeof filterValue === 'object' && filterValue !== null) {
                if (filterValue.min !== undefined && filterValue.min !== '') {
                  settledParams[`${baseParam}_min`] = parseFloat(filterValue.min);
                }
                if (filterValue.max !== undefined && filterValue.max !== '') {
                  settledParams[`${baseParam}_max`] = parseFloat(filterValue.max);
                }
              }
              break;
            
            case 'date':
              if (typeof filterValue === 'object' && filterValue !== null) {
                if (filterValue.from) {
                  settledParams[`${baseParam}_from`] = filterValue.from;
                }
                if (filterValue.to) {
                  settledParams[`${baseParam}_to`] = filterValue.to;
                }
              }
              break;
            
            case 'enum':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                settledParams[baseParam] = filterValue.join(',');
              }
              break;
          }
        });
      }
      
      // Add date range parameters with correct keys
      if (dateRangeFilter?.start && dateRangeFilter?.end) {
        settledParams.order_date_from = dateRangeFilter.start;
        settledParams.order_date_to = dateRangeFilter.end;
      }
      
      // Add platform parameter
      if (platformsToUse.length > 0) {
        settledParams.platform = platformsToUse.join(',');
      }

      // Apply sorting if present
      if (sortConfig && COLUMN_TO_SORT_BY_MAP[sortConfig.key]) {
        settledParams.sort_by = COLUMN_TO_SORT_BY_MAP[sortConfig.key];
        settledParams.sort_order = sortConfig.direction;
      }
      
      // Check if user has applied a Status filter
      const statusFilter = filters?.['Status'];
      const hasStatusFilter = statusFilter && Array.isArray(statusFilter) && statusFilter.length > 0;
      
      // Only set default status_in if no Status filter was applied by the user
      // The filter conversion loop above may have already added status_in, so check first
      if (!settledParams.status_in) {
        // No status_in was set by filter conversion, use default for settled tab
        settledParams.status_in = 'settlement_matched,less_payment_received,more_payment_received';
      }
      
      // Create unsettled API call parameters
      const unsettledParams = { ...settledParams };
      
      // Handle unsettled tab based on whether user selected specific statuses
      if (hasStatusFilter && statusFilter.includes('unsettled')) {
        // User selected unsettled - check if they also selected settled statuses
        const settledStatuses = statusFilter.filter(s => s !== 'unsettled');
        if (settledStatuses.length > 0) {
          // User selected both settled and unsettled - need to handle both tabs
          // Settled params already has the settled statuses
          // For unsettled, remove settled statuses and use status='unsettled'
          delete unsettledParams.status_in;
          unsettledParams.status = 'unsettled';
        } else {
          // Only unsettled selected
          delete unsettledParams.status_in;
          unsettledParams.status = 'unsettled';
        }
      } else if (hasStatusFilter && !statusFilter.includes('unsettled')) {
        // User only selected settled statuses - no data for unsettled tab
        delete unsettledParams.status_in;
        delete unsettledParams.status;
      } else {
        // Default: no status filter, use normal settled/unsettled split
        delete unsettledParams.status_in;
        unsettledParams.status = 'unsettled';
      }
      
      console.log('[fetchDualTransactions] Settled params:', settledParams);
      console.log('[fetchDualTransactions] Unsettled params:', unsettledParams);
      
      // Determine if we should make unsettled API call
      const shouldFetchUnsettled = !hasStatusFilter || (hasStatusFilter && statusFilter.includes('unsettled'));
      
      // Make API calls (conditionally include unsettled)
      const apiCalls: [Promise<any>, Promise<any>] = [
        api.transactions.getTotalTransactions(settledParams),
        shouldFetchUnsettled 
          ? api.transactions.getTotalTransactions(unsettledParams)
          : Promise.resolve({ success: true, data: null }) // Mock response when not fetching
      ];
      
      const [settledResponse, unsettledResponse] = await Promise.all(apiCalls);
      
      // Process settled response
      if (settledResponse.success) {
        setSettledData(settledResponse.data);
        console.log('[fetchDualTransactions] Settled data received:', settledResponse.data);
        console.log('[fetchDualTransactions] Settled columns:', settledResponse.data?.columns);
        console.log('[fetchDualTransactions] First settled row:', settledResponse.data?.data?.[0]);
        if (settledResponse.data?.data?.[0]) {
          const firstRow = settledResponse.data.data[0];
          console.log('[fetchDualTransactions] settlement_amount in first row:', (firstRow as any).settlement_amount);
          console.log('[fetchDualTransactions] settlement_value in first row:', (firstRow as any).settlement_value);
          console.log('[fetchDualTransactions] All keys in first row:', Object.keys(firstRow));
        }
      } else {
        console.error('[fetchDualTransactions] Settled API failed:', settledResponse);
      }
      
      // Process unsettled response (only if we actually fetched it)
      if (shouldFetchUnsettled && unsettledResponse.success) {
        setUnsettledData(unsettledResponse.data);
        console.log('[fetchDualTransactions] Unsettled data received:', unsettledResponse.data);
        console.log('[fetchDualTransactions] Unsettled columns:', unsettledResponse.data?.columns);
        console.log('[fetchDualTransactions] First unsettled row:', unsettledResponse.data?.data?.[0]);
      } else {
        console.error('[fetchDualTransactions] Unsettled API failed:', unsettledResponse);
      }
      
      // Store total counts separately for settled and unsettled tabs
      if (settledResponse.success && settledResponse.data?.pagination) {
        setSettledTotalCount(settledResponse.data.pagination.total_count);
      }
      if (shouldFetchUnsettled && unsettledResponse.success && unsettledResponse.data?.pagination) {
        setUnsettledTotalCount(unsettledResponse.data.pagination.total_count);
      } else if (!shouldFetchUnsettled) {
        // No unsettled data was fetched (user selected only settled statuses)
        setUnsettledTotalCount(0);
        setUnsettledData(null);
      }
      
      // Update totalCount based on current active tab
      if (activeTab === 0 && settledResponse.success && settledResponse.data?.pagination) {
        setTotalCount(settledResponse.data.pagination.total_count);
      } else if (activeTab === 1 && shouldFetchUnsettled && unsettledResponse.success && unsettledResponse.data?.pagination) {
        setTotalCount(unsettledResponse.data.pagination.total_count);
      }
      
      setCurrentPage(pageNumber);
      
      // Update tab counts based on the actual data received
      if (settledResponse.success) {
        setTabCounts({
          settled: settledResponse.data?.data?.length || 0,
          unsettled: (shouldFetchUnsettled && unsettledResponse.success) ? (unsettledResponse.data?.data?.length || 0) : 0,
        });
      }
      
    } catch (error) {
      console.error('[fetchDualTransactions] Error:', error);
      setError('Failed to fetch transaction data');
    } finally {
      setDualApiLoading(false);
      setPaginationLoading(false);
      isFetchingRef.current = false; // Reset the flag
    }
  };

  // Fetch data from new total transactions API
  const fetchTotalTransactions = async (
    pageNumber: number = 1, 
    filters?: { [key: string]: any }, 
    dateRangeFilter?: {start: string, end: string},
    overridePlatforms?: Platform[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: pageNumber,
        limit: rowsPerPage, // Use current rows per page setting
      };
      
      // ALWAYS add platform parameter as comma-separated list
      const platformsToUse = overridePlatforms !== undefined ? overridePlatforms : selectedPlatforms;
      if (platformsToUse.length > 0) {
        params.platform = platformsToUse.join(',');
        console.log('[fetchTotalTransactions] Adding platform parameter:', params.platform);
      } else {
        console.warn('[fetchTotalTransactions] No platforms selected');
      }
      
      // Apply status based on active tab selection
      if (activeTab === 0) {
        // Settled tab - use status_in with comma-separated values
        params.status_in = 'settlement_matched,less_payment_received,more_payment_received';
      } else if (activeTab === 1) {
        // Unsettled tab - use status=unsettled
        params.status = 'unsettled';
      }
      
      // Apply filters if provided
      if (filters && Object.keys(filters).some(key => filters[key])) {
        Object.entries(filters).forEach(([columnKey, filterValue]) => {
          if (!filterValue) return;

          const mapping = COLUMN_TO_API_PARAM_MAP[columnKey];
          if (!mapping) return;

          // Check platform compatibility - allow if any selected platform supports it
          if (mapping.supportedPlatforms) {
            const isSupported = platformsToUse.some(p => mapping.supportedPlatforms!.includes(p as any));
            if (!isSupported) {
              return; // Skip filters not supported by any selected platform
            }
          }

          const baseParam = mapping.apiParam;

          switch (mapping.type) {
            case 'string':
              if (columnKey === 'Order ID') {
                // For Order ID, use chips array joined by comma
                if (orderIdChips.length > 0) {
                  params[baseParam] = orderIdChips.join(',');
                }
              } else if (typeof filterValue === 'string' && filterValue.trim()) {
                params[baseParam] = filterValue.trim();
              }
              break;
            
            case 'number':
              if (typeof filterValue === 'object' && filterValue !== null) {
                if (filterValue.min !== undefined && filterValue.min !== '') {
                  params[`${baseParam}_min`] = parseFloat(filterValue.min);
                }
                if (filterValue.max !== undefined && filterValue.max !== '') {
                  params[`${baseParam}_max`] = parseFloat(filterValue.max);
                }
              }
              break;
            
            case 'date':
              if (typeof filterValue === 'object' && filterValue !== null) {
                if (filterValue.from && filterValue.to) {
                  params[`${baseParam}_from`] = filterValue.from;
                  params[`${baseParam}_to`] = filterValue.to;
                }
              }
              break;
            
            case 'enum':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                // Use the mapped API param which already includes _in suffix if needed
                params[baseParam] = filterValue.join(',');
              }
              break;
          }
        });
      }

      // Apply date range filter if provided
      if (dateRangeFilter?.start && dateRangeFilter?.end) {
        params.order_date_from = dateRangeFilter.start;
        params.order_date_to = dateRangeFilter.end;
      }
      
      console.log('Fetching total transactions with params:', params);
      
      // Use custom API call with specific organization ID for this API only
      const response = await apiService.get<TotalTransactionsResponse>(
        API_CONFIG.ENDPOINTS.TOTAL_TRANSACTIONS, 
        params,
        {
          headers: {
            'X-Org-ID': '6ce6ee73-e1ef-4020-ad74-4ee45e731201',
            'X-API-Key': 'kapiva-7b485b6a865b2b4a3d728ef2fd4f3'
          }
        }
      );
      
      if (response.success && response.data) {
        console.log('API Response received:', response.data);
        console.log('Columns:', response.data.columns);
        console.log('First row of data:', response.data.data?.[0]);
        
        setTotalTransactionsData(response.data);
        setTotalCount(response.data.pagination?.total_count || 0);
        setCurrentPage(response.data.pagination?.page || 1);
        
        // Handle null data case (0 results)
        const dataArray = response.data.data || [];
        
        // Update tab counts based on the data
        const settledCount = dataArray.filter(row => 
          row.recon_status === 'settlement_matched' || row.recon_status === 'less_payment_received' || row.recon_status === 'more_payment_received'
        ).length;
        const unsettledCount = dataArray.filter(row => 
          row.recon_status === 'unsettled'
        ).length;
        
        setTabCounts({
          settled: settledCount,
          unsettled: unsettledCount
        });
        
        console.log('Total transactions fetched successfully:', response.data);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err: any) {
      console.error('Error fetching total transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle date range change
  const handleDateRangeChange = (field: 'start' | 'end') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingDateRange(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle string contains filter
  const handleStringFilterChange = (columnKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingColumnFilters(prev => ({
      ...prev,
      [columnKey]: event.target.value,
    }));
  };

  // Handle Order ID search input change (don't trigger API yet)
  const handleOrderIdSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrderIdSearch(value);
  };

  // Handle Order ID search button click
  const handleOrderIdSearchClick = () => {
    const value = orderIdSearch;
    
    // Convert comma-separated values to array
    const orderIds = value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setOrderIdChips(orderIds);
    
    // Trigger API call
    setPage(0);
    setCurrentPage(1);
    
    // Build query params with order IDs
    const newFilters = { ...columnFilters };
    if (orderIds.length > 0) {
      fetchDualTransactions(1, newFilters, dateRange, selectedPlatforms, orderIds);
    } else {
      fetchDualTransactions(1, newFilters, dateRange, selectedPlatforms);
    }
  };

  // Handle Order ID search clear
  const handleOrderIdSearchClear = () => {
    setOrderIdSearch('');
    setOrderIdChips([]);
    setShowOrderIdSearch(false);
    
    // Trigger API call without order IDs
    setPage(0);
    setCurrentPage(1);
    fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
  };

  // Handle number range filter
  const handleNumberRangeChange = (columnKey: string, bound: 'min' | 'max') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPendingColumnFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...(prev[columnKey] || {}),
        [bound]: value,
      },
    }));
  };

  // Handle date range filter
  const handleDateRangeFilterChange = (columnKey: string, bound: 'from' | 'to') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPendingColumnFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...(prev[columnKey] || {}),
        [bound]: value,
      },
    }));
  };

  // Handle enum multi-select filter
  const handleEnumFilterChange = (columnKey: string) => (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setPendingColumnFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  // Clear specific column filter
  const clearColumnFilter = (columnKey: string) => {
    setPendingColumnFilters(prev => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
  };

  // Open/close popover for a column
  const openFilterPopover = (columnKey: string, target: HTMLElement) => {
    console.log('openFilterPopover called:', columnKey, target);
    console.log('Setting state - activeFilterColumn:', columnKey, 'headerFilterAnchor:', !!target);
    console.log('Available columns in COLUMN_META:', Object.keys(COLUMN_META));
    console.log('Is breakup field?', ['Shipping Courier', 'Recon Status', 'Settlement Provider'].includes(columnKey));
    
    // Initialize pending filters with current active filters
    setPendingColumnFilters(columnFilters);
    setPendingDateRange(dateRange);
    
    setActiveFilterColumn(columnKey);
    setHeaderFilterAnchor(target);
    
    // Debug: Check state after a short delay
    setTimeout(() => {
      console.log('State after 50ms:', { 
        activeFilterColumn: columnKey, 
        headerFilterAnchor: !!target,
        shouldRender: Boolean(target) && Boolean(columnKey)
      });
    }, 50);
  };

  const closeFilterPopover = () => {
    console.log('closeFilterPopover called');
    setHeaderFilterAnchor(null);
    setActiveFilterColumn(null);
  };

  const isFilterActive = (columnKey: string) => {
    const meta = COLUMN_META[columnKey]?.type || 'string';
    const v = columnFilters[columnKey];
    if (v == null) return false;
    if (meta === 'string') return String(v).trim().length > 0;
    if (meta === 'number') return (v?.min?.toString().trim() || v?.max?.toString().trim()) ? true : false;
    if (meta === 'date') return (v?.from?.toString().trim() || v?.to?.toString().trim()) ? true : false;
    if (meta === 'enum') return Array.isArray(v) && v.length > 0;
    return false;
  };

  // Transaction details popup handlers for Status column
  const handleTransactionDetailsOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Debug logging to see what data we're passing to the popup
    console.log('Opening popup for row:', row);
    console.log('Row data structure:', Object.keys(row));
    console.log('Original data in row:', (row as any).originalData);
    
    setSelectedTransaction(row);
    setAnchorEl(event.currentTarget);
  };

  // Breakups modal handler
  const handleBreakupsOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Extract order ID from the row data
    const orderId = row.order_id || row['Order ID'] || row['Order Item ID'] || row.order_item_id || 'Unknown';
    
    // Get breakups from metadata.breakups
    let breakups = null;
    if ((row as any)?.originalData?.metadata?.breakups) {
      breakups = (row as any).originalData.metadata.breakups;
    } else if (row.metadata?.breakups) {
      breakups = row.metadata.breakups;
    }
    
    if (breakups && typeof breakups === 'object' && Object.keys(breakups).length > 0) {
      // Store the full row so we can access order_value, settlement_value, and diff
      setSelectedBreakups(row);
      setBreakupsOrderId(orderId);
      setBreakupsAnchorEl(event.currentTarget);
      setBreakupsModalOpen(true);
    }
  };

  // Filter data based on search, date range, and column filters
  useEffect(() => {
    if (getCurrentData().length > 0) {
      let filtered = getCurrentData();
    
      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(row => 
          Object.values(row).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      
      // Date range filter
      if (dateRange.start || dateRange.end) {
        filtered = filtered.filter(row => {
          const orderDate = new Date(row["Invoice Date"] || row["invoice_date"]);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;
          
          if (startDate && endDate) {
            return orderDate >= startDate && orderDate <= endDate;
          } else if (startDate) {
            return orderDate >= startDate;
          } else if (endDate) {
            return orderDate <= endDate;
          }
          return true;
        });
      }
      
      // Column filters
      Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
        const meta = COLUMN_META[columnKey] || { type: 'string' as const };

          filtered = filtered.filter(row => {
          const value = (row as any)[columnKey];
            if (value === null || value === undefined) return false;
            
          switch (meta.type) {
            case 'string': {
              const text = (filterValue || '').toString().trim();
              if (!text) return true;
              return String(value).toLowerCase().includes(text.toLowerCase());
            }
            case 'number': {
              const minRaw = (filterValue?.min ?? '').toString().trim();
              const maxRaw = (filterValue?.max ?? '').toString().trim();
              const num = typeof value === 'number' ? value : parseFloat(String(value));
              if (Number.isNaN(num)) return false;
              let ok = true;
              if (minRaw !== '') ok = ok && num >= parseFloat(minRaw);
              if (maxRaw !== '') ok = ok && num <= parseFloat(maxRaw);
              return ok;
            }
            case 'date': {
              const from = (filterValue?.from ?? '').toString().trim();
              const to = (filterValue?.to ?? '').toString().trim();
              if (!from && !to) return true;
              const current = new Date(String(value));
              if (isNaN(current.getTime())) return false;
              let ok = true;
              if (from) ok = ok && current >= new Date(from);
              if (to) ok = ok && current <= new Date(to);
              return ok;
            }
            case 'enum': {
              const selected: string[] = Array.isArray(filterValue) ? filterValue : [];
              if (selected.length === 0) return true;
              return selected.includes(String(value));
            }
            default:
              return true;
          }
        });
      });
      
      // Apply sorting
      const sortedData = sortData(filtered);
      setFilteredData(sortedData);
    }
  }, [searchTerm, dateRange, columnFilters, activeTab, allTransactionData, sortConfig]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    const newPageNumber = newPage + 1; // Convert from 0-based to 1-based
    setPage(newPage);
    
    // Always use dual API with current filters
    fetchDualTransactions(newPageNumber, columnFilters, dateRange, selectedPlatforms);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Reset to first page when changing rows per page
    fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
  };

  

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setColumnFilters({});
    setSelectedPlatforms([...availablePlatforms]); // Reset to all platforms selected
    setPendingSelectedPlatforms([...availablePlatforms]); // Reset pending platforms too
    setOrderIdChips([]); // Clear order ID chips
    setOrderIdSearch(''); // Clear order ID search in header
    setShowOrderIdSearch(false); // Hide order ID search bar
    setPage(0);
    setCurrentPage(1);
    fetchDualTransactions(1, {}, { start: '', end: '' }, [...availablePlatforms]);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(`Tab changed from ${activeTab} to ${newValue}`);
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
    setCurrentPage(1); // Reset current page
    
    // Update totalCount based on the new active tab
    if (newValue === 0 && settledTotalCount !== null) {
      // Settled tab
      setTotalCount(settledTotalCount);
    } else if (newValue === 1 && unsettledTotalCount !== null) {
      // Unsettled tab
      setTotalCount(unsettledTotalCount);
    }
    
    // No API call needed - just switch the displayed data
    // The data is already loaded from dual API calls
  };

  // Handle transaction row click
  const handleTransactionClick = (transaction: any, event: React.MouseEvent<HTMLElement>) => {
    setSelectedTransaction(transaction);
    setAnchorEl(event.currentTarget);
  };




  // Get visible columns
  const getVisibleColumns = () => {
    const base = [
      "Order ID",
      "Order Value",
      "Settlement Value",
      "Invoice Date",
      "Settlement Date",
      "Difference",
      "Status",
    ];
    // No special columns for any tab now
    return base;
  };

  const visibleColumns = getVisibleColumns();

  return (
    <Slide direction="left" in mountOnEnter unmountOnExit>
      <Box sx={{ 
        width: '100%',
        height: '100%',
        background: '#fafafa',
        position: 'relative',
        overflow: 'auto',
      }}>
        <Box sx={{ p: { xs: 1, md: 2 }, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Card sx={{ 
              mb: 1,
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap:  2}}>
                    <IconButton
                      onClick={onBack}
                      size="small"
                      sx={{
                        background: '#1f2937',
                        color: 'white',
                        mt: -2,
                        '&:hover': {
                          background: '#374151',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      color: '#111827',
                      letterSpacing: '-0.02em',
                      py: 0.5,
                      mt: -2,
                    }}>
                      Transaction Sheet
                    </Typography>
                    
                    {/* Transaction Tabs - Inline */}
                    <Tabs 
                      value={activeTab} 
                      onChange={handleTabChange}
                      sx={{
                        '& .MuiTab-root': {
                          minHeight: 32,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          color: '#6b7280',
                          px: 2,
                          py: 0.5,
                          '&.Mui-selected': {
                            color: '#1f2937',
                            fontWeight: 700,
                          },
                        },
                        '& .MuiTabs-indicator': {
                          height: 2,
                          borderRadius: '2px 2px 0 0',
                          background: '#1f2937',
                        },
                      }}
                    >
                      <Tab label={`Settled${settledTotalCount !== null ? ` (${settledTotalCount})` : ''}`} />
                      <Tab label={`Unsettled${unsettledTotalCount !== null ? ` (${unsettledTotalCount})` : ''}`} />
                    </Tabs>
                    
                  
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    width: '100%',
                    maxWidth: '100%',
                    justifyContent: 'flex-end'
                  }}>
                    
                    <IconButton
                      onClick={() => {
                        fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
                      }}
                      disabled={loading || dualApiLoading}
                      sx={{
                        color: '#1f2937',
                        '&:hover': {
                          background: '#f9fafb',
                        },
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                    
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={(e) => openFilterPopover('Status', e.currentTarget as any)}
                      sx={{ 
                        textTransform: 'none', 
                        borderColor: '#1f2937', 
                        color: '#1f2937',
                        flexShrink: 0,
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                        minWidth: 'auto',
                      }}
                    >
                      Filters
                    </Button>
                    
                    {/* Platform Filter - New Design with Checkboxes */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      padding: '6px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      height: { xs: 'auto', sm: '48px' },
                      flex: { xs: '1 1 100%', sm: '0 1 auto' },
                      minWidth: 0,
                      maxWidth: { xs: '100%', sm: '500px' },
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      rowGap: { xs: 0.5, sm: 0 },
                    }}>
                      {/* Platform label */}
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#1f2937', 
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        Platforms:
                      </Typography>
                      
                      {/* Platform checkboxes */}
                      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                        {availablePlatforms.map((platform) => (
                          <Box 
                            key={platform}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              cursor: 'pointer',
                              '&:hover': {
                                '& .MuiTypography-root': {
                                  color: '#0ea5e9'
                                }
                              }
                            }}
                            onClick={() => {
                              setPendingSelectedPlatforms(prev => 
                                prev.includes(platform) 
                                  ? prev.filter(p => p !== platform)
                                  : [...prev, platform]
                              );
                            }}
                          >
                            <Checkbox 
                              checked={pendingSelectedPlatforms.includes(platform)}
                              size="small"
                              sx={{ padding: '2px', '& svg': { fontSize: '18px' } }}
                            />
                            <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                              {platform === 'flipkart' ? 'Flipkart' : 'D2C'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      
                      {/* Divider */}
                      <Box sx={{ width: '1px', height: '18px', backgroundColor: '#d1d5db', mx: 0.25, flexShrink: 0 }} />
                      
                      {/* Select All button */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setPendingSelectedPlatforms([...availablePlatforms]);
                        }}
                        disabled={pendingSelectedPlatforms.length === availablePlatforms.length}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          minWidth: 'auto',
                          borderColor: '#d1d5db',
                          color: '#6b7280',
                          flexShrink: 0,
                          '&:hover': {
                            borderColor: '#0ea5e9',
                            color: '#0ea5e9',
                            backgroundColor: 'rgba(14, 165, 233, 0.04)',
                          },
                          '&:disabled': {
                            borderColor: '#e5e7eb',
                            color: '#d1d5db',
                          }
                        }}
                      >
                        All
                      </Button>
                      
                      {/* Clear All button */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setPendingSelectedPlatforms([]);
                        }}
                        disabled={pendingSelectedPlatforms.length === 0}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          minWidth: 'auto',
                          borderColor: '#d1d5db',
                          color: '#6b7280',
                          flexShrink: 0,
                          '&:hover': {
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.04)',
                          },
                          '&:disabled': {
                            borderColor: '#e5e7eb',
                            color: '#d1d5db',
                          }
                        }}
                      >
                        Clear
                      </Button>
                      
                      {/* Divider */}
                      <Box sx={{ width: '1px', height: '18px', backgroundColor: '#d1d5db', mx: 0.25, flexShrink: 0 }} />
                      
                      {/* Apply Button */}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={applyPlatformFilter}
                        disabled={JSON.stringify(pendingSelectedPlatforms.sort()) === JSON.stringify(selectedPlatforms.sort())}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          padding: '3px 10px',
                          minWidth: 'auto',
                          backgroundColor: '#1f2937',
                          flexShrink: 0,
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
                    
                    {/* Date Range Selector - New Design */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      padding: '6px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      height: { xs: 'auto', sm: '48px' },
                      flex: { xs: '1 1 100%', sm: '0 1 auto' },
                      minWidth: 0,
                      maxWidth: { xs: '100%', sm: '420px' },
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      rowGap: { xs: 0.5, sm: 0 },
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
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
                        <TextField
                          label="From"
                          type="date"
                          size="small"
                          value={pendingHeaderDateRange.start}
                          onChange={(e) => setPendingHeaderDateRange(prev => ({ ...prev, start: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{ 
                            flex: '1 1 0',
                            minWidth: 0,
                            maxWidth: '110px',
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
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.7rem', flexShrink: 0 }}>
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
                            flex: '1 1 0',
                            minWidth: 0,
                            maxWidth: '110px',
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
                            }
                          }}
                        />
                      </Box>
                      
                      {/* Divider */}
                      <Box sx={{ width: '1px', height: '18px', backgroundColor: '#d1d5db', mx: 0.25, flexShrink: 0 }} />
                      
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
                    
                  </Box>
                </Box>

                {/* Active filter chips row directly under the header row, aligned under back button */}
                {(!!Object.keys(columnFilters).filter(k => columnFilters[k]).length || selectedPlatforms.length < availablePlatforms.length || orderIdChips.length > 0) && (
                  <Box sx={{ml: 6, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {/* Platform filter chips - show if not all platforms are selected */}
                    {selectedPlatforms.length > 0 && selectedPlatforms.length < availablePlatforms.length && (
                      <Chip
                        key="platform-filter"
                        label={`Platform: ${selectedPlatforms.map(p => p === 'flipkart' ? 'Flipkart' : 'D2C').join(', ')}`}
                        onDelete={() => {
                          setSelectedPlatforms([...availablePlatforms]);
                          setPage(0);
                          setCurrentPage(1);
                          fetchDualTransactions(1, columnFilters, dateRange, [...availablePlatforms]);
                        }}
                        size="small"
                        sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
                      />
                    )}
                    {/* Order ID chips */}
                    {orderIdChips.length > 0 && (
                      <Chip
                        key="order-ids-filter"
                        label={`Order IDs: ${orderIdChips.length} selected`}
                        onDelete={() => {
                          setOrderIdChips([]);
                          setOrderIdSearch('');
                          setShowOrderIdSearch(false);
                          setPage(0);
                          setCurrentPage(1);
                          fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
                        }}
                        size="small"
                        sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }}
                      />
                    )}
                    {Object.entries(columnFilters).filter(([_, v]) => !!v).map(([key, val]) => (
                      <Chip
                        key={key}
                        size="small"
                        label={`${key}: ${typeof val === 'object' ? (Array.isArray(val) ? val.join(',') : Object.values(val).filter(Boolean).join('~')) : val}`}
                        onDelete={() => {
                          const next = { ...columnFilters } as any;
                          delete next[key as any];
                          setColumnFilters(next);
                          // Also update pending to reflect removal
                          setPendingColumnFilters((prev) => {
                            const p = { ...prev } as any;
                            delete p[key as any];
                            return p;
                          });
                                                      // Re-apply after deletion
                            fetchDualTransactions(1, next, pendingDateRange, selectedPlatforms);
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => {
                  fetchDualTransactions(1, columnFilters, dateRange, selectedPlatforms);
                }}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {(loading || dualApiLoading) && (
            <LinearProgress 
              sx={{ 
                mb: 2,
                borderRadius: '8px',
                height: 4,
                background: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  background: '#1f2937',
                },
              }} 
            />
          )}

          {/* Pagination Loading Indicator */}
          {paginationLoading && (
            <LinearProgress 
              sx={{ 
                mb: 2,
                borderRadius: '8px',
                height: 2,
                background: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  background: '#3b82f6',
                },
              }} 
            />
          )}

          {/* Transaction Table */}
          <Fade in timeout={1000}>
            <Card sx={{ 
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
            }}>
              <TableContainer sx={{ 
                maxHeight: 'calc(100vh - 200px)',
                overflowX: 'auto',
                position: 'relative',
                zIndex: 1,
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
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                  },
                  '& .MuiTableCell-body': {
                    border: 'none !important',
                    borderBottom: '0.5px solid #e5e7eb !important',
                    // paddingTop: '2px',
                    // paddingBottom: '2px',
                  }
                }}>
                  <TableHead sx={{ '& .MuiTableCell-root': { border: 'none !important' } }}>
                    <TableRow>
                                              {getCurrentColumns().map((column, index) => (
                          <TableCell
                            key={`header-${column}`}
                          sx={{
                            fontWeight: 700,
                            color: '#111827',
                            background: '#f3f4f6',
                            textAlign: 'center',
                            py: 0.75,
                            minWidth: 160,
                            transition: 'all 0.3s ease',
                            position: 'relative',
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {/* Column Header */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                                {column === 'Status' ? 'Status' : column}
                              </Typography>
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSort(column);
                                      }}
                                      sx={{
                                        ml: 0.5,
                                        color: sortConfig?.key === column ? '#1f2937' : '#6b7280',
                                        background: sortConfig?.key === column ? '#e5e7eb' : 'transparent',
                                        '&:hover': { background: '#f3f4f6' },
                                      }}
                                      disabled={!COLUMN_TO_SORT_BY_MAP[column]}
                                      aria-label={`Sort ${column}`}
                                    >
                                      {getSortIcon(column)}
                                    </IconButton>
                                    {/* Magnifying glass button for Order ID search */}
                                    {column === 'Order ID' && (
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
                                    )}
                              </Box>
                              {/* Order ID Search Bar - Expandable */}
                              {column === 'Order ID' && showOrderIdSearch && (
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    animation: 'expand 0.3s ease-in-out',
                                    '@keyframes expand': {
                                      '0%': { width: '0', opacity: 0 },
                                      '100%': { width: '280px', opacity: 1 }
                                    }
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
                                            disabled={loading || dualApiLoading}
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
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {(loading || dualApiLoading) && getCurrentData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={getCurrentColumns().length} sx={{ textAlign: 'center', py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={40} sx={{ color: '#1f2937' }} />
                            <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                              Loading transaction data...
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : paginationLoading ? (
                      <TableRow>
                        <TableCell colSpan={getCurrentColumns().length} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={30} sx={{ color: '#3b82f6' }} />
                            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                              Loading page {currentPage}...
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : getCurrentData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={getCurrentColumns().length} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {totalTransactionsData ? 'No transactions found.' : 'No data available.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getCurrentData()
                        .map((row, rowIndex) => {
                        const isSelected = (selectedTransaction?.["Order ID"] || selectedTransaction?.["Order Item ID"]) === (row["Order ID"] || row["Order Item ID"] || row["order_id"] || row["order_item_id"]);
                        return (
                          <React.Fragment key={rowIndex}>
                                                          <TableRow 
                                sx={{ 
                                  borderLeft: `4px solid ${activeTab === 0 ? '#10b981' : '#ef4444'}`,
                                  background: '#ffffff',
                                  position: 'relative',
                                }}
                              >
                        {getCurrentColumns().map((column, colIndex) => {
                          // For new API, we need to map column titles to row keys
                          let value;
                          if (settledData !== null || unsettledData !== null) {
                            // Use dual API data
                            const currentData = activeTab === 0 ? settledData : unsettledData;
                            const columnDef = currentData?.columns?.find(col => col.title === column);
                            if (columnDef) {
                              value = (row as any)[columnDef.key];
                              
                              // Fallback: if the key from column definition doesn't exist, try common alternatives
                              if ((value === undefined || value === null || value === '') && column === 'Settlement Value') {
                                // Try both common key names
                                const fallbackValue = (row as any).settlement_amount || (row as any).settlement_value;
                                if (fallbackValue !== undefined && fallbackValue !== null) {
                                  value = fallbackValue;
                                  console.log('[Settlement Value Fallback - Dual API] Column key:', columnDef.key, 'returned:', (row as any)[columnDef.key], 'Using fallback settlement_amount:', (row as any).settlement_amount);
                                }
                              }
                            }
                          } else if (useNewAPI && totalTransactionsData) {
                            const columnDef = totalTransactionsData.columns.find(col => col.title === column);
                            if (columnDef) {
                              value = (row as any)[columnDef.key];
                              
                              // Fallback: if the key from column definition doesn't exist, try common alternatives
                              if ((value === undefined || value === null || value === '') && column === 'Settlement Value') {
                                // Try both common key names
                                const fallbackValue = (row as any).settlement_amount || (row as any).settlement_value;
                                if (fallbackValue !== undefined && fallbackValue !== null) {
                                  value = fallbackValue;
                                  console.log('[Settlement Value Fallback - New API] Column key:', columnDef.key, 'returned:', (row as any)[columnDef.key], 'Using fallback settlement_amount:', (row as any).settlement_amount);
                                }
                              }
                            }
                          } else {
                            value = (row as any)[column];
                          }
                          
                          // Format value based on type
                          let displayValue = value;
                          
                          if (settledData !== null || unsettledData !== null) {
                            // Use dual API data for formatting
                            const currentData = activeTab === 0 ? settledData : unsettledData;
                            const columnDef = currentData?.columns?.find(col => col.title === column);
                            if (columnDef) {
                              switch (columnDef.type) {
                                case 'currency':
                                  displayValue = formatCurrency(Number(value) || 0);
                                  break;
                                case 'date':
                                  displayValue = formatDate(String(value));
                                  break;
                                case 'enum':
                                  displayValue = String(value || '');
                                  break;
                                default:
                                  displayValue = String(value || '');
                              }
                            }
                          } else if (useNewAPI && totalTransactionsData) {
                            // Use column type information for formatting
                            const columnDef = totalTransactionsData.columns.find(col => col.title === column);
                            if (columnDef) {
                              switch (columnDef.type) {
                                case 'currency':
                                  displayValue = formatCurrency(Number(value) || 0);
                                  break;
                                case 'date':
                                  displayValue = formatDate(String(value));
                                  break;
                                case 'enum':
                                  displayValue = String(value || '');
                                  break;
                                default:
                                  displayValue = String(value || '');
                              }
                            }
                          } else {
                            // Old API formatting
                            if (column === 'Reason') {
                              // Default reason to the remark for now
                              displayValue = (row as any)['Remark'] || value || '-';
                            } else if (typeof value === 'number') {
                              if (column === 'Order Value' || column === 'Settlement Value' || column === 'Difference') {
                                displayValue = formatCurrency(value);
                              } else {
                                displayValue = value.toLocaleString('en-IN');
                              }
                            } else if (column.includes('Date')) {
                              displayValue = formatDate(value || '');
                            }
                          }
                          
                          // Capitalize platform column
                          if (column === 'Platform' || column === 'platform') {
                            displayValue = String(displayValue || '').toUpperCase();
                          }
                          
                          return (
                            <TableCell
                              key={`${(row["Order ID"] || row["Order Item ID"] || row["order_id"] || row["order_item_id"])}-${column}-${colIndex}`}
                              sx={{
                                background: '#ffffff',
                                textAlign: 'center',
                                minWidth: column === 'Action' ? 140 : 150,
                                fontWeight: 600,
                                color: column === 'Status' ? '#111827' : '#111827',
                                pr: column === 'Action' ? 0 : undefined,
                                pl: column === 'Action' ? 0 : undefined,
                                '&:hover': {
                                  background: '#f9fafb',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {column === 'Status' ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* Recon Status from row data */}
                                    {(() => {
                                      const reconStatus = row.recon_status || (row as any)?.originalData?.recon_status;
                                      
                                      if (reconStatus) {
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
                                      } else {
                                        // Fallback to showing "Unsettled" if no recon_status
                                        return (
                                          <Chip
                                            label="Unsettled"
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
                                        );
                                      }
                                    })()}
                                    
                                    {/* Event Type chip based on event_type from API */}
                                    {(() => {
                                      const eventType = row.event_type || (row as any)?.originalData?.event_type || 'Sale';
                                      const isSale = eventType?.toLowerCase() === 'sale';
                                      
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
                                    
                                    {/* Breakups details button */}
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleBreakupsOpen(e, row)}
                                      sx={{
                                        p: 0.5,
                                        minWidth: 20,
                                        height: 20,
                                        '&:hover': {
                                          background: '#f3f4f6',
                                          color: '#374151',
                                        },
                                      }}
                                    >
                                      <InfoOutlined fontSize="small" sx={{ color: '#6b7280' }}/>
                                    </IconButton>
                                  </Box>

                                ) : (
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {displayValue}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          );
                        })}
                            </TableRow>
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{  borderTop: '0.1px solid #e5e7eb' }}>
                <TablePagination
                  rowsPerPageOptions={[100]}
                  component="div"
                  count={totalCount || filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      color: '#6b7280',
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            </Card>
          </Fade>
        </Box>


        
        {/* Transaction Details Popup */}
        <TransactionDetailsPopup
          transaction={selectedTransaction}
          onClose={() => {
            setSelectedTransaction(null);
            setAnchorEl(null);
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          anchorEl={anchorEl}
        />

        {/* Breakups Modal */}
        <BreakupsModal
          open={breakupsModalOpen}
          onClose={() => {
            setBreakupsModalOpen(false);
            setSelectedBreakups(null);
            setBreakupsAnchorEl(null);
            setBreakupsOrderId('');
          }}
          breakups={selectedBreakups}
          orderId={breakupsOrderId}
          anchorEl={breakupsAnchorEl}
        />

        {/* Filter Menu Portal - Rendered outside table container */}
        {(() => {
          const shouldRender = Boolean(headerFilterAnchor) && Boolean(activeFilterColumn);
          console.log('Portal render check:', { 
            headerFilterAnchor: !!headerFilterAnchor, 
            activeFilterColumn, 
            shouldRender 
          });
          return shouldRender;
        })() && (
          <Portal>
            <Box
              data-filter-popup="true"
              aria-hidden={false}
              tabIndex={-1}
              sx={{
                position: 'fixed',
                top: (() => {
                  if (headerFilterAnchor) {
                    const rect = headerFilterAnchor.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const popupHeight = 200; // estimated popup height
                    
                    // If not enough space below, position above
                    if (spaceBelow < popupHeight) {
                      return rect.top - popupHeight - 5;
                    }
                    // Offset 5% lower for better spacing
                    return rect.bottom + Math.round(window.innerHeight * 0.02);
                  }
                  return 100;
                })(),
                left: (() => {
                  if (headerFilterAnchor) {
                    const rect = headerFilterAnchor.getBoundingClientRect();
                    // Match the wider popup; keep a little margin
                    const popupWidth = 520;
                    const margin = 10;
                    const spaceRight = window.innerWidth - rect.left;
                    
                    // If not enough space on right, align to right edge with margin
                    if (spaceRight < popupWidth) {
                      return Math.max(margin, rect.right - popupWidth);
                    }
                    // Otherwise clamp within viewport
                    return Math.max(margin, Math.min(rect.left, window.innerWidth - popupWidth - margin));
                  }
                  return 100;
                })(),
                zIndex: 9999,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                p: 2,
                minWidth: 480,
                maxWidth: 560,
                animation: 'filterPopupFadeIn 0.15s ease-out',
                '@keyframes filterPopupFadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-10px) scale(0.95)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                  },
                },
              }}
              onClick={(e) => e.stopPropagation()}
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
                        // Show if supported by at least one selected platform
                        return selectedPlatforms.some(p => mapping.supportedPlatforms!.includes(p as any));
                      })
                      .map((col) => (
                        <ListItemButton
                          key={col}
                          selected={activeFilterColumn === col}
                          onClick={() => setActiveFilterColumn(col)}
                          sx={{ borderRadius: 0.75, py: 0.75, px: 1 }}
                        >
                          <ListItemText 
                            primary={col} 
                            primaryTypographyProps={{ fontSize: '0.82rem' }}
                            secondary={
                              COLUMN_TO_API_PARAM_MAP[col]?.supportedPlatforms 
                                ? `(${COLUMN_TO_API_PARAM_MAP[col].supportedPlatforms?.join(', ')})` 
                                : undefined
                            }
                            secondaryTypographyProps={{ fontSize: '0.65rem', color: '#9ca3af' }}
                          />
                        </ListItemButton>
                      ))}
                  </List>
                </Box>
                {/* Right: Reusable controls */}
                <ColumnFilterControls
                  columnMeta={COLUMN_META as any}
                  activeColumn={activeFilterColumn || 'Status'}
                  setActiveColumn={(c) => setActiveFilterColumn(c)}
                  pendingFilters={pendingColumnFilters}
                  handleStringChange={handleStringFilterChange}
                  handleNumberRangeChange={handleNumberRangeChange}
                  handleDateRangeChange={handleDateRangeFilterChange}
                  handleEnumChange={handleEnumFilterChange}
                  getEnumOptions={getUniqueValuesForColumn}
                  onClear={(col) => clearColumnFilter(col)}
                  onApply={applyFilters}
                  orderIdChips={orderIdChips}
                  setOrderIdChips={setOrderIdChips}
                />
            </Box>
            </Box>
          </Portal>
        )}
      </Box>
    </Slide>
  );
};

export default TransactionSheet; 