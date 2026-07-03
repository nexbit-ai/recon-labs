// Labeled empty region for the MIS scaffold. Renders a section header over an
// empty, height-reserved card body so the skeleton already reads as the final
// layout. No data/charts inside yet — later steps fill `children`. Uses the same
// card surface as the reconciliation banner so the skeleton is cohesive.
import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { colors, hairline, type, space } from '../../theme/b2bTokens';
import { cardSx, SectionTitle } from '../../components/primitives';

interface PlaceholderRegionProps {
  /** Stable DOM id / reference handle for later steps. */
  id: string;
  title: string;
  /** Optional muted one-liner hinting what will render here. */
  hint?: string;
  /** Reserved body height so the scaffold hints the final layout. */
  minBodyHeight?: number;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

const PlaceholderRegion: React.FC<PlaceholderRegionProps> = ({
  id,
  title,
  hint,
  minBodyHeight = 220,
  sx,
  children,
}) => (
  <Box
    id={id}
    data-region={id}
    sx={{ ...cardSx, display: 'flex', flexDirection: 'column', minWidth: 0, ...sx }}
  >
    <Box sx={{ px: `${space.xl}px`, py: `${space.lg}px`, borderBottom: hairline }}>
      <SectionTitle>{title}</SectionTitle>
    </Box>
    <Box
      sx={{
        flex: 1,
        minHeight: minBodyHeight,
        p: `${space.xl}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children ??
        (hint ? (
          <Typography sx={{ ...type.label, color: colors.grey500, textAlign: 'center' }}>{hint}</Typography>
        ) : null)}
    </Box>
  </Box>
);

export default PlaceholderRegion;
