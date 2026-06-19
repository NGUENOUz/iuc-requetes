import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/schemas';
import { getUserByMatricule } from '@/lib/utils/supabaseHelpers';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/login - Connexion utilisateur
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Parser et valider le body
    const body = await parseRequestBody(request);
    const validatedData = loginSchema.parse(body);

    // Resolve identifier to email (support email or matricule)
    let email: string | undefined;
  console.log('[Login] Starting login flow');
    if (validatedData.identifier.includes('@')) {
      email = validatedData.identifier;
    } else {
      const user = await getUserByMatricule(validatedData.identifier);
      if (!user) {
        return errorResponse('Matricule introuvable', ErrorCodes.NOT_FOUND, 404);
      }
      email = user.email;
    }

    // Authentification avec Supabase
    console.log('[Login] Attempting signIn with email:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: validatedData.password,
    });

    if (authError) {
      console.error('[Login] Supabase auth error:', authError);

      return errorResponse(
        'Email ou mot de passe incorrect',
        ErrorCodes.INVALID_CREDENTIALS,
        401
      );
    }

    if (!authData.user) {
      console.error('[Login] No user returned from Supabase auth despite no error');

      return errorResponse(
        'Erreur lors de la connexion',
        ErrorCodes.UNAUTHORIZED,
        401
      );
    }

    // Récupérer les informations complètes de l'utilisateur
    // Fetch full user profile after successful auth
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*),
        service:services(*)
      `)
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userError || !userData) {
      return errorResponse(
        'Utilisateur non trouvé',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Vérifier si l'utilisateur est actif
    if (!userData.is_active) {
      return errorResponse(
        'Votre compte est désactivé. Contactez l\'administrateur.',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    // Créer un log d'activité
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userData.id,
        action: 'user_login',
        entity_type: 'user',
        entity_id: userData.id,
        description: 'Connexion réussie',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      });

    return successResponse({
      user: userData,
      session: authData.session,
      mustSetPassword: userData.must_set_password,
    });

  } catch (error) {
    return handleError(error);
  }
}
