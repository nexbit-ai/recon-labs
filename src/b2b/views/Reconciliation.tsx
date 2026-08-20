import React from 'react';
import { useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import { Box, Typography, TextField, InputAdornment, Tooltip } from '@mui/material';
import { SearchOutlined, InfoOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, Pressable, StatTile } from '../components/primitives';
import { formatRupees, formatCompactINR } from '../lib/format';
import { StatusBadge } from '../components/StatusBadge';
import { SettlementDrawer, type DrawerView } from '../components/SettlementDrawer';
import {
  allSettlements, blinkitInvoices, blinkitExceptions,
} from '../mock';

type TabKey = 'settlements' | 'transactions' | 'exceptions';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'settlements', label: 'Settlements' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'exceptions', label: 'Exceptions' },
];

type Filter = 'all' | 'matched' | 'needs_review' | 'unreconciled';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'needs_review', label: 'Needs Review' },
  { key: 'unreconciled', label: 'Unreconciled' },
];

const Reconciliation: React.FC = () => {
  const reduce = useReducedMotion();
  const [searchParams] = useSearchParams();
  const context = useOutletContext<{ platformFilter: string }>() || { platformFilter: 'all' };
  const platformFilter = searchParams.get('channel') || context.platformFilter;

  const [activeTab, setActiveTab] = React.useState<TabKey>('settlements');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [search, setSearch] = React.useState('');
  const [drawerStack, setDrawerStack] = React.useState<DrawerView[]>([]);

  const drawerOpen = drawerStack.length > 0;

  const pushView = (v: DrawerView) => setDrawerStack(prev => [...prev, v]);
  const popView = () => setDrawerStack(prev => prev.slice(0, -1));
  const closeDrawer = () => setDrawerStack([]);

  const settlements = allSettlements.filter(s => {
    const raw = s.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
    const fRaw = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
    const matchPlatform = platformFilter === 'all' || raw.includes(fRaw) || fRaw.includes(raw);
    const matchFilter = filter === 'all' ? true
      : filter === 'matched' ? s.status === 'Matched'
      : filter === 'needs_review' ? (s.status === 'Exception' || s.status === 'Needs Review')
      : s.status === 'Unreconciled';
    const matchSearch = search === '' || s.id.toLowerCase().includes(search.toLowerCase()) || s.period.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchFilter && matchSearch;
  });

  const transactions = blinkitInvoices.filter(inv => {
    if (platformFilter !== 'all' && platformFilter.toLowerCase() !== 'blinkit') return false;
    if (search === '') return true;
    return inv.invoiceId.toLowerCase().includes(search.toLowerCase())
      || inv.orders.some(o => o.orderId.toLowerCase().includes(search.toLowerCase()));
  });

  const exceptions = blinkitExceptions.filter(exc => {
    if (platformFilter !== 'all' && platformFilter.toLowerCase() !== 'blinkit') return false;
    if (search === '') return true;
    return exc.title.toLowerCase().includes(search.toLowerCase())
      || exc.source.toLowerCase().includes(search.toLowerCase());
  });

  const summarySettlements = allSettlements.filter(s => {
    const raw = s.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
    const fRaw = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
    return platformFilter === 'all' || raw.includes(fRaw) || fRaw.includes(raw);
  });
  const totalExpected = summarySettlements.reduce((s, t) => s + t.expected, 0);
  const totalActual = summarySettlements.reduce((s, t) => s + t.actual, 0);
  const totalDifference = totalExpected - totalActual;
  const matchedCount = summarySettlements.filter(s => s.status === 'Matched').length;
  const exceptionCount = exceptions.length;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.xl}px` }}>
        <Box>
          <Typography sx={{ ...type.label, color: colors.grey500, mb: '4px' }}>
            {platformFilter === 'all' ? 'All Channels' : platformFilter.charAt(0).toUpperCase() + platformFilter.slice(1)} · August 2026
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: `${space.lg}px`, mb: `${space.xl}px` }}>
        <StatTile label="Expected Payout" value={formatCompactINR(totalExpected)} />
        <StatTile label="Actual Payout" value={formatCompactINR(totalActual)} />
        <StatTile label="Matched" value={`${matchedCount} / ${summarySettlements.length}`} />
        <StatTile label="Exceptions" value={String(exceptionCount)} sx={exceptionCount > 0 ? { borderColor: '#EF4444' } : undefined} />
        <StatTile label="Unreconciled" value={totalDifference === 0 ? '₹0' : formatRupees(totalDifference)} sx={totalDifference > 0 ? { borderColor: '#EF4444' } : undefined} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${space.lg}px`, mb: `${space.lg}px`, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: `${space.lg}px`, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'inline-flex', border: hairline }}>
            {TABS.map((t, i) => {
              const active = activeTab === t.key;
              return (
                <Pressable
                  key={t.key}
                  role="tab"
                  selected={active}
                  onClick={() => setActiveTab(t.key)}
                  sx={{
                    px: `${space.lg}px`, height: 34, display: 'flex', alignItems: 'center',
                    cursor: active ? 'default' : 'pointer',
                    borderLeft: i === 0 ? 'none' : hairline,
                    bgcolor: active ? colors.ink : 'transparent',
                    color: active ? colors.paper : colors.grey700,
                    fontSize: 13, fontWeight: 600,
                    '&:hover': active ? undefined : { bgcolor: colors.grey100, color: colors.ink },
                  }}
                >
                  {t.label}
                </Pressable>
              );
            })}
          </Box>
          {activeTab === 'settlements' && (
            <Box sx={{ display: 'inline-flex', border: hairline }}>
              {FILTERS.map((f, i) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    role="tab"
                    selected={active}
                    onClick={() => setFilter(f.key)}
                    sx={{
                      px: `${space.md}px`, height: 34, display: 'flex', alignItems: 'center',
                      cursor: active ? 'default' : 'pointer',
                      borderLeft: i === 0 ? 'none' : hairline,
                      bgcolor: active ? colors.accent : 'transparent',
                      color: active ? colors.paper : colors.grey700,
                      fontSize: 12, fontWeight: 600,
                      '&:hover': active ? undefined : { bgcolor: colors.grey100, color: colors.ink },
                    }}
                  >
                    {f.label}
                  </Pressable>
                );
              })}
            </Box>
          )}
        </Box>
        <TextField
          size="small"
          placeholder="Search settlement, invoice, order…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: colors.grey500 }} /></InputAdornment>,
          }}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': { borderRadius: 0, height: 34, fontSize: 13, '& fieldset': { border: hairline }, '&:hover fieldset': { borderColor: colors.ink }, '&.Mui-focused fieldset': { borderColor: colors.ink, borderWidth: '1px' } },
          }}
        />
      </Box>

      {/* ── SETTLEMENTS TAB ── */}
      {activeTab === 'settlements' && (
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 880 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '120px 140px 80px 110px 110px 100px 100px', alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, py: `${space.md}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
              <ColumnLabel>Settlement</ColumnLabel>
              <ColumnLabel>Period</ColumnLabel>
              <ColumnLabel align="right">Invoices</ColumnLabel>
              <ColumnLabel align="right">Expected</ColumnLabel>
              <ColumnLabel align="right">Actual</ColumnLabel>
              <ColumnLabel align="right">Difference</ColumnLabel>
              <ColumnLabel align="right">Status</ColumnLabel>
            </Box>
            {settlements.map((s, idx) => (
              <Pressable
                key={s.id}
                onClick={() => pushView({ type: 'settlement', data: s })}
                sx={{
                  display: 'grid', gridTemplateColumns: '120px 140px 80px 110px 110px 100px 100px',
                  alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, height: 56,
                  borderBottom: idx < settlements.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{s.id}</Typography>
                  <ChannelTag name={s.channel} />
                </Box>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{s.period}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{s.invoiceCount}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatCompactINR(s.expected)}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatCompactINR(s.actual)}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: s.difference > 0 ? 600 : 400, color: s.difference > 0 ? '#991B1B' : colors.ink, textAlign: 'right', ...tabularNums }}>
                  {s.difference === 0 ? '₹0' : formatRupees(s.difference)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <StatusBadge status={s.status} />
                </Box>
              </Pressable>
            ))}
            {settlements.length === 0 && (
              <Box sx={{ p: `${space.xl}px` }}>
                <Typography sx={{ fontSize: 14, color: colors.grey500 }}>No settlements in this view.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {activeTab === 'transactions' && (
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 960 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 80px 90px 90px 90px 120px 90px', alignItems: 'center', gap: `${space.sm}px`, px: `${space.xl}px`, py: `${space.md}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
              <ColumnLabel>Invoice</ColumnLabel>
              <ColumnLabel>Order</ColumnLabel>
              <ColumnLabel>Item</ColumnLabel>
              <ColumnLabel align="right">Amount</ColumnLabel>
              <ColumnLabel align="right">Deductions</ColumnLabel>
              <ColumnLabel align="right">Net</ColumnLabel>
              <ColumnLabel>Settlement</ColumnLabel>
              <ColumnLabel align="right">Status</ColumnLabel>
            </Box>
            {transactions.map((inv, idx) => {
              const order = inv.orders[0];
              const item = order?.items[0];
              const totalDed = inv.deductions.reduce((s, d) => s + d.amount, 0);
              return (
                <Pressable
                  key={inv.invoiceId}
                  onClick={() => pushView({ type: 'invoice', data: inv })}
                  sx={{
                    display: 'grid', gridTemplateColumns: '1.4fr 1fr 80px 90px 90px 90px 120px 90px',
                    alignItems: 'center', gap: `${space.sm}px`, px: `${space.xl}px`, py: `${space.md}px`,
                    borderBottom: idx < transactions.length - 1 ? hairline : 'none',
                    '&:hover': { bgcolor: colors.grey100 },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.invoiceId}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order?.orderId ?? '—'}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey500 }}>{item?.itemId ?? '—'}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(inv.amount)}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, textAlign: 'right', ...tabularNums }}>{formatRupees(totalDed)}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(inv.netPayout)}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{inv.settlementId}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><StatusBadge status={inv.status} /></Box>
                </Pressable>
              );
            })}
            {transactions.length === 0 && (
              <Box sx={{ p: `${space.xl}px` }}>
                <Typography sx={{ fontSize: 14, color: colors.grey500 }}>No transactions in this view.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ── EXCEPTIONS TAB ── */}
      {activeTab === 'exceptions' && (
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 780 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 100px 1fr 100px 1.5fr', alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, py: `${space.md}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
              <ColumnLabel>Exception</ColumnLabel>
              <ColumnLabel align="right">Amount</ColumnLabel>
              <ColumnLabel>Source</ColumnLabel>
              <ColumnLabel>Status</ColumnLabel>
              <ColumnLabel>Suggested Action</ColumnLabel>
            </Box>
            {exceptions.map((exc, idx) => (
              <Pressable
                key={exc.id}
                onClick={() => pushView({ type: 'exception', data: exc })}
                sx={{
                  display: 'grid', gridTemplateColumns: '2fr 100px 1fr 100px 1.5fr',
                  alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, py: `${space.md}px`,
                  borderBottom: idx < exceptions.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: '#FEF2F2' },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{exc.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>{exc.type}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#991B1B', textAlign: 'right', ...tabularNums }}>{formatRupees(exc.amount)}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{exc.source}</Typography>
                <StatusBadge status={exc.status} />
                <Typography sx={{ fontSize: 12, color: colors.grey700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exc.suggestedAction}</Typography>
              </Pressable>
            ))}
            {exceptions.length === 0 && (
              <Box sx={{ p: `${space.xl}px` }}>
                <Typography sx={{ fontSize: 14, color: colors.grey500 }}>No exceptions. All settlements reconciled.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ── RIGHT-SIDE DRAWER ── */}
      <SettlementDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        stack={drawerStack}
        popView={popView}
        pushView={pushView}
      />
    </Box>
  );
};

export default Reconciliation;
