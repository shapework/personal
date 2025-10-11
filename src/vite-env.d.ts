/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: string
  readonly VITE_LONG_CAT_API_KEY: string
  readonly VITE_LONG_CAT_URL: string
  readonly VITE_FIREBASE_ADMIN_PROJECT_ID: string
  readonly VITE_FIREBASE_ADMIN_CLIENT_EMAIL: string
  readonly VITE_FIREBASE_ADMIN_PRIVATE_KEY: string
  readonly VITE_SMTP_USERNAME: string
  readonly VITE_SMTP_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
