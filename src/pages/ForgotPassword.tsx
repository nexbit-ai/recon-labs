import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import { Email } from '@mui/icons-material';
// @ts-ignore
import logo from '../assets/logo.png';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // For now, just show success message
      // In production, this would integrate with Stytch password reset
      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
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
          maxWidth: 400,
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
            Reset password
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Enter your email address and we'll send you a link to reset your password
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password reset email sent! Check your inbox for instructions.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Reset Password Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: '#111827',
              '&:hover': {
                backgroundColor: '#374151',
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </Box>

        {/* Back to Login Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Remember your password?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 600, color: '#111827' }}>
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword; 