import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByMatricule } from '@/lib/utils/supabaseHelpers';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// GET - Récupérer l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return errorResponse('Non authentifié', ErrorCodes.UNAUTHORIZED, 401);
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !authUser) {
      return errorResponse('Session invalide', ErrorCodes.UNAUTHORIZED, 401);
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*),
        service:services(*)
      `)
      .eq('auth_user_id', authUser.id)
      .single();

    if (userError || !userData) {
      return errorResponse('Utilisateur non trouvé', ErrorCodes.NOT_FOUND, 404);
    }

    return successResponse(userData);
  } catch (error) {
    return handleError(error);
  }
}

// POST - Vérifier si un utilisateur existe
export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const { identifier } = body;

    if (!identifier) {
      return errorResponse('Identifiant requis', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // Chercher par email ou matricule
    let user;
    if (identifier.includes('@')) {
      const { data } = await supabase
        .from('users')
        .select('id, email, must_set_password')
        .eq('email', identifier)
        .single();
      user = data;
    } else {
      user = await getUserByMatricule(identifier);
    }

    if (!user) {
      return errorResponse('Utilisateur non trouvé', ErrorCodes.NOT_FOUND, 404);
    }

    return successResponse({
      exists: true,
      mustSetPassword: user.must_set_password || false,
    });
  } catch (error) {
    return handleError(error);
  }
}
