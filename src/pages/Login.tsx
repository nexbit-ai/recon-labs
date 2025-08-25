import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { StytchB2B, useStytchMemberSession } from '@stytch/react/b2b';
import { AuthFlowType, B2BProducts } from '@stytch/vanilla-js/b2b';
// @ts-ignore
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isInitialized } = useStytchMemberSession();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || '/';

  // Monitor session changes and redirect when authenticated
  useEffect(() => {
    if (isInitialized && session) {
      console.log('🚀 ===== LOGIN COMPONENT SESSION METADATA =====');
      console.log('🆔 Member Session ID:', session.member_session_id);
      console.log('👤 Member ID:', session.member_id);
      console.log('🏢 Organization ID:', session.organization_id);
      console.log('📅 Started At:', session.started_at);
      console.log('🔄 Last Accessed:', session.last_accessed_at);
      console.log('⏳ Expires At:', session.expires_at);
      console.log('🏢 Organization Slug:', session.organization_slug);
      console.log('🔑 Roles:', session.roles);
      console.log('📋 Custom Claims:', session.custom_claims);
      console.log('🚀 ===== END LOGIN SESSION METADATA =====');
      
      console.log('✅ Session detected in Login component, redirecting to marketplace...');
      navigate('/marketplace-reconciliation', { replace: true });
    }
  }, [session, isInitialized, navigate]);

  const config = {
    products: [B2BProducts.passwords], // Only passwords, no email magic links
    sessionOptions: { sessionDurationMinutes: 60 * 24 }, // 24 hours
    authFlowType: AuthFlowType.Discovery, // Required field, but we'll handle organization selection differently
    callbacks: {
      onSuccess: (data: any) => {
        console.log('🎉 Login successful, redirecting to marketplace...', data);
        console.log('📊 Login Success Data Structure:', {
          type: typeof data,
          keys: data ? Object.keys(data) : 'No data',
          fullData: data
        });
        // Redirect to marketplace page after successful login
        navigate('/marketplace-reconciliation', { replace: true });
      },
      onError: (error: any) => {
        console.error('❌ Login error:', error);
        console.log('🚨 Login Error Details:', {
          type: typeof error,
          message: error?.message || error?.error_message || 'Unknown error',
          code: error?.error_type || error?.status_code || 'No code',
          fullError: error
        });
      },
    },
  };

  // Custom strings to override Stytch default text
  const customStrings = {
    'login.title': 'Sign in',
    'login.subtitle': 'Sign in to your account to continue',
    'formField.email.label': 'Email',
    'formField.password.label': 'Password',
    'formField.password.placeholder': 'Enter your password',
    'formField.email.placeholder': 'email address',
    'button.login': 'Sign In',
    'button.continue': 'Continue',
    'discovery.title': 'Select Organization',
    'discovery.subtitle': 'Choose an organization to continue',
    'discovery.createOrganization': 'Create New Organization',
    'discovery.joinOrganization': 'Join Organization',
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
          padding: 6,
          borderRadius: 2,
          background: '#ffffff',
        }}
      >
        {/* Logo and Header */}
        <Box sx={{ textAlign: 'center', mb: 2 ,marginBottom: 4}}>
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: 64, height: 64, marginBottom: 0 }}
          />
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ color: '#111827' }}>
            Welcome back
          </Typography>
        </Box>

        {/* Stytch B2B Authentication Component */}
        <StytchB2B config={config} strings={customStrings} />
      </Paper>
    </Box>
  );
};

export default Login; 