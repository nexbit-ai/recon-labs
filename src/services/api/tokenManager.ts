import { AuthTokens, TokenConfig } from './types';
import { API_CONFIG } from './config';

class TokenManager {
  private config: TokenConfig;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(config: TokenConfig) {
    this.config = {
      storageKey: 'auth_tokens',
      autoRefresh: true,
      refreshThreshold: 300, // 5 minutes before expiry
      ...config,
    };
  }

  // Store tokens in localStorage
  setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  // Get tokens from localStorage
  getTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(this.config.storageKey);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  // Get access token
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  // Get refresh token
  getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.refreshToken || null;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens?.expiresAt) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return tokens.expiresAt <= now;
  }

  // Check if token needs refresh (within threshold)
  shouldRefreshToken(): boolean {
    if (!this.config.autoRefresh) return false;
    
    const tokens = this.getTokens();
    if (!tokens?.expiresAt) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const threshold = this.config.refreshThreshold || 300;
    
    return tokens.expiresAt - now <= threshold;
  }

  // Clear tokens
  clearTokens(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Update tokens (for refresh scenarios)
  updateTokens(updates: Partial<AuthTokens>): void {
    const currentTokens = this.getTokens();
    if (currentTokens) {
      const updatedTokens = { ...currentTokens, ...updates };
      this.setTokens(updatedTokens);
    }
  }

  // Get authorization header
  getAuthHeader(): string | null {
    const tokens = this.getTokens();
    if (!tokens?.accessToken) return null;
    
    const tokenType = tokens.tokenType || 'Bearer';
    return `${tokenType} ${tokens.accessToken}`;
  }

  // Set refresh promise to prevent multiple simultaneous refresh calls
  setRefreshPromise(promise: Promise<AuthTokens>): void {
    this.refreshPromise = promise;
  }

  // Get current refresh promise
  getRefreshPromise(): Promise<AuthTokens> | null {
    return this.refreshPromise;
  }

  // Clear refresh promise
  clearRefreshPromise(): void {
    this.refreshPromise = null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!(tokens?.accessToken && !this.isTokenExpired());
  }

  // Get token expiry time
  getTokenExpiry(): number | null {
    const tokens = this.getTokens();
    return tokens?.expiresAt || null;
  }

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(): number | null {
    const expiry = this.getTokenExpiry();
    if (!expiry) return null;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, expiry - now);
  }

  // API Key and Organization ID management
  setApiCredentials(apiKey: string, orgId: string): void {
    try {
      localStorage.setItem('recon_labs_api_key', apiKey);
      localStorage.setItem('recon_labs_org_id', orgId);
    } catch (error) {
      console.error('Failed to store API credentials:', error);
    }
  }

  getApiKey(): string | null {
    try {
      return localStorage.getItem('recon_labs_api_key');
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  getOrgId(): string | null {
    try {
      return localStorage.getItem('recon_labs_org_id');
    } catch (error) {
      console.error('Failed to retrieve organization ID:', error);
      return null;
    }
  }

  clearApiCredentials(): void {
    try {
      localStorage.removeItem('recon_labs_api_key');
      localStorage.removeItem('recon_labs_org_id');
    } catch (error) {
      console.error('Failed to clear API credentials:', error);
    }
  }

  // Get API headers
  getApiHeaders(): Record<string, string> {
    const apiKey = this.getApiKey() || API_CONFIG.API_KEY;
    const orgId = this.getOrgId() || API_CONFIG.ORG_ID;
    
    return {
      'X-API-Key': apiKey,
      'X-Org-ID': orgId,
    };
  }
}

// Create default token manager instance
export const tokenManager = new TokenManager({
  storageKey: 'recon_labs_auth_tokens',
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
});

export default TokenManager; 