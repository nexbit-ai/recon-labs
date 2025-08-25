import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField } from '@mui/material';
import JWTService, { JWTPayload } from '../services/auth/jwtService';

const JWTTest: React.FC = () => {
  const [jwtToken, setJwtToken] = useState<string>('');
  const [decodedPayload, setDecodedPayload] = useState<JWTPayload | null>(null);
  const [error, setError] = useState<string>('');

  // Sample Stytch session data for testing
  const sampleSessionData = {
    member_id: "member-test-21460582-ce5c-4013-899b-b283a32e5a4f",
    member_session_id: "member-session-test-2c82c97a-6536-436b-82d4-92b4738a00fa",
    organization_id: "organization-test-612cd642-c2ce-49da-b535-be35442cecfa",
    organization_slug: "Kapiva",
    roles: ["stytch_member"]
  };

  const generateJWT = async () => {
    try {
      setError('');
      const token = await JWTService.generateToken(sampleSessionData);
      setJwtToken(token);
      setDecodedPayload(null);
      console.log('✅ JWT token generated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate JWT');
      console.error('❌ Error generating JWT:', err);
    }
  };

  const verifyJWT = async () => {
    if (!jwtToken) {
      setError('Please generate a JWT token first');
      return;
    }

    try {
      setError('');
      const payload = await JWTService.verifyToken(jwtToken);
      setDecodedPayload(payload);
      console.log('✅ JWT token verified successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify JWT');
      console.error('❌ Error verifying JWT:', err);
    }
  };

  const decodeJWT = () => {
    if (!jwtToken) {
      setError('Please generate a JWT token first');
      return;
    }

    try {
      setError('');
      const payload = JWTService.decodeToken(jwtToken);
      if (payload) {
        setDecodedPayload(payload);
        console.log('✅ JWT token decoded successfully');
      } else {
        setError('Failed to decode JWT token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      console.error('❌ Error decoding JWT:', err);
    }
  };

  const checkExpiration = () => {
    if (!jwtToken) {
      setError('Please generate a JWT token first');
      return;
    }

    try {
      setError('');
      const isExpired = JWTService.isTokenExpired(jwtToken);
      const expiration = JWTService.getTokenExpiration(jwtToken);
      
      console.log('⏰ Token expiration check:', {
        isExpired,
        expiration: expiration?.toISOString()
      });
      
      if (isExpired) {
        setError('JWT token is expired');
      } else {
        setError('');
        alert(`Token is valid until: ${expiration?.toISOString()}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check expiration');
      console.error('❌ Error checking expiration:', err);
    }
  };

  const refreshJWT = async () => {
    if (!jwtToken) {
      setError('Please generate a JWT token first');
      return;
    }

    try {
      setError('');
      const newToken = await JWTService.refreshToken(jwtToken);
      setJwtToken(newToken);
      setDecodedPayload(null);
      console.log('✅ JWT token refreshed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh JWT');
      console.error('❌ Error refreshing JWT:', err);
    }
  };

  const clearAll = () => {
    setJwtToken('');
    setDecodedPayload(null);
    setError('');
    console.log('🧹 All JWT data cleared');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔐 JWT Token Test Component
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This component demonstrates JWT token generation, verification, and management using Stytch session data.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Sample Stytch Session Data
        </Typography>
        <Box component="pre" sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
          {JSON.stringify(sampleSessionData, null, 2)}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🚀 JWT Operations
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="contained" onClick={generateJWT}>
            Generate JWT
          </Button>
          <Button variant="outlined" onClick={verifyJWT} disabled={!jwtToken}>
            Verify JWT
          </Button>
          <Button variant="outlined" onClick={decodeJWT} disabled={!jwtToken}>
            Decode JWT
          </Button>
          <Button variant="outlined" onClick={checkExpiration} disabled={!jwtToken}>
            Check Expiration
          </Button>
          <Button variant="outlined" onClick={refreshJWT} disabled={!jwtToken}>
            Refresh JWT
          </Button>
          <Button variant="outlined" color="error" onClick={clearAll}>
            Clear All
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            ❌ Error: {error}
          </Typography>
        )}

        {jwtToken && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              🔑 Generated JWT Token:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={jwtToken}
              InputProps={{ readOnly: true }}
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </Box>
        )}

        {decodedPayload && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              📋 Decoded JWT Payload:
            </Typography>
            <Box component="pre" sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              fontSize: '0.875rem',
              overflow: 'auto'
            }}>
              {JSON.stringify(decodedPayload, null, 2)}
            </Box>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          💡 How It Works
        </Typography>
        <Typography variant="body2" paragraph>
          1. <strong>Generate JWT</strong>: Creates a JWT token from Stytch session data
        </Typography>
        <Typography variant="body2" paragraph>
          2. <strong>Verify JWT</strong>: Validates the token signature and expiration
        </Typography>
        <Typography variant="body2" paragraph>
          3. <strong>Decode JWT</strong>: Extracts payload without verification (for debugging)
        </Typography>
        <Typography variant="body2" paragraph>
          4. <strong>Check Expiration</strong>: Verifies if the token is still valid
        </Typography>
        <Typography variant="body2" paragraph>
          5. <strong>Refresh JWT</strong>: Generates a new token with the same payload
        </Typography>
      </Paper>
    </Box>
  );
};

export default JWTTest;
