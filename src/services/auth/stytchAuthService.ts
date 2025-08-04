import { StytchUIClient } from '@stytch/vanilla-js';
import { tokenManager } from '../api/tokenManager';
import { ENV_CONFIG } from '../../config/environment';

// Stytch configuration
const STYTCH_CONFIG = {
  projectId: ENV_CONFIG.STYTCH.PROJECT_ID,
  secret: ENV_CONFIG.STYTCH.SECRET,
  publicToken: ENV_CONFIG.STYTCH.PUBLIC_TOKEN,
};

// Initialize Stytch client
let stytchClient: StytchUIClient | null = null;

export const initializeStytch = () => {
  if (!stytchClient && STYTCH_CONFIG.publicToken) {
    stytchClient = new StytchUIClient(STYTCH_CONFIG.publicToken);
  }
  return stytchClient;
};

export const getStytchClient = () => {
  if (!stytchClient) {
    throw new Error('Stytch client not initialized. Call initializeStytch() first.');
  }
  return stytchClient;
};

// Authentication service class
class StytchAuthService {
  private client: StytchUIClient | null = null;

  constructor() {
    this.client = initializeStytch();
  }

  // Initialize authentication
  async initialize(): Promise<void> {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    // Check for existing session
    try {
      const session = await this.client.session.authenticate();
      if (session.session_token) {
        // Store session token in token manager
        tokenManager.setTokens({
          accessToken: session.session_token,
          refreshToken: session.session_token, // Stytch uses session tokens
          tokenType: 'Bearer',
          expiresAt: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
        });
      }
    } catch (error) {
      console.log('No existing session found');
    }
  }

  // Email/password authentication
  async authenticateWithEmail(email: string, password: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      const response = await this.client.passwords.authenticate({
        email_address: email,
        password: password,
        session_duration_minutes: 60 * 24 * 7, // 7 days
      });

      if (response.session_token) {
        // Store session token
        tokenManager.setTokens({
          accessToken: response.session_token,
          refreshToken: response.session_token,
          tokenType: 'Bearer',
          expiresAt: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  // Email/password registration
  async registerWithEmail(email: string, password: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      const response = await this.client.passwords.create({
        email_address: email,
        password: password,
        session_duration_minutes: 60 * 24 * 7, // 7 days
      });

      if (response.session_token) {
        // Store session token
        tokenManager.setTokens({
          accessToken: response.session_token,
          refreshToken: response.session_token,
          tokenType: 'Bearer',
          expiresAt: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      await this.client.passwords.resetStart({
        email_address: email,
      });
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      const response = await this.client.passwords.reset({
        token: token,
        password: newPassword,
        session_duration_minutes: 60 * 24 * 7, // 7 days
      });

      if (response.session_token) {
        // Store session token
        tokenManager.setTokens({
          accessToken: response.session_token,
          refreshToken: response.session_token,
          tokenType: 'Bearer',
          expiresAt: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Password reset with token failed:', error);
      return false;
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      await this.client.session.revoke();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear tokens regardless of API call success
      tokenManager.clearTokens();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  }

  // Get current user info
  async getCurrentUser() {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      const response = await this.client.user.get();
      return response.user;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(updates: { name?: { first_name?: string; last_name?: string } }) {
    if (!this.client) {
      throw new Error('Stytch client not available');
    }

    try {
      const response = await this.client.user.update(updates);
      return response.user;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const stytchAuthService = new StytchAuthService();
export default StytchAuthService; 