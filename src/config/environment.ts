// Environment configuration
// Use only Vite-exposed vars (VITE_*) on the client
const APP_ENVIRONMENT = (import.meta.env.VITE_APP_ENVIRONMENT as string) || (import.meta.env.MODE as string) || 'development';

// Resolve JWT secret without fallback defaults
// If APP_ENVIRONMENT === 'Staging' -> use STAGING_JWT_SECRET strictly
// Else -> use VITE_JWT_SECRET strictly
const RESOLVED_JWT_SECRET = APP_ENVIRONMENT === 'Staging'
  ? ((import.meta.env.VITE_STAGING_JWT_SECRET as string) || '')
  : ((import.meta.env.VITE_JWT_SECRET as string) || '');

export const ENV_CONFIG = {
  // Stytch Configuration
  STYTCH: {
    PROJECT_ID: import.meta.env.VITE_STYTCH_PROJECT_ID || '',
    SECRET: import.meta.env.VITE_STYTCH_SECRET || '',
    PUBLIC_TOKEN: import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || '',
  },
  
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    API_KEY: import.meta.env.VITE_API_KEY || '',
    ORG_ID: import.meta.env.VITE_ORG_ID || '',
  },
  
  // JWT Configuration
  JWT: {
    SECRET: RESOLVED_JWT_SECRET,
    EXPIRATION: import.meta.env.VITE_JWT_EXPIRATION || '24h',
  },
  
  // App Configuration
  APP: {
    NAME: 'Recon Labs',
    VERSION: '1.0.0',
    ENVIRONMENT: APP_ENVIRONMENT,
  },
};

// Validation
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_STYTCH_PUBLIC_TOKEN',
    'VITE_API_BASE_URL',
    'VITE_API_KEY',
    'VITE_ORG_ID',
  ];

  const missing = requiredVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Please check your .env file configuration');
  }

  return missing.length === 0;
};

// Development helpers
export const isDevelopment = () => ENV_CONFIG.APP.ENVIRONMENT === 'development';
export const isProduction = () => ENV_CONFIG.APP.ENVIRONMENT === 'production'; 
export const isStaging = () => ENV_CONFIG.APP.ENVIRONMENT === 'Staging';