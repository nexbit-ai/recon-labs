// Channel performance breakdown for the MIS page. One row per channel, sorted
// by CM1% descending so loss-making channels sink to the bottom regardless of
// GMV size. Two independent encodings: GMV bar length = SIZE (neutral ink, never
// implies profit); CM1% colour = HEALTH (green / grey / amber). The tension —
// a long bar on an amber negative CM1% — is the point.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, radii, type, space, tabularNums } from './tokens';
import { formatINRShort, formatPercent } from './format';
import type { ChannelMISPerformance, ChannelHealth } from './misData';
import { statusColors } from './misTokens';

type Tone = 'positive' | 'warning' | 'neutral';

// Health → tone + chip label. Palette has no distinct red, so warning (amber)
// carries the negative/loss meaning; thin positive margins read as neutral grey.
const HEALTH_META: Record<ChannelHealth, { tone: Tone; label: string }> = {
  best: { tone: 'positive', label: 'Best' },
  strong: { tone: 'positive', label: 'Strong' },
  healthy: { tone: 'positive', label: 'Healthy' },
  thin: { tone: 'neutral', label: 'Thin' },
  negative: { tone: 'warning', label: 'Negative' },
  loss: { tone: 'warning', label: 'Loss-making' },
};

const TONE_COLOR: Record<Tone, string> = {
  positive: statusColors.positive,
  warning: statusColors.warning,
  neutral: colors.grey700,
};
const TONE_WASH: Record<Tone, string> = {
  positive: statusColors.positiveWash,
  warning: statusColors.warningWash,
  neutral: colors.grey100,
};

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const containerV = (startDelay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: startDelay + 0.04 } },
});
const barVariant = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 0.32, ease: 'easeOut' as const } },
};

const ChannelPerformance: React.FC<{ channels: ChannelMISPerformance[]; startDelay?: number }> = ({
  channels,
  startDelay = 0,
}) => {
  const reduce = useReducedMotion();

  if (!channels.length) {
    return <Typography sx={{ ...type.body, color: colors.grey500 }}>No channel data for this period.</Typography>;
  }

  const rows = [...channels].sort((a, b) => b.cm1Pct - a.cm1Pct);
  const maxGmv = Math.max(...channels.map((c) => c.gmv));

  // Worst channel by CM1% + its rank by GMV, for the insight line.
  const worst = rows[rows.length - 1];
  const gmvRank = [...channels].sort((a, b) => b.gmv - a.gmv).findIndex((c) => c.channel === worst.channel) + 1;

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        component={motion.div}
        variants={reduce ? undefined : containerV(startDelay)}
        initial={reduce ? false : 'hidden'}
        animate={reduce ? false : 'show'}
      >
        {rows.map((row, i) => {
          const meta = HEALTH_META[row.health];
          const negative = row.cm1Pct < 0;
          return (
            <Box
              key={row.channel}
              sx={{
                py: `${space.sm}px`,
                px: negative ? `${space.sm}px` : 0,
                mx: negative ? `-${space.sm}px` : 0,
                borderRadius: negative ? `${radii.panel}px` : 0,
                borderTop: i === 0 ? 'none' : hairline,
                bgcolor: negative ? statusColors.warningWash : 'transparent',
              }}
            >
              {/* Line 1: name · CM1% + health chip */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${space.md}px` }}>
                <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, minWidth: 0 }}>
                  {row.channel}
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: `${space.sm}px`, flexShrink: 0 }}>
                  <Typography
                    sx={{ fontSize: 18, lineHeight: '22px', fontWeight: 600, color: TONE_COLOR[meta.tone], ...tabularNums }}
                  >
                    {formatPercent(row.cm1Pct)}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      ...type.label,
                      color: TONE_COLOR[meta.tone],
                      bgcolor: TONE_WASH[meta.tone],
                      borderRadius: `${radii.chip}px`,
                      px: `${space.sm}px`,
                      py: '3px',
                    }}
                  >
                    {meta.label}
                  </Box>
                </Box>
              </Box>

              {/* Line 2: GMV bar (size) + value */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mt: `${space.xs}px` }}>
                <Box
                  sx={{
                    position: 'relative',
                    flex: 1,
                    height: 8,
                    bgcolor: colors.grey100,
                    borderRadius: `${radii.bar}px`,
                    overflow: 'hidden',
                    minWidth: 0,
                  }}
                >
                  <Box
                    component={motion.div}
                    variants={reduce ? undefined : barVariant}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `${(row.gmv / maxGmv) * 100}%`,
                      minWidth: 2,
                      borderRadius: `${radii.bar}px`,
                      bgcolor: colors.ink,
                      transformOrigin: 'left',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: colors.grey700,
                    textAlign: 'right',
                    minWidth: 76,
                    flexShrink: 0,
                    ...tabularNums,
                  }}
                >
                  {formatINRShort(row.gmv)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Insight line — worst channel by CM1%, computed dynamically */}
      <Box sx={{ mt: `${space.lg}px`, pt: `${space.lg}px`, borderTop: hairline }}>
        <Typography sx={{ ...type.body, color: colors.grey700 }}>
          <Box component="span" sx={{ fontWeight: 600, color: colors.ink }}>
            {worst.channel}
          </Box>{' '}
          is your {ordinal(gmvRank)}-largest channel by GMV{' '}
          <Box component="span" sx={{ ...tabularNums }}>
            ({formatINRShort(worst.gmv)})
          </Box>{' '}
          but{' '}
          {worst.cm1Pct < 0 ? 'loses money on every order' : 'earns the thinnest margin'}{' '}
          <Box component="span" sx={{ fontWeight: 600, color: statusColors.warning, ...tabularNums }}>
            ({formatPercent(worst.cm1Pct)} CM1)
          </Box>
          .
        </Typography>
      </Box>
    </Box>
  );
};

export default ChannelPerformance;
