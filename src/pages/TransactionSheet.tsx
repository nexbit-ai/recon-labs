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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Type definitions for transaction data
interface TransactionRow {
  "Order ID": string;
  "Order Date": string;
  "Sale Amount": number;
  "Commission": {
    "Marketplace Fee": number;
    "Offer Fee": number;
    "Shipping Fee": number;
    "Protection Fund": number;
    "Total": number;
  };
  "TDS": number;
  "TCS": number;
  "Refund": number;
  "Settlement Value": number;
  [key: string]: any; // Allow dynamic access
}

interface TransactionData {
  columns: (string | Record<string, Record<string, number>>)[];
  rows: TransactionRow[];
}

// Mock data with nested structure as per requirements
const mockTransactionData: TransactionData = {
  columns: [
    "Order ID",
    "Order Date", 
    "Sale Amount",
    {
      "Commission": {
        "Marketplace Fee": 50,
        "Offer Fee": 20,
        "Shipping Fee": 30,
        "Protection Fund": 15,
        "Total": 115
      }
    },
    "TDS",
    "TCS",
    "Refund",
    "Settlement Value"
  ],
  rows: [
    {
      "Order ID": "FK12345",
      "Order Date": "2025-01-15",
      "Sale Amount": 1200,
      "Commission": {
        "Marketplace Fee": 50,
        "Offer Fee": 20,
        "Shipping Fee": 30,
        "Protection Fund": 15,
        "Total": 115
      },
      "TDS": 12,
      "TCS": 8,
      "Refund": 0,
      "Settlement Value": 1065
    },
    {
      "Order ID": "FK12346",
      "Order Date": "2025-01-16",
      "Sale Amount": 850,
      "Commission": {
        "Marketplace Fee": 35,
        "Offer Fee": 15,
        "Shipping Fee": 25,
        "Protection Fund": 10,
        "Total": 85
      },
      "TDS": 8.5,
      "TCS": 5.5,
      "Refund": 0,
      "Settlement Value": 751
    },
    {
      "Order ID": "FK12347",
      "Order Date": "2025-01-17",
      "Sale Amount": 2100,
      "Commission": {
        "Marketplace Fee": 80,
        "Offer Fee": 30,
        "Shipping Fee": 40,
        "Protection Fund": 20,
        "Total": 170
      },
      "TDS": 21,
      "TCS": 12,
      "Refund": 0,
      "Settlement Value": 1897
    },
    {
      "Order ID": "FK12348",
      "Order Date": "2025-01-18",
      "Sale Amount": 750,
      "Commission": {
        "Marketplace Fee": 30,
        "Offer Fee": 12,
        "Shipping Fee": 20,
        "Protection Fund": 8,
        "Total": 70
      },
      "TDS": 7.5,
      "TCS": 4.5,
      "Refund": 750,
      "Settlement Value": -832
    },
    {
      "Order ID": "FK12349",
      "Order Date": "2025-01-19",
      "Sale Amount": 1600,
      "Commission": {
        "Marketplace Fee": 60,
        "Offer Fee": 25,
        "Shipping Fee": 35,
        "Protection Fund": 18,
        "Total": 138
      },
      "TDS": 16,
      "TCS": 9.6,
      "Refund": 0,
      "Settlement Value": 1436.4
    }
  ]
};

interface TransactionSheetProps {
  onBack: () => void;
  open?: boolean;
  transaction?: any;
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ onBack, open, transaction }) => {
  const [expandedColumns, setExpandedColumns] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [columnFilters, setColumnFilters] = useState<{[key: string]: string}>({});
  const [filteredData, setFilteredData] = useState(mockTransactionData.rows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Handle column expansion
  const handleColumnToggle = (columnKey: string) => {
    setExpandedColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
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
    
    let filtered = mockTransactionData.rows;
    
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
          
          // Handle nested objects (like Commission)
          if (typeof value === 'object') {
            return Object.values(value).some(nestedValue => 
              String(nestedValue).toLowerCase().includes(filterValue.toLowerCase())
            );
          }
          
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
  }, [searchTerm, dateRange, columnFilters]);

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

  // Get visible columns
  const getVisibleColumns = () => {
    const visibleColumns: any[] = [];
    
    mockTransactionData.columns.forEach(column => {
      if (typeof column === 'string') {
        visibleColumns.push(column);
      } else {
        // Handle nested column
        const columnKey = Object.keys(column)[0];
        const nestedData = (column as Record<string, Record<string, number>>)[columnKey];
        
        if (expandedColumns[columnKey]) {
          // Show all nested columns
          Object.keys(nestedData).forEach(nestedKey => {
            if (nestedKey !== 'Total') {
              visibleColumns.push(`${columnKey}.${nestedKey}`);
            }
          });
        } else {
          // Show only total
          visibleColumns.push(`${columnKey}.Total`);
        }
      }
    });
    
    return visibleColumns;
  };

  const visibleColumns = getVisibleColumns();

  return (
    <Slide direction="left" in mountOnEnter unmountOnExit>
      <Box sx={{ 
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, 
          rgba(248, 250, 252, 1) 0%, 
          rgba(241, 245, 249, 1) 25%, 
          rgba(226, 232, 240, 1) 50%, 
          rgba(241, 245, 249, 1) 75%, 
          rgba(248, 250, 252, 1) 100%)`,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite',
        position: 'relative',
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
        '@keyframes gradientShift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }}>
        {/* Floating Elements */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 200,
          height: 200,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          transition: 'transform 0.3s ease',
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: 300,
          height: 300,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          transition: 'transform 0.3s ease',
        }} />

        <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Card sx={{ 
              mb: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={onBack}
                      sx={{
                        mr: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5855eb 0%, #9333ea 100%)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800, 
                        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        mb: 1,
                      }}>
                        Transaction Sheet
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#64748b', 
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
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '16px',
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Export to Excel
                  </Button>
                </Box>

                {/* Search and Filters */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 300,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.9)',
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.95)',
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    type="date"
                    label="Start Date"
                    value={dateRange.start}
                    onChange={handleDateRangeChange('start')}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 150,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      },
                    }}
                  />
                  
                  <TextField
                    type="date"
                    label="End Date"
                    value={dateRange.end}
                    onChange={handleDateRangeChange('end')}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 150,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      },
                    }}
                  />
                  
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    sx={{
                      borderRadius: '16px',
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        background: 'rgba(99, 102, 241, 0.05)',
                      },
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>

                {/* Results Summary */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, gap: 2 }}>
                  <Chip 
                    label={`${filteredData.length} transactions found`}
                    color="primary"
                    sx={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  {(searchTerm || dateRange.start || dateRange.end || Object.keys(columnFilters).some(key => columnFilters[key].trim())) && (
                    <Chip 
                      label="Filters applied"
                      variant="outlined"
                      sx={{ 
                        borderRadius: '12px',
                        borderColor: '#10b981',
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    />
                  )}
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
                background: 'rgba(99, 102, 241, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                },
              }} 
            />
          )}

          {/* Transaction Table */}
          <Fade in timeout={1000}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
            }}>
              <TableContainer sx={{ 
                maxHeight: 'calc(100vh - 300px)',
                overflowX: 'auto',
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {visibleColumns.map((column, index) => {
                        const isNested = column.includes('.');
                        const [parentKey, childKey] = isNested ? column.split('.') : [column, null];
                        
                        // Check if this is an expandable column
                        const isExpandable = mockTransactionData.columns.some(col => 
                          typeof col === 'object' && Object.keys(col)[0] === parentKey
                        );
                        
                        return (
                          <TableCell
                            key={column}
                            sx={{
                              fontWeight: 700,
                              color: '#1e293b',
                              background: isNested 
                                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                              border: '1px solid rgba(226, 232, 240, 0.5)',
                              textAlign: childKey === 'Total' ? 'center' : 'right',
                              minWidth: 160,
                              cursor: isExpandable ? 'pointer' : 'default',
                              '&:hover': isExpandable ? {
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                              } : {},
                              transition: 'all 0.3s ease',
                              position: 'relative',
                            }}
                            onClick={isExpandable ? () => handleColumnToggle(parentKey) : undefined}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {/* Column Header */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: childKey === 'Total' ? 'center' : 'flex-end', gap: 1 }}>
                                {isExpandable && (
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#6366f1',
                                      p: 0.5,
                                    }}
                                  >
                                    {expandedColumns[parentKey] ? <RemoveIcon /> : <AddIcon />}
                                  </IconButton>
                                )}
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  {isNested ? childKey : column}
                                </Typography>
                                {isExpandable && (
                                  <Tooltip title={expandedColumns[parentKey] ? "Collapse" : "Expand"}>
                                    <Box>
                                      {expandedColumns[parentKey] ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                    </Box>
                                  </Tooltip>
                                )}
                              </Box>
                              
                              {/* Column Filter Input */}
                              <TextField
                                size="small"
                                placeholder={`Filter ${isNested ? childKey : column}`}
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
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    '&:hover': {
                                      background: 'rgba(255, 255, 255, 1)',
                                    },
                                    '&.Mui-focused': {
                                      background: 'rgba(255, 255, 255, 1)',
                                    },
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '6px 8px',
                                  },
                                }}
                              />
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, rowIndex) => (
                      <TableRow 
                        key={rowIndex} 
                        sx={{ 
                          '&:hover': { 
                            background: 'rgba(99, 102, 241, 0.05)',
                            transform: 'scale(1.001)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {visibleColumns.map((column) => {
                          const isNested = column.includes('.');
                          const [parentKey, childKey] = isNested ? column.split('.') : [column, null];
                          
                          let value: any;
                          if (isNested) {
                            value = (row as any)[parentKey]?.[childKey];
                          } else {
                            value = (row as any)[column];
                          }
                          
                          // Format value based on type
                          let displayValue = value;
                          if (typeof value === 'number') {
                            if (column.includes('Amount') || column.includes('Fee') || column.includes('Value') || column.includes('TDS') || column.includes('TCS') || column.includes('Refund') || column.includes('Total')) {
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
                                border: '1px solid rgba(226, 232, 240, 0.5)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                textAlign: childKey === 'Total' ? 'center' : (typeof value === 'number' ? 'right' : 'left'),
                                minWidth: 160,
                                fontWeight: childKey === 'Total' ? 600 : 500,
                                color: '#1e293b',
                                '&:hover': {
                                  background: 'rgba(99, 102, 241, 0.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                                {displayValue}
                              </Typography>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{ p: 2, borderTop: '1px solid rgba(226, 232, 240, 0.5)' }}>
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
                      color: '#64748b',
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            </Card>
          </Fade>
        </Box>
      </Box>
    </Slide>
  );
};

export default TransactionSheet; 