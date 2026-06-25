// Top-level B2C / B2B segmented toggle. The single shared surface between the
// two products. Square, monochrome, active side = ink fill. Route-based:
// B2C -> existing app at '/', B2B -> '/b2b'. Default is B2C.
//
// Self-contained styling (no B2B theme dependency) because it also renders
// inside the B2C app.
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const INK = '#111111';
const HAIRLINE = '#E5E7EB';
const GREY700 = '#6B7280';

const ProductToggle: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isB2B = location.pathname.startsWith('/b2b');

  const segment = (label: string, active: boolean, onClick: () => void) => (
    <Box
      role="tab"
      aria-selected={active}
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
        userSelect: 'none',
        borderRadius: 0,
        bgcolor: active ? INK : 'transparent',
        color: active ? '#FFFFFF' : GREY700,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': active ? undefined : { color: INK, bgcolor: '#F5F5F5' },
      }}
    >
      {label}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      {segment('B2C', !isB2B, () => navigate('/'))}
      <Box sx={{ width: '1px', bgcolor: HAIRLINE }} />
      {segment('B2B', isB2B, () => navigate('/b2b'))}
    </Box>
  );
};

export default ProductToggle;
