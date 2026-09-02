import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

interface PaymentDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  payment: any | null;
}

export function PaymentDetailsDrawer({ open, onClose, payment }: PaymentDetailsDrawerProps) {
  if (!payment) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 500,
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #eaecf0', backgroundColor: '#fafafa' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#09090b', fontFamily: 'monospace', mb: 0.5 }}>
              {payment.id}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#71717a' }}>
              ICICI Bank • {payment.date}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label="NEFT"
              size="small"
              sx={{
                height: 24,
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                border: '1px solid #e4e4e7',
                borderRadius: '9999px',
              }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 600,
                borderColor: '#eaecf0',
                color: '#334155',
                backgroundColor: '#ffffff',
              }}
            >
              Export
            </Button>
            <IconButton onClick={onClose} size="small" sx={{ color: '#71717a' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        {/* Summary Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            backgroundColor: '#ffffff',
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                UTR amount
              </Typography>
              <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                {payment.amount}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                Allocated
              </Typography>
              <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                {payment.allocated}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                Paid amount across invoices
              </Typography>
              <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>
                {payment.paidAmount}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
              Remaining
            </Typography>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#ca8a04', fontVariantNumeric: 'tabular-nums' }}>
              {payment.amount}
            </Typography>
          </Box>
        </Paper>

        {/* Read Only Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 3, borderBottom: '1px solid #eaecf0', mb: 3 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#eaecf0',
              color: '#334155',
            }}
          >
            Close
          </Button>
          <Typography sx={{ fontSize: '12px', color: '#a1a1aa' }}>
            Read-only view
          </Typography>
        </Box>

        {/* Invoice Allocations */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
            Invoice Allocations
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#71717a',
            }}
          >
            Add invoice
          </Button>
        </Box>

        {/* Invoice Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 16, color: '#71717a' }} />
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#09090b', fontFamily: 'monospace' }}>
              INV-HUL-2025-0341
            </Typography>
            <Chip
              label={payment.channel !== '-' ? payment.channel : 'Unknown'}
              size="small"
              sx={{
                height: 20,
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                border: '1px solid #e4e4e7',
                borderRadius: '9999px',
              }}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                Invoice total
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                ₹4,20,000
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                Allocated amount
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                {payment.allocated}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                Paid amount across invoices
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>
                -
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Drawer>
  );
}
