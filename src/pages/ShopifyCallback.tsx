import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { api } from '../services/api';

const ShopifyCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const statusAttempted = useRef(false);

  useEffect(() => {
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!shop || !code) {
      setStatus('error');
      setError('Missing required parameters from Shopify.');
      return;
    }

    const completeAuth = async () => {
      if (statusAttempted.current) return;
      statusAttempted.current = true;

      try {
        // We pass the shop and code to our backend callback endpoint
        // The backend will exchange the code for a token and store it
        const response = await api.shopifyAuth.callback(shop, code, state);
        if (response.statusCode === 200) {
          setStatus('success');
          setTimeout(() => {
            navigate('/integrations', { state: { success: `Successfully connected to ${shop}` } });
          }, 2000);
        } else {
          throw new Error('Failed to complete authentication');
        }
      } catch (err: any) {
        console.error('Shopify Auth Callback Error:', err);
        setStatus('error');
        setError(err?.response?.data?.error || 'Failed to connect Shopify store.');
      }
    };

    completeAuth();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          maxWidth: 400,
          textAlign: 'center',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress size={60} sx={{ mb: 4, color: '#008060' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Connecting Store...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we securely finalize your Shopify connection.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#22c55e', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Store Connected!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting you back to integrations...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: '#ef4444', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Connection Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
            <Typography
              variant="button"
              sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 700 }}
              onClick={() => navigate('/integrations')}
            >
              Back to Integrations
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ShopifyCallback;
