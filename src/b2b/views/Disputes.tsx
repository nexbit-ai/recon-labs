// B2B Disputes - Cosmix 5-stage pipeline: Detected → Awaiting documents →
// Ready to dispute → Disputed → Resolved. With follow-up automation nudges.
// Monochrome + one accent (#7A5DBF).
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { CheckOutlined, NotificationsActiveOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, ChannelTag, ColumnLabel, PageTitle, SectionTitle } from '../components/primitives';
import { formatRupees } from '../lib/format';
import {
  headlineByKey,
  highValueDisputes,
  disputePipeline,
  disputeAvgTurnaroundDays,
  followUpNudges,
  type Dispute,
  type DisputeStatus,
  type NudgeStatus,
} from '../mock';

const GRID = '116px 130px minmax(160px, 1fr) 132px 168px 112px';
const INK_SUB = 'rgba(255, 255, 255, 0.66)';
const FILE_DELAY_MS = 1700;

type Phase = 'idle' | 'filing' | 'filed';

// Pipeline stage markers - monochrome, distinguished by greyscale fill only.
const STAGE_MARKER: Record<string, { bgcolor: string; border?: string }> = {
  Detected: { bgcolor: colors.paper, border: hairline },
  'Awaiting documents': { bgcolor: colors.grey200 },
  'Ready to dispute': { bgcolor: colors.grey500 },
  Disputed: { bgcolor: colors.ink },
  Resolved: { bgcolor: colors.accent },
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

const NudgeStatusChip: React.FC<{ status: NudgeStatus }> = ({ status }) => {
  const isSent = status === 'Sent';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: isSent ? colors.grey100 : colors.paper,
        color: isSent ? colors.grey700 : colors.ink,
        fontWeight: isSent ? 500 : 600,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: `${space.sm}px`,
        py: '3px',
      }}
    >
      {status}
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

  const readyToDisputeCount = disputePipeline.readyToDispute;

  const handleFileAll = () => {
    if (phase !== 'idle') return;
    if (reduce) {
      setPhase('filed');
      return;
    }
    setPhase('filing');
    timer.current = setTimeout(() => setPhase('filed'), FILE_DELAY_MS);
  };

  // Local pipeline counts - readyToDispute collapses into Disputed once filed.
  const counts: { stage: DisputeStatus; count: number }[] = [
    { stage: 'Detected', count: disputePipeline.detected },
    { stage: 'Awaiting documents', count: disputePipeline.awaitingDocuments },
    { stage: 'Ready to dispute', count: filed ? 0 : disputePipeline.readyToDispute },
    { stage: 'Disputed', count: filed ? disputePipeline.disputed + disputePipeline.readyToDispute : disputePipeline.disputed },
    { stage: 'Resolved', count: disputePipeline.resolved },
  ];

  const rows = [...highValueDisputes].sort((a, b) => b.amount - a.amount);
  // "Ready to dispute" rows relabel to "Disputed" once the batch is filed.
  const displayStatus = (d: Dispute): DisputeStatus =>
    filed && d.status === 'Ready to dispute' ? 'Disputed' : d.status;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >

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
                  ? `${readyToDisputeCount} disputes filed`
                  : `${readyToDisputeCount} disputes ready to file, worth ${recoverable.display}`}
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
                `File all ${readyToDisputeCount} →`
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
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
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

      {/* ── FOLLOW-UP AUTOMATION ─────────────────────────────── */}
      <Box sx={{ mb: `${space.xl}px` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.lg}px` }}>
          <NotificationsActiveOutlined sx={{ fontSize: 20, color: colors.accent }} />
          <SectionTitle>Follow-up automation</SectionTitle>
        </Box>
        <Box sx={{ ...cardSx }}>
          {followUpNudges.map((nudge, idx) => (
            <Box
              key={nudge.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: `${space.lg}px`,
                px: `${space.xl}px`,
                py: `${space.lg}px`,
                borderBottom: idx < followUpNudges.length - 1 ? hairline : 'none',
                transition: 'background-color 0.12s ease',
                '&:hover': { bgcolor: colors.grey100 },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: `${space.xs}px` }}>
                  <ChannelTag name={nudge.channel} />
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: hairline,
                      px: `${space.sm}px`,
                      py: '2px',
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: colors.grey700,
                    }}
                  >
                    {nudge.nudgeType}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, lineHeight: '20px' }}>
                  {nudge.message}
                </Typography>
                <Typography sx={{ fontSize: 13, color: colors.grey500, mt: '2px', ...tabularNums }}>
                  {nudge.relatedRef} · {nudge.daysSinceIssue} days since issue · {nudge.date}
                </Typography>
              </Box>
              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                <NudgeStatusChip status={nudge.status} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── HIGH-VALUE CLAIMS TABLE (scrolls horizontally on narrow viewports) ── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>High-value claims</SectionTitle>
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
            const resolved = status === 'Resolved';
            const urgency: 'Urgent' | 'On track' | 'Closed' = resolved ? 'Closed' : d.urgent ? 'Urgent' : 'On track';
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
                <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12.5, color: colors.grey700, ...tabularNums }}>
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
                    color: resolved ? colors.accent : colors.ink,
                    ...tabularNums,
                  }}
                >
                  {formatRupees(d.amount)}
                </Typography>
                {/* Status with days remaining */}
                {resolved ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.xs}px` }}>
                    <CheckOutlined sx={{ fontSize: 16, color: colors.accent }} />
                    <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink }}>Resolved</Typography>
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
