'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { supabase } from '@/lib/supabase';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('[RouteGuard] Pas de session valide, redirection vers /login');
          router.push('/login');
          return;
        }

        // Si on a une session mais pas d'utilisateur dans le store, le charger
        if (!user) {
          const response = await fetch('/api/auth/check-user', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            const { data } = await response.json();
            setUser(data);
            
            // Vérifier le rôle
            const userRole = data.role?.name?.toLowerCase();
            if (allowedRoles && allowedRoles.length > 0) {
              if (!userRole || !allowedRoles.includes(userRole)) {
                console.log('[RouteGuard] Rôle non autorisé:', userRole, 'autorisés:', allowedRoles);
                // Rediriger selon le rôle
                if (userRole === 'admin' || userRole === 'agent') {
                  router.push('/admin');
                } else if (userRole === 'etudiant') {
                  router.push('/dashboard');
                } else {
                  router.push('/login');
                }
                return;
              }
            }
          } else {
            console.log('[RouteGuard] Erreur lors de la récupération utilisateur');
            router.push('/login');
            return;
          }
        }

        setChecking(false);
      } catch (error) {
        console.error('[RouteGuard] Erreur:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname]);

  // Vérifier le rôle une fois l'utilisateur chargé
  useEffect(() => {
    if (!isLoading && user && !checking) {
      const userRole = user.role?.name?.toLowerCase();
      
      if (allowedRoles && allowedRoles.length > 0) {
        if (!userRole || !allowedRoles.includes(userRole)) {
          console.log('[RouteGuard] Vérification rôle - non autorisé:', userRole);
          // Rediriger selon le rôle
          if (userRole === 'admin' || userRole === 'agent') {
            router.push('/admin');
          } else if (userRole === 'etudiant') {
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        }
      }
    }
  }, [user, isLoading, checking, allowedRoles, router]);

  // Afficher un loader pendant la vérification
  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Vérification de votre accès...</p>
        </div>
      </div>
    );
  }

  // Pas d'utilisateur = ne rien afficher (la redirection est en cours)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Redirection...</p>
        </div>
      </div>
    );
  }

  // Vérifier le rôle
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.name?.toLowerCase();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Redirection...</p>
          </div>
        </div>
      );
    }
  }

  // Utilisateur autorisé
  return <>{children}</>;
}
