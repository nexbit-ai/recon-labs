import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, OutlinedInput, TextField, Button, FormGroup, FormControlLabel, Checkbox, Autocomplete, Chip } from '@mui/material';

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
  // Order ID chips state and handlers
  orderIdChips?: string[];
  setOrderIdChips?: (chips: string[]) => void;
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
  orderIdChips = [],
  setOrderIdChips,
}) => {
  const metaType = (columnMeta as any)[activeColumn]?.type || 'string';
  let enumOptions = activeColumn && getEnumOptions ? getEnumOptions(activeColumn) : [];
  
  // For Transaction Sheet Status specifically, hardcode the three values
  if (activeColumn === 'Status') {
    enumOptions = ['excess_received', 'short_received', 'settlement_matched'];
  }

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

      {activeColumn && metaType === 'string' && activeColumn !== 'Order ID' && (
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

      {/* Special case for Order ID - chips input */}
      {activeColumn === 'Order ID' && setOrderIdChips && (
        <>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem', mb: 0.5 }}>
            Order IDs (comma-separated or paste multiple)
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={orderIdChips}
            onChange={(event, newValue) => {
              setOrderIdChips(newValue as string[]);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Enter Order IDs"
                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
              />
            )}
            sx={{ width: '100%' }}
          />
          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.65rem', mt: 0.5 }}>
            Press Enter after each ID or paste comma-separated values
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button size="small" onClick={() => {
              setOrderIdChips([]);
              onClear(activeColumn);
            }}>Clear</Button>
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
            <TextField
              size="small"
              type="date"
              value={(pendingFilters[activeColumn]?.from ?? '') as string}
              onChange={handleDateRangeChange(activeColumn, 'from')}
              onClick={(e: any) => e.target?.showPicker && e.target.showPicker()}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '60%', padding: '2px', '& .MuiOutlinedInput-root fieldset': { borderColor: '#111' }, '& .MuiOutlinedInput-root:hover fieldset': { borderColor: '#111' }, '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#111' }, '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38, padding: '2px' } }}
            />
            <TextField
              size="small"
              type="date"
              value={(pendingFilters[activeColumn]?.to ?? '') as string}
              onChange={handleDateRangeChange(activeColumn, 'to')}
              onClick={(e: any) => e.target?.showPicker && e.target.showPicker()}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '60%', '& .MuiOutlinedInput-root fieldset': { borderColor: '#111' }, '& .MuiOutlinedInput-root:hover fieldset': { borderColor: '#111' }, '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#111' }, '& .MuiOutlinedInput-root': { fontSize: '0.8rem', height: 38, borderRadius: '40px', padding: '2px' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button size="small" onClick={() => onClear(activeColumn)}>Clear</Button>
            <Button size="small" variant="contained" onClick={onApply}>Apply</Button>
          </Box>
        </>
      )}

      {activeColumn && (metaType === 'enum' || ['Shipping Courier', 'Recon Status', 'Settlement Provider'].includes(activeColumn)) && (
        <>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>Select values</Typography>
          
          <FormGroup sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
            {(() => {
              const optionsToRender = getEnumOptions ? enumOptions : [];
              
              // Get current selected values
              const selectedValues = Array.isArray(pendingFilters[activeColumn]) ? pendingFilters[activeColumn] : [];
              
              return optionsToRender.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedValues.includes(option)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const newValues = isChecked 
                          ? [...selectedValues, option]
                          : selectedValues.filter(val => val !== option);
                        
                        // Update pending filters directly
                        const newPendingFilters = { ...pendingFilters };
                        newPendingFilters[activeColumn] = newValues;
                        handleEnumChange(activeColumn)({ target: { value: newValues } });
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {option}
                    </Typography>
                  }
                  sx={{ 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.8rem',
                      marginLeft: 0.5
                    }
                  }}
                />
              ));
            })()}
          </FormGroup>
          
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
