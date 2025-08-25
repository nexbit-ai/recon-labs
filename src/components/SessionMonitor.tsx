import React, { useEffect } from 'react';
import { useStytchMemberSession } from '@stytch/react/b2b';

/**
 * SessionMonitor component for comprehensive Stytch session logging
 * This component can be placed anywhere in the app to monitor session changes
 */
const SessionMonitor: React.FC = () => {
  const { session, isInitialized } = useStytchMemberSession();

  useEffect(() => {
    // Log when the component mounts
    console.log('📊 Initial state:', { isInitialized, hasSession: !!session });
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default SessionMonitor;
