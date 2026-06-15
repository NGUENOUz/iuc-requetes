import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse, handleError, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// GET /api/services - Récupérer tous les services
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des services',
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
