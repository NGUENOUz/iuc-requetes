import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Routes publiques (pas besoin d'authentification)
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(pathname)) {
    return response;
  }

  try {
    // Créer un client Supabase pour le middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Vérifier la session
    const { data: { session }, error } = await supabase.auth.getSession();

    // Pas de session valide = rediriger vers login
    if (error || !session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Session valide, laisser passer
    return response;
  } catch (error) {
    console.error('[Middleware] Error:', error);
    // En cas d'erreur, rediriger vers login par sécurité
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configuration : spécifier les routes à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
