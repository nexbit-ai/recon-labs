// Reconciliation-completeness banner - the trust anchor of the MIS page.
// Reads entirely from misData.reconciliation. Full-width card: a headline
// completeness figure, a single segmented progress bar (matched / in dispute /
// pending) with a legend, and three compact money stats. Money via
// formatINRShort; the recovered figure is the one accent-worthy positive.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, hairline, radii, type, space, tabularNums } from './tokens';
import { cardSx } from './primitives';
import { formatINRShort } from './format';
import type { ReconciliationCompleteness } from './misData';
import { statusColors } from './misTokens';

// One segment of the completeness bar + its legend entry.
interface Segment {
  key: string;
  label: string;
  pct: number;
  color: string;
}

// One compact money stat under the bar.
const Stat: React.FC<{ label: string; value: string; caption?: string; accent?: boolean; first?: boolean }> = ({
  label,
  value,
  caption,
  accent,
  first,
}) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      px: `${space.xl}px`,
      py: `${space.lg}px`,
      borderLeft: { xs: 'none', sm: first ? 'none' : hairline },
      borderTop: { xs: first ? 'none' : hairline, sm: 'none' },
    }}
  >
    <Typography sx={{ ...type.label, color: colors.grey700 }}>{label}</Typography>
    <Typography sx={{ ...type.statValue, color: accent ? colors.accent : colors.ink, mt: '4px', ...tabularNums }}>
      {value}
    </Typography>
    {caption && (
      <Typography sx={{ fontSize: 13, lineHeight: '18px', color: colors.grey500, mt: '2px' }}>{caption}</Typography>
    )}
  </Box>
);

const ReconciliationBanner: React.FC<{ data: ReconciliationCompleteness }> = ({ data }) => {
  const segments: Segment[] = [
    { key: 'matched', label: 'Matched', pct: data.reconciledMatchedPct, color: statusColors.positive },
    { key: 'dispute', label: 'In dispute', pct: data.inDisputePct, color: statusColors.warning },
    { key: 'pending', label: 'Pending settlement', pct: data.pendingSettlementPct, color: statusColors.neutral },
  ];

  return (
    <Box sx={cardSx}>
      {/* Headline + bar + legend */}
      <Box sx={{ p: `${space.xl}px` }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.sm}px`, flexWrap: 'wrap' }}>
          <Typography sx={{ ...type.metric, color: colors.ink }}>{data.reconciledMatchedPct}%</Typography>
          <Typography sx={{ fontSize: 18, lineHeight: '26px', fontWeight: 500, color: colors.ink }}>
            reconciled
          </Typography>
          <Typography sx={{ ...type.body, color: colors.grey500, ml: `${space.sm}px`, ...tabularNums }}>
            across {data.totalTransactions.toLocaleString('en-IN')} transactions · {data.period}
          </Typography>
        </Box>

        {/* Segmented completeness bar */}
        <Box
          role="img"
          aria-label={segments.map((s) => `${s.label} ${s.pct}%`).join(', ')}
          sx={{
            display: 'flex',
            width: '100%',
            height: 10,
            mt: `${space.lg}px`,
            bgcolor: colors.grey100,
            borderRadius: `${radii.bar}px`,
            overflow: 'hidden',
          }}
        >
          {segments.map((s) => (
            <Box key={s.key} sx={{ flexBasis: `${s.pct}%`, flexGrow: 0, flexShrink: 0, minWidth: 0, bgcolor: s.color }} />
          ))}
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${space.lg}px`, mt: `${space.md}px` }}>
          {segments.map((s) => (
            <Box key={s.key} sx={{ display: 'inline-flex', alignItems: 'center', gap: `${space.sm}px` }}>
              <Box sx={{ width: 8, height: 8, borderRadius: radii.dot, bgcolor: s.color, flexShrink: 0 }} />
              <Typography sx={{ ...type.label, color: colors.grey700, ...tabularNums }}>
                {s.label} · {s.pct}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Money stats */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, borderTop: hairline }}>
        <Stat
          first
          label="In dispute"
          value={formatINRShort(data.inDisputeAmount)}
          caption={`${data.inDisputeExceptions.toLocaleString('en-IN')} exceptions`}
        />
        <Stat label="Pending settlement" value={formatINRShort(data.pendingSettlementAmount)} />
        <Stat label="Recovered this month" value={formatINRShort(data.recoveredThisMonth)} accent caption="disputes filed & won" />
      </Box>
    </Box>
  );
};

export default ReconciliationBanner;
