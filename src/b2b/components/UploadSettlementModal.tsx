// Upload settlement modal — frontend-only. Runs a staged 4-step "analysis"
// then shows a findings summary. No file picker, no API; all local state.
// Monochrome + one accent (#7A5DBF): accent on the header tile, the step checks,
// and the primary action. Square corners, hairline borders, no shadow.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { CloseOutlined, CheckOutlined, AutoAwesomeOutlined, ErrorOutlineOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { StatTile, Pressable } from './primitives';

const OVERVIEW_ROUTE = '/b2b/overview';
const STEP_MS = 700;

const STEPS = [
  'Reading Blinkit_settlement_W24.csv…',
  'Recognising format (unseen layout) · mapping 11 columns…',
  'Classifying 9 deduction types · matching 312 lines to GRNs…',
  'Checking each deduction against your rate card…',
];

const STATS = [
  { value: '312', label: 'Lines matched' },
  { value: '9', label: 'Fee types' },
  { value: '3', label: 'Anomalies' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const UploadSettlementModal: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState(0); // count of completed steps
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setStep(0);
    setDone(false);
    if (reduce) {
      setStep(STEPS.length);
      setDone(true);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setStep(i);
      if (i >= STEPS.length) {
        setDone(true);
        return;
      }
      timer = setTimeout(tick, STEP_MS);
    };
    timer = setTimeout(tick, STEP_MS);
    return () => clearTimeout(timer);
  }, [open, reduce]);

  const handleReview = () => {
    onClose();
    navigate(OVERVIEW_ROUTE);
  };

  return (
    <AnimatePresence>
      {open && (
        <Box
          component={motion.div}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            bgcolor: 'rgba(17, 17, 17, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: `${space.xl}px`,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: 480,
              maxWidth: '100%',
              bgcolor: colors.paper,
              border: hairline,
              boxShadow: '0 1px 0 rgba(17,17,17,0.04)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: `${space.md}px`,
                p: `${space.xl}px`,
                borderBottom: hairline,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  bgcolor: colors.accentWash,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeOutlined sx={{ fontSize: 18, color: colors.accent }} />
              </Box>
              <Typography sx={{ flex: 1, ...type.sectionTitle, color: colors.ink }}>
                {done ? 'Analysis complete' : 'Analysing settlement'}
              </Typography>
              <Pressable
                ariaLabel="Close"
                onClick={onClose}
                sx={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.grey700,
                  '&:hover': { bgcolor: colors.grey100, color: colors.ink },
                }}
              >
                <CloseOutlined sx={{ fontSize: 18 }} />
              </Pressable>
            </Box>

            {/* Body */}
            <Box sx={{ p: `${space.xl}px` }}>
              {/* Steps */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
                {STEPS.map((label, i) => {
                  const isDone = i < step;
                  const isActive = i === step && !done;
                  return (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isDone ? 'none' : hairline,
                          bgcolor: isDone ? colors.accentWash : 'transparent',
                        }}
                      >
                        {isDone ? (
                          <CheckOutlined sx={{ fontSize: 14, color: colors.accent }} />
                        ) : isActive ? (
                          <CircularProgress size={12} thickness={5} sx={{ color: colors.ink }} />
                        ) : null}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: type.body.fontSize,
                          color: isDone || isActive ? colors.ink : colors.grey500,
                          fontWeight: isActive ? 500 : 400,
                          ...tabularNums,
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Done state */}
              <AnimatePresence>
                {done && (
                  <Box
                    component={motion.div}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    sx={{ mt: `${space.xl}px` }}
                  >
                    {/* Stat tiles */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${space.md}px` }}>
                      {STATS.map((s) => (
                        <StatTile key={s.label} label={s.label} value={s.value} />
                      ))}
                    </Box>

                    {/* Callout strip */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: `${space.md}px`,
                        bgcolor: colors.grey100,
                        p: `${space.lg}px`,
                        mt: `${space.lg}px`,
                      }}
                    >
                      <ErrorOutlineOutlined sx={{ fontSize: 18, color: colors.ink, flexShrink: 0, mt: '1px' }} />
                      <Box>
                        <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                          ₹1.42L in questionable deductions
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '1px' }}>
                          incl. a ‘Storage Fee v2’ with no contractual basis
                        </Typography>
                      </Box>
                    </Box>

                    {/* Primary action */}
                    <Button
                      fullWidth
                      disableElevation
                      onClick={handleReview}
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
                      Review findings →
                    </Button>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default UploadSettlementModal;
