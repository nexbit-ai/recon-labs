// Vertical P&L waterfall for the MIS page. Walks misData.pnl top→bottom keeping
// a running balance so deductions render as a descending staircase of floating
// bars between the emphasized subtotal "checkpoints" (GMV … EBITDA).
//
// Scaling: GMV (the first subtotal) = 100% of the plot width. Every bar is
// positioned as a % of GMV.
//   • subtotal → solid bar from baseline 0 to value      → [0, value/GMV]
//   • flow     → floating step-down at the running balance → [(bal−|amt|)/GMV, bal/GMV]
//     then the running balance is decremented by |amount|.
// This ties out exactly: each subtotal equals the running balance at that point.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowUpwardOutlined, ArrowDownwardOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { formatINRShort, formatPercent } from '../../lib/format';
import type { PnLLine, PriorMonthSummary } from '../../mock';
import { statusColors } from './misTokens';

const BAR_HEIGHT = 20;
const HERO_KEYS = ['gmv', 'ebitda'] as const;

interface WaterfallRow extends PnLLine {
  leftPct: number;
  widthPct: number;
  isHero: boolean;
}

// Walk the lines once, resolving each bar's [left, width] as a % of GMV.
function buildRows(lines: PnLLine[]): WaterfallRow[] {
  const gmv = lines.find((l) => l.key === 'gmv')?.amount ?? lines[0].amount;
  let running = 0;
  return lines.map((line) => {
    let leftPct: number;
    let widthPct: number;
    if (line.kind === 'subtotal') {
      running = line.amount;
      leftPct = 0;
      widthPct = (line.amount / gmv) * 100;
    } else {
      const mag = Math.abs(line.amount);
      leftPct = ((running - mag) / gmv) * 100;
      widthPct = (mag / gmv) * 100;
      running -= mag;
    }
    return { ...line, leftPct, widthPct, isHero: HERO_KEYS.includes(line.key as (typeof HERO_KEYS)[number]) };
  });
}

const containerV = (startDelay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: startDelay + 0.04 } },
});
const barVariant = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 0.32, ease: 'easeOut' as const } },
};

const PnLWaterfall: React.FC<{ lines: PnLLine[]; priorMonth: PriorMonthSummary; startDelay?: number }> = ({
  lines,
  priorMonth,
  startDelay = 0,
}) => {
  const reduce = useReducedMotion();

  if (!lines.length) {
    return <Typography sx={{ ...type.body, color: colors.grey500 }}>No P&amp;L data for this period.</Typography>;
  }

  const rows = buildRows(lines);

  const gmv = rows.find((r) => r.key === 'gmv')?.amount ?? rows[0].amount;
  const ebitda = rows.find((r) => r.key === 'ebitda')?.amount ?? 0;
  const rupeesPer100 = (ebitda / gmv) * 100;

  const momDelta = ebitda - priorMonth.ebitda;
  const momPct = priorMonth.ebitda !== 0 ? (momDelta / priorMonth.ebitda) * 100 : 0;
  const momUp = momDelta >= 0;
  const MomArrow = momUp ? ArrowUpwardOutlined : ArrowDownwardOutlined;
  const momColor = momUp ? statusColors.positive : statusColors.warning;

  const barColor = (row: WaterfallRow) =>
    row.isHero ? colors.accent : row.kind === 'subtotal' ? colors.ink : statusColors.warning;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Rows */}
      <Box
        component={motion.div}
        variants={reduce ? undefined : containerV(startDelay)}
        initial={reduce ? false : 'hidden'}
        animate={reduce ? false : 'show'}
      >
        {rows.map((row) => {
          const subtotal = row.kind === 'subtotal';
          const dividerAbove = subtotal && row.key !== 'gmv';
          return (
            <Box
              key={row.key}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '128px 1fr 104px', sm: '188px 1fr 136px' },
                alignItems: 'center',
                columnGap: `${space.lg}px`,
                py: `${space.xs}px`,
                px: row.isHero ? `${space.sm}px` : 0,
                mx: row.isHero ? `-${space.sm}px` : 0,
                borderTop: dividerAbove ? hairline : 'none',
                bgcolor: row.isHero ? colors.accentWash : 'transparent',
              }}
            >
              {/* Label */}
              <Typography
                title={row.label}
                sx={{
                  fontSize: row.isHero ? 15 : type.body.fontSize,
                  fontWeight: subtotal ? 600 : 400,
                  color: subtotal ? colors.ink : colors.grey700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.label}
              </Typography>

              {/* Plot */}
              <Box sx={{ position: 'relative', height: BAR_HEIGHT, minWidth: 0 }}>
                <Box
                  component={motion.div}
                  variants={reduce ? undefined : barVariant}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${row.leftPct}%`,
                    width: `${row.widthPct}%`,
                    minWidth: 2,
                    bgcolor: barColor(row),
                    transformOrigin: 'left',
                  }}
                />
              </Box>

              {/* Amount + % of GMV */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: row.isHero ? 15 : type.body.fontSize,
                    fontWeight: subtotal ? 600 : 400,
                    color: row.key === 'ebitda' ? colors.accent : colors.ink,
                    ...tabularNums,
                  }}
                >
                  {formatINRShort(row.amount)}
                </Typography>
                <Typography sx={{ fontSize: 12, lineHeight: '16px', color: colors.grey500, ...tabularNums }}>
                  {formatPercent(row.pctOfGmv)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Summary line */}
      <Box
        sx={{
          mt: `${space.lg}px`,
          pt: `${space.lg}px`,
          borderTop: hairline,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: `${space.md}px`,
        }}
      >
        <Typography sx={{ ...type.body, color: colors.grey700 }}>
          Only{' '}
          <Box component="span" sx={{ fontWeight: 600, color: colors.ink, ...tabularNums }}>
            ₹{rupeesPer100.toFixed(2)}
          </Box>{' '}
          of every{' '}
          <Box component="span" sx={{ fontWeight: 600, color: colors.ink, ...tabularNums }}>
            ₹100
          </Box>{' '}
          in GMV reaches EBITDA
        </Typography>

        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: `${space.xs}px`, color: momColor }}>
          <MomArrow sx={{ fontSize: 16 }} />
          <Typography sx={{ ...type.label, color: 'inherit', ...tabularNums }}>
            {momUp ? '+' : '−'}
            {Math.abs(momPct).toFixed(1)}% vs {priorMonth.period}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PnLWaterfall;
