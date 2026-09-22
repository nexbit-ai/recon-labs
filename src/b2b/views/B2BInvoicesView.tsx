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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import {
  ALL_KAPIVA_INVOICES,
  B2BInvoice,
  MOCK_PAYMENT_RECEIPTS,
  B2BPaymentReceipt,
} from '../mock/b2bReconData';
import { formatRupees } from '../lib/format';
import { PaymentDetailsDrawer } from '../../components/PaymentDetailsDrawer';
import { InvoiceDetailsDrawer } from '../components/InvoiceDetailsDrawer';

const STATUS_FILTERS = [
  'All',
  'Fully Settled',
  'Partially Settled',
  'Unpaid',
  'With CN / DN',
  'Pending 30 Days',
  'Pending 45 Days',
  'Pending 60 Days',
  'Pending 90 Days',
] as const;

export default function B2BInvoicesView() {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<B2BInvoice | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);

  // For opening the linked Payment Drawer directly from an invoice!
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedPaymentForDrawer, setSelectedPaymentForDrawer] = useState<B2BPaymentReceipt | null>(null);

  // Outlet context from B2BShell
  const outletContext = useOutletContext<{ clientFilter?: string; platformFilter?: string }>() || {};
  const activeClientFilter = outletContext.clientFilter || outletContext.platformFilter || 'all';

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let list = ALL_KAPIVA_INVOICES;

    // Filter by client
    if (activeClientFilter && activeClientFilter !== 'all') {
      const lower = activeClientFilter.toLowerCase();
      list = list.filter(inv =>
        inv.clientName.toLowerCase().includes(lower) ||
        inv.clientId.toLowerCase().includes(lower)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(inv =>
        inv.id.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        (inv.settlingUtrId && inv.settlingUtrId.toLowerCase().includes(q))
      );
    }

    // Filter by status pill
    if (selectedStatus === 'Fully Settled') {
      return list.filter(inv => inv.fifoStatus === 'Fully Settled');
    }
    if (selectedStatus === 'Partially Settled') {
      return list.filter(inv => inv.fifoStatus === 'Partially Settled');
    }
    if (selectedStatus === 'Unpaid') {
      return list.filter(inv => inv.fifoStatus === 'Unpaid');
    }
    if (selectedStatus === 'With CN / DN') {
      return list.filter(inv => (inv.creditNotesTotal > 0 || inv.debitNotesTotal > 0));
    }
    
    // Time-based aging filters
    const now = new Date().getTime();
    const getDaysDiff = (dateStr: string) => Math.floor((now - new Date(dateStr).getTime()) / (1000 * 3600 * 24));

    if (selectedStatus === 'Pending 30 Days') {
      return list.filter(inv => inv.balanceDue > 0 && getDaysDiff(inv.invoiceDate) >= 30 && getDaysDiff(inv.invoiceDate) < 45);
    }
    if (selectedStatus === 'Pending 45 Days') {
      return list.filter(inv => inv.balanceDue > 0 && getDaysDiff(inv.invoiceDate) >= 45 && getDaysDiff(inv.invoiceDate) < 60);
    }
    if (selectedStatus === 'Pending 60 Days') {
      return list.filter(inv => inv.balanceDue > 0 && getDaysDiff(inv.invoiceDate) >= 60 && getDaysDiff(inv.invoiceDate) < 90);
    }
    if (selectedStatus === 'Pending 90 Days') {
      return list.filter(inv => inv.balanceDue > 0 && getDaysDiff(inv.invoiceDate) >= 90);
    }

    return list.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [activeClientFilter, searchQuery, selectedStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalGross = filteredInvoices.reduce((acc, i) => acc + i.grossAmount, 0);
    const totalAdjustments = filteredInvoices.reduce((acc, i) => acc + (i.creditNotesTotal + i.debitNotesTotal), 0);
    const totalNet = filteredInvoices.reduce((acc, i) => acc + i.netPayable, 0);
    const totalSettled = filteredInvoices.reduce((acc, i) => acc + i.settledAmount, 0);
    const totalBalance = filteredInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
    const settledCount = filteredInvoices.filter(i => i.fifoStatus === 'Fully Settled').length;
    const partialCount = filteredInvoices.filter(i => i.fifoStatus === 'Partially Settled').length;

    return {
      totalGross,
      totalAdjustments,
      totalNet,
      totalSettled,
      totalBalance,
      settledCount,
      partialCount,
      totalCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  const handleOpenLinkedPayment = (utrId: string) => {
    const p = MOCK_PAYMENT_RECEIPTS.find(r => r.id === utrId);
    if (p) {
      setSelectedPaymentForDrawer(p);
      setPaymentDrawerOpen(true);
    }
  };

  return (
    <Box sx={{ width: '100%', backgroundColor: '#ffffff' }}>
      {/* ── METRIC TILES ────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
        {/* Total Invoiced */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Total billed (Zoho ERP)
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Gross sales value</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {formatRupees(metrics.totalGross)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Total invoices</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>{metrics.totalCount} bills</Typography>
          </Box>
        </Paper>

        {/* Settled via FIFO */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Total Settlement Received
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {formatRupees(metrics.totalSettled)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Settled count</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
              {metrics.settledCount} full <span style={{ color: '#71717a' }}>+ {metrics.partialCount} partial</span>
            </Typography>
          </Box>
        </Paper>

        {/* Outstanding Receivables */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            Outstanding balance
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Pending collection</Typography>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {formatRupees(metrics.totalBalance)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Pending bills</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
              {metrics.totalCount - metrics.settledCount} unpaid
            </Typography>
          </Box>
        </Paper>

        {/* CN / DN Adjustments */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #eaecf0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: '#71717a' }}>
            CN & DN adjustments
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              -{formatRupees(metrics.totalAdjustments)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a' }}>Net payable target</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
              {formatRupees(metrics.totalNet)}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ── FILTER PILLS & SEARCH ────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {STATUS_FILTERS.map(filter => {
            const isSelected = selectedStatus === filter;
            return (
              <Chip
                key={filter}
                label={filter}
                onClick={() => setSelectedStatus(filter)}
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
            placeholder="Search Invoice #, Client, UTR..."
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
                width: 270,
                backgroundColor: '#ffffff',
              },
            }}
          />
        </Box>
      </Box>

      {/* ── INVOICES TABLE ────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 270px)', overflowY: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.5, px: 2, fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }, position: 'sticky', top: 0, zIndex: 1 }}>
                <TableCell>INVOICE NO</TableCell>
                <TableCell>INVOICE DATE</TableCell>
                <TableCell>CLIENT / BUYER</TableCell>
                <TableCell align="right">GROSS AMOUNT</TableCell>
                <TableCell align="right">TDS (10%)</TableCell>
                <TableCell align="right">DEBIT NOTE</TableCell>
                <TableCell align="right">NET PAYABLE</TableCell>
                <TableCell align="right">SETTLED (FIFO)</TableCell>
                <TableCell align="right">BALANCE DUE</TableCell>
                <TableCell align="center">SETTLEMENT STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((row) => {
                const isFull = row.fifoStatus === 'Fully Settled';
                const isPartial = row.fifoStatus === 'Partially Settled';
                const hasNotes = (row.creditNotesTotal > 0 || row.debitNotesTotal > 0);

                return (
                  <TableRow
                    key={row.id}
                    onClick={() => {
                      setSelectedInvoice(row);
                      setInvoiceModalOpen(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isFull ? 'transparent' : isPartial ? '#fffdf5' : 'transparent',
                      '& td': { borderBottom: '1px solid #eaecf0', py: 1.5, px: 2, fontSize: '12.5px', color: '#09090b', fontWeight: 500 },
                      '&:hover': { backgroundColor: '#f8fafc' },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ color: '#09090b', fontWeight: 700, fontFamily: 'monospace', fontSize: '12.5px' }}>
                        {row.id}
                      </Typography>
                      <Typography sx={{ fontSize: '10.5px', color: '#71717a' }}>
                        Due: {row.dueDate}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>
                      {row.displayDate}
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                        {row.clientName}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ color: '#09090b', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatRupees(row.grossAmount)}
                    </TableCell>

                    <TableCell align="right" sx={{ color: '#dc2626', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                      -{formatRupees(row.tds)}
                    </TableCell>

                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {hasNotes ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>
                            -{formatRupees(row.creditNotesTotal + row.debitNotesTotal)}
                          </Typography>
                          <WarningAmberOutlinedIcon sx={{ fontSize: 13, color: '#ea580c' }} />
                        </Box>
                      ) : (
                        <Typography sx={{ color: '#a1a1aa' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ color: '#09090b', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatRupees(row.netPayable)}
                    </TableCell>

                    <TableCell align="right" sx={{ color: isFull ? '#16a34a' : isPartial ? '#ca8a04' : '#a1a1aa', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {row.settledAmount > 0 ? formatRupees(row.settledAmount) : '₹0'}
                    </TableCell>

                    <TableCell align="right" sx={{ color: row.balanceDue > 0 ? '#b91c1c' : '#16a34a', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatRupees(row.balanceDue)}
                    </TableCell>

                    <TableCell align="center">
                      {isFull ? (
                        <Chip
                          label="Fully Settled"
                          size="small"
                          sx={{ height: 22, fontSize: '11px', fontWeight: 600, bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '9999px' }}
                        />
                      ) : isPartial ? (
                        <Chip
                          label="Partially Settled"
                          size="small"
                          sx={{ height: 22, fontSize: '11px', fontWeight: 600, bgcolor: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a', borderRadius: '9999px' }}
                        />
                      ) : (
                        <Chip
                          label="Unpaid"
                          size="small"
                          sx={{ height: 22, fontSize: '11px', fontWeight: 500, bgcolor: '#f4f4f5', color: '#71717a', border: '1px solid #e4e4e7', borderRadius: '9999px' }}
                        />
                      )}
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderTop: '1px solid #eaecf0', backgroundColor: '#fafafa' }}>
          <Typography sx={{ fontSize: '12px', color: '#71717a' }}>
            Showing {filteredInvoices.length} of {ALL_KAPIVA_INVOICES.length} Invoices
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#71717a' }}>
            Chronological FIFO Queue • Brand: Kapiva
          </Typography>
        </Box>
      </Paper>

      {/* ── INVOICE DETAIL DRAWER ────────────────────────────────────────── */}
      <InvoiceDetailsDrawer
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        onOpenLinkedPayment={handleOpenLinkedPayment}
      />

      {/* Linked Payment Details Drawer */}
      <PaymentDetailsDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        payment={selectedPaymentForDrawer}
      />
    </Box>
  );
}
