import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createUserSchema } from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  parseRequestBody,
  getPaginationParams,
  getPaginationMetadata,
  ErrorCodes 
} from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// GET /api/users - Récupérer tous les utilisateurs
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    // Filtres
    const roleId = searchParams.get('role_id');
    const serviceId = searchParams.get('service_id');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Construire la requête
    let query = supabase
      .from('users')
      .select(`
        *,
        role:roles(*),
        service:services(*)
      `, { count: 'exact' });

    // Appliquer les filtres
    if (roleId) query = query.eq('role_id', roleId);
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
