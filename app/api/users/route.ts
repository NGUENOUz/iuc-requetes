import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/middleware/auth.middleware';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  getPaginationParams,
  getPaginationMetadata,
  ErrorCodes 
} from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// GET /api/users - Récupérer tous les utilisateurs (sécurisé admin/agent)
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    // Sécuriser l'accès : seuls admin, chef_service et agent peuvent lister les utilisateurs
    const { error: authError } = await requireRole(request, ['admin', 'chef_service', 'agent']);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    // Filtres
    const roleId = searchParams.get('role_id');
    const roleNames = searchParams.get('role_names');
    const serviceId = searchParams.get('service_id');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Construire la requête avec supabaseAdmin pour contourner RLS
    let query = supabaseAdmin
      .from('users')
      .select(`
        *,
        role:roles(*),
        service:services(*)
      `, { count: 'exact' });

    // Appliquer les filtres de rôle
    if (roleId) {
      query = query.eq('role_id', roleId);
    } else if (roleNames) {
      const namesList = roleNames.split(',').map(n => n.trim());
      const { data: matchedRoles, error: rolesError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .in('name', namesList);

      if (rolesError) {
        return errorResponse(
          'Erreur lors du filtrage des rôles',
          ErrorCodes.DATABASE_ERROR,
          500,
          rolesError.message
        );
      }

      if (matchedRoles && matchedRoles.length > 0) {
        const roleIds = matchedRoles.map(r => r.id);
        query = query.in('role_id', roleIds);
      } else {
        // Aucun rôle correspondant trouvé, retourner une réponse vide
        return successResponse([], getPaginationMetadata(0, page, limit));
      }
    }

    if (serviceId) query = query.eq('service_id', serviceId);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');

    // Recherche textuelle
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,matricule.ilike.%${search}%`);
    }

    // Tri et pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des utilisateurs',
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
