import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { PaymentDetailsDrawer } from '../components/PaymentDetailsDrawer';
import { MOCK_PAYMENT_RECEIPTS, B2BPaymentReceipt } from '../b2b/mock/b2bReconData';
import { formatRupees } from '../b2b/lib/format';

const FILTERS = ['All', 'Fully Allocated', 'Partially Allocated', 'Unmapped'] as const;

export default function B2BPaymentsDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<B2BPaymentReceipt | null>(null);

  // Read client filter from outlet context if provided by B2BShell
  const outletContext = useOutletContext<{ clientFilter?: string; platformFilter?: string }>() || {};
  const activeClientFilter = outletContext.clientFilter || outletContext.platformFilter || 'all';

  // Filter payments by client and filter pills
  const filteredData = useMemo(() => {
    let list = MOCK_PAYMENT_RECEIPTS;

    // Filter by client if active and not 'all'
    if (activeClientFilter && activeClientFilter !== 'all') {
      const lower = activeClientFilter.toLowerCase();
      list = list.filter(p =>
        p.clientName.toLowerCase().includes(lower) ||
        p.clientId.toLowerCase().includes(lower)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.zohoReceiptNo.toLowerCase().includes(q) ||
        p.bankName.toLowerCase().includes(q)
      );
    }

    // Filter by status pill
    if (selectedFilter === 'Fully Allocated') {
      return list.filter(p => p.allocatedAmount === p.totalLumpSum && p.confidence !== 'Unmapped');
    }
    if (selectedFilter === 'Partially Allocated') {
      return list.filter(p => p.invoicesPartialCount > 0 || (p.allocatedAmount < p.totalLumpSum && p.allocatedAmount > 0));
    }
    if (selectedFilter === 'Unmapped') {
      return list.filter(p => p.confidence === 'Unmapped' || p.allocatedAmount === 0);
    }
    return list;
  }, [activeClientFilter, searchQuery, selectedFilter]);

  // Dynamic KPI calculations
  const kpis = useMemo(() => {
    const totalReceived = filteredData.reduce((acc, p) => acc + p.totalLumpSum, 0);
    const totalAllocated = filteredData.reduce((acc, p) => acc + p.allocatedAmount, 0);
    const totalUnallocated = filteredData.reduce((acc, p) => acc + p.unallocatedBalance, 0);
    const fullSettledInvoices = filteredData.reduce((acc, p) => acc + (p.invoicesSettledCount || 0), 0);
    const partialSettledInvoices = filteredData.reduce((acc, p) => acc + (p.invoicesPartialCount || 0), 0);

    return {
      totalReceived,
      totalAllocated,
      totalUnallocated,
      fullSettledInvoices,
      partialSettledInvoices,
      totalReceipts: filteredData.length,
    };
  }, [filteredData]);

  const renderConfidenceChip = (conf: string) => {
    if (conf === 'High') {
      return (
        <Chip
          label="High (FIFO)"
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

  return (
    <Box sx={{ width: '100%', backgroundColor: '#ffffff' }}>
      {/* ── KPI METRIC CARDS ────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
        {/* Card 1: Total Received */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Total lump sum received
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>ERP Receipts (Zoho)</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {formatRupees(kpis.totalReceived)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Bank UTRs</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>{kpis.totalReceipts}</Typography>
          </Box>
        </Paper>

        {/* Card 2: Allocated via FIFO */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Allocated to invoices
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Matched via FIFO</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#16a34a', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {formatRupees(kpis.totalAllocated)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Absorption rate</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
              {kpis.totalReceived > 0 ? `${((kpis.totalAllocated / kpis.totalReceived) * 100).toFixed(1)}%` : '0%'}
            </Typography>
          </Box>
        </Paper>

        {/* Card 3: Unallocated Surplus */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Unallocated / Advance
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Awaiting mapping</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: kpis.totalUnallocated > 0 ? '#ca8a04' : '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {formatRupees(kpis.totalUnallocated)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Unmapped receipts</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
              {filteredData.filter(p => p.confidence === 'Unmapped').length}
            </Typography>
          </Box>
        </Paper>

        {/* Card 4: Invoices Settled */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Invoices settled (FIFO)
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Fully settled bills</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {kpis.fullSettledInvoices} <span style={{ fontSize: '15px', fontWeight: 600, color: '#ca8a04' }}>+ {kpis.partialSettledInvoices} partial</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Reconciliation rule</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>Oldest bills first</Typography>
          </Box>
        </Paper>
      </Box>

      {/* ── FILTER PILLS & SEARCH ────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#09090b' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #09090b' : '1px solid #eaecf0',
                  '&:hover': {
                    backgroundColor: isSelected ? '#09090b' : '#f4f4f5',
                    color: isSelected ? '#ffffff' : '#09090b',
                  },
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search UTR, Client, Receipt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: {
                height: 32,
                fontSize: '12px',
                borderRadius: '9999px',
                width: 260,
                backgroundColor: '#ffffff',
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '9999px', textTransform: 'none', fontSize: '12px', fontWeight: 600, borderColor: '#eaecf0', color: '#334155', height: 32 }}
          >
            Export Receipts
          </Button>
        </Box>
      </Box>

      {/* ── PAYMENTS TABLE ────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.5, px: 2, fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' } }}>
                <TableCell sx={{ width: 40, p: 0 }}></TableCell>
                <TableCell>UTR REFERENCE & RECEIPT</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>CLIENT / BUYER</TableCell>
                <TableCell align="right">LUMP SUM AMOUNT</TableCell>
                <TableCell align="right">ALLOCATED (FIFO)</TableCell>
                <TableCell align="right">UNALLOCATED</TableCell>
                <TableCell align="center">INVOICES SETTLED</TableCell>
                <TableCell>MATCH LOGIC</TableCell>
                <TableCell>ERP SOURCE</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
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
                    '&:hover': { backgroundColor: '#fafafa' },
                  }}
                >
                  <TableCell align="center" sx={{ p: '0 !important', width: 40 }}>
                    <IconButton size="small">
                      <AddBoxOutlinedIcon sx={{ fontSize: 16, color: '#a1a1aa' }} />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#09090b', fontWeight: 700, fontFamily: 'monospace', fontSize: '12.5px' }}>
                      {row.id}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#71717a' }}>
                      {row.zohoReceiptNo} • {row.paymentMode}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>
                    {row.displayDate}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                      {row.clientName}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
                      {row.bankName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#09090b', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '13px' }}>
                    {formatRupees(row.totalLumpSum)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '13px' }}>
                    {formatRupees(row.allocatedAmount)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: row.unallocatedBalance > 0 ? '#ca8a04' : '#a1a1aa', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {formatRupees(row.unallocatedBalance)}
                  </TableCell>
                  <TableCell align="center">
                    {row.confidence === 'Unmapped' ? (
                      <Typography sx={{ fontSize: '12px', color: '#a1a1aa' }}>—</Typography>
                    ) : (
                      <Chip
                        label={`${row.invoicesSettledCount} Settled ${row.invoicesPartialCount > 0 ? `+ ${row.invoicesPartialCount} Partial` : ''}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          borderRadius: '9999px',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'inline-flex', px: 1.25, py: 0.25, borderRadius: '9999px', fontSize: '11px', fontWeight: 600, color: '#09090b', border: '1px solid #e4e4e7', backgroundColor: '#f4f4f5' }}>
                      {row.allocationLogic}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      {row.erpSource}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIosIcon sx={{ '&&': { fontSize: 10 } }} />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#2563eb',
                        p: 0,
                        minWidth: 'auto',
                      }}
                    >
                      FIFO View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderTop: '1px solid #eaecf0', backgroundColor: '#fafafa' }}>
          <Typography sx={{ fontSize: '12px', color: '#71717a' }}>
            Showing {filteredData.length} of {MOCK_PAYMENT_RECEIPTS.length} ERP Payment Receipts
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#71717a' }}>
            FIFO Settlement Rule: Oldest open bills absorbed first
          </Typography>
        </Box>
      </Paper>

      {/* ── PAYMENT DETAILS DRAWER WITH FIFO WATERFALL ───────────────── */}
      <PaymentDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        payment={selectedPayment}
      />
    </Box>
  );
}
