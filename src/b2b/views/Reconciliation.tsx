import React from 'react';
import { useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import { Box, Typography, TextField, InputAdornment, Tooltip } from '@mui/material';
import { SearchOutlined, InfoOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, Pressable, StatTile } from '../components/primitives';
import { formatRupees, formatINRShort } from '../lib/format';
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

type Filter = 'all' | 'po_raised' | 'invoices_raised';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'po_raised', label: 'PO Raised' },
  { key: 'invoices_raised', label: 'Invoices Raised' },
];

const MOCK_POS = [
  { id: 'PO-2026-08-001', vendor: 'Blinkit', date: 'Aug 1, 2026', amount: 450000, status: 'Sent to Vendor' },
  { id: 'PO-2026-08-002', vendor: 'Zepto', date: 'Aug 5, 2026', amount: 320000, status: 'Approved' },
  { id: 'PO-2026-08-003', vendor: 'Instamart', date: 'Aug 12, 2026', amount: 125000, status: 'Sent to Vendor' },
  { id: 'PO-2026-08-004', vendor: 'Reliance', date: 'Aug 15, 2026', amount: 550000, status: 'Approved' },
  { id: 'PO-2026-08-005', vendor: 'Cafe', date: 'Aug 18, 2026', amount: 80000, status: 'Sent to Vendor' },
];

const MOCK_INVOICES = [
  { id: 'INV-2026-08-101', client: 'Blinkit', date: 'Aug 2, 2026', amount: 450000, status: 'Payment Pending', poRef: 'PO-2026-08-001' },
  { id: 'INV-2026-08-102', client: 'Zepto', date: 'Aug 6, 2026', amount: 320000, status: 'Payment Pending', poRef: 'PO-2026-08-002' },
  { id: 'INV-2026-08-103', client: 'Instamart', date: 'Aug 13, 2026', amount: 125000, status: 'Payment Pending', poRef: 'PO-2026-08-003' },
  { id: 'INV-2026-08-104', client: 'Reliance', date: 'Aug 16, 2026', amount: 550000, status: 'Payment Pending', poRef: 'PO-2026-08-004' },
  { id: 'INV-2026-08-105', client: 'Cafe', date: 'Aug 19, 2026', amount: 80000, status: 'Payment Pending', poRef: 'PO-2026-08-005' },
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
    const matchFilter = filter === 'all';
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

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: `${space.lg}px`, mb: `${space.xl}px` }}>
        <StatTile label="Expected Payout" value={formatINRShort(totalExpected)} />
        <StatTile label="Actual Payout" value={formatINRShort(totalActual)} />
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
      {activeTab === 'settlements' && filter === 'all' && (
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 880 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '120px 140px 110px 140px 140px 100px 1fr', alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, py: `${space.md}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
              <ColumnLabel>Settlement</ColumnLabel>
              <ColumnLabel>Period</ColumnLabel>
              <ColumnLabel align="right">Amount received</ColumnLabel>
              <ColumnLabel align="right">Expected deductions</ColumnLabel>
              <ColumnLabel align="right">Actual deductions</ColumnLabel>
              <ColumnLabel align="right">Difference</ColumnLabel>
              <ColumnLabel align="right">Status</ColumnLabel>
            </Box>
            {settlements.map((s, idx) => {
              const actualDeds = s.components?.filter(c => c.type === 'deduction').reduce((acc, c) => acc + Math.abs(c.amount), 0) || 0;
              const expectedDeds = actualDeds > 0 ? actualDeds - (s.difference > 0 ? s.difference : 0) : 0;
              return (
                <Pressable
                  key={s.id}
                  onClick={() => pushView({ type: 'settlement', data: s })}
                  sx={{
                    display: 'grid', gridTemplateColumns: '120px 140px 110px 140px 140px 100px 1fr',
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
                  <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatINRShort(s.actual)}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatINRShort(expectedDeds)}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatINRShort(actualDeds)}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: s.difference > 0 ? 600 : 400, color: s.difference > 0 ? '#991B1B' : colors.ink, textAlign: 'right', ...tabularNums }}>
                    {s.difference === 0 ? '₹0' : formatRupees(s.difference)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusBadge status={s.status === 'Matched' ? 'Received correctly' : s.status} />
                  </Box>
                </Pressable>
              );
            })}
            {settlements.length === 0 && (
              <Box sx={{ p: `${space.xl}px` }}>
                <Typography sx={{ fontSize: 14, color: colors.grey500 }}>No settlements in this view.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {activeTab === 'settlements' && filter === 'po_raised' && (
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 600 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '150px 150px 120px 1fr 120px', alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, py: `${space.md}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
              <ColumnLabel>PO Number</ColumnLabel>
              <ColumnLabel>Vendor</ColumnLabel>
              <ColumnLabel>Date</ColumnLabel>
              <ColumnLabel align="right">Amount</ColumnLabel>
              <ColumnLabel align="right">Status</ColumnLabel>
            </Box>
            {MOCK_POS.map((po, idx) => (
              <Box
                key={po.id}
                sx={{
                  display: 'grid', gridTemplateColumns: '150px 150px 120px 1fr 120px',
                  alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, height: 56,
                  borderBottom: idx < MOCK_POS.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{po.id}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{po.vendor}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{po.date}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(po.amount)}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <StatusBadge status={po.status} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 'settlements' && filter === 'invoices_raised' && (
        <Box sx={{ ...cardSx, overflowX: 'auto' }}>
          <Box sx={{ minWidth: 700 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 120px 1fr 120px', alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, py: `${space.md}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
              <ColumnLabel>Invoice Number</ColumnLabel>
              <ColumnLabel>PO Reference</ColumnLabel>
              <ColumnLabel>Client</ColumnLabel>
              <ColumnLabel>Date</ColumnLabel>
              <ColumnLabel align="right">Amount</ColumnLabel>
              <ColumnLabel align="right">Status</ColumnLabel>
            </Box>
            {MOCK_INVOICES.map((inv, idx) => (
              <Box
                key={inv.id}
                sx={{
                  display: 'grid', gridTemplateColumns: '150px 150px 150px 120px 1fr 120px',
                  alignItems: 'center', gap: `${space.lg}px`, px: `${space.xl}px`, height: 56,
                  borderBottom: idx < MOCK_INVOICES.length - 1 ? hairline : 'none',
                  '&:hover': { bgcolor: colors.grey100 },
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{inv.id}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey500 }}>{inv.poRef}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{inv.client}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{inv.date}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.ink, textAlign: 'right', ...tabularNums }}>{formatRupees(inv.amount)}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <StatusBadge status={inv.status} />
                </Box>
              </Box>
            ))}
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
