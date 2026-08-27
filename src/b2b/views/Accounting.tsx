// Accounting → ERP Sync view.
// Lists all pending B2B channel transactions and provides a one-click
// "Push to ERP" button that simulates syncing them to Tally Prime.
import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { CheckCircleOutline, SyncOutlined, CloudDoneOutlined } from '@mui/icons-material';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx as cardBase, SectionTitle, ChannelTag } from '../components/primitives';
import { formatRupees } from '../lib/format';
import { erpTransactions as initialTransactions, erpSyncSummary } from '../mock';
import type { ERPTransaction, ERPSyncStatus } from '../mock/accountingSync';

const cardSx = { ...cardBase, p: 0 } as const;

type SyncState = 'idle' | 'syncing' | 'done';

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Receivable: { bg: '#F0FDF4', color: '#166534' },
  Settlement: { bg: '#EFF6FF', color: '#1E40AF' },
  Deduction: { bg: '#FEF2F2', color: '#991B1B' },
};

const TypeBadge: React.FC<{ type: string }> = ({ type: txType }) => {
  const c = TYPE_COLORS[txType] ?? { bg: colors.grey100, color: colors.ink };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: `${space.sm}px`,
        py: '3px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        bgcolor: c.bg,
        color: c.color,
        border: `1px solid ${c.color}20`,
      }}
    >
      {txType}
    </Box>
  );
};

const StatusCell: React.FC<{ status: ERPSyncStatus }> = ({ status }) => {
  if (status === 'Synced') {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{ display: 'flex', alignItems: 'center', gap: `${space.xs}px`, color: '#166534' }}
      >
        <CheckCircleOutline sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'inherit' }}>Synced</Typography>
      </Box>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: `${space.sm}px`,
        py: '3px',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        border: hairline,
        color: colors.grey700,
        bgcolor: colors.grey100,
      }}
    >
      Pending
    </Box>
  );
};

const Accounting: React.FC = () => {
  const reduce = useReducedMotion();
  const { platformFilter } = useOutletContext<{ platformFilter: string }>();

  const [transactions, setTransactions] = useState<ERPTransaction[]>(
    () => initialTransactions.map((t) => ({ ...t })),
  );
  const [syncState, setSyncState] = useState<SyncState>('idle');

  const filterKey = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
  const isAll = filterKey === 'all';

  const displayed = isAll
    ? transactions
    : transactions.filter((t) => {
        const channelKey = t.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return channelKey.includes(filterKey) || filterKey.includes(channelKey);
      });

  const pendingTxs = displayed.filter((t) => t.syncStatus === 'Pending');
  const pendingCount = pendingTxs.length;
  const pendingAmount = pendingTxs.reduce((s, t) => s + t.amount, 0);

  const handlePush = useCallback(() => {
    if (syncState !== 'idle' || pendingCount === 0) return;
    setSyncState('syncing');
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) => {
          // Only sync displayed (filtered) pending ones
          const channelKey = t.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
          const inFilter = isAll || channelKey.includes(filterKey) || filterKey.includes(channelKey);
          return inFilter && t.syncStatus === 'Pending'
            ? { ...t, syncStatus: 'Synced' as const }
            : t;
        }),
      );
      setSyncState('done');
    }, 1800);
  }, [syncState, pendingCount, isAll, filterKey]);

  // Reset sync state when filter changes and there are new pending
  React.useEffect(() => {
    const remaining = transactions.filter((t) => {
      const channelKey = t.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
      const inFilter = isAll || channelKey.includes(filterKey) || filterKey.includes(channelKey);
      return inFilter && t.syncStatus === 'Pending';
    });
    if (remaining.length > 0 && syncState === 'done') {
      setSyncState('idle');
    }
  }, [platformFilter]);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* ── HEADER ROW ────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: `${space.xl}px`,
          flexWrap: 'wrap',
          gap: `${space.lg}px`,
        }}
      >
        {/* ERP connection status */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
            <CloudDoneOutlined sx={{ fontSize: 22, color: colors.accent }} />
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink }}>
              {erpSyncSummary.erpName}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: `${space.xs}px`,
                px: `${space.md}px`,
                height: 24,
                border: `1px solid #16653440`,
                bgcolor: '#F0FDF4',
              }}
            >
              <Box sx={{ width: 7, height: 7, bgcolor: '#166534', borderRadius: '50%' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#166534', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Connected
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ ...type.label, color: colors.grey500 }}>
            Last synced: {erpSyncSummary.lastSyncedAt}
          </Typography>
        </Box>

        {/* Push to ERP button */}
        <AnimatePresence mode="wait">
          {syncState === 'done' ? (
            <Button
              key="done"
              component={motion.button}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              disabled
              disableElevation
              startIcon={<CheckCircleOutline />}
              sx={{
                bgcolor: '#F0FDF4',
                color: '#166534',
                border: '1px solid #16653440',
                px: `${space.xl}px`,
                py: `${space.md}px`,
                fontSize: 13,
                fontWeight: 600,
                '&.Mui-disabled': { bgcolor: '#F0FDF4', color: '#166534' },
              }}
            >
              Synced to {erpSyncSummary.erpName}
            </Button>
          ) : (
            <Button
              key="push"
              disableElevation
              disabled={syncState === 'syncing' || pendingCount === 0}
              onClick={handlePush}
              startIcon={
                syncState === 'syncing' ? (
                  <CircularProgress size={16} sx={{ color: colors.paper }} />
                ) : (
                  <SyncOutlined />
                )
              }
              sx={{
                bgcolor: colors.ink,
                color: colors.paper,
                px: `${space.xl}px`,
                py: `${space.md}px`,
                fontSize: 13,
                fontWeight: 600,
                '&:hover': { bgcolor: colors.inkHover },
                '&.Mui-disabled': { bgcolor: colors.grey200, color: colors.grey500 },
              }}
            >
              {syncState === 'syncing'
                ? 'Pushing…'
                : pendingCount === 0
                  ? 'All Synced'
                  : `Push ${pendingCount} Transaction${pendingCount !== 1 ? 's' : ''} to ERP`}
            </Button>
          )}
        </AnimatePresence>
      </Box>

      {/* ── SUMMARY CARDS ─────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...type.label, color: colors.grey700, display: 'block', mb: `${space.sm}px` }}>
            Pending Transactions
          </Typography>
          <Typography sx={{ ...type.statValue, color: colors.ink }}>
            {pendingCount}
          </Typography>
        </Box>
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...type.label, color: colors.grey700, display: 'block', mb: `${space.sm}px` }}>
            Pending Amount
          </Typography>
          <Typography sx={{ ...type.statValue, color: colors.ink, ...tabularNums }}>
            {formatRupees(pendingAmount)}
          </Typography>
        </Box>
        <Box sx={{ ...cardBase, p: `${space.xl}px` }}>
          <Typography sx={{ ...type.label, color: colors.grey700, display: 'block', mb: `${space.sm}px` }}>
            Already Synced
          </Typography>
          <Typography sx={{ ...type.statValue, color: '#166534' }}>
            {displayed.length - pendingCount}
          </Typography>
        </Box>
      </Box>

      {/* ── TRANSACTIONS TABLE ────────────────────────────────── */}
      <Box sx={cardSx}>
        <Box
          sx={{
            px: `${space.xl}px`,
            py: `${space.lg}px`,
            borderBottom: hairline,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SectionTitle>Transactions</SectionTitle>
          <Typography sx={{ ...type.label, color: colors.grey500 }}>
            {displayed.length} entries
          </Typography>
        </Box>

        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.4fr 1fr 0.8fr 1fr 0.7fr',
            px: `${space.xl}px`,
            py: `${space.md}px`,
            borderBottom: hairline,
            bgcolor: colors.grey100,
          }}
        >
          {['Channel', 'Invoice Ref', 'Date', 'Type', 'Amount', 'Status'].map((h) => (
            <Typography key={h} sx={{ ...type.label, color: colors.grey500 }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {displayed.map((tx, idx) => (
          <Box
            key={tx.id}
            component={motion.div}
            layout
            sx={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.4fr 1fr 0.8fr 1fr 0.7fr',
              px: `${space.xl}px`,
              py: `${space.md}px`,
              borderBottom: idx < displayed.length - 1 ? hairline : 'none',
              alignItems: 'center',
              '&:hover': { bgcolor: colors.grey100 },
              transition: 'background-color 0.12s',
            }}
          >
            <ChannelTag name={tx.channel} />
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, fontFamily: 'monospace' }}>
              {tx.invoiceRef}
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{tx.date}</Typography>
            <TypeBadge type={tx.type} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: tx.amount < 0 ? '#991B1B' : colors.ink,
                ...tabularNums,
              }}
            >
              {tx.amount < 0 ? `−${formatRupees(Math.abs(tx.amount)).slice(1)}` : formatRupees(tx.amount)}
            </Typography>
            <StatusCell status={tx.syncStatus} />
          </Box>
        ))}

        {/* Footer summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.4fr 1fr 0.8fr 1fr 0.7fr',
            px: `${space.xl}px`,
            py: `${space.lg}px`,
            borderTop: `2px solid ${colors.grey200}`,
            bgcolor: colors.grey100,
          }}
        >
          <Typography sx={{ ...type.label, color: colors.ink, fontWeight: 600 }}>
            Total ({displayed.length})
          </Typography>
          <Box />
          <Box />
          <Box />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.ink, ...tabularNums }}>
            {formatRupees(displayed.reduce((s, t) => s + t.amount, 0))}
          </Typography>
          <Box />
        </Box>
      </Box>
    </Box>
  );
};

export default Accounting;
