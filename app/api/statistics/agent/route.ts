import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { 
  successResponse, 
  errorResponse, 
  handleError,
  ErrorCodes 
} from '@/lib/utils/api.utils';
import { requireAuth } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// GET /api/statistics/agent - Statistiques pour l'agent connecté
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { error: authError, user } = await requireAuth(request);
    if (authError) return authError;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const client = getSupabaseClient(token);

    // Récupérer toutes les requêtes assignées à l'agent
    const { data: assignedRequests, error: assignedError } = await client
      .from('requests')
      .select('id, status_id, priority_id, submitted_at, resolved_at, status:request_statuses(name)')
      .eq('assigned_to', user!.id);

    if (assignedError) {
      return errorResponse(
        'Erreur lors de la récupération des requêtes',
        ErrorCodes.DATABASE_ERROR,
        500,
        assignedError.message
      );
    }

    // Calculer les statistiques
    const totalAssigned = assignedRequests?.length || 0;
    const resolvedRequests = assignedRequests?.filter((r: any) => r.status?.name === 'Résolue') || [];
    const inProgressRequests = assignedRequests?.filter((r: any) => r.status?.name === 'En cours') || [];
    const pendingRequests = assignedRequests?.filter((r: any) => 
      ['En attente', 'Soumise', 'Assignée', 'En attente d\'information'].includes(r.status?.name)
    ) || [];

    // Calculer le temps moyen de résolution (en heures)
    const avgResolutionTime = resolvedRequests.length > 0
      ? resolvedRequests.reduce((sum: number, r: any) => {
          const submitted = new Date(r.submitted_at).getTime();
          const resolved = new Date(r.resolved_at).getTime();
          return sum + (resolved - submitted) / (1000 * 60 * 60); // Convertir en heures
        }, 0) / resolvedRequests.length
      : 0;

    // Répartition par priorité
    const byPriority = assignedRequests?.reduce((acc: any, r: any) => {
      const priority = r.priority_id || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Répartition par statut
    const byStatus = assignedRequests?.reduce((acc: any, r: any) => {
      const status = r.status?.name || 'Inconnu';
      acc[status] = {
        count: (acc[status]?.count || 0) + 1,
        percentage: 0, // Sera calculé après
      };
      return acc;
    }, {});

    // Calculer les pourcentages
    if (byStatus && totalAssigned > 0) {
      Object.keys(byStatus).forEach(status => {
        byStatus[status].percentage = Math.round((byStatus[status].count / totalAssigned) * 100);
      });
    }

    const stats = {
      overview: {
        total_assigned: totalAssigned,
        resolved: resolvedRequests.length,
        in_progress: inProgressRequests.length,
        pending: pendingRequests.length,
        avg_resolution_time_hours: Math.round(avgResolutionTime * 10) / 10,
        resolution_rate: totalAssigned > 0 ? Math.round((resolvedRequests.length / totalAssigned) * 100) : 0,
      },
      by_status: byStatus,
      by_priority: byPriority,
    };

    return successResponse(stats);

  } catch (error) {
    return handleError(error);
  }
}
