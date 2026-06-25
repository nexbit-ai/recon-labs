import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStytchMemberSession } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import { tokenManager } from '../services/api/tokenManager';
import { useUser } from '../contexts/UserContext';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import B2BCopilot from './B2BCopilot';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Select,
} from '@mui/material';
import {
  HomeOutlined as OverviewIcon,
  MoveToInboxOutlined as InboxIcon,
  TrendingUpOutlined as RecoveriesIcon,
  AccessTimeOutlined as OutstandingIcon,
  GavelOutlined as DisputesIcon,
  StorefrontOutlined as PlatformsIcon,
  BalanceOutlined as AccountingIcon,
  TimelineOutlined as ActivityIcon,
  LogoutOutlined as LogoutIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
// @ts-ignore
import logo from '../assets/logo_fresh.jpg';

const drawerWidth = 168;

const b2bMenuItems = [
  { text: 'Overview', icon: <OverviewIcon />, path: '/b2b/overview' },
  { text: 'Inbox', icon: <InboxIcon />, path: '/b2b/inbox' },
  { text: 'Recoveries', icon: <RecoveriesIcon />, path: '/b2b/recoveries' },
  { text: 'Outstanding', icon: <OutstandingIcon />, path: '/b2b/outstanding' },
  { text: 'Disputes', icon: <DisputesIcon />, path: '/b2b/disputes' },
  { text: 'Platforms', icon: <PlatformsIcon />, path: '/b2b/platforms' },
  { text: 'Accounting', icon: <AccountingIcon />, path: '/b2b/accounting' },
  { text: 'Activity', icon: <ActivityIcon />, path: '/b2b/activity' },
];

const B2BLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useStytchMemberSession();
  const { memberName, selectedOrganization, setSelectedOrganization } = useUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);

  const displayName = memberName
    ? memberName.charAt(0).toUpperCase() + memberName.slice(1).toLowerCase()
    : 'User';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleMenuOption = (option: string) => {
    setSettingsAnchorEl(null);
    if (option === 'Logout') {
      setIsLoggingOut(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
        queueMicrotask(() => {
          try {
            const stytchClient = new StytchB2BUIClient(
              import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || ''
            );
            stytchClient.session.revoke();
          } catch {}
          try {
            tokenManager.clearCredentials();
            localStorage.removeItem('stytch_session');
            sessionStorage.clear();
          } catch {}
          setIsLoggingOut(false);
        });
      }, 300);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
        <img
          src={logo}
          alt="Nexbit Logo"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          style={{ width: 48, height: 48, marginBottom: 16, display: 'block' }}
        />
      </Toolbar>
      {/* Workspace Switcher */}
      <WorkspaceSwitcher />
      <Box sx={{ px: 2, mb: 1, mt: -0.5 }}>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
          Organization
        </Typography>
        <Select
          value={selectedOrganization}
          onChange={(e) => setSelectedOrganization(e.target.value as string)}
          size="small"
          fullWidth
          sx={{
            height: 32,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#374151',
            bgcolor: 'transparent',
            borderRadius: '4px',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-focused': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <MenuItem value="ACME" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>ACME</MenuItem>
          <MenuItem value="Warby Parker" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Warby Parker</MenuItem>
          <MenuItem value="Glossier" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Glossier</MenuItem>
          <MenuItem value="Casper" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Casper</MenuItem>
        </Select>
      </Box>
      <List sx={{ flex: 1 }}>
        {b2bMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 0,
                mr: 1.5,
                my: 0.25,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '15',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '25',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path
                    ? theme.palette.primary.main
                    : 'inherit',
                  minWidth: 28,
                  '& .MuiSvgIcon-root': {
                    fontSize: 18,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path
                    ? theme.palette.primary.main
                    : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSettingsClick} sx={{ borderRadius: 0, mr: 1.5, my: 0.25, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
              <Typography sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '12.5px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                lineHeight: 1.3,
              }}>
                Hi, {displayName}
              </Typography>
              <MoreVertIcon sx={{ fontSize: '16px', color: 'text.secondary', flexShrink: 0, ml: 0.5 }} />
            </Box>
          </ListItemButton>
        </ListItem>
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleMenuOption('Logout')}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Logout overlay */}
      {isLoggingOut && (
        <Box
          sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'text.primary' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Logging out...</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Please wait</Typography>
          </Box>
        </Box>
      )}

      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          borderRadius: 0,
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRadius: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRadius: 0,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          pt: 0,
        }}
      >
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      </Box>
      <B2BCopilot />
    </Box>
  );
};

export default B2BLayout;
