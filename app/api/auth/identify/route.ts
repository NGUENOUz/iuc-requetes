import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/utils/api.utils';
import { getUserByMatricule } from '@/lib/utils/supabaseHelpers';
import { supabaseAdmin } from '@/lib/supabase';

// ---------------------------------------------------------------
// POST /api/auth/identify
// ---------------------------------------------------------------
// Body: { identifier }
// Returns the user's role and whether they must set a password.
// If the identifier is an email we look it up directly, otherwise we
// treat it as a matricule and resolve it to an email first.
export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();
  console.log('[Identify] Request received with identifier:', identifier);
    if (!identifier) {
      return errorResponse('Identifiant requis', ErrorCodes.BAD_REQUEST, 400);
    }

    // Resolve identifier -> email & user record
    let userRecord: any;
  console.log('[Identify] Starting user lookup...');
    if (identifier.includes('@')) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, role:roles(name), must_set_password')
        .eq('email', identifier)
        .single();
      if (error) {
        console.error('[Identify] DB error fetching by email:', error);
        return errorResponse('Utilisateur introuvable', ErrorCodes.NOT_FOUND, 404);
      }
      userRecord = data;
    } else {
      const user = await getUserByMatricule(identifier);
      if (!user) {
        console.error('[Identify] Matricule not found:', identifier);
        return errorResponse('Matricule introuvable', ErrorCodes.NOT_FOUND, 404);
      }
      userRecord = {
        id: user.id,
        role: { name: user.role?.name },
        must_set_password: user.must_set_password,
      };
    }

    console.log('[Identify] User record resolved:', userRecord);
    return successResponse({
      role: userRecord.role?.name ?? null,
      mustSetPassword: !!userRecord.must_set_password,
      identifier,
    });
  } catch (e) {
    console.error('[Identify] Unexpected error:', e);
      return errorResponse('Erreur serveur', ErrorCodes.INTERNAL_ERROR, 500);
  }
}
