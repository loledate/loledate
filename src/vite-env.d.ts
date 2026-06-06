/// <reference types="vite/client" />



interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SITE_URL?: string
  readonly VITE_DISCORD_URL?: string
  readonly VITE_X_URL?: string
  readonly VITE_TIKTOK_URL?: string
}



interface ImportMeta {

  readonly env: ImportMetaEnv

}

