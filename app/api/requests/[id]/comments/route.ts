import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin, getSupabaseClient } from '@/lib/supabase';
import { createCommentSchema } from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  parseRequestBody,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireAuth, canAccessRequest } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// POST /api/requests/[id]/comments - Ajouter un commentaire
// ═══════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Vérifier l'authentification
    const { error: authError, user: userData } = await requireAuth(request);
    if (authError) return authError;

    // Vérifier l'accès à la requête
    const hasAccess = await canAccessRequest(userData!, id);
    if (!hasAccess) {
      return errorResponse(
        'Vous n\'avez pas accès à cette requête',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const client = getSupabaseClient(token);

    // Vérifier que la requête existe
    const { data: existingRequest } = await client
      .from('requests')
      .select('id, student_id, assigned_to, title')
      .eq('id', id)
      .single();

    if (!existingRequest) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    // Parser et valider
    const body = await parseRequestBody(request);
    const validatedData = createCommentSchema.parse({
      ...body,
      request_id: id,
    });

    // Créer le commentaire
    const { data: newComment, error: createError } = await supabaseAdmin
      .from('request_comments')
      .insert({
        request_id: id,
        user_id: userData!.id,
        content: validatedData.content,
        is_internal: validatedData.is_internal,
      })
      .select(`
        *,
        user:users(id, first_name, last_name, email, avatar_url, role:roles(name))
      `)
      .single();

    if (createError || !newComment) {
      return errorResponse(
        'Erreur lors de l\'ajout du commentaire',
        ErrorCodes.CREATE_FAILED,
        500,
        createError?.message
      );
    }

    // Créer un log d'historique
    await supabaseAdmin
      .from('request_history')
      .insert({
        request_id: id,
        user_id: userData!.id,
        action: 'comment_added',
        description: `Commentaire ajouté par ${userData!.first_name} ${userData!.last_name}`,
      });

    // Notifier les parties concernées (sauf l'auteur du commentaire)
    const notificationsToCreate = [];

    // Notifier l'étudiant si ce n'est pas un commentaire interne
    if (!validatedData.is_internal && existingRequest.student_id !== userData!.id) {
      notificationsToCreate.push({
        user_id: existingRequest.student_id,
        type: 'comment_added',
        title: 'Nouveau commentaire',
        message: `Un commentaire a été ajouté à votre requête "${existingRequest.title}"`,
        link: `/dashboard/requetes/${id}`,
      });
    }

    // Notifier l'agent assigné
    if (existingRequest.assigned_to && existingRequest.assigned_to !== userData!.id) {
      notificationsToCreate.push({
        user_id: existingRequest.assigned_to,
        type: 'comment_added',
        title: 'Nouveau commentaire',
        message: `Un commentaire a été ajouté à la requête "${existingRequest.title}"`,
        link: `/admin/requetes/${id}`,
      });
    }

    if (notificationsToCreate.length > 0) {
      await supabaseAdmin.from('notifications').insert(notificationsToCreate);
    }

    return successResponse(newComment);

  } catch (error) {
    return handleError(error);
  }
}

// ═══════════════════════════════════════════════════════════════
// GET /api/requests/[id]/comments - Récupérer les commentaires
// ═══════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const client = getSupabaseClient(token);

    const { data, error } = await client
      .from('request_comments')
      .select(`
        *,
        user:users(id, first_name, last_name, email, avatar_url, role:roles(name))
      `)
      .eq('request_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des commentaires',
        ErrorCodes.DATABASE_ERROR,
        500,
        error.message
      );
    }

    return successResponse(data);

  } catch (error) {
    return handleError(error);
  }
}

