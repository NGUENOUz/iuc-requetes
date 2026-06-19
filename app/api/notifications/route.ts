import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { 
  successResponse, 
  errorResponse, 
  handleError,
  getPaginationParams,
  getPaginationMetadata,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireAuth } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// GET /api/notifications - Récupérer les notifications de l'utilisateur
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { error: authError, user: userData } = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);
    const isRead = searchParams.get('is_read');

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userData!.id);

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des notifications',
        ErrorCodes.DATABASE_ERROR,
        500,
        error.message
      );
    }

    return successResponse(
      data,
      getPaginationMetadata(count || 0, page, limit)
    );

  } catch (error) {
    return handleError(error);
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/notifications - Marquer comme lu
// ═══════════════════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { error: authError, user: userData } = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const markAllAsRead = searchParams.get('mark_all') === 'true';

    let query = supabaseAdmin
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userData!.id);

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      query = query.eq('is_read', false);
    } else if (notificationId) {
      // Marquer une seule notification
      query = query.eq('id', notificationId);
    } else {
      return errorResponse(
        'ID de notification ou mark_all requis',
        ErrorCodes.INVALID_INPUT,
        400
      );
    }

    const { error } = await query;

    if (error) {
      return errorResponse(
        'Erreur lors de la mise à jour',
        ErrorCodes.UPDATE_FAILED,
        500,
        error.message
      );
    }

    return successResponse({ 
      message: markAllAsRead 
        ? 'Toutes les notifications ont été marquées comme lues' 
        : 'Notification marquée comme lue' 
    });

  } catch (error) {
    return handleError(error);
  }
}
