import React from 'react';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { motion, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon }) => {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const [displayValue, setDisplayValue] = React.useState('0');

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const motionValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());
  
  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplayValue(latest);
  });

  return (
    <Paper
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      sx={{ p: 3, bgcolor: '#1F2937', color: '#F9FAFB', border: '1px solid #374151' }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: '#9CA3AF' }}>
          {title}
        </Typography>
        <Box sx={{ color: '#14B8A6' }}>{icon}</Box>
      </Stack>
      <Typography variant="h4" component="span" sx={{ display: 'block' }}>
        {displayValue.get()}
      </Typography>
      <Typography variant="caption" color={change >= 0 ? '#22C55E' : '#EF4444'}>
        {change >= 0 ? '+' : ''}
        {change}%
      </Typography>
    </Paper>
  );
};

export default KPICard; 