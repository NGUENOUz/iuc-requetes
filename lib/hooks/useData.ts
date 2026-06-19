import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Request, Notification } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════
// USER HOOKS
// ═══════════════════════════════════════════════════════════════

export function useUser() {
  const { user, setUser, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      const response = await fetch('/api/auth/check-user');
      if (!response.ok) throw new Error('Non authentifié');
      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    onSuccess: (data) => setUser(data),
    onError: () => {
      setUser(null);
      setLoading(false);
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// REQUESTS HOOKS
// ═══════════════════════════════════════════════════════════════

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async (): Promise<Request[]> => {
      const response = await fetch('/api/requests');
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      return data.data;
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: async (): Promise<any> => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/requests/${id}`, { headers });
      if (!response.ok) throw new Error('Requête non trouvée');
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRequest: Partial<Request>) => {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS HOOKS
// ═══════════════════════════════════════════════════════════════

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });
      if (!response.ok) throw new Error('Erreur de mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS HOOKS
// ═══════════════════════════════════════════════════════════════

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const response = await fetch('/api/statistics');
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
