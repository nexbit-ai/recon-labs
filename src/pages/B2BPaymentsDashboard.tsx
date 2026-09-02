import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import { PaymentDetailsDrawer } from '../components/PaymentDetailsDrawer';

// Dummy data
const MOCK_PAYMENTS = [
  { id: 'UTR-ICICI-20250310-001', date: '10 Mar 2025', channel: 'Amazon', amount: '₹2,00,000', paidAmount: '-', allocated: '₹2,00,000', invoices: 1, confidence: 'High', logic: 'Exact Amount Match', source: 'Datavio' },
  { id: 'UTR-ICICI-20250317-004', date: '17 Mar 2025', channel: 'Amazon', amount: '₹2,03,200', paidAmount: '-', allocated: '₹2,03,200', invoices: 1, confidence: 'High', logic: 'Exact Amount Match', source: 'Datavio' },
  { id: 'UTR-HDFC-20250325-009', date: '25 Mar 2025', channel: 'Meesho', amount: '₹47,250', paidAmount: '-', allocated: '₹47,250', invoices: 1, confidence: 'High', logic: 'FIFO (Oldest First)', source: 'Datavio' },
  { id: 'UTR-AXIS-20250402-017', date: '02 Apr 2025', channel: 'Flipkart', amount: '₹2,85,000', paidAmount: '-', allocated: '₹2,85,000', invoices: 2, confidence: 'Medium', logic: 'Sum-of-Invoices Match', source: 'Datavio' },
  { id: 'UTR-SBI-20250405-022', date: '05 Apr 2025', channel: 'Blinkit', amount: '₹62,000', paidAmount: '-', allocated: '₹62,000', invoices: 1, confidence: 'Low', logic: 'Channel Match First', source: 'Datavio' },
  { id: 'UTR-KOTAK-20250407-031', date: '07 Apr 2025', channel: '-', amount: '₹38,400', paidAmount: '-', allocated: '-', invoices: '-', confidence: 'Unmapped', logic: '-', source: 'Datavio' },
  { id: 'UTR-ICICI-20250408-045', date: '08 Apr 2025', channel: 'Amazon', amount: '₹1,26,000', paidAmount: '-', allocated: '₹1,26,000', invoices: 1, confidence: 'Medium', logic: 'Nearest Due Date First', source: 'Manual' },
];

const FILTERS = ['All', 'Mapped', 'Partial', 'Unmapped'] as const;

export default function B2BPaymentsDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const filteredData = useMemo(() => {
    if (selectedFilter === 'All') return MOCK_PAYMENTS;
    if (selectedFilter === 'Mapped') return MOCK_PAYMENTS.filter(p => p.confidence === 'High' || p.confidence === 'Medium' || p.confidence === 'Low');
    if (selectedFilter === 'Partial') return MOCK_PAYMENTS.filter(p => false);
    if (selectedFilter === 'Unmapped') return MOCK_PAYMENTS.filter(p => p.confidence === 'Unmapped');
    return MOCK_PAYMENTS;
  }, [selectedFilter]);

  const renderConfidenceChip = (conf: string) => {
    if (conf === 'High') {
      return (
        <Chip
          label="High"
          size="small"
          sx={{ height: 22, fontSize: '11px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '9999px', px: 0.5 }}
        />
      );
    }
    if (conf === 'Medium' || conf === 'Low') {
      return (
        <Chip
          label={conf}
          size="small"
          sx={{ height: 22, fontSize: '11px', fontWeight: 600, backgroundColor: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a', borderRadius: '9999px', px: 0.5 }}
        />
      );
    }
    return (
      <Chip
        label="Unmapped"
        size="small"
        sx={{ height: 22, fontSize: '11px', fontWeight: 600, backgroundColor: '#f4f4f5', color: '#71717a', border: '1px solid #e4e4e7', borderRadius: '9999px', px: 0.5 }}
      />
    );
  };

  const renderLogicBadge = (logic: string) => {
    if (logic === '-') return '-';
    return (
      <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.25, borderRadius: '9999px', fontSize: '11px', fontWeight: 600, color: '#09090b', border: '1px solid #e4e4e7', backgroundColor: '#f4f4f5' }}>
        {logic}
      </Box>
    );
  };

  const renderSourceBadge = (source: string) => {
    if (source === '-') return '-';
    return (
      <Box sx={{ display: 'inline-flex', fontSize: '11px', fontWeight: 600, color: '#09090b' }}>
        {source}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', backgroundColor: '#ffffff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#71717a' }}>
          UTR reconciliation • 7 payments • MTD
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '9999px', textTransform: 'none', fontSize: '12px', fontWeight: 600, borderColor: '#eaecf0', color: '#334155', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '9999px', textTransform: 'none', fontSize: '12px', fontWeight: 600, borderColor: '#eaecf0', color: '#334155', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* SUMMARY */}
      <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', mb: 1.5 }}>
        Summary
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
        {/* Card 1 */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1, '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' } }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Total received
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Amount</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              ₹9,61,850
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>UTRs</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>7</Typography>
          </Box>
        </Paper>

        {/* Card 2 */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1, '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' } }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Full unmapped UTRs
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Number of UTRs</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              1
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Amount at risk</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>₹38,400</Typography>
          </Box>
        </Paper>

        {/* Card 3 */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1, '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' } }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Partially unmapped UTRs
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Number of UTRs</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              0
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Amount at risk</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>₹0</Typography>
          </Box>
        </Paper>

        {/* Card 4 */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1, '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' } }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Mapped invoices
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Count</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              6
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Amount mapped</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>₹7,20,250</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Filter Pills */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {FILTERS.map(filter => {
            const isSelected = selectedFilter === filter;
            return (
              <Chip
                key={filter}
                label={filter}
                onClick={() => setSelectedFilter(filter)}
                sx={{
                  borderRadius: '9999px',
                  height: 28,
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#09090b' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #09090b' : '1px solid #eaecf0',
                  '&:hover': {
                    backgroundColor: isSelected ? '#09090b' : '#f4f4f5',
                    color: isSelected ? '#ffffff' : '#09090b',
                  }
                }}
              />
            )
          })}
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<UnfoldMoreOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ borderRadius: '9999px', textTransform: 'none', fontSize: '12px', fontWeight: 600, borderColor: '#eaecf0', color: '#334155' }}
        >
          Expand All <span style={{ marginLeft: 6, color: '#a1a1aa', fontWeight: 500 }}>7 UTRs</span>
        </Button>
      </Box>

      {/* Legend / Info bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, px: 1 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          CONFIDENCE
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
            High
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', fontWeight: 600, color: '#ca8a04' }}>
            Medium / Low
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '12px', fontWeight: 600, color: '#71717a' }}>
            Unmapped
          </Box>
        </Box>
      </Box>

      {/* TABLE */}
      <Paper elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.5, px: 2, fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' } }}>
                <TableCell sx={{ width: 40, p: 0, align: 'center' }}></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    UTR REFERENCE <SearchIcon sx={{ fontSize: 14 }} />
                  </Box>
                </TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>CHANNEL</TableCell>
                <TableCell>AMOUNT</TableCell>
                <TableCell>PAID AMOUNT ACROSS INVOICES</TableCell>
                <TableCell>ALLOCATED</TableCell>
                <TableCell>INVOICES</TableCell>
                <TableCell>CONFIDENCE</TableCell>
                <TableCell>LOGIC</TableCell>
                <TableCell>SOURCE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    setSelectedPayment(row);
                    setDrawerOpen(true);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '& td': { borderBottom: '1px solid #eaecf0', py: 1.5, px: 2, fontSize: '12.5px', color: '#09090b', fontWeight: 500 },
                    '&:hover': { backgroundColor: '#fafafa' }
                  }}
                >
                  <TableCell align="center" sx={{ p: '0 !important', width: 40 }}>
                    <IconButton size="small"><AddBoxOutlinedIcon sx={{ fontSize: 16, color: '#a1a1aa' }} /></IconButton>
                  </TableCell>
                  <TableCell sx={{ color: '#09090b', fontWeight: 600 }}>{row.id}</TableCell>
                  <TableCell sx={{ color: '#71717a', fontFamily: 'monospace' }}>{row.date}</TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell sx={{ color: '#09090b', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{row.amount}</TableCell>
                  <TableCell sx={{ color: '#a1a1aa' }}>{row.paidAmount}</TableCell>
                  <TableCell sx={{ color: '#09090b', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{row.allocated}</TableCell>
                  <TableCell>{row.invoices}</TableCell>
                  <TableCell>{renderConfidenceChip(row.confidence)}</TableCell>
                  <TableCell>{renderLogicBadge(row.logic)}</TableCell>
                  <TableCell>{renderSourceBadge(row.source)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderTop: '1px solid #eaecf0', backgroundColor: '#fafafa' }}>
          <Typography sx={{ fontSize: '12px', color: '#71717a' }}>
            Showing {filteredData.length} of {MOCK_PAYMENTS.length} UTRs
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#71717a' }}>
            0 rows expanded
          </Typography>
        </Box>
      </Paper>

      <PaymentDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        payment={selectedPayment}
      />
    </Box>
  );
}
