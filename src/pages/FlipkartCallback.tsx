import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { api } from '../services/api';

const FlipkartCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const statusAttempted = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setStatus('error');
      setError('Missing authorization code from Flipkart.');
      return;
    }

    const completeAuth = async () => {
      if (statusAttempted.current) return;
      statusAttempted.current = true;

      try {
        // Exchange authorization code for access & refresh tokens
        const response = await api.flipkartAuth.callback(code, state || '');
        if (response.statusCode === 200) {
          setStatus('success');
          setTimeout(() => {
            navigate('/integrations', { state: { success: 'Successfully connected to Flipkart Seller Hub' } });
          }, 2000);
        } else {
          throw new Error('Failed to complete Flipkart authentication');
        }
      } catch (err: any) {
        console.error('Flipkart Auth Callback Error:', err);
        setStatus('error');
        setError(err?.response?.data?.error || err?.message || 'Failed to connect Flipkart store.');
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
          maxWidth: 420,
          textAlign: 'center',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress size={60} sx={{ mb: 4, color: '#2874f0' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Connecting Flipkart...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we securely finalize your Flipkart Seller connection.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#22c55e', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Flipkart Connected!
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

export default FlipkartCallback;
