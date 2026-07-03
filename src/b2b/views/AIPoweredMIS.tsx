// AI-Powered MIS (Tata 1mg demo). Reads entirely from misData (frontend-only).
// Composes five regions — reconciliation banner, P&L waterfall, channel
// performance, SKU profitability, scripted Ask-your-data chat — into one page.
//
// Load choreography: a four-beat reveal orchestrated here (not per-component).
//   Beat 1  header + reconciliation banner (the trust anchor lands first)
//   Beat 2  P&L waterfall
//   Beat 3  Channel Performance + SKU Profitability (together)
//   Beat 4  Ask-your-data rail
// Each region is wrapped in a framer-motion "beat" with an explicit delay; the
// bar/row staggers inside the analytics regions receive a matching `startDelay`
// so they fill in on their beat rather than at raw mount. The whole sequence
// runs once per session (module `hasPlayed` flag) and is skipped entirely under
// prefers-reduced-motion — everything just appears.
import React from 'react';
import { Box } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { space, shell } from '../theme/b2bTokens';
import { PageTitle } from '../components/primitives';
import { misData } from '../mock';
import PeriodSelector from './mis/PeriodSelector';
import FreshnessIndicator from './mis/FreshnessIndicator';
import ReconciliationBanner from './mis/ReconciliationBanner';
import PlaceholderRegion from './mis/PlaceholderRegion';
import PnLWaterfall from './mis/PnLWaterfall';
import ChannelPerformance from './mis/ChannelPerformance';
import SkuProfitability from './mis/SkuProfitability';
import AskYourData from './mis/AskYourData';

// Single vertical rhythm token for the gaps between every region.
const REGION_GAP = shell.gridGutter;

// Beat delays (seconds). Sequence completes ~1.1s, under the 1.2s budget.
const BEAT = { b1: 0, b2: 0.45, b3: 0.63, b4: 0.8 } as const;

// Plays once per session so navigating away and back doesn't replay the reveal.
let hasPlayed = false;

const AIPoweredMIS: React.FC = () => {
  const reduce = useReducedMotion();
  const firstPlay = React.useRef(!hasPlayed);
  React.useEffect(() => {
    hasPlayed = true;
  }, []);
  const play = firstPlay.current && !reduce;

  // Motion props for a region's beat wrapper (fade/slide at its delay), or a
  // no-op when the sequence shouldn't play.
  const beat = (delay: number) =>
    play
      ? {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: 'easeOut' as const, delay },
        }
      : { initial: false as const };

  const sd = (delay: number) => (play ? delay : 0);

  return (
    <Box>
      {/* Beat 1 — header row */}
      <Box
        component={motion.div}
        {...beat(BEAT.b1)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: `${space.lg}px`,
          mb: `${REGION_GAP}px`,
        }}
      >
        <PageTitle>AI-Powered MIS</PageTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.lg}px`, flexWrap: 'wrap' }}>
          <FreshnessIndicator />
          <PeriodSelector period={misData.period} />
        </Box>
      </Box>

      {/* Beat 1 — reconciliation completeness banner (hero / trust anchor) */}
      <Box component={motion.div} {...beat(BEAT.b1)}>
        <ReconciliationBanner data={misData.reconciliation} />
      </Box>

      {/* Regions + AI rail */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' },
          gap: `${REGION_GAP}px`,
          alignItems: 'start',
          mt: `${REGION_GAP}px`,
        }}
      >
        {/* Main analytics column */}
        <Box sx={{ display: 'grid', gap: `${REGION_GAP}px`, minWidth: 0 }}>
          {/* Beat 2 — P&L waterfall */}
          <Box component={motion.div} {...beat(BEAT.b2)} sx={{ minWidth: 0 }}>
            <PlaceholderRegion id="mis-pnl" title="Profit & Loss" minBodyHeight={0}>
              <PnLWaterfall lines={misData.pnl} priorMonth={misData.priorMonth} startDelay={sd(BEAT.b2)} />
            </PlaceholderRegion>
          </Box>

          {/* Beat 3 — Channel Performance + SKU Profitability together */}
          <Box
            component={motion.div}
            {...beat(BEAT.b3)}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
              gap: `${REGION_GAP}px`,
              alignItems: 'start',
              minWidth: 0,
            }}
          >
            <PlaceholderRegion id="mis-channels" title="Channel Performance" minBodyHeight={0}>
              <ChannelPerformance channels={misData.channels} startDelay={sd(BEAT.b3)} />
            </PlaceholderRegion>
            <PlaceholderRegion id="mis-skus" title="SKU Profitability" minBodyHeight={0}>
              <SkuProfitability skus={misData.skus} startDelay={sd(BEAT.b3)} />
            </PlaceholderRegion>
          </Box>
        </Box>

        {/* Beat 4 — Ask-your-data rail (sticky on lg lives on the beat wrapper so
            it can travel within the tall grid row) */}
        <Box
          component={motion.div}
          {...beat(BEAT.b4)}
          sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: `${shell.canvasPaddingTop}px` } }}
        >
          <PlaceholderRegion id="mis-ask" title="Ask your data" minBodyHeight={0}>
            <AskYourData />
          </PlaceholderRegion>
        </Box>
      </Box>
    </Box>
  );
};

export default AIPoweredMIS;
