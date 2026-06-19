'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

export function useAgentStats() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['agent', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/statistics/agent', { headers });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques agent');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 30 * 1000, // 30 secondes
    enabled: !!user?.id,
  });
}

// Hook pour récupérer les requêtes récentes de l'agent
export function useAgentRecentRequests() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['agent', 'recent-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/requests?assigned_to=${user.id}&limit=5&sort_by=submitted_at&sort_order=desc`, { headers });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des requêtes récentes');
      }
      
      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000,
    enabled: !!user?.id,
  });
}

// Hook pour l'évolution des requêtes de l'agent sur les X derniers jours
export function useAgentRequestChart(days = 12) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['agent', 'request-chart', user?.id, days],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const { data, error } = await supabase
        .from('requests')
        .select('submitted_at')
        .eq('assigned_to', user.id)
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
    enabled: !!user?.id,
  });
}

// Hook pour la répartition par statut de l'agent
export function useAgentStatusDistribution() {
  const { data: stats, isLoading, error } = useAgentStats();

  const distribution = stats?.by_status
    ? Object.entries(stats.by_status).map(([label, info]: [string, any]) => ({
        label,
        count: info.count,
        color: getStatusColor(label),
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

// Fonction helper pour obtenir la couleur selon le statut
function getStatusColor(statusName: string): string {
  const colors: Record<string, string> = {
    'Soumise': '#3b82f6',
    'En attente': '#3b82f6',
    'Assignée': '#8b5cf6',
    'En cours': '#f59e0b',
    'En attente d\'information': '#f97316',
    'Résolue': '#10b981',
    'Rejetée': '#ef4444',
    'Fermée': '#6b7280',
  };
  return colors[statusName] || '#6b7280';
}
