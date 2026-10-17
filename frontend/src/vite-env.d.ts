/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SERVICE_URL?: string;
  readonly VITE_DECISION_ENGINE_URL?: string;
  readonly VITE_AI_SERVICE_URL?: string;
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
