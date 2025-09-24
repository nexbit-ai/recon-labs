import JWTService, { JWTPayload, StytchSessionData } from '../auth/jwtService';
import { API_CONFIG } from './config';

class TokenManager {
  private jwtToken: string | null = null;
  private apiKey: string | null = null;
  private orgId: string | null = null;

  /**
   * Set JWT credentials from Stytch session data
   */
  async setJWTCredentials(sessionData: StytchSessionData): Promise<void> {
    try {
      // Generate JWT token from session data
      const token = await JWTService.generateToken(sessionData);
      
      // Store the JWT token
      this.jwtToken = token;
      
      // Also store the organization ID for backward compatibility during transition
      this.orgId = sessionData.organization_id;
      
      // Store in localStorage for persistence
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('organization_id', sessionData.organization_id);
      
      
    } catch (error) {
      console.error('❌ Error setting JWT credentials:', error);
      throw error;
    }
  }

  /**
   * Set legacy API credentials (for backward compatibility)
   */
  setApiCredentials(apiKey: string, orgId: string): void {
    console.log('⚠️ Setting legacy API credentials (deprecated - use JWT instead)');
    this.apiKey = apiKey;
    this.orgId = orgId;
    
    // Store in localStorage for persistence
    localStorage.setItem('api_key', apiKey);
    localStorage.setItem('organization_id', orgId);
  }

  /**
   * Get JWT token
   */
  getJWTToken(): string | null {
    if (!this.jwtToken) {
      // Try to load from localStorage
      this.jwtToken = localStorage.getItem('jwt_token');
      if (this.jwtToken) {
        console.log('🔄 JWT token loaded from localStorage');
      }
    }
    return this.jwtToken;
  }

  /**
   * Get legacy API key (for backward compatibility)
   */
  getApiKey(): string | null {
    if (!this.apiKey) {
      // Try to load from localStorage
      this.apiKey = localStorage.getItem('api_key');
      if (this.apiKey) {
        console.log('🔄 API key loaded from localStorage');
      } else {
        // Fallback to config API key
        this.apiKey = API_CONFIG.API_KEY;
        console.log('🔄 Using fallback API key from config');
      }
    }
    return this.apiKey;
  }

  /**
   * Get legacy organization ID (for backward compatibility)
   */
  getOrgId(): string | null {
    if (!this.orgId) {
      // Try to load from localStorage
      this.orgId = localStorage.getItem('organization_id');
      if (this.orgId) {
        console.log('🔄 Organization ID loaded from localStorage');
      } else {
        // Fallback to config organization ID
        this.orgId = API_CONFIG.ORG_ID;
        console.log('🔄 Using fallback organization ID from config');
      }
    }
    return this.orgId;
  }

  /**
   * Get API headers - JWT takes priority, falls back to legacy headers
   */
  getApiHeaders(): Record<string, string> {
    const jwtToken = this.getJWTToken();
    const orgId = this.getOrgId();
    
    if (jwtToken && !JWTService.isTokenExpired(jwtToken)) {
      // Use JWT token with organization ID header
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      };
      
      // Add organization ID header if available
      if (orgId) {
        headers['X-Org-ID'] = orgId;
      }
      
      return headers;
    }
    
    // Fallback to legacy API key + org ID if available
    const apiKey = this.getApiKey();
    if (apiKey && orgId) {
      return {
        'X-API-Key': apiKey,
        'X-Org-ID': orgId,
        'Content-Type': 'application/json'
      };
    }
    
    // No credentials available
    console.error('❌ No valid credentials available for API requests');
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if JWT token is available and valid
   */
  hasValidJWT(): boolean {
    const token = this.getJWTToken();
    return token !== null && !JWTService.isTokenExpired(token);
  }

  /**
   * Check if legacy credentials are available
   */
  hasLegacyCredentials(): boolean {
    return false;
  }

  /**
   * Clear all stored credentials
   */
  clearCredentials(): void {
    console.log('🧹 Clearing all stored credentials');
    
    this.jwtToken = null;
    this.apiKey = null;
    this.orgId = null;
    
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('api_key');
    localStorage.removeItem('organization_id');
    
    console.log('✅ All credentials cleared');
  }

  /**
   * Get current authentication method
   */
  getAuthMethod(): 'jwt' | 'legacy' | 'none' {
    if (this.hasValidJWT()) return 'jwt';
    return 'none';
  }

  /**
   * Get authentication status summary
   */
  getAuthStatus(): {
    method: 'jwt' | 'legacy' | 'none';
    hasValidCredentials: boolean;
    jwtExpiration?: Date;
    organizationId?: string;
  } {
    const method = this.getAuthMethod();
    const jwtToken = this.getJWTToken();
    
    return {
      method,
      hasValidCredentials: method === 'jwt',
      jwtExpiration: jwtToken ? JWTService.getTokenExpiration(jwtToken) || undefined : undefined,
      organizationId: this.getOrgId() || undefined
    };
  }

  // Backward compatibility methods for existing code
  getRefreshToken(): string | null {
    console.log('⚠️ getRefreshToken() called - not implemented in JWT system');
    return null;
  }

  setTokens(tokens: any): void {
    console.log('⚠️ setTokens() called - not implemented in JWT system');
  }

  clearTokens(): void {
    console.log('⚠️ clearTokens() called - redirecting to clearCredentials()');
    this.clearCredentials();
  }

  isAuthenticated(): boolean {
    return this.hasValidJWT() || this.hasLegacyCredentials();
  }

  getAccessToken(): string | null {
    return this.getJWTToken();
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
export default tokenManager; 