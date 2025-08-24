import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStytchMemberSession } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
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
  ChatOutlined as ChatIcon,
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
import logo from '../assets/logo.png';
// @ts-ignore
import userPhoto from '../assets/user-photo.jpg';

const drawerWidth = 240;

const menuItems = [
  { text: 'Reconciliation', icon: <ReceiptIcon />, path: '/marketplace-reconciliation' },
  { text: 'Dispute', icon: <ReportProblemIcon />, path: '/dispute' },
  { text: 'Accounting', icon: <AccountBalanceIcon />, path: '/bookkeeping' },
  { text: 'Checklist', icon: <ChecklistIcon />, path: '/checklist' },
  { text: 'Chat', icon: <ChatIcon />, path: '/assistant' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useStytchMemberSession();
  // const { user, logout } = useAuth(); // Authentication disabled
  const [mobileOpen, setMobileOpen] = React.useState(false);
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
    } else if (option === 'Security') {
      navigate('/security');
    } else if (option === 'Pricing') {
      navigate('/pricing');
    } else if (option === 'Logout') {
      // Properly logout using Stytch B2B
      console.log('Logging out user...');
      
      try {
        // Create a new Stytch client instance for logout
        const stytchClient = new StytchB2BUIClient(
          import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || ''
        );
        
        // Revoke the current session
        stytchClient.session.revoke();
        console.log('Successfully logged out from Stytch B2B');
        
        // Clear any local storage
        try {
          localStorage.removeItem('stytch_session');
          sessionStorage.clear();
        } catch (error) {
          console.error('Error clearing local data:', error);
        }
        
        // Navigate to login page
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error during Stytch logout:', error);
        // Fallback: navigate to login page
        navigate('/login', { replace: true });
      }
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
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/connect-data-sources')} 
            selected={location.pathname === '/connect-data-sources'}
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
                color: location.pathname === '/connect-data-sources' ? theme.palette.primary.main : 'inherit',
                minWidth: 36 
              }}
            >
              <StorageIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Data Sources" 
              sx={{
                color: location.pathname === '/connect-data-sources' ? theme.palette.primary.main : 'inherit',
              }}
            />
          </ListItemButton>
        </ListItem>
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
                  Hi, Krishna
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
          <MenuItem onClick={() => handleMenuOption('Security')}>Security</MenuItem>
          <MenuItem onClick={() => handleMenuOption('Pricing')}>Pricing</MenuItem>
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
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 