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
} from '@mui/material';
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
  [key: string]: any; // Allow dynamic access
}

interface TransactionData {
  columns: string[];
  rows: TransactionRow[];
}

// Mock data with new structure as per requirements
const mockTransactionData: TransactionData = {
  columns: [
    "Order ID",
    "Order Value", 
    "Order Date",
    "Settlement Date",
    "Difference",
    "Remark"
  ],
  rows: [
    // Settled Transactions (25 entries)
    {
      "Order ID": "FK12345",
      "Order Value": 1200,
      "Order Date": "2025-01-15",
      "Settlement Date": "2025-01-20",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12346",
      "Order Value": 850,
      "Order Date": "2025-01-16",
      "Settlement Date": "2025-01-21",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12347",
      "Order Value": 2100,
      "Order Date": "2025-01-17",
      "Settlement Date": "2025-01-22",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12349",
      "Order Value": 1600,
      "Order Date": "2025-01-19",
      "Settlement Date": "2025-01-24",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12350",
      "Order Value": 950,
      "Order Date": "2025-01-20",
      "Settlement Date": "2025-01-25",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12351",
      "Order Value": 1800,
      "Order Date": "2025-01-21",
      "Settlement Date": "2025-01-26",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12352",
      "Order Value": 1350,
      "Order Date": "2025-01-22",
      "Settlement Date": "2025-01-27",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12353",
      "Order Value": 2200,
      "Order Date": "2025-01-23",
      "Settlement Date": "2025-01-28",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12354",
      "Order Value": 1100,
      "Order Date": "2025-01-24",
      "Settlement Date": "2025-01-29",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12355",
      "Order Value": 1700,
      "Order Date": "2025-01-25",
      "Settlement Date": "2025-01-30",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12356",
      "Order Value": 1400,
      "Order Date": "2025-01-26",
      "Settlement Date": "2025-02-01",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12357",
      "Order Value": 1900,
      "Order Date": "2025-01-27",
      "Settlement Date": "2025-02-02",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12358",
      "Order Value": 1250,
      "Order Date": "2025-01-28",
      "Settlement Date": "2025-02-03",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12359",
      "Order Value": 2300,
      "Order Date": "2025-01-29",
      "Settlement Date": "2025-02-04",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12360",
      "Order Value": 1000,
      "Order Date": "2025-01-30",
      "Settlement Date": "2025-02-05",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12361",
      "Order Value": 1550,
      "Order Date": "2025-02-01",
      "Settlement Date": "2025-02-06",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12362",
      "Order Value": 2000,
      "Order Date": "2025-02-02",
      "Settlement Date": "2025-02-07",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12363",
      "Order Value": 1150,
      "Order Date": "2025-02-03",
      "Settlement Date": "2025-02-08",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12364",
      "Order Value": 1750,
      "Order Date": "2025-02-04",
      "Settlement Date": "2025-02-09",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12365",
      "Order Value": 1300,
      "Order Date": "2025-02-05",
      "Settlement Date": "2025-02-10",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12366",
      "Order Value": 1850,
      "Order Date": "2025-02-06",
      "Settlement Date": "2025-02-11",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12367",
      "Order Value": 1450,
      "Order Date": "2025-02-07",
      "Settlement Date": "2025-02-12",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12368",
      "Order Value": 1950,
      "Order Date": "2025-02-08",
      "Settlement Date": "2025-02-13",
      "Difference": 0,
      "Remark": "Matched"
    },
    {
      "Order ID": "FK12369",
      "Order Value": 1200,
      "Order Date": "2025-02-09",
      "Settlement Date": "2025-02-14",
      "Difference": 0,
      "Remark": "Matched"
    },
    // Settled Transactions with Discrepancies (10 entries)
    {
      "Order ID": "FK12348",
      "Order Value": 750,
      "Order Date": "2025-01-18",
      "Settlement Date": "2025-01-23",
      "Difference": -50,
      "Remark": "Excess Amount Received"
    },
    {
      "Order ID": "FK12370",
      "Order Value": 800,
      "Order Date": "2025-02-10",
      "Settlement Date": "2025-02-15",
      "Difference": 25,
      "Remark": "Short Amount Received"
    },
    {
      "Order ID": "FK12371",
      "Order Value": 650,
      "Order Date": "2025-02-11",
      "Settlement Date": "2025-02-16",
      "Difference": -30,
      "Remark": "Excess Amount Received"
    },
    {
      "Order ID": "FK12372",
      "Order Value": 900,
      "Order Date": "2025-02-12",
      "Settlement Date": "2025-02-17",
      "Difference": 45,
      "Remark": "Short Amount Received"
    },
    {
      "Order ID": "FK12373",
      "Order Value": 550,
      "Order Date": "2025-02-13",
      "Settlement Date": "2025-02-18",
      "Difference": -20,
      "Remark": "Excess Amount Received"
    },
    {
      "Order ID": "FK12374",
      "Order Value": 700,
      "Order Date": "2025-02-14",
      "Settlement Date": "2025-02-19",
      "Difference": 35,
      "Remark": "Short Amount Received"
    },
    {
      "Order ID": "FK12375",
      "Order Value": 450,
      "Order Date": "2025-02-15",
      "Settlement Date": "2025-02-20",
      "Difference": -15,
      "Remark": "Excess Amount Received"
    },
    {
      "Order ID": "FK12376",
      "Order Value": 600,
      "Order Date": "2025-02-16",
      "Settlement Date": "2025-02-21",
      "Difference": 40,
      "Remark": "Short Amount Received"
    },
    {
      "Order ID": "FK12377",
      "Order Value": 850,
      "Order Date": "2025-02-17",
      "Settlement Date": "2025-02-22",
      "Difference": -25,
      "Remark": "Excess Amount Received"
    },
    {
      "Order ID": "FK12378",
      "Order Value": 500,
      "Order Date": "2025-02-18",
      "Settlement Date": "2025-02-23",
      "Difference": 30,
      "Remark": "Short Amount Received"
    },
    // Unsettled Transactions (15 entries)
    {
      "Order ID": "FK12379",
      "Order Value": 750,
      "Order Date": "2025-02-19",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12380",
      "Order Value": 400,
      "Order Date": "2025-02-20",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12381",
      "Order Value": 650,
      "Order Date": "2025-02-21",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12382",
      "Order Value": 900,
      "Order Date": "2025-02-22",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12383",
      "Order Value": 550,
      "Order Date": "2025-02-23",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12384",
      "Order Value": 800,
      "Order Date": "2025-02-24",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12385",
      "Order Value": 700,
      "Order Date": "2025-02-25",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12386",
      "Order Value": 600,
      "Order Date": "2025-02-26",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12387",
      "Order Value": 850,
      "Order Date": "2025-02-27",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12388",
      "Order Value": 500,
      "Order Date": "2025-02-28",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12389",
      "Order Value": 750,
      "Order Date": "2025-03-01",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12390",
      "Order Value": 650,
      "Order Date": "2025-03-02",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12391",
      "Order Value": 900,
      "Order Date": "2025-03-03",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12392",
      "Order Value": 550,
      "Order Date": "2025-03-04",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12393",
      "Order Value": 800,
      "Order Date": "2025-03-05",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12394",
      "Order Value": 700,
      "Order Date": "2025-03-06",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12395",
      "Order Value": 600,
      "Order Date": "2025-03-07",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12396",
      "Order Value": 850,
      "Order Date": "2025-03-08",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
    },
    {
      "Order ID": "FK12397",
      "Order Value": 500,
      "Order Date": "2025-03-09",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Pending Settlement"
    },
    {
      "Order ID": "FK12398",
      "Order Value": 750,
      "Order Date": "2025-03-10",
      "Settlement Date": "",
      "Difference": 0,
      "Remark": "Return Initiated"
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
    const popupHeight = 400; // Estimated popup height
    const popupWidth = 380;
    const offset = 8;

    // Calculate vertical position
    let top: number;
    let animationDirection: 'up' | 'down' = 'down';
    
    if (rect.bottom + popupHeight + offset <= viewportHeight) {
      // Enough space below - show below
      top = rect.bottom + offset;
    } else if (rect.top - popupHeight - offset >= 0) {
      // Enough space above - show above
      top = rect.top - popupHeight - offset;
      animationDirection = 'up';
    } else {
      // Not enough space either way - show below but adjust
      top = Math.max(offset, viewportHeight - popupHeight - offset);
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

    return { top, left, animationDirection };
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
      <Box sx={{ p: 2.5 }}>
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
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ onBack, open, transaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [columnFilters, setColumnFilters] = useState<{[key: string]: string}>({});
  const [filteredData, setFilteredData] = useState(mockTransactionData.rows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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
  }, [searchTerm, dateRange, columnFilters, activeTab]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  // Handle transaction row click
  const handleTransactionClick = (transaction: TransactionRow, event: React.MouseEvent<HTMLElement>) => {
    setSelectedTransaction(transaction);
    setAnchorEl(event.currentTarget);
  };

      // Separate settled and unsettled transactions
    const settledTransactions = mockTransactionData.rows.filter(row => row["Settlement Date"] !== "");
    const unsettledTransactions = mockTransactionData.rows.filter(row => row["Settlement Date"] === "");

  // Get current data based on active tab
  const getCurrentData = () => {
    return activeTab === 0 ? settledTransactions : unsettledTransactions;
  };

  // Get visible columns
  const getVisibleColumns = () => {
    return mockTransactionData.columns;
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
                        {(activeTab === 0 ? settledTransactions : unsettledTransactions).length}
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
                        {formatCurrency(
                          (activeTab === 0 ? settledTransactions : unsettledTransactions)
                            .reduce((sum, row) => sum + row["Order Value"], 0)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>

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
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                                   value === 'Return Initiated' ? '#8b5cf6' : '#111827') : '#111827',
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
                      })}
                    </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredData.length}
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