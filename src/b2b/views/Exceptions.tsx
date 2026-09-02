// B2B Exceptions — full exception centre with 5 sub-tabs:
// Invoices · Credit/Debit Notes · Payments · TDS · Others
// Entity framing: Kapiva (Adret/Zoho) is OUR side, New Welcome is counterparty.
// Design: monochrome + one accent (#7A5DBF), square corners, hairline borders.
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ColumnLabel, SectionTitle } from '../components/primitives';
import { formatRupees } from '../lib/format';
import {
  invoiceExceptions,
  cnDnExceptions,
  paymentExceptions,
  tdsExceptions,
  otherExceptions,
  reconSummary,
  type ExceptionItem,
  type ExceptionStatus,
} from '../mock';

// ── Types ─────────────────────────────────────────────────────────────────────
type SubTab = 'Invoices' | 'Credit / Debit Notes' | 'Payments' | 'TDS' | 'Others';

const SUB_TABS: { key: SubTab; data: ExceptionItem[]; kaptotal: number; nwptotal: number }[] = [
  {
    key: 'Invoices',
    data: invoiceExceptions,
    kaptotal: invoiceExceptions.filter(e => e.side === 'In Kapiva, not in New Welcome').reduce((s, e) => s + Math.abs(e.amount), 0),
    nwptotal: invoiceExceptions.filter(e => e.side === 'In New Welcome, not in Kapiva').reduce((s, e) => s + Math.abs(e.amount), 0),
  },
  {
    key: 'Credit / Debit Notes',
    data: cnDnExceptions,
    kaptotal: cnDnExceptions.filter(e => e.side === 'In Kapiva, not in New Welcome').reduce((s, e) => s + Math.abs(e.amount), 0),
    nwptotal: cnDnExceptions.filter(e => e.side === 'In New Welcome, not in Kapiva').reduce((s, e) => s + Math.abs(e.amount), 0),
  },
  {
    key: 'Payments',
    data: paymentExceptions,
    kaptotal: paymentExceptions.filter(e => e.side === 'In Kapiva, not in New Welcome').reduce((s, e) => s + Math.abs(e.amount), 0),
    nwptotal: paymentExceptions.filter(e => e.side === 'In New Welcome, not in Kapiva').reduce((s, e) => s + Math.abs(e.amount), 0),
  },
  {
    key: 'TDS',
    data: tdsExceptions,
    kaptotal: tdsExceptions.filter(e => e.side === 'In Kapiva, not in New Welcome').reduce((s, e) => s + Math.abs(e.amount), 0),
    nwptotal: tdsExceptions.filter(e => e.side === 'In New Welcome, not in Kapiva').reduce((s, e) => s + Math.abs(e.amount), 0),
  },
  {
    key: 'Others',
    data: otherExceptions,
    kaptotal: otherExceptions.filter(e => e.side === 'In Kapiva, not in New Welcome').reduce((s, e) => s + Math.abs(e.amount), 0),
    nwptotal: otherExceptions.filter(e => e.side === 'In New Welcome, not in Kapiva').reduce((s, e) => s + Math.abs(e.amount), 0),
  },
];

const totalOpen = (
  invoiceExceptions.length +
  cnDnExceptions.length +
  paymentExceptions.length +
  tdsExceptions.length +
  otherExceptions.length
);

// ── Status label ──────────────────────────────────────────────────────────────
const statusMeta: Record<ExceptionStatus, { label: string; weight: 500 | 600 }> = {
  OPEN:          { label: 'OPEN',          weight: 600 },
  RESOLVED:      { label: 'RESOLVED',      weight: 500 },
  DISPUTE_RAISED:{ label: 'DISPUTE RAISED',weight: 600 },
  FOLLOW_UP:     { label: 'FOLLOW UP',     weight: 600 },
};

const StatusChip: React.FC<{ status: ExceptionStatus }> = ({ status }) => {
  const meta = statusMeta[status];
  const isOpen = status === 'OPEN' || status === 'DISPUTE_RAISED' || status === 'FOLLOW_UP';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: isOpen ? colors.paper : colors.grey100,
        color: isOpen ? colors.ink : colors.grey700,
        fontWeight: meta.weight,
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

// ── Action buttons ────────────────────────────────────────────────────────────
const ActionGroup: React.FC<{ item: ExceptionItem; onUpdate: (id: string, s: ExceptionStatus) => void }> = ({ item, onUpdate }) => {
  if (item.status === 'RESOLVED') return <Typography sx={{ fontSize: 12, color: colors.grey500 }}>—</Typography>;
  return (
    <Box sx={{ display: 'flex', gap: `${space.sm}px`, flexWrap: 'wrap' }}>
      <Button
        size="small"
        onClick={() => onUpdate(item.id, 'RESOLVED')}
        sx={{
          borderRadius: 0,
          border: hairline,
          bgcolor: colors.paper,
          color: colors.grey700,
          fontSize: 11,
          fontWeight: 600,
          px: `${space.md}px`,
          py: '2px',
          minWidth: 0,
          '&:hover': { bgcolor: colors.grey100, color: colors.ink },
        }}
      >
        Mark resolved
      </Button>
      <Button
        size="small"
        onClick={() => onUpdate(item.id, 'DISPUTE_RAISED')}
        sx={{
          borderRadius: 0,
          border: hairline,
          bgcolor: colors.paper,
          color: colors.grey700,
          fontSize: 11,
          fontWeight: 600,
          px: `${space.md}px`,
          py: '2px',
          minWidth: 0,
          '&:hover': { bgcolor: colors.grey100, color: colors.ink },
        }}
      >
        Raise dispute
      </Button>
      <Button
        size="small"
        onClick={() => onUpdate(item.id, 'FOLLOW_UP')}
        sx={{
          borderRadius: 0,
          border: hairline,
          bgcolor: colors.paper,
          color: colors.grey700,
          fontSize: 11,
          fontWeight: 600,
          px: `${space.md}px`,
          py: '2px',
          minWidth: 0,
          '&:hover': { bgcolor: colors.grey100, color: colors.ink },
        }}
      >
        Request doc
      </Button>
    </Box>
  );
};

// ── Panel (one side: Kapiva or New Welcome) ───────────────────────────────────
const Panel: React.FC<{
  title: string;
  subtitle: string;
  total: number;
  items: ExceptionItem[];
  statuses: Record<string, ExceptionStatus>;
  onUpdate: (id: string, s: ExceptionStatus) => void;
}> = ({ title, subtitle, total, items, statuses, onUpdate }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    {/* Panel header */}
    <Box sx={{ p: `${space.xl}px`, borderBottom: hairline }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: '2px' }}>
        <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{subtitle}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: items.length > 0 ? colors.ink : colors.grey500, ...tabularNums }}>
          {items.length === 0 ? '—' : formatRupees(total)}
        </Typography>
      </Box>
    </Box>

    {/* Rows */}
    {items.length === 0 ? (
      <Box sx={{ p: `${space.xl}px` }}>
        <Typography sx={{ fontSize: 13, color: colors.grey500 }}>No exceptions in this category.</Typography>
      </Box>
    ) : (
      items.map((item, idx) => {
        const currentStatus = statuses[item.id] ?? item.status;
        const resolved = currentStatus === 'RESOLVED';
        return (
          <Box
            key={item.id}
            sx={{
              p: `${space.xl}px`,
              borderBottom: idx < items.length - 1 ? hairline : 'none',
              opacity: resolved ? 0.5 : 1,
              transition: 'opacity 0.2s',
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: `${space.md}px`, mb: `${space.sm}px` }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: '2px' }}>
                  <Typography sx={{ fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', color: colors.grey700 }}>
                    {item.reference}
                  </Typography>
                  <StatusChip status={currentStatus} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{item.narration}</Typography>
                {item.remark && (
                  <Typography sx={{ fontSize: 12, color: colors.grey700, mt: '1px' }}>{item.remark}</Typography>
                )}
                <Typography sx={{ fontSize: 12, color: colors.grey500, mt: '2px' }}>{item.date}</Typography>
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, flexShrink: 0, ...tabularNums }}>
                {formatRupees(Math.abs(item.amount))}
              </Typography>
            </Box>
            <ActionGroup item={{ ...item, status: currentStatus }} onUpdate={onUpdate} />
          </Box>
        );
      })
    )}
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────
const Exceptions: React.FC = () => {
  const reduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState<SubTab>('Invoices');
  const [statuses, setStatuses] = useState<Record<string, ExceptionStatus>>({});

  const updateStatus = (id: string, s: ExceptionStatus) =>
    setStatuses(prev => ({ ...prev, [id]: s }));

  const current = SUB_TABS.find(t => t.key === activeTab)!;
  const ourItems = current.data.filter(e => e.side === 'In Kapiva, not in New Welcome');
  const nwpItems = current.data.filter(e => e.side === 'In New Welcome, not in Kapiva');

  const openCounts = {
    Invoices: invoiceExceptions.filter(e => (statuses[e.id] ?? e.status) === 'OPEN').length,
    'Credit / Debit Notes': cnDnExceptions.filter(e => (statuses[e.id] ?? e.status) === 'OPEN').length,
    Payments: paymentExceptions.filter(e => (statuses[e.id] ?? e.status) === 'OPEN').length,
    TDS: tdsExceptions.filter(e => (statuses[e.id] ?? e.status) === 'OPEN').length,
    Others: otherExceptions.filter(e => (statuses[e.id] ?? e.status) === 'OPEN').length,
  } as Record<SubTab, number>;

  const totalStillOpen = Object.values(openCounts).reduce((a, b) => a + b, 0);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: `${space.xl}px` }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.lg}px` }}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: colors.ink }}>
            Exception Centre
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              border: hairline,
              px: `${space.md}px`,
              py: '3px',
              fontSize: 12,
              fontWeight: 600,
              color: totalStillOpen > 0 ? colors.ink : colors.grey500,
              bgcolor: totalStillOpen > 0 ? colors.paper : colors.grey100,
            }}
          >
            {totalStillOpen} open of {totalOpen} total
          </Box>
        </Box>
        <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '4px' }}>
          Kapiva (Adret) ↔ New Welcome Pharma · FY 2025–26
        </Typography>
      </Box>

      {/* ── Sub-tab bar ────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', borderBottom: hairline, mb: `${space.xl}px` }}>
        {SUB_TABS.map(tab => {
          const active = activeTab === tab.key;
          const open = openCounts[tab.key];
          return (
            <Box
              key={tab.key}
              role="tab"
              onClick={() => setActiveTab(tab.key)}
              sx={{
                px: `${space.xl}px`,
                py: `${space.md}px`,
                cursor: 'pointer',
                borderBottom: active ? `2px solid ${colors.ink}` : '2px solid transparent',
                color: active ? colors.ink : colors.grey700,
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: `${space.sm}px`,
                '&:hover': active ? undefined : { color: colors.ink, bgcolor: colors.grey100 },
              }}
            >
              {tab.key}
              {open > 0 && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    bgcolor: active ? colors.ink : colors.grey200,
                    color: active ? colors.paper : colors.grey700,
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {open}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ── Summary row ────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: `${space.lg}px`,
          mb: `${space.xl}px`,
        }}
      >
        <Box sx={{ ...cardSx, p: `${space.lg}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Kapiva, not in New Welcome
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>
              {ourItems.length} item{ourItems.length !== 1 ? 's' : ''} — Adret has docs, counterparty missing
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            {ourItems.length > 0 ? formatRupees(current.kaptotal) : '—'}
          </Typography>
        </Box>
        <Box sx={{ ...cardSx, p: `${space.lg}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In New Welcome, not in Kapiva
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>
              {nwpItems.length} item{nwpItems.length !== 1 ? 's' : ''} — Counterparty has docs, Kapiva missing
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.ink, ...tabularNums }}>
            {nwpItems.length > 0 ? formatRupees(current.nwptotal) : '—'}
          </Typography>
        </Box>
      </Box>

      {/* ── Two-panel layout ───────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: `${space.xl}px`,
          alignItems: 'start',
        }}
      >
        {/* Left panel */}
        <Box sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
          <Panel
            title="In Kapiva, not in New Welcome"
            subtitle="Kapiva (Adret) has the document — New Welcome has not acknowledged"
            total={current.kaptotal}
            items={ourItems}
            statuses={statuses}
            onUpdate={updateStatus}
          />
        </Box>

        {/* Right panel */}
        <Box sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
          <Panel
            title="In New Welcome, not in Kapiva"
            subtitle="New Welcome has the document — no matching entry in Kapiva"
            total={current.nwptotal}
            items={nwpItems}
            statuses={statuses}
            onUpdate={updateStatus}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Exceptions;
