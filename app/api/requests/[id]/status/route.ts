import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { changeStatusSchema } from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  parseRequestBody,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireRole } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// POST /api/requests/[id]/status - Changer le statut d'une requête
// ═══════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Seuls les agents, chefs de service et admins peuvent changer le statut
    const { error: authError, user: userData } = await requireRole(request, ['admin', 'chef_service', 'agent']);
    if (authError) return authError;

    // Parser et valider
    const body = await parseRequestBody(request);
    const validatedData = changeStatusSchema.parse(body);

    // Vérifier que la requête existe
    const { data: existingRequest } = await supabaseAdmin
      .from('requests')
      .select(`
        *,
        status:request_statuses(*),
        student:users!requests_student_id_fkey(id, first_name, last_name)
      `)
      .eq('id', params.id)
      .single();

    if (!existingRequest) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Vérifier que le nouveau statut existe
    const { data: newStatus } = await supabaseAdmin
      .from('request_statuses')
      .select('*')
      .eq('id', validatedData.status_id)
      .single();

    if (!newStatus) {
      return errorResponse(
        'Statut non trouvé',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      status_id: validatedData.status_id,
    };

    // Si le statut est "Résolue" ou "Fermée", mettre à jour les timestamps
    if (newStatus.name === 'Résolue' && !existingRequest.resolved_at) {
      updateData.resolved_at = new Date().toISOString();
      
      // Calculer le temps de résolution
      const submittedAt = new Date(existingRequest.submitted_at);
      const resolvedAt = new Date();
      const resolutionTimeHours = Math.round((resolvedAt.getTime() - submittedAt.getTime()) / (1000 * 60 * 60));
      updateData.resolution_time_hours = resolutionTimeHours;
    }

    if (newStatus.is_closed && !existingRequest.closed_at) {
      updateData.closed_at = new Date().toISOString();
    }

    // Mettre à jour la requête
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('requests')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        student:users!requests_student_id_fkey(id, first_name, last_name, email),
        assigned_agent:users!requests_assigned_to_fkey(id, first_name, last_name, email),
        category:request_categories(*),
        status:request_statuses(*),
        priority:priorities(*)
      `)
      .single();

    if (updateError || !updatedRequest) {
      return errorResponse(
        'Erreur lors du changement de statut',
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
        user_id: userData!.id,
        action: 'status_changed',
        old_value: existingRequest.status.name,
        new_value: newStatus.name,
        description: `Statut changé de "${existingRequest.status.name}" à "${newStatus.name}"`,
      });

    // Ajouter un commentaire si fourni
    if (validatedData.comment) {
      await supabaseAdmin
        .from('request_comments')
        .insert({
          request_id: params.id,
          user_id: userData!.id,
          content: validatedData.comment,
          is_internal: false,
          is_system: true,
        });
    }

    // Notifier l'étudiant du changement de statut
    let notificationMessage = `Le statut de votre requête a été changé à "${newStatus.name}"`;
    
    if (newStatus.name === 'Résolue') {
      notificationMessage = 'Votre requête a été résolue ! Vous pouvez maintenant l\'évaluer.';
    } else if (newStatus.name === 'Rejetée') {
      notificationMessage = 'Votre requête a été rejetée. Consultez les commentaires pour plus d\'informations.';
    }

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: existingRequest.student_id,
        type: 'status_changed',
        title: 'Changement de statut',
        message: notificationMessage,
        link: `/dashboard/requetes/${params.id}`,
      });

    return successResponse(updatedRequest);

  } catch (error) {
    return handleError(error);
  }
}
