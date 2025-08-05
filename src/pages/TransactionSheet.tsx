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
  "Order ID": string;
  "Order Value": number;
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
  const difference = parseFloat(orderItem.diff);
  
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
  
  // Determine if settled or unsettled
  const isSettled = orderItem.remark === "settlement_matched";
  const settlementDate = isSettled ? new Date().toISOString().split('T')[0] : ""; // Placeholder for now
  
  return {
    "Order ID": orderItem.order_item_id,
    "Order Value": orderValue,
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
    "Order ID",
    "Order Value", 
    "Order Date",
    "Settlement Date",
    "Difference",
    "Remark",
    "Event Type"
  ],
  rows: [
    // Settled Transactions (25 entries)
    {
      "Order ID": "FK12345",
      "Order Value": 1200,
      "Order Date": "2025-01-15",
      "Settlement Date": "2025-01-20",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12346",
      "Order Value": 850,
      "Order Date": "2025-01-16",
      "Settlement Date": "2025-01-21",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12347",
      "Order Value": 2100,
      "Order Date": "2025-01-17",
      "Settlement Date": "2025-01-22",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12349",
      "Order Value": 1600,
      "Order Date": "2025-01-19",
      "Settlement Date": "2025-01-24",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12350",
      "Order Value": 950,
      "Order Date": "2025-01-20",
      "Settlement Date": "2025-01-25",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12351",
      "Order Value": 1800,
      "Order Date": "2025-01-21",
      "Settlement Date": "2025-01-26",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12352",
      "Order Value": 1350,
      "Order Date": "2025-01-22",
      "Settlement Date": "2025-01-27",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12353",
      "Order Value": 2200,
      "Order Date": "2025-01-23",
      "Settlement Date": "2025-01-28",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12354",
      "Order Value": 1100,
      "Order Date": "2025-01-24",
      "Settlement Date": "2025-01-29",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12355",
      "Order Value": 1700,
      "Order Date": "2025-01-25",
      "Settlement Date": "2025-01-30",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12356",
      "Order Value": 1400,
      "Order Date": "2025-01-26",
      "Settlement Date": "2025-02-01",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12357",
      "Order Value": 1900,
      "Order Date": "2025-01-27",
      "Settlement Date": "2025-02-02",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12358",
      "Order Value": 1250,
      "Order Date": "2025-01-28",
      "Settlement Date": "2025-02-03",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12359",
      "Order Value": 2300,
      "Order Date": "2025-01-29",
      "Settlement Date": "2025-02-04",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12360",
      "Order Value": 1000,
      "Order Date": "2025-01-30",
      "Settlement Date": "2025-02-05",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12361",
      "Order Value": 1550,
      "Order Date": "2025-02-01",
      "Settlement Date": "2025-02-06",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12362",
      "Order Value": 2000,
      "Order Date": "2025-02-02",
      "Settlement Date": "2025-02-07",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12363",
      "Order Value": 1150,
      "Order Date": "2025-02-03",
      "Settlement Date": "2025-02-08",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12364",
      "Order Value": 1750,
      "Order Date": "2025-02-04",
      "Settlement Date": "2025-02-09",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12365",
      "Order Value": 1300,
      "Order Date": "2025-02-05",
      "Settlement Date": "2025-02-10",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12366",
      "Order Value": 1850,
      "Order Date": "2025-02-06",
      "Settlement Date": "2025-02-11",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12367",
      "Order Value": 1450,
      "Order Date": "2025-02-07",
      "Settlement Date": "2025-02-12",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12368",
      "Order Value": 1950,
      "Order Date": "2025-02-08",
      "Settlement Date": "2025-02-13",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12369",
      "Order Value": 1200,
      "Order Date": "2025-02-09",
      "Settlement Date": "2025-02-14",
      "Difference": 0,
      "Remark": "Matched",
      "Event Type": "Sale"
    },
    // Settled Transactions with Discrepancies (10 entries)
    {
      "Order ID": "FK12348",
      "Order Value": 750,
      "Order Date": "2025-01-18",
      "Settlement Date": "2025-01-23",
      "Difference": -50,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12370",
      "Order Value": 800,
      "Order Date": "2025-02-10",
      "Settlement Date": "2025-02-15",
      "Difference": 25,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12371",
      "Order Value": 650,
      "Order Date": "2025-02-11",
      "Settlement Date": "2025-02-16",
      "Difference": -30,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12372",
      "Order Value": 900,
      "Order Date": "2025-02-12",
      "Settlement Date": "2025-02-17",
      "Difference": 45,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12373",
      "Order Value": 550,
      "Order Date": "2025-02-13",
      "Settlement Date": "2025-02-18",
      "Difference": -20,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12374",
      "Order Value": 700,
      "Order Date": "2025-02-14",
      "Settlement Date": "2025-02-19",
      "Difference": 35,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12375",
      "Order Value": 450,
      "Order Date": "2025-02-15",
      "Settlement Date": "2025-02-20",
      "Difference": -15,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12376",
      "Order Value": 600,
      "Order Date": "2025-02-16",
      "Settlement Date": "2025-02-21",
      "Difference": 40,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12377",
      "Order Value": 850,
      "Order Date": "2025-02-17",
      "Settlement Date": "2025-02-22",
      "Difference": -25,
      "Remark": "Excess Amount Received",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12378",
      "Order Value": 500,
      "Order Date": "2025-02-18",
      "Settlement Date": "2025-02-23",
      "Difference": 30,
      "Remark": "Short Amount Received",
      "Event Type": "Sale"
    },
    // Unsettled Transactions (15 entries)
    {
      "Order ID": "FK12379",
      "Order Value": 750,
      "Order Date": "2025-02-19",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12380",
      "Order Value": 400,
      "Order Date": "2025-02-20",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12381",
      "Order Value": 650,
      "Order Date": "2025-02-21",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12382",
      "Order Value": 900,
      "Order Date": "2025-02-22",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12383",
      "Order Value": 550,
      "Order Date": "2025-02-23",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12384",
      "Order Value": 800,
      "Order Date": "2025-02-24",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12385",
      "Order Value": 700,
      "Order Date": "2025-02-25",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12386",
      "Order Value": 600,
      "Order Date": "2025-02-26",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12387",
      "Order Value": 850,
      "Order Date": "2025-02-27",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12388",
      "Order Value": 500,
      "Order Date": "2025-02-28",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12389",
      "Order Value": 750,
      "Order Date": "2025-03-01",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12390",
      "Order Value": 650,
      "Order Date": "2025-03-02",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12391",
      "Order Value": 900,
      "Order Date": "2025-03-03",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12392",
      "Order Value": 550,
      "Order Date": "2025-03-04",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12393",
      "Order Value": 800,
      "Order Date": "2025-03-05",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12394",
      "Order Value": 700,
      "Order Date": "2025-03-06",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12395",
      "Order Value": 600,
      "Order Date": "2025-03-07",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12396",
      "Order Value": 850,
      "Order Date": "2025-03-08",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated",
      "Event Type": "Return"
    },
    {
      "Order ID": "FK12397",
      "Order Value": 500,
      "Order Date": "2025-03-09",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement",
      "Event Type": "Sale"
    },
    {
      "Order ID": "FK12398",
      "Order Value": 750,
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
            Order ID: {transaction["Order ID"]}
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
              Collection Received
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Order Value"] - transaction["Difference"])}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Commission (2%)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Order Value"] * 0.02)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              TDS Deducted (1%)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {formatCurrency(transaction["Order Value"] * 0.01)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              TCS Deducted (0.5%)
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
  const [columnFilters, setColumnFilters] = useState<{[key: string]: string}>({});
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

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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
  const fetchOrders = async (pageNumber: number = 1) => {
    const isInitialLoad = pageNumber === 1 && allTransactionData.length === 0;
    
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError(null);
    
    try {
      const response = await api.orders.getOrders({
        page: pageNumber,
        limit: 100
      } as any);
      
      if (response.success && response.data.orders) {
        // Transform all order items to transaction rows
        const transactionRows: TransactionRow[] = [];
        
        response.data.orders.forEach((order: any) => {
          order.order_items.forEach((orderItem: OrderItem) => {
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
    fetchOrders(1);
  }, []);

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

  // Handle column filter change
  const handleColumnFilterChange = (columnKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: event.target.value
    }));
  };

  // Filter data based on search, date range, and column filters
  useEffect(() => {
    setLoading(true);
    
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
      if (filterValue.trim()) {
        filtered = filtered.filter(row => {
          const value = row[columnKey as keyof TransactionRow];
          if (value === null || value === undefined) return false;
          
          // Handle different data types
          if (typeof value === 'number') {
            return String(value).includes(filterValue);
          }
          
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });
    
    setFilteredData(filtered);
    setLoading(false);
  }, [searchTerm, dateRange, columnFilters, activeTab, allTransactionData]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    const newPageNumber = newPage + 1; // Convert from 0-based to 1-based
    setPage(newPage);
    fetchOrders(newPageNumber);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Reset to first page when changing rows per page
    fetchOrders(1);
  };

  // Export to Excel (placeholder)
  const handleExport = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setColumnFilters({});
    setPage(0);
    setCurrentPage(1);
    fetchOrders(1);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
    setCurrentPage(1); // Reset current page
    fetchOrders(1); // Fetch first page data
  };

  // Handle transaction row click
  const handleTransactionClick = (transaction: TransactionRow, event: React.MouseEvent<HTMLElement>) => {
    setSelectedTransaction(transaction);
    setAnchorEl(event.currentTarget);
  };

      // Separate settled and unsettled transactions for current page
    const settledTransactions = allTransactionData.filter(row => row["Settlement Date"] !== "");
    const unsettledTransactions = allTransactionData.filter(row => row["Settlement Date"] === "");

  // Get current data based on active tab
  const getCurrentData = () => {
    // For pagination, we work with the current page data
    const currentData = allTransactionData;
    return activeTab === 0 ? 
      currentData.filter(row => row["Settlement Date"] !== "") : 
      currentData.filter(row => row["Settlement Date"] === "");
  };

  // Get visible columns
  const getVisibleColumns = () => {
    return [
      "Order ID",
      "Order Value", 
      "Order Date",
      "Settlement Date",
      "Difference",
      "Remark",
      "Event Type"
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
        <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Card sx={{ 
              mb: 2,
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={onBack}
                      sx={{
                        mr: 2,
                        background: '#1f2937',
                        color: 'white',
                        '&:hover': {
                          background: '#374151',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: '#111827',
                        letterSpacing: '-0.02em',
                        mb: 1,
                      }}>
                        Transaction Sheet
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#6b7280', 
                        fontWeight: 500,
                        fontSize: '1.1rem',
                      }}>
                        Complete transaction details with expandable columns
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => fetchOrders(1)}
                      disabled={loading}
                      sx={{
                        borderColor: '#1f2937',
                        color: '#1f2937',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
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
                        px: 3,
                        py: 1.5,
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

                {/* Compact Transaction Tabs */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        minHeight: 48,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#6b7280',
                        px: 2,
                        '&.Mui-selected': {
                          color: '#1f2937',
                          fontWeight: 700,
                        },
                      },
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        background: '#1f2937',
                      },
                    }}
                  >
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={settledTransactions.length}
                            size="small"
                            sx={{ 
                              background: '#10b981',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                          <Typography variant="body2">Settled</Typography>
                        </Box>
                      }
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={unsettledTransactions.length}
                            size="small"
                            sx={{ 
                              background: '#ef4444',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                          <Typography variant="body2">Unsettled</Typography>
                        </Box>
                      }
                    />
                  </Tabs>
                  
                  {/* Compact Summary */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontSize: '1rem' }}>
                        Count:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: '1.2rem',
                      }}>
                        {getCountFromStats()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontSize: '1rem' }}>
                        Total:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: '1.2rem',
                      }}>
                        {formatCurrency(getTotalFromStats())}
                      </Typography>
                    </Box>
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
                <Button color="inherit" size="small" onClick={() => fetchOrders(1)}>
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
                          key={column}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                                {column}
                              </Typography>
                            </Box>
                            
                            {/* Column Filter Input */}
                            <TextField
                              size="small"
                              placeholder={`Filter ${column}`}
                              value={columnFilters[column] || ''}
                              onChange={handleColumnFilterChange(column)}
                              InputProps={{
                                endAdornment: columnFilters[column] && (
                                  <InputAdornment position="end">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => {
                                        setColumnFilters(prev => {
                                          const newFilters = { ...prev };
                                          delete newFilters[column];
                                          return newFilters;
                                        });
                                      }}
                                    >
                                      <ClearIcon fontSize="small" />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontSize: '0.75rem',
                                  height: 32,
                                  background: '#ffffff',
                                  '&:hover': {
                                    background: '#f9fafb',
                                  },
                                  '&.Mui-focused': {
                                    background: '#ffffff',
                                  },
                                },
                                '& .MuiOutlinedInput-input': {
                                  padding: '6px 8px',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && allTransactionData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Loading transaction data...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : paginationLoading ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Loading page {currentPage}...
                          </Typography>
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
                        const isSelected = selectedTransaction?.["Order ID"] === row["Order ID"];
                        return (
                          <React.Fragment key={rowIndex}>
                            <TableRow 
                              sx={{ 
                                borderLeft: `4px solid ${activeTab === 0 ? '#10b981' : '#ef4444'}`,
                                background: '#ffffff',
                                position: 'relative',
                              }}
                            >
                        {visibleColumns.map((column) => {
                          const value = (row as any)[column];
                          
                          // Format value based on type
                          let displayValue = value;
                          if (typeof value === 'number') {
                            if (column === 'Order Value' || column === 'Difference') {
                              displayValue = formatCurrency(value);
                            } else {
                              displayValue = value.toLocaleString('en-IN');
                            }
                          } else if (column.includes('Date')) {
                            displayValue = formatDate(value);
                          }
                          
                          return (
                            <TableCell
                              key={column}
                              sx={{
                                border: '1px solid #e5e7eb',
                                background: '#ffffff',
                                textAlign: 'center',
                                minWidth: 160,
                                fontWeight: 600,
                                color: column === 'Remark' ? 
                                  (value === 'Matched' ? '#10b981' : 
                                   value === 'Excess Amount Received' ? '#f59e0b' : 
                                   value === 'Short Amount Received' ? '#ef4444' :
                                   value === 'Pending Settlement' ? '#3b82f6' :
                                   value === 'Return Initiated' ? '#8b5cf6' : '#111827') : 
                                  column === 'Event Type' ? 
                                  (value === 'Sale' ? '#10b981' : '#ef4444') : '#111827',
                                '&:hover': {
                                  background: '#f9fafb',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {column === 'Remark' ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={displayValue}
                                      size="small"
                                      sx={{
                                        background: value === 'Matched' ? '#dcfce7' : 
                                                     value === 'Excess Amount Received' ? '#fef3c7' : 
                                                     value === 'Short Amount Received' ? '#fee2e2' :
                                                     value === 'Pending Settlement' ? '#dbeafe' :
                                                     value === 'Return Initiated' ? '#f3e8ff' : '#f3f4f6',
                                        color: value === 'Matched' ? '#059669' : 
                                               value === 'Excess Amount Received' ? '#d97706' : 
                                               value === 'Short Amount Received' ? '#dc2626' :
                                               value === 'Pending Settlement' ? '#2563eb' :
                                               value === 'Return Initiated' ? '#7c3aed' : '#374151',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: 24,
                                        '& .MuiChip-label': {
                                          px: 1,
                                        },
                                      }}
                                    />
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTransactionClick(row, e);
                                      }}
                                      size="small"
                                      sx={{ 
                                        p: 0.5,
                                        color: '#6b7280',
                                        '&:hover': {
                                          background: '#f3f4f6',
                                          color: '#374151',
                                        },
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <ExpandMoreIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ) : column === 'Event Type' ? (
                                  <Chip
                                    label={displayValue}
                                    size="small"
                                    sx={{
                                      background: value === 'Sale' ? '#dcfce7' : '#fee2e2',
                                      color: value === 'Sale' ? '#059669' : '#dc2626',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      height: 24,
                                      '& .MuiChip-label': {
                                        px: 1,
                                      },
                                    }}
                                  />
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
      </Box>
    </Slide>
  );
};

export default TransactionSheet; 