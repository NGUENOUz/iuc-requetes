'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export function useAuthSync() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const response = await fetch('/api/auth/check-user', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            const { data } = await response.json();
            setUser(data as User);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const response = await fetch('/api/auth/check-user', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            const { data } = await response.json();
            setUser(data as User);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);
}
