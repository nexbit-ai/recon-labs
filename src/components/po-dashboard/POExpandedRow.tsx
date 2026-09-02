import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tabs,
  Tab,
  Paper,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { POItem } from '../../data/mockPOData';

interface POExpandedRowProps {
  po: POItem;
}

export const POExpandedRow: React.FC<POExpandedRowProps> = ({ po }) => {
  const [activeTab, setActiveTab] = useState(0);

  const getTimelineSteps = () => {
    const isClosed = po.status === 'Closed';
    const isDispatched = po.status === 'Dispatched';
    const isExpired = po.status === 'Expired';
    const isOpen = po.status === 'Open';

    return [
      {
        title: 'PO Created',
        date: po.poDate,
        state: 'done',
        description: `Issued to ${po.vendorName}`,
      },
      {
        title: 'Appointment Booked',
        date: po.apptDate,
        state: isOpen && !po.apptDate ? 'current' : 'done',
        description: `Slot at ${po.facility}`,
      },
      {
        title: 'Dispatched',
        date: po.dispatchedDate !== '—' ? po.dispatchedDate : 'Pending',
        state: isDispatched || isClosed ? 'done' : isExpired ? 'failed' : 'pending',
        description: po.ewayBill !== '—' ? `E-Way: ${po.ewayBill}` : 'Awaiting dispatch',
      },
      {
        title: 'GRN Inwarded',
        date: po.grnDate !== '—' ? po.grnDate : 'Pending',
        state: isClosed ? 'done' : isDispatched ? 'current' : isExpired ? 'failed' : 'pending',
        description: po.grnNumber !== '—' ? po.grnNumber : 'Goods receipt pending',
      },
      {
        title: 'Invoiced & Matched',
        date: po.invoiceDate !== '—' ? po.invoiceDate : 'Pending',
        state: isClosed ? 'done' : isExpired ? 'failed' : 'pending',
        description: po.invoiceNumber !== '—' ? po.invoiceNumber : 'Invoice pending',
      },
      {
        title: 'Settled',
        date: isClosed ? 'Settled' : 'Pending',
        state: isClosed ? 'done' : 'pending',
        description: po.settledAmount > 0 ? `₹${po.settledAmount.toLocaleString('en-IN')}` : 'Awaiting settlement',
      },
    ];
  };

  const timeline = getTimelineSteps();
  const healthScore = Math.max(10, Math.min(100, Math.round(po.fillRatePercent > 0 ? po.fillRatePercent : po.status === 'Closed' ? 100 : 75)));

  return (
    <Box
      sx={{
        backgroundColor: '#fafafa',
        p: '20px 24px',
        borderBottom: '1px solid #eaecf0',
      }}
    >
      {/* Vero AI Intelligence Banner for the PO */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          p: '14px 18px',
          mb: 2,
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0',
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                PO Fulfillment Health Score: {healthScore}/100
              </Typography>
              <Chip
                label={healthScore >= 90 ? 'Optimal' : healthScore >= 70 ? 'Moderate' : 'At Risk'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10.5px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  backgroundColor: healthScore >= 90 ? '#ecfdf5' : healthScore >= 70 ? '#fef3c7' : '#fee2e2',
                  color: healthScore >= 90 ? '#059669' : healthScore >= 70 ? '#b45309' : '#b91c1c',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '11.5px', color: '#64748b', mt: 0.25 }}>
              {po.discrepancyAmount > 0
                ? `Shortage of ${po.shortQty.toLocaleString()} units detected (₹${po.discrepancyAmount.toLocaleString('en-IN')}) · Recommended: Raise vendor recovery ticket`
                : 'All ordered quantities accounted for · SLA benchmark maintained within lead time'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={healthScore}
              sx={{
                height: 6,
                borderRadius: '9999px',
                backgroundColor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '9999px',
                  backgroundColor: healthScore >= 90 ? '#059669' : healthScore >= 70 ? '#d97706' : '#e11d48',
                },
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {healthScore}%
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #eaecf0', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 2,
              fontSize: '12.5px',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#059669',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#059669',
              height: 2,
              borderRadius: '2px 2px 0 0',
            },
          }}
        >
          <Tab label={`SKU Line Items (${po.skus.length || po.skusCount})`} />
          <Tab label="Order Lifecycle & Tracking" />
          <Tab label="Discrepancy & Claims Analysis" />
        </Tabs>
      </Box>

      {/* Tab 0: SKU Breakdown */}
      {activeTab === 0 && (
        <Box>
          {po.skus && po.skus.length > 0 ? (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #eaecf0',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.03)',
              }}
            >
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>SKU CODE</TableCell>
                    <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>PRODUCT TITLE</TableCell>
                    <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>EAN / BARCODE</TableCell>
                    <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>HSN</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>TAX</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>UNIT PRICE</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>ORD QTY</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>DISP QTY</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>REC QTY</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>SHORT QTY</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>LINE TOTAL</TableCell>
                    <TableCell align="center" sx={{ fontSize: '10.5px', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {po.skus.map((sku) => {
                    const isShortage = sku.shortQty > 0;
                    return (
                      <TableRow key={sku.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                          {sku.skuCode}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 500, maxWidth: 220, color: '#1e293b' }}>
                          {sku.name}
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px', color: '#64748b' }}>{sku.ean}</TableCell>
                        <TableCell sx={{ fontSize: '11px', color: '#64748b' }}>{sku.hsn}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '11.5px', color: '#64748b' }}>{sku.taxRate}%</TableCell>
                        <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          ₹{sku.unitPrice}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                          {sku.ordQty.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                          {sku.dispatchedQty.toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: '12px',
                            fontWeight: isShortage ? 700 : 500,
                            color: isShortage ? '#d97706' : 'inherit',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {sku.recQty.toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: '12px',
                            fontWeight: isShortage ? 700 : 500,
                            color: isShortage ? '#e11d48' : '#64748b',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {sku.shortQty > 0 ? sku.shortQty.toLocaleString() : '0'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          ₹{sku.lineTotal.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={sku.status}
                            sx={{
                              height: 20,
                              fontSize: '10px',
                              fontWeight: 600,
                              borderRadius: '9999px',
                              backgroundColor:
                                sku.status === 'Matched'
                                  ? '#ecfdf5'
                                  : sku.status === 'Shortage'
                                  ? '#fef3c7'
                                  : sku.status === 'Rejected'
                                  ? '#fee2e2'
                                  : '#f1f5f9',
                              color:
                                sku.status === 'Matched'
                                  ? '#059669'
                                  : sku.status === 'Shortage'
                                  ? '#b45309'
                                  : sku.status === 'Rejected'
                                  ? '#b91c1c'
                                  : '#475569',
                              border: `1px solid ${
                                sku.status === 'Matched'
                                  ? '#a7f3d0'
                                  : sku.status === 'Shortage'
                                  ? '#fde68a'
                                  : sku.status === 'Rejected'
                                  ? '#fecaca'
                                  : '#e2e8f0'
                              }`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                {po.skusCount} SKU item(s) in this purchase order ({po.ordQty.toLocaleString()} total units ordered).
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Tab 1: Timeline */}
      {activeTab === 1 && (
        <Box sx={{ py: 2, px: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              position: 'relative',
              gap: 2,
            }}
          >
            {timeline.map((step, idx) => {
              const isDone = step.state === 'done';
              const isCurrent = step.state === 'current';
              const isFailed = step.state === 'failed';

              return (
                <Box
                  key={step.title}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Connecting Line */}
                  {idx < timeline.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: '50%',
                        width: '100%',
                        height: 2,
                        backgroundColor: isDone ? '#059669' : isFailed ? '#e11d48' : '#eaecf0',
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Icon Circle */}
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '9999px',
                      backgroundColor: isDone
                        ? '#059669'
                        : isCurrent
                        ? '#0f172a'
                        : isFailed
                        ? '#e11d48'
                        : '#eaecf0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      mb: 1,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(15, 23, 42, 0.15)' : isDone ? '0 0 0 3px rgba(5, 150, 105, 0.15)' : 'none',
                    }}
                  >
                    {isDone ? (
                      <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>{idx + 1}</Typography>
                    )}
                  </Box>

                  {/* Title & info */}
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#64748b', mt: 0.25 }}>
                    {step.date}
                  </Typography>
                  <Typography sx={{ fontSize: '10.5px', color: '#94a3b8', mt: 0.25 }}>
                    {step.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Tab 2: Discrepancy & Claims */}
      {activeTab === 2 && (
        <Box sx={{ py: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1, backgroundColor: '#ffffff', p: 2.5, borderRadius: '12px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                Fulfillment & Discrepancy Breakdown
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Ordered Qty</Typography>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{po.ordQty.toLocaleString()} units</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Received Qty</Typography>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: po.shortQty > 0 ? '#d97706' : 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                    {po.recQty.toLocaleString()} units
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Shortage Units</Typography>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: po.shortQty > 0 ? '#e11d48' : '#059669', fontVariantNumeric: 'tabular-nums' }}>
                    {po.shortQty.toLocaleString()} units
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Discrepancy Amount</Typography>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: po.discrepancyAmount > 0 ? '#e11d48' : 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                    ₹{po.discrepancyAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5, borderColor: '#eaecf0' }} />
              <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Reason / Notes:</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: po.discrepancyAmount > 0 ? '#b45309' : '#475569', mt: 0.5 }}>
                {po.discrepancyReason || 'No discrepancy reported.'}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, backgroundColor: '#ffffff', p: 2.5, borderRadius: '12px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
                Invoice & GRN Reference
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Invoice #</Typography>
                  <Typography sx={{ fontSize: '12.5px', fontWeight: 600, fontFamily: 'monospace' }}>
                    {po.invoiceNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Invoice Amount</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{po.invoicedAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>GRN #</Typography>
                  <Typography sx={{ fontSize: '12.5px', fontWeight: 600, fontFamily: 'monospace' }}>
                    {po.grnNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Settled Amount</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                    ₹{po.settledAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
};
