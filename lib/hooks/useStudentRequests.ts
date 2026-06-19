'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Request {
  id: string;
  reference: string;
  title: string;
  description: string;
  submitted_at: string;
  status: {
    id: string;
    name: string;
    color: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  priority: {
    id: string;
    name: string;
    level: number;
  };
}

export interface RequestStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export function useStudentRequests(studentId?: string) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from('requests')
          .select(`
            id,
            reference,
            title,
            description,
            submitted_at,
            status:request_statuses!requests_status_id_fkey(id, name, color),
            category:request_categories!requests_category_id_fkey(id, name, icon),
            priority:priorities!requests_priority_id_fkey(id, name, level)
          `)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false });

        if (dbError) {
          console.error('[useStudentRequests] Database error:', dbError);
          throw dbError;
        }

        setRequests(data || []);

        // Calculer les statistiques
        const total = data?.length || 0;
        const pending = data?.filter(r => r.status.name === 'En attente').length || 0;
        const in_progress = data?.filter(r => r.status.name === 'En cours').length || 0;
        const resolved = data?.filter(r => r.status.name === 'Résolue').length || 0;
        const rejected = data?.filter(r => r.status.name === 'Rejetée').length || 0;

        setStats({ total, pending, in_progress, resolved, rejected });
      } catch (err: any) {
        console.error('[useStudentRequests] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [studentId]);

  return { requests, stats, loading, error, refetch: () => fetchRequests() };
}
