import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, successResponse, ErrorCodes } from '@/lib/utils/api.utils';
import { getUserByMatricule } from '@/lib/utils/supabaseHelpers';

/**
 * POST /api/auth/password
 * Sets a new password for a user identified by email or matricule.
 * Request body: { identifier, newPassword }
 */
export async function POST(request: Request) {
  try {
    const { identifier, newPassword } = await request.json();
    if (!identifier || !newPassword) {
      return errorResponse('Identifiant et nouveau mot de passe requis', ErrorCodes.BAD_REQUEST, 400);
    }

    // Resolve user record
    let userRecord;
    if (identifier.includes('@')) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, auth_user_id')
        .eq('email', identifier)
        .single();
      if (error) return errorResponse('Utilisateur introuvable', ErrorCodes.NOT_FOUND, 404);
      userRecord = data;
    } else {
      const user = await getUserByMatricule(identifier);
      if (!user) return errorResponse('Matricule introuvable', ErrorCodes.NOT_FOUND, 404);
      userRecord = { id: user.id, auth_user_id: user.auth_user_id };
    }

    // Update password via Supabase admin
    const { error: pwdError } = await supabaseAdmin.auth.admin.updateUser(userRecord.auth_user_id, {
      password: newPassword,
    });
    if (pwdError) return errorResponse('Erreur lors de la mise à jour du mot de passe', ErrorCodes.UPDATE_FAILED, 500);

    // Clear must_set_password flag
    await supabaseAdmin
      .from('users')
      .update({ must_set_password: false })
      .eq('id', userRecord.id);

    return successResponse({ message: 'Mot de passe mis à jour' }, undefined);
  } catch (err) {
    return errorResponse('Erreur serveur', ErrorCodes.INTERNAL, 500);
  }
}
