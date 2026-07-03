// Period selector for the MIS header. Static/mock: it opens a native-looking
// menu of recent periods but selecting one only updates the label — the demo
// data is always June 2026. Square corners, hairline border, accent focus ring.
import React from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import { KeyboardArrowDownOutlined, CheckOutlined } from '@mui/icons-material';
import { colors, hairline, type, space, focusRingSx } from '../../theme/b2bTokens';

// A short trailing window of periods for the mock dropdown.
const RECENT_PERIODS = (current: string) =>
  [current, 'May 2026', 'April 2026', 'March 2026'].filter((p, i, a) => a.indexOf(p) === i);

const PeriodSelector: React.FC<{ period: string }> = ({ period }) => {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const [value, setValue] = React.useState(period);
  const open = Boolean(anchor);
  const periods = RECENT_PERIODS(period);

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${space.sm}px`,
          height: 36,
          px: `${space.md}px`,
          bgcolor: colors.paper,
          border: hairline,
          color: colors.ink,
          fontFamily: 'inherit',
          fontSize: type.body.fontSize,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background 0.15s ease',
          '&:hover': { bgcolor: colors.grey100 },
          ...focusRingSx,
        }}
      >
        {value}
        <KeyboardArrowDownOutlined
          sx={{ fontSize: 18, color: colors.grey500, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
        />
      </Box>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ sx: { py: `${space.xs}px`, minWidth: 168 } }}
      >
        {periods.map((p) => {
          const selected = p === value;
          return (
            <MenuItem
              key={p}
              selected={selected}
              onClick={() => {
                setValue(p);
                setAnchor(null);
              }}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: `${space.lg}px`,
                fontSize: type.body.fontSize,
                '&.Mui-selected': { bgcolor: colors.accentWash, color: colors.accent },
                '&.Mui-selected:hover': { bgcolor: colors.accentWash },
              }}
            >
              <Typography sx={{ fontSize: type.body.fontSize, color: 'inherit' }}>{p}</Typography>
              {selected && <CheckOutlined sx={{ fontSize: 16, color: colors.accent }} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default PeriodSelector;
