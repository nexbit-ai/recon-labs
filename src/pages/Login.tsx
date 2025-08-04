import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
} from '@mui/material';
// @ts-ignore
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login - just navigate to home
    navigate('/home', { replace: true });
  };

  const handleResetPassword = () => {
    // Dummy reset password - just show alert
    alert('Password reset email sent! (This is a dummy implementation)');
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: 64, height: 64, marginBottom: 16 }}
          />
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ color: '#111827' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Sign in to your account to continue
          </Typography>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                height: '40px',
                '& fieldset': {
                  borderColor: '#d1d5db',
                },
                '&:hover fieldset': {
                  borderColor: '#9ca3af',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
              },
              '& .MuiInputLabel-root': {
                '&.Mui-focused': {
                  color: '#2563eb',
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                height: '40px',
                '& fieldset': {
                  borderColor: '#d1d5db',
                },
                '&:hover fieldset': {
                  borderColor: '#9ca3af',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                },
              },
              '& .MuiInputLabel-root': {
                '&.Mui-focused': {
                  color: '#2563eb',
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
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
            Sign in
          </Button>
        </Box>

        {/* Reset Password Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleResetPassword}
            sx={{ 
              textDecoration: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              '&:hover': {
                textDecoration: 'underline',
                color: '#374151',
              }
            }}
          >
            Forgot your password?
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 