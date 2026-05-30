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
    // Always use the hardcoded API key from config
    return API_CONFIG.API_KEY;
  }

  /**
   * Get legacy organization ID (for backward compatibility)
   */
  getOrgId(): string | null {
    // Always use the hardcoded organization ID from config
    return API_CONFIG.ORG_ID;
  }

  /**
   * Get API headers - JWT takes priority, falls back to legacy headers
   */
  getApiHeaders(): Record<string, string> {
    const jwtToken = this.getJWTToken();
    
    if (jwtToken && !JWTService.isTokenExpired(jwtToken)) {
      // Decode token to get organization_id
      const decoded = JWTService.decodeToken(jwtToken);
      const organizationId = decoded?.organization_id || this.getOrgId();
      
      // Use JWT token with organization ID header
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      };
      
      
      return headers;
    }
    
    // Fallback to legacy API key + org ID if available
    const apiKey = this.getApiKey();
    const orgId = this.getOrgId();
    if (apiKey && orgId) {
      return {
        'X-API-Key': apiKey,
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
   * Get D2C API headers - Always use legacy API key + org ID for D2C calls
   * Also includes Authorization header if JWT token is available
   */
  getD2CApiHeaders(): Record<string, string> {
    const apiKey = this.getApiKey();
    const orgId = this.getOrgId();
    const jwtToken = this.getJWTToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Always include API key and org ID if available
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    // Also include Authorization header if JWT token is available
    if (jwtToken && !JWTService.isTokenExpired(jwtToken)) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
      
    }
    
    // If we have at least API key or JWT, return headers
    if (apiKey || (jwtToken && !JWTService.isTokenExpired(jwtToken))) {
      return headers;
    }
    
    // No credentials available
    console.error('❌ No valid credentials available for D2C API requests');
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