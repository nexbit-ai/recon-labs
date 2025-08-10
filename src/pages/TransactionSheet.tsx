import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';

// Type definitions for transaction data
interface TransactionRow {
  "Order Item ID": string;
  "Order Value": number;
  "Settlement Value": number;
  "Order Date": string;
  "Settlement Date": string;
  "Difference": number;
  "Remark": string;
  "Event Type": string;
  [key: string]: any; // Allow dynamic access
}

interface TransactionData {
  columns: string[];
  rows: TransactionRow[];
}

// Transform API data to TransactionRow format
const transformOrderItemToTransactionRow = (orderItem: OrderItem): TransactionRow => {
  const orderValue = parseFloat(orderItem.buyer_invoice_amount);
  const settlementValue = parseFloat(orderItem.settlement_value);
  const difference = parseFloat(orderItem.diff);
  
  // Debug logging to see what we're getting from the API
  console.log('payment_date from API:', orderItem.payment_date);
  console.log('OrderItem from API:', orderItem);
  console.log('order_item_id:', orderItem.order_item_id);
  
  // Handle missing or empty order_item_id
  let orderItemId = orderItem.order_item_id;
  if (!orderItemId || orderItemId.trim() === '') {
    // Try alternative field names that might be used in the API
    const alternativeFields = [
      'id',
      'item_id', 
      'orderItemId',
      'orderItem_id',
      'order_itemId',
      'itemId',
      'orderId',
      'order_id'
    ];
    
    for (const field of alternativeFields) {
      if ((orderItem as any)[field] && (orderItem as any)[field].toString().trim() !== '') {
        orderItemId = (orderItem as any)[field].toString();
        console.log(`Found order item ID in alternative field '${field}':`, orderItemId);
        break;
      }
    }
    
    // If still no ID found, generate a fallback
    if (!orderItemId || orderItemId.trim() === '') {
      orderItemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.warn('No order item ID found in any field, using fallback:', orderItemId);
    }
  }
  
  // Determine remark based on API response
  let remark = "Pending Settlement";
  if (orderItem.remark === "settlement_matched") {
    if (difference === 0) {
      remark = "Matched";
    } else if (difference > 0) {
      remark = "Short Amount Received";
    } else {
      remark = "Excess Amount Received";
    }
  } else if (orderItem.event_type === "Return") {
    remark = "Return Initiated";
  }
  
  // Determine settlement date from API response
  let settlementDate = "";
  if (orderItem.payment_date && orderItem.payment_date.trim() !== '') {
    // Use the actual payment_date from API if available
    try {
      settlementDate = new Date(orderItem.payment_date).toISOString().split('T')[0];
    } catch (error) {
      settlementDate = "Invalid Date";
    }
  } else {
    // Show "Invalid Date" when payment_date is null or empty
    settlementDate = "Invalid Date";
  }
  
  return {
    "Order Item ID": orderItemId,
    "Order Value": orderValue,
    "Settlement Value": settlementValue,
    "Order Date": new Date(orderItem.order_date).toISOString().split('T')[0],
    "Settlement Date": settlementDate,
    "Difference": difference,
    "Remark": remark,
    "Event Type": orderItem.event_type,
  };
};

// Mock data with new structure as per requirements
const mockTransactionData: TransactionData = {
  columns: [
    "Order Item ID",
    "Order Value",
    "Settlement Value",
    "Order Date",
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
      "Order Date": "2025-01-15",
      "Settlement Date": "2025-01-20",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12346",
      "Order Value": 850,
      "Settlement Value": 850,
      "Order Date": "2025-01-16",
      "Settlement Date": "2025-01-21",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12347",
      "Order Value": 2100,
      "Settlement Value": 2100,
      "Order Date": "2025-01-17",
      "Settlement Date": "2025-01-22",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12349",
      "Order Value": 1600,
      "Settlement Value": 1600,
      "Order Date": "2025-01-19",
      "Settlement Date": "2025-01-24",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12350",
      "Order Value": 950,
      "Settlement Value": 950,
      "Order Date": "2025-01-20",
      "Settlement Date": "2025-01-25",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12351",
      "Order Value": 1800,
      "Settlement Value": 1800,
      "Order Date": "2025-01-21",
      "Settlement Date": "2025-01-26",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12352",
      "Order Value": 1350,
      "Settlement Value": 1350,
      "Order Date": "2025-01-22",
      "Settlement Date": "2025-01-27",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12353",
      "Order Value": 2200,
      "Settlement Value": 2200,
      "Order Date": "2025-01-23",
      "Settlement Date": "2025-01-28",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12354",
      "Order Value": 1100,
      "Settlement Value": 1100,
      "Order Date": "2025-01-24",
      "Settlement Date": "2025-01-29",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12355",
      "Order Value": 1700,
      "Settlement Value": 1700,
      "Order Date": "2025-01-25",
      "Settlement Date": "2025-01-30",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12356",
      "Order Value": 1400,
      "Settlement Value": 1400,
      "Order Date": "2025-01-26",
      "Settlement Date": "2025-02-01",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12357",
      "Order Value": 1900,
      "Settlement Value": 1900,
      "Order Date": "2025-01-27",
      "Settlement Date": "2025-02-02",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12358",
      "Order Value": 1250,
      "Settlement Value": 1250,
      "Order Date": "2025-01-28",
      "Settlement Date": "2025-02-03",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12359",
      "Order Value": 2300,
      "Settlement Value": 2300,
      "Order Date": "2025-01-29",
      "Settlement Date": "2025-02-04",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12360",
      "Order Value": 1000,
      "Settlement Value": 1000,
      "Order Date": "2025-01-30",
      "Settlement Date": "2025-02-05",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12361",
      "Order Value": 1550,
      "Settlement Value": 1550,
      "Order Date": "2025-02-01",
      "Settlement Date": "2025-02-06",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12362",
      "Order Value": 2000,
      "Settlement Value": 2000,
      "Order Date": "2025-02-02",
      "Settlement Date": "2025-02-07",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12363",
      "Order Value": 1150,
      "Settlement Value": 1150,
      "Order Date": "2025-02-03",
      "Settlement Date": "2025-02-08",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12364",
      "Order Value": 1750,
      "Settlement Value": 1750,
      "Order Date": "2025-02-04",
      "Settlement Date": "2025-02-09",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12365",
      "Order Value": 1300,
      "Settlement Value": 1300,
      "Order Date": "2025-02-05",
      "Settlement Date": "2025-02-10",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12366",
      "Order Value": 1850,
      "Settlement Value": 1850,
      "Order Date": "2025-02-06",
      "Settlement Date": "2025-02-11",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12367",
      "Order Value": 1450,
      "Settlement Value": 1450,
      "Order Date": "2025-02-07",
      "Settlement Date": "2025-02-12",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12368",
      "Order Value": 1950,
      "Settlement Value": 1950,
      "Order Date": "2025-02-08",
      "Settlement Date": "2025-02-13",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12369",
      "Order Value": 1200,
      "Settlement Value": 1200,
      "Order Date": "2025-02-09",
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
      "Order Date": "2025-01-18",
      "Settlement Date": "2025-01-23",
      "Difference": -50,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12370",
      "Order Value": 800,
      "Settlement Value": 800,
      "Order Date": "2025-02-10",
      "Settlement Date": "2025-02-15",
      "Difference": 25,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12371",
      "Order Value": 650,
      "Settlement Value": 650,
      "Order Date": "2025-02-11",
      "Settlement Date": "2025-02-16",
      "Difference": -30,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12372",
      "Order Value": 900,
      "Settlement Value": 900,
      "Order Date": "2025-02-12",
      "Settlement Date": "2025-02-17",
      "Difference": 45,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12373",
      "Order Value": 550,
      "Settlement Value": 550,
      "Order Date": "2025-02-13",
      "Settlement Date": "2025-02-18",
      "Difference": -20,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12374",
      "Order Value": 700,
      "Settlement Value": 700,
      "Order Date": "2025-02-14",
      "Settlement Date": "2025-02-19",
      "Difference": 35,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12375",
      "Order Value": 450,
      "Settlement Value": 450,
      "Order Date": "2025-02-15",
      "Settlement Date": "2025-02-20",
      "Difference": -15,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12376",
      "Order Value": 600,
      "Settlement Value": 600,
      "Order Date": "2025-02-16",
      "Settlement Date": "2025-02-21",
      "Difference": 40,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12377",
      "Order Value": 850,
      "Settlement Value": 850,
      "Order Date": "2025-02-17",
      "Settlement Date": "2025-02-22",
      "Difference": -25,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12378",
      "Order Value": 500,
      "Settlement Value": 500,
      "Order Date": "2025-02-18",
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
      "Order Date": "2025-02-19",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12380",
      "Order Value": 400,
      "Settlement Value": 400,
      "Order Date": "2025-02-20",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12381",
      "Order Value": 650,
      "Settlement Value": 650,
      "Order Date": "2025-02-21",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12382",
      "Order Value": 900,
      "Settlement Value": 900,
      "Order Date": "2025-02-22",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12383",
      "Order Value": 550,
      "Settlement Value": 550,
      "Order Date": "2025-02-23",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12384",
      "Order Value": 800,
      "Settlement Value": 800,
      "Order Date": "2025-02-24",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12385",
      "Order Value": 700,
      "Settlement Value": 700,
      "Order Date": "2025-02-25",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12386",
      "Order Value": 600,
      "Settlement Value": 600,
      "Order Date": "2025-02-26",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12387",
      "Order Value": 850,
      "Settlement Value": 850,
      "Order Date": "2025-02-27",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12388",
      "Order Value": 500,
      "Settlement Value": 500,
      "Order Date": "2025-02-28",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12389",
      "Order Value": 750,
      "Settlement Value": 750,
      "Order Date": "2025-03-01",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12390",
      "Order Value": 650,
      "Settlement Value": 650,
      "Order Date": "2025-03-02",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12391",
      "Order Value": 900,
      "Settlement Value": 900,
      "Order Date": "2025-03-03",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12392",
      "Order Value": 550,
      "Settlement Value": 550,
      "Order Date": "2025-03-04",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12393",
      "Order Value": 800,
      "Settlement Value": 800,
      "Order Date": "2025-03-05",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12394",
      "Order Value": 700,
      "Settlement Value": 700,
      "Order Date": "2025-03-06",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12395",
      "Order Value": 600,
      "Settlement Value": 600,
      "Order Date": "2025-03-07",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12396",
      "Order Value": 850,
      "Settlement Value": 850,
      "Order Date": "2025-03-08",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order Item ID": "FK12397",
      "Order Value": 500,
      "Settlement Value": 500,
      "Order Date": "2025-03-09",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order Item ID": "FK12398",
      "Order Value": 750,
      "Settlement Value": 750,
      "Order Date": "2025-03-10",
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
  if (!transaction || !anchorEl) return null;

  // Calculate smart positioning
  const getPopupPosition = () => {
    const rect = anchorEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 500; // Increased estimated popup height
    const popupWidth = 380;
    const offset = 12;

    // Calculate vertical position
    let top: number;
    let animationDirection: 'up' | 'down' = 'down';
    let maxHeight: number | undefined;
    
    if (rect.bottom + popupHeight + offset <= viewportHeight) {
      // Enough space below - show below
      top = rect.bottom + offset;
    } else if (rect.top - popupHeight - offset >= 0) {
      // Enough space above - show above
      top = rect.top - popupHeight - offset;
      animationDirection = 'up';
    } else {
      // Not enough space either way - position optimally and make scrollable
      if (rect.bottom + offset < viewportHeight / 2) {
        // More space below - show below with limited height
        top = rect.bottom + offset;
        maxHeight = viewportHeight - top - offset;
      } else {
        // More space above - show above with limited height
        top = offset;
        maxHeight = rect.top - offset * 2;
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

    // Fallback: ensure modal is always visible
    if (top < offset) {
      top = offset;
      maxHeight = viewportHeight - offset * 2;
    }
    if (top + (maxHeight || popupHeight) > viewportHeight - offset) {
      top = viewportHeight - (maxHeight || popupHeight) - offset;
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
          width: '380px',
          maxHeight: position.maxHeight ? `${position.maxHeight}px` : 'auto',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
        p: 2.5, 
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 700, 
            color: '#111827',
            mb: 0.5,
          }}>
            Transaction Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
            Order Item ID: {transaction["Order Item ID"]}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            background: '#f3f4f6',
            color: '#374151',
            '&:hover': {
              background: '#e5e7eb',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ 
        p: 2.5, 
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f5f9',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '3px',
          '&:hover': {
            background: '#94a3b8',
          },
        },
      }}>
        {/* Order Value - Primary Information */}
        <Box sx={{ 
          p: 2.5, 
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          mb: 2.5,
        }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Order Value
          </Typography>
          <Typography variant="h5" sx={{ 
            fontWeight: 800, 
            color: '#0f172a',
            mt: 1,
          }}>
            {formatCurrency(transaction["Order Value"])}
          </Typography>
        </Box>

        {/* Transaction Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Settlement Value
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Settlement Value"])}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Commission
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Order Value"] * 0.02)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              TDS Deducted
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Order Value"] * 0.01)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              TCS Deducted
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Order Value"] * 0.005)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Difference
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: transaction["Difference"] === 0 ? '#059669' : '#dc2626'
            }}>
              {formatCurrency(transaction["Difference"])}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Status
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: transaction["Remark"] === 'Matched' ? '#059669' : '#dc2626'
            }}>
              {transaction["Remark"]}
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
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ onBack, open, transaction, statsData: propsStatsData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  // Column filters can be string (contains), number range {min,max}, date range {from,to}, or enum string[]
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: any }>({});
  const [filteredData, setFilteredData] = useState<TransactionRow[]>([]);
  const [allTransactionData, setAllTransactionData] = useState<TransactionRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [tabCounts, setTabCounts] = useState<{ settled: number | null; unsettled: number | null }>({ settled: null, unsettled: null });

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
    'Order Item ID': { type: 'string' },
    'Order Value': { type: 'number' },
    'Settlement Value': { type: 'number' },
    'Order Date': { type: 'date' },
    'Settlement Date': { type: 'date' },
    'Difference': { type: 'number' },
    'Status': { type: 'enum' },
  };

  // Helpers to get enum options from current data
  const getUniqueValuesForColumn = (columnName: string): string[] => {
    // Special handling for computed columns
    if (columnName === 'Status') {
      const remarks = new Set<string>();
      const events = new Set<string>();
      allTransactionData.forEach(row => {
        const remark = (row as any)['Remark'];
        const eventType = (row as any)['Event Type'];
        if (typeof remark === 'string' && remark) remarks.add(`remark:${remark}`);
        if (typeof eventType === 'string' && eventType) events.add(`event:${eventType}`);
      });
      return [
        ...Array.from(remarks).sort((a,b) => a.localeCompare(b)),
        ...Array.from(events).sort((a,b) => a.localeCompare(b)),
      ];
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
  const fetchOrders = async (pageNumber: number = 1, remark?: string) => {
    const isInitialLoad = pageNumber === 1 && allTransactionData.length === 0;
    
    if (!isInitialLoad) {
      setPaginationLoading(true);
    }
    setError(null);
    
    try {
      // Use provided remark or determine from activeTab
      const remarkToUse = remark || (activeTab === 0 ? 'settlement_matched' : 'unsettled');
      console.log(`Fetching orders with remark: ${remarkToUse}, page: ${pageNumber}, activeTab: ${activeTab}`);
      const response = await api.orders.getOrders({
        page: pageNumber,
        limit: 100,
        remark: remarkToUse
      } as any);
      
      if (response.success && response.data.orders) {
        // Debug: Log the API response structure
        console.log('API Response:', response.data);
        console.log('Orders:', response.data.orders);
        
        // Transform all order items to transaction rows
        const transactionRows: TransactionRow[] = [];
        
        response.data.orders.forEach((order: any, orderIndex: number) => {
          console.log(`Order ${orderIndex}:`, order);
          console.log(`Order items for order ${orderIndex}:`, order.order_items);
          
          order.order_items.forEach((orderItem: OrderItem, itemIndex: number) => {
            console.log(`OrderItem ${itemIndex} in Order ${orderIndex}:`, orderItem);
            transactionRows.push(transformOrderItemToTransactionRow(orderItem));
          });
        });
        
        // For pagination, we show only the current page data
        setAllTransactionData(transactionRows);
        setFilteredData(transactionRows);
        setCurrentPage(pageNumber);
        
        // Update total count if available in response
        if ((response.data as any).pagination) {
          setTotalCount((response.data as any).pagination.total);
        } else {
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

  // Fetch data on component mount
  useEffect(() => {
    setLoading(true);
    // Start with settled transactions (activeTab = 0)
    fetchOrders(1, 'settlement_matched');
    // Prefetch counts for both tabs
    fetchTabCount('settlement_matched');
    fetchTabCount('unsettled');
  }, []);

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

  // Fetch only the count for a given remark without altering the table data
  const fetchTabCount = async (remark: 'settlement_matched' | 'unsettled') => {
    try {
      const response = await api.orders.getOrders({ page: 1, limit: 1, remark } as any);
      let count = 0;
      if ((response.data as any)?.pagination?.total != null) {
        count = (response.data as any).pagination.total;
      } else if (Array.isArray((response.data as any)?.orders)) {
        // Fallback to number of order_items across first order if pagination not provided
        const orders = (response.data as any).orders;
        count = orders.reduce((acc: number, o: any) => acc + (Array.isArray(o?.order_items) ? o.order_items.length : 0), 0);
      }
      setTabCounts(prev => ({
        ...prev,
        [remark === 'settlement_matched' ? 'settled' : 'unsettled']: count,
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
    setDateRange(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle string contains filter
  const handleStringFilterChange = (columnKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: event.target.value,
    }));
  };

  // Handle number range filter
  const handleNumberRangeChange = (columnKey: string, bound: 'min' | 'max') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setColumnFilters(prev => ({
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
    setColumnFilters(prev => ({
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
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  // Clear specific column filter
  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters(prev => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
  };

  // Open/close popover for a column
  const openFilterPopover = (columnKey: string, target: HTMLElement) => {
    console.log('openFilterPopover called:', columnKey, target);
    console.log('Setting state - activeFilterColumn:', columnKey, 'headerFilterAnchor:', !!target);
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
          const orderDate = new Date(row["Order Date"]);
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
      
      setFilteredData(filtered);
    }
  }, [searchTerm, dateRange, columnFilters, activeTab, allTransactionData]);

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
        'Order Date': row['Order Date'],
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
    return [
      "Order Item ID",
      "Order Value",
      "Settlement Value",
      "Order Date",
      "Settlement Date",
      "Difference",
      "Status"
    ];
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
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconButton
                      onClick={onBack}
                      size="small"
                      sx={{
                        background: '#1f2937',
                        color: 'white',
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
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const remark = activeTab === 0 ? 'settlement_matched' : 'unsettled';
                        fetchOrders(1, remark);
                      }}
                      disabled={loading}
                      sx={{
                        borderColor: '#1f2937',
                        color: '#1f2937',
                        borderRadius: '8px',
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#374151',
                          background: '#f9fafb',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ExportIcon />}
                      onClick={handleExport}
                      sx={{
                        background: '#1f2937',
                        borderRadius: '8px',
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        '&:hover': {
                          background: '#374151',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Export to Excel
                    </Button>
                  </Box>
                </Box>
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
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                                              {visibleColumns.map((column, index) => (
                          <TableCell
                            key={`header-${column}`}
                          sx={{
                            fontWeight: 700,
                            color: '#111827',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            textAlign: 'center',
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
                                console.log('Filter icon clicked for column:', column);
                                openFilterPopover(column, e.currentTarget);
                              }}
                              sx={{
                                ml: 0.5,
                                color: isFilterActive(column) ? '#1f2937' : '#6b7280',
                                background: isFilterActive(column) ? '#e5e7eb' : 'transparent',
                                '&:hover': { background: '#f3f4f6' },
                              }}
                              aria-label={`Filter ${column}`}
                            >
                                                            <FilterIcon fontSize="small" />
                                    </IconButton>
                                <Popover
                                  open={Boolean(headerFilterAnchor) && activeFilterColumn === column}
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
                                    const meta = (COLUMN_META as any)[column]?.type || 'string';
                                    if (meta === 'string') {
                                      const val = (columnFilters[column] || '') as string;
                                      return (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          <Typography variant="caption" sx={{ color: '#6b7280' }}>Contains</Typography>
                                          <TextField size="small" value={val} onChange={handleStringFilterChange(column)} placeholder={`Filter ${column}`} />
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                            <Button size="small" onClick={() => clearColumnFilter(column)}>Clear</Button>
                                            <Button size="small" variant="contained" onClick={closeFilterPopover}>Apply</Button>
                                          </Box>
                                        </Box>
                                      );
                                    }
                                    if (meta === 'number') {
                                      const minVal = (columnFilters[column]?.min ?? '') as string;
                                      const maxVal = (columnFilters[column]?.max ?? '') as string;
                                      return (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          <Typography variant="caption" sx={{ color: '#6b7280' }}>Between</Typography>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField size="small" type="number" placeholder="Min" value={minVal} onChange={handleNumberRangeChange(column, 'min')} />
                                            <TextField size="small" type="number" placeholder="Max" value={maxVal} onChange={handleNumberRangeChange(column, 'max')} />
                                          </Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                            <Button size="small" onClick={() => clearColumnFilter(column)}>Clear</Button>
                                          <Button size="small" variant="contained" onClick={closeFilterPopover}>Apply</Button>
                                          </Box>
                                        </Box>
                                      );
                                    }
                                    if (meta === 'date') {
                                      const fromVal = (columnFilters[column]?.from ?? '') as string;
                                      const toVal = (columnFilters[column]?.to ?? '') as string;
                                      return (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          <Typography variant="caption" sx={{ color: '#6b7280' }}>Between dates</Typography>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField size="small" type="date" value={fromVal} onChange={handleDateRangeFilterChange(column, 'from')} />
                                            <TextField size="small" type="date" value={toVal} onChange={handleDateRangeFilterChange(column, 'to')} />
                                          </Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                            <Button size="small" onClick={() => clearColumnFilter(column)}>Clear</Button>
                                            <Button size="small" variant="contained" onClick={closeFilterPopover}>Apply</Button>
                                          </Box>
                                        </Box>
                                      );
                                    }
                                    if (meta === 'enum') {
                                      const options = getUniqueValuesForColumn(column);
                                      const value: string[] = Array.isArray(columnFilters[column]) ? columnFilters[column] : [];
                                      return (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          <Typography variant="caption" sx={{ color: '#6b7280' }}>Select values</Typography>
                                          <FormControl size="small">
                                            <Select
                                              multiple
                                              value={value}
                                              onChange={handleEnumFilterChange(column)}
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
                                            <Button size="small" onClick={() => clearColumnFilter(column)}>Clear</Button>
                                            <Button size="small" variant="contained" onClick={closeFilterPopover}>Apply</Button>
                                          </Box>
                                        </Box>
                                      );
                                    }
                                    return null;
                                  })()}
                                </Popover>
                              </Box>
                            
                            {/* Removed duplicate column filter icon */}
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
                        const isSelected = selectedTransaction?.["Order Item ID"] === row["Order Item ID"];
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
                          if (typeof value === 'number') {
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
                              key={`${row["Order Item ID"]}-${column}-${colIndex}`}
                              sx={{
                                border: '1px solid #e5e7eb',
                                background: '#ffffff',
                                textAlign: 'center',
                                minWidth: 160,
                                fontWeight: 600,
                                color: column === 'Status' ? '#111827' : '#111827',
                                '&:hover': {
                                  background: '#f9fafb',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {column === 'Status' ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* Remark chip */}
                                    <Chip
                                      label={(row as any)['Remark']}
                                      size="small"
                                      sx={{
                                        background: (row as any)['Remark'] === 'Matched' ? '#dcfce7' : 
                                                   (row as any)['Remark'] === 'Excess Amount Received' ? '#fef3c7' : 
                                                   (row as any)['Remark'] === 'Short Amount Received' ? '#fee2e2' :
                                                   (row as any)['Remark'] === 'Pending Settlement' ? '#dbeafe' :
                                                   (row as any)['Remark'] === 'Return Initiated' ? '#f3e8ff' : '#f3f4f6',
                                        color: (row as any)['Remark'] === 'Matched' ? '#059669' : 
                                               (row as any)['Remark'] === 'Excess Amount Received' ? '#d97706' : 
                                               (row as any)['Remark'] === 'Short Amount Received' ? '#dc2626' :
                                               (row as any)['Remark'] === 'Pending Settlement' ? '#111111' :
                                               (row as any)['Remark'] === 'Return Initiated' ? '#7c3aed' : '#374151',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: 24,
                                        '& .MuiChip-label': { px: 1 },
                                      }}
                                    />
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
              <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
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
                    return rect.bottom + 5;
                  }
                  return 100;
                })(),
                left: (() => {
                  if (headerFilterAnchor) {
                    const rect = headerFilterAnchor.getBoundingClientRect();
                    const popupWidth = 250;
                    const spaceRight = window.innerWidth - rect.left;
                    
                    // If not enough space on right, align to right edge
                    if (spaceRight < popupWidth) {
                      return Math.max(10, rect.right - popupWidth);
                    }
                    return rect.left;
                  }
                  return 100;
                })(),
                zIndex: 9999,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                p: 1.5,
                minWidth: 220,
                maxWidth: 300,
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(() => {
                  if (!activeFilterColumn) return null;
                  const meta = (COLUMN_META as any)[activeFilterColumn]?.type || 'string';
                  
                  if (meta === 'string') {
                    const val = (columnFilters[activeFilterColumn] || '') as string;
                    return (
                      <>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Contains</Typography>
                        <TextField 
                          size="small" 
                          value={val} 
                          onChange={handleStringFilterChange(activeFilterColumn)} 
                          placeholder={`Filter ${activeFilterColumn}`}
                          sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, gap: 1 }}>
                          <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, color: '#666', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                          <Button size="small" variant="contained" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' } }} onClick={closeFilterPopover}>Apply</Button>
                        </Box>
                      </>
                    );
                  }
                  
                  if (meta === 'number') {
                    const minVal = (columnFilters[activeFilterColumn]?.min ?? '') as string;
                    const maxVal = (columnFilters[activeFilterColumn]?.max ?? '') as string;
                    return (
                      <>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Between</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <TextField 
                            size="small" 
                            type="number" 
                            placeholder="Min" 
                            value={minVal} 
                            onChange={handleNumberRangeChange(activeFilterColumn, 'min')}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
                          />
                          <TextField 
                            size="small" 
                            type="number" 
                            placeholder="Max" 
                            value={maxVal} 
                            onChange={handleNumberRangeChange(activeFilterColumn, 'max')}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, gap: 1 }}>
                          <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, color: '#666', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                          <Button size="small" variant="contained" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' } }} onClick={closeFilterPopover}>Apply</Button>
                        </Box>
                      </>
                    );
                  }
                  
                  if (meta === 'date') {
                    const fromVal = (columnFilters[activeFilterColumn]?.from ?? '') as string;
                    const toVal = (columnFilters[activeFilterColumn]?.to ?? '') as string;
                    return (
                      <>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Between dates</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                          <TextField 
                            size="small" 
                            type="date" 
                            label="From"
                            value={fromVal} 
                            onChange={handleDateRangeFilterChange(activeFilterColumn, 'from')}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
                          />
                          <TextField 
                            size="small" 
                            type="date" 
                            label="To"
                            value={toVal} 
                            onChange={handleDateRangeFilterChange(activeFilterColumn, 'to')}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, gap: 1 }}>
                          <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, color: '#666', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                          <Button size="small" variant="contained" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' } }} onClick={closeFilterPopover}>Apply</Button>
                        </Box>
                      </>
                    );
                  }
                  
                  if (meta === 'enum') {
                    const rawOptions = getUniqueValuesForColumn(activeFilterColumn);
                    const value: string[] = Array.isArray(columnFilters[activeFilterColumn]) ? columnFilters[activeFilterColumn] : [];
                    // For Status, we show both Remark and Event Type distincts, grouped with badges
                    const isStatus = activeFilterColumn === 'Status';
                    const options = isStatus
                      ? rawOptions
                      : rawOptions;
                    return (
                      <>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Select values</Typography>
                        <Box sx={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 0.5 }}>
                          {options.map((opt) => (
                            <Box
                              key={opt}
                              onClick={() => {
                                const newValue = value.includes(opt)
                                  ? value.filter(v => v !== opt)
                                  : [...value, opt];
                                setColumnFilters(prev => ({
                                  ...prev,
                                  [activeFilterColumn]: newValue
                                }));
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 0.5,
                                cursor: 'pointer',
                                borderRadius: 0.5,
                                '&:hover': { backgroundColor: '#f5f5f5' },
                                backgroundColor: value.includes(opt) ? '#1f2937' : 'transparent',
                                color: value.includes(opt) ? 'white' : '#333',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                {isStatus ? (
                                  (() => {
                                    const [group, raw] = opt.split(':', 2);
                                    if (group === 'remark') {
                                      const { background, color } = getRemarkChipColors(raw);
                                      return (
                                        <Chip
                                          label={raw}
                                          size="small"
                                          sx={{
                                            background,
                                            color,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 22,
                                            '& .MuiChip-label': { px: 0.75 },
                                          }}
                                        />
                                      );
                                    } else {
                                      const { background, color } = getEventTypeChipColors(raw);
                                      return (
                                        <Chip
                                          label={raw}
                                          size="small"
                                          sx={{
                                            background,
                                            color,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 22,
                                            '& .MuiChip-label': { px: 0.75 },
                                          }}
                                        />
                                      );
                                    }
                                  })()
                                ) : (
                                  <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: value.includes(opt) ? 600 : 400 }}>
                                    {opt}
                                  </Typography>
                                )}
                              </Box>
                              {value.includes(opt) && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                  ✓
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, gap: 1 }}>
                          <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, color: '#666', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={() => clearColumnFilter(activeFilterColumn)}>Clear</Button>
                          <Button size="small" variant="contained" sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' } }} onClick={closeFilterPopover}>Apply</Button>
                        </Box>
                      </>
                    );
                  }
                  
                  return null;
                })()}
              </Box>
            </Box>
          </Portal>
        )}
      </Box>
    </Slide>
  );
};

export default TransactionSheet; 