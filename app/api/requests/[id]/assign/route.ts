import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { assignRequestSchema } from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  parseRequestBody,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireRole } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// POST /api/requests/[id]/assign - Assigner une requête à un agent
// ═══════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Seuls les admins, chefs de service et agents peuvent assigner
    const { error: authError, user } = await requireRole(request, ['admin', 'chef_service', 'agent']);
    if (authError) return authError;
    // Parser et valider
    const body = await parseRequestBody(request);
    const validatedData = assignRequestSchema.parse(body);

    // Vérifier que la requête existe
    const { data: existingRequest } = await supabaseAdmin
      .from('requests')
      .select('*, student:users!requests_student_id_fkey(first_name, last_name)')
      .eq('id', id)
      .single();

    if (!existingRequest) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Vérifier que l'agent existe et est actif
    const { data: agent } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, is_active, role:roles(name)')
      .eq('id', validatedData.assigned_to)
      .single();

    if (!agent) {
      return errorResponse(
        'Agent non trouvé',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    if (!agent.is_active) {
      return errorResponse(
        'Cet agent est désactivé',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    // Vérifier que c'est bien un agent ou admin
    if (!['agent', 'admin', 'chef_service'].includes(agent.role.name)) {
      return errorResponse(
        'Seuls les agents peuvent être assignés',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    // Récupérer le statut "Assignée"
    const { data: assignedStatus } = await supabaseAdmin
      .from('request_statuses')
      .select('id')
      .eq('name', 'Assignée')
      .single();

    // Mettre à jour la requête
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('requests')
      .update({
        assigned_to: validatedData.assigned_to,
        assigned_at: new Date().toISOString(),
        status_id: assignedStatus?.id || existingRequest.status_id,
      })
      .eq('id', id)
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
        'Erreur lors de l\'assignation',
        ErrorCodes.UPDATE_FAILED,
        500,
        updateError?.message
      );
    }

    // Créer un log d'historique
    await supabaseAdmin
      .from('request_history')
      .insert({
        request_id: id,
        user_id: validatedData.assigned_to,
        action: 'request_assigned',
        new_value: validatedData.assigned_to,
        description: `Requête assignée à ${agent.first_name} ${agent.last_name}`,
      });

    // Notifier l'agent assigné
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: validatedData.assigned_to,
        type: 'request_assigned',
        title: 'Nouvelle requête assignée',
        message: `La requête "${existingRequest.title}" vous a été assignée`,
        link: `/admin/requetes/${id}`,
      });

    // Notifier l'étudiant
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: existingRequest.student_id,
        type: 'request_assigned',
        title: 'Requête prise en charge',
        message: `Votre requête a été assignée à ${agent.first_name} ${agent.last_name}`,
        link: `/dashboard/requetes/${id}`,
      });

    return successResponse(updatedRequest);

  } catch (error) {
    return handleError(error);
  }
}
