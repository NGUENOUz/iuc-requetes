import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse, handleError, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// GET /api/categories - Récupérer toutes les catégories
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('request_categories')
      .select(`
        *,
        service:services(*)
      `)
      .order('name', { ascending: true });

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des catégories',
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
