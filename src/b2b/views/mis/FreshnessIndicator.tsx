// "Live · updated just now" freshness signal for the MIS header — sells the
// real-time positioning. A subtle accent dot (square, per the design language)
// with a gentle pulse (disabled under reduced-motion) + muted caption.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, type, space } from '../../theme/b2bTokens';

const FreshnessIndicator: React.FC = () => {
  const reduce = useReducedMotion();
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: `${space.sm}px` }}>
      <Box
        component={motion.span}
        aria-hidden
        animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
        transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        sx={{ width: 8, height: 8, bgcolor: colors.accent, flexShrink: 0 }}
      />
      <Typography sx={{ ...type.label, color: colors.grey700 }}>Live · updated just now</Typography>
    </Box>
  );
};

export default FreshnessIndicator;
