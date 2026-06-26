// B2B Disputes — agent-drafted claims, a one-click "file all" moment, the
// pipeline, and the high-value claims table. All figures come from the mock
// barrel (src/b2b/mock). Monochrome + one accent (#7A5DBF): accent is used ONLY
// on the primary "File all" action and on Recovered amounts. Pipeline stages and
// statuses are never colour-coded — distinguished by weight, grey fills, square
// hairline borders. Square corners, hairline borders, tabular figures.
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { CheckOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, PageTitle } from '../components/primitives';
import { formatRupees } from '../lib/format';
import {
  headlineByKey,
  highValueDisputes,
  disputePipeline,
  disputeAvgTurnaroundDays,
  type Dispute,
  type DisputeStatus,
} from '../mock';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const GRID = '116px 96px minmax(160px, 1fr) 132px 168px 112px';
const INK_SUB = 'rgba(255, 255, 255, 0.66)';
const INK_HAIRLINE = 'rgba(255, 255, 255, 0.24)';
const FILE_DELAY_MS = 1700;

type Phase = 'idle' | 'filing' | 'filed';

// Pipeline stage markers — monochrome, distinguished by greyscale fill only.
const STAGE_MARKER: Record<string, { bgcolor: string; border?: string }> = {
  Drafted: { bgcolor: colors.paper, border: hairline },
  Filed: { bgcolor: colors.grey200 },
  'In review': { bgcolor: colors.grey500 },
  Recovered: { bgcolor: colors.ink },
};

// Right-aligned monochrome urgency label.
const UrgencyLabel: React.FC<{ kind: 'Urgent' | 'On track' | 'Closed' }> = ({ kind }) => {
  const urgent = kind === 'Urgent';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: urgent ? colors.paper : colors.grey100,
        color: urgent ? colors.ink : colors.grey700,
        fontWeight: urgent ? 600 : 500,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: `${space.sm}px`,
        py: '3px',
      }}
    >
      {kind}
    </Box>
  );
};

const Disputes: React.FC = () => {
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const filed = phase === 'filed';

  const recoverable = headlineByKey('recoverable');
  const recoveredYtd = headlineByKey('recoveredYtd');

  const handleFileAll = () => {
    if (phase !== 'idle') return;
    if (reduce) {
      setPhase('filed');
      return;
    }
    setPhase('filing');
    timer.current = setTimeout(() => setPhase('filed'), FILE_DELAY_MS);
  };

  // Local pipeline counts — Drafted collapses into Filed once filed.
  const counts: { stage: DisputeStatus; count: number }[] = [
    { stage: 'Drafted', count: filed ? 0 : disputePipeline.drafted },
    { stage: 'Filed', count: filed ? disputePipeline.filed + disputePipeline.drafted : disputePipeline.filed },
    { stage: 'In review', count: disputePipeline.inReview },
    { stage: 'Recovered', count: disputePipeline.recovered },
  ];

  const rows = [...highValueDisputes].sort((a, b) => b.amount - a.amount);
  // Drafted rows relabel to Filed once the batch is filed (local UI only).
  const displayStatus = (d: Dispute): DisputeStatus =>
    filed && d.status === 'Drafted' ? 'Filed' : d.status;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <PageTitle>Disputes</PageTitle>

      {/* ── AGENT BANNER (ink hero card) ─────────────────────── */}
      <Box
        sx={{
          bgcolor: colors.ink,
          color: colors.paper,
          p: `${space.xxl}px`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: `${space.xl}px`,
          flexWrap: 'wrap',
          mb: `${space.xl}px`,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              border: `1px solid ${INK_HAIRLINE}`,
              color: INK_SUB,
              ...type.label,
              px: `${space.sm}px`,
              py: '3px',
              mb: `${space.lg}px`,
            }}
          >
            Agent ready
          </Box>

          <AnimatePresence mode="wait" initial={false}>
            <Box
              component={motion.div}
              key={filed ? 'filed' : 'idle'}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Typography sx={{ fontSize: 20, lineHeight: '28px', fontWeight: 600, ...tabularNums }}>
                {filed
                  ? `${disputePipeline.drafted} disputes filed`
                  : `${disputePipeline.drafted} disputes drafted, worth ${recoverable.display}`}
              </Typography>
              <Typography sx={{ mt: `${space.sm}px`, fontSize: type.body.fontSize, color: INK_SUB, maxWidth: 560 }}>
                {filed
                  ? 'Nex will track each ticket and re-file before any window lapses.'
                  : "Nex wrote each claim in the platform's format with evidence attached. File in one click."}
              </Typography>
            </Box>
          </AnimatePresence>
        </Box>

        {/* Right: action + stat */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: `${space.md}px` }}>
          {phase === 'filed' ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: `${space.sm}px`,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: colors.paper,
                px: `${space.xl}px`,
                py: `${space.md}px`,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <CheckOutlined sx={{ fontSize: 18 }} /> Filed
            </Box>
          ) : (
            <Button
              disableElevation
              disabled={phase === 'filing'}
              onClick={handleFileAll}
              sx={{
                borderRadius: 0,
                bgcolor: colors.accent,
                color: colors.paper,
                fontSize: 13,
                fontWeight: 600,
                px: `${space.xl}px`,
                py: `${space.md}px`,
                '&:hover': { bgcolor: colors.accentHover },
                '&.Mui-disabled': { bgcolor: colors.accent, color: colors.paper, opacity: 0.85 },
              }}
            >
              {phase === 'filing' ? (
                <>
                  <CircularProgress size={15} thickness={5} sx={{ color: colors.paper, mr: `${space.sm}px` }} />
                  Filing…
                </>
              ) : (
                `File all ${disputePipeline.drafted} →`
              )}
            </Button>
          )}

          <Typography sx={{ fontSize: 13, color: INK_SUB, textAlign: 'right', ...tabularNums }}>
            Recovered this year:{' '}
            <Box component="span" sx={{ color: colors.accent, fontWeight: 600 }}>
              {recoveredYtd.display}
            </Box>{' '}
            · avg claim turnaround {disputeAvgTurnaroundDays} days
          </Typography>
        </Box>
      </Box>

      {/* ── PIPELINE ROW ─────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xl}px`,
        }}
      >
        {counts.map(({ stage, count }) => (
          <Box key={stage} sx={{ ...cardSx, p: `${space.xl}px` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: `${space.md}px` }}>
              <Box sx={{ width: 10, height: 10, ...STAGE_MARKER[stage] }} />
              <Typography sx={{ ...type.label, color: colors.grey700 }}>{stage}</Typography>
            </Box>
            <Typography
              component={motion.div}
              key={count}
              initial={reduce ? false : { opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
              sx={{ ...type.statValue, color: colors.ink }}
            >
              {count}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── HIGH-VALUE CLAIMS TABLE (scrolls horizontally on narrow viewports) ── */}
      <Box sx={{ ...cardSx, overflowX: 'auto' }}>
       <Box sx={{ minWidth: 760 }}>
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
          {(['ID', 'Channel', 'Reason', 'Amount', 'Status', ''] as const).map((h, i) => (
            <ColumnLabel key={i} align={i === 3 ? 'right' : 'left'}>
              {h}
            </ColumnLabel>
          ))}
        </Box>

        {rows.map((d, idx) => {
          const status = displayStatus(d);
          const recovered = status === 'Recovered';
          const urgency: 'Urgent' | 'On track' | 'Closed' = recovered ? 'Closed' : d.urgent ? 'Urgent' : 'On track';
          return (
            <Box
              key={d.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: GRID,
                alignItems: 'center',
                gap: `${space.lg}px`,
                px: `${space.xl}px`,
                minHeight: 56,
                py: `${space.md}px`,
                borderBottom: idx < rows.length - 1 ? hairline : 'none',
                transition: 'background-color 0.12s ease',
                '&:hover': { bgcolor: colors.grey100 },
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: 12.5, color: colors.grey700, ...tabularNums }}>
                {d.id}
              </Typography>
              <ChannelTag name={d.channel} />
              <Typography
                sx={{ fontSize: type.body.fontSize, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {d.reason}
              </Typography>
              <Typography
                sx={{
                  textAlign: 'right',
                  fontSize: type.body.fontSize,
                  fontWeight: 600,
                  color: recovered ? colors.accent : colors.ink, // Recovered amounts may use accent
                  ...tabularNums,
                }}
              >
                {formatRupees(d.amount)}
              </Typography>
              {/* Status with days remaining */}
              {recovered ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.xs}px` }}>
                  <CheckOutlined sx={{ fontSize: 16, color: colors.accent }} />
                  <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink }}>Recovered</Typography>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: type.body.fontSize,
                    color: colors.ink,
                    fontWeight: d.urgent ? 600 : 400,
                    ...tabularNums,
                  }}
                >
                  {status} · {d.windowDaysRemaining}d
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <UrgencyLabel kind={urgency} />
              </Box>
            </Box>
          );
        })}
       </Box>
      </Box>
    </Box>
  );
};

export default Disputes;
