import { useEffect } from 'react';
import { useStytchMemberSession } from '@stytch/react/b2b';
import { tokenManager } from '../services/api/tokenManager';

export const useOrganization = () => {
  const { session, isInitialized } = useStytchMemberSession();

  useEffect(() => {
    const initializeCredentials = async () => {    
      if (isInitialized && session) {
        // Extract organization ID from Stytch session
        const organizationId = session.organization_id;
        
        
        if (organizationId) {
          
          // Prepare session data for JWT token generation
          const sessionData = {
            member_id: session.member_id,
            member_session_id: session.member_session_id,
            organization_id: session.organization_id,
            organization_slug: session.organization_slug,
            roles: session.roles
          };
          
          try {
            // Set JWT credentials (this will generate and store the JWT token)
            await tokenManager.setJWTCredentials(sessionData);
          } catch (error) {
            console.error('❌ Error setting JWT credentials:', error);
          }
          
        } 
      } else {
        console.log('⏳ Not yet initialized');
      }
    };

    initializeCredentials();
  }, [session, isInitialized]);

  return {
    organizationId: session?.organization_id,
    isInitialized,
    authMethod: tokenManager.getAuthMethod(),
    hasValidCredentials: tokenManager.getAuthStatus().hasValidCredentials
  };
};
