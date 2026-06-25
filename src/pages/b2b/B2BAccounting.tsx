import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Chip, Tabs, Tab, Collapse, Grid, IconButton } from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  WarningAmber as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';

const fmt = (v: number) => {
  if (v === 0) return '₹0';
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

type BatchStatus = 'Ready to Sync' | 'Already Synced' | 'Failed' | 'Needs Approval';

interface JournalEntry {
  account: string;
  debit: number;
  credit: number;
}

interface JournalBatch {
  id: string;
  event: string;
  description: string;
  status: BatchStatus;
  confidence: number;
  amount: number;
  entries: JournalEntry[];
}

const mockBatches: JournalBatch[] = [
  {
    id: 'JB-9921',
    event: 'Amazon Settlement (Jun 15-22)',
    description: 'Recognizes revenue, commission expense, and fulfillment fees matching the Amazon settlement report. All order-level IDs reconciled.',
    status: 'Ready to Sync',
    confidence: 99,
    amount: 1420000,
    entries: [
      { account: 'Accounts Receivable - Amazon', debit: 1070000, credit: 0 },
      { account: 'Platform Commission Expense', debit: 210000, credit: 0 },
      { account: 'Fulfillment & Logistics Expense', debit: 140000, credit: 0 },
      { account: 'Sales Revenue - Amazon', debit: 0, credit: 1420000 },
    ]
  },
  {
    id: 'JB-9922',
    event: 'Zepto Short Payment Dispute Won',
    description: 'Reversal of expected receivable and realization of recovered amount from Zepto dispute #Z-4122.',
    status: 'Ready to Sync',
    confidence: 96,
    amount: 42000,
    entries: [
      { account: 'Bank - HDFC Current', debit: 42000, credit: 0 },
      { accounts: 'Accounts Receivable - Zepto', debit: 0, credit: 42000 } as any,
    ]
  },
  {
    id: 'JB-9923',
    event: 'Instamart Monthly Logistics Penalty',
    description: 'Booking platform penalty. Note: Confidence is lower because penalty type "SLA_BREACH_L2" is newly introduced by Instamart.',
    status: 'Needs Approval',
    confidence: 68,
    amount: 15000,
    entries: [
      { account: 'Penalty & Fines Expense', debit: 15000, credit: 0 },
      { account: 'Accounts Payable - Instamart', debit: 0, credit: 15000 },
    ]
  },
  {
    id: 'JB-9910',
    event: 'Flipkart Settlement (Jun 8-15)',
    description: 'Standard settlement processing.',
    status: 'Already Synced',
    confidence: 100,
    amount: 850000,
    entries: [
      { account: 'Accounts Receivable - Flipkart', debit: 720000, credit: 0 },
      { account: 'Platform Commission Expense', debit: 130000, credit: 0 },
      { account: 'Sales Revenue - Flipkart', debit: 0, credit: 850000 },
    ]
  },
  {
    id: 'JB-9915',
    event: 'Blinkit Promo Expense Reversal',
    description: 'ERP integration timed out during sync. Target system returned 503 Service Unavailable.',
    status: 'Failed',
    confidence: 100,
    amount: 24000,
    entries: [
      { account: 'Accounts Receivable - Blinkit', debit: 24000, credit: 0 },
      { account: 'Marketing & Promo Expense', debit: 0, credit: 24000 },
    ]
  }
];

const B2BAccounting: React.FC = () => {
  const [tab, setTab] = useState<BatchStatus>('Ready to Sync');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredBatches = mockBatches.filter(b => b.status === tab);

  const tabs: { label: BatchStatus; icon: React.ReactNode; color: string }[] = [
    { label: 'Ready to Sync', icon: <SyncIcon fontSize="small" />, color: '#3b82f6' },
    { label: 'Needs Approval', icon: <WarningIcon fontSize="small" />, color: '#f59e42' },
    { label: 'Failed', icon: <ErrorIcon fontSize="small" />, color: '#ef4444' },
    { label: 'Already Synced', icon: <CheckIcon fontSize="small" />, color: '#10b981' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto', height: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.5, color: '#111' }}>
            Accounting Sync
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', mt: 0.5 }}>
            AI-generated journal batches mapped to business events.
          </Typography>
        </Box>
        {tab === 'Ready to Sync' && filteredBatches.length > 0 && (
          <Button 
            variant="contained" 
            startIcon={<SyncIcon />}
            sx={{ bgcolor: '#111', textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2, '&:hover': { bgcolor: '#374151' } }}
          >
            Sync {filteredBatches.length} Batches to ERP
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4, borderBottom: '1px solid #e5e7eb' }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          TabIndicatorProps={{ sx: { bgcolor: '#111', height: 3 } }}
        >
          {tabs.map((t) => (
            <Tab 
              key={t.label} 
              value={t.label}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: tab === t.label ? t.color : '#9ca3af', display: 'flex' }}>{t.icon}</Box>
                  <Typography sx={{ fontWeight: tab === t.label ? 800 : 600, color: tab === t.label ? '#111' : '#6b7280' }}>
                    {t.label}
                  </Typography>
                  <Chip 
                    label={mockBatches.filter(b => b.status === t.label).length} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: tab === t.label ? '#f3f4f6' : '#f9fafb' }} 
                  />
                </Box>
              } 
            />
          ))}
        </Tabs>
      </Box>

      {/* Batch List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredBatches.map(batch => (
          <Paper 
            key={batch.id} 
            sx={{ 
              p: 0, 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: expandedId === batch.id ? '#d1d5db' : '#e5e7eb', 
              boxShadow: expandedId === batch.id ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
              overflow: 'hidden',
              transition: 'all 0.2s'
            }}
          >
            <Box 
              onClick={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
              sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer', bgcolor: expandedId === batch.id ? '#fafafa' : '#fff', '&:hover': { bgcolor: '#fafafa' } }}
            >
              <Box sx={{ flex: 1, pr: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{batch.id}</Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>{batch.event}</Typography>
                  {batch.confidence >= 95 ? (
                    <Chip icon={<AIIcon sx={{ fontSize: 14 }} />} label="High Confidence" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669', '& .MuiChip-icon': { color: '#059669' } }} />
                  ) : (
                    <Chip icon={<WarningIcon sx={{ fontSize: 14 }} />} label="Low Confidence" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#fff7ed', color: '#c2410c', '& .MuiChip-icon': { color: '#c2410c' } }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.5 }}>
                  {batch.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impact</Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#111' }}>{fmt(batch.amount)}</Typography>
                </Box>
                <IconButton sx={{ color: '#9ca3af' }}>
                  {expandedId === batch.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedId === batch.id}>
              <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb', bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                  Journal Entries
                </Typography>
                
                <Box sx={{ border: '1px solid #f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                  <Grid container sx={{ bgcolor: '#f9fafb', borderBottom: '1px solid #f3f4f6', p: 1.5 }}>
                    <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Account</Typography></Grid>
                    <Grid item xs={3} sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Debit</Typography></Grid>
                    <Grid item xs={3} sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Credit</Typography></Grid>
                  </Grid>
                  {batch.entries.map((entry, i) => (
                    <Grid container key={i} sx={{ p: 1.5, borderBottom: i < batch.entries.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <Grid item xs={6}><Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>{entry.account || (entry as any).accounts}</Typography></Grid>
                      <Grid item xs={3} sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#4b5563' }}>{entry.debit ? fmt(entry.debit) : '-'}</Typography></Grid>
                      <Grid item xs={3} sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#4b5563' }}>{entry.credit ? fmt(entry.credit) : '-'}</Typography></Grid>
                    </Grid>
                  ))}
                </Box>

                {tab === 'Needs Approval' && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" sx={{ borderColor: '#d1d5db', color: '#374151', textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2 }}>
                      Reject & Re-map
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#111', textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2, '&:hover': { bgcolor: '#374151' } }}>
                      Approve for Sync
                    </Button>
                  </Box>
                )}
                {tab === 'Failed' && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                    <Button variant="contained" sx={{ bgcolor: '#111', textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2, '&:hover': { bgcolor: '#374151' } }}>
                      Retry Sync
                    </Button>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        ))}

        {filteredBatches.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>All caught up</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#6b7280' }}>No batches in this state.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default B2BAccounting;
