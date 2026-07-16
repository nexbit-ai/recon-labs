// SKU profitability for the MIS page, split into two labeled groups:
// "Top performers" (margin desc) and "Kill list" (worst margin first). Kill-list
// rows reuse the faint warning-wash used for loss-making channels, so a leaking
// channel and its leaking SKUs read as the same story. No red token exists —
// negatives use the muted warning/amber tone + a warning icon on the group head.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, type, space, hairline, radii, tabularNums } from './tokens';
import { formatPercent } from './format';
import type { SkuProfitability as SkuRow } from './misData';
import { statusColors } from './misTokens';

// Channels treated as quick-commerce, for the dynamic kill-list summary phrasing.
const QUICK_COMMERCE = new Set(['Blinkit', 'Zepto', 'BigBasket', 'Instamart']);

const containerV = (startDelay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: startDelay + 0.04 } },
});
const rowVariant = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' as const } },
};

// Muted, neutral channel tag — matches the channel health chip treatment.
const ChannelChip: React.FC<{ name: string }> = ({ name }) => (
  <Box
    component="span"
    sx={{ ...type.label, color: colors.grey700, bgcolor: colors.grey100, borderRadius: `${radii.chip}px`, px: `${space.sm}px`, py: '2px' }}
  >
    {name}
  </Box>
);

const SkuLine: React.FC<{ sku: SkuRow; first: boolean }> = ({ sku, first }) => {
  const negative = sku.marginPct < 0;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: `${space.md}px`,
        py: `${space.sm}px`,
        px: negative ? `${space.sm}px` : 0,
        mx: negative ? `-${space.sm}px` : 0,
        borderRadius: negative ? `${radii.panel}px` : 0,
        borderTop: first ? 'none' : hairline,
        bgcolor: negative ? statusColors.warningWash : 'transparent',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: type.body.fontSize,
            fontWeight: 500,
            color: colors.ink,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={sku.sku}
        >
          {sku.sku}
        </Typography>
        <Box sx={{ mt: '4px' }}>
          <ChannelChip name={sku.channel} />
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: 16,
          lineHeight: '20px',
          fontWeight: 600,
          color: negative ? statusColors.warning : statusColors.positive,
          flexShrink: 0,
          ...tabularNums,
        }}
      >
        {formatPercent(sku.marginPct)}
      </Typography>
    </Box>
  );
};

const SkuProfitability: React.FC<{ skus: SkuRow[]; startDelay?: number }> = ({ skus, startDelay = 0 }) => {
  const reduce = useReducedMotion();

  if (!skus.length) {
    return <Typography sx={{ ...type.body, color: colors.grey500 }}>No SKU data for this period.</Typography>;
  }

  const winners = skus.filter((s) => !s.isKillList).sort((a, b) => b.marginPct - a.marginPct);
  const killed = skus.filter((s) => s.isKillList).sort((a, b) => a.marginPct - b.marginPct);

  const killChannels = [...new Set(killed.map((s) => s.channel))];
  const allQuickCommerce = killChannels.length > 0 && killChannels.every((c) => QUICK_COMMERCE.has(c));
  const n = killed.length;
  const noun = n === 1 ? 'SKU is' : 'SKUs are';
  const where = allQuickCommerce
    ? `all on quick-commerce channels (${killChannels.join(', ')})`
    : `across ${killChannels.join(', ')}`;

  const GroupHeader: React.FC<{ label: string; count: number; warn?: boolean }> = ({ label, count, warn }) =>
    warn ? (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${space.xs}px`,
          bgcolor: statusColors.warningWash,
          color: statusColors.warning,
          borderRadius: `${radii.chip}px`,
          px: `${space.sm}px`,
          py: '4px',
        }}
      >
        <WarningAmberOutlined sx={{ fontSize: 15, color: 'inherit' }} />
        <Typography sx={{ ...type.label, color: 'inherit' }}>
          {label} · {count} {count === 1 ? 'SKU' : 'SKUs'}
        </Typography>
      </Box>
    ) : (
      <Typography sx={{ ...type.label, color: colors.grey700 }}>
        {label} · {count} {count === 1 ? 'SKU' : 'SKUs'}
      </Typography>
    );

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        component={motion.div}
        variants={reduce ? undefined : containerV(startDelay)}
        initial={reduce ? false : 'hidden'}
        animate={reduce ? false : 'show'}
      >
        {/* Top performers */}
        {winners.length > 0 && (
          <Box component={motion.div} variants={reduce ? undefined : rowVariant}>
            <GroupHeader label="Top performers" count={winners.length} />
          </Box>
        )}
        {winners.map((s, i) => (
          <Box component={motion.div} variants={reduce ? undefined : rowVariant} key={s.sku}>
            <SkuLine sku={s} first={i === 0} />
          </Box>
        ))}

        {/* Kill list */}
        {killed.length > 0 && (
          <>
            <Box component={motion.div} variants={reduce ? undefined : rowVariant} sx={{ mt: `${space.lg}px` }}>
              <GroupHeader label="Kill list" count={killed.length} warn />
            </Box>
            {killed.map((s, i) => (
              <Box component={motion.div} variants={reduce ? undefined : rowVariant} key={s.sku}>
                <SkuLine sku={s} first={i === 0} />
              </Box>
            ))}

            {/* Computed summary */}
            <Box
              component={motion.div}
              variants={reduce ? undefined : rowVariant}
              sx={{ mt: `${space.lg}px`, pt: `${space.lg}px`, borderTop: hairline }}
            >
              <Typography sx={{ ...type.body, color: colors.grey700 }}>
                <Box component="span" sx={{ fontWeight: 600, color: colors.ink, ...tabularNums }}>
                  {n} {noun}
                </Box>{' '}
                selling below cost — {where}.
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SkuProfitability;
