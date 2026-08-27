import React from 'react';
import { Box, Typography } from '@mui/material';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import { colors, hairline, space, tabularNums } from '../theme/b2bTokens';
import { Pressable, ChannelTag } from './primitives';
import { formatRupees } from '../lib/format';
import type { ChannelName } from '../mock/types';

interface ChannelCardProps {
  channel: ChannelName;
  model: string;
  expectedPayout: number;
  received: number;
  unsettled: number;
  issueCount: number;
  followUpCount: number;
  onClick: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  model,
  expectedPayout,
  received,
  unsettled,
  issueCount,
  followUpCount,
  onClick,
}) => {
  return (
    <Pressable
      onClick={onClick}
      sx={{
        border: hairline,
        p: `${space.lg}px`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          borderColor: colors.accent,
          bgcolor: colors.grey100,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: `${space.md}px` }}>
        <ChannelTag name={channel} />
        <Typography sx={{ fontSize: 11, color: colors.grey500 }}>{model}</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', mb: `${space.lg}px`, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Expected Payout</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(expectedPayout)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Received</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums }}>{formatRupees(received)}</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.lg}px`, p: `${space.lg}px`, borderTop: `1px solid ${colors.grey200}` }}>
        <Box>  <Typography sx={{ fontSize: 13, fontWeight: 600, color: unsettled > 0 ? '#991B1B' : colors.ink }}>Unsettled</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: unsettled > 0 ? '#991B1B' : colors.ink, ...tabularNums }}>
            {formatRupees(unsettled)}
          </Typography>
        </Box>
      </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: `${space.md}px`, borderTop: hairline }}>
        <Typography sx={{ fontSize: 12, color: colors.grey700 }}>
          {issueCount === 0 && followUpCount === 0 ? 'Matched & Clean' : (
            <>
              {issueCount > 0 ? `${issueCount} issue${issueCount > 1 ? 's' : ''}` : ''}
              {issueCount > 0 && followUpCount > 0 ? ' · ' : ''}
              {followUpCount > 0 ? `${followUpCount} follow-up${followUpCount > 1 ? 's' : ''} pending` : ''}
            </>
          )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: colors.accent }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mr: '2px' }}>Ledger</Typography>
          <KeyboardArrowRightOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Box>
    </Pressable>
  );
};
