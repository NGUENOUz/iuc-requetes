import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ═══════════════════════════════════════════════════════════════
// UTILITAIRES API
// ═══════════════════════════════════════════════════════════════

// Types de réponse API standardisés
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Créer une réponse de succès
export function successResponse<T>(
  data: T,
  metadata?: ApiResponse['metadata']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata,
  });
}

// Créer une réponse d'erreur
export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

// Gérer les erreurs Zod
export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const errors = (error.errors ?? []).map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return errorResponse(
    'Erreur de validation des données',
    'VALIDATION_ERROR',
    400,
    errors
  );
}

// Gérer les erreurs génériques
export function handleError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 'ERROR', 500);
  }

  return errorResponse('Une erreur inconnue s\'est produite', 'UNKNOWN_ERROR', 500);
}

// Codes d'erreur standardisés
export const ErrorCodes = {
  // Authentification
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Ressources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Opérations
  CREATE_FAILED: 'CREATE_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  
  // Système
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Extraire l'utilisateur de la requête
export async function getCurrentUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  // TODO: Implémenter la vérification du token avec Supabase
  // const { data: { user }, error } = await supabase.auth.getUser(token);
  
  return null; // Temporaire
}

// Vérifier les permissions
export function checkPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Parser le body de la requête
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

// Extraire les paramètres de pagination
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// Calculer les métadonnées de pagination
export function getPaginationMetadata(
  total: number,
  page: number,
  limit: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
}
