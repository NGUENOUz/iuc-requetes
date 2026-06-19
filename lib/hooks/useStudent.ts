'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface StudentProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  matricule: string;
  niveau: string | null;
  filiere: string | null;
  annee_academique: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export function useStudent() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Non authentifié');
        }

        const { data, error: dbError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, matricule, niveau, filiere, annee_academique, avatar_url, phone')
          .eq('auth_user_id', user.id)
          .single();

        if (dbError) throw dbError;
        
        setStudent(data);
      } catch (err: any) {
        console.error('[useStudent] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, []);

  return { student, loading, error };
}
