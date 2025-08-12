import React from 'react';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { motion, useSpring, useTransform } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value}) => {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const displayValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());

  return (
    <Paper
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        color: '#0f172a', 
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" component="span" sx={{ display: 'block' }}>
        {displayValue.get()}
      </Typography>
      {/* Removed percentage display as requested */}
    </Paper>
  );
};

export default KPICard; 