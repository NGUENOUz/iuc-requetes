import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { errorResponse, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE D'AUTHENTIFICATION
// ═══════════════════════════════════════════════════════════════

export interface AuthenticatedUser {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  service_id?: string;
  is_active: boolean;
}

// Extraire et vérifier le token JWT
export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Récupérer les infos complètes de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(
          id,
          name,
          permissions
        )
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return userData as AuthenticatedUser;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}

// Middleware pour vérifier l'authentification
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return {
      error: errorResponse(
        'Non authentifié. Veuillez vous connecter.',
        ErrorCodes.UNAUTHORIZED,
        401
      ),
      user: null,
    };
  }

  if (!user.is_active) {
    return {
      error: errorResponse(
        'Votre compte est désactivé. Contactez l\'administrateur.',
        ErrorCodes.FORBIDDEN,
        403
      ),
      user: null,
    };
  }

  return { error: null, user };
}

// Middleware pour vérifier les rôles
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const { error, user } = await requireAuth(request);
  
  if (error) {
    return { error, user: null };
  }

  if (!user || !allowedRoles.includes(user.role.name)) {
    return {
      error: errorResponse(
        'Vous n\'avez pas les permissions nécessaires.',
        ErrorCodes.FORBIDDEN,
        403
      ),
      user: null,
    };
  }

  return { error: null, user };
}

// Middleware pour vérifier les permissions
export async function requirePermission(request: NextRequest, requiredPermission: string) {
  const { error, user } = await requireAuth(request);
  
  if (error) {
    return { error, user: null };
  }

  if (!user || !user.role.permissions.includes(requiredPermission)) {
    return {
      error: errorResponse(
        'Vous n\'avez pas la permission nécessaire.',
        ErrorCodes.FORBIDDEN,
        403
      ),
      user: null,
    };
  }

  return { error: null, user };
}

// Vérifier si l'utilisateur peut accéder à une requête
export async function canAccessRequest(
  user: AuthenticatedUser,
  requestId: string
): Promise<boolean> {
  try {
    const { data: requestData } = await supabase
      .from('requests')
      .select('student_id, assigned_to, service_id')
      .eq('id', requestId)
      .single();

    if (!requestData) {
      return false;
    }

    // Admin peut tout voir
    if (user.role.name === 'admin') {
      return true;
    }

    // Étudiant peut voir ses propres requêtes
    if (user.role.name === 'etudiant' && requestData.student_id === user.id) {
      return true;
    }

    // Agent/Chef de service peut voir les requêtes de son service ou qui lui sont assignées
    if (['agent', 'chef_service'].includes(user.role.name)) {
      if (requestData.assigned_to === user.id || requestData.service_id === user.service_id) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking request access:', error);
    return false;
  }
}

// Helper pour obtenir l'utilisateur ou retourner une erreur
export async function getAuthenticatedUser(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  
  if (error || !user) {
    return { error, user: null };
  }

  return { error: null, user };
}
