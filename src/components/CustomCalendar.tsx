import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

interface CustomCalendarProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (start: string, end: string) => void;
  onSelect?: (date: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ startDate, endDate, onDateRangeChange, onSelect }) => {
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  const currentCalendarMonth = currentCalendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const handleCalendarMonthChange = (direction: number) => {
    setCurrentCalendarDate(new Date(
      currentCalendarDate.getFullYear(),
      currentCalendarDate.getMonth() + direction,
      1
    ));
  };

  const getCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDateGrid = new Date(firstDay);
    startDateGrid.setDate(startDateGrid.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDateGrid);
      date.setDate(startDateGrid.getDate() + i);
      if (date.getMonth() === month) {
        days.push(date.getDate().toString());
      } else {
        days.push('');
      }
    }
    return days;
  };

  const getDateFromCalendarPosition = (day: string) => {
    if (!day) return null;
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    return new Date(year, month, parseInt(day));
  };

  const handleCalendarDateClick = (day: string) => {
    if (!day) return;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return;

    const dateString = clickedDate.toLocaleDateString('en-CA');
    
    if (onSelect) {
      onSelect(dateString);
    }
    
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onDateRangeChange(dateString, '');
    } else {
      // Complete selection
      if (new Date(dateString) < new Date(startDate)) {
        onDateRangeChange(dateString, startDate);
      } else {
        onDateRangeChange(startDate, dateString);
      }
    }
  };

  const isDateSelected = (day: string) => {
    if (!day) return false;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return false;
    const dateString = clickedDate.toLocaleDateString('en-CA');
    return dateString === startDate || dateString === endDate;
  };

  const isDateInRange = (day: string) => {
    if (!day || !startDate || !endDate) return false;
    const clickedDate = getDateFromCalendarPosition(day);
    if (!clickedDate) return false;
    const dateString = clickedDate.toLocaleDateString('en-CA');
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const cd = new Date(dateString);
    return cd >= d1 && cd <= d2;
  };

  return (
    <Box sx={{
      bgcolor: 'white',
      borderRadius: 2,
      border: '1px solid #e5e7eb',
      p: 1.8,
      minWidth: 250,
      width: '100%'
    }}>
      {/* Calendar Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1.8,
        px: 0.9
      }}>
        <IconButton size="small" onClick={() => handleCalendarMonthChange(-1)} sx={{ color: '#6b7280' }}>
          <KeyboardArrowDownIcon sx={{ transform: 'rotate(90deg)' }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>
          {currentCalendarMonth}
        </Typography>
        <IconButton size="small" onClick={() => handleCalendarMonthChange(1)} sx={{ color: '#6b7280' }}>
          <KeyboardArrowDownIcon sx={{ transform: 'rotate(-90deg)' }} />
        </IconButton>
      </Box>

      {/* Days of Week */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.9 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <Typography key={day} variant="caption" sx={{ textAlign: 'center', color: '#6b7280', fontWeight: 500, py: 0.5 }}>
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {getCalendarDays().map((day, index) => (
          <Box
            key={index}
            onClick={() => handleCalendarDateClick(day)}
            sx={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: day ? 'pointer' : 'default',
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: day ? '#1f2937' : 'transparent',
              backgroundColor: day ? 'transparent' : 'transparent',
              border: day && isDateInRange(day) ? '1px solid #3b82f6' : 'none',
              '&:hover': day ? { backgroundColor: '#f3f4f6' } : {},
              ...(day && isDateSelected(day) && {
                color: '#1d4ed8',
                fontWeight: 700
              }),
              ...(day && isDateInRange(day) && !isDateSelected(day) && {
                color: '#3b82f6'
              })
            }}
          >
            {day}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CustomCalendar;
