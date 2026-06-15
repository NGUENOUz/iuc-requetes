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
