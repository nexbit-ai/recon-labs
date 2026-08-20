import React from 'react';
import { Box, Typography } from '@mui/material';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import { colors, hairline, space, tabularNums } from '../theme/b2bTokens';
import { Pressable, ChannelTag } from './primitives';
import { StatusBadge } from './StatusBadge';
import { formatRupees } from '../lib/format';
import type { ActionItem } from '../mock/types';

interface DiscrepancyListProps {
  discrepancies: ActionItem[];
  onIssueClick: (issue: ActionItem) => void;
}

export const DiscrepancyList: React.FC<DiscrepancyListProps> = ({ discrepancies, onIssueClick }) => {
  return (
    <Box sx={{ border: hairline }}>
      {discrepancies.length === 0 ? (
        <Box sx={{ p: `${space.xl}px`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 14, color: colors.grey500 }}>No unresolved discrepancies.</Typography>
        </Box>
      ) : (
        discrepancies.map((issue, i) => (
          <Pressable
            key={issue.id}
            onClick={() => onIssueClick(issue)}
            sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 120px 140px 32px',
              gap: `${space.md}px`,
              alignItems: 'center',
              p: `${space.lg}px`,
              borderBottom: i < discrepancies.length - 1 ? hairline : 'none',
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
                {issue.id} — {issue.issue}
              </Typography>
            </Box>
            <Box>
              <ChannelTag name={issue.channel} />
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#991B1B', textAlign: 'right', ...tabularNums }}>
              {formatRupees(issue.amount)}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <StatusBadge status={issue.status} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <KeyboardArrowRightOutlined sx={{ fontSize: 16, color: colors.grey500 }} />
            </Box>
          </Pressable>
        ))
      )}
    </Box>
  );
};
