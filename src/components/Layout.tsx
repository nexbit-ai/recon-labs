import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
// @ts-ignore
import logo from '../assets/logo.png';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Month-end close', icon: <ChecklistIcon />, path: '/checklist' },
  { text: 'Recent Activities', icon: <EditIcon />, path: '/recent-activities' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Connect Data Sources', icon: <StorageIcon />, path: '/connect-data-sources' },
  { text: 'Finance Intelligence Dashboard', icon: <AttachMoneyIcon />, path: '/finance-dashboard' },
  { text: 'Assistant', icon: <ChatIcon />, path: '/assistant' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);

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
    if (option === 'Security') {
      navigate('/security');
    } else if (option === 'Pricing') {
      navigate('/pricing');
    }
    // Example: navigate(`/settings/${option.toLowerCase()}`);
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
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
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
          <ListItemButton onClick={handleSettingsClick} sx={{ borderRadius: 0, mr: 2, my: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleMenuOption('Security')}>Security</MenuItem>
          <MenuItem onClick={() => handleMenuOption('Pricing')}>Pricing</MenuItem>
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