// B2B Channel Drilldown - Screen 2 of the Cosmix demo.
// Deep-dive into a single channel: payout logic, deductions, issue flags,
// upcoming payouts. Accessed via /b2b/channels/:channelId.
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBackOutlined, ErrorOutlineOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, SectionTitle, ChannelTag, ColumnLabel, PageTitle } from '../components/primitives';
import { formatRupees, formatINRShort } from '../lib/format';
import { channelDrilldownData } from '../mock';
import type { ChannelDrilldownData } from '../mock';

const ChannelDrilldown: React.FC = () => {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const key = channelId?.toLowerCase().replace(/\s+/g, '') ?? 'zepto';

  const data: ChannelDrilldownData | undefined = channelDrilldownData[key];

  if (!data) {
    return (
      <Box sx={{ p: `${space.xl}px` }}>
        <Button onClick={() => navigate('/b2b/channels')} startIcon={<ArrowBackOutlined />} sx={{ color: colors.ink, mb: `${space.lg}px` }}>
          Back to Channels
        </Button>
        <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey500 }}>Channel not found: {channelId}</Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Back + header */}
      <Button
        onClick={() => navigate('/b2b/channels')}
        startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />}
        sx={{ color: colors.grey700, fontSize: 13, fontWeight: 500, mb: `${space.md}px`, px: 0, '&:hover': { bgcolor: 'transparent', color: colors.ink } }}
      >
        All channels
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.lg}px`, mb: `${space.md}px` }}>
        <PageTitle>{data.channel}</PageTitle>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.xl}px`, flexWrap: 'wrap' }}>
        <Box component="span" sx={{ ...type.label, color: colors.grey500 }}>{data.model}</Box>
        <Box component="span" sx={{ ...type.label, color: colors.grey500 }}>·</Box>
        <Box component="span" sx={{ ...type.label, color: colors.grey500 }}>{data.contractRef}</Box>
      </Box>

      {/* Payout logic */}
      <Box sx={{ ...cardSx, p: `${space.xl}px`, mb: `${space.xl}px` }}>
        <Typography sx={{ ...type.label, color: colors.grey700, mb: `${space.sm}px` }}>Contracted payout logic</Typography>
        <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, lineHeight: '22px' }}>
          {data.payoutLogic}
        </Typography>
      </Box>

      {/* Summary cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        {[
          { label: 'Sales in period', value: formatINRShort(data.salesInPeriod) },
          { label: 'Gross deductions', value: formatINRShort(data.grossDeductions) },
          { label: 'Expected receivable', value: formatINRShort(data.expectedReceivable) },
          { label: 'Received', value: formatINRShort(data.receivedAmount), accent: false },
          { label: 'Pending balance', value: formatINRShort(data.pendingBalance), accent: true },
        ].map((item) => (
          <Box key={item.label} sx={{ ...cardSx, p: `${space.xl}px` }}>
            <Typography sx={{ ...type.label, color: colors.grey700, mb: `${space.md}px` }}>{item.label}</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 600, color: item.accent ? colors.accent : colors.ink, ...tabularNums }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Deduction breakdown */}
      <Box sx={{ ...cardSx, mb: `${space.xl}px`, overflow: 'hidden' }}>
        <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px`, borderBottom: hairline }}>
          <SectionTitle>Deduction breakdown</SectionTitle>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 640 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 1fr) 140px 110px 110px 110px',
                alignItems: 'center',
                gap: `${space.lg}px`,
                px: `${space.xl}px`,
                py: `${space.md}px`,
                bgcolor: colors.grey100,
                borderBottom: hairline,
              }}
            >
              <ColumnLabel>Fee</ColumnLabel>
              <ColumnLabel>Contracted</ColumnLabel>
              <ColumnLabel align="right">Expected</ColumnLabel>
              <ColumnLabel align="right">Actual</ColumnLabel>
              <ColumnLabel align="right">Variance</ColumnLabel>
            </Box>
            {data.deductionBreakdown.map((line, i) => (
              <Box
                key={line.label}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1fr) 140px 110px 110px 110px',
                  alignItems: 'center',
                  gap: `${space.lg}px`,
                  px: `${space.xl}px`,
                  py: `${space.md}px`,
                  borderBottom: i < data.deductionBreakdown.length - 1 ? hairline : 'none',
                  bgcolor: line.variance > 0 ? colors.grey100 : 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                  {line.variance > 0 && <ErrorOutlineOutlined sx={{ fontSize: 16, color: colors.ink, flexShrink: 0 }} />}
                  <Typography sx={{ fontSize: type.body.fontSize, fontWeight: line.variance > 0 ? 600 : 400, color: colors.ink }}>
                    {line.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: type.body.fontSize, color: colors.grey700 }}>{line.contracted}</Typography>
                <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, textAlign: 'right', ...tabularNums }}>
                  {formatRupees(line.expected)}
                </Typography>
                <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, textAlign: 'right', ...tabularNums }}>
                  {formatRupees(line.actual)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: type.body.fontSize,
                    fontWeight: line.variance > 0 ? 600 : 400,
                    color: line.variance > 0 ? colors.accent : colors.grey500,
                    textAlign: 'right',
                    ...tabularNums,
                  }}
                >
                  {line.variance > 0 ? `+${formatRupees(line.variance)}` : '-'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Issue flags + upcoming payouts side-by-side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: `${space.xl}px` }}>
        {/* Issue flags */}
        <Box sx={{ ...cardSx, overflow: 'hidden' }}>
          <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px`, borderBottom: hairline }}>
            <SectionTitle>Issue flags</SectionTitle>
          </Box>
          {data.issueFlags.map((flag, i) => (
            <Box
              key={flag.type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: `${space.xl}px`,
                py: `${space.lg}px`,
                borderBottom: i < data.issueFlags.length - 1 ? hairline : 'none',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>{flag.type}</Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{flag.count} item{flag.count > 1 ? 's' : ''}</Typography>
              </Box>
              <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.accent, ...tabularNums }}>
                {formatRupees(flag.amount)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Upcoming payouts */}
        <Box sx={{ ...cardSx, overflow: 'hidden' }}>
          <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px`, borderBottom: hairline }}>
            <SectionTitle>Upcoming payouts</SectionTitle>
          </Box>
          {data.upcomingPayouts.map((payout, i) => (
            <Box
              key={payout.date}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: `${space.xl}px`,
                py: `${space.lg}px`,
                borderBottom: i < data.upcomingPayouts.length - 1 ? hairline : 'none',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 500, color: colors.ink }}>{payout.date}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {formatRupees(payout.amount)}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
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

export default ChannelDrilldown;
