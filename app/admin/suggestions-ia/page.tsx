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
      case 'alert': return { icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100' };
      case 'optimization': return { icon: Zap, color: 'text-violet-600 bg-violet-50 border-violet-100' };
      case 'recommendation': return { icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      default: return { icon: Lightbulb, color: 'text-slate-600 bg-slate-50 border-slate-100' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'medium': return { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'low': return { label: 'Basse', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      default: return { label: 'Inconnue', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, label: 'En attente', color: 'text-amber-600' };
      case 'applied': return { icon: CheckCircle2, label: 'Appliquée', color: 'text-emerald-600' };
      case 'dismissed': return { icon: XCircle, label: 'Rejetée', color: 'text-slate-400' };
      default: return { icon: Clock, label: 'Inconnu', color: 'text-slate-400' };
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

  // Loading skeleton screen
  if (loadingSuggestions) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="h-14 w-full bg-slate-100 rounded-2xl border border-slate-200"></div>

        {/* Suggestions List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-slate-200 rounded-lg"></div>
                  <div className="h-4 w-full bg-slate-100 rounded-lg"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
                    <div className="h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">
            <Lightbulb size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Suggestions IA</h1>
            <p className="text-slate-500 text-sm">Recommandations intelligentes pour optimiser vos opérations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-violet-50 border border-violet-100 text-violet-700 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Brain size={14} /> {suggestions.filter(s => s.status === 'pending').length} suggestions actives
          </span>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/10 cursor-pointer"
          >
            <Brain size={14} className={generateMutation.isPending ? 'animate-spin' : ''} />
            {generateMutation.isPending ? 'Génération...' : 'Générer via IA'}
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une suggestion..."
            className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          {(['all', 'pending', 'applied', 'dismissed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Lightbulb size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">Aucune suggestion trouvée</p>
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
                className={`bg-white rounded-2xl border border-slate-200 p-5 transition-all hover:shadow-md ${
                  suggestion.status === 'dismissed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône du type */}
                  <div className={`w-12 h-12 rounded-xl ${typeConfig.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-base">{suggestion.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{suggestion.description}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Impact et action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {suggestion.impact && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Impact</p>
                          <p className="text-xs font-semibold text-slate-700">{suggestion.impact}</p>
                        </div>
                      )}
                      {suggestion.recommended_action && (
                        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                          <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Action recommandée</p>
                          <p className="text-xs font-semibold text-indigo-900">{suggestion.recommended_action}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions et timestamp */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">{formatTimeAgo(suggestion.created_at)}</span>
                      {suggestion.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: 'dismissed' })}
                            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            Rejeter
                          </button>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: 'applied' })}
                            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            Appliquer <ArrowRight size={12} />
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
