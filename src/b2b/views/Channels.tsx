// B2B Channels — per-channel settlement performance. All figures from the mock
// barrel (src/b2b/mock). Monochrome + one accent (#7A5DBF): accent appears ONLY
// on the recoverable column and the net-realisation bar fill. Channels are
// uppercase text labels — never colour-coded. Net-realisation bars are NOT
// colour-graded by value (single accent fill on a grey track); the % + weight
// carry the meaning. Square corners, hairline borders, tabular figures.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, PageTitle } from '../components/primitives';
import { formatCompactINR, formatPercent } from '../lib/format';
import { channelPerformance, headlineByKey } from '../mock';

const GRID = '110px 130px minmax(200px, 1fr) 120px 130px';

// Thin square net-realisation bar: accent fill on a grey track. No value-grading.
const RealisationBar: React.FC<{ pct: number; emphasise?: boolean }> = ({ pct, emphasise }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
    <Box sx={{ flex: 1, height: 6, bgcolor: colors.grey100 }}>
      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: colors.accent }} />
    </Box>
    <Typography sx={{ width: 44, textAlign: 'right', fontSize: type.body.fontSize, fontWeight: emphasise ? 600 : 500, color: colors.ink, ...tabularNums }}>
      {formatPercent(pct)}
    </Typography>
  </Box>
);

const Cell: React.FC<{ children: React.ReactNode; align?: 'left' | 'right'; sx?: object }> = ({
  children,
  align = 'left',
  sx,
}) => (
  <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, textAlign: align, ...tabularNums, ...sx }}>
    {children}
  </Typography>
);

const Channels: React.FC = () => {
  const reduce = useReducedMotion();
  const rows = channelPerformance;
  const minNet = Math.min(...rows.map((c) => c.netRealisationPct)); // worst realiser → emphasised

  const settledTotal = headlineByKey('settled');
  const leakageTotal = headlineByKey('leakage');
  const recoverableTotal = headlineByKey('recoverable');
  const blendedNet = headlineByKey('netRealisation').value;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <PageTitle>Channels</PageTitle>

      <Box sx={{ ...cardSx, overflowX: 'auto' }}>
       <Box sx={{ minWidth: 760 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: GRID,
            alignItems: 'center',
            gap: `${space.lg}px`,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            bgcolor: colors.grey100,
            borderBottom: hairline,
          }}
        >
          <ColumnLabel>Channel</ColumnLabel>
          <ColumnLabel align="right">Settled · Q1</ColumnLabel>
          <ColumnLabel>Net realisation</ColumnLabel>
          <ColumnLabel align="right">Leakage</ColumnLabel>
          <ColumnLabel align="right">Recoverable</ColumnLabel>
        </Box>

        {/* Channel rows */}
        {rows.map((c) => (
          <Box
            key={c.channel}
            sx={{
              display: 'grid',
              gridTemplateColumns: GRID,
              alignItems: 'center',
              gap: `${space.lg}px`,
              px: `${space.xl}px`,
              minHeight: 52,
              borderBottom: hairline,
              transition: 'background-color 0.12s ease',
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            <ChannelTag name={c.channel} />
            <Cell align="right">{formatCompactINR(c.settled)}</Cell>
            <RealisationBar pct={c.netRealisationPct} emphasise={c.netRealisationPct === minNet} />
            <Cell align="right">{formatCompactINR(c.leakage)}</Cell>
            <Cell align="right" sx={{ color: colors.accent, fontWeight: 600 }}>
              {formatCompactINR(c.recoverable)}
            </Cell>
          </Box>
        ))}

        {/* All-channels summary — heavier separator, bold */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: GRID,
            alignItems: 'center',
            gap: `${space.lg}px`,
            px: `${space.xl}px`,
            minHeight: 56,
            borderTop: `2px solid ${colors.grey200}`,
          }}
        >
          <Box component="span" sx={{ ...type.label, color: colors.ink, fontWeight: 600 }}>
            All channels
          </Box>
          <Cell align="right" sx={{ fontWeight: 600 }}>{settledTotal.display}</Cell>
          <RealisationBar pct={blendedNet} emphasise />
          <Cell align="right" sx={{ fontWeight: 600 }}>{leakageTotal.display}</Cell>
          <Cell align="right" sx={{ color: colors.accent, fontWeight: 600 }}>{recoverableTotal.display}</Cell>
        </Box>
       </Box>
      </Box>

      {/* Quiet narrative caption */}
      <Typography sx={{ mt: `${space.lg}px`, fontSize: type.body.fontSize, color: colors.grey700, maxWidth: 720 }}>
        Amazon settles the most but realises the least — the 1kg powders keep landing in the wrong FBA weight
        band. That single fix is worth ~₹8.6L.
      </Typography>
    </Box>
  );
};

export default Channels;
