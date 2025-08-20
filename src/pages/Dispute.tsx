import React, { useEffect, useState, useRef } from 'react';
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
  OutlinedInput
} from '@mui/material';
import { 
  CalendarToday as CalendarTodayIcon, 
  KeyboardArrowDown as KeyboardArrowDownIcon, 
  StorefrontOutlined as StorefrontIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const DisputePage: React.FC = () => {
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: unreconciled, 1: open, 2: raised
  
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

  const [rows, setRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'unreconciled' | 'open' | 'raised'; }>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string>('');

  // Column metadata for filter types
  const COLUMN_META = {
    'Order Item ID': { type: 'string' },
    'Order Value': { type: 'number' },
    'Settlement Value': { type: 'number' },
    'Order Date': { type: 'date' },
    'Settlement Date': { type: 'date' },
    'Difference': { type: 'number' },
    'Remark': { type: 'enum' },
    'Event Type': { type: 'enum' },
    'Status': { type: 'enum' }
  };

  useEffect(() => {
    if (rows.length === 0) {
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
      setRows(list);
    }
  }, []);

  // Action handlers for unreconciled transactions
  const handleMarkReconciled = (id: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, status: 'open' } : row
    ));
  };

  const handleRaiseDispute = (id: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, status: 'open' } : row
    ));
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
    if (typeof filter === 'string') return filter !== '';
    if (typeof filter === 'object') {
      if (filter.min !== undefined && filter.min !== '') return true;
      if (filter.max !== undefined && filter.max !== '') return true;
      if (filter.from !== undefined && filter.from !== '') return true;
      if (filter.to !== undefined && filter.to !== '') return true;
      if (Array.isArray(filter) && filter.length > 0) return true;
    }
    return false;
  };

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
    rows.forEach(row => {
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

  const current = rows.filter(r => {
    // First filter by tab
    let statusMatch = false;
    if (disputeSubTab === 0) statusMatch = r.status === 'unreconciled';
    else if (disputeSubTab === 1) statusMatch = r.status === 'open';
    else statusMatch = r.status === 'raised';
    
    if (!statusMatch) return false;

    // Then apply column filters
    for (const [column, filter] of Object.entries(columnFilters)) {
      if (!filter) continue;
      
      let value: any;
      switch (column) {
        case 'Order Item ID':
          value = r.orderItemId;
          break;
        case 'Order Value':
          value = Math.abs(r.difference) + 1000;
          break;
        case 'Settlement Value':
          value = Math.abs(r.difference) + 900;
          break;
        case 'Order Date':
          value = r.orderDate;
          break;
        case 'Settlement Date':
          value = '-';
          break;
        case 'Difference':
          value = Math.abs(r.difference);
          break;
        case 'Remark':
          value = r.remark;
          break;
        case 'Event Type':
          value = r.eventType;
          break;
        case 'Status':
          value = r.status;
          break;
        default:
          continue;
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

  // Select all functionality
  const allSelected = current.length > 0 && current.every(r => selectedIds.includes(r.id));
  
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(prev => prev.filter(id => !current.some(r => r.id === id)));
    else setSelectedIds(prev => Array.from(new Set([...prev, ...current.map(r => r.id)])));
  };
  const toggleRow = (id: string) => setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const sendToFlipkart = () => {
    if (selectedIds.length === 0) return;
    setSnackbarOpen(true);
    setRows(prev => prev.map(r => (selectedIds.includes(r.id) ? { ...r, status: 'raised' } : r)));
    setSelectedIds([]);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={disputeSubTab} onChange={(_, v) => setDisputeSubTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 32 } }}>
              <Tab label="Dispute Found" />
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
                      checked={allSelected}
                      indeterminate={current.length > 0 && !allSelected && selectedIds.length > 0}
                      onChange={toggleSelectAll}
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
                          Order Item ID
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openFilterPopover('Order Item ID', e.currentTarget);
                          }}
                          sx={{
                            ml: 0.5,
                            color: isFilterActive('Order Item ID') ? '#1f2937' : '#6b7280',
                            background: isFilterActive('Order Item ID') ? '#e5e7eb' : 'transparent',
                            '&:hover': { background: '#f3f4f6' },
                          }}
                          aria-label="Filter Order Item ID"
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
                </TableRow>
              </TableHead>
              <TableBody>
                {current.map(row => (
                  <TableRow 
                    key={row.id} 
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
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        sx={{
                          color: '#6b7280',
                          '&.Mui-checked': {
                            color: '#1f2937',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      {row.orderItemId}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      ₹{(Math.abs(row.difference) + 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      ₹{(Math.abs(row.difference) + 900).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      {row.orderDate}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      -
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      ₹{Math.abs(row.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      {row.remark}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontWeight: 500,
                    }}>
                      {row.eventType}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                    }}>
                      {row.status === 'unreconciled' && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleMarkReconciled(row.id)}
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
                            onClick={() => handleRaiseDispute(row.id)}
                            sx={{
                              fontSize: '0.75rem',
                              py: 0.5,
                              px: 1,
                              minHeight: 28,
                              borderColor: '#f59e0b',
                              color: '#f59e0b',
                              '&:hover': {
                                borderColor: '#d97706',
                                backgroundColor: 'rgba(245, 158, 11, 0.04)',
                              },
                            }}
                          >
                            Raise Dispute
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {current.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#6b7280' }}>No transactions</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
    </Box>
  );
};

export default DisputePage;

