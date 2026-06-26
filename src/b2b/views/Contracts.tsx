// B2B Contracts — the time-versioned Blinkit rate card and the contract-breach
// callout. All figures from the mock barrel (src/b2b/mock). Monochrome + one
// accent (#7A5DBF): accent appears ONLY on the "Extracted…" tag, the overcharged
// amount, and the breach card's primary action. The flagged rate-card line reads
// as wrong through weight, grey fill, and an alert glyph — never colour. Square
// corners, hairline borders, tabular figures.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { CheckOutlined, ErrorOutlineOutlined } from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, StatTile } from '../components/primitives';
import { formatRupees } from '../lib/format';
import { blinkitRateCard, blinkitRateCardMeta, blinkitBreach } from '../mock';

const DISPUTES_ROUTE = '/b2b/disputes';

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <PageTitle>Contracts</PageTitle>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: `${space.xl}px`,
          alignItems: 'start',
        }}
      >
        {/* ── LEFT: Blinkit rate card ─────────────────────────── */}
        <Box sx={cardSx}>
          <Box sx={{ p: `${space.xl}px`, borderBottom: hairline }}>
            <SectionTitle sx={{ mb: `${space.sm}px` }}>Blinkit rate card</SectionTitle>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: colors.accentWash,
                color: colors.accent,
                ...type.label,
                px: `${space.sm}px`,
                py: '3px',
              }}
            >
              {blinkitRateCardMeta.source}
            </Box>
          </Box>

          {blinkitRateCard.map((line, i) => {
            const last = i === blinkitRateCard.length - 1;
            return (
              <Box
                key={line.code}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: `${space.lg}px`,
                  px: `${space.xl}px`,
                  py: `${space.md}px`,
                  borderBottom: last ? 'none' : hairline,
                  bgcolor: line.authorised ? 'transparent' : colors.grey100,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, minWidth: 0 }}>
                  {line.authorised ? (
                    <CheckOutlined sx={{ fontSize: 16, color: colors.grey500, flexShrink: 0 }} />
                  ) : (
                    <ErrorOutlineOutlined sx={{ fontSize: 16, color: colors.ink, flexShrink: 0 }} />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: type.body.fontSize, fontWeight: line.authorised ? 400 : 600, color: colors.ink }}
                    >
                      {line.label}
                    </Typography>
                    {line.note && (
                      <Typography sx={{ fontSize: 13, color: colors.grey700 }}>— {line.note}</Typography>
                    )}
                  </Box>
                </Box>
                <Typography
                  sx={{
                    flexShrink: 0,
                    fontSize: type.body.fontSize,
                    fontWeight: line.authorised ? 400 : 600,
                    color: colors.ink,
                    ...tabularNums,
                  }}
                >
                  {line.contracted}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* ── RIGHT: breach callout ───────────────────────────── */}
        <Box sx={{ ...cardSx, p: `${space.xl}px` }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              border: hairline,
              color: colors.grey700,
              ...type.label,
              px: `${space.sm}px`,
              py: '3px',
              mb: `${space.lg}px`,
            }}
          >
            Contract breach detected
          </Box>

          <Typography sx={{ fontSize: 20, lineHeight: '28px', fontWeight: 600, color: colors.ink }}>
            A {blinkitBreach.feePct}% ‘{blinkitBreach.feeLabel}’ is being charged with no signed basis.
          </Typography>

          <Typography sx={{ mt: `${space.md}px`, fontSize: type.body.fontSize, color: colors.grey700, lineHeight: '22px' }}>
            Nex read the signed Blinkit agreement and every email amendment and built a time-versioned rate card.
            This fee first appeared on settlements from {blinkitBreach.since}, across {blinkitBreach.skuCount} SKUs,
            matching nothing agreed to.
          </Typography>

          <Box sx={{ display: 'flex', gap: `${space.lg}px`, mt: `${space.xl}px` }}>
            <StatTile
              label="Overcharged"
              value={<Box component="span" sx={{ color: colors.accent }}>{formatRupees(blinkitBreach.amount)}</Box>}
            />
            <StatTile label="Dispute window" value={`${blinkitBreach.windowDaysRemaining} days`} />
          </Box>

          <Button
            fullWidth
            disableElevation
            onClick={() => navigate(DISPUTES_ROUTE)}
            sx={{
              mt: `${space.xl}px`,
              borderRadius: 0,
              bgcolor: colors.accent,
              color: colors.paper,
              fontSize: 13,
              fontWeight: 600,
              py: `${space.md}px`,
              '&:hover': { bgcolor: colors.accentHover },
            }}
          >
            File this dispute now
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Contracts;
