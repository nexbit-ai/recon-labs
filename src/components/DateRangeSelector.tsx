import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  Box, 
  TextField, 
  Typography,
  Divider,
  Chip
} from '@mui/material';
import { 
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
  customStartDate?: string;
  customEndDate?: string;
}

const predefinedOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'Last 90 days', value: 'last90days' },
  { label: 'Year to date', value: 'yearToDate' },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  value, 
  onChange, 
  onCustomDateChange,
  customStartDate,
  customEndDate
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customStartDate || '');
  const [tempEndDate, setTempEndDate] = useState(customEndDate || '');
  
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsCustomMode(false);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    handleClose();
  };

  const handleCustomMode = () => {
    setIsCustomMode(true);
  };

  const handleCustomDateApply = () => {
    if (tempStartDate && tempEndDate && onCustomDateChange) {
      onCustomDateChange(tempStartDate, tempEndDate);
      onChange('Custom Range');
      handleClose();
    }
  };

  const getDateRangeFromOption = (option: string): { startDate: string; endDate: string } => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (option) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: startDate.toISOString().split('T')[0]
        };
      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'last30days':
        startDate.setDate(today.getDate() - 30);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'thisMonth':
        startDate.setDate(1);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'lastMonth':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(0); // Last day of previous month
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      case 'last90days':
        startDate.setDate(today.getDate() - 90);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'yearToDate':
        startDate.setMonth(0, 1);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      default:
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
    }
  };

  const getDisplayValue = () => {
    if (value === 'Custom Range' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    return value;
  };

  return (
    <>
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={<DateRangeIcon />}
        onClick={handleClick}
        sx={{
          borderColor: '#6B7280',
          color: '#6B7280',
          textTransform: 'none',
          minWidth: 200,
          minHeight: 40,
          px: 2,
          '&:hover': {
            borderColor: '#4B5563',
            backgroundColor: 'rgba(107, 114, 128, 0.04)',
          },
        }}
      >
        {getDisplayValue()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'date-range-button',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            maxWidth: 320,
          }
        }}
      >
        {!isCustomMode ? (
          <>
            {predefinedOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSelect(option.label)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <CalendarIcon sx={{ mr: 2, fontSize: 20, color: '#6B7280' }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {option.label}
                  </Typography>
                  {value === option.label && (
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
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={handleCustomMode}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <DateRangeIcon sx={{ mr: 2, fontSize: 20, color: '#6366f1' }} />
                <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 600 }}>
                  Custom Range
                </Typography>
              </Box>
            </MenuItem>
          </>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
              Select Custom Date Range
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="End Date"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsCustomMode(false)}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCustomDateApply}
                  disabled={!tempStartDate || !tempEndDate}
                  sx={{ flex: 1 }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default DateRangeSelector; 