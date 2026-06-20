import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // MIDDLEWARE DÉSACTIVÉ - Protection gérée côté client par RouteGuard
  // Le middleware pose problème avec les cookies Supabase
  return NextResponse.next();
}

// Configuration : ne rien matcher (middleware désactivé)
export const config = {
  matcher: [],
};
