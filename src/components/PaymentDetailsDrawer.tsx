import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { formatRupees } from '../b2b/lib/format';
import { B2BPaymentReceipt, MOCK_NOTES_NWPL } from '../b2b/mock/b2bReconData';

interface PaymentDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  payment: any | null;
}

export function PaymentDetailsDrawer({ open, onClose, payment }: PaymentDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'waterfall' | 'notes'>('waterfall');

  if (!payment) return null;

  // Normalized fields whether passed B2BPaymentReceipt or legacy shape
  const utrId = payment.id;
  const clientName = payment.clientName || payment.channel || 'Client';
  const displayDate = payment.displayDate || payment.date;
  const totalAmount = payment.totalLumpSum ?? (typeof payment.amount === 'number' ? payment.amount : parseInt(String(payment.amount).replace(/[^0-9]/g, '') || '0', 10));
  const allocatedAmount = payment.allocatedAmount ?? (typeof payment.allocated === 'number' ? payment.allocated : parseInt(String(payment.allocated).replace(/[^0-9]/g, '') || '0', 10));
  const unallocatedBalance = payment.unallocatedBalance ?? Math.max(0, totalAmount - allocatedAmount);
  const bankName = payment.bankName || 'ICICI Bank (A/c ...4819)';
  const paymentMode = payment.paymentMode || 'NEFT';
  const erpSource = payment.erpSource || payment.source || 'Zoho Books';
  const zohoReceiptNo = payment.zohoReceiptNo || 'RCP-2025-09142';
  const allocations = (payment.allocations && payment.allocations.length > 0) ? payment.allocations : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 680, md: 740 },
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <Box sx={{ p: 3, borderBottom: '1px solid #eaecf0', backgroundColor: '#fafafa' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#09090b', fontFamily: 'monospace' }}>
                {utrId}
              </Typography>
              <Chip
                label={paymentMode}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#f4f4f5',
                  color: '#09090b',
                  border: '1px solid #e4e4e7',
                  borderRadius: '9999px',
                }}
              />
              <Chip
                label="FIFO Matched"
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
            </Box>
            <Typography sx={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
              Client: <strong style={{ color: '#09090b' }}>{clientName}</strong> • {displayDate} • {bankName}
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#71717a', mt: 0.25 }}>
              Source: {erpSource} ({zohoReceiptNo})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                '&:hover': { backgroundColor: '#f4f4f5' },
              }}
            >
              Export
            </Button>
            <IconButton onClick={onClose} size="small" sx={{ color: '#71717a' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* ── METRIC TILES ────────────────────────────────────────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 2 }}>
          <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #eaecf0', borderRadius: '8px', bgcolor: '#ffffff' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Lump Sum Received
            </Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
              {formatRupees(totalAmount)}
            </Typography>
            <Typography sx={{ fontSize: '10.5px', color: '#71717a' }}>via ERP Receipt</Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #eaecf0', borderRadius: '8px', bgcolor: '#ffffff' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Allocated (FIFO)
            </Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#16a34a', fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
              {formatRupees(allocatedAmount)}
            </Typography>
            <Typography sx={{ fontSize: '10.5px', color: '#16a34a' }}>Absorbed across bills</Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #eaecf0', borderRadius: '8px', bgcolor: '#ffffff' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Unallocated Surplus
            </Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: unallocatedBalance > 0 ? '#ca8a04' : '#71717a', fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
              {formatRupees(unallocatedBalance)}
            </Typography>
            <Typography sx={{ fontSize: '10.5px', color: '#71717a' }}>Advance on account</Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #eaecf0', borderRadius: '8px', bgcolor: '#ffffff' }}>
            <Typography sx={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Invoices Settled
            </Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
              {payment.invoicesSettledCount ?? 6} Full <span style={{ fontSize: '13px', fontWeight: 500, color: '#ca8a04' }}>+ {payment.invoicesPartialCount ?? 1} Partial</span>
            </Typography>
            <Typography sx={{ fontSize: '10.5px', color: '#71717a' }}>Chronological order</Typography>
          </Paper>
        </Box>
      </Box>

      {/* ── TABS ────────────────────────────────────────── */}
      <Box sx={{ borderBottom: '1px solid #eaecf0', px: 3, bgcolor: '#ffffff' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ sx: { bgcolor: '#09090b', height: 2 } }}
          sx={{ minHeight: 44 }}
        >
          <Tab
            value="waterfall"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SyncAltOutlinedIcon sx={{ fontSize: 16 }} />
                <span>FIFO Waterfall Breakdown ({allocations ? allocations.length : 1} Invoices)</span>
              </Box>
            }
            sx={{ textTransform: 'none', fontSize: '13px', fontWeight: 600, minHeight: 44, py: 0 }}
          />
          <Tab
            value="notes"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Credit & Debit Notes (3)</span>
              </Box>
            }
            sx={{ textTransform: 'none', fontSize: '13px', fontWeight: 600, minHeight: 44, py: 0 }}
          />
        </Tabs>
      </Box>

      {/* ── CONTENT BODY ────────────────────────────────────────── */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        {activeTab === 'waterfall' && (
          <Box>
            {/* Explainer Banner */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <AccountBalanceOutlinedIcon sx={{ fontSize: 18, color: '#3b82f6', mt: 0.25 }} />
              <Box>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                  FIFO Waterfall Matching Engine
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#475569', mt: 0.25 }}>
                  The lump-sum remittance of <strong>{formatRupees(totalAmount)}</strong> was automatically absorbed by Kapiva&apos;s unpaid sales invoices in chronological sequence (oldest invoice first).
                </Typography>
              </Box>
            </Box>

            {/* Waterfall Table */}
            {allocations && allocations.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: '8px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' } }}>
                      <TableCell>FIFO #</TableCell>
                      <TableCell>INVOICE NO / DATE</TableCell>
                      <TableCell align="right">GROSS BILL</TableCell>
                      <TableCell align="right">CN / ADJUST</TableCell>
                      <TableCell align="right">NET PAYABLE</TableCell>
                      <TableCell align="right">PAID (THIS UTR)</TableCell>
                      <TableCell align="right">BALANCE DUE</TableCell>
                      <TableCell align="center">STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allocations.map((item: any) => {
                      const isFull = item.status === 'Fully Settled';
                      const isPartial = item.status === 'Partially Settled';
                      return (
                        <TableRow
                          key={item.invoiceId}
                          sx={{
                            bgcolor: isFull ? 'transparent' : isPartial ? '#fffdf5' : '#fafafa',
                            '& td': { borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '12px' },
                            '&:hover': { bgcolor: '#f8fafc' },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, color: '#71717a' }}>
                            #{item.fifoSequence}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#09090b', fontFamily: 'monospace' }}>
                              {item.invoiceId}
                            </Typography>
                            <Typography sx={{ fontSize: '10.5px', color: '#71717a' }}>
                              {item.invoiceDisplayDate}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', color: '#71717a' }}>
                            {formatRupees(item.grossInvoiceAmount)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', color: item.adjustments > 0 ? '#dc2626' : '#a1a1aa' }}>
                            {item.adjustments > 0 ? `-${formatRupees(item.adjustments)}` : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#09090b' }}>
                            {formatRupees(item.netPayable)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isFull ? '#16a34a' : isPartial ? '#ca8a04' : '#a1a1aa' }}>
                            {item.allocatedFromThisPayment > 0 ? formatRupees(item.allocatedFromThisPayment) : '₹0'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: item.remainingBalance > 0 ? '#b91c1c' : '#16a34a' }}>
                            {formatRupees(item.remainingBalance)}
                          </TableCell>
                          <TableCell align="center">
                            {isFull ? (
                              <Chip
                                icon={<CheckCircleOutlineIcon sx={{ '&&': { fontSize: 13, color: '#16a34a' } }} />}
                                label="Fully Settled"
                                size="small"
                                sx={{ height: 20, fontSize: '10px', fontWeight: 600, bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '9999px' }}
                              />
                            ) : isPartial ? (
                              <Chip
                                icon={<HourglassEmptyOutlinedIcon sx={{ '&&': { fontSize: 13, color: '#ca8a04' } }} />}
                                label="Partially Settled"
                                size="small"
                                sx={{ height: 20, fontSize: '10px', fontWeight: 600, bgcolor: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a', borderRadius: '9999px' }}
                              />
                            ) : (
                              <Chip
                                label="Unpaid"
                                size="small"
                                sx={{ height: 20, fontSize: '10px', fontWeight: 500, bgcolor: '#f4f4f5', color: '#71717a', border: '1px solid #e4e4e7', borderRadius: '9999px' }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', color: '#71717a' }}>
                <Typography sx={{ fontSize: '13px' }}>
                  No multi-invoice allocation breakdown recorded for this transaction.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 'notes' && (
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#09090b', mb: 1.5 }}>
              Reconciliation of Credit Notes & Debit Notes
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#71717a', mb: 2 }}>
              Credit notes issued by Kapiva (Zoho Books) and Debit notes claimed by {clientName}. Deductions are netted against the invoices during FIFO allocation.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {MOCK_NOTES_NWPL.map((note) => {
                const isApproved = note.status === 'Approved';
                return (
                  <Paper
                    key={note.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid #eaecf0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: isApproved ? '#ffffff' : '#fffdf5',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={note.type}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '10px',
                            fontWeight: 700,
                            bgcolor: note.type === 'Credit Note' ? '#eff6ff' : '#fef2f2',
                            color: note.type === 'Credit Note' ? '#1d4ed8' : '#b91c1c',
                            border: `1px solid ${note.type === 'Credit Note' ? '#bfdbfe' : '#fecaca'}`,
                          }}
                        />
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#09090b', fontFamily: 'monospace' }}>
                          {note.referenceNo}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#71717a' }}>
                          Linked to {note.invoiceId} • {note.date}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '12px', color: '#475569' }}>
                        Reason: <strong>{note.reason}</strong> • Raised by: {note.raisedBy}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                        {formatRupees(note.amount)}
                      </Typography>
                      <Chip
                        label={note.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '10.5px',
                          fontWeight: 600,
                          bgcolor: isApproved ? '#f0fdf4' : '#fefce8',
                          color: isApproved ? '#16a34a' : '#ca8a04',
                          border: `1px solid ${isApproved ? '#bbf7d0' : '#fef08a'}`,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <Box sx={{ p: 2, borderTop: '1px solid #eaecf0', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '11.5px', color: '#71717a' }}>
          FIFO Reconciliation Engine • Kapiva ERP Suite
        </Typography>
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
            backgroundColor: '#ffffff',
          }}
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
