'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AISuggestion {
  id: string;
  type: 'optimization' | 'alert' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'applied' | 'dismissed';
  title: string;
  description: string;
  impact: string | null;
  recommended_action: string | null;
  created_at: string;
}

// Charger les suggestions depuis la table `ai_suggestions` de Supabase
export function useSuggestions() {
  return useQuery({
    queryKey: ['admin', 'ai-suggestions'],
    queryFn: async (): Promise<AISuggestion[]> => {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as AISuggestion[];
    },
    staleTime: 60 * 1000,
  });
}

// Appeler le endpoint d'administration POST /api/ai/suggest pour générer des suggestions réelles via Gemini
export function useGenerateSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AISuggestion[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des suggestions par l\'IA');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      // Invalider le cache des suggestions pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-suggestions'] });
    },
  });
}


// Mettre à jour le statut d'une suggestion (Appliquée / Rejetée)
export function useUpdateSuggestionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'applied' | 'dismissed' }) => {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-suggestions'] });
    },
  });
}
