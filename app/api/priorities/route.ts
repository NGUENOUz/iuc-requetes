import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse, handleError, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// GET /api/priorities - Récupérer toutes les priorités
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('priorities')
      .select('*')
      .order('level', { ascending: true });

    if (error) {
      return errorResponse(
        'Erreur lors de la récupération des priorités',
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
