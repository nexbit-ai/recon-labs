import React from 'react';
import { Box } from '@mui/material';
import { colors, hairline, space } from '../theme/b2bTokens';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isMatched = status === 'Matched' || status === 'Resolved' || status === 'Clean';
  const isException = 
    status === 'Exception' || 
    status === 'Needs Review' || 
    status === 'Short paid' || 
    status === 'Disputed' || 
    status === 'Over-deducted' ||
    status === 'Dispute ready' ||
    status === 'Dispute initiated';
    
  const isPending = 
    status === 'Pending' || 
    status === 'Follow-up sent' || 
    status === 'Pending GRN' ||
    status === 'Scheduled';

  let bgcolor: string = colors.grey100;
  let color: string = colors.ink;
  
  if (isException) {
    bgcolor = '#FEE2E2';
    color = '#991B1B';
  } else if (isMatched) {
    bgcolor = '#ECFDF5';
    color = '#065F46';
  } else if (isPending) {
    bgcolor = '#FEF3C7';
    color = '#92400E';
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: hairline, px: `${space.sm}px`, py: '3px',
        bgcolor,
        color,
        fontWeight: 600, fontSize: 11, letterSpacing: '0.04em',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}
    >
      {status}
    </Box>
  );
};
