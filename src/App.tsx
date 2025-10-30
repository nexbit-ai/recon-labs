import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Paper, Typography, CircularProgress } from '@mui/material';
import { apiUtils } from './services/api';

// Stytch B2B imports
import { StytchB2BProvider, useStytchMemberSession } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import { StytchB2B } from '@stytch/react/b2b';
import { AuthFlowType, B2BProducts } from '@stytch/vanilla-js/b2b';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import RecentActivities from './pages/RecentActivities';
import MarketplaceReconciliation from './pages/MarketplaceReconciliation';
import DisputePage from './pages/Dispute';
import Reports from './pages/Reports';
import ConnectDataSources from './pages/ConnectDataSources';
import UploadDocuments from './pages/UploadDocuments';
import AIWorkflows from './pages/AIWorkflows';
import Assistant from './pages/Assistant';
import AIReconciliation from './pages/AIReconciliation';
import Pricing from './pages/Pricing';
import Bookkeeping from './pages/Bookkeeping';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SessionMonitor from './components/SessionMonitor';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#fff',
      paper: '#fff',
    },
    primary: {
      main: '#111111', // brand black
      contrastText: '#fff',
    },
    secondary: {
      main: '#111', // black for accents
      contrastText: '#fff',
    },
    text: {
      primary: '#111',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e42',
    },
    info: {
      main: '#111111',
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800, fontSize: 32, letterSpacing: -1 },
    h2: { fontWeight: 800, fontSize: 25.6, letterSpacing: -1 },
    h3: { fontWeight: 800, fontSize: 22.4, letterSpacing: -0.5 },
    h4: { fontWeight: 700, fontSize: 17.6 },
    h5: { fontWeight: 700, fontSize: 14.4 },
    h6: { fontWeight: 700, fontSize: 12.8 },
    body1: { fontSize: 12.8 },
    body2: { fontSize: 12 },
    button: { fontWeight: 600, fontSize: 12, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#fff',
          color: '#111',
          transition: 'background 0.3s cubic-bezier(.4,0,.2,1), color 0.3s cubic-bezier(.4,0,.2,1)',
        },
        '*': {
          boxSizing: 'border-box',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px 0 rgba(16,30,54,0.04)',
          border: '1.5px solid #e5e7eb',
          transition: 'box-shadow 0.25s cubic-bezier(.4,0,.2,1), border 0.25s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 12,
          padding: '10px 22px',
          transition: 'background 0.2s cubic-bezier(.4,0,.2,1), color 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: 0.5,
          transition: 'background 0.2s cubic-bezier(.4,0,.2,1), color 0.2s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.2s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: '#f8fafc',
          fontSize: 12.8,
          padding: '10px 14px',
          transition: 'background 0.2s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: '#f8fafc',
          fontSize: 12.8,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: '#f8fafc',
          fontSize: 12.8,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          height: 3,
          borderRadius: 2,
          background: '#111111',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: 12,
          minHeight: 48,
          padding: '0 20px',
          transition: 'color 0.2s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          margin: '4px 0',
          transition: 'background 0.2s cubic-bezier(.4,0,.2,1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#fff',
          borderRight: '1.5px solid #e5e7eb',
          borderRadius: 0,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e5e7eb',
        },
      },
    },
  },
});

// Initialize Stytch B2B client
const stytch = new StytchB2BUIClient(
  import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || ''
);

// Authenticate component for handling Stytch redirects
const Authenticate: React.FC = () => {
  const navigate = useNavigate();
  const { session, isInitialized } = useStytchMemberSession();

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const stytchRedirectType = urlParams.get('stytch_redirect_type');
    
    
    // Handle different redirect types
    if (stytchRedirectType === 'login' && isInitialized && session) {
      navigate('/marketplace-reconciliation', { replace: true });
    } else if (stytchRedirectType === 'reset_password' && token) {
      // For password reset, set up a fallback redirect in case onSuccess doesn't trigger
      const timer = setTimeout(() => {
        navigate('/marketplace-reconciliation', { replace: true });
      }, 100000); // 100 second fallback - gives users plenty of time
      
      return () => clearTimeout(timer);
    } else if (stytchRedirectType === 'signup' && isInitialized && session) {
      navigate('/marketplace-reconciliation', { replace: true });
    }
  }, [navigate, session, isInitialized]);

  // Add a separate effect to watch for session changes during password reset
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stytchRedirectType = urlParams.get('stytch_redirect_type');
    
    if (stytchRedirectType === 'reset_password' && isInitialized && session) {
      navigate('/marketplace-reconciliation', { replace: true });
    }
  }, [session, isInitialized, navigate]);

  const config = {
    products: [B2BProducts.passwords], // Only passwords, no email magic links
    sessionOptions: { sessionDurationMinutes: 60 * 24 }, // 24 hours
    authFlowType: AuthFlowType.Discovery,
    callbacks: {
      onSuccess: (data: any) => {
        
        
        // Check if this is a password reset completion
        const urlParams = new URLSearchParams(window.location.search);
        const stytchRedirectType = urlParams.get('stytch_redirect_type');
        
        if (stytchRedirectType === 'reset_password') {
          console.log('✅ Password reset completed successfully, redirecting...');
          // Force redirect immediately for password reset
          navigate('/marketplace-reconciliation', { replace: true });
        } else {
          // For other flows, wait for session update
          console.log('⏳ Success callback completed, waiting for session update...');
        }
      },
      onError: (error: any) => {
        console.error('❌ Authentication error:', error);
        console.log('🚨 Error Details:', {
          type: typeof error,
          message: error?.message || error?.error_message || 'Unknown error',
          code: error?.error_type || error?.status_code || 'No code',
          fullError: error
        });
        // Redirect to login on error
        navigate('/login', { replace: true });
      },
    },
    // Password-specific configuration
    passwordOptions: {
      loginRedirectURL: `${window.location.origin}/authenticate`,
      signupRedirectURL: `${window.location.origin}/authenticate`,
    },
    // Password reset configuration
    passwordResetOptions: {
      redirectURL: `${window.location.origin}/authenticate`,
    },
    // Hide Stytch branding
    styles: {
      hideStytchBranding: true,
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: 500,
          padding: 4,
          borderRadius: 2,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CircularProgress size={40} sx={{ mb: 2, color: '#111111' }} />
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ color: '#111827' }}>
            {(() => {
              const urlParams = new URLSearchParams(window.location.search);
              const stytchRedirectType = urlParams.get('stytch_redirect_type');
              if (stytchRedirectType === 'reset_password') return 'Reset Your Password';
              if (stytchRedirectType === 'signup') return 'Complete Signup';
              return 'Authenticating...';
            })()}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            {(() => {
              const urlParams = new URLSearchParams(window.location.search);
              const stytchRedirectType = urlParams.get('stytch_redirect_type');
              if (stytchRedirectType === 'reset_password') return 'Enter your new password below';
              if (stytchRedirectType === 'signup') return 'Complete your account setup';
              return 'Please wait while we process your authentication';
            })()}
          </Typography>
        </Box>

        {/* Stytch B2B Authentication Component */}
        <StytchB2B config={config} />
        
        {/* Custom CSS to hide Stytch branding */}
        <style>
          {`
            .stytch-branding,
            [data-testid="stytch-branding"],
            .stytch-powered-by,
            [class*="branding"],
            [class*="powered-by"] {
              display: none !important;
            }
          `}
        </style>
      </Paper>
    </Box>
  );
};
function App() {
  // Don't initialize API credentials here - let the useOrganization hook handle it dynamically
  // The organization ID will be set from the Stytch session when user authenticates

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StytchB2BProvider stytch={stytch}>
        <SessionMonitor />
        <Router>
          <Routes>
            {/* Authentication routes (public) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/authenticate" element={<Authenticate />} />
            
            {/* Main application routes with Layout and Protection */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><MarketplaceReconciliation /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/checklist" element={
              <ProtectedRoute>
                <Layout><Checklist /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/recent-activities" element={
              <ProtectedRoute>
                <Layout><RecentActivities /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace-reconciliation" element={
              <ProtectedRoute>
                <Layout><MarketplaceReconciliation /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dispute" element={
              <ProtectedRoute>
                <Layout><DisputePage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout><Reports /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/finance-dashboard" element={
              <ProtectedRoute>
                <Layout><MarketplaceReconciliation /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/connect-data-sources" element={
              <ProtectedRoute>
                <Layout><ConnectDataSources /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/upload-documents" element={
              <ProtectedRoute>
                <Layout><UploadDocuments /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/ai-workflows" element={
              <ProtectedRoute>
                <Layout><AIWorkflows /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/assistant" element={
              <ProtectedRoute>
                <Layout><Assistant /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/ai-reconciliation" element={
              <ProtectedRoute>
                <Layout><AIReconciliation /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={
              <ProtectedRoute>
                <Layout><Pricing /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/bookkeeping" element={
              <ProtectedRoute>
                <Layout><Bookkeeping /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </StytchB2BProvider>
    </ThemeProvider>
  );
}

export default App; 