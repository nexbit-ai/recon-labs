import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Switch,
  Stack,
  Badge,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export interface POFilterState {
  channels: string[];
  vendors: string[];
  cities: string[];
  discrepancyOnly: boolean;
  dateFrom: string;
  dateTo: string;
}

interface POFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: POFilterState;
  onChange: (updated: POFilterState) => void;
  onReset: () => void;
}

const AVAILABLE_CHANNELS = ['Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Nykaa'];
const AVAILABLE_VENDORS = [
  'Amazon Vendor Central',
  'Flipkart Seller Hub',
  'Blinkit',
  'Meesho Supplier Panel',
  'Nykaa Seller Portal',
];
const AVAILABLE_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

export const POFiltersDrawer: React.FC<POFiltersDrawerProps> = ({
  open,
  onClose,
  filters,
  onChange,
  onReset,
}) => {
  const toggleArrayItem = (key: 'channels' | 'vendors' | 'cities', val: string) => {
    const list = filters[key];
    const exists = list.includes(val);
    const updated = exists ? list.filter((i) => i !== val) : [...list, val];
    onChange({ ...filters, [key]: updated });
  };

  const activeCount =
    filters.channels.length +
    filters.vendors.length +
    filters.cities.length +
    (filters.discrepancyOnly ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 320, sm: 390 },
          p: 0,
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #eaecf0',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eaecf0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0',
            }}
          >
            <FilterListIcon sx={{ fontSize: 17 }} />
          </Box>
          <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            Filter Purchase Orders
          </Typography>
          {activeCount > 0 && (
            <Badge
              badgeContent={activeCount}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  height: 18,
                  minWidth: 18,
                  borderRadius: '9999px',
                },
              }}
            />
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Filter Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {/* Toggle Discrepancy Only */}
        <Box
          sx={{
            p: 1.75,
            mb: 2.5,
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            border: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              Discrepancies Only
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#64748b' }}>
              Shortages, mismatches or claims
            </Typography>
          </Box>
          <Switch
            checked={filters.discrepancyOnly}
            onChange={(e) => onChange({ ...filters, discrepancyOnly: e.target.checked })}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#059669',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#059669',
              },
            }}
          />
        </Box>

        {/* Channels */}
        <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', mb: 1 }}>
          Channels
        </Typography>
        <FormGroup sx={{ mb: 2.5 }}>
          {AVAILABLE_CHANNELS.map((ch) => (
            <FormControlLabel
              key={ch}
              control={
                <Checkbox
                  size="small"
                  checked={filters.channels.includes(ch)}
                  onChange={() => toggleArrayItem('channels', ch)}
                  sx={{ py: 0.5, '&.Mui-checked': { color: '#059669' } }}
                />
              }
              label={<Typography sx={{ fontSize: '13px', color: '#334155' }}>{ch}</Typography>}
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2, borderColor: '#eaecf0' }} />

        {/* Vendors */}
        <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', mb: 1 }}>
          Vendors
        </Typography>
        <FormGroup sx={{ mb: 2.5 }}>
          {AVAILABLE_VENDORS.map((v) => (
            <FormControlLabel
              key={v}
              control={
                <Checkbox
                  size="small"
                  checked={filters.vendors.includes(v)}
                  onChange={() => toggleArrayItem('vendors', v)}
                  sx={{ py: 0.5, '&.Mui-checked': { color: '#059669' } }}
                />
              }
              label={<Typography sx={{ fontSize: '13px', color: '#334155' }}>{v}</Typography>}
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2, borderColor: '#eaecf0' }} />

        {/* Cities */}
        <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', mb: 1 }}>
          Destination Facility City
        </Typography>
        <FormGroup sx={{ mb: 2.5 }}>
          {AVAILABLE_CITIES.map((city) => (
            <FormControlLabel
              key={city}
              control={
                <Checkbox
                  size="small"
                  checked={filters.cities.includes(city)}
                  onChange={() => toggleArrayItem('cities', city)}
                  sx={{ py: 0.5, '&.Mui-checked': { color: '#059669' } }}
                />
              }
              label={<Typography sx={{ fontSize: '13px', color: '#334155' }}>{city}</Typography>}
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2, borderColor: '#eaecf0' }} />

        {/* Date Range */}
        <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', mb: 1 }}>
          PO Date Range
        </Typography>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            label="From Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            sx={{ '& input': { fontSize: '12.5px' }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            sx={{ '& input': { fontSize: '12.5px' }, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2.25,
          borderTop: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
        }}
      >
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          sx={{
            color: '#64748b',
            textTransform: 'none',
            fontSize: '12px',
            borderRadius: '9999px',
            px: 1.5,
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#059669',
            textTransform: 'none',
            fontSize: '12.5px',
            fontWeight: 600,
            borderRadius: '9999px',
            px: 2.5,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#047857',
              boxShadow: 'none',
            },
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );
};
