import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const options = ['Last 1 day', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Year to Date'];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        sx={{
          borderColor: '#6B7280',
          color: '#6B7280',
          textTransform: 'none',
          minWidth: 140,
          minHeight: 40,
          px: 2,
          '&:hover': {
            borderColor: '#4B5563',
            backgroundColor: 'rgba(107, 114, 128, 0.04)',
          },
        }}
      >
        {value}
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
            minWidth: 140,
          }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleSelect(option)}
            selected={option === value}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DateRangeSelector; 