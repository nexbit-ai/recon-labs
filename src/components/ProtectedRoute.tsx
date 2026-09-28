import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useStytchMemberSession } from '@stytch/react/b2b';
import { useOrganization } from '../hooks/useOrganization';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isInitialized } = useStytchMemberSession();
  const location = useLocation();
  
  // Use organization hook to set organization ID for API requests
  useOrganization();

  // Show loading spinner while checking authentication
  if (!isInitialized) {
    return (
      <Box sx={{ width: '100%', position: 'fixed', top: 0, zIndex: 9999 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 