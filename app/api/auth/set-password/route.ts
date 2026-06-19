import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/set-password - Définir le mot de passe initial
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const { identifier, password } = body;

    if (!identifier || !password) {
      return errorResponse('Identifiant et mot de passe requis', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // Trouver l'utilisateur par email ou matricule
    let user;
    if (identifier.includes('@')) {
      const { data } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('email', identifier)
        .single();
      user = data;
    } else {
      const { data } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('matricule', identifier)
        .single();
      user = data;
    }

    if (!user) {
      return errorResponse('Utilisateur non trouvé', ErrorCodes.NOT_FOUND, 404);
    }

    // Créer ou mettre à jour l'utilisateur dans auth.users
    let authUser;
    if (user.auth_user_id) {
      // Mettre à jour le mot de passe existant
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.auth_user_id,
        { password }
      );
      if (error) throw error;
      authUser = data.user;
    } else {
      // Créer le compte auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      authUser = data.user;

      // Lier auth_user_id dans users
      await supabaseAdmin
        .from('users')
        .update({ auth_user_id: authUser.id })
        .eq('id', user.id);
    }

    // Marquer que le mot de passe a été défini
    await supabaseAdmin
      .from('users')
      .update({ must_set_password: false })
      .eq('id', user.id);

    // Se connecter automatiquement
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (signInError) {
      return errorResponse('Erreur de connexion automatique', ErrorCodes.UNAUTHORIZED, 401);
    }

    // Récupérer le profil complet
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        role:roles(*),
        service:services(*)
      `)
      .eq('id', user.id)
      .single();

    return successResponse({
      user: userData,
      session: authData.session,
    });

  } catch (error) {
    return handleError(error);
  }
}
