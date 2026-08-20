import React from 'react';
import { Box, Typography, Drawer, IconButton, Tooltip } from '@mui/material';
import { ExpandMoreOutlined, ArrowBackOutlined, CloseOutlined, KeyboardArrowRightOutlined, InfoOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { ColumnLabel, Pressable, StatTile } from './primitives';
import { StatusBadge } from './StatusBadge';
import { formatRupees } from '../lib/format';
import {
  blinkitInvoices, blinkitExceptions, blinkitDeductionRecords,
  blinkitCreditDebitNotes, blinkitReturns, blinkitStorageRecords,
  blinkitNonInvoiceCharges,
  type BkSettlement, type BkInvoice, type BkException,
  type BkOrder, type BkCreditDebitNote, type BkReturn,
} from '../mock';

const signed = (n: number): string => (n < 0 ? `−${formatRupees(Math.abs(n))}` : formatRupees(n));

export type DrawerView =
  | { type: 'settlement'; data: BkSettlement }
  | { type: 'invoice'; data: BkInvoice }
  | { type: 'exception'; data: BkException }
  | { type: 'deduction'; label: string; records: typeof blinkitDeductionRecords['commission'] }
  | { type: 'cndn'; data: BkCreditDebitNote }
  | { type: 'return'; data: BkReturn }
  | { type: 'order'; data: BkOrder; invoiceId: string }
  | { type: 'storage' };

// ── QUANTITY RECONCILIATION BAR ─────────────────────────────────────────────
const QuantityBar: React.FC<{ order: BkOrder }> = ({ order }) => {
  if (!order.orderedQty) return null;
  const steps = [
    { label: 'Ordered', qty: order.orderedQty },
    { label: 'Received', qty: order.receivedQty ?? 0 },
    { label: 'Invoiced', qty: order.invoicedQty ?? 0 },
    { label: 'Settled', qty: order.settledQty ?? 0 },
  ];
  const max = order.orderedQty;
  return (
    <Box sx={{ mt: `${space.lg}px`, border: hairline, p: `${space.lg}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
        Quantity reconciliation
      </Typography>
      {steps.map((s) => (
        <Box key={s.label} sx={{ mb: `${space.sm}px` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '2px' }}>
            <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.ink, ...tabularNums }}>{s.qty}</Typography>
          </Box>
          <Box sx={{ height: 6, bgcolor: colors.grey100, position: 'relative' }}>
            <Box sx={{ height: 6, bgcolor: s.qty === max ? '#059669' : colors.accent, width: `${(s.qty / max) * 100}%`, transition: 'width 0.3s ease' }} />
          </Box>
        </Box>
      ))}
      {order.invoicedQty !== undefined && order.settledQty !== undefined && order.invoicedQty > order.settledQty && (
        <Box sx={{ mt: `${space.md}px`, p: `${space.sm}px`, bgcolor: '#FFF7ED', border: '1px solid #FDBA74' }}>
          <Typography sx={{ fontSize: 12, color: '#9A3412' }}>
            {order.invoicedQty - order.settledQty} invoiced units are not yet settled.
          </Typography>
        </Box>
      )}
      {order.orderedQty !== undefined && order.receivedQty !== undefined && order.orderedQty > (order.invoicedQty ?? 0) && (
        <Box sx={{ mt: `${space.sm}px`, p: `${space.sm}px`, bgcolor: colors.grey100, border: hairline }}>
          <Typography sx={{ fontSize: 12, color: colors.grey700 }}>
            {order.orderedQty - (order.invoicedQty ?? 0)} ordered units remain outside the current invoice.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── MATCHING CONFIDENCE ─────────────────────────────────────────────────────
const MatchConfidence: React.FC<{ invoice: BkInvoice }> = ({ invoice }) => {
  if (!invoice.matchConfidence || !invoice.matchDetails) return null;
  const isHigh = invoice.matchConfidence >= 95;
  return (
    <Box sx={{ border: hairline, p: `${space.lg}px`, mt: `${space.lg}px` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: `${space.md}px` }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
          {isHigh ? 'Matched' : 'Matched with review'}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: isHigh ? '#059669' : colors.accent, ...tabularNums }}>
          {invoice.matchConfidence}%
        </Typography>
      </Box>
      {invoice.matchDetails.map((d) => (
        <Box key={d.field} sx={{ display: 'flex', justifyContent: 'space-between', py: '4px' }}>
          <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{d.field}</Typography>
          <Typography sx={{
            fontSize: 12, fontWeight: 500,
            color: d.result === 'Exact match' ? '#059669' : d.result === 'Partial' ? colors.accent : colors.grey700,
          }}>
            {d.result}
          </Typography>
        </Box>
      ))}
      {!isHigh && invoice.matchConfidence < 95 && (
        <Box sx={{ mt: `${space.sm}px`, p: `${space.sm}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}` }}>
          <Typography sx={{ fontSize: 12, color: colors.ink }}>
            Invoice covers only part of the order quantity.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── LINEAGE FLOW ────────────────────────────────────────────────────────────
const LineageNode: React.FC<{ label: string; value: string; sub?: string; onClick?: () => void }> = ({ label, value, sub, onClick }) => (
  <Pressable
    onClick={onClick}
    sx={{
      border: hairline, p: `${space.md}px`, bgcolor: colors.paper,
      transition: 'background-color 0.12s',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { bgcolor: colors.grey100 } : undefined,
    }}
  >
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mt: '2px' }}>{value}</Typography>
    {sub && <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '1px', ...tabularNums }}>{sub}</Typography>}
  </Pressable>
);

const LineageArrow: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: '4px' }}>
    <Box sx={{ width: '1px', height: 16, bgcolor: colors.grey500 }} />
  </Box>
);

const TransactionLineage: React.FC<{ invoice: BkInvoice; onInvoiceClick: () => void; onOrderClick: (o: BkOrder) => void }> = ({ invoice, onInvoiceClick, onOrderClick }) => {
  const order = invoice.orders[0];
  const item = order?.items[0];
  return (
    <Box sx={{ mt: `${space.lg}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>Transaction lineage</Typography>
      <LineageNode label="Settlement" value={invoice.settlementId} />
      <LineageArrow />
      <LineageNode label="Invoice" value={invoice.invoiceId} sub={formatRupees(invoice.amount)} onClick={onInvoiceClick} />
      <LineageArrow />
      {order && <LineageNode label="Order" value={order.orderId} sub={formatRupees(order.amount)} onClick={() => onOrderClick(order)} />}
      <LineageArrow />
      {item && <LineageNode label="Item" value={item.itemId} sub={`Qty ${item.quantity}`} />}
    </Box>
  );
};

// ── HOW DID WE CALCULATE THIS? ──────────────────────────────────────────────
const CalcBreakdown: React.FC<{ invoice: BkInvoice }> = ({ invoice }) => {
  const [open, setOpen] = React.useState(false);
  const totalDeductions = invoice.deductions.reduce((s, d) => s + d.amount, 0);
  return (
    <Box sx={{ mt: `${space.lg}px` }}>
      <Pressable
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex', alignItems: 'center', gap: `${space.sm}px`,
          p: `${space.md}px`, border: hairline, bgcolor: colors.grey100,
          '&:hover': { bgcolor: colors.grey200 },
        }}
      >
        <InfoOutlined sx={{ fontSize: 16, color: colors.accent }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.accent }}>
          How did we calculate this?
        </Typography>
        <ExpandMoreOutlined sx={{
          fontSize: 18, color: colors.grey500, ml: 'auto',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }} />
      </Pressable>
      <AnimatePresence initial={false}>
        {open && (
          <Box
            component={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            sx={{ overflow: 'hidden' }}
          >
            <Box sx={{ border: hairline, borderTop: 'none', p: `${space.lg}px` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: `${space.md}px` }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>Invoice value</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(invoice.amount)}</Typography>
              </Box>
              {invoice.deductions.map((d) => (
                <Box key={d.label} sx={{ display: 'flex', justifyContent: 'space-between', py: `${space.sm}px`, borderTop: hairline }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{d.label}</Typography>
                    {d.calculation && <Typography sx={{ fontSize: 12, color: colors.grey500 }}>{d.calculation}</Typography>}
                  </Box>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums, flexShrink: 0 }}>−{formatRupees(d.amount)}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: `${space.md}px`, mt: `${space.sm}px`, borderTop: `2px solid ${colors.ink}` }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Net payout</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {formatRupees(invoice.amount - totalDeductions)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

// Tooltips for Expected Payout
const getChannelExpectedInfo = (channel: string) => {
  const c = channel.toLowerCase();
  if (c.includes('blinkit')) return "Calculated per contract: Gross Revenue − (Commission @ 2%) − (Shipping @ ₹60/unit) − (TDS @ 0.1%) − GST + Other Additions.";
  if (c.includes('zepto')) return "Calculated per contract: Gross Revenue − (Commission @ 2.5%) − (Shipping @ ₹50/unit) − (TDS @ 0.1%) − GST + Credits.";
  if (c.includes('reliance')) return "Calculated per contract: Gross Revenue − (Margin @ 15%) − (Logistics @ 1%) − (TDS @ 0.1%) − GST.";
  return "Calculated per contract terms for this channel.";
};

const ExpectedBreakdownTooltipContent: React.FC<{ settlement: BkSettlement }> = ({ settlement }) => {
  if (!settlement.components || settlement.components.length === 0) {
    return (
      <Box sx={{ p: '4px' }}>
        <Typography sx={{ fontSize: 12, color: '#fff' }}>
          {getChannelExpectedInfo(settlement.channel)}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: '4px', minWidth: 260 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff', mb: '10px' }}>Expected calculation</Typography>
      {settlement.components.map((c, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '6px' }}>
          <Box sx={{ pr: '16px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{c.label}</Typography>
            {c.calculation && <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', mt: '2px' }}>{c.calculation}</Typography>}
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: c.type === 'revenue' ? 600 : 500, color: '#fff', ...tabularNums, whiteSpace: 'nowrap' }}>
            {c.type === 'revenue' ? '' : c.amount < 0 ? '+' : '−'}{formatRupees(Math.abs(c.amount))}
          </Typography>
        </Box>
      ))}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: '6px', mt: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Expected Payout</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff', ...tabularNums }}>{formatRupees(settlement.expected)}</Typography>
      </Box>
    </Box>
  );
};

const InvoiceBreakdownTooltipContent: React.FC<{ invoice: BkInvoice }> = ({ invoice }) => {
  if (!invoice.deductions || invoice.deductions.length === 0) return null;
  return (
    <Box sx={{ p: '4px', minWidth: 260 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff', mb: '10px' }}>Net Payout calculation</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '6px' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Invoice Value</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff', ...tabularNums }}>{formatRupees(invoice.amount)}</Typography>
      </Box>
      {invoice.deductions.map((d, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '6px' }}>
          <Box sx={{ pr: '16px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{d.label}</Typography>
            {d.calculation && <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', mt: '2px' }}>{d.calculation}</Typography>}
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff', ...tabularNums, whiteSpace: 'nowrap' }}>
            −{formatRupees(d.amount)}
          </Typography>
        </Box>
      ))}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', pt: '6px', mt: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Net Payout</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff', ...tabularNums }}>{formatRupees(invoice.netPayout)}</Typography>
      </Box>
    </Box>
  );
};

// ── SETTLEMENT DRAWER CONTENT ───────────────────────────────────────────────
const SettlementDrawerContent: React.FC<{
  settlement: BkSettlement;
  pushView: (v: DrawerView) => void;
}> = ({ settlement, pushView }) => {
  const invoices = blinkitInvoices.filter(i => i.settlementId === settlement.id);
  const exceptions = blinkitExceptions.filter(e => e.settlementId === settlement.id);
  const heroInvoice = invoices.find(i => i.invoiceId === 'C494249T26042481');

  return (
    <Box sx={{ p: `${space.xl}px` }}>
      {/* Header */}
      <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
        Settlement {settlement.id}
      </Typography>

      {/* Key facts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px`, mb: `${space.xl}px` }}>
        <StatTile label="Expected payout" value={formatRupees(settlement.expected)} info={<ExpectedBreakdownTooltipContent settlement={settlement} />} />
        <StatTile label="Actual payout" value={formatRupees(settlement.actual)} />
        <StatTile label="Difference" value={settlement.difference === 0 ? '₹0' : formatRupees(settlement.difference)} sx={settlement.difference > 0 ? { borderColor: '#EF4444' } : undefined} />
        <StatTile label="Status" value={<StatusBadge status={settlement.status} />} />
      </Box>

      {/* Summary stats */}
      <Box sx={{ display: 'flex', gap: `${space.lg}px`, mb: `${space.xl}px`, flexWrap: 'wrap' }}>
        {[
          { label: 'Invoices', value: settlement.invoiceCount },
          { label: 'Orders', value: settlement.orderCount.toLocaleString('en-IN') },
          { label: 'Items', value: settlement.itemCount.toLocaleString('en-IN') },
        ].map(s => (
          <Box key={s.label} sx={{ border: hairline, p: `${space.md}px`, flex: 1, minWidth: 80 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, ...tabularNums }}>{s.value}</Typography>
            <Typography sx={{ ...type.label, color: colors.grey500, mt: '2px' }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Settlement composition */}
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
        Settlement composition
      </Typography>
      <Box sx={{ border: hairline, mb: `${space.xl}px` }}>
        {settlement.components.map((comp, i) => {
          const isRevenue = comp.type === 'revenue';
          const hasDetail = !!comp.detailKey;
          return (
            <Pressable
              key={comp.label}
              onClick={hasDetail ? () => {
                if (comp.detailKey === 'invoices') {
                  if (invoices.length > 0) pushView({ type: 'invoice', data: invoices[0] });
                } else if (comp.detailKey === 'storage') {
                  pushView({ type: 'storage' });
                } else if (comp.detailKey === 'cndn') {
                  const cn = blinkitCreditDebitNotes[0];
                  if (cn) pushView({ type: 'cndn', data: cn });
                } else if (comp.detailKey && blinkitDeductionRecords[comp.detailKey]) {
                  pushView({ type: 'deduction', label: comp.label, records: blinkitDeductionRecords[comp.detailKey] });
                }
              } : undefined}
              sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: `${space.lg}px`, py: `${space.md}px`,
                borderBottom: i < settlement.components.length - 1 ? hairline : 'none',
                '&:hover': hasDetail ? { bgcolor: colors.grey100 } : undefined,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                <Typography sx={{ fontSize: 14, fontWeight: isRevenue ? 600 : 400, color: colors.ink }}>{comp.label}</Typography>
                {hasDetail && <KeyboardArrowRightOutlined sx={{ fontSize: 16, color: colors.grey500 }} />}
              </Box>
              <Typography sx={{
                fontSize: 14, fontWeight: isRevenue ? 600 : 500, color: colors.ink, ...tabularNums,
              }}>
                {isRevenue ? formatRupees(comp.amount) : comp.amount < 0 ? `+${formatRupees(Math.abs(comp.amount))}` : `−${formatRupees(comp.amount)}`}
              </Typography>
            </Pressable>
          );
        })}
        {/* Totals */}
        <Box sx={{ borderTop: `2px solid ${colors.ink}`, px: `${space.lg}px`, py: `${space.md}px` }}>
          {[
            { label: 'Expected payout', amount: settlement.expected, bold: true },
            { label: 'Actual bank payout', amount: settlement.actual, bold: true },
          ].map(row => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: '4px' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{row.label}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(row.amount)}</Typography>
            </Box>
          ))}
          {settlement.difference > 0 && (
            <Pressable
              onClick={() => {
                const exc = exceptions.find(e => e.type === 'Settlement shortfall');
                if (exc) pushView({ type: 'exception', data: exc });
              }}
              sx={{
                display: 'flex', justifyContent: 'space-between', py: '4px', mt: `${space.sm}px`,
                borderTop: hairline, '&:hover': { bgcolor: '#FEE2E2' },
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#991B1B' }}>Unreconciled</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#991B1B', ...tabularNums }}>{formatRupees(settlement.difference)}</Typography>
                <KeyboardArrowRightOutlined sx={{ fontSize: 16, color: '#991B1B' }} />
              </Box>
            </Pressable>
          )}
        </Box>
      </Box>

      {/* Transaction lineage */}
      {heroInvoice && (
        <TransactionLineage
          invoice={heroInvoice}
          onInvoiceClick={() => pushView({ type: 'invoice', data: heroInvoice })}
          onOrderClick={(o) => pushView({ type: 'order', data: o, invoiceId: heroInvoice.invoiceId })}
        />
      )}

      {/* Non-invoice charges */}
      {settlement.id === 'BLK-SET-1025' && (
        <Box sx={{ mt: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
            Other settlement adjustments
          </Typography>
          <Box sx={{ border: hairline }}>
            {blinkitNonInvoiceCharges.filter(c => c.amount > 0).map((charge, i, arr) => (
              <Pressable
                key={charge.label}
                onClick={() => {
                  if (charge.detailKey === 'storage') {
                    pushView({ type: 'storage' });
                  } else if (charge.detailKey === 'cndn') {
                    pushView({ type: 'cndn', data: blinkitCreditDebitNotes[0] });
                  } else if (blinkitDeductionRecords[charge.detailKey]) {
                    pushView({ type: 'deduction', label: charge.label, records: blinkitDeductionRecords[charge.detailKey] });
                  }
                }}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: `${space.lg}px`, py: `${space.md}px`,
                  borderBottom: i < arr.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                  <Typography sx={{ fontSize: 13, color: colors.ink }}>{charge.label}</Typography>
                  <Typography sx={{ fontSize: 11, color: colors.grey500 }}>{charge.recordCount} records</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(charge.amount)}</Typography>
                  <KeyboardArrowRightOutlined sx={{ fontSize: 16, color: colors.grey500 }} />
                </Box>
              </Pressable>
            ))}
          </Box>
        </Box>
      )}

      {/* Returns */}
      {settlement.id === 'BLK-SET-1025' && blinkitReturns.length > 0 && (
        <Box sx={{ mt: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
            Returns
          </Typography>
          {blinkitReturns.map(ret => (
            <Pressable
              key={ret.returnInvoice}
              onClick={() => pushView({ type: 'return', data: ret })}
              sx={{ border: hairline, p: `${space.lg}px`, '&:hover': { bgcolor: colors.grey100 } }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{ret.returnInvoice}</Typography>
                <Typography sx={{ fontSize: 13, color: '#991B1B', ...tabularNums }}>−{formatRupees(ret.returnAmount)}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>
                Forward: {ret.forwardInvoice} · Order: {ret.orderId} · Qty: {ret.quantity}
              </Typography>
            </Pressable>
          ))}
        </Box>
      )}

      {/* Invoices list */}
      {invoices.length > 0 && (
        <Box sx={{ mt: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
            Invoices in this settlement ({invoices.length} shown of {settlement.invoiceCount})
          </Typography>
          <Box sx={{ border: hairline }}>
            {invoices.map((inv, i) => (
              <Pressable
                key={inv.invoiceId}
                onClick={() => pushView({ type: 'invoice', data: inv })}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: `${space.lg}px`, py: `${space.md}px`,
                  borderBottom: i < invoices.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{inv.invoiceId}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>
                    {inv.orderCount} order{inv.orderCount > 1 ? 's' : ''} · {inv.invoiceDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(inv.amount)}</Typography>
                  <StatusBadge status={inv.status} />
                  <KeyboardArrowRightOutlined sx={{ fontSize: 16, color: colors.grey500 }} />
                </Box>
              </Pressable>
            ))}
          </Box>
        </Box>
      )}

      {/* Exceptions */}
      {exceptions.length > 0 && (
        <Box sx={{ mt: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
            Exceptions ({exceptions.length})
          </Typography>
          <Box sx={{ border: hairline }}>
            {exceptions.map((exc, i) => (
              <Pressable
                key={exc.id}
                onClick={() => pushView({ type: 'exception', data: exc })}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: `${space.lg}px`, py: `${space.md}px`,
                  borderBottom: i < exceptions.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: '#FEF2F2' },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{exc.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{exc.type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#991B1B', ...tabularNums }}>{formatRupees(exc.amount)}</Typography>
                  <StatusBadge status={exc.status} />
                </Box>
              </Pressable>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ── INVOICE DRAWER CONTENT ──────────────────────────────────────────────────
const InvoiceDrawerContent: React.FC<{
  invoice: BkInvoice;
  pushView: (v: DrawerView) => void;
}> = ({ invoice, pushView }) => {
  const relatedInvoices = blinkitInvoices.filter(
    i => i.invoiceId !== invoice.invoiceId && i.orders.some(o => invoice.orders.some(io => io.orderId === o.orderId))
  );
  const linkedCN = blinkitCreditDebitNotes.filter(cn => cn.linkedInvoice === invoice.invoiceId);
  const linkedReturn = blinkitReturns.filter(r => r.forwardInvoice === invoice.invoiceId);

  return (
    <Box sx={{ p: `${space.xl}px` }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.sm}px` }}>
        Invoice {invoice.invoiceId}
      </Typography>
      <Typography sx={{ fontSize: 13, color: colors.grey700, mb: `${space.lg}px` }}>
        Settlement: {invoice.settlementId} · Date: {invoice.invoiceDate}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px`, mb: `${space.xl}px` }}>
        <StatTile label="Invoice amount" value={formatRupees(invoice.amount)} />
        <StatTile label="Net payout" value={formatRupees(invoice.netPayout)} info={<InvoiceBreakdownTooltipContent invoice={invoice} />} />
      </Box>

      {invoice.orderCount > 1 && (
        <Box sx={{ p: `${space.md}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}`, mb: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.accent }}>
            {invoice.orderCount} orders → 1 invoice
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.ink, mt: '2px' }}>
            This invoice consolidates {invoice.orderCount} separate orders.
          </Typography>
        </Box>
      )}
      {relatedInvoices.length > 0 && (
        <Box sx={{ p: `${space.md}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}`, mb: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.accent }}>
            1 order → {relatedInvoices.length + 1} invoices
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.ink, mt: '2px' }}>
            Order {invoice.orders[0]?.orderId} is split across this invoice and {relatedInvoices.map(i => i.invoiceId).join(', ')}.
          </Typography>
        </Box>
      )}

      {/* Orders */}
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
        Orders ({invoice.orders.length})
      </Typography>
      <Box sx={{ border: hairline, mb: `${space.lg}px` }}>
        {invoice.orders.map((order, i) => (
          <Pressable
            key={order.orderId + i}
            onClick={() => pushView({ type: 'order', data: order, invoiceId: invoice.invoiceId })}
            sx={{
              px: `${space.lg}px`, py: `${space.md}px`,
              borderBottom: i < invoice.orders.length - 1 ? hairline : 'none',
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{order.orderId}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{order.orderDate} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(order.amount)}</Typography>
                <KeyboardArrowRightOutlined sx={{ fontSize: 16, color: colors.grey500 }} />
              </Box>
            </Box>
          </Pressable>
        ))}
      </Box>

      {/* Deductions */}
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
        Deductions
      </Typography>
      <Box sx={{ border: hairline, mb: `${space.lg}px` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, borderBottom: hairline }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>Invoice value</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(invoice.amount)}</Typography>
        </Box>
        {invoice.deductions.map(d => (
          <Box key={d.label} sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, borderBottom: hairline }}>
            <Box>
              <Typography sx={{ fontSize: 13, color: colors.ink }}>{d.label}</Typography>
              {d.rate && <Typography sx={{ fontSize: 11, color: colors.grey500 }}>{d.rate}</Typography>}
            </Box>
            <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums }}>−{formatRupees(d.amount)}</Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, borderTop: `2px solid ${colors.ink}` }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>Net payout</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(invoice.netPayout)}</Typography>
        </Box>
      </Box>

      <CalcBreakdown invoice={invoice} />
      <MatchConfidence invoice={invoice} />

      {/* CN/DN */}
      {linkedCN.length > 0 && (
        <Box sx={{ mt: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
            Credit/Debit Notes
          </Typography>
          {linkedCN.map(cn => (
            <Pressable
              key={cn.id}
              onClick={() => pushView({ type: 'cndn', data: cn })}
              sx={{ border: hairline, p: `${space.lg}px`, mb: `${space.sm}px`, '&:hover': { bgcolor: colors.grey100 } }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{cn.id} — {cn.type}</Typography>
                <StatusBadge status={cn.status} />
              </Box>
              <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>{cn.reason}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, mt: '4px', ...tabularNums }}>{formatRupees(cn.amount)}</Typography>
            </Pressable>
          ))}
        </Box>
      )}

      {/* Return */}
      {linkedReturn.length > 0 && (
        <Box sx={{ mt: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
            Returns
          </Typography>
          {linkedReturn.map(ret => (
            <Pressable
              key={ret.returnInvoice}
              onClick={() => pushView({ type: 'return', data: ret })}
              sx={{ border: hairline, p: `${space.lg}px`, '&:hover': { bgcolor: colors.grey100 } }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Return {ret.returnInvoice}</Typography>
                <Typography sx={{ fontSize: 13, color: '#991B1B', ...tabularNums }}>−{formatRupees(ret.returnAmount)}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>
                Order: {ret.orderId} · Qty: {ret.quantity} · {ret.reason}
              </Typography>
            </Pressable>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ── ORDER DRAWER CONTENT ────────────────────────────────────────────────────
const OrderDrawerContent: React.FC<{ order: BkOrder; invoiceId: string }> = ({ order, invoiceId }) => (
  <Box sx={{ p: `${space.xl}px` }}>
    <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.sm}px` }}>
      Order {order.orderId}
    </Typography>
    <Typography sx={{ fontSize: 13, color: colors.grey700, mb: `${space.lg}px` }}>
      Invoice: {invoiceId} · Date: {order.orderDate}
    </Typography>

    <StatTile label="Order amount" value={formatRupees(order.amount)} sx={{ mb: `${space.lg}px` }} />

    <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
      Items ({order.items.length})
    </Typography>
    <Box sx={{ border: hairline, mb: `${space.lg}px` }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 80px', gap: `${space.sm}px`, px: `${space.lg}px`, py: `${space.sm}px`, borderBottom: hairline, bgcolor: colors.grey100 }}>
        <ColumnLabel>Item</ColumnLabel>
        <ColumnLabel align="right">Qty</ColumnLabel>
        <ColumnLabel align="right">Unit Price</ColumnLabel>
        <ColumnLabel align="right">Amount</ColumnLabel>
      </Box>
      {order.items.map(item => (
        <Box key={item.itemId} sx={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 80px', gap: `${space.sm}px`, px: `${space.lg}px`, py: `${space.md}px`, borderBottom: hairline }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{item.skuLabel}</Typography>
            <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Item ID: {item.itemId} · SKU: {item.sku}</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{item.quantity}</Typography>
          <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(item.unitPrice)}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(item.amount)}</Typography>
        </Box>
      ))}
    </Box>

    <QuantityBar order={order} />
  </Box>
);

// ── EXCEPTION DRAWER CONTENT ────────────────────────────────────────────────
const ExceptionDrawerContent: React.FC<{ exception: BkException }> = ({ exception }) => (
  <Box sx={{ p: `${space.xl}px` }}>
    <Box sx={{ p: `${space.lg}px`, bgcolor: '#FEF2F2', border: '1px solid #FECACA', mb: `${space.xl}px` }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#991B1B', mb: '4px' }}>
        {exception.type}
      </Typography>
      <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink }}>{exception.title}</Typography>
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${space.md}px`, mb: `${space.xl}px` }}>
      <StatTile label="Expected" value={formatRupees(exception.detail.expected)} />
      <StatTile label="Actual" value={formatRupees(exception.detail.actual)} />
      <StatTile label="Difference" value={formatRupees(exception.detail.difference)} sx={{ borderColor: '#EF4444' }} />
    </Box>

    <Box sx={{ border: hairline, p: `${space.lg}px`, mb: `${space.xl}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.sm}px` }}>Why Nexbit considers this an exception</Typography>
      <Typography sx={{ fontSize: 13, color: colors.grey700, lineHeight: '20px' }}>{exception.detail.explanation}</Typography>
    </Box>

    <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
      Related records
    </Typography>
    <Box sx={{ border: hairline, mb: `${space.xl}px` }}>
      {exception.detail.relatedRecords.map((rec, i) => (
        <Box key={rec.ref} sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, borderBottom: i < exception.detail.relatedRecords.length - 1 ? hairline : 'none' }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{rec.label}</Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{rec.ref}</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(rec.amount)}</Typography>
        </Box>
      ))}
    </Box>

    <Box sx={{ p: `${space.lg}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}` }}>
      <Typography sx={{ ...type.label, color: colors.accent, mb: `${space.sm}px` }}>Suggested action</Typography>
      <Typography sx={{ fontSize: 13, color: colors.ink, lineHeight: '20px' }}>{exception.suggestedAction}</Typography>
    </Box>
  </Box>
);

// ── DEDUCTION DETAIL DRAWER CONTENT ─────────────────────────────────────────
const DeductionDrawerContent: React.FC<{ label: string; records: typeof blinkitDeductionRecords['commission'] }> = ({ label, records }) => (
  <Box sx={{ p: `${space.xl}px` }}>
    <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
      {label} records
    </Typography>
    <Box sx={{ border: hairline }}>
      {records.map((rec, i) => (
        <Box key={rec.id} sx={{ px: `${space.lg}px`, py: `${space.md}px`, borderBottom: i < records.length - 1 ? hairline : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{rec.label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(rec.amount)}</Typography>
          </Box>
          {rec.invoiceId && <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>Invoice: {rec.invoiceId}</Typography>}
          {rec.orderId && <Typography sx={{ fontSize: 12, color: colors.grey500 }}>Order: {rec.orderId}</Typography>}
          <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>{rec.detail}</Typography>
        </Box>
      ))}
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, mt: '-1px', border: hairline, borderTop: `2px solid ${colors.ink}` }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>Total</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatRupees(records.reduce((s, r) => s + r.amount, 0))}</Typography>
    </Box>
  </Box>
);

// ── CNDN DRAWER CONTENT ─────────────────────────────────────────────────────
const CNDNDrawerContent: React.FC<{ note: BkCreditDebitNote }> = ({ note }) => (
  <Box sx={{ p: `${space.xl}px` }}>
    <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
      {note.type} {note.id}
    </Typography>

    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px`, mb: `${space.xl}px` }}>
      {[
        { label: note.type, value: note.id },
        { label: 'Linked invoice', value: note.linkedInvoice },
        { label: 'Amount', value: formatRupees(note.amount) },
        { label: 'Status', value: note.status },
      ].map(item => (
        <Box key={item.label} sx={{ border: hairline, p: `${space.md}px` }}>
          <Typography sx={{ ...type.label, color: colors.grey500 }}>{item.label}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, mt: '2px' }}>{item.value}</Typography>
        </Box>
      ))}
    </Box>

    <Box sx={{ border: hairline, p: `${space.lg}px`, mb: `${space.lg}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.sm}px` }}>Reason</Typography>
      <Typography sx={{ fontSize: 13, color: colors.grey700, lineHeight: '20px' }}>{note.reason}</Typography>
    </Box>

    <Box sx={{ border: hairline, p: `${space.lg}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.sm}px` }}>Settlement impact</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: note.settlementImpact < 0 ? '#991B1B' : colors.ink, ...tabularNums }}>
        {signed(note.settlementImpact)}
      </Typography>
    </Box>
  </Box>
);

// ── RETURN DRAWER CONTENT ───────────────────────────────────────────────────
const ReturnDrawerContent: React.FC<{ ret: BkReturn }> = ({ ret }) => (
  <Box sx={{ p: `${space.xl}px` }}>
    <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
      Return {ret.returnInvoice}
    </Typography>

    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px`, mb: `${space.xl}px` }}>
      {[
        { label: 'Return Invoice', value: ret.returnInvoice },
        { label: 'Forward Invoice', value: ret.forwardInvoice },
        { label: 'Order', value: ret.orderId },
        { label: 'Quantity', value: String(ret.quantity) },
        { label: 'Return amount', value: formatRupees(ret.returnAmount) },
        { label: 'Settlement impact', value: `−${formatRupees(Math.abs(ret.settlementImpact))}` },
      ].map(item => (
        <Box key={item.label} sx={{ border: hairline, p: `${space.md}px` }}>
          <Typography sx={{ ...type.label, color: colors.grey500 }}>{item.label}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, mt: '2px' }}>{item.value}</Typography>
        </Box>
      ))}
    </Box>

    <Box sx={{ border: hairline, p: `${space.lg}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.sm}px` }}>Reason</Typography>
      <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{ret.reason}</Typography>
    </Box>

    <Box sx={{ mt: `${space.xl}px` }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>Return lineage</Typography>
      <LineageNode label="Forward Invoice" value={ret.forwardInvoice} />
      <LineageArrow />
      <LineageNode label="Order" value={ret.orderId} />
      <LineageArrow />
      <LineageNode label="Return Invoice" value={ret.returnInvoice} sub={`Qty ${ret.quantity} · ${formatRupees(ret.returnAmount)}`} />
      <LineageArrow />
      <LineageNode label="Settlement Impact" value={`−${formatRupees(Math.abs(ret.settlementImpact))}`} />
    </Box>
  </Box>
);

// ── STORAGE DRAWER CONTENT ──────────────────────────────────────────────────
const StorageDrawerContent: React.FC = () => (
  <Box sx={{ p: `${space.xl}px` }}>
    <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
      Storage charges
    </Typography>
    <Box sx={{ border: hairline }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 60px 60px 60px 80px', gap: `${space.sm}px`, px: `${space.lg}px`, py: `${space.sm}px`, borderBottom: hairline, bgcolor: colors.grey100 }}>
        <ColumnLabel>SKU</ColumnLabel>
        <ColumnLabel>Warehouse</ColumnLabel>
        <ColumnLabel>GRN/STO</ColumnLabel>
        <ColumnLabel align="right">Days</ColumnLabel>
        <ColumnLabel align="right">Qty</ColumnLabel>
        <ColumnLabel align="right">Rate</ColumnLabel>
        <ColumnLabel align="right">Amount</ColumnLabel>
      </Box>
      {blinkitStorageRecords.map((rec, i) => (
        <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 60px 60px 60px 80px', gap: `${space.sm}px`, px: `${space.lg}px`, py: `${space.md}px`, borderBottom: i < blinkitStorageRecords.length - 1 ? hairline : 'none' }}>
          <Typography sx={{ fontSize: 12, color: colors.ink }}>{rec.sku}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{rec.warehouse}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.grey500 }}>{rec.grnRef}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.ink, textAlign: 'right', ...tabularNums }}>{rec.storageDays}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.ink, textAlign: 'right', ...tabularNums }}>{rec.quantity}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.ink, textAlign: 'right', ...tabularNums }}>₹{rec.rate}</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(rec.amount)}</Typography>
        </Box>
      ))}
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: `${space.lg}px`, py: `${space.md}px`, border: hairline, borderTop: `2px solid ${colors.ink}`, mt: '-1px' }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>Total storage</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>
        {formatRupees(blinkitStorageRecords.reduce((s, r) => s + r.amount, 0))}
      </Typography>
    </Box>
  </Box>
);

// ── EXPORTED DRAWER WRAPPER ──────────────────────────────────────────────────
interface SettlementDrawerProps {
  open: boolean;
  onClose: () => void;
  stack: DrawerView[];
  popView: () => void;
  pushView: (v: DrawerView) => void;
}

export const SettlementDrawer: React.FC<SettlementDrawerProps> = ({ open, onClose, stack, popView, pushView }) => {
  const currentDrawer = stack[stack.length - 1] ?? null;

  const drawerTitle = currentDrawer
    ? currentDrawer.type === 'settlement' ? `Settlement ${currentDrawer.data.id}`
    : currentDrawer.type === 'invoice' ? `Invoice ${currentDrawer.data.invoiceId}`
    : currentDrawer.type === 'exception' ? currentDrawer.data.title
    : currentDrawer.type === 'deduction' ? `${currentDrawer.label} records`
    : currentDrawer.type === 'cndn' ? `${currentDrawer.data.type} ${currentDrawer.data.id}`
    : currentDrawer.type === 'return' ? `Return ${currentDrawer.data.returnInvoice}`
    : currentDrawer.type === 'order' ? `Order ${currentDrawer.data.orderId}`
    : currentDrawer.type === 'storage' ? 'Storage charges'
    : ''
    : '';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: '50%' }, maxWidth: 680, border: 'none', borderLeft: hairline } }}
    >
      {currentDrawer && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.paper }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: `${space.xl}px`, py: `${space.lg}px`, borderBottom: hairline, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
              {stack.length > 1 && (
                <IconButton onClick={popView} sx={{ borderRadius: 0, color: colors.grey700, p: '4px' }}>
                  <ArrowBackOutlined sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {drawerTitle}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ borderRadius: 0, color: colors.grey700 }}>
              <CloseOutlined />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {currentDrawer.type === 'settlement' && <SettlementDrawerContent settlement={currentDrawer.data} pushView={pushView} />}
            {currentDrawer.type === 'invoice' && <InvoiceDrawerContent invoice={currentDrawer.data} pushView={pushView} />}
            {currentDrawer.type === 'exception' && <ExceptionDrawerContent exception={currentDrawer.data} />}
            {currentDrawer.type === 'deduction' && <DeductionDrawerContent label={currentDrawer.label} records={currentDrawer.records} />}
            {currentDrawer.type === 'cndn' && <CNDNDrawerContent note={currentDrawer.data} />}
            {currentDrawer.type === 'return' && <ReturnDrawerContent ret={currentDrawer.data} />}
            {currentDrawer.type === 'order' && <OrderDrawerContent order={currentDrawer.data} invoiceId={currentDrawer.invoiceId} />}
            {currentDrawer.type === 'storage' && <StorageDrawerContent />}
          </Box>
        </Box>
      )}
    </Drawer>
  );
};
