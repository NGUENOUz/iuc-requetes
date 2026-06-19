'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface RequestFilterParams {
  search?: string;
  status_id?: string;
  priority_id?: string;
  service_id?: string;
  assigned_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export function useAdminRequests(params: RequestFilterParams) {
  const { search, status_id, priority_id, service_id, assigned_to, page = 1, limit = 8, sort_by = 'submitted_at', sort_order = 'desc' } = params;

  return useQuery({
    queryKey: ['admin', 'requests', { search, status_id, priority_id, service_id, assigned_to, page, limit, sort_by, sort_order }],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const urlParams = new URLSearchParams();
      urlParams.append('page', String(page));
      urlParams.append('limit', String(limit));
      
      if (search) urlParams.append('search', search);
      if (status_id && status_id !== 'all') urlParams.append('status_id', status_id);
      if (priority_id && priority_id !== 'all') urlParams.append('priority_id', priority_id);
      if (service_id && service_id !== 'all') urlParams.append('service_id', service_id);
      if (assigned_to) urlParams.append('assigned_to', assigned_to);
      if (sort_by) urlParams.append('sort_by', sort_by);
      if (sort_order) urlParams.append('sort_order', sort_order);

      const response = await fetch(`/api/requests?${urlParams.toString()}`, { headers });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des requêtes');
      }
      
      return response.json(); // Contient { success: true, data: [...], pagination: { total, page, limit, totalPages } }
    },
    staleTime: 15 * 1000,
  });
}

// Charger tous les statuts possibles
export function useStatuses() {
  return useQuery({
    queryKey: ['admin', 'statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('request_statuses')
        .select('*')
        .order('order_index');

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Charger toutes les priorités possibles
export function usePriorities() {
  return useQuery({
    queryKey: ['admin', 'priorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('priorities')
        .select('*')
        .order('level');

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Charger tous les services/départements possibles
export function useServices() {
  return useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Charger tous les utilisateurs assignables (agents, chefs de service, admins actifs)
export function useAssignableUsers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'assignable-users', search],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const urlParams = new URLSearchParams();
      urlParams.append('role_names', 'agent,chef_service,admin');
      urlParams.append('is_active', 'true');
      urlParams.append('limit', '100'); // Récupère jusqu'à 100 agents
      if (search) {
        urlParams.append('search', search);
      }

      const response = await fetch(`/api/users?${urlParams.toString()}`, { headers });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des agents');
      }
      
      const resData = await response.json();
      return resData.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes de cache
  });
}

