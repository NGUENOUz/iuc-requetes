'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase, getSupabaseClient } from '@/lib/supabase';

// Hook global pour récupérer toutes les statistiques du dashboard
export function useAdminKPIs() {
  return useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/statistics', { headers });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000, // 30 secondes
  });
}

// Hook pour récupérer les 5 requêtes les plus récentes
export function useRecentRequests() {
  return useQuery({
    queryKey: ['admin', 'recent-requests'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/requests?limit=5&sort_by=submitted_at&sort_order=desc', { headers });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des requêtes récentes');
      }
      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}

// Hook pour récupérer l'évolution des requêtes sur les 12 derniers jours
export function useRequestChart(days = 12) {
  return useQuery({
    queryKey: ['admin', 'request-chart', days],
    queryFn: async () => {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const { data: { session } } = await supabase.auth.getSession();
      const client = getSupabaseClient(session?.access_token);

      const { data, error } = await client
        .from('requests')
        .select('submitted_at')
        .gte('submitted_at', dateLimit.toISOString())
        .order('submitted_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Initialiser les jours
      const chartPoints: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        chartPoints[dayLabel] = 0;
      }

      // Remplir avec les données réelles
      data?.forEach((req) => {
        if (!req.submitted_at) return;
        const date = new Date(req.submitted_at);
        const dayLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        if (chartPoints[dayLabel] !== undefined) {
          chartPoints[dayLabel]++;
        }
      });

      // Formater pour le graphique
      return Object.entries(chartPoints).map(([label, value], index) => ({
        x: index,
        label,
        y: value,
      }));
    },
    staleTime: 60 * 1000,
  });
}

// Hook pour la répartition par statut (extrait de l'API statistics)
export function useStatusDistribution() {
  const { data: stats, isLoading, error } = useAdminKPIs();

  const distribution = stats?.by_status
    ? Object.entries(stats.by_status).map(([label, info]: [string, any]) => ({
        label,
        count: info.count,
        color: info.color || '#6b7280',
      }))
    : [];

  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  const formattedDistribution = distribution.map(item => ({
    ...item,
    pct: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
  }));

  return {
    data: formattedDistribution,
    total,
    isLoading,
    error,
  };
}
