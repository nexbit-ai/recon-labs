// PayableShell - AP-specific sidebar + top bar + content canvas.
// Follows exact same pattern as B2BShell: square corners, hairline borders,
// monochrome + one accent (#7A5DBF), Inter, no shadows.
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { colors, hairline, shell, type, space } from '../../theme/b2bTokens';
import { PAYABLE_SECTIONS, type PayableSectionDef } from './payableSections';
import { Pressable } from '../../components/primitives';
// @ts-ignore - shared logo
import logo from '../../../assets/logo_fresh.jpg';

const NavItem: React.FC<{ section: PayableSectionDef; active: boolean; onClick: () => void }> = ({
  section,
  active,
  onClick,
}) => {
  const Icon = section.icon;
  return (
    <Pressable
      role="tab"
      selected={active}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: `${space.md}px`,
        height: 44,
        px: `${space.lg}px`,
        borderLeft: active ? `2px solid ${colors.accent}` : '2px solid transparent',
        bgcolor: active ? colors.accentWash : 'transparent',
        color: active ? colors.accent : colors.grey700,
        '&:hover': active ? undefined : { bgcolor: colors.grey100, color: colors.ink },
      }}
    >
      <Icon sx={{ fontSize: 20, color: 'inherit' }} />
      <Typography sx={{ fontSize: type.body.fontSize, fontWeight: active ? 600 : 500, color: 'inherit' }}>
        {section.label}
      </Typography>
    </Pressable>
  );
};

const FiscalPill: React.FC = () => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: `${space.sm}px`,
      height: 28,
      px: `${space.md}px`,
      border: hairline,
      bgcolor: colors.paper,
      ...type.label,
      color: colors.grey700,
    }}
  >
    FY 2024-25 · Q1
  </Box>
);

const PayableShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    PAYABLE_SECTIONS.find((s) => location.pathname.startsWith(`/b2b/payable/${s.path}`)) ??
    PAYABLE_SECTIONS[0];

  const topSections = PAYABLE_SECTIONS.filter((s) => !s.pinBottom);
  const bottomSections = PAYABLE_SECTIONS.filter((s) => s.pinBottom);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.paper, color: colors.ink }}>
      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          width: shell.sidebarWidth,
          flexShrink: 0,
          borderRight: hairline,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <Box sx={{ px: `${space.lg}px`, pt: `${space.xl}px`, pb: `${space.lg}px`, borderBottom: hairline }}>
          <img
            src={logo}
            alt="Nexbit"
            loading="eager"
            decoding="sync"
            style={{ width: 32, height: 32, display: 'block', marginBottom: space.sm }}
          />
          <Typography sx={{ ...type.label, color: colors.grey500 }}>ACCOUNTS PAYABLE</Typography>
        </Box>

        {/* Top nav */}
        <Box sx={{ flex: 1, py: `${space.sm}px` }}>
          {topSections.map((s) => (
            <NavItem
              key={s.key}
              section={s}
              active={s.key === active.key}
              onClick={() => navigate(`/b2b/payable/${s.path}`)}
            />
          ))}
        </Box>

        {/* Pinned bottom: Ingest */}
        <Box sx={{ borderTop: hairline, py: `${space.sm}px` }}>
          {bottomSections.map((s) => (
            <NavItem
              key={s.key}
              section={s}
              active={s.key === active.key}
              onClick={() => navigate(`/b2b/payable/${s.path}`)}
            />
          ))}
        </Box>
      </Box>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <Box
          sx={{
            height: shell.topBarHeight,
            flexShrink: 0,
            borderBottom: hairline,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${space.lg}px`,
            px: `${shell.canvasPaddingX}px`,
            position: 'sticky',
            top: 0,
            bgcolor: colors.paper,
            zIndex: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...type.label, color: colors.grey500, display: 'block' }}>
              {active.label}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '18px',
                color: colors.ink,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {active.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, flexShrink: 0 }}>
            <FiscalPill />
          </Box>
        </Box>

        {/* Content canvas */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box
            sx={{
              px: `${shell.canvasPaddingX}px`,
              pt: `${shell.canvasPaddingTop}px`,
              pb: `${space.xxxl}px`,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PayableShell;
