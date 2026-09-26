import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin, getSupabaseClient } from '@/lib/supabase';
import { createRequestSchema, filterRequestsSchema } from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  parseRequestBody, 
  getPaginationParams,
  getPaginationMetadata,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireAuth } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// GET /api/requests - Récupérer toutes les requêtes (avec filtres)
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const client = getSupabaseClient(token);

    // Construire les filtres
    const filters: any = {};
    
    if (searchParams.get('status_id')) filters.status_id = searchParams.get('status_id');
    if (searchParams.get('category_id')) filters.category_id = searchParams.get('category_id');
    if (searchParams.get('priority_id')) filters.priority_id = searchParams.get('priority_id');
    if (searchParams.get('service_id')) filters.service_id = searchParams.get('service_id');
    if (searchParams.get('student_id')) filters.student_id = searchParams.get('student_id');
    
    // Gestion spéciale pour assigned_to
    const assignedToParam = searchParams.get('assigned_to');
    if (assignedToParam === 'null') {
      // Filtre pour les requêtes non assignées
      filters.assigned_to_is_null = true;
    } else if (assignedToParam) {
      filters.assigned_to = assignedToParam;
    }

    // Construire la requête
    let query = client
      .from('requests')
      .select(`
        *,
        student:users!requests_student_id_fkey(id, first_name, last_name, email, matricule),
        category:request_categories(*),
        status:request_statuses(*),
        priority:priorities(*),
        assigned_agent:users!requests_assigned_to_fkey(id, first_name, last_name, email),
        service:services(*)
      `, { count: 'exact' });


    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'assigned_to_is_null') {
        query = query.is('assigned_to', null);
      } else if (value) {
        query = query.eq(key, value);
      }
    });

    // Recherche textuelle
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,reference.ilike.%${search}%`);
    }

    // SLA breached
    if (searchParams.get('is_sla_breached') === 'true') {
      query = query.eq('is_sla_breached', true);
    }

    // Filtres de date
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    if (dateFrom) query = query.gte('submitted_at', dateFrom);
    if (dateTo) query = query.lte('submitted_at', dateTo);

    // Tri
    const sortBy = searchParams.get('sort_by') || 'submitted_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des requêtes',
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
// POST /api/requests - Créer une nouvelle requête
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { error: authError, user: userData } = await requireAuth(request);
    if (authError) return authError;

    // Parser et valider
    const body = await parseRequestBody(request);
    const validatedData = createRequestSchema.parse(body);

    // Récupérer les infos de la catégorie pour le service
    const { data: category } = await supabase
      .from('request_categories')
      .select('service_id')
      .eq('id', validatedData.category_id)
      .single();

    // ═══════════════════════════════════════════════════════════════
    // MOTEUR D'AUTOMATISATION ET D'AUTO-ROUTAGE INTELLIGENT
    // ═══════════════════════════════════════════════════════════════
    const { getLocalDB } = require('@/lib/db/json-db');
    const { processRequestAutomation } = require('@/lib/services/automation.service');
    const db = getLocalDB();

    const autoResult = processRequestAutomation(
      {
        id: '',
        reference: '',
        student_id: userData!.id,
        category_id: validatedData.category_id,
        priority_id: validatedData.priority_id,
        service_id: category?.service_id,
        title: validatedData.title,
        description: validatedData.description,
      },
      db
    );

    // Préparer les données d'insertion adaptées
    const requestInsertData: any = {
      student_id: userData!.id,
      category_id: validatedData.category_id,
      priority_id: validatedData.priority_id,
      status_id: autoResult.statusId,
      service_id: category?.service_id,
      title: validatedData.title,
      description: validatedData.description,
      tags: validatedData.tags || [],
      metadata: {
        ...(validatedData.metadata || {}),
        ...autoResult.metadata,
      },
    };

    if (autoResult.isAutoResolved) {
      requestInsertData.resolved_at = new Date().toISOString();
      requestInsertData.response_time_hours = 0;
      requestInsertData.resolution_time_hours = 0;
    } else if (autoResult.assignedAgent) {
      requestInsertData.assigned_to = autoResult.assignedAgent.id;
      requestInsertData.assigned_at = new Date().toISOString();
      requestInsertData.response_time_hours = 0;
    }

    // Créer la requête
    const { data: newRequest, error: createError } = await supabaseAdmin
      .from('requests')
      .insert(requestInsertData)
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

    if (createError || !newRequest) {
      return errorResponse(
        'Erreur lors de la création de la requête',
        ErrorCodes.CREATE_FAILED,
        500,
        createError?.message
      );
    }

    // Créer un log d'historique
    await supabaseAdmin
      .from('request_history')
      .insert({
        request_id: newRequest.id,
        user_id: userData.id,
        action: autoResult.isAutoResolved ? 'auto_resolved' : (autoResult.assignedAgent ? 'auto_assigned' : 'request_created'),
        description: autoResult.isAutoResolved 
          ? 'Requête traitée et résolue automatiquement (délivrance instantanée)'
          : (autoResult.assignedAgent ? `Auto-assignée à ${autoResult.assignedAgent.first_name} ${autoResult.assignedAgent.last_name}` : 'Requête créée'),
      });

    // Créer un log d'activité
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: userData!.id,
        action: autoResult.isAutoResolved ? 'request_auto_resolved' : 'request_created',
        entity_type: 'request',
        entity_id: newRequest.id,
        description: `Requête ${newRequest.reference}: ${autoResult.isAutoResolved ? 'Auto-Résolue' : (autoResult.assignedAgent ? 'Auto-Assignée' : 'Créée')}`,
      });

    // Ajouter le commentaire système explicatif si disponible
    if (autoResult.systemComment) {
      await supabaseAdmin
        .from('request_comments')
        .insert({
          request_id: newRequest.id,
          user_id: userData!.id,
          content: autoResult.systemComment,
          is_internal: false,
          is_system: true,
        });
    }

    // Notification utilisateur
    if (autoResult.userNotification) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userData!.id,
          type: autoResult.userNotification.type,
          title: autoResult.userNotification.title,
          message: autoResult.userNotification.message,
          link: `/mes-requetes`,
        });
    }

    // Notification agent assigné (le cas échéant)
    if (autoResult.agentNotification) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: autoResult.agentNotification.agentId,
          type: 'new_request',
          title: autoResult.agentNotification.title,
          message: autoResult.agentNotification.message,
          link: `/admin/requetes/${newRequest.id}`,
        });
    }

    return successResponse(newRequest);

  } catch (error) {
    return handleError(error);
  }
}
