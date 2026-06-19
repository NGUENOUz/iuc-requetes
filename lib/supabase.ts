import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// CLIENT SUPABASE
// ═══════════════════════════════════════════════════════════════

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL et Anon Key doivent être définis dans .env.local');
}

// Client Supabase pour le client-side
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Obtenir un client Supabase avec le token utilisateur pour appliquer les politiques RLS
export function getSupabaseClient(token?: string) {
  if (!token) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// Client Supabase pour le server-side (avec service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

