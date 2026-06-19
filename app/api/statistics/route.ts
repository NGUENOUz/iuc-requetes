import { NextRequest } from 'next/server';
import { supabase, getSupabaseClient } from '@/lib/supabase';
import { successResponse, errorResponse, handleError, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// GET /api/statistics - Récupérer les statistiques
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');
    const agentId = searchParams.get('agent_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const client = getSupabaseClient(token);

    // Statistiques globales
    const statsPromises = [];

    // Total de requêtes
    let requestsQuery = client
      .from('requests')
      .select('id', { count: 'exact', head: true });

    if (serviceId) requestsQuery = requestsQuery.eq('service_id', serviceId);
    if (agentId) requestsQuery = requestsQuery.eq('assigned_to', agentId);
    if (dateFrom) requestsQuery = requestsQuery.gte('submitted_at', dateFrom);
    if (dateTo) requestsQuery = requestsQuery.lte('submitted_at', dateTo);

    statsPromises.push(requestsQuery);

    // Requêtes par statut
    const { data: statusData } = await client
      .from('requests')
      .select('status_id, request_statuses(name, color)');

    // Grouper par statut
    const requestsByStatus: Record<string, any> = {};
    statusData?.forEach(req => {
      const statusName = req.request_statuses?.name || 'Inconnu';
      if (!requestsByStatus[statusName]) {
        requestsByStatus[statusName] = {
          count: 0,
          color: req.request_statuses?.color || '#gray',
        };
      }
      requestsByStatus[statusName].count++;
    });

    // Requêtes par priorité
    const { data: priorityData } = await client
      .from('requests')
      .select('priority_id, priorities(name, color, level)');

    const requestsByPriority: Record<string, any> = {};
    priorityData?.forEach(req => {
      const priorityName = req.priorities?.name || 'Inconnu';
      if (!requestsByPriority[priorityName]) {
        requestsByPriority[priorityName] = {
          count: 0,
          color: req.priorities?.color || '#gray',
          level: req.priorities?.level || 0,
        };
      }
      requestsByPriority[priorityName].count++;
    });

    // Requêtes résolues
    const { data: resolvedRequests, count: resolvedCount } = await client
      .from('requests')
      .select('*', { count: 'exact' })
      .not('resolved_at', 'is', null);

    // SLA breaches
    const { count: slaBreachCount } = await client
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_sla_breached', true);

    // Temps moyen de résolution
    const { data: resolvedRequestsWithTime } = await client
      .from('requests')
      .select('resolution_time_hours')
      .not('resolution_time_hours', 'is', null);

    const avgResolutionTime = resolvedRequestsWithTime && resolvedRequestsWithTime.length > 0
      ? resolvedRequestsWithTime.reduce((acc, r) => acc + (r.resolution_time_hours || 0), 0) / resolvedRequestsWithTime.length
      : 0;

    // Note de satisfaction moyenne
    const { data: ratings } = await client
      .from('request_ratings')
      .select('rating');

    const avgSatisfaction = ratings && ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
      : 0;

    // Top agents (par nombre de requêtes résolues)
    const { data: topAgents } = await client
      .from('requests')
      .select(`
        assigned_to,
        users!requests_assigned_to_fkey(id, first_name, last_name, avatar_url)
      `)
      .not('resolved_at', 'is', null)
      .not('assigned_to', 'is', null);

    const agentStats: Record<string, any> = {};
    topAgents?.forEach(req => {
      const agentId = req.assigned_to;
      if (!agentId) return;
      
      if (!agentStats[agentId]) {
        agentStats[agentId] = {
          agent: req.users,
          resolvedCount: 0,
        };
      }
      agentStats[agentId].resolvedCount++;
    });

    const topAgentsList = Object.values(agentStats)
      .sort((a: any, b: any) => b.resolvedCount - a.resolvedCount)
      .slice(0, 5);

    // Requêtes par service
    const { data: serviceStats } = await client
      .from('requests')
      .select(`
        service_id,
        services(name, code)
      `);

    const requestsByService: Record<string, any> = {};
    serviceStats?.forEach(req => {
      const serviceName = req.services?.name || 'Non assigné';
      if (!requestsByService[serviceName]) {
        requestsByService[serviceName] = { count: 0 };
      }
      requestsByService[serviceName].count++;
    });

    const statistics = {
      overview: {
        total_requests: statusData?.length || 0,
        resolved_requests: resolvedCount || 0,
        pending_requests: (statusData?.length || 0) - (resolvedCount || 0),
        sla_breaches: slaBreachCount || 0,
        avg_resolution_time_hours: Math.round(avgResolutionTime * 10) / 10,
        avg_satisfaction_rating: Math.round(avgSatisfaction * 10) / 10,
      },
      by_status: requestsByStatus,
      by_priority: requestsByPriority,
      by_service: requestsByService,
      top_agents: topAgentsList,
    };

    return successResponse(statistics);

  } catch (error) {
    return handleError(error);
  }
}

