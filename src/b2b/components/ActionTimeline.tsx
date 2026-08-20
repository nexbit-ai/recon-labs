import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, hairline, space, tabularNums } from '../theme/b2bTokens';
import { StatusBadge } from './StatusBadge';
import type { IssueAction } from '../mock/types';

interface ActionTimelineProps {
  history: IssueAction[];
}

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ history }) => {
  return (
    <Box sx={{ mt: `${space.xl}px` }}>
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: `${space.md}px` }}>
        Action Timeline
      </Typography>
      <Box sx={{ border: hairline }}>
        {history.map((h, i) => {
          const dateStr = new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          return (
            <Box
              key={`${h.date}-${i}`}
              sx={{
                display: 'flex',
                p: `${space.md}px ${space.lg}px`,
                borderBottom: i < history.length - 1 ? hairline : 'none',
                alignItems: 'center',
                gap: `${space.md}px`,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, minWidth: 60, ...tabularNums }}>
                {dateStr}
              </Typography>
              <Typography sx={{ fontSize: 13, color: colors.ink, flex: 1 }}>
                {h.action}
              </Typography>
              <Box sx={{ flexShrink: 0 }}>
                <StatusBadge status={h.status} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
