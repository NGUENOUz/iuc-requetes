import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse, handleError } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/logout - Déconnexion utilisateur
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Récupérer la session actuelle
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Logger la déconnexion avant de supprimer la session
      await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          action: 'user_logout',
          entity_type: 'user',
          entity_id: session.user.id,
          description: 'Déconnexion',
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        });
    }

    // Déconnecter l'utilisateur
    const { error } = await supabase.auth.signOut();

    if (error) {
      return errorResponse('Erreur lors de la déconnexion', 'LOGOUT_FAILED', 500);
    }

    return successResponse({ message: 'Déconnexion réussie' });

  } catch (error) {
    return handleError(error);
  }
}
