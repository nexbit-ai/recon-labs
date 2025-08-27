import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, OutlinedInput, TextField, Button } from '@mui/material';

export interface ColumnMetaMap {
  [column: string]: { type: 'string' | 'number' | 'date' | 'enum' };
}

export interface ColumnFilterControlsProps {
  columnMeta: ColumnMetaMap;
  activeColumn: string;
  setActiveColumn: (col: string) => void;
  pendingFilters: Record<string, any>;
  handleStringChange: (column: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumberRangeChange: (column: string, bound: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateRangeChange: (column: string, bound: 'from' | 'to') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEnumChange: (column: string) => (e: any) => void;
  getEnumOptions?: (column: string) => string[];
  onClear: (column: string) => void;
  onApply: () => void;
}

const ColumnFilterControls: React.FC<ColumnFilterControlsProps> = ({
  columnMeta,
  activeColumn,
  setActiveColumn,
  pendingFilters,
  handleStringChange,
  handleNumberRangeChange,
  handleDateRangeChange,
  handleEnumChange,
  getEnumOptions,
  onClear,
  onApply,
}) => {
  const metaType = (columnMeta as any)[activeColumn]?.type || 'string';
  const enumOptions = activeColumn && getEnumOptions ? getEnumOptions(activeColumn) : [];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, pr: 0 }}>
      <FormControl size="small" sx={{ mb: 1.5, mt: 0.5, width: '60%' }}>
      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Column</Typography>
        <TextField
        size="small"
          value={activeColumn || ''}
          onChange={(e) => setActiveColumn(String(e.target.value))}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
        >
          {Object.keys(columnMeta).map((col) => (
            <MenuItem key={col} value={col}>{col}</MenuItem>
          ))}
        </TextField>
      </FormControl>

      {activeColumn && metaType === 'string' && (
        <>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Contains</Typography>
          <TextField 
            size="small" 
            value={(pendingFilters[activeColumn] || '') as string}
            onChange={handleStringChange(activeColumn)} 
            placeholder={`Filter ${activeColumn}`}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 32 } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button size="small" onClick={() => onClear(activeColumn)}>Clear</Button>
            <Button size="small" variant="contained" onClick={onApply}>Apply</Button>
          </Box>
        </>
      )}

      {activeColumn && metaType === 'number' && (
        <>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Between</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" type="number" placeholder="Min" value={(pendingFilters[activeColumn]?.min ?? '') as string} onChange={handleNumberRangeChange(activeColumn, 'min')} sx={{ width: '60%', '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38, borderRadius: '40px', padding: '2px' }}} />
            <TextField size="small" type="number" placeholder="Max" value={(pendingFilters[activeColumn]?.max ?? '') as string} onChange={handleNumberRangeChange(activeColumn, 'max')} sx={{ width: '60%', '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38, borderRadius: '40px', padding: '2px' } }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button size="small" onClick={() => onClear(activeColumn)}>Clear</Button>
            <Button size="small" variant="contained" onClick={onApply}>Apply</Button>
          </Box>
        </>
      )}

      {activeColumn && metaType === 'date' && (
        <>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Between dates</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" type="date" value={(pendingFilters[activeColumn]?.from ?? '') as string} onChange={handleDateRangeChange(activeColumn, 'from')} InputLabelProps={{ shrink: true }} sx={{ width: '60%',padding: '2px', '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38, padding: '2px',// hide calendar picker icon
      '& input::-webkit-calendar-picker-indicator': {
        display: 'none',
        WebkitAppearance: 'none',
      },
      '& input::-webkit-clear-button': {
        display: 'none',
      }, } }}/>
            <TextField size="small" type="date" value={(pendingFilters[activeColumn]?.to ?? '') as string} onChange={handleDateRangeChange(activeColumn, 'to')} InputLabelProps={{ shrink: true }} sx={{ width: '60%', '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38, borderRadius: '40px', padding: '2px',// hide calendar picker icon
      '& input::-webkit-calendar-picker-indicator': {
        display: 'none',
        WebkitAppearance: 'none',
      },
      '& input::-webkit-clear-button': {
        display: 'none',
      }, } }}/>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button size="small" onClick={() => onClear(activeColumn)}>Clear</Button>
            <Button size="small" variant="contained" onClick={onApply}>Apply</Button>
          </Box>
        </>
      )}

      {activeColumn && metaType === 'enum' && (
        <>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Select values</Typography>
          <FormControl size="small">
            <Select
              multiple
              value={Array.isArray(pendingFilters[activeColumn]) ? pendingFilters[activeColumn] : []}
              onChange={handleEnumChange(activeColumn)}
              input={<OutlinedInput />}
              renderValue={(selected) => (selected as string[]).join(', ')}
              MenuProps={{ PaperProps: { style: { maxHeight: 40   } } }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38 } }}
            >
              {(getEnumOptions ? enumOptions : []).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button size="small" onClick={() => onClear(activeColumn)}>Clear</Button>
            <Button size="small" variant="contained" onClick={onApply}>Apply</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ColumnFilterControls;
