// Generic section placeholder — renders only the page title for now.
// View content is built in later steps; this keeps every nav destination live.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, type } from '../theme/b2bTokens';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <Box>
    <Typography component="h1" sx={{ ...type.pageTitle, color: colors.ink }}>
      {title}
    </Typography>
    <Typography sx={{ ...type.body, color: colors.grey500, mt: 1 }}>
      No content yet.
    </Typography>
  </Box>
);

export default Placeholder;
