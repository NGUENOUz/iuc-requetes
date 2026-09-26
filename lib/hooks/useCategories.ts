'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requires_documents: boolean;
  target_role?: string;
  is_auto_resolvable?: boolean;
  auto_document_type?: string;
  sla_hours?: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error: dbError } = await supabase
          .from('request_categories')
          .select('id, name, description, icon, color, requires_documents, target_role, is_auto_resolvable, auto_document_type, sla_hours')
          .eq('is_active', true)
          .order('name');

        if (dbError) throw dbError;

        setCategories(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
