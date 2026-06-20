'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/';
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role?.name?.toLowerCase();
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        if (userRole === 'admin' || userRole === 'agent') {
          window.location.href = '/admin';
        } else if (userRole === 'etudiant') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/';
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.name?.toLowerCase();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}
