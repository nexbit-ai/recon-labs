// B2B Reconciliation — dual-ledger matching view: Kapiva (Adret/Zoho) vs
// New Welcome Pharma (email docs). Monochrome + one accent (#7A5DBF).
// Square corners, hairline borders, tabular figures throughout.
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Drawer, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import CountUpMetric from '../components/CountUpMetric';
import { cardSx, cardSx as cardBase, ColumnLabel, Pressable, SectionTitle } from '../components/primitives';
import { formatRupees, formatINRShort, formatPercent } from '../lib/format';
import {
  dualReconRows, type DualReconRow, type DualReconStatus,
  headlineByKey,
  totalReceived,
  pctReceivedOverall,
  netRealisationAssumptionPct,
} from '../mock';

const DISPUTES_ROUTE = '/b2b/disputes';
const labelSx = { ...type.label, color: colors.grey700 } as const;
const Caption: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey700, ...sx }}>{children}</Typography>
);

// ── Historical 6-Month Data for Graphs ──
const historicalDataMap: Record<string, any[]> = {
  all: [
    { name: 'Jan', PO: 3.8, GRN: 3.6, Settlement: 3.4 },
    { name: 'Feb', PO: 4.2, GRN: 3.9, Settlement: 3.6 },
    { name: 'Mar', PO: 3.9, GRN: 3.7, Settlement: 3.5 },
    { name: 'Apr', PO: 4.6, GRN: 4.3, Settlement: 4.0 },
    { name: 'May', PO: 4.1, GRN: 3.8, Settlement: 3.6 },
    { name: 'Jun', PO: 4.5, GRN: 4.1, Settlement: 3.8 },
  ],
};

const EXCEPTIONS_ROUTE = '/b2b/exceptions';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const GRID = '160px minmax(180px, 1fr) 130px 120px 120px 120px 120px 130px';

type MatchFilter = 'all' | 'exceptions' | 'matched';
type TxnFilter = 'all' | 'Invoice' | 'Credit Note' | 'Debit Note' | 'Payment' | 'TDS' | 'Purchase Order';

const MATCH_FILTERS: { key: MatchFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'exceptions', label: 'Exceptions' },
  { key: 'matched', label: 'Matched' },
];

const EXCEPTION_CHIPS: { label: string; filter: TxnFilter }[] = [
  { label: 'Invoices not in New Welcome (2)', filter: 'Invoice' },
  { label: 'Credit notes not acknowledged (5)', filter: 'Credit Note' },
  { label: 'Debit notes not in Kapiva (8)', filter: 'Debit Note' },
  { label: 'Payments unconfirmed (1)', filter: 'Payment' },
  { label: 'TDS unmatched (10)', filter: 'TDS' },
];

const matchStatusMeta: Record<DualReconStatus, { label: string }> = {
  MATCHED: { label: 'MATCHED' },
  AMOUNT_DIFF: { label: 'AMOUNT DIFF' },
  NOT_IN_COUNTERPARTY: { label: 'NOT IN NW' },
  NOT_IN_OUR_BOOKS: { label: 'NOT IN KAPIVA' },
  TDS: { label: 'TDS' },
  PENDING: { label: 'PENDING' },
};

const MatchStatusChip: React.FC<{ status: DualReconStatus }> = ({ status }) => {
  const meta = matchStatusMeta[status];
  const isMatched = status === 'MATCHED';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: isMatched ? colors.grey100 : colors.paper,
        color: isMatched ? colors.grey700 : colors.ink,
        fontWeight: isMatched ? 500 : 700,
        fontSize: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        px: `${space.sm}px`,
        py: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </Box>
  );
};

// Expanded detail showing doc source from both sides
const ExpandedDetail: React.FC<{ row: DualReconRow; onNavigate: () => void }> = ({ row, onNavigate }) => {
  const isException = row.matchStatus !== 'MATCHED';
  return (
    <Box
      sx={{
        bgcolor: colors.grey100,
        borderTop: hairline,
        p: `${space.xl}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${space.lg}px`,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Document Source
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.xl}px` }}>
        <Box sx={{ bgcolor: colors.paper, border: hairline, p: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.sm}px` }}>
            Kapiva (Adret / Zoho ERP)
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: row.ourRecord !== null ? colors.ink : colors.grey500 }}>
            {row.ourDocSource}
          </Typography>
          {row.ourRecord !== null && (
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, mt: `${space.sm}px`, ...tabularNums }}>
              {formatRupees(Math.abs(row.ourRecord))}
            </Typography>
          )}
        </Box>
        <Box sx={{ bgcolor: colors.paper, border: hairline, p: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.sm}px` }}>
            New Welcome Pharma (Email / Doc)
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: row.counterpartyRecord !== null ? colors.ink : colors.grey500 }}>
            {row.counterpartyDocSource}
          </Typography>
          {row.counterpartyRecord !== null && (
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, mt: `${space.sm}px`, ...tabularNums }}>
              {formatRupees(Math.abs(row.counterpartyRecord))}
            </Typography>
          )}
        </Box>
      </Box>
      {row.narration && (
        <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{row.narration}</Typography>
      )}
      {isException && (
        <Button
          disableElevation
          onClick={onNavigate}
          sx={{
            borderRadius: 0,
            bgcolor: colors.accent,
            color: colors.paper,
            fontSize: 13,
            fontWeight: 600,
            py: `${space.md}px`,
            px: `${space.xl}px`,
            alignSelf: 'flex-start',
            '&:hover': { bgcolor: colors.accentHover },
          }}
        >
          View in Exception Centre →
        </Button>
      )}
    </Box>
  );
};


// −₹2,85,200 for negatives, ₹0 for zero, ₹X otherwise — always tabular.
const signed = (n: number): string => (n < 0 ? `−${formatRupees(Math.abs(n))}` : formatRupees(n));

// Square hairline-bordered status label — ink/grey only, never coloured.

const Reconciliation: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [matchFilter, setMatchFilter] = React.useState<MatchFilter>('all');
  const [txnFilter, setTxnFilter] = React.useState<TxnFilter>('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Data for imported overview widgets
  const { platformFilter = 'all' } = useOutletContext<{ platformFilter?: string }>() || {};
  const historicalData = historicalDataMap[platformFilter] || historicalDataMap.all;

  const filterKey = platformFilter.toLowerCase().replace(/\s+/g, '');
  const isAll = filterKey === 'all';
  const scale = isAll ? 1 : 0.35;
  const rawReceivable = headlineByKey('receivable').value * scale;
  const rawShortfall = headlineByKey('leakage').value * scale;

  // ── Totals computed from all rows (not filtered) ──────────────────────────
  const summary = React.useMemo(() => {
    const matched = dualReconRows.filter(r => r.matchStatus === 'MATCHED');
    const exception = dualReconRows.filter(r => r.matchStatus !== 'MATCHED');
    const sumAbs = (rows: typeof dualReconRows) =>
      rows.reduce((s, r) => s + Math.abs(r.ourRecord ?? r.counterpartyRecord ?? 0), 0);
    return {
      matchedCount: matched.length,
      matchedAmount: sumAbs(matched),
      exceptionCount: exception.length,
      exceptionAmount: sumAbs(exception),
      totalAmount: sumAbs(dualReconRows),
    };
  }, []);

  const rows = React.useMemo(() => {
    return dualReconRows.filter(row => {
      const matchesStatus =
        matchFilter === 'all' ? true :
          matchFilter === 'matched' ? row.matchStatus === 'MATCHED' :
            row.matchStatus !== 'MATCHED';
      const matchesTxn =
        txnFilter === 'all' || row.docType === txnFilter;
      return matchesStatus && matchesTxn;
    });
  }, [matchFilter, txnFilter]);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* ── Context label & Action ──────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: `${space.lg}px` }}>
        <Typography sx={{ fontSize: 12, color: colors.grey500 }}>
        </Typography>
        <Button
          disableElevation
          onClick={() => setDrawerOpen(true)}
          sx={{
            borderRadius: '9999px',
            border: hairline,
            bgcolor: colors.paper,
            color: colors.ink,
            fontSize: 13,
            fontWeight: 600,
            py: '6px',
            px: `${space.xl}px`,
            '&:hover': { bgcolor: colors.grey100 },
          }}
        >
          View details →
        </Button>
      </Box>

      {/* ── Main Dashboard Cards (Extracted from Overview) ───────────────────────────────────────────── */}

      {/* ── HERO ROW ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        {/* 1. Total Gross Revenue */}
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Gross Revenue</Typography>
          <CountUpMetric value={rawReceivable} format={formatINRShort} />
        </Box>

        {/* 2. Total Received */}
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Received</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(totalReceived * scale)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            {formatPercent(pctReceivedOverall)} of gross revenue
          </Caption>
        </Box>

        {/* 3. Total Due (Pending) */}
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Due</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.accent, ...tabularNums }}>
            {formatINRShort(rawReceivable - (totalReceived * scale))}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Pending collection
          </Caption>
        </Box>

        {/* 4. Difference (Replaced with specific card layout constraint) */}
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Difference</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(rawShortfall)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Leakage / Deductions
          </Caption>
        </Box>
      </Box>

      {/* ── RECONCILIATION STATUS ROW ─────────────────────────────── */}
      <Box sx={{ mb: `${space.xl}px` }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Reconciliation Status</Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
            border: hairline,
          }}
        >
          {[
            { label: 'Invoices', matched: 138, unmatched: 2, route: '/b2b/exceptions' },
            { label: 'Credit Notes', matched: 11, unmatched: 5, route: '/b2b/exceptions' },
            { label: 'Debit Notes', matched: 8, unmatched: 8, route: '/b2b/exceptions' },
            { label: 'Payments', matched: 38, unmatched: 1, route: '/b2b/exceptions' },
            { label: 'TDS', matched: 0, unmatched: 10, route: '/b2b/exceptions' },
          ].map((item, i) => (
            <Box
              key={item.label}
              onClick={() => navigate(item.route)}
              sx={{
                p: `${space.lg}px`,
                borderLeft: i === 0 ? 'none' : hairline,
                cursor: 'pointer',
                '&:hover': { bgcolor: colors.grey100 },
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.sm}px` }}>
                {item.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.sm}px` }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {item.matched}
                </Typography>
                <Typography sx={{ fontSize: 12, color: colors.grey500 }}>matched</Typography>
              </Box>
              {item.unmatched > 0 ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: `${space.xs}px`, mt: '4px', border: hairline, px: `${space.sm}px`, py: '2px' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                    {item.unmatched} unmatched
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: 11, color: colors.grey500, mt: '4px' }}>All clear</Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── FINANCIAL TREND GRAPH ────────────────────────────── */}
      <Box sx={{ ...cardBase, p: `${space.xl}px`, mb: `${space.xl}px` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: `${space.xl}px` }}>
          <SectionTitle>Financial Trend</SectionTitle>
        </Box>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grey100} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.grey500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: colors.grey500 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}Cr`} />
              <Tooltip
                contentStyle={{ borderRadius: 0, border: hairline, borderColor: colors.grey100, fontSize: 13 }}
                itemStyle={{ fontWeight: 500 }}
                formatter={(value: number) => [`₹${value} Cr`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="PO" stroke={colors.ink} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="GRN" stroke={colors.accent} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Settlement" stroke={colors.grey500} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* ── General Overview Cards ───────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
          border: hairline,
          mb: `${space.xl}px`,
        }}
      >
        {/* Total volume */}
        <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.xs}px` }}>
            Total Volume
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            {formatRupees(summary.totalAmount)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>
            {dualReconRows.length} transactions · FY 2025–26
          </Typography>
        </Box>

        {/* Matched */}
        <Box
          sx={{
            px: `${space.xl}px`,
            py: `${space.lg}px`,
            borderLeft: hairline,
            cursor: 'pointer',
            '&:hover': { bgcolor: colors.grey100 },
          }}
          onClick={() => { setMatchFilter('matched'); setTxnFilter('all'); }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.xs}px` }}>
            Matched
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            {formatRupees(summary.matchedAmount)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>
            {summary.matchedCount} transactions reconciled
          </Typography>
        </Box>

        {/* Unmatched (exceptions) */}
        <Box
          sx={{
            px: `${space.xl}px`,
            py: `${space.lg}px`,
            borderLeft: hairline,
            cursor: 'pointer',
            '&:hover': { bgcolor: colors.grey100 },
          }}
          onClick={() => { setMatchFilter('exceptions'); setTxnFilter('all'); }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.xs}px` }}>
            Unmatched
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.md}px` }}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {formatRupees(summary.exceptionAmount)}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                border: hairline,
                px: `${space.sm}px`,
                py: '2px',
                fontSize: 10,
                fontWeight: 700,
                color: colors.ink,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {summary.exceptionCount} open
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>
            Needs action · click to filter
          </Typography>
        </Box>

        {/* Additional Extracted Dashboard Cards */}
        <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px`, borderTop: { xs: hairline, md: 'none' }, borderLeft: { xs: 'none', md: hairline } }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.xs}px` }}>
            Dispute Win Rate
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.md}px` }}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.ink, ...tabularNums }}>
              82.4%
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.green, ...tabularNums }}>
              ↗ +4.1%
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>
            Current month performance
          </Typography>
        </Box>

        <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px`, borderTop: { xs: hairline, md: 'none' }, borderLeft: { xs: 'none', md: hairline } }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: `${space.xs}px` }}>
            Recovered Amount
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            ₹12,45,000
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mt: '8px' }}>
            <Box sx={{ flex: 1, height: '3px', bgcolor: colors.grey100 }}>
              <Box sx={{ width: '65%', height: '100%', bgcolor: colors.ink }} />
            </Box>
            <Typography sx={{ fontSize: 11, color: colors.grey500, ...tabularNums }}>65% of target</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Details Drawer ─────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: '100vw', maxWidth: '100vw', bgcolor: colors.paper, p: `${space.xl}px` }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: `${space.xl}px` }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink }}>
            Reconciliation Details
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Exception bucket chips ─────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: `${space.sm}px`, flexWrap: 'wrap', mb: `${space.xl}px` }}>
          {EXCEPTION_CHIPS.map(chip => {
            const active = txnFilter === chip.filter && matchFilter === 'exceptions';
            return (
              <Box
                key={chip.label}
                role="button"
                onClick={() => {
                  setTxnFilter(chip.filter);
                  setMatchFilter('exceptions');
                }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: hairline,
                  px: `${space.md}px`,
                  py: '5px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? colors.paper : colors.ink,
                  bgcolor: active ? colors.ink : colors.paper,
                  cursor: 'pointer',
                  '&:hover': active ? undefined : { bgcolor: colors.grey100 },
                  transition: 'all 0.12s ease',
                }}
              >
                {chip.label}
              </Box>
            );
          })}
          {(matchFilter !== 'all' || txnFilter !== 'all') && (
            <Box
              role="button"
              onClick={() => { setMatchFilter('all'); setTxnFilter('all'); }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                border: hairline,
                px: `${space.md}px`,
                py: '5px',
                fontSize: 12,
                fontWeight: 500,
                color: colors.grey700,
                bgcolor: colors.grey100,
                cursor: 'pointer',
                '&:hover': { color: colors.ink },
              }}
            >
              Clear ×
            </Box>
          )}
        </Box>

        {/* ── Filter bar ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.lg}px`, mb: `${space.lg}px`, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'inline-flex', border: hairline }}>
            {MATCH_FILTERS.map((f, i) => {
              const active = matchFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  role="tab"
                  selected={active}
                  onClick={() => setMatchFilter(f.key)}
                  sx={{
                    px: `${space.lg}px`,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: active ? 'default' : 'pointer',
                    borderLeft: i === 0 ? 'none' : hairline,
                    bgcolor: active ? colors.accent : 'transparent',
                    color: active ? colors.paper : colors.grey700,
                    fontSize: 13,
                    fontWeight: 600,
                    '&:hover': active ? undefined : { bgcolor: colors.grey100, color: colors.ink },
                  }}
                >
                  {f.label}
                </Pressable>
              );
            })}
          </Box>

          <select
            value={txnFilter}
            onChange={(e) => setTxnFilter(e.target.value as TxnFilter)}
            style={{
              padding: '6px 12px',
              border: hairline,
              backgroundColor: colors.paper,
              color: colors.ink,
              fontSize: 13,
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="all">All Document Types</option>
            <option value="Invoice">Invoice</option>
            <option value="Credit Note">Credit Note</option>
            <option value="Debit Note">Debit Note</option>
            <option value="Payment">Payment</option>
            <option value="TDS">TDS</option>
            <option value="Purchase Order">Purchase Order</option>
          </select>

          <Typography sx={{ fontSize: 12, color: colors.grey500, ml: 'auto' }}>
            {rows.length} rows
          </Typography>
        </Box>

        {/* ── TABLE ─────────────────────────────────────────────────── */}
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 1100 }}>
            {/* Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: GRID,
                alignItems: 'center',
                gap: `${space.md}px`,
                px: `${space.xl}px`,
                py: `${space.md}px`,
                bgcolor: colors.grey100,
                borderBottom: hairline,
              }}
            >
              <ColumnLabel>Reference</ColumnLabel>
              <ColumnLabel>Narration</ColumnLabel>
              <ColumnLabel>Type</ColumnLabel>
              <ColumnLabel>Date</ColumnLabel>
              <ColumnLabel align="right">Kapiva (₹)</ColumnLabel>
              <ColumnLabel align="right">New Welcome (₹)</ColumnLabel>
              <ColumnLabel align="right">Difference (₹)</ColumnLabel>
              <ColumnLabel>Status</ColumnLabel>
            </Box>

            {rows.map((row, idx) => {
              const isExpanded = expandedId === row.id;
              const isException = row.matchStatus !== 'MATCHED';
              return (
                <Box
                  key={row.id}
                  sx={{ borderBottom: idx < rows.length - 1 ? hairline : 'none' }}
                >
                  {/* Main row */}
                  <Box
                    onClick={() => setExpandedId(isExpanded ? null : row.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: GRID,
                      alignItems: 'center',
                      gap: `${space.md}px`,
                      px: `${space.xl}px`,
                      minHeight: 52,
                      py: `${space.sm}px`,
                      cursor: 'pointer',
                      bgcolor: 'transparent',
                      borderLeft: isException ? `3px solid ${colors.ink}` : '3px solid transparent',
                      transition: 'background-color 0.12s ease',
                      '&:hover': { bgcolor: colors.grey100 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontFamily: MONO,
                        color: colors.ink,
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.reference}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: colors.grey700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.narration}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: colors.grey700 }}>
                      {row.docType}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: colors.grey700, ...tabularNums }}>
                      {row.date}
                    </Typography>
                    <Typography sx={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: row.ourRecord !== null ? colors.ink : colors.grey500, ...tabularNums }}>
                      {row.ourRecord !== null ? formatRupees(Math.abs(row.ourRecord)) : '—'}
                    </Typography>
                    <Typography sx={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: row.counterpartyRecord !== null ? colors.ink : colors.grey500, ...tabularNums }}>
                      {row.counterpartyRecord !== null ? formatRupees(Math.abs(row.counterpartyRecord)) : '—'}
                    </Typography>
                    <Typography
                      sx={{
                        textAlign: 'right',
                        fontSize: 13,
                        fontWeight: row.difference !== 0 ? 700 : 400,
                        color: row.difference === 0 ? colors.grey500 : colors.ink,
                        ...tabularNums,
                      }}
                    >
                      {row.difference === 0 ? '₹0' : formatRupees(Math.abs(row.difference))}
                    </Typography>
                    <Box>
                      <MatchStatusChip status={row.matchStatus} />
                    </Box>
                  </Box>

                  {/* Expandable detail */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <Box
                        component={motion.div}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        sx={{ overflow: 'hidden' }}
                      >
                        <ExpandedDetail row={row} onNavigate={() => navigate(EXCEPTIONS_ROUTE)} />
                      </Box>
                    )}
                  </AnimatePresence>
                </Box>
              );
            })}

            {rows.length === 0 && (
              <Box sx={{ p: `${space.xl}px` }}>
                <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>
                  No records match the current filters.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

      </Drawer>
    </Box>
  );
};

export default Reconciliation;
