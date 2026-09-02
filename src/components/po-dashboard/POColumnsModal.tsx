import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import { ColumnDefinition } from '../../data/mockPOData';

interface POColumnsModalProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  onSave: (updated: ColumnDefinition[]) => void;
  onReset: () => void;
}

export const POColumnsModal: React.FC<POColumnsModalProps> = ({
  open,
  onClose,
  columns,
  onSave,
  onReset,
}) => {
  const [localCols, setLocalCols] = useState<ColumnDefinition[]>(columns);
  const [search, setSearch] = useState('');

  // Sync with prop when open changes
  React.useEffect(() => {
    setLocalCols(columns);
  }, [columns, open]);

  const handleToggle = (key: string) => {
    setLocalCols((prev) =>
      prev.map((c) => (c.key === key && c.canHide !== false ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleSelectAll = (visible: boolean) => {
    setLocalCols((prev) =>
      prev.map((c) => (c.canHide !== false ? { ...c, visible } : c))
    );
  };

  const filtered = localCols.filter(
    (c) =>
      c.key !== 'expand' &&
      (c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()))
  );

  const visibleCount = localCols.filter((c) => c.visible).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 1,
          border: '1px solid #eaecf0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <ViewColumnOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Customize Table Columns
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
              {visibleCount} of {localCols.length} columns active
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2, pb: 1.5, borderColor: '#eaecf0' }}>
        {/* Search bar & Quick controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '9999px',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                '& fieldset': { borderColor: '#eaecf0' },
              },
            }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleSelectAll(true)}
            sx={{
              textTransform: 'none',
              fontSize: '11.5px',
              fontWeight: 600,
              borderRadius: '9999px',
              borderColor: '#eaecf0',
              color: '#334155',
              whiteSpace: 'nowrap',
              px: 1.75,
            }}
          >
            All
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleSelectAll(false)}
            sx={{
              textTransform: 'none',
              fontSize: '11.5px',
              fontWeight: 600,
              borderRadius: '9999px',
              borderColor: '#eaecf0',
              color: '#334155',
              whiteSpace: 'nowrap',
              px: 1.75,
            }}
          >
            None
          </Button>
        </Box>

        {/* Columns Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0.75,
            maxHeight: 380,
            overflowY: 'auto',
            pr: 1,
          }}
        >
          {filtered.map((col) => {
            const isDisabled = col.canHide === false;
            return (
              <Box
                key={col.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '8px',
                  backgroundColor: col.visible ? '#fafafa' : 'transparent',
                  border: `1px solid ${col.visible ? '#eaecf0' : 'transparent'}`,
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={col.visible}
                      disabled={isDisabled}
                      onChange={() => handleToggle(col.key)}
                      size="small"
                      sx={{
                        color: '#cbd5e1',
                        '&.Mui-checked': {
                          color: '#059669',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: col.visible ? 600 : 400,
                        color: isDisabled ? '#94a3b8' : '#334155',
                      }}
                    >
                      {col.label}
                    </Typography>
                  }
                  sx={{ m: 0, flex: 1 }}
                />
                {col.fixed && (
                  <Chip
                    label="Sticky"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={() => {
            onReset();
            onClose();
          }}
          sx={{
            color: '#64748b',
            textTransform: 'none',
            fontSize: '12px',
            borderRadius: '9999px',
          }}
        >
          Reset to Default
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: '12px',
              borderRadius: '9999px',
              borderColor: '#eaecf0',
              color: '#475569',
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(localCols);
              onClose();
            }}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '9999px',
              backgroundColor: '#059669',
              px: 2.5,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#047857',
                boxShadow: 'none',
              },
            }}
          >
            Apply ({visibleCount})
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
