/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
