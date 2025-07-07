import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import RecentActivities from './pages/RecentActivities';
import Reconciliation from './pages/Reconciliation';
import Reports from './pages/Reports';
import AIWorkflows from './pages/AIWorkflows';
import AIReconciliation from './pages/AIReconciliation';
import Security from './pages/Security';
import Pricing from './pages/Pricing';
import FinanceDashboard from './pages/FinanceDashboard';
import ConnectDataSources from './pages/ConnectDataSources';
import Assistant from './pages/Assistant';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#fff',
      paper: '#fff',
    },
    primary: {
      main: '#2563eb', // blue
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
      main: '#2563eb',
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
          background: '#2563eb',
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/recent-activities" element={<RecentActivities />} />
            <Route path="/reconciliation" element={<Reconciliation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/finance-dashboard" element={<FinanceDashboard />} />
            <Route path="/connect-data-sources" element={<ConnectDataSources />} />
            <Route path="/ai-workflows" element={<AIWorkflows />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/ai-reconciliation" element={<AIReconciliation />} />
            <Route path="/security" element={<Security />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App; 