'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Clock, ArrowRight, Filter, Search, Zap, Brain, ArrowLeft
} from 'lucide-react';
import { useSuggestions, useGenerateSuggestions, useUpdateSuggestionStatus } from '@/lib/hooks';

export default function SuggestionsIaPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied' | 'dismissed'>('all');
  const [search, setSearch] = useState('');

  const { data: suggestions = [], isLoading: loadingSuggestions } = useSuggestions();
  const generateMutation = useGenerateSuggestions();
  const updateStatusMutation = useUpdateSuggestionStatus();

  const filteredSuggestions = suggestions.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                        s.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'alert': return { icon: AlertTriangle, color: 'text-[#171717] dark:text-white bg-[#f5f5f5] dark:bg-[#18181b] border-[#e5e5e5] dark:border-[#27272a]' };
      case 'optimization': return { icon: Zap, color: 'text-[#171717] dark:text-white bg-[#f5f5f5] dark:bg-[#18181b] border-[#e5e5e5] dark:border-[#27272a]' };
      case 'recommendation': return { icon: TrendingUp, color: 'text-[#171717] dark:text-white bg-[#f5f5f5] dark:bg-[#18181b] border-[#e5e5e5] dark:border-[#27272a]' };
      default: return { icon: Lightbulb, color: 'text-[#737373] bg-[#f5f5f5] dark:bg-[#18181b] border-[#e5e5e5] dark:border-[#27272a]' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { label: 'Haute', color: 'bg-[#171717] text-white dark:bg-white dark:text-black border-[#171717]' };
      case 'medium': return { label: 'Moyenne', color: 'bg-[#f5f5f5] text-[#171717] dark:bg-[#18181b] dark:text-white border-[#e5e5e5] dark:border-[#27272a]' };
      case 'low': return { label: 'Basse', color: 'bg-white text-[#737373] border-[#e5e5e5] dark:bg-[#121215] dark:border-[#27272a]' };
      default: return { label: 'Normale', color: 'bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, label: 'En attente', color: 'text-[#737373]' };
      case 'applied': return { icon: CheckCircle2, label: 'Appliquée', color: 'text-[#171717] dark:text-white' };
      case 'dismissed': return { icon: XCircle, label: 'Rejetée', color: 'text-[#a3a3a3]' };
      default: return { icon: Clock, label: 'Inconnu', color: 'text-[#737373]' };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHrs < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `Il y a ${Math.max(diffMins, 1)}m`;
      }
      if (diffHrs < 24) {
        return `Il y a ${diffHrs}h`;
      }
      const diffDays = Math.floor(diffHrs / 24);
      return `Il y a ${diffDays}j`;
    } catch {
      return 'Récemment';
    }
  };

  if (loadingSuggestions) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-[#f0f0f0] dark:bg-[#18181b] rounded-md"></div>
        <div className="h-12 w-full bg-[#f0f0f0] dark:bg-[#18181b] rounded-md"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#f5f5f5] dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] dark:border-[#27272a] pb-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 bg-white dark:bg-[#18181b] hover:bg-[#f5f5f5] text-[#171717] dark:text-white rounded-md border border-[#e5e5e5] dark:border-[#27272a] transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div className="w-9 h-9 rounded-md bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#171717] dark:text-white tracking-tight">Suggestions IA</h1>
            <p className="text-[#737373] text-xs mt-0.5">Optimisations et recommandations générées pour le traitement des requêtes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-[#f5f5f5] dark:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] text-[#171717] dark:text-white px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
            <Brain size={13} /> {suggestions.filter(s => s.status === 'pending').length} en attente
          </span>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-[#171717] hover:bg-[#262626] dark:bg-white dark:hover:bg-[#e4e4e7] disabled:opacity-50 text-white dark:text-black font-medium text-xs px-3.5 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Brain size={13} className={generateMutation.isPending ? 'animate-spin' : ''} />
            {generateMutation.isPending ? 'Analyse...' : 'Analyser le flux'}
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a] p-3 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-[#a3a3a3]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une recommandation..."
            className="flex-1 outline-none text-xs text-[#171717] dark:text-white placeholder:text-[#a3a3a3] bg-transparent"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'pending', 'applied', 'dismissed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                filter === f
                  ? 'bg-[#171717] text-white dark:bg-white dark:text-black border-[#171717] dark:border-white font-medium'
                  : 'bg-transparent text-[#737373] border-transparent hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'applied' ? 'Appliquées' : 'Rejetées'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des suggestions */}
      <div className="space-y-3">
        {filteredSuggestions.length === 0 ? (
          <div className="bg-white dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a] p-12 text-center">
            <Lightbulb size={32} className="mx-auto text-[#d4d4d4] mb-2" />
            <p className="text-[#737373] text-xs">Aucune suggestion active pour le moment</p>
          </div>
        ) : (
          filteredSuggestions.map(suggestion => {
            const typeConfig = getTypeConfig(suggestion.type);
            const priorityConfig = getPriorityConfig(suggestion.priority);
            const statusConfig = getStatusConfig(suggestion.status);
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={suggestion.id}
                className={`bg-white dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a] p-4 transition-all card-hover ${
                  suggestion.status === 'dismissed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Icône du type */}
                  <div className={`w-9 h-9 rounded-md border ${typeConfig.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={16} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#171717] dark:text-white text-sm">{suggestion.title}</h3>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#737373] dark:text-[#a1a1aa] leading-relaxed">{suggestion.description}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-[11px] font-mono ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Impact et action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {suggestion.impact && (
                        <div className="bg-[#fafafa] dark:bg-[#18181b] rounded-md p-2.5 border border-[#e5e5e5] dark:border-[#27272a]">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#737373] mb-0.5">Impact calculé</p>
                          <p className="text-xs text-[#171717] dark:text-white font-medium">{suggestion.impact}</p>
                        </div>
                      )}
                      {suggestion.recommended_action && (
                        <div className="bg-[#fafafa] dark:bg-[#18181b] rounded-md p-2.5 border border-[#e5e5e5] dark:border-[#27272a]">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#737373] mb-0.5">Action recommandée</p>
                          <p className="text-xs text-[#171717] dark:text-white font-medium">{suggestion.recommended_action}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions et timestamp */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f0] dark:border-[#27272a]">
                      <span className="text-[11px] font-mono text-[#737373]">{formatTimeAgo(suggestion.created_at)}</span>
                      {suggestion.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: 'dismissed' })}
                            className="text-xs font-medium bg-white dark:bg-[#18181b] hover:bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] dark:border-[#27272a] px-3 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            Rejeter
                          </button>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: 'applied' })}
                            className="text-xs font-medium bg-[#171717] hover:bg-[#262626] dark:bg-white dark:hover:bg-[#e4e4e7] text-white dark:text-black px-3.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Appliquer <ArrowRight size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
