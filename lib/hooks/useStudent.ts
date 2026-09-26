'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface StudentProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  matricule: string;
  niveau?: string | null;
  filiere?: string | null;
  annee_academique?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  fonction?: string | null;
  specialite?: string | null;
  role_id?: string;
  role_code?: string;
  roles?: {
    id: string;
    name: string;
    code: string;
  } | null;
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
          .select('*, roles(id, name, code)')
          .eq('auth_user_id', user.id)
          .single();

        if (dbError) throw dbError;
        
        // Compute normalized role_code
        const roleCode = data?.roles?.code || 
          (data?.matricule?.startsWith('ENS') ? 'enseignant' : 
           data?.matricule?.startsWith('PERS') ? 'personnel' : 
           data?.matricule?.startsWith('ADM') ? 'admin' : 'etudiant');

        setStudent({
          ...data,
          role_code: roleCode
        });
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
