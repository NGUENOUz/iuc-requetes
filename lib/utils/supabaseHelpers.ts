import { supabase, supabaseAdmin } from '@/lib/supabase';
import { UserProfile } from '@/lib/types/supabase';

/**
 * Retrieve a user record (including email) by their university matricule.
 * Returns the full user row from the `users` table.
 */
export async function getUserByMatricule(matricule: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      role:roles(id, name, permissions),
      service:services(id, name)
    `)
    .eq('matricule', matricule)
    .single();

  if (error || !data) {
    console.error('getUserByMatricule error:', error);
    return null;
  }
  return data as UserProfile;
}
