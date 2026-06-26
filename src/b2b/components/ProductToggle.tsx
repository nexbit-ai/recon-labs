// Top-level B2C / B2B segmented toggle. The single shared surface between the
// two products. Square, monochrome, active side = ink fill. Route-based:
// B2C -> existing app at '/', B2B -> '/b2b'. Default is B2C.
//
// Colours come from the shared b2b tokens (plain constants — no theme/runtime
// dependency), so it renders identically inside the B2C app.
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { colors } from '../theme/b2bTokens';
import { Pressable } from './primitives';

const ProductToggle: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isB2B = location.pathname.startsWith('/b2b');

  const segment = (label: string, active: boolean, onClick: () => void) => (
    <Pressable
      role="tab"
      selected={active}
      onClick={active ? undefined : onClick}
      sx={{
        px: 1.5,
        height: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: active ? 'default' : 'pointer',
        bgcolor: active ? colors.ink : 'transparent',
        color: active ? colors.paper : colors.grey700,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': active ? undefined : { color: colors.ink, bgcolor: colors.grey100 },
      }}
    >
      {label}
    </Pressable>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        border: `1px solid ${colors.grey200}`,
        overflow: 'hidden',
        bgcolor: colors.paper,
      }}
    >
      {segment('B2C', !isB2B, () => navigate('/'))}
      <Box sx={{ width: '1px', bgcolor: colors.grey200 }} />
      {segment('B2B', isB2B, () => navigate('/b2b'))}
    </Box>
  );
};

export default ProductToggle;
