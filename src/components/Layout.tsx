import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStytchMemberSession } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import { tokenManager } from '../services/api/tokenManager';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DashboardOutlined as DashboardIcon,
  ChecklistOutlined as ChecklistIcon,
  EditOutlined as EditIcon,
  CompareArrowsOutlined as CompareArrowsIcon,
  AssessmentOutlined as AssessmentIcon,
  SettingsOutlined as SettingsIcon,
  AttachMoneyOutlined as AttachMoneyIcon,
  StorageOutlined as StorageIcon,
  // ChatOutlined as ChatIcon,
  StorefrontOutlined as StorefrontIcon,
  ReceiptOutlined as ReceiptIcon,
  AccountBalanceOutlined as AccountBalanceIcon,
  ReportProblemOutlined as ReportProblemIcon,
  LogoutOutlined as LogoutIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { Badge } from '@mui/material';
// import { useAuth } from '../contexts/AuthContext'; // Authentication disabled
// @ts-ignore
import logo from '../assets/logo_fresh.jpg';
// @ts-ignore
import userPhoto from '../assets/user-photo.jpg';

const drawerWidth = 240;

const menuItems = [
  { text: 'Reconciliation', icon: <ReceiptIcon />, path: '/marketplace-reconciliation' },
  { text: 'Dispute', icon: <ReportProblemIcon />, path: '/dispute' },
  { text: 'Accounting', icon: <AccountBalanceIcon />, path: '/bookkeeping' },
  { text: 'Checklist', icon: <ChecklistIcon />, path: '/checklist' },
  // { text: 'Chat', icon: <ChatIcon />, path: '/assistant' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useStytchMemberSession();
  // const { user, logout } = useAuth(); // Authentication disabled
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);
  const [sidebarNudge, setSidebarNudge] = React.useState<number>(() => {
    try { return parseInt(localStorage.getItem('recon_nudge_count') || '0', 10) || 0; } catch { return 0; }
  });

  React.useEffect(() => {
    const handler = () => {
      try { setSidebarNudge(parseInt(localStorage.getItem('recon_nudge_count') || '0', 10) || 0); } catch { setSidebarNudge(0); }
    };
    window.addEventListener('recon_nudge_updated', handler as EventListener);
    return () => window.removeEventListener('recon_nudge_updated', handler as EventListener);
  }, []);

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
    if (option === 'Settings') {
      // Navigate to settings page or show settings modal
      console.log('Settings clicked');
    } else if (option === 'Logout') {
      // Start smooth logout with blur overlay
      setIsLoggingOut(true);
      
      // Wait for blur animation, then navigate
      setTimeout(() => {
        navigate('/login', { replace: true });
        
        // Clean up after navigation
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
      }, 300); // Match CSS transition duration
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
        <img
          src={logo}
          alt="Nexbit Logo"
          style={{ width: 48, height: 48, marginBottom: 16, display: 'block' }}
        />
      </Toolbar>
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 0,
                mr: 2,
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
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  minWidth: 30,
                  '& .MuiSvgIcon-root': {
                    fontSize: 18, // force smaller px size
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  item.text === 'Checklist' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box component="span">Checklist</Box>
                      <Box sx={{ ml: 1 }}>
                        <Badge
                          badgeContent={sidebarNudge}
                          overlap="rectangular"
                          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: 12,
                              height: 24,
                              minWidth: 24,
                              bgcolor: '#111',
                              color: '#fff',
                              borderRadius: 0.2,
                              top: 10,
                              right: 6,
                            },
                          }}
                        >
                          <Box sx={{ width: 24, height: 24 }} />
                        </Badge>
                      </Box>
                    </Box>
                  ) : (
                    item.text
                  )
                }
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mb: 2 }}>
        {/* Upload nav button added instead of Data Sources (was here) */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/upload-documents')}
            selected={location.pathname === '/upload-documents'}
            sx={{
              borderRadius: 0,
              mr: 2,
              my: 0.25,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '15',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '25',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {/* Use the built-in Upload icon from MUI */}
              <CompareArrowsIcon />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 500 }}>Upload</Typography>}
              sx={{ color: location.pathname === '/upload-documents' ? theme.palette.primary.main : 'inherit' }}
            />
          </ListItemButton>
        </ListItem>
        {/* Data Sources nav commented out: only upload is now shown to user. */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleSettingsClick} sx={{ borderRadius: 0, mr: 2, my: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                }}
                src={userPhoto}
                alt="Krishna"
              />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography sx={{ 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5, 
                  color: 'text.primary',
                  fontSize: '14px'
                }}>
                  Hi, User
                  <KeyboardArrowUpIcon sx={{ fontSize: '16px', color: 'text.primary', fontWeight: 'bold' }} />
                </Typography>
              } 
            />
          </ListItemButton>
        </ListItem>
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleMenuOption('Settings')}>Settings</MenuItem>
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
      {/* Logout overlay with blur effect */}
      {isLoggingOut && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              color: 'text.primary',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Logging out...
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Please wait
            </Typography>
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
          ModalProps={{
            keepMounted: true,
          }}
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
          pt: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 