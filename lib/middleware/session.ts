import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserByMatricule } from '@/lib/utils/supabaseHelpers';
import { errorResponse, successResponse, ErrorCodes } from '@/lib/utils/api.utils';

/**
 * Middleware helper that verifies a Supabase session cookie.
 * If a valid session exists, it attaches the user profile to the request via
 * `request.headers.set('x-auth-user-id', user.id)` for downstream API routes.
 * If not, it redirects to `/login`.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    const redirect = NextResponse.redirect(new URL('/login', request.url));
    // Clear invalid cookie
    redirect.cookies.delete('sb-access-token');
    return redirect;
  }

  // Attach user id to headers so API routes can fetch the full profile if needed
  const response = NextResponse.next();
  response.headers.set('x-auth-user-id', user.id);
  return response;
}
