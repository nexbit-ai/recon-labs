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

// ── Date Range Presets & Category Reconciliation Models ───────────────────────
export type DateRangePreset = 'all' | 'q4' | 'q3' | 'q2' | 'custom';

export interface DatePresetConfig {
  key: DateRangePreset;
  label: string;
  start: string;
  end: string;
  displayRange: string;
}

export const DATE_PRESETS: DatePresetConfig[] = [
  { key: 'all', label: 'All time', start: '2025-07-01', end: '2026-03-31', displayRange: '01 Jul 2025 – 31 Mar 2026' },
  { key: 'q4', label: 'Q4 FY26 (Jan–Mar)', start: '2026-01-01', end: '2026-03-31', displayRange: '01 Jan 2026 – 31 Mar 2026' },
  { key: 'q3', label: 'Q3 FY26 (Oct–Dec)', start: '2025-10-01', end: '2025-12-31', displayRange: '01 Oct 2025 – 31 Dec 2025' },
  { key: 'q2', label: 'Q2 FY26 (Jul–Sep)', start: '2025-07-01', end: '2025-09-30', displayRange: '01 Jul 2025 – 30 Sep 2025' },
  { key: 'custom', label: 'Custom range', start: '', end: '', displayRange: 'Custom date selection' },
];

export interface CategoryReconMetric {
  key: string;
  label: string;
  docType: TxnFilter;
  matchedCount: number;
  matchedAmount: number;
  unmatchedCount: number;
  unmatchedAmount: number;
  ledgerPair: string;
}

export const CATEGORY_METRICS_BY_PERIOD: Record<string, CategoryReconMetric[]> = {
  all: [
    {
      key: 'invoices',
      label: 'Invoices',
      docType: 'Invoice',
      matchedCount: 138,
      matchedAmount: 4617556,
      unmatchedCount: 2,
      unmatchedAmount: 182500,
      ledgerPair: 'Zoho SI ↔ Tally PB',
    },
    {
      key: 'creditNotes',
      label: 'Credit notes',
      docType: 'Credit Note',
      matchedCount: 11,
      matchedAmount: 54752,
      unmatchedCount: 5,
      unmatchedAmount: 37839,
      ledgerPair: 'Zoho CN ↔ Tally PR',
    },
    {
      key: 'debitNotes',
      label: 'Debit notes',
      docType: 'Debit Note',
      matchedCount: 8,
      matchedAmount: 72400,
      unmatchedCount: 8,
      unmatchedAmount: 83758,
      ledgerPair: 'Vendor DN ↔ Kapiva CN',
    },
    {
      key: 'payments',
      label: 'Payments',
      docType: 'Payment',
      matchedCount: 38,
      matchedAmount: 2977196,
      unmatchedCount: 1,
      unmatchedAmount: 47259,
      ledgerPair: 'Bank / Rec ↔ Tally PT',
    },
    {
      key: 'tds',
      label: 'TDS deduction',
      docType: 'TDS',
      matchedCount: 0,
      matchedAmount: 0,
      unmatchedCount: 10,
      unmatchedAmount: 778,
      ledgerPair: '26AS ↔ Tally JV',
    },
  ],
  q4: [
    {
      key: 'invoices',
      label: 'Invoices',
      docType: 'Invoice',
      matchedCount: 42,
      matchedAmount: 1420410,
      unmatchedCount: 0,
      unmatchedAmount: 0,
      ledgerPair: 'Zoho SI ↔ Tally PB',
    },
    {
      key: 'creditNotes',
      label: 'Credit notes',
      docType: 'Credit Note',
      matchedCount: 3,
      matchedAmount: 12800,
      unmatchedCount: 0,
      unmatchedAmount: 0,
      ledgerPair: 'Zoho CN ↔ Tally PR',
    },
    {
      key: 'debitNotes',
      label: 'Debit notes',
      docType: 'Debit Note',
      matchedCount: 2,
      matchedAmount: 18400,
      unmatchedCount: 4,
      unmatchedAmount: 41263,
      ledgerPair: 'Vendor DN ↔ Kapiva CN',
    },
    {
      key: 'payments',
      label: 'Payments',
      docType: 'Payment',
      matchedCount: 12,
      matchedAmount: 1145200,
      unmatchedCount: 0,
      unmatchedAmount: 0,
      ledgerPair: 'Bank / Rec ↔ Tally PT',
    },
    {
      key: 'tds',
      label: 'TDS deduction',
      docType: 'TDS',
      matchedCount: 0,
      matchedAmount: 0,
      unmatchedCount: 7,
      unmatchedAmount: 778,
      ledgerPair: '26AS ↔ Tally JV',
    },
  ],
  q3: [
    {
      key: 'invoices',
      label: 'Invoices',
      docType: 'Invoice',
      matchedCount: 46,
      matchedAmount: 1580240,
      unmatchedCount: 0,
      unmatchedAmount: 0,
      ledgerPair: 'Zoho SI ↔ Tally PB',
    },
    {
      key: 'creditNotes',
      label: 'Credit notes',
      docType: 'Credit Note',
      matchedCount: 4,
      matchedAmount: 21600,
      unmatchedCount: 3,
      unmatchedAmount: 37287,
      ledgerPair: 'Zoho CN ↔ Tally PR',
    },
    {
      key: 'debitNotes',
      label: 'Debit notes',
      docType: 'Debit Note',
      matchedCount: 3,
      matchedAmount: 24800,
      unmatchedCount: 1,
      unmatchedAmount: 8177,
      ledgerPair: 'Vendor DN ↔ Kapiva CN',
    },
    {
      key: 'payments',
      label: 'Payments',
      docType: 'Payment',
      matchedCount: 14,
      matchedAmount: 982400,
      unmatchedCount: 0,
      unmatchedAmount: 0,
      ledgerPair: 'Bank / Rec ↔ Tally PT',
    },
    {
      key: 'tds',
      label: 'TDS deduction',
      docType: 'TDS',
      matchedCount: 0,
      matchedAmount: 0,
      unmatchedCount: 2,
      unmatchedAmount: 0,
      ledgerPair: '26AS ↔ Tally JV',
    },
  ],
  q2: [
    {
      key: 'invoices',
      label: 'Invoices',
      docType: 'Invoice',
      matchedCount: 50,
      matchedAmount: 1616906,
      unmatchedCount: 2,
      unmatchedAmount: 182500,
      ledgerPair: 'Zoho SI ↔ Tally PB',
    },
    {
      key: 'creditNotes',
      label: 'Credit notes',
      docType: 'Credit Note',
      matchedCount: 4,
      matchedAmount: 20352,
      unmatchedCount: 2,
      unmatchedAmount: 552,
      ledgerPair: 'Zoho CN ↔ Tally PR',
    },
    {
      key: 'debitNotes',
      label: 'Debit notes',
      docType: 'Debit Note',
      matchedCount: 3,
      matchedAmount: 29200,
      unmatchedCount: 3,
      unmatchedAmount: 34318,
      ledgerPair: 'Vendor DN ↔ Kapiva CN',
    },
    {
      key: 'payments',
      label: 'Payments',
      docType: 'Payment',
      matchedCount: 12,
      matchedAmount: 849596,
      unmatchedCount: 1,
      unmatchedAmount: 47259,
      ledgerPair: 'Bank / Rec ↔ Tally PT',
    },
    {
      key: 'tds',
      label: 'TDS deduction',
      docType: 'TDS',
      matchedCount: 0,
      matchedAmount: 0,
      unmatchedCount: 1,
      unmatchedAmount: 0,
      ledgerPair: '26AS ↔ Tally JV',
    },
  ],
};

const isRowInDateRange = (dateStr: string, startDateStr: string, endDateStr: string): boolean => {
  if (!startDateStr || !endDateStr) return true;
  const rowDate = new Date(dateStr);
  const start = new Date(startDateStr);
  const end = new Date(endDateStr + 'T23:59:59');
  if (isNaN(rowDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) return true;
  return rowDate >= start && rowDate <= end;
};

const matchStatusMeta: Record<DualReconStatus, { label: string; color: string; bg: string; border: string }> = {
  MATCHED: { label: 'MATCHED', color: colors.green, bg: colors.greenTint, border: colors.greenBorder },
  AMOUNT_DIFF: { label: 'AMOUNT DIFF', color: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  NOT_IN_COUNTERPARTY: { label: 'NOT IN NW', color: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  NOT_IN_OUR_BOOKS: { label: 'NOT IN KAPIVA', color: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  TDS: { label: 'TDS GAP', color: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  PENDING: { label: 'PENDING', color: colors.grey700, bg: colors.grey100, border: colors.grey200 },
};

const MatchStatusChip: React.FC<{ status: DualReconStatus }> = ({ status }) => {
  const meta = matchStatusMeta[status] || matchStatusMeta.PENDING;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${meta.border}`,
        bgcolor: meta.bg,
        color: meta.color,
        fontWeight: 600,
        fontSize: 10.5,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: '8px',
        py: '2px',
        borderRadius: '9999px',
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
            borderRadius: '9999px',
            bgcolor: colors.ink,
            color: colors.paper,
            fontSize: 13,
            fontWeight: 600,
            py: `${space.md}px`,
            px: `${space.xl}px`,
            alignSelf: 'flex-start',
            '&:hover': { bgcolor: colors.inkHover },
          }}
        >
          View in Exception Centre →
        </Button>
      )}
    </Box>
  );
};

const Reconciliation: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [matchFilter, setMatchFilter] = React.useState<MatchFilter>('all');
  const [txnFilter, setTxnFilter] = React.useState<TxnFilter>('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // ── Date Range Filter State ───────────────────────────────────────────────
  const [datePreset, setDatePreset] = React.useState<DateRangePreset>('all');
  const [customStart, setCustomStart] = React.useState('2025-07-01');
  const [customEnd, setCustomEnd] = React.useState('2026-03-31');

  // Data for imported overview widgets
  const { platformFilter = 'all' } = useOutletContext<{ platformFilter?: string }>() || {};
  const historicalData = historicalDataMap[platformFilter] || historicalDataMap.all;

  const filterKey = platformFilter.toLowerCase().replace(/\s+/g, '');
  const isAll = filterKey === 'all';
  const scale = isAll ? 1 : 0.35;

  // Active dates
  const activePreset = DATE_PRESETS.find(p => p.key === datePreset) || DATE_PRESETS[0];
  const activeStartDate = datePreset === 'custom' ? customStart : activePreset.start;
  const activeEndDate = datePreset === 'custom' ? customEnd : activePreset.end;
  const activeDisplayRange = datePreset === 'custom'
    ? `${customStart} – ${customEnd}`
    : activePreset.displayRange;

  // Period multiplier for dynamic KPI scaling
  const periodMultiplier = datePreset === 'all' ? 1 : datePreset === 'q4' ? 0.35 : datePreset === 'q3' ? 0.33 : 0.32;
  const rawReceivable = headlineByKey('receivable').value * scale * periodMultiplier;
  const rawShortfall = headlineByKey('leakage').value * scale * periodMultiplier;

  // Active category metrics
  const activeCategoryMetrics = React.useMemo(() => {
    return CATEGORY_METRICS_BY_PERIOD[datePreset] || CATEGORY_METRICS_BY_PERIOD.all;
  }, [datePreset]);

  // ── Totals computed from all rows filtered by active date range ────────────
  const summary = React.useMemo(() => {
    const inRangeRows = dualReconRows.filter(r => isRowInDateRange(r.date, activeStartDate, activeEndDate));
    const matched = inRangeRows.filter(r => r.matchStatus === 'MATCHED');
    const exception = inRangeRows.filter(r => r.matchStatus !== 'MATCHED');
    const sumAbs = (rows: typeof dualReconRows) =>
      rows.reduce((s, r) => s + Math.abs(r.ourRecord ?? r.counterpartyRecord ?? 0), 0);
    return {
      matchedCount: matched.length,
      matchedAmount: sumAbs(matched),
      exceptionCount: exception.length,
      exceptionAmount: sumAbs(exception),
      totalAmount: sumAbs(inRangeRows),
    };
  }, [activeStartDate, activeEndDate]);

  const rows = React.useMemo(() => {
    return dualReconRows.filter(row => {
      const matchesStatus =
        matchFilter === 'all' ? true :
          matchFilter === 'matched' ? row.matchStatus === 'MATCHED' :
            row.matchStatus !== 'MATCHED';
      const matchesTxn =
        txnFilter === 'all' || row.docType === txnFilter;
      const inRange = isRowInDateRange(row.date, activeStartDate, activeEndDate);
      return matchesStatus && matchesTxn && inRange;
    });
  }, [matchFilter, txnFilter, activeStartDate, activeEndDate]);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* ── TOP DATE RANGE & CONTROL BAR ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: `${space.md}px`,
          mb: `${space.xl}px`,
          pb: `${space.md}px`,
          borderBottom: hairline,
        }}
      >
        {/* Date Presets Pill Group */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, letterSpacing: '0.04em', textTransform: 'uppercase', mr: `${space.xs}px` }}>
            Period range:
          </Typography>
          {DATE_PRESETS.map((preset) => {
            const isActive = datePreset === preset.key;
            return (
              <Box
                key={preset.key}
                role="button"
                onClick={() => setDatePreset(preset.key)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  px: `${space.md}px`,
                  py: '5px',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  bgcolor: isActive ? colors.ink : colors.paper,
                  color: isActive ? colors.paper : colors.grey700,
                  border: isActive ? '1px solid transparent' : hairline,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  '&:hover': {
                    bgcolor: isActive ? colors.inkHover : colors.grey100,
                    color: isActive ? colors.paper : colors.ink,
                  },
                }}
              >
                {preset.label}
              </Box>
            );
          })}
        </Box>

        {/* Live Status & Details Drawer Action */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${space.xs}px`,
              bgcolor: colors.grey100,
              border: hairline,
              borderRadius: '9999px',
              px: `${space.md}px`,
              py: '4px',
              fontSize: 12,
              color: colors.grey700,
              ...tabularNums,
            }}
          >
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.green, display: 'inline-block' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.ink, ...tabularNums }}>
              {activeDisplayRange}
            </Typography>
            <Typography sx={{ fontSize: 11, color: colors.grey500 }}>· Continuous sync</Typography>
          </Box>

          <Button
            disableElevation
            onClick={() => setDrawerOpen(true)}
            sx={{
              borderRadius: '9999px',
              border: hairline,
              bgcolor: colors.paper,
              color: colors.ink,
              fontSize: 12.5,
              fontWeight: 600,
              py: '5px',
              px: `${space.lg}px`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            Inspect ledger table →
          </Button>
        </Box>
      </Box>

      {/* ── Custom Date Input Row (When Custom is Selected) ─────────────── */}
      {datePreset === 'custom' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: `${space.md}px`,
            bgcolor: colors.grey50,
            border: hairline,
            borderRadius: '12px',
            p: `${space.md}px`,
            mb: `${space.xl}px`,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.grey700 }}>
            From:
          </Typography>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              color: '#09090b',
            }}
          />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.grey700 }}>
            To:
          </Typography>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              color: '#09090b',
            }}
          />
          <Button
            size="small"
            onClick={() => {}}
            sx={{
              borderRadius: '9999px',
              bgcolor: colors.ink,
              color: colors.paper,
              fontSize: 12,
              fontWeight: 600,
              py: '4px',
              px: `${space.md}px`,
              '&:hover': { bgcolor: colors.inkHover },
            }}
          >
            Apply dates
          </Button>
          <Button
            size="small"
            onClick={() => setDatePreset('all')}
            sx={{
              borderRadius: '9999px',
              border: hairline,
              bgcolor: colors.paper,
              color: colors.grey700,
              fontSize: 12,
              fontWeight: 500,
              py: '4px',
              px: `${space.md}px`,
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            Reset
          </Button>
        </Box>
      )}

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
        <Box sx={{ ...cardBase, p: `${space.xl}px`, borderRadius: '12px' }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total gross revenue</Typography>
          <CountUpMetric value={rawReceivable} format={formatINRShort} />
        </Box>

        {/* 2. Total Received */}
        <Box sx={{ ...cardBase, p: `${space.xl}px`, borderRadius: '12px' }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total received</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(totalReceived * scale * periodMultiplier)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            {formatPercent(pctReceivedOverall)} of gross revenue
          </Caption>
        </Box>

        {/* 3. Total Due (Pending) */}
        <Box sx={{ ...cardBase, p: `${space.xl}px`, borderRadius: '12px' }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total due</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(rawReceivable - (totalReceived * scale * periodMultiplier))}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Pending collection
          </Caption>
        </Box>

        {/* 4. Difference (Leakage) */}
        <Box sx={{ ...cardBase, p: `${space.xl}px`, borderRadius: '12px' }}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Difference</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(rawShortfall)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Leakage / Deductions
          </Caption>
        </Box>
      </Box>

      {/* ── UPGRADED RECONCILIATION STATUS STRIP ───────────────────── */}
      <Box sx={{ mb: `${space.xl}px` }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: `${space.md}px`, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em' }}>
              Reconciliation status by category
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>
              Kapiva (Zoho Books ERP) ↔ New Welcome Agencies (Tally ERP) · Live dual-ledger reconciliation
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
            <Typography sx={{ fontSize: 11, color: colors.grey500, ...tabularNums }}>
              Updated just now
            </Typography>
          </Box>
        </Box>

        {/* 5-Category Cards Strip with Rupee Amounts + Counts */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: `${space.md}px`,
          }}
        >
          {activeCategoryMetrics.map((item) => {
            const hasDiscrepancy = item.unmatchedCount > 0;
            const totalCategoryAmount = item.matchedAmount + item.unmatchedAmount;
            const matchPct = totalCategoryAmount > 0 ? (item.matchedAmount / totalCategoryAmount) * 100 : (item.unmatchedCount === 0 ? 100 : 0);

            return (
              <Box
                key={item.key}
                onClick={() => {
                  setTxnFilter(item.docType);
                  setDrawerOpen(true);
                }}
                sx={{
                  bgcolor: colors.paper,
                  border: hairline,
                  borderRadius: '12px',
                  p: `${space.lg}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#d0d5dd',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Header: Label + Status Tag */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: `${space.sm}px` }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: colors.grey700 }}>
                    {item.label}
                  </Typography>

                  {hasDiscrepancy ? (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        bgcolor: colors.amberTint,
                        border: `1px solid ${colors.amberBorder}`,
                        color: colors.amber,
                        borderRadius: '9999px',
                        px: '8px',
                        py: '2px',
                        fontSize: 11,
                        fontWeight: 600,
                        ...tabularNums,
                      }}
                    >
                      {item.unmatchedCount} open
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        bgcolor: colors.greenTint,
                        border: `1px solid ${colors.greenBorder}`,
                        color: colors.green,
                        borderRadius: '9999px',
                        px: '8px',
                        py: '2px',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Reconciled
                    </Box>
                  )}
                </Box>

                {/* Primary Metric: Matched Rupee Amount */}
                <Box sx={{ my: '4px' }}>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: colors.ink,
                      lineHeight: 1.2,
                      ...tabularNums,
                    }}
                  >
                    {item.matchedAmount > 0 ? formatRupees(item.matchedAmount) : '₹0'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '3px', ...tabularNums }}>
                    {item.matchedCount} matched records
                  </Typography>
                </Box>

                {/* Divider */}
                <Box sx={{ borderTop: hairline, my: `${space.sm}px` }} />

                {/* Secondary Metric: Unmatched Gap Rupee Amount */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 11.5, color: colors.grey700 }}>
                    Unmatched gap
                  </Typography>
                  {hasDiscrepancy ? (
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.amber,
                        ...tabularNums,
                      }}
                    >
                      {formatRupees(item.unmatchedAmount)} ({item.unmatchedCount})
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: colors.green,
                        ...tabularNums,
                      }}
                    >
                      ₹0 · 0 open
                    </Typography>
                  )}
                </Box>

                {/* 3px Minimalist Progress Bar (Rule 2.4) */}
                <Box sx={{ mt: `${space.sm}px` }}>
                  <Box sx={{ width: '100%', height: '3px', bgcolor: colors.grey200, borderRadius: '2px', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${Math.min(100, Math.max(0, matchPct))}%`,
                        height: '100%',
                        bgcolor: matchPct >= 95 ? colors.ink : colors.amber,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '4px' }}>
                    <Typography sx={{ fontSize: 11, color: colors.grey700, ...tabularNums }}>
                      {matchPct.toFixed(1)}% matched
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: colors.grey500 }}>
                      target 100%
                    </Typography>
                  </Box>
                </Box>

                {/* Footnote Ledger Source (Rule 2.5) */}
                <Box
                  sx={{
                    mt: `${space.sm}px`,
                    pt: '6px',
                    borderTop: `1px dashed ${colors.grey100}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: colors.grey500 }}>
                    {item.ledgerPair}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: colors.ink, fontWeight: 500 }}>
                    Inspect →
                  </Typography>
                </Box>
              </Box>
            );
          })}
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
              <Line type="monotone" dataKey="GRN" stroke={colors.green} strokeWidth={2} dot={{ r: 4 }} />
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
                  borderRadius: '9999px',
                  border: hairline,
                  px: `${space.md}px`,
                  py: '5px',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
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
                borderRadius: '9999px',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.lg}px`, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'inline-flex', gap: `${space.xs}px` }}>
            {MATCH_FILTERS.map((f) => {
              const active = matchFilter === f.key;
              return (
                <Box
                  key={f.key}
                  role="tab"
                  onClick={() => setMatchFilter(f.key)}
                  sx={{
                    borderRadius: '9999px',
                    px: `${space.md}px`,
                    py: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: active ? colors.ink : colors.paper,
                    color: active ? colors.paper : colors.grey700,
                    border: active ? '1px solid transparent' : hairline,
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.12s ease',
                    '&:hover': {
                      bgcolor: active ? colors.inkHover : colors.grey100,
                      color: active ? colors.paper : colors.ink,
                    },
                  }}
                >
                  {f.label}
                </Box>
              );
            })}
          </Box>

          <select
            value={txnFilter}
            onChange={(e) => setTxnFilter(e.target.value as TxnFilter)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              color: '#09090b',
              fontSize: 12.5,
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

          <Typography sx={{ fontSize: 12, color: colors.grey500, ml: 'auto', ...tabularNums }}>
            {rows.length} transactions in selected period
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
