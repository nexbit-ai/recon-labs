/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_ORG_ID: string
  readonly VITE_ENABLE_AI_RECONCILIATION: string
  readonly VITE_ENABLE_REAL_TIME_UPDATES: string
  readonly VITE_ENABLE_ADVANCED_ANALYTICS: string
  readonly VITE_ENABLE_CACHE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 