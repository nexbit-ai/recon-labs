import React from 'react';
import { Select, MenuItem, FormControl } from '@mui/material';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const options = ['Last 1 day', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Year to Date'];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        sx={{ bgcolor: '#1F2937', color: '#F9FAFB', '.MuiOutlinedInput-notchedOutline': { borderColor: '#374151' } }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DateRangeSelector; 