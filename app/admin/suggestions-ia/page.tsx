'use client';

import { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, ArrowRight, Filter, Search, Zap, Brain } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'optimization' | 'alert' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    type: 'alert',
    priority: 'high',
    title: 'Surcharge détectée - Service Scolarité',
    description: 'TAMBA Eric gère 12 dossiers actifs contre une moyenne de 8. Risque de retard sur les SLA.',
    impact: '4 requêtes à risque de dépassement sous 24h',
    action: 'Réassigner 2-3 dossiers à FOUDA Martine',
    status: 'pending',
    createdAt: 'Il y a 2h'
  },
  {
    id: 'sug-2',
    type: 'optimization',
    priority: 'medium',
    title: 'Automatiser les réponses type',
    description: '18% des requêtes de scolarité sont des demandes d\'attestation standard.',
    impact: 'Gain estimé de 4h/semaine par agent',
    action: 'Créer un template auto-réponse pour attestations',
    status: 'pending',
    createdAt: 'Il y a 5h'
  },
  {
    id: 'sug-3',
    type: 'recommendation',
    priority: 'high',
    title: 'Renforcer l\'équipe Finance',
    description: 'Le délai moyen de traitement Finance (3.2j) dépasse la cible de 2j.',
    impact: 'SLA non respecté sur 23% des requêtes Finance',
    action: 'Affecter un agent supplémentaire ou former un polyvalent',
    status: 'pending',
    createdAt: 'Il y a 1j'
  },
  {
    id: 'sug-4',
    type: 'optimization',
    priority: 'low',
    title: 'Optimiser les horaires de pointe',
    description: '67% des requêtes sont soumises entre 10h-12h.',
    impact: 'Améliorer la répartition de la charge',
    action: 'Mettre en place un planning de permanence renforcée',
    status: 'applied',
    createdAt: 'Il y a 3j'
  },
  {
    id: 'sug-5',
    type: 'alert',
    priority: 'medium',
    title: 'Baisse de satisfaction - Service Bibliothèque',
    description: 'Note moyenne passée de 4.2/5 à 3.8/5 ce mois-ci.',
    impact: '8 avis négatifs en 2 semaines',
    action: 'Enquête qualité et formation relationnelle',
    status: 'dismissed',
    createdAt: 'Il y a 5j'
  }
];

export default function SuggestionsIaPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied' | 'dismissed'>('all');
  const [search, setSearch] = useState('');

  const filteredSuggestions = SUGGESTIONS.filter(s => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">
            <Lightbulb size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Suggestions IA</h1>
            <p className="text-slate-500 text-sm">Recommandations intelligentes pour optimiser vos opérations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-violet-50 border border-violet-100 text-violet-700 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Brain size={14} /> {filteredSuggestions.filter(s => s.status === 'pending').length} suggestions actives
          </span>
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
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
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
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Impact</p>
                        <p className="text-xs font-semibold text-slate-700">{suggestion.impact}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Action recommandée</p>
                        <p className="text-xs font-semibold text-indigo-900">{suggestion.action}</p>
                      </div>
                    </div>

                    {/* Actions et timestamp */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">{suggestion.createdAt}</span>
                      {suggestion.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg transition-all">
                            Rejeter
                          </button>
                          <button className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
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
