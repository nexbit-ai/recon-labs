import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { StytchB2B, useStytchMemberSession } from '@stytch/react/b2b';
import { AuthFlowType, B2BProducts } from '@stytch/vanilla-js/b2b';
// @ts-ignore
import logo from '../assets/logo.png';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { session, isInitialized } = useStytchMemberSession();

  // Monitor session changes and redirect when authenticated
  useEffect(() => {
    if (isInitialized && session) {
      console.log('🚀 ===== REGISTER COMPONENT SESSION METADATA =====');
      console.log('🆔 Member Session ID:', session.member_session_id);
      console.log('👤 Member ID:', session.member_id);
      console.log('🏢 Organization ID:', session.organization_id);
      console.log('📅 Started At:', session.started_at);
      console.log('🔄 Last Accessed:', session.last_accessed_at);
      console.log('⏳ Expires At:', session.expires_at);
      console.log('🏢 Organization Slug:', session.organization_slug);
      console.log('🔑 Roles:', session.roles);
      console.log('📋 Custom Claims:', session.custom_claims);
      console.log('🚀 ===== END REGISTER SESSION METADATA =====');
      
      console.log('✅ Session detected in Register component, redirecting to marketplace...');
      navigate('/marketplace-reconciliation', { replace: true });
    }
  }, [session, isInitialized, navigate]);

  const config = {
    products: [B2BProducts.passwords], // Only passwords, no email magic links
    sessionOptions: { sessionDurationMinutes: 60 * 24 }, // 24 hours
    authFlowType: AuthFlowType.Discovery,
    callbacks: {
      onSuccess: (data: any) => {
        console.log('🎉 Registration successful, redirecting to marketplace...', data);
        console.log('📊 Registration Success Data Structure:', {
          type: typeof data,
          keys: data ? Object.keys(data) : 'No data',
          fullData: data
        });
        // Redirect to marketplace after successful registration
        navigate('/marketplace-reconciliation', { replace: true });
      },
      onError: (error: any) => {
        console.error('❌ Registration error:', error);
        console.log('🚨 Registration Error Details:', {
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
    'signup.title': 'Create Account',
    'signup.subtitle': 'Sign up to get started with Recon Labs',
    'formField.email.label': 'Email Address',
    'formField.password.label': 'Password',
    'formField.password.placeholder': 'Create a password',
    'formField.email.placeholder': 'Enter your email address',
    'button.signup': 'Create Account',
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
          padding: 4,
          borderRadius: 2,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* Logo and Header */}
        <Box sx={{ textAlign: 'left', mb: 4 }}>
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: 64, height: 64, marginBottom: 16 }}
          />
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ color: '#111827' }}>
            Create your account
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Sign up to get started with Recon Labs
          </Typography>
        </Box>

        {/* Stytch B2B Authentication Component */}
        <StytchB2B config={config} strings={customStrings} />
        
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

export default Register; 