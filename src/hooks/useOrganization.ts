import { useEffect } from 'react';
import { useStytchMemberSession } from '@stytch/react/b2b';
import { tokenManager } from '../services/api/tokenManager';

export const useOrganization = () => {
  const { session, isInitialized } = useStytchMemberSession();

  useEffect(() => {
    console.log('useOrganization hook triggered:', { isInitialized, session, hasOrgId: !!session?.organization_id });
    
    if (isInitialized && session) {
      // Extract organization ID from Stytch session
      const organizationId = session.organization_id;
      
      console.log('Full session object:', session);
      console.log('Organization ID found:', organizationId);
      
      if (organizationId) {
        console.log('Setting organization ID from Stytch session:', organizationId);
        
        // Get the API key from environment or existing storage
        const apiKey = import.meta.env.VITE_API_KEY || 'kapiva-7b485b6a865b2b4a3d728ef2fd4f3';
        
        // Check if we already have the API key set
        const currentApiKey = tokenManager.getApiKey();
        if (!currentApiKey) {
          console.log('Setting API key for the first time');
          tokenManager.setApiCredentials(apiKey, organizationId);
        } else {
          console.log('API key already set, just updating organization ID');
          // Only update the organization ID, keep the existing API key
          tokenManager.setApiCredentials(currentApiKey, organizationId);
        }
        
        // Verify it was set
        const storedOrgId = tokenManager.getOrgId();
        console.log('Organization ID set successfully for API requests. Stored:', storedOrgId);
        
        // Also log the API headers that will be sent
        const apiHeaders = tokenManager.getApiHeaders();
        console.log('API headers that will be sent:', apiHeaders);
      } else {
        console.warn('No organization ID found in Stytch session');
        console.log('Available session properties:', Object.keys(session));
      }
    } else if (isInitialized && !session) {
      console.log('Session is initialized but no session exists');
      // Still set the API key even if no organization ID yet
      const apiKey = import.meta.env.VITE_API_KEY || 'kapiva-7b485b6a865b2b4a3d728ef2fd4f3';
      const currentApiKey = tokenManager.getApiKey();
      if (!currentApiKey) {
        console.log('Setting API key while waiting for organization ID');
        tokenManager.setApiCredentials(apiKey, '');
      }
    } else {
      console.log('Not yet initialized');
    }
  }, [session, isInitialized]);

  return {
    organizationId: session?.organization_id,
    isInitialized,
  };
};
