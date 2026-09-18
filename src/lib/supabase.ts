import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials safely from Vite environment or node process env
const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "";

const rawKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  "";

// Fallback to placeholder URL format if missing, preventing createClient from throwing an unhandled exception at module load during SSR
const supabaseUrl = rawUrl.trim() || "https://placeholder.supabase.co";
const supabaseAnonKey = rawKey.trim() || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(rawUrl.trim() && rawKey.trim());

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not set. Ensure they are configured in Vercel project environment variables.",
  );
}

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});
