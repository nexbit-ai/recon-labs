// B2B Overview — the settlement command screen. Every figure is read from the
// mock barrel (src/b2b/mock); nothing is hardcoded here. Monochrome + one accent
// (#7A5DBF), square corners, hairline borders, tabular figures. Channels and
// issue types are NEVER colour-coded — they are uppercase labels / hairline
// chips. Accent appears only on: Recovered YTD, "File dispute" links, and the
// single most-urgent deadline.
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
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
import { cardSx as cardBase, ChannelTag, SectionTitle, PageTitle, Pressable } from '../components/primitives';
import { formatRupees, formatCompactINR, formatINRShort, formatPercent } from '../lib/format';
import {
  headlineByKey,
  channelReceived,
  totalReceived,
  pctReceivedOverall,
  flaggedIssues,
  flaggedIssuesTotal,
  netRealisationAssumptionPct,
  marketingSpends,
} from '../mock';

const DISPUTES_ROUTE = '/b2b/disputes';

// Padded card (shared surface + section padding) and the caption helper.
const cardSx = { ...cardBase, p: `${space.xl}px` } as const;
const labelSx = { ...type.label, color: colors.grey700 } as const;

const Caption: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey700, ...sx }}>{children}</Typography>
);

// Square hairline-bordered label for issue type — grey/ink, never a colour badge.
const TypeChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      border: hairline,
      color: colors.grey700,
      px: `${space.sm}px`,
      py: '2px',
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}
  >
    {children}
  </Box>
);

const FileDisputeLink: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Pressable
    ariaLabel="File dispute"
    onClick={onClick}
    sx={{
      mt: `${space.sm}px`,
      display: 'inline-block',
      fontSize: 13,
      fontWeight: 500,
      color: colors.accent,
      '&:hover': { color: colors.accentHover },
    }}
  >
    View reconciliation →
  </Pressable>
);

// ── Historical 6-Month Data for Graphs ──
// Values in Crores for plotting
const historicalDataMap: Record<string, any[]> = {
  all: [
    { name: 'Jan', PO: 3.8, GRN: 3.6, Settlement: 3.4 },
    { name: 'Feb', PO: 4.2, GRN: 3.9, Settlement: 3.6 },
    { name: 'Mar', PO: 3.9, GRN: 3.7, Settlement: 3.5 },
    { name: 'Apr', PO: 4.6, GRN: 4.3, Settlement: 4.0 },
    { name: 'May', PO: 4.1, GRN: 3.8, Settlement: 3.6 },
    { name: 'Jun', PO: 4.5, GRN: 4.1, Settlement: 3.8 },
  ],
  blinkit: [
    { name: 'Jan', PO: 1.0, GRN: 0.9, Settlement: 0.8 },
    { name: 'Feb', PO: 1.1, GRN: 1.0, Settlement: 0.9 },
    { name: 'Mar', PO: 1.05, GRN: 0.95, Settlement: 0.85 },
    { name: 'Apr', PO: 1.25, GRN: 1.15, Settlement: 1.0 },
    { name: 'May', PO: 1.15, GRN: 1.05, Settlement: 0.9 },
    { name: 'Jun', PO: 1.2, GRN: 1.1, Settlement: 0.95 },
  ],
  zepto: [
    { name: 'Jan', PO: 0.8, GRN: 0.7, Settlement: 0.6 },
    { name: 'Feb', PO: 0.9, GRN: 0.8, Settlement: 0.7 },
    { name: 'Mar', PO: 0.85, GRN: 0.75, Settlement: 0.65 },
    { name: 'Apr', PO: 1.15, GRN: 1.05, Settlement: 0.9 },
    { name: 'May', PO: 1.0, GRN: 0.9, Settlement: 0.8 },
    { name: 'Jun', PO: 1.1, GRN: 1.0, Settlement: 0.85 },
  ],
  entitya: [
    { name: 'Jan', PO: 1.3, GRN: 1.2, Settlement: 1.1 },
    { name: 'Feb', PO: 1.4, GRN: 1.3, Settlement: 1.2 },
    { name: 'Mar', PO: 1.35, GRN: 1.25, Settlement: 1.15 },
    { name: 'Apr', PO: 1.55, GRN: 1.45, Settlement: 1.35 },
    { name: 'May', PO: 1.45, GRN: 1.35, Settlement: 1.25 },
    { name: 'Jun', PO: 1.5, GRN: 1.4, Settlement: 1.3 },
  ],
  entityb: [
    { name: 'Jan', PO: 0.6, GRN: 0.5, Settlement: 0.5 },
    { name: 'Feb', PO: 0.65, GRN: 0.55, Settlement: 0.55 },
    { name: 'Mar', PO: 0.6, GRN: 0.55, Settlement: 0.5 },
    { name: 'Apr', PO: 0.75, GRN: 0.65, Settlement: 0.65 },
    { name: 'May', PO: 0.65, GRN: 0.6, Settlement: 0.6 },
    { name: 'Jun', PO: 0.7, GRN: 0.6, Settlement: 0.7 },
  ]
};

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const { platformFilter } = useOutletContext<{ platformFilter: string }>();
  const historicalData = historicalDataMap[platformFilter] || historicalDataMap.all;

  // ── Apply platform filter to existing mock data ──
  const filterKey = platformFilter.toLowerCase().replace(/\s+/g, '');
  const isAll = filterKey === 'all';

  const filteredIssues = isAll
    ? [...flaggedIssues]
    : flaggedIssues.filter(i => i.channel.toLowerCase().replace(/\s+/g, '') === filterKey);

  const issues = filteredIssues.sort((a, b) => b.amount - a.amount);

  const filteredChannelReceived = isAll
    ? channelReceived
    : channelReceived.filter((c) => c.channel.toLowerCase().replace(/\s+/g, '') === filterKey);

  const mSpend = marketingSpends[filterKey] || { performanceAds: 0, tradePromos: 0, roas: 0 };
  const totalSpend = mSpend.performanceAds + mSpend.tradePromos;
  const adsPct = totalSpend > 0 ? Math.round((mSpend.performanceAds / totalSpend) * 100) : 0;
  const promoPct = totalSpend > 0 ? 100 - adsPct : 0;

  // Scale hero metrics down if a specific platform is selected
  const scale = isAll ? 1 :
    platformFilter === 'blinkit' ? 0.35 :
      platformFilter === 'zepto' ? 0.30 : 0.15;

  const rawReceivable = headlineByKey('receivable').value * scale;
  const rawRecoverable = headlineByKey('recoverable').value * scale;
  const rawShortfall = headlineByKey('leakage').value * scale;
  const netRealisation = headlineByKey('netRealisation');
  const netGap = (netRealisationAssumptionPct - netRealisation.value).toFixed(1);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >

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
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Gross Revenue</Typography>
          <CountUpMetric value={rawReceivable} format={formatINRShort} />
        </Box>

        {/* 2. Total Received */}
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Received</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(totalReceived * scale)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            {formatPercent(pctReceivedOverall)} of gross revenue
          </Caption>
        </Box>

        {/* 3. Total Due (Pending) */}
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Due</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.accent, ...tabularNums }}>
            {formatINRShort(rawReceivable - (totalReceived * scale))}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Pending collection
          </Caption>
          <Button
            disableElevation
            onClick={() => navigate(DISPUTES_ROUTE)}
            sx={{
              mt: `${space.lg}px`,
              borderRadius: 0,
              bgcolor: colors.ink,
              color: colors.paper,
              fontSize: 13,
              fontWeight: 600,
              px: `${space.lg}px`,
              py: `${space.md}px`,
              '&:hover': { bgcolor: colors.inkHover },
            }}
          >
            Review what's pending →
          </Button>
        </Box>

        {/* 4. Difference */}
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Difference</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(rawShortfall)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Leakage / Deductions
          </Caption>
        </Box>
      </Box>

      {/* ── FINANCIAL TREND GRAPH ────────────────────────────── */}
      <Box sx={{ ...cardSx, mb: `${space.xl}px` }}>
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

      {/* ── MAIN ROW ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: `${space.xl}px`,
          alignItems: 'start',
        }}
      >
        {/* LEFT — Open Receivables */}
        <Box sx={{ ...cardSx, p: 0 }}>
          <Box
            sx={{
              p: `${space.xl}px`,
              borderBottom: hairline,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: `${space.md}px`,
            }}
          >
            <SectionTitle>Open Receivables</SectionTitle>
            <Caption sx={{ ...type.label, color: colors.grey500, ...tabularNums }}>
              {issues.length} of {isAll ? flaggedIssuesTotal : issues.length} open receivables
            </Caption>
          </Box>

          {issues.map((issue, i) => (
            <Box
              key={issue.id}
              sx={{
                display: 'flex',
                gap: `${space.lg}px`,
                p: `${space.xl}px`,
                borderBottom: i < issues.length - 1 ? hairline : 'none',
                transition: 'background-color 0.12s ease',
                '&:hover': { bgcolor: colors.grey100 },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.sm}px` }}>
                  <ChannelTag name={issue.channel} />
                  <TypeChip>{issue.type}</TypeChip>
                </Box>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>
                  {issue.title}
                </Typography>
                <Caption sx={{ mt: '2px' }}>{issue.detail}</Caption>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {formatRupees(issue.amount)}
                </Typography>
                <FileDisputeLink onClick={() => navigate(DISPUTES_ROUTE)} />
              </Box>
            </Box>
          ))}
          {issues.length === 0 && (
            <Box sx={{ p: `${space.xl}px` }}>
              <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>No open exceptions for this platform.</Typography>
            </Box>
          )}
        </Box>

        {/* RIGHT — stacked */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
          <Box sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.lg}px` }}>
              <SectionTitle>Received by portal</SectionTitle>
              <Caption sx={{ ...type.label, color: colors.grey500, ...tabularNums }}>
                {formatPercent(pctReceivedOverall)} received
              </Caption>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.lg}px` }}>
              {filteredChannelReceived.map((c) => (
                <Box key={c.channel}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.xs}px` }}>
                    <ChannelTag name={c.channel} />
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.sm}px` }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                        {formatCompactINR(c.received)}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: colors.grey500, ...tabularNums }}>
                        {formatPercent(c.pctReceived)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: colors.grey100 }}>
                    <Box sx={{ height: '100%', width: `${c.pctReceived}%`, bgcolor: colors.ink }} />
                  </Box>
                </Box>
              ))}
              {filteredChannelReceived.length === 0 && (
                <Typography sx={{ fontSize: 13, color: colors.grey500 }}>No receive data for this platform.</Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
            <SectionTitle>Trade & Ad Spends (Deducted)</SectionTitle>
            <Box sx={{ mt: `${space.lg}px`, flex: 1, display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.sm}px` }}>
                <Typography sx={{ fontSize: 24, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {formatINRShort(totalSpend)}
                </Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey500 }}>total deductions</Typography>
              </Box>

              <Box sx={{ mt: `${space.sm}px`, display: 'flex', flexDirection: 'column', gap: `${space.sm}px` }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
                    <Typography sx={{ fontSize: 13, color: colors.ink }}>Performance Ads</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                      {formatINRShort(mSpend.performanceAds)}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: colors.grey100 }}>
                    <Box sx={{ height: '100%', width: `${adsPct}%`, bgcolor: colors.ink }} />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
                    <Typography sx={{ fontSize: 13, color: colors.ink }}>Trade Promos</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                      {formatINRShort(mSpend.tradePromos)}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: colors.grey100 }}>
                    <Box sx={{ height: '100%', width: `${promoPct}%`, bgcolor: colors.accent }} />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: `${space.xl}px`, borderTop: hairline, pt: `${space.md}px`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Estimated ROAS</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                {mSpend.roas}x
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
