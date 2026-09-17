// B2B (Nexbit) shell: left sidebar + top bar + content canvas (via <Outlet/>).
// Square surfaces, hairline borders, no shadows. Accent only for active nav,
// the primary CTA-adjacent live-sync signal, and recovered amounts (in views).
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { FileUploadOutlined, ExtensionOutlined, Tune as TuneIcon, FileDownloadOutlined as FileDownloadOutlinedIcon } from '@mui/icons-material';
import { colors, hairline, shell, type, space } from '../theme/b2bTokens';
import { SECTIONS, type SectionDef } from './sections';
import { workspace, fiscalPeriod } from '../mock';
import { KAPIVA_CLIENTS } from '../mock/b2bReconData';
import ProductToggle from '../components/ProductToggle';
import UploadSettlementModal from '../components/UploadSettlementModal';
import { Pressable } from '../components/primitives';
// @ts-ignore — same Nexbit logo used across the B2C UI
import logo from '../../assets/logo_fresh.jpg';

const NavItem: React.FC<{ section: SectionDef; active: boolean; onClick: () => void }> = ({
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [poFilterCount, setPoFilterCount] = useState(0);

  React.useEffect(() => {
    const handleCount = (e: any) => {
      setPoFilterCount(e.detail?.count || 0);
    };
    window.addEventListener('po-filter-count-changed', handleCount);
    return () => window.removeEventListener('po-filter-count-changed', handleCount);
  }, []);

  const active =
    SECTIONS.find((s) => location.pathname.startsWith(`/b2b/${s.path}`)) ?? SECTIONS[0];
  const isIntegrationsPage = location.pathname.includes('/integrations');

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: colors.paper, color: colors.ink }}>
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

        {/* Upload (opens the /b2b/upload view) + Integrations + workspace badge */}
        <Box sx={{ py: `${space.sm}px`, display: 'flex', flexDirection: 'column' }}>
          <NavItem
            section={{ key: 'upload', label: 'Upload', title: 'Upload', path: 'upload', icon: FileUploadOutlined }}
            active={location.pathname.includes('/upload')}
            onClick={() => navigate('/b2b/upload')}
          />
          <NavItem
            section={{ key: 'integrations', label: 'Integrations', title: 'Integrations', path: 'integrations', icon: ExtensionOutlined }}
            active={isIntegrationsPage}
            onClick={() => navigate('/b2b/integrations')}
          />
        </Box>
      </Box>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        {!isIntegrationsPage && (
          <Box
            sx={{
              height: shell.topBarHeight,
              flexShrink: 0,
              borderBottom: 'none',
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
              {active.key !== 'overview' && (
                <>
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
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, flexShrink: 0 }}>
              {active.key !== 'overview' && (
                <>

                  {active.key !== 'vendors' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
                        <Typography sx={{ ...type.label, color: colors.grey700 }}>CLIENT:</Typography>
                        <select 
                          value={platformFilter} 
                          onChange={(e) => setPlatformFilter(e.target.value)}
                          style={{
                            padding: '6px 14px',
                            border: '1px solid #eaecf0',
                            borderRadius: '9999px',
                            backgroundColor: colors.paper,
                            color: colors.ink,
                            fontSize: 13,
                            fontWeight: 500,
                            outline: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                          }}
                        >
                          <option value="all">All 20 Clients</option>
                          {KAPIVA_CLIENTS.map((c) => (
                            <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                          ))}
                        </select>
                      </Box>
                      <Pill>{fiscalPeriod.pill}</Pill>
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Content canvas */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box
            sx={{
              px: `${shell.canvasPaddingX}px`,
              pt: active.key === 'upload' ? 0 : `${shell.canvasPaddingTop}px`,
              pb: `${space.xxxl}px`,
            }}
          >
            <Outlet context={{ platformFilter, clientFilter: platformFilter }} />
          </Box>
        </Box>
      </Box>

      <UploadSettlementModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
};

export default B2BShell;
