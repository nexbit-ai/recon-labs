// Shared B2B (Nexbit) UI primitives. Every view imports these so cards, titles,
// channel labels, column headers, stat tiles, and clickable rows are visually
// identical everywhere. Style only — no behaviour. See docs/B2B_DESIGN_SYSTEM.md.
import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { colors, hairline, type, space, tabularNums, focusRingSx } from '../theme/b2bTokens';

type Sx = SxProps<Theme>;

// White, square, hairline-bordered surface — no shadow. Padding left to caller.
export const cardSx = { bgcolor: colors.paper, border: hairline } as const;

export const PageTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography component="h1" sx={{ ...type.pageTitle, color: colors.ink, mb: `${space.xl}px` }}>
    {children}
  </Typography>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; sx?: Sx }> = ({ children, sx }) => (
  <Typography sx={{ ...type.sectionTitle, color: colors.ink, ...sx }}>{children}</Typography>
);

// Uppercase channel name label — never a coloured dot.
export const ChannelTag: React.FC<{ name: string }> = ({ name }) => (
  <Box component="span" sx={{ ...type.label, color: colors.grey500 }}>
    {name}
  </Box>
);

// Tiny uppercase grey column header label (data tables).
export const ColumnLabel: React.FC<{ children?: React.ReactNode; align?: 'left' | 'right' }> = ({
  children,
  align = 'left',
}) => (
  <Typography sx={{ ...type.label, color: colors.grey500, textAlign: align, overflow: 'hidden' }}>
    {children}
  </Typography>
);

// Bordered stat tile: value over an uppercase label (Contracts / Upload modal).
export const StatTile: React.FC<{ label: string; value: React.ReactNode; sx?: Sx }> = ({ label, value, sx }) => (
  <Box sx={{ flex: 1, border: hairline, p: `${space.lg}px`, ...sx }}>
    <Typography sx={{ ...type.statValue, color: colors.ink }}>{value}</Typography>
    <Typography sx={{ ...type.label, color: colors.grey700, mt: '2px' }}>{label}</Typography>
  </Box>
);

// Keyboard-accessible clickable surface: role=button, tab focus, Enter/Space,
// square accent focus ring. Replaces bare onClick Boxes so all custom
// interactive elements are reachable and consistent.
interface PressableProps {
  onClick?: () => void;
  sx?: Sx;
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  ariaLabel?: string;
  role?: string;
}
export const Pressable: React.FC<PressableProps> = ({
  onClick,
  sx,
  children,
  disabled,
  selected,
  ariaLabel,
  role = 'button',
}) => (
  <Box
    role={role}
    aria-label={ariaLabel}
    aria-disabled={disabled || undefined}
    aria-selected={role === 'tab' ? !!selected : undefined}
    tabIndex={disabled ? -1 : 0}
    onClick={disabled ? undefined : onClick}
    onKeyDown={(e) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
    sx={{ cursor: disabled ? 'default' : 'pointer', userSelect: 'none', ...focusRingSx, ...sx } as Sx}
  >
    {children}
  </Box>
);

export { tabularNums };
