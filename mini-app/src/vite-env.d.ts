// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOT_API_URL: string;
  readonly VITE_WEBAPP_URL: string;
  readonly VITE_TELEGRAM_BOT_NAME: string;
  readonly VITE_DEBUG: string;
  readonly VITE_ENABLE_HAPTIC: string;
  readonly VITE_ENABLE_ANIMATIONS: string;
  readonly VITE_ENABLE_SOUNDS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
