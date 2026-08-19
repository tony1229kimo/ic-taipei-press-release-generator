/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** LIFF ID from the LINE Developers Console. Optional — sharing degrades to LINE's URL scheme without it. */
  readonly VITE_LIFF_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
