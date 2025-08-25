import * as jose from 'jose';
import { ENV_CONFIG } from '../../config/environment';

// JWT configuration from environment
const JWT_EXPIRATION = ENV_CONFIG.JWT.EXPIRATION;

// Resolve and validate secret at runtime to avoid unsigned/invalid tokens
function getJwtSecretBytes(): Uint8Array {
  const secret = ENV_CONFIG.JWT.SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('JWT secret is not configured. Set STAGING_JWT_SECRET when APP_ENVIRONMENT=Staging, or VITE_JWT_SECRET otherwise.');
  }
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  member_id: string;
  member_session_id: string;
  organization_id: string;
  organization_slug: string;
  roles: string[];
  iat?: number;
  exp?: number;
  [key: string]: any; // Allow additional properties for jose compatibility
}

export interface StytchSessionData {
  member_id: string;
  member_session_id: string;
  organization_id: string;
  organization_slug: string;
  roles: string[];
}

export class JWTService {
  /**
   * Generate JWT token from Stytch session data
   */
  static async generateToken(sessionData: StytchSessionData): Promise<string> {
    try {
      
      // Create a secret key from the JWT secret
      const secretKey = getJwtSecretBytes();
      
      // Create the JWT payload
      const payload: JWTPayload = {
        member_id: sessionData.member_id,
        member_session_id: sessionData.member_session_id,
        organization_id: sessionData.organization_id,
        organization_slug: sessionData.organization_slug,
        roles: sessionData.roles,
      };

      // Sign the JWT token
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRATION)
        .sign(secretKey);

      
      return token;
    } catch (error) {
      console.error('❌ Error generating JWT token:', error);
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verify and decode JWT token
   */
  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      // Create a secret key from the JWT secret
      const secretKey = getJwtSecretBytes();
      
      // Verify and decode the JWT token
      const { payload } = await jose.jwtVerify(token, secretKey);
      
      
      return payload as unknown as JWTPayload;
    } catch (error) {
      console.error('❌ Error verifying JWT token:', error);
      throw new Error('Invalid JWT token');
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      // Decode the JWT token without verification
      const decoded = jose.decodeJwt(token);
      
      
      return decoded as unknown as JWTPayload;
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Check if JWT token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('❌ Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Refresh JWT token (generate new token with same payload)
   */
  static async refreshToken(token: string): Promise<string> {
    try {
      const decoded = await this.verifyToken(token);
      
      // Remove existing timestamps
      const { iat, exp, ...payload } = decoded;
      
      return await this.generateToken(payload as StytchSessionData);
    } catch (error) {
      console.error('❌ Error refreshing JWT token:', error);
      throw new Error('Failed to refresh JWT token');
    }
  }
}

export default JWTService;
