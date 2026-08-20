import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, hairline, space, tabularNums } from '../theme/b2bTokens';
import type { DisputePipeline } from '../mock/types';
import { formatCompactINR } from '../lib/format';

interface ActionPipelineProps {
  pipeline: DisputePipeline;
  recoveredAmount?: number;
}

export const ActionPipeline: React.FC<ActionPipelineProps> = ({ pipeline, recoveredAmount }) => {
  const stages = [
    { key: 'detected', label: 'Detected', count: pipeline.detected },
    { key: 'reviewed', label: 'Reviewed', count: pipeline.reviewed },
    { key: 'disputed', label: 'Dispute Initiated', count: pipeline.disputed },
    { key: 'followUp', label: 'Follow-up', count: pipeline.followUp },
    { key: 'resolved', label: 'Resolved', count: pipeline.resolved },
  ];

  return (
    <Box sx={{ border: hairline, display: 'flex', bgcolor: colors.paper }}>
      {stages.map((s, i) => (
        <Box
          key={s.key}
          sx={{
            flex: 1,
            p: `${space.md}px ${space.lg}px`,
            borderRight: i < stages.length - 1 ? hairline : 'none',
            position: 'relative',
          }}
        >
          <Typography sx={{ fontSize: 11, color: colors.grey500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: '4px' }}>
            {s.label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: `${space.sm}px` }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.ink, ...tabularNums }}>
              {s.count}
            </Typography>
            {s.key === 'resolved' && recoveredAmount !== undefined && (
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#065F46' }}>
                ({formatCompactINR(recoveredAmount)})
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
