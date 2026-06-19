import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { updateRequestSchema } from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  parseRequestBody,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireAuth, canAccessRequest } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// GET /api/requests/[id] - Récupérer une requête spécifique
// ═══════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        student:users!requests_student_id_fkey(
          id, first_name, last_name, email, matricule, phone,
          niveau, filiere, annee_academique
        ),
        category:request_categories(*),
        status:request_statuses(*),
        priority:priorities(*),
        assigned_agent:users!requests_assigned_to_fkey(
          id, first_name, last_name, email, phone, fonction
        ),
        service:services(*),
        comments:request_comments(
          *,
          user:users(id, first_name, last_name, email, avatar_url)
        ),
        attachments:request_attachments(*),
        history:request_history(
          *,
          user:users(id, first_name, last_name)
        ),
        rating:request_ratings(*)
      `)
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    return successResponse(data);

  } catch (error) {
    return handleError(error);
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/requests/[id] - Mettre à jour une requête
// ═══════════════════════════════════════════════════════════════

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const { error: authError, user } = await requireAuth(request);
    if (authError) return authError;

    // Vérifier l'accès à la requête
    const hasAccess = await canAccessRequest(user!, params.id);
    if (!hasAccess) {
      return errorResponse(
        'Vous n\'avez pas accès à cette requête',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    // Vérifier que la requête existe
    const { data: existingRequest, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingRequest) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Parser et valider
    const body = await parseRequestBody(request);
    const validatedData = updateRequestSchema.parse(body);

    // Mettre à jour la requête
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('requests')
      .update(validatedData)
      .eq('id', params.id)
      .select(`
        *,
        student:users!requests_student_id_fkey(id, first_name, last_name, email),
        category:request_categories(*),
        status:request_statuses(*),
        priority:priorities(*),
        assigned_agent:users!requests_assigned_to_fkey(id, first_name, last_name, email),
        service:services(*)
      `)
      .single();

    if (updateError || !updatedRequest) {
      return errorResponse(
        'Erreur lors de la mise à jour',
        ErrorCodes.UPDATE_FAILED,
        500,
        updateError?.message
      );
    }

    // Créer un log d'historique
    await supabaseAdmin
      .from('request_history')
      .insert({
        request_id: params.id,
        user_id: user!.id,
        action: 'request_updated',
        description: 'Requête mise à jour',
      });

    return successResponse(updatedRequest);

  } catch (error) {
    return handleError(error);
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE /api/requests/[id] - Supprimer une requête
// ═══════════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const { error: authError, user } = await requireAuth(request);
    if (authError) return authError;

    // Vérifier l'accès à la requête
    const hasAccess = await canAccessRequest(user!, params.id);
    if (!hasAccess) {
      return errorResponse(
        'Vous n\'avez pas accès à cette requête',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    // Vérifier que la requête existe
    const { data: existingRequest } = await supabase
      .from('requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!existingRequest) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Supprimer la requête (cascade supprime automatiquement les relations)
    const { error: deleteError } = await supabaseAdmin
      .from('requests')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return errorResponse(
        'Erreur lors de la suppression',
        ErrorCodes.DELETE_FAILED,
        500,
        deleteError.message
      );
    }

    // Log d'activité
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: user!.id,
        action: 'request_deleted',
        entity_type: 'request',
        entity_id: params.id,
        description: `Requête ${existingRequest.reference} supprimée`,
      });

    return successResponse({ message: 'Requête supprimée avec succès' });

  } catch (error) {
    return handleError(error);
  }
}
