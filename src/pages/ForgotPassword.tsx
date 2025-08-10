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
// import { useAuth } from '../contexts/AuthContext';
// @ts-ignore
import logo from '../assets/logo.png';

const ForgotPassword: React.FC = () => {
  // const { resetPassword } = useAuth();
  
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
      // const success = await resetPassword(email);
      // if (success) {
        setSuccess(true);
      // } else {
      //   setError('Failed to send reset email. Please try again.');
      // }
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo and Header */}
  <Box sx={{ textAlign: 'left', mb: 4 }}>
          <img
            src={logo}
            alt="Nexbit Logo"
            style={{ width: 64, height: 64, marginBottom: 16 }}
          />
          <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
            Reset password
          </Typography>
          <Typography variant="body2" color="text.secondary">
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

        {/* Reset Form */}
        {!success ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={handleEmailChange}
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
              }}
            >
              {isLoading ? 'Sending...' : 'Send reset email'}
            </Button>
          </Box>
        ) : (
  <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Didn't receive the email? Check your spam folder or try again.
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Try again
            </Button>
          </Box>
        )}

        {/* Links */}
        <Box sx={{ textAlign: 'center' }}>
          <MuiLink
            component={Link}
            to="/login"
            variant="body2"
            sx={{ display: 'block' }}
          >
            Back to sign in
          </MuiLink>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword; 