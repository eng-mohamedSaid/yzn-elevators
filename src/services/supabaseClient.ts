import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client — configured from Vite env vars.
 *
 * Put your credentials in a git-ignored `.env` at the project root:
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon-public-key>
 *
 * When the vars are absent, `supabase` is null and `dataService` transparently
 * falls back to localStorage — so the app keeps working before Supabase is wired.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false }, // login is handled locally, not via Supabase Auth
    })
  : null;
