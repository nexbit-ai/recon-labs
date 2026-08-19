// B2B Overview - Cosmix receivables command screen.
// ₹1 Crore expected, ₹90L received, ₹10L gap. Channel-wise split, upcoming
// payouts, open receivables, and ERP integration status.
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
import { cardSx as cardBase, ChannelTag, SectionTitle, Pressable } from '../components/primitives';
import { formatRupees, formatINRShort, formatPercent } from '../lib/format';
import {
  headlineByKey,
  channelReceived,
  totalReceived,
  pctReceivedOverall,
  flaggedIssues,
  flaggedIssuesTotal,
  upcomingPayouts,
} from '../mock';

const DISPUTES_ROUTE = '/b2b/disputes';
const RECON_ROUTE = '/b2b/reconciliation';

const cardSx = { ...cardBase, p: `${space.xl}px` } as const;
const labelSx = { ...type.label, color: colors.grey700 } as const;

const Caption: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey700, ...sx }}>{children}</Typography>
);

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
    ariaLabel="View reconciliation"
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
const historicalDataMap: Record<string, any[]> = {
  all: [
    { name: 'Mar', PO: 3.2, GRN: 3.0, Settlement: 2.8 },
    { name: 'Apr', PO: 3.6, GRN: 3.4, Settlement: 3.1 },
    { name: 'May', PO: 3.4, GRN: 3.2, Settlement: 3.0 },
    { name: 'Jun', PO: 3.9, GRN: 3.6, Settlement: 3.3 },
    { name: 'Jul', PO: 3.7, GRN: 3.4, Settlement: 3.2 },
    { name: 'Aug', PO: 4.1, GRN: 3.8, Settlement: 3.5 },
  ],
  blinkit: [
    { name: 'Mar', PO: 1.1, GRN: 1.0, Settlement: 0.9 },
    { name: 'Apr', PO: 1.2, GRN: 1.1, Settlement: 1.0 },
    { name: 'May', PO: 1.15, GRN: 1.05, Settlement: 0.95 },
    { name: 'Jun', PO: 1.3, GRN: 1.2, Settlement: 1.1 },
    { name: 'Jul', PO: 1.25, GRN: 1.15, Settlement: 1.05 },
    { name: 'Aug', PO: 1.4, GRN: 1.3, Settlement: 1.2 },
  ],
  zepto: [
    { name: 'Mar', PO: 0.9, GRN: 0.85, Settlement: 0.78 },
    { name: 'Apr', PO: 1.0, GRN: 0.95, Settlement: 0.87 },
    { name: 'May', PO: 0.95, GRN: 0.9, Settlement: 0.82 },
    { name: 'Jun', PO: 1.1, GRN: 1.05, Settlement: 0.95 },
    { name: 'Jul', PO: 1.05, GRN: 1.0, Settlement: 0.9 },
    { name: 'Aug', PO: 1.2, GRN: 1.1, Settlement: 1.0 },
  ],
  reliance: [
    { name: 'Mar', PO: 0.7, GRN: 0.65, Settlement: 0.6 },
    { name: 'Apr', PO: 0.75, GRN: 0.7, Settlement: 0.65 },
    { name: 'May', PO: 0.72, GRN: 0.68, Settlement: 0.63 },
    { name: 'Jun', PO: 0.85, GRN: 0.8, Settlement: 0.72 },
    { name: 'Jul', PO: 0.8, GRN: 0.75, Settlement: 0.7 },
    { name: 'Aug', PO: 0.9, GRN: 0.82, Settlement: 0.75 },
  ],
  'cafes–bangalore': [
    { name: 'Mar', PO: 0.5, GRN: 0.48, Settlement: 0.45 },
    { name: 'Apr', PO: 0.55, GRN: 0.52, Settlement: 0.48 },
    { name: 'May', PO: 0.52, GRN: 0.5, Settlement: 0.46 },
    { name: 'Jun', PO: 0.6, GRN: 0.56, Settlement: 0.52 },
    { name: 'Jul', PO: 0.58, GRN: 0.54, Settlement: 0.5 },
    { name: 'Aug', PO: 0.65, GRN: 0.6, Settlement: 0.55 },
  ],
};

const TypewriterGreeting: React.FC = () => {
  const [displayedText, setDisplayedText] = React.useState('');
  
  const [fullText] = React.useState(() => {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17) timeOfDay = 'evening';
    return `Hello Shivam, good ${timeOfDay}!`;
  });

  React.useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <Typography sx={{ ...type.pageTitle, color: colors.ink, mb: `${space.xl}px`, display: 'flex', alignItems: 'center' }}>
      {displayedText}
    </Typography>
  );
};

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { platformFilter } = useOutletContext<{ platformFilter: string }>();

  const filterKey = platformFilter.toLowerCase().replace(/\s+/g, '').replace('–', '');
  const isAll = filterKey === 'all';

  // Look up historical data with fallback
  const historicalData = historicalDataMap[filterKey] || historicalDataMap[platformFilter] || historicalDataMap.all;

  const filteredIssues = isAll
    ? [...flaggedIssues]
    : flaggedIssues.filter(i => {
        const channelKey = i.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return channelKey.includes(filterKey) || filterKey.includes(channelKey);
      });
  const issues = filteredIssues.sort((a, b) => b.amount - a.amount);

  const filteredChannelReceived = isAll
    ? channelReceived
    : channelReceived.filter((c) => {
        const channelKey = c.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return channelKey.includes(filterKey) || filterKey.includes(channelKey);
      });

  // Scale hero metrics
  const scale = isAll ? 1 :
    filterKey.includes('blinkit') ? 0.358 :
    filterKey.includes('zepto') ? 0.312 :
    filterKey.includes('reliance') ? 0.198 : 0.132;

  const rawReceivable = headlineByKey('receivable').value * scale;
  const rawReceived = headlineByKey('settled').value * scale;
  const rawOutstanding = rawReceivable - rawReceived;
  const underDispute = headlineByKey('underDispute').value * scale;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >

      {/* ── GREETING ─────────────────────────────────────────── */}
      <TypewriterGreeting />

      {/* ── HERO ROW ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Receivables</Typography>
          <CountUpMetric value={rawReceivable} format={formatINRShort} />
        </Box>

        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Received</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(rawReceived)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            {formatPercent(pctReceivedOverall)} of receivables
          </Caption>
        </Box>

        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Outstanding</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.accent, ...tabularNums }}>
            {formatINRShort(rawOutstanding)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Pending collection
          </Caption>
          <Button
            disableElevation
            onClick={() => navigate(RECON_ROUTE)}
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

        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Under Dispute</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(underDispute)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            Active disputes filed
          </Caption>
        </Box>
      </Box>

      {/* ── TREND & CHANNELS ROW ─────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
          alignItems: 'stretch',
        }}
      >
        {/* LEFT - Financial Trend */}
        <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
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

        {/* RIGHT - Channel-wise outstanding */}
        <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.lg}px` }}>
            <SectionTitle>Received by channel</SectionTitle>
            <Caption sx={{ ...type.label, color: colors.grey500, ...tabularNums }}>
              {formatPercent(pctReceivedOverall)} received
            </Caption>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.lg}px`, flex: 1 }}>
            {filteredChannelReceived.map((c) => {
              const exceptionCount = flaggedIssues.filter(i => i.channel === c.channel).length;
              return (
              <Pressable
                key={c.channel}
                onClick={() => navigate(`${RECON_ROUTE}?channel=${encodeURIComponent(c.channel)}`)}
                sx={{ display: 'block', textAlign: 'left', p: `${space.sm}px`, m: `-${space.sm}px`, borderRadius: '4px', transition: 'background-color 0.12s ease', '&:hover': { bgcolor: colors.grey100 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.xs}px` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                    <ChannelTag name={c.channel} />
                    {exceptionCount > 0 && (
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.accent, bgcolor: colors.accentWash, px: '6px', py: '2px', border: `1px solid ${colors.accent}` }}>
                        {exceptionCount} exception{exceptionCount !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.sm}px` }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                      {formatINRShort(c.received)}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: colors.grey500, ...tabularNums }}>
                      {formatPercent(c.pctReceived)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ height: 6, bgcolor: colors.grey100 }}>
                  <Box sx={{ height: '100%', width: `${c.pctReceived}%`, bgcolor: colors.ink }} />
                </Box>
              </Pressable>
            )})}
            {filteredChannelReceived.length === 0 && (
              <Typography sx={{ fontSize: 13, color: colors.grey500 }}>No receive data for this channel.</Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── MAIN ROW (RECEIVABLES & STATUS) ───────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: `${space.xl}px`,
          alignItems: 'start',
        }}
      >
        {/* LEFT - Open Receivables */}
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
                <FileDisputeLink onClick={() => navigate(issue.poNumber ? `${RECON_ROUTE}?po=${issue.poNumber}` : RECON_ROUTE)} />
              </Box>
            </Box>
          ))}
          {issues.length === 0 && (
            <Box sx={{ p: `${space.xl}px` }}>
              <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>No open exceptions for this channel.</Typography>
            </Box>
          )}
        </Box>

        {/* RIGHT - stacked */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
          {/* Upcoming payouts */}
          <Box sx={{ ...cardSx, p: 0 }}>
            <Box sx={{ p: `${space.xl}px`, borderBottom: hairline }}>
              <SectionTitle>Upcoming Payouts</SectionTitle>
            </Box>
            {upcomingPayouts.map((payout, i) => (
              <Box
                key={payout.date}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: `${space.xl}px`,
                  py: `${space.md}px`,
                  borderBottom: i < upcomingPayouts.length - 1 ? hairline : 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                  <ChannelTag name={payout.channel} />
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{payout.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                  <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                    {formatRupees(payout.amount)}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      border: hairline,
                      bgcolor: payout.status === 'Expected' ? colors.grey100 : colors.paper,
                      color: payout.status === 'Expected' ? colors.grey700 : colors.ink,
                      fontWeight: payout.status === 'Expected' ? 500 : 600,
                      fontSize: 11,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      px: `${space.sm}px`,
                      py: '3px',
                    }}
                  >
                    {payout.status}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ERP Integration Status */}
          <Box sx={cardSx}>
            <SectionTitle>Data Sources</SectionTitle>
            <Box sx={{ mt: `${space.lg}px`, display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
              {[
                { name: 'Blinkit Portal', status: 'Connected', connected: true },
                { name: 'Zepto Portal', status: 'Connected', connected: true },
                { name: 'Amazon Portal', status: 'Connected', connected: true },
                { name: 'Email Inbox', status: 'Connected', connected: true },
                { name: 'Bizeebuy ERP', status: 'Setup in progress', connected: false },
              ].map((source) => (
                <Box
                  key={source.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: hairline,
                    px: `${space.md}px`,
                    py: `${space.sm}px`,
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{source.name}</Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: source.connected ? colors.grey700 : colors.accent,
                    }}
                  >
                    {source.status}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
