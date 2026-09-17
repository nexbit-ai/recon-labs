import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Drawer,
  Button,
} from '@mui/material';
import { mockB2BVendors, B2BVendor } from '../mock/vendors';
import { formatRupees } from '../lib/format';

const CATEGORIES = [
  'All',
  'Pharmacy Chain',
  'Modern Trade',
  'Retail Distributor',
  'Wholesale',
] as const;

export default function Vendors() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<B2BVendor | null>(null);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    let list = mockB2BVendors;

    if (selectedCategory !== 'All') {
      list = list.filter((v) => v.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.code.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.gstin.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', color: '#09090b' }}>
      {/* ── FILTER TABS & SEARCH BAR (NO ICONS, NO TITLE, NO METRICS) ───── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Box
                key={cat}
                role="button"
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  px: 1.5,
                  py: '5px',
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 500,
                  bgcolor: isSelected ? '#09090b' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#09090b',
                  border: isSelected ? '1px solid #09090b' : '1px solid #eaecf0',
                  borderRadius: 0,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': {
                    bgcolor: isSelected ? '#09090b' : '#f4f4f5',
                  },
                }}
              >
                {cat}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type="text"
            placeholder="Search party name, code, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #eaecf0',
              borderRadius: 0,
              backgroundColor: '#ffffff',
              color: '#09090b',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              width: 260,
            }}
          />
        </Box>
      </Box>

      {/* ── DATA TABLE (HIGH DENSITY, MONOCHROME, NO ICONS) ─── */}
      <Paper elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '11px', fontWeight: 700, color: '#09090b', letterSpacing: '0.04em' } }}>
                <TableCell>PARTY NAME</TableCell>
                <TableCell>CATEGORY</TableCell>
                <TableCell align="right">TOTAL BILLED</TableCell>
                <TableCell align="right">SETTLED</TableCell>
                <TableCell align="right">OUTSTANDING</TableCell>
                <TableCell align="right">SETTLED %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVendors.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedVendor(row)}
                  sx={{
                    cursor: 'pointer',
                    '& td': { borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '12.5px', color: '#09090b', fontWeight: 500 },
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                      {row.name}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#71717a', fontFamily: 'monospace' }}>
                      {row.gstin}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontSize: '12px', color: '#475569' }}>
                    {row.category}
                  </TableCell>

                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {formatRupees(row.totalBilled)}
                  </TableCell>

                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {formatRupees(row.totalSettled)}
                  </TableCell>

                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                    {formatRupees(row.outstandingBalance)}
                  </TableCell>

                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {row.settlementRatePct.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderTop: '1px solid #eaecf0', bgcolor: '#fafafa' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>
            Showing {filteredVendors.length} of {mockB2BVendors.length} Counterparties
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>
            Brand: Kapiva • Ledger Master
          </Typography>
        </Box>
      </Paper>

      {/* ── FULL SCREEN POPUP FROM RIGHT OF SCREEN (MONOCHROME, NO ICONS, NO CAPTIONS) ── */}
      <Drawer
        anchor="right"
        transitionDuration={{ enter: 600, exit: 500 }}
        open={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        PaperProps={{
          sx: {
            width: '100vw',
            maxWidth: '100vw',
            height: '100vh',
            borderRadius: 0,
            bgcolor: '#ffffff',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {selectedVendor && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {/* Top Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #eaecf0',
                px: 4,
                py: 2,
                bgcolor: '#fafafa',
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box
                  role="button"
                  onClick={() => setSelectedVendor(null)}
                  sx={{
                    px: 2,
                    py: '6px',
                    border: '1px solid #09090b',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: '#ffffff',
                    color: '#09090b',
                    '&:hover': { bgcolor: '#09090b', color: '#ffffff' },
                  }}
                >
                  Back
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#09090b' }}>
                    {selectedVendor.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace', mt: 0.25 }}>
                    Code: {selectedVendor.code} • Category: {selectedVendor.category} • GSTIN: {selectedVendor.gstin} • Zoho ID: {selectedVendor.zohoContactId}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                onClick={() => setIsCommunicationOpen(true)}
                sx={{
                  border: '1px solid #09090b',
                  color: '#09090b',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 0,
                  textTransform: 'none',
                  px: 3,
                  py: 0.75,
                  '&:hover': { bgcolor: '#f4f4f5' },
                }}
              >
                Communication
              </Button>
            </Box>

            {/* Scrollable Canvas */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3, display: 'flex', gap: 4 }}>
              {/* Left Column: Financials */}
              <Box sx={{ flex: '1 1 65%', minWidth: 0 }}>
                {/* Financial Snapshot */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
                  <Box sx={{ p: 2, border: '1px solid #eaecf0' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Credit Terms
                    </Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, mt: 0.5 }}>
                      {selectedVendor.creditPeriodDays} Days
                    </Typography>
                  </Box>
  
                  <Box sx={{ p: 2, border: '1px solid #eaecf0' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Total Billed
                    </Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
                      {formatRupees(selectedVendor.totalBilled)}
                    </Typography>
                  </Box>
  
                  <Box sx={{ p: 2, border: '1px solid #eaecf0' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Total Settled
                    </Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
                      {formatRupees(selectedVendor.totalSettled)}
                    </Typography>
                  </Box>
  
                  <Box sx={{ p: 2, border: '1px solid #eaecf0' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Outstanding Balance
                    </Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
                      {formatRupees(selectedVendor.outstandingBalance)}
                    </Typography>
                  </Box>
                </Box>
  
                {/* Invoices Ledger */}
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#09090b', mb: 1.5 }}>
                    Invoices Ledger ({selectedVendor.recentInvoices.length})
                  </Typography>
                  {selectedVendor.recentInvoices.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: 0 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '11px', fontWeight: 700 } }}>
                            <TableCell>INVOICE #</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell align="right">GROSS BILLED</TableCell>
                            <TableCell align="right">NET PAYABLE</TableCell>
                            <TableCell align="right">SETTLED AMOUNT</TableCell>
                            <TableCell align="right">BALANCE DUE</TableCell>
                            <TableCell align="center">STATUS</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedVendor.recentInvoices.map((inv) => (
                            <TableRow key={inv.id} sx={{ '& td': { borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '12.5px' } }}>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</TableCell>
                              <TableCell>{inv.date}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatRupees(inv.grossAmount)}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{formatRupees(inv.netPayable)}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatRupees(inv.settledAmount)}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{formatRupees(inv.balanceDue)}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'inline-block', px: 1, py: '2px', fontSize: 10.5, border: '1px solid #09090b', fontWeight: 600 }}>
                                  {inv.status}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, border: '1px solid #eaecf0', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: '#71717a' }}>No recent invoice ledger entries recorded.</Typography>
                    </Box>
                  )}
                </Box>
  
                {/* Payment Receipts History */}
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#09090b', mb: 1.5 }}>
                    Payment Receipts History
                  </Typography>
                  {selectedVendor.recentPayments.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: 0 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '11px', fontWeight: 700 } }}>
                            <TableCell>UTR REFERENCE</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell>MODE</TableCell>
                            <TableCell align="right">REMITTANCE AMOUNT</TableCell>
                            <TableCell align="right">ALLOCATED</TableCell>
                            <TableCell align="center">INVOICES CLEARED</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedVendor.recentPayments.map((p) => (
                            <TableRow key={p.utrId} sx={{ '& td': { borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '12.5px' } }}>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.utrId}</TableCell>
                              <TableCell>{p.date}</TableCell>
                              <TableCell>{p.mode}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{formatRupees(p.amount)}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatRupees(p.allocatedAmount)}</TableCell>
                              <TableCell align="center">{p.invoicesCleared} Invoices</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, border: '1px solid #eaecf0', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: '#71717a' }}>No historical payment receipts attached.</Typography>
                    </Box>
                  )}
                </Box>

                {/* Credit Notes */}
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#09090b', mb: 1.5 }}>
                    Credit Notes
                  </Typography>
                  {selectedVendor.creditNotes && selectedVendor.creditNotes.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: 0 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '11px', fontWeight: 700 } }}>
                            <TableCell>CN ID</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell>REASON</TableCell>
                            <TableCell align="right">AMOUNT</TableCell>
                            <TableCell align="center">STATUS</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedVendor.creditNotes.map((cn) => (
                            <TableRow key={cn.id} sx={{ '& td': { borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '12.5px' } }}>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{cn.id}</TableCell>
                              <TableCell>{cn.date}</TableCell>
                              <TableCell>{cn.reason}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{formatRupees(cn.amount)}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'inline-block', px: 1, py: '2px', fontSize: 10.5, border: '1px solid #09090b', fontWeight: 600 }}>
                                  {cn.status}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, border: '1px solid #eaecf0', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: '#71717a' }}>No credit notes issued.</Typography>
                    </Box>
                  )}
                </Box>

                {/* Debit Notes */}
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#09090b', mb: 1.5 }}>
                    Debit Notes
                  </Typography>
                  {selectedVendor.debitNotes && selectedVendor.debitNotes.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaecf0', borderRadius: 0 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#fafafa', borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '11px', fontWeight: 700 } }}>
                            <TableCell>DN ID</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell>REASON</TableCell>
                            <TableCell align="right">AMOUNT</TableCell>
                            <TableCell align="center">STATUS</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedVendor.debitNotes.map((dn) => (
                            <TableRow key={dn.id} sx={{ '& td': { borderBottom: '1px solid #eaecf0', py: 1.25, px: 1.5, fontSize: '12.5px' } }}>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{dn.id}</TableCell>
                              <TableCell>{dn.date}</TableCell>
                              <TableCell>{dn.reason}</TableCell>
                              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{formatRupees(dn.amount)}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'inline-block', px: 1, py: '2px', fontSize: 10.5, border: '1px solid #09090b', fontWeight: 600 }}>
                                  {dn.status}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, border: '1px solid #eaecf0', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: '#71717a' }}>No debit notes issued.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Right Column: Client Ledger */}
              <Box sx={{ flex: '0 0 35%', minWidth: 280, borderLeft: '1px solid #eaecf0', pl: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#09090b' }}>
                    Client Ledger Reco
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      border: '1px solid #09090b',
                      color: '#09090b',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 0,
                      textTransform: 'none',
                      px: 2,
                      py: 0.5,
                      '&:hover': { bgcolor: '#f4f4f5' },
                    }}
                  >
                    Upload Ledger
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <Box sx={{ p: 1.5, borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>Opening Balance</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.5)}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>Kapiva (Internal) Balance</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance)}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>Client Reported Balance</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.85)}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between', bgcolor: '#fef2f2' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>Pre-Reco Difference</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#991b1b', fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.15)}</Typography>
                  </Box>

                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', mt: 3, mb: 1 }}>
                    Discrepancy Breakdown
                  </Typography>

                  <Box sx={{ p: 1.5, borderBottom: '1px dashed #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#09090b' }}>Invoices (Unmatched)</Typography>
                      <Typography sx={{ fontSize: 10, color: '#71717a' }}>Missing in client books</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.08)}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px dashed #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#09090b' }}>Credit Notes (Unmatched)</Typography>
                      <Typography sx={{ fontSize: 10, color: '#71717a' }}>Not accounted by client</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.04)}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px dashed #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#09090b' }}>Payment not matched</Typography>
                      <Typography sx={{ fontSize: 10, color: '#71717a' }}>Differs from internal</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.02)}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px dashed #eaecf0', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#09090b' }}>TDS & Round Off</Typography>
                      <Typography sx={{ fontSize: 10, color: '#71717a' }}>Rate or deduction diff</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatRupees(selectedVendor.outstandingBalance * 0.01)}</Typography>
                  </Box>

                  <Button
                    variant="contained"
                    sx={{
                      mt: 3,
                      bgcolor: '#09090b',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 0,
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': { bgcolor: '#27272a' },
                    }}
                  >
                    View Full Recon Report
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Bottom Bar */}
            <Box sx={{ p: 2, borderTop: '1px solid #eaecf0', bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <Button
                onClick={() => setSelectedVendor(null)}
                sx={{
                  border: '1px solid #09090b',
                  color: '#ffffff',
                  bgcolor: '#09090b',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 0,
                  textTransform: 'none',
                  px: 3,
                  py: 0.75,
                  '&:hover': { bgcolor: '#27272a', borderColor: '#27272a' },
                }}
              >
                Close Full Screen
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* ── COMMUNICATION SIDEBAR ── */}
      <Drawer
        anchor="right"
        transitionDuration={{ enter: 400, exit: 300 }}
        open={isCommunicationOpen}
        onClose={() => setIsCommunicationOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '100vw',
            bgcolor: '#ffffff',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #eaecf0' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#09090b' }}>
            Communication
          </Typography>
          <Box
            role="button"
            onClick={() => setIsCommunicationOpen(false)}
            sx={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#71717a', '&:hover': { color: '#09090b' } }}
          >
            Close
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectedVendor?.emails && selectedVendor.emails.length > 0 ? (
              selectedVendor.emails.map((email) => (
                <Box key={email.id} sx={{ p: 2, border: '1px solid #eaecf0', bgcolor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#09090b' }}>
                      {email.sender}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#71717a' }}>
                      {email.date}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#09090b', mb: 1 }}>
                    {email.subject}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                    {email.snippet}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Box sx={{ fontSize: 10, px: 1, py: 0.5, border: '1px solid #eaecf0', bgcolor: '#ffffff', color: '#71717a', cursor: 'pointer', '&:hover': { bgcolor: '#f4f4f5' } }}>
                      View Thread
                    </Box>
                    <Box sx={{ fontSize: 10, px: 1, py: 0.5, border: '1px solid #eaecf0', bgcolor: '#ffffff', color: '#71717a', cursor: 'pointer', '&:hover': { bgcolor: '#f4f4f5' } }}>
                      Reply
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 3, border: '1px dashed #eaecf0', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, color: '#71717a' }}>No emails linked to this counterparty.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
