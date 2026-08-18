// AP Dashboard - command screen for finance teams.
// 8 KPI tiles + recent invoice summary feed.
// Theme: square corners, hairline borders, monochrome + accent, Inter, tabular nums.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import {
  ReceiptLongOutlined,
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  CloudUploadOutlined,
  TimerOutlined,
  BlockOutlined,
  PendingActionsOutlined,
} from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, ColumnLabel } from '../../components/primitives';
import { AP_DASHBOARD, INVOICES, VENDORS } from '../mock/apData';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

// ── Status chips ──────────────────────────────────────────────────────────────
type ChipVariant = 'Match' | 'Within tolerance' | 'Needs review' | 'Block payment' | 'Approved' | 'Pending review' | 'Exception' | 'Blocked' | 'Paid';

const STATUS_CONFIG: Record<ChipVariant, { bg: string; color: string; weight: number }> = {
  'Match':          { bg: colors.grey100, color: colors.grey700,    weight: 500 },
  'Within tolerance':{ bg: colors.grey100, color: colors.grey700,    weight: 500 },
  'Needs review':   { bg: colors.paper,   color: colors.ink,         weight: 600 },
  'Block payment':  { bg: colors.accentWash, color: colors.accent,   weight: 700 },
  'Approved':       { bg: colors.grey100, color: colors.grey700,     weight: 500 },
  'Pending review': { bg: colors.paper,   color: colors.ink,         weight: 600 },
  'Exception':      { bg: colors.paper,   color: colors.ink,         weight: 600 },
  'Blocked':        { bg: colors.accentWash, color: colors.accent,   weight: 700 },
  'Paid':           { bg: colors.grey100, color: colors.grey500,     weight: 400 },
};

const StatusChip: React.FC<{ label: ChipVariant }> = ({ label }) => {
  const cfg = STATUS_CONFIG[label] ?? STATUS_CONFIG['Needs review'];
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
      {label}
    </Box>
  );
};

// ── KPI tile ──────────────────────────────────────────────────────────────────
interface KPITileProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}

const KPITile: React.FC<KPITileProps> = ({ label, value, sub, icon: Icon, accent }) => (
  <Box
    sx={{
      ...cardSx,
      p: `${space.xl}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: `${space.xs}px`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: `${space.sm}px` }}>
      <Typography sx={{ ...type.label, color: colors.grey500 }}>{label}</Typography>
      <Icon sx={{ fontSize: 18, color: accent ? colors.accent : colors.grey500 }} />
    </Box>
    <Typography
      sx={{
        fontSize: 32,
        lineHeight: '38px',
        fontWeight: 600,
        color: accent ? colors.accent : colors.ink,
        ...tabularNums,
      }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '2px' }}>{sub}</Typography>
    )}
  </Box>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const APDashboard: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const d = AP_DASHBOARD;

  const vendorMap = Object.fromEntries(VENDORS.map((v) => [v.id, v.name]));

  const CHART_DATA = [
    { month: 'Jan', amount: 2400000, count: 120 },
    { month: 'Feb', amount: 3200000, count: 155 },
    { month: 'Mar', amount: 2800000, count: 130 },
    { month: 'Apr', amount: 4100000, count: 210 },
    { month: 'May', amount: 3800000, count: 190 },
    { month: 'Jun', amount: 4842160, count: 240 },
  ];

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Title row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          flexWrap: 'wrap',
          mb: `${space.xl}px`,
        }}
      >
        <PageTitle>AP Dashboard</PageTitle>
        <Button
          onClick={() => navigate('/b2b/payable/exceptions')}
          sx={{
            bgcolor: colors.accent,
            color: colors.paper,
            fontSize: 13,
            fontWeight: 600,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            '&:hover': { bgcolor: colors.accentHover },
          }}
        >
          Review {d.exceptionsPending} exceptions →
        </Button>
      </Box>

      {/* ── KPI grid ──────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: `${space.lg}px`,
          mb: `${space.xxl}px`,
        }}
      >
        <KPITile
          label="Total Invoices Processed"
          value={d.totalInvoicesProcessed.toLocaleString()}
          sub={`${formatINR(d.totalPayableValue)} total volume`}
          icon={ReceiptLongOutlined}
        />
        <KPITile
          label="Straight-Through Processing %"
          value={`${d.straightThroughPercent}%`}
          sub="No manual touch required"
          icon={CheckCircleOutlineOutlined}
        />
        <KPITile
          label="Invoices Pending Review"
          value={d.invoicesPendingReview}
          sub="Needs manual attention"
          icon={WarningAmberOutlined}
          accent
        />
        <KPITile
          label="Exceptions Pending"
          value={d.exceptionsPending}
          sub="Requires vendor follow-up"
          icon={ErrorOutlineOutlined}
          accent
        />
        <KPITile
          label="Ready for SAP Push"
          value={d.readyForSAP}
          sub="Cleared 3-way match"
          icon={CloudUploadOutlined}
        />
        <KPITile
          label="Avg AP Processing Time"
          value={`${d.avgProcessingTimeHrs}h`}
          sub="Per invoice end-to-end"
          icon={TimerOutlined}
        />
        <KPITile
          label="Blocked - Missing PO"
          value={d.blockedMissingPO}
          sub="Awaiting PO condition"
          icon={BlockOutlined}
          accent
        />
        <KPITile
          label="Reconciliation Backlog"
          value={d.reconciliationBacklog}
          sub="Open ledger items"
          icon={PendingActionsOutlined}
        />
      </Box>

      {/* ── Processing Volume Chart ───────────────────────────────── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Invoice Processing Volume</SectionTitle>
      <Box sx={{ ...cardSx, p: `${space.xl}px`, mb: `${space.xxl}px`, height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={CHART_DATA} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grey200} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.grey700 }} dy={10} />
            <YAxis yAxisId="left" orientation="left" stroke={colors.grey700} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.accent} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: 0, border: hairline, backgroundColor: colors.paper, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
              formatter={(value: number, name: string) => [name === 'Amount' ? formatINR(value) : value, name]} 
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
            <Bar yAxisId="left" dataKey="amount" name="Amount" fill={colors.ink} barSize={40} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="count" name="Invoice Count" stroke={colors.accent} strokeWidth={3} dot={{ r: 4, fill: colors.accent, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      {/* ── Invoice summary table ─────────────────────────────────── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Invoice pipeline - today</SectionTitle>
      <Box sx={{ ...cardSx }}>
        {/* Table header */}
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
            onClick={() => navigate('/b2b/payable/invoices')}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {inv.id}
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.ink }}>
              {vendorMap[inv.vendor] ?? inv.vendor}
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.grey700, ...tabularNums }}>
              {inv.po}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums, textAlign: 'right' }}>
              {formatINR(inv.totalAmount)}
            </Typography>
            <StatusChip label={inv.matchStatus as ChipVariant} />
            <StatusChip label={inv.invoiceStatus as ChipVariant} />
          </Box>
        ))}
      </Box>

      {/* ── Overdue callout ───────────────────────────────────────── */}
      <Box
        sx={{
          mt: `${space.xl}px`,
          border: `1px solid ${colors.accent}`,
          bgcolor: colors.accentWash,
          p: `${space.xl}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
            Payment blocked - GST mismatch on INV-7824
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>
            {formatINR(d.overdueAmount)} at risk · Vendor: Infosys BPO Services · Due 10 Aug 2024
          </Typography>
        </Box>
        <Button
          onClick={() => navigate('/b2b/payable/exceptions')}
          sx={{
            bgcolor: colors.accent,
            color: colors.paper,
            fontSize: 13,
            fontWeight: 600,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            flexShrink: 0,
            '&:hover': { bgcolor: colors.accentHover },
          }}
        >
          Resolve exception
        </Button>
      </Box>
    </Box>
  );
};

export default APDashboard;
