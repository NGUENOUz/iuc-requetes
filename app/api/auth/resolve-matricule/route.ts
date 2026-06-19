import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserByMatricule } from '@/lib/utils/supabaseHelpers';

/**
 * Resolve a university matricule to the associated email.
 * Returns { email } or 404 if not found.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matricule = searchParams.get('matricule');
  if (!matricule) {
    return NextResponse.json({ error: 'Matricule manquant' }, { status: 400 });
  }

  const user = await getUserByMatricule(matricule);
  if (!user) {
    return NextResponse.json({ error: 'Matricule introuvable' }, { status: 404 });
  }

  return NextResponse.json({ email: user.email });
}
