// Invoices - 3-way match screen.
// Shows invoice list -> click to open 3-way match detail view.
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { OpenInNewOutlined, ArrowBackOutlined, DescriptionOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, ColumnLabel } from '../../components/primitives';
import { INVOICES, POS, GRNS, VENDORS } from '../mock/apData';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

const CHIP_CFG: Record<string, { bg: string; color: string; weight: number }> = {
  'Match':           { bg: colors.grey100,     color: colors.grey700,  weight: 500 },
  'Within tolerance':{ bg: colors.grey100,     color: colors.grey700,  weight: 500 },
  'Needs review':    { bg: colors.paper,        color: colors.ink,      weight: 600 },
  'Block payment':   { bg: colors.accentWash,   color: colors.accent,   weight: 700 },
  'Approved':        { bg: colors.grey100,      color: colors.grey700,  weight: 500 },
  'Pending review':  { bg: colors.paper,        color: colors.ink,      weight: 600 },
  'Exception':       { bg: colors.paper,        color: colors.ink,      weight: 600 },
  'Blocked':         { bg: colors.accentWash,   color: colors.accent,   weight: 700 },
  'Paid':            { bg: colors.grey100,      color: colors.grey500,  weight: 400 },
};

const MatchChip: React.FC<{ status: string }> = ({ status }) => {
  const cfg = CHIP_CFG[status] ?? { bg: colors.grey100, color: colors.grey700, weight: 500 };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: cfg.weight,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: `${space.sm}px`,
        py: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </Box>
  );
};

const Invoices: React.FC = () => {
  const reduce = useReducedMotion();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const vendorMap = Object.fromEntries(VENDORS.map((v) => [v.id, v.name]));

  // ── List View ─────────────────────────────────────────────────────────────
  if (selectedIdx === null) {
    return (
      <Box
        component={motion.div}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Box sx={{ ...cardSx }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 110px 1fr 110px 130px',
              gap: `${space.md}px`,
              px: `${space.xl}px`,
              py: `${space.md}px`,
              bgcolor: colors.grey100,
              borderBottom: hairline,
            }}
          >
            <ColumnLabel>Invoice</ColumnLabel>
            <ColumnLabel>Vendor</ColumnLabel>
            <ColumnLabel>PO</ColumnLabel>
            <ColumnLabel align="right">Amount</ColumnLabel>
            <ColumnLabel>3-Way Match</ColumnLabel>
            <ColumnLabel>Status</ColumnLabel>
          </Box>
          {INVOICES.map((inv, idx) => (
            <Box
              key={inv.id}
              onClick={() => setSelectedIdx(idx)}
              sx={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 110px 1fr 110px 130px',
                gap: `${space.md}px`,
                px: `${space.xl}px`,
                py: `${space.lg}px`,
                borderBottom: idx < INVOICES.length - 1 ? hairline : 'none',
                borderLeft: inv.invoiceStatus === 'Blocked' || inv.invoiceStatus === 'Exception'
                  ? `2px solid ${colors.accent}`
                  : '2px solid transparent',
                transition: 'background-color 0.12s ease',
                '&:hover': { bgcolor: colors.grey100, cursor: 'pointer' },
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>{inv.id}</Typography>
              <Typography sx={{ fontSize: 13, color: colors.ink }}>{vendorMap[inv.vendor] ?? inv.vendor}</Typography>
              <Typography sx={{ fontSize: 12, color: colors.grey700, ...tabularNums }}>{inv.po}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums, textAlign: 'right' }}>{formatINR(inv.totalAmount)}</Typography>
              <Box><MatchChip status={inv.matchStatus} /></Box>
              <Box><MatchChip status={inv.invoiceStatus} /></Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ── Detail View ───────────────────────────────────────────────────────────
  const inv = INVOICES[selectedIdx];
  const po = POS.find((p) => p.id === inv.po);
  const grn = GRNS.find((g) => g.id === inv.grn);
  const vendor = VENDORS.find((v) => v.id === inv.vendor);
  const hasException = inv.matchStatus === 'Needs review' || inv.matchStatus === 'Block payment';

  // Consolidate line items for the comparison table
  const consolidatedLines = inv.lineItems.map((invLi) => {
    const poLi = po?.lineItems.find(p => p.description === invLi.description) || po?.lineItems[0];
    const grnLi = grn?.lineItems.find(g => g.description === invLi.description) || grn?.lineItems[0];

    const hasQtyMismatch = (poLi && invLi.qty !== poLi.qty) || (grnLi && invLi.qty !== grnLi.receivedQty);
    const hasRateMismatch = poLi && invLi.rate !== poLi.rate;

    return {
      description: invLi.description,
      poQty: poLi ? `${poLi.qty} ${poLi.unit}` : '-',
      grnQty: grnLi ? `${grnLi.receivedQty} ${grnLi.unit}` : '-',
      invQty: `${invLi.qty} ${invLi.unit}`,
      rate: `₹${invLi.rate.toLocaleString('en-IN')}`,
      amount: `₹${invLi.amount.toLocaleString('en-IN')}`,
      hasQtyMismatch,
      hasRateMismatch,
    };
  });

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Title & Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.lg}px`, mb: `${space.xl}px`, flexWrap: 'wrap' }}>
        <Button
          onClick={() => setSelectedIdx(null)}
          sx={{
            minWidth: 0,
            p: `${space.sm}px`,
            color: colors.grey700,
            border: hairline,
            bgcolor: colors.paper,
            '&:hover': { bgcolor: colors.grey100, color: colors.ink },
          }}
        >
          <ArrowBackOutlined sx={{ fontSize: 20 }} />
        </Button>
        <PageTitle sx={{ m: 0 }}>Invoice 3-Way Match: {inv.id}</PageTitle>
        <Box sx={{ ml: 'auto', display: 'flex', gap: `${space.sm}px` }}>
          <MatchChip status={inv.matchStatus} />
        </Box>
      </Box>

      {/* Meta Header */}
      <Box sx={{ ...cardSx, mb: `${space.xl}px` }}>
        <Box sx={{ p: `${space.xl}px`, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: `${space.lg}px` }}>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>Vendor</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{vendor?.name}</Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700 }}>GSTIN: {vendor?.gstin}</Typography>
          </Box>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>Dates</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>Inv: {inv.date}</Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700 }}>Due: {inv.dueDate}</Typography>
          </Box>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>Documents</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>PO: {po?.id || '-'}</Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700 }}>GRN: {grn?.id || '-'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>Invoice total</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 600, color: colors.ink, ...tabularNums }}>{formatINR(inv.totalAmount)}</Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700 }}>GST: {formatINR(inv.totalGST)} · Taxable: {formatINR(inv.totalTaxable)}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Contract Verification Banner */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        border: `1px solid ${colors.grey100}`, 
        bgcolor: colors.paper, 
        p: `${space.xl}px`, 
        mb: `${space.xl}px`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
          <DescriptionOutlined sx={{ color: colors.accent, fontSize: 24 }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
              Found related contract for this invoice
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700 }}>
              Master Services Agreement - <Box component="a" href="/b2b/payable/contracts" sx={{ color: colors.accent, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>CT-2024-{vendor?.id.replace('V', '')} (View contract)</Box>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', bgcolor: '#E8F5E9', px: '12px', py: '6px' }}>
          <CheckCircleOutlineOutlined sx={{ color: '#2E7D32', fontSize: 16 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2E7D32' }}>
            Verified: Invoice is generated as per contract
          </Typography>
        </Box>
      </Box>

      {/* Line Item Comparison Table */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Line Item Comparison</SectionTitle>
      <Box sx={{ ...cardSx, mb: `${space.xl}px` }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2.5fr 1fr 1fr 1fr 1fr 1fr' },
            gap: `${space.md}px`,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            bgcolor: colors.grey100,
            borderBottom: hairline,
          }}
        >
          <ColumnLabel>Item Description</ColumnLabel>
          <ColumnLabel>PO Qty</ColumnLabel>
          <ColumnLabel>GRN Qty</ColumnLabel>
          <ColumnLabel>Invoice Qty</ColumnLabel>
          <ColumnLabel align="right">Unit Rate</ColumnLabel>
          <ColumnLabel align="right">Amount</ColumnLabel>
        </Box>
        {consolidatedLines.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2.5fr 1fr 1fr 1fr 1fr 1fr' },
              gap: `${space.md}px`,
              px: `${space.xl}px`,
              py: `${space.md}px`,
              borderBottom: i < consolidatedLines.length - 1 ? hairline : 'none',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{row.description}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{row.poQty}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{row.grnQty}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ fontSize: 13, fontWeight: row.hasQtyMismatch ? 600 : 400, color: row.hasQtyMismatch ? colors.accent : colors.ink }}>{row.invQty}</Typography>
              {row.hasQtyMismatch && <Typography sx={{ fontSize: 11, color: colors.accent, fontWeight: 600 }}>(Mismatch)</Typography>}
            </Box>
            <Typography sx={{ fontSize: 13, color: row.hasRateMismatch ? colors.accent : colors.grey700, textAlign: 'right', fontWeight: row.hasRateMismatch ? 600 : 400 }}>{row.rate}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, textAlign: 'right', ...tabularNums }}>{row.amount}</Typography>
          </Box>
        ))}
        {inv.freightCharge && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2.5fr 1fr 1fr 1fr 1fr 1fr' },
              gap: `${space.md}px`,
              px: `${space.xl}px`,
              py: `${space.md}px`,
              borderTop: hairline,
              bgcolor: colors.accentWash,
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.accent }}>Freight (unapproved line item)</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey500 }}>-</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey500 }}>-</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey500 }}>-</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey500, textAlign: 'right' }}>-</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.accent, textAlign: 'right', ...tabularNums }}>{formatINR(inv.freightCharge)}</Typography>
          </Box>
        )}
      </Box>

      {/* Notes + action */}
      {hasException && (
        <Box sx={{ border: `1px solid ${colors.accent}`, bgcolor: colors.accentWash, p: `${space.xl}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${space.lg}px`, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>This invoice has active exceptions</Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>{inv.exceptionIds.length} exception{inv.exceptionIds.length > 1 ? 's' : ''} flagged by AI - review before payment. {inv.notes}</Typography>
          </Box>
          <Button href="/b2b/payable/exceptions" sx={{ bgcolor: colors.accent, color: colors.paper, fontSize: 13, fontWeight: 600, px: `${space.xl}px`, py: `${space.md}px`, flexShrink: 0, '&:hover': { bgcolor: colors.accentHover } }}>
            <OpenInNewOutlined sx={{ fontSize: 14, mr: '6px' }} />
            Go to exception queue
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Invoices;
