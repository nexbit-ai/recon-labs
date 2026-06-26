// Generic section placeholder — renders only the page title. Kept as the router
// fallback; all six sections now have real views.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, type } from '../theme/b2bTokens';
import { PageTitle } from '../components/primitives';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <Box>
    <PageTitle>{title}</PageTitle>
    <Typography sx={{ ...type.body, color: colors.grey500 }}>No content yet.</Typography>
  </Box>
);

export default Placeholder;
