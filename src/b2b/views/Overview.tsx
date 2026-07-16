// B2B Overview — the settlement command screen. Every figure is read from the
// mock barrel (src/b2b/mock); nothing is hardcoded here. Monochrome + one accent
// (#7A5DBF), square corners, hairline borders, tabular figures. Channels and
// issue types are NEVER colour-coded — they are uppercase labels / hairline
// chips. Accent appears only on: Recovered YTD, "File dispute" links, and the
// single most-urgent deadline.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
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
  recoveredYtdClaimsWon,
  netRealisationAssumptionPct,
  activeDisputes,
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
    File dispute →
  </Pressable>
);

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // ── figures, all from the mock barrel ──
  const receivable = headlineByKey('receivable');
  const shortfall = headlineByKey('leakage');
  const recoveredYtd = headlineByKey('recoveredYtd');
  const netRealisation = headlineByKey('netRealisation');

  const netGap = (netRealisationAssumptionPct - netRealisation.value).toFixed(1);

  const issues = [...flaggedIssues].sort((a, b) => b.amount - a.amount);
  const deadlines = [...activeDisputes]
    .sort((a, b) => a.windowDaysRemaining - b.windowDaysRemaining)
    .slice(0, 3);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <PageTitle>Settlement overview</PageTitle>

      {/* ── HERO ROW ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        {/* Receivable this quarter (hero, count-up) — total owed by all portals,
            with the correctly-received portion called out beneath it. */}
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Receivable this quarter</Typography>
          <CountUpMetric value={receivable.value} format={formatINRShort} />
          <Box
            sx={{
              mt: `${space.md}px`,
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: `${space.sm}px`,
              border: hairline,
              px: `${space.sm}px`,
              py: '3px',
              fontSize: 13,
              color: colors.ink,
              ...tabularNums,
            }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>{formatINRShort(totalReceived)} received</Box>
            <Box component="span" sx={{ color: colors.grey700 }}>· {formatPercent(pctReceivedOverall)}</Box>
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            What all 5 portals owed you this quarter.{' '}
            <Box component="span" sx={{ fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {shortfall.display}
            </Box>{' '}
            is still short and under recovery.
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
            Review what's still short →
          </Button>
        </Box>

        {/* Recovered YTD (accent metric) */}
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>Recovered YTD</Typography>
          <Box
            component="span"
            sx={{
              display: 'block',
              fontSize: type.metric.fontSize,
              lineHeight: type.metric.lineHeight,
              fontWeight: type.metric.fontWeight,
              color: colors.accent,
              ...tabularNums,
            }}
          >
            {recoveredYtd.display}
          </Box>
          <Caption sx={{ mt: `${space.md}px`, ...tabularNums }}>
            {recoveredYtdClaimsWon} claims won
          </Caption>
        </Box>

        {/* True net realisation (ink metric) */}
        <Box sx={cardSx}>
          <Typography sx={{ ...labelSx, display: 'block', mb: `${space.md}px` }}>True net realisation</Typography>
          <Box
            component="span"
            sx={{
              display: 'block',
              fontSize: type.metric.fontSize,
              lineHeight: type.metric.lineHeight,
              fontWeight: type.metric.fontWeight,
              color: colors.ink,
              ...tabularNums,
            }}
          >
            {formatPercent(netRealisation.value)}
          </Box>
          <Caption sx={{ mt: `${space.md}px` }}>
            <Box component="span" sx={{ fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {netGap} pts
            </Box>{' '}
            below your {netRealisationAssumptionPct}% assumption
          </Caption>
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
        {/* LEFT — Flagged by Nex */}
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
            <SectionTitle>Flagged by Nex</SectionTitle>
            <Caption sx={{ ...type.label, color: colors.grey500, ...tabularNums }}>
              {issues.length} of {flaggedIssuesTotal} issues · sorted by amount
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
                  <Box component="span" sx={{ ...type.label, color: colors.grey500 }}>
                    {issue.confidence} confidence
                  </Box>
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
        </Box>

        {/* RIGHT — stacked */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
          {/* Received by portal — how much of each portal's receivable landed
             correctly. Bar fill = % received; the sliver left is what's short. */}
          <Box sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: `${space.lg}px` }}>
              <SectionTitle>Received by portal</SectionTitle>
              <Caption sx={{ ...type.label, color: colors.grey500, ...tabularNums }}>
                {formatPercent(pctReceivedOverall)} received
              </Caption>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.lg}px` }}>
              {channelReceived.map((c) => (
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
                  {/* greyscale bar — NOT colour-coded */}
                  <Box sx={{ height: 6, bgcolor: colors.grey100 }}>
                    <Box sx={{ height: '100%', width: `${c.pctReceived}%`, bgcolor: colors.ink }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Deadline watch */}
          <Box sx={cardSx}>
            <SectionTitle>Deadline watch</SectionTitle>
            <Box sx={{ mt: `${space.lg}px`, display: 'flex', flexDirection: 'column' }}>
              {deadlines.map((d, i) => {
                const urgent = i === 0;
                return (
                  <Box
                    key={d.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: `${space.md}px`,
                      borderTop: i === 0 ? 'none' : hairline,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <ChannelTag name={d.channel} />
                      <Caption sx={{ mt: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.reason}
                      </Caption>
                    </Box>
                    <Typography
                      sx={{
                        flexShrink: 0,
                        ml: `${space.md}px`,
                        fontSize: 13,
                        fontWeight: urgent ? 600 : 500,
                        color: urgent ? colors.accent : colors.grey700,
                        ...tabularNums,
                      }}
                    >
                      {d.windowDaysRemaining} days left
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
