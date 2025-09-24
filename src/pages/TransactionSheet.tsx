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
} from '@mui/material';
import ColumnFilterControls from '../components/ColumnFilterControls';
import { api } from '../services/api';
import { OrdersResponse, OrderItem, MarketplaceReconciliationResponse } from '../services/api/types';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
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
}

// API Response structure based on actual data
interface TransactionApiResponse {
  calculation: {
    inputs: {
      customer_addons_amount: string;
      marketplace_fee: string;
      offer_adjustments: string;
      refund: string;
      reverse: string;
      seller_share_offer: string;
      settlement_sale_value: string;
      settlement_value: string;
      taxes: string;
      total_offer_amount: string;
    };
  };
  context: {
    buyer_invoice_amount: string;
    tcs: string;
    tds: string;
  };
  diff: string;
  order_date: string;
  order_item_id: string;
  order_value: string;
  settlement_date: string | null;
  settlement_value: string;
  status: string;
}

interface TransactionData {
  columns: string[];
  rows: TransactionRow[];
}

// API Response metadata types
interface TransactionMetadata {
  counts: {
    excess_received: number;
    settlement_matched: number;
    settled: number
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
  diff_min?: number;
  diff_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  order_id?: string;
  remark?: string;
}

// Transform API data to TransactionRow format
const transformOrderItemToTransactionRow = (orderItem: any): TransactionRow => {
  // Debug logging to see what we're getting from the API
  console.log('OrderItem from API:', orderItem);
  console.log('Available fields in OrderItem:', Object.keys(orderItem));
  
  // Check for the new API structure
  if (orderItem.calculation?.inputs) {
    console.log('New API structure found - calculation.inputs:', orderItem.calculation.inputs);
  }
  if (orderItem.context) {
    console.log('New API structure found - context:', orderItem.context);
  }
  
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

  // Extract values from the new API structure
  const orderValue = parseNumericValue(orderItem.order_value || orderItem.buyer_invoice_amount);
  const settlementValue = parseNumericValue(orderItem.settlement_value);
  const difference = parseNumericValue(orderItem.diff);
  
  console.log('Parsed values - orderValue:', orderValue, 'settlementValue:', settlementValue, 'difference:', difference);
  
  // (Deprecated) legacy path removed; order item id handled below
  
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
      settlementDate = "Pending";
    }
  } else {
    settlementDate = "Pending";
  }
  
  // Determine IDs from API response
  const backendOrderId: string | undefined = (orderItem as any).order_id || (orderItem as any).orderId;
  let orderItemId: string | undefined = (orderItem as any).order_item_id || (orderItem as any).orderItemId;
  if (!orderItemId || String(orderItemId).trim() === '') {
    orderItemId = undefined;
  }
  
  return {
    "Order ID": backendOrderId || orderItemId || `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    "Order Item ID": orderItemId,
    "Order Value": orderValue,
    "Settlement Value": settlementValue,
    "Invoice Date": new Date(orderItem.order_date).toISOString().split('T')[0],
    "Settlement Date": settlementDate,
    "Difference": difference,
    "Remark": remark,
    // Derive event type from order value: > 0 => Sale, else Return
    "Event Type": orderValue > 0 ? "Sale" : "Return",
    // Preserve the original API response data for popup access
    originalData: orderItem as TransactionApiResponse,
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
              color: status === 'Matched' ? '#059669' : '#dc2626',
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

interface TransactionSheetProps {
  onBack: () => void;
  open?: boolean;
  transaction?: any;
  statsData?: MarketplaceReconciliationResponse | null;
  initialTab?: number;
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ onBack, open, transaction, statsData: propsStatsData, initialTab = 0 }) => {
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
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  // Column filters can be string (contains), number range {min,max}, date range {from,to}, or enum string[]
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: any }>({});
  // Pending filters that haven't been applied yet
  const [pendingColumnFilters, setPendingColumnFilters] = useState<{ [key: string]: any }>({});
  const [pendingDateRange, setPendingDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [filteredData, setFilteredData] = useState<TransactionRow[]>([]);
  const [allTransactionData, setAllTransactionData] = useState<TransactionRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(getInitialTab() === 0 ? 0 : getInitialTab() === 1 ? 1 : 0);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [tabCounts, setTabCounts] = useState<{ settled: number | null; unsettled: number | null }>({ settled: null, unsettled: null });
  const [metadata, setMetadata] = useState<TransactionMetadata | null>(null);


  // Rely on MUI Menu's built-in outside click handling
  
  // Dropdown menu state for Status column


  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Helper function to format date in "17th March, 2025" format
  const formatDateWithOrdinal = (dateString: string) => {
    if (!dateString) return '';
    
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

  // Column metadata for rendering filter UIs
  const COLUMN_META: Record<string, { type: 'string' | 'number' | 'date' | 'enum' }> = {
    'Order ID': { type: 'string' },
    'Order Value': { type: 'number' },
    'Settlement Value': { type: 'number' },
    'Invoice Date': { type: 'date' },
    'Settlement Date': { type: 'date' },
    'Difference': { type: 'number' },
    'Status': { type: 'enum' },
    'Reason': { type: 'string' },
    'Action': { type: 'string' },
  };

  // Sorting functions
  const handleSort = (columnKey: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === columnKey) {
        if (prevConfig.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else {
          return null; // Remove sorting
        }
      } else {
        return { key: columnKey, direction: 'asc' };
      }
    });
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
    // For Status, show unique backend statuses plus Sale/Return (event types)
    if (columnName === 'Status') {
      // Hardcoded per request
      return ['excess_received', 'short_received', 'settlement_matched'];
    }

    const values = new Set<string>();
    allTransactionData.forEach(row => {
      const value = row[columnName as keyof TransactionRow];
      if (typeof value === 'string' && value) {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  // Helper: chip colors for remark values
  const getRemarkChipColors = (remark: string): { background: string; color: string } => {
    switch (remark) {
      case 'Matched':
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
    overrideDateRange?: {start: string, end: string}
  ): TransactionQueryParams => {
    const params: TransactionQueryParams = {
      page: pageNumber,
      limit: 50
    };

    // Set status based on remark or activeTab
    const remarkToUse = remark || (activeTab === 0 ? 'settlement_matched' : 'unsettled');
    if (remarkToUse === 'settlement_matched') {
      params.status_in = 'settlement_matched';
      console.log('Setting API parameter: status_in = settlement_matched (for Settled tab)');
    } else if (remarkToUse === 'unsettled') {
      params.status_in = 'unsettled';
      console.log('Setting API parameter: status_in = unsettled (for Unsettled tab)');
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

        switch (columnKey) {
          case 'Order ID':
            if (typeof filterValue === 'string' && filterValue.trim()) {
              params.order_id = filterValue.trim();
            }
            break;
          
          case 'Invoice Date':
            if (filterValue.from && filterValue.to) {
              params.order_date_from = filterValue.from;
              params.order_date_to = filterValue.to;
            }
            break;
          
          case 'Difference':
            if (typeof filterValue === 'object') {
              if (filterValue.min !== undefined && filterValue.min !== '') {
                params.diff_min = parseFloat(filterValue.min);
              }
              if (filterValue.max !== undefined && filterValue.max !== '') {
                params.diff_max = parseFloat(filterValue.max);
              }
            }
            break;

          case 'Status':
            // Status filter can include backend statuses and event types (Sale/Return)
            if (Array.isArray(filterValue)) {
              const statuses: string[] = [];
              const eventTypes: string[] = [];
              filterValue.forEach((val: string) => {
                if (val === 'Sale' || val === 'Return') eventTypes.push(val.toLowerCase());
                else statuses.push(val);
              });
              if (statuses.length > 0) params.status_in = statuses.join(',');
              if (eventTypes.length > 0) (params as any).event_type_in = eventTypes.join(',');
            }
            break;
        }
      });

      // Apply date range filter if set
      const dateRangeToUse = overrideDateRange || dateRange;
      if (dateRangeToUse.start && dateRangeToUse.end) {
        params.order_date_from = dateRangeToUse.start;
        params.order_date_to = dateRangeToUse.end;
      }
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
      
      const response = await api.transactions.getTransactions(queryParams as any);
      
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

  const fetchOrders = async (pageNumber: number = 1, remark?: string) => {
    const isInitialLoad = pageNumber === 1 && allTransactionData.length === 0;
    
    if (!isInitialLoad) {
      setPaginationLoading(true);
    }
    setError(null);
    
    try {
      const queryParams = buildQueryParams(pageNumber, remark);
      console.log(`Fetching orders with params:`, queryParams);
      
      // Example query string that would be sent to API:
      // status_in=unsettled&order_date_from=2025-04-01&order_date_to=2025-04-30&diff_min=-500&diff_max=0&sort_by=order_date&sort_order=desc&order_item_id=333981993553920100
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      console.log(`Query string:`, queryString);
      
      const response = await api.transactions.getTransactions(queryParams as any);
      
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

  // Fetch data on component mount
  useEffect(() => {
    setLoading(true);
    // Start with settled transactions (activeTab = 0)
    fetchOrders(1, 'settlement_matched');
    // Prefetch counts for all tabs
    fetchTabCount('settlement_matched');
    fetchTabCount('unsettled');
  }, []);

  // Apply filters function - called when Apply button is clicked
  const applyFilters = () => {
    // Copy pending filters to active filters
    setColumnFilters(pendingColumnFilters);
    setDateRange(pendingDateRange);
    
    // Trigger API call with pending filters (don't wait for state update)
    const currentRemark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
    fetchOrdersWithFilters(1, currentRemark, pendingColumnFilters, pendingDateRange);
    // Also refresh tab counts with pending filters
    fetchTabCountWithFilters('settlement_matched', pendingColumnFilters, pendingDateRange);
    fetchTabCountWithFilters('unsettled', pendingColumnFilters, pendingDateRange);
    
    // Close the filter popover
    closeFilterPopover();
  };

  // Only refresh data when rowsPerPage changes (not filters)
  useEffect(() => {
    if (allTransactionData.length > 0) { // Only refetch if data has been loaded initially
      const currentRemark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
      fetchOrders(1, currentRemark);
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
      
      const response = await api.transactions.getTransactions(queryParams as any);
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
      
      const response = await api.transactions.getTransactions(queryParams as any);
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
  const handleTransactionDetailsOpen = (event: React.MouseEvent<HTMLElement>, row: TransactionRow) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Debug logging to see what data we're passing to the popup
    console.log('Opening popup for row:', row);
    console.log('Row data structure:', Object.keys(row));
    console.log('Original data in row:', (row as any).originalData);
    
    setSelectedTransaction(row);
    setAnchorEl(event.currentTarget);
  };

  // Filter data based on search, date range, and column filters
  useEffect(() => {
    if (allTransactionData.length > 0) {
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
          const orderDate = new Date(row["Invoice Date"]);
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
          const value = row[columnKey as keyof TransactionRow] as any;
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
    const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
    fetchOrders(newPageNumber, remark);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Reset to first page when changing rows per page
    const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
    fetchOrders(1, remark);
  };

  // Export to Excel
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = filteredData.map(row => ({
        'Order Item ID': row['Order Item ID'],
        'Order Value': row['Order Value'],
        'Invoice Date': row['Invoice Date'],
        'Settlement Date': row['Settlement Date'],
        'Difference': row['Difference'],
        'Remark': row['Remark'],
        'Event Type': row['Event Type']
      }));

      // Convert to CSV format
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Handle special characters and commas in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
              link.setAttribute('download', `transaction_sheet_${activeTab === 0 ? 'settled' : 'unsettled'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      // You could add a toast notification here if you have a notification system
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setColumnFilters({});
    setPage(0);
    setCurrentPage(1);
    const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
    fetchOrders(1, remark);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(`Tab changed from ${activeTab} to ${newValue}`);
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
    setCurrentPage(1); // Reset current page
    
    // Determine the correct remark based on the new tab value
    const remark = newValue === 0 ? 'settlement_matched' : 'unsettled';
    console.log(`Fetching data for tab ${newValue} with remark: ${remark}`);
    fetchOrders(1, remark); // Fetch first page data with correct remark
  };

  // Handle transaction row click
  const handleTransactionClick = (transaction: TransactionRow, event: React.MouseEvent<HTMLElement>) => {
    setSelectedTransaction(transaction);
    setAnchorEl(event.currentTarget);
  };



  // Get current data based on active tab
  const getCurrentData = () => {
    // For pagination, we work with the current page data
    return allTransactionData;
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
                      <Tab label={`Settled${tabCounts.settled != null ? ` (${tabCounts.settled})` : ''}`} />
                      <Tab label={`Unsettled${tabCounts.unsettled != null ? ` (${tabCounts.unsettled})` : ''}`} />
                    </Tabs>
                    
                  
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    
                    <IconButton
                      onClick={() => {
                        const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
                        fetchOrders(1, remark);
                      }}
                      disabled={loading}
                      sx={{
                        color: '#1f2937',
                        '&:hover': {
                          background: '#f9fafb',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                    
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={(e) => openFilterPopover('Status', e.currentTarget as any)}
                      sx={{ textTransform: 'none', borderColor: '#1f2937', color: '#1f2937' }}
                    >
                      Filters
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={handleExport}
                      sx={{
                        borderColor: '#1f2937', 
                        color: '#1f2937',
                        textTransform: 'none',
                      }}
                    >
                      Export
                    </Button>
                  </Box>
                </Box>

                {/* Active filter chips row directly under the header row, aligned under back button */}
                {!!Object.keys(columnFilters).filter(k => columnFilters[k]).length && (
                  <Box sx={{ml: 6, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
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
                            const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
                            fetchOrdersWithFilters(1, remark, next, pendingDateRange);
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
                  const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
                  fetchOrders(1, remark);
                }}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {loading && (
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
                                              {visibleColumns.map((column, index) => (
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                                      aria-label={`Sort ${column}`}
                                    >
                                      {getSortIcon(column)}
                                    </IconButton>
                              </Box>
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && allTransactionData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} sx={{ textAlign: 'center', py: 6 }}>
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
                        <TableCell colSpan={visibleColumns.length} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={30} sx={{ color: '#3b82f6' }} />
                            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                              Loading page {currentPage}...
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            No transactions found matching your criteria.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData
                        .map((row, rowIndex) => {
                        const isSelected = (selectedTransaction?.["Order ID"] || selectedTransaction?.["Order Item ID"]) === (row["Order ID"] || row["Order Item ID"]);
                        return (
                          <React.Fragment key={rowIndex}>
                                                          <TableRow 
                                sx={{ 
                                  borderLeft: `4px solid ${activeTab === 0 ? '#10b981' : '#ef4444'}`,
                                  background: '#ffffff',
                                  position: 'relative',
                                }}
                              >
                        {visibleColumns.map((column, colIndex) => {
                          const value = (row as any)[column];
                          
                          // Format value based on type
                          let displayValue = value;
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
                            displayValue = formatDate(value);
                          }
                          
                          return (
                            <TableCell
                              key={`${(row["Order ID"] || row["Order Item ID"])}-${column}-${colIndex}`}
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
                                    {/* Backend Status chip (exact value from API) */}
                                    {((row as any)?.originalData?.status) && (
                                    <Chip
                                        label={(row as any).originalData.status}
                                      size="small"
                                      sx={{
                                          background: '#f3f4f6',
                                          color: '#111827',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: 24,
                                        '& .MuiChip-label': { px: 1 },
                                      }}
                                    />
                                    )}
                                    {/* Event Type chip */}
                                    <Chip
                                      label={(row as any)['Event Type']}
                                      size="small"
                                      sx={{
                                        background: (row as any)['Event Type'] === 'Sale' ? '#dcfce7' : '#fee2e2',
                                        color: (row as any)['Event Type'] === 'Sale' ? '#059669' : '#dc2626',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: 24,
                                        '& .MuiChip-label': { px: 1 },
                                      }}
                                    />
                                    {/* Transaction details button */}
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleTransactionDetailsOpen(e, row)}
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
                  activeColumn={activeFilterColumn || 'Status'}
                  setActiveColumn={(c) => setActiveFilterColumn(c)}
                  pendingFilters={pendingColumnFilters}
                  handleStringChange={handleStringFilterChange}
                  handleNumberRangeChange={handleNumberRangeChange}
                  handleDateRangeChange={handleDateRangeFilterChange}
                  handleEnumChange={handleEnumFilterChange}
                  getEnumOptions={getUniqueValuesForColumn}
                  onClear={(col) => clearColumnFilter(col)}
                  onApply={() => {
                    // Apply pending column/date filters
                    setColumnFilters(pendingColumnFilters);
                    setDateRange(pendingDateRange);
                    closeFilterPopover();
                    // Refresh data with applied filters
                    fetchOrdersWithFilters();
                    fetchTabCountWithFilters('settlement_matched', pendingColumnFilters, pendingDateRange);
                    fetchTabCountWithFilters('unsettled', pendingColumnFilters, pendingDateRange);
                  }}
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