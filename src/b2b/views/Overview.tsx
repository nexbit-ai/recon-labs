import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  ComposedChart
} from 'recharts';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import CountUpMetric from '../components/CountUpMetric';
import { cardSx as cardBase, SectionTitle, ChannelTag } from '../components/primitives';
import { formatRupees, formatINRShort } from '../lib/format';
import {
  headlineByKey,
  channelPerformance,
  trendData,
  upcomingPayouts,
  actionItems,
  actionPipeline,
} from '../mock';
import { ChannelCard } from '../components/ChannelCard';
import { DiscrepancyList } from '../components/DiscrepancyList';
import { ActionPipeline } from '../components/ActionPipeline';

const RECON_ROUTE = '/b2b/ledger';
const ACTIONS_ROUTE = '/b2b/actions';

const cardSx = { ...cardBase, p: `${space.xl}px` } as const;
const labelSx = { ...type.label, color: colors.grey700 } as const;

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

  const filteredChannels = isAll
    ? channelPerformance
    : channelPerformance.filter((c) => {
        const channelKey = c.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return channelKey.includes(filterKey) || filterKey.includes(channelKey);
      });

  const filteredDiscrepancies = isAll
    ? actionItems
    : actionItems.filter(i => {
        const channelKey = i.channel.toLowerCase().replace(/\s+/g, '').replace('–', '');
        return channelKey.includes(filterKey) || filterKey.includes(channelKey);
      });

  // Calculate scaled metrics for hero
  const expectedTotal = filteredChannels.reduce((sum, c) => sum + c.expected, 0);
  const receivedTotal = filteredChannels.reduce((sum, c) => sum + c.received, 0);
  const unresolvedTotal = filteredChannels.reduce((sum, c) => sum + c.unresolved, 0);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <TypewriterGreeting />

      {/* ── HERO ROW ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Expected</Typography>
          <CountUpMetric value={expectedTotal} format={formatINRShort} />
        </Box>
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Total Received</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: colors.ink, ...tabularNums }}>
            {formatINRShort(receivedTotal)}
          </Box>
        </Box>
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px`, color: unresolvedTotal > 0 ? '#991B1B' : colors.grey700 }}>Unresolved</Typography>
          <Box component="span" sx={{ display: 'block', fontSize: type.metric.fontSize, lineHeight: type.metric.lineHeight, fontWeight: type.metric.fontWeight, color: unresolvedTotal > 0 ? '#991B1B' : colors.ink, ...tabularNums }}>
            {formatINRShort(unresolvedTotal)}
          </Box>
        </Box>
      </Box>

      {/* ── TREND ROW ─────────────────────────────── */}
      <Box sx={{ ...cardSx, mb: `${space.xl}px`, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: `${space.xl}px` }}>
          <SectionTitle>6-Month Settlement Trend</SectionTitle>
        </Box>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trendData}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              barGap={2}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grey200} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: colors.grey500 }} axisLine={false} tickLine={false} dy={10} />
              {/* Left axis – absolute settlement amounts */}
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: colors.grey500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => `₹${value}L`}
                dx={-10}
              />
              {/* Right axis – gap amount (much smaller scale) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#b45309' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => `₹${value}L`}
                domain={[0, (max: number) => Math.ceil(max + 1)]}
                dx={6}
              />
              <Tooltip
                contentStyle={{ borderRadius: 6, border: hairline, borderColor: colors.grey200, fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                itemStyle={{ fontWeight: 500 }}
                formatter={(value: number, name: string) => [`₹${value} L`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 20 }} iconType="circle" />
              <Bar
                yAxisId="left"
                dataKey="expectedLakhs"
                name="Expected"
                fill={colors.grey200}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Bar
                yAxisId="left"
                dataKey="receivedLakhs"
                name="Received"
                fill={colors.ink}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="gapLakhs"
                name="Unresolved Gap"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* ── CHANNELS GRID ─────────────────────────────── */}
      <Box sx={{ mb: `${space.xl}px` }}>
        <SectionTitle sx={{ mb: `${space.lg}px` }}>Channel Performance</SectionTitle>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(280px, 1fr))' },
            gap: `${space.lg}px`,
          }}
        >
          {filteredChannels.map(c => {
            const channelIssues = actionItems.filter(i => i.channel === c.channel && i.status !== 'Resolved');
            const followUps = channelIssues.filter(i => i.status === 'Follow-up sent');
            return (
              <ChannelCard
                key={c.channel}
                channel={c.channel}
                model={c.channel.includes('Blinkit') || c.channel.includes('Zepto') ? 'Quick-commerce (SOR)' : 'Modern Trade'}
                expected={c.expected}
                received={c.received}
                unresolved={c.unresolved}
                issueCount={channelIssues.length}
                followUpCount={followUps.length}
                onClick={() => navigate(`${RECON_ROUTE}?channel=${encodeURIComponent(c.channel)}`)}
              />
            );
          })}
        </Box>
      </Box>

      {/* ── ACTION PIPELINE & DISCREPANCIES ───────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: `${space.xl}px`,
          alignItems: 'start',
        }}
      >
        <Box sx={{ ...cardSx, p: 0 }}>
          <Box sx={{ p: `${space.xl}px`, borderBottom: hairline }}>
            <SectionTitle>Action Pipeline</SectionTitle>
          </Box>
          <Box sx={{ p: `${space.xl}px` }}>
            <ActionPipeline pipeline={actionPipeline} recoveredAmount={headlineByKey('recoveredYtd').value} />
          </Box>

          <Box sx={{ p: `${space.xl}px`, borderTop: hairline, borderBottom: hairline, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink }}>
              Unresolved Discrepancies
            </Typography>
          </Box>
          <DiscrepancyList
            discrepancies={filteredDiscrepancies.filter(i => i.status !== 'Resolved').slice(0, 5)}
            onIssueClick={(issue) => navigate(`${ACTIONS_ROUTE}?id=${issue.id}`)}
          />
        </Box>

        {/* RIGHT - Upcoming Payouts */}
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
      </Box>
    </Box>
  );
};

export default Overview;
