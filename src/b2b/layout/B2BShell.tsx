// B2B (Nexbit) shell: left sidebar + top bar + content canvas (via <Outlet/>).
// Square surfaces, hairline borders, no shadows. Accent only for active nav,
// the primary CTA-adjacent live-sync signal, and recovered amounts (in views).
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { FileUploadOutlined } from '@mui/icons-material';
import { colors, hairline, shell, type, space } from '../theme/b2bTokens';
import { SECTIONS, type SectionDef } from './sections';
import { workspace, fiscalPeriod } from '../mock';
import ProductToggle from '../components/ProductToggle';
// @ts-ignore — same Nexbit logo used across the B2C UI
import logo from '../../assets/logo_fresh.jpg';

const NavItem: React.FC<{ section: SectionDef; active: boolean; onClick: () => void }> = ({
  section,
  active,
  onClick,
}) => {
  const Icon = section.icon;
  return (
    <Box
      role="tab"
      aria-selected={active}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: `${space.md}px`,
        height: 44,
        px: `${space.lg}px`,
        cursor: 'pointer',
        userSelect: 'none',
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
    </Box>
  );
};

const Pill: React.FC<{ children: React.ReactNode; dot?: boolean }> = ({ children, dot }) => (
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
    {dot && <Box sx={{ width: 8, height: 8, bgcolor: colors.accent }} />}
    {children}
  </Box>
);

const B2BShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    SECTIONS.find((s) => location.pathname.startsWith(`/b2b/${s.path}`)) ?? SECTIONS[0];

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
        }}
      >
        {/* Brand logo + toggle */}
        <Box sx={{ px: `${space.lg}px`, pt: `${space.xl}px`, pb: `${space.lg}px` }}>
          <img
            src={logo}
            alt="Nexbit"
            loading="eager"
            decoding="sync"
            style={{ width: 40, height: 40, display: 'block', marginBottom: space.lg }}
          />
          <ProductToggle />
        </Box>

        {/* Nav */}
        <Box sx={{ flex: 1, py: `${space.sm}px` }}>
          {SECTIONS.map((s) => (
            <NavItem
              key={s.key}
              section={s}
              active={s.key === active.key}
              onClick={() => navigate(`/b2b/${s.path}`)}
            />
          ))}
        </Box>

        {/* Upload settlement (no behaviour yet) + workspace badge */}
        <Box sx={{ p: `${space.lg}px`, display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
          <Button
            fullWidth
            disableElevation
            startIcon={<FileUploadOutlined sx={{ fontSize: 20 }} />}
            sx={{
              borderRadius: 0,
              bgcolor: colors.ink,
              color: colors.paper,
              fontSize: 13,
              fontWeight: 600,
              py: `${space.md}px`,
              '&:hover': { bgcolor: '#000000' },
            }}
          >
            Upload settlement
          </Button>
          <Box sx={{ border: hairline, p: `${space.md}px` }}>
            <Typography sx={{ ...type.label, color: colors.grey500, display: 'block' }}>Workspace</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, mt: '2px' }}>
              {workspace.channelsConnectedLabel}
            </Typography>
          </Box>
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
            px: `${shell.canvasPaddingX}px`,
            position: 'sticky',
            top: 0,
            bgcolor: colors.paper,
            zIndex: 1,
          }}
        >
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, display: 'block' }}>
              {active.label}
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 600, lineHeight: '18px', color: colors.ink }}>
              {active.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
            <Pill>{fiscalPeriod.pill}</Pill>
            <Pill dot>Live sync</Pill>
          </Box>
        </Box>

        {/* Content canvas */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box
            sx={{
              maxWidth: shell.canvasMaxWidth,
              mx: 'auto',
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

export default B2BShell;
