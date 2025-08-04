// Environment configuration
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
  
  // App Configuration
  APP: {
    NAME: 'Recon Labs',
    VERSION: '1.0.0',
    ENVIRONMENT: import.meta.env.MODE || 'development',
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