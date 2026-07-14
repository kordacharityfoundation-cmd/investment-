import { createClient } from '@supabase/supabase-js';

// Read credentials from Vite's environment variables
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'WARNING: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing from environment variables. Please configure these in your development environment or Vercel dashboard.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
