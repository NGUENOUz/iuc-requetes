'use client';

import { useState } from 'react';
import {
  FileText, Search, Filter, Download, Eye, CheckCircle, XCircle,
  Clock, ChevronRight, ChevronLeft, SlidersHorizontal,
  ArrowUpDown, RefreshCw, Inbox, ChevronDown, MoreHorizontal,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';
import {
  useAdminKPIs,
  useAdminRequests,
  useStatuses,
  usePriorities,
  useServices,
} from '@/lib/hooks';

const statutStyle: Record<string, string> = {
  'Soumise':    'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'En attente': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'Assignée':   'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
  'En cours':   'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'En attente d\'information': 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  'Résolue':    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Rejetée':    'bg-red-100 text-red-700 ring-1 ring-red-200',
  'Fermée':     'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

const prioriteStyle: Record<string, string> = {
  'Critique': 'bg-red-50 text-red-700',
  'Haute':    'bg-red-50 text-red-600',
  'Normale':  'bg-yellow-50 text-yellow-700',
  'Basse':    'bg-slate-100 text-slate-500',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Soumise':
    case 'En attente':
      return <Clock size={11} />;
    case 'Assignée':
    case 'En cours':
    case 'En attente d\'information':
      return <RefreshCw size={11} className="animate-spin" />;
    case 'Résolue':
      return <CheckCircle size={11} />;
    case 'Rejetée':
      return <XCircle size={11} />;
    default:
      return <Clock size={11} />;
  }
};

const PAGE_SIZE = 8;

export default function AdminRequetesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusId, setStatusId] = useState('all');
  const [priorityId, setPriorityId] = useState('all');
  const [serviceId, setServiceId] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>('submitted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Vérifier le rôle
  const isAdmin = user?.role?.name === 'admin';
  const isAgent = user?.role?.name === 'agent';
  
  // Pour les agents, filtrer par défaut sur leur service
  const effectiveServiceId = isAgent && serviceId === 'all' ? user?.service_id || 'all' : serviceId;
  const effectiveAssignedTo = assignedFilter === 'mine' ? user?.id : assignedFilter === 'unassigned' ? 'null' : undefined;

  // Load backend data
  const { data: statsData, isLoading: statsLoading } = useAdminKPIs();
  const { data: statuses = [], isLoading: statusesLoading } = useStatuses();
  const { data: priorities = [], isLoading: prioritiesLoading } = usePriorities();
  const { data: services = [], isLoading: servicesLoading } = useServices();

  const { data: requestsRes, isLoading: requestsLoading } = useAdminRequests({
    search,
    status_id: statusId,
    priority_id: priorityId,
    service_id: effectiveServiceId,
    assigned_to: effectiveAssignedTo,
    page,
    limit: PAGE_SIZE,
    sort_by: sortCol || 'submitted_at',
    sort_order: sortDir,
  });

  const requestsList = requestsRes?.data || [];
  const pagination = requestsRes?.pagination || { total: 0, totalPages: 1 };

  // Quick action status values
  const statusResolved = statuses.find((s: any) => s.name === 'Résolue');
  const statusRejected = statuses.find((s: any) => s.name === 'Rejetée');

  // Quick Action Assign Mutation
  const assignToMeMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          assigned_to: user?.id,
          assigned_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'assignation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'kpis'] });
    },
  });

  // Quick Action Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, statusId }: { id: string; statusId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status_id: statusId,
          ...(statusId === statusResolved?.id ? { resolved_at: new Date().toISOString() } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la requête');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'kpis'] });
    },
  });

  /* ── Tri ── */
  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setStatusId('all'); setPriorityId('all'); setServiceId('all'); setAssignedFilter('all'); setPage(1);
  };

  const hasActiveFilters = search || statusId !== 'all' || priorityId !== 'all' || serviceId !== 'all' || assignedFilter !== 'all';

  // Stats Counters
  const getStatusCount = (names: string[]) => {
    if (!statsData?.by_status) return 0;
    return names.reduce((sum, name) => sum + (statsData.by_status[name]?.count ?? 0), 0);
  };

  const totalRequests = statsData?.overview?.total_requests ?? 0;
  const pendingRequestsCount = getStatusCount(['En attente', 'Soumise', 'Assignée', 'En attente d\'information']);
  const inProgressRequestsCount = getStatusCount(['En cours']);
  const resolvedRequestsCount = getStatusCount(['Résolue']);
  const rejectedRequestsCount = getStatusCount(['Rejetée']);

  const STATS_TOP = [
    { label: 'Total', value: totalRequests, icon: Inbox, color: 'text-slate-600 bg-slate-100', targetId: 'all' },
    { label: 'En attente', value: pendingRequestsCount, icon: Clock, color: 'text-blue-600 bg-blue-50', targetId: statuses.find((s: any) => s.name === 'En attente')?.id || 'all' },
    { label: 'En cours', value: inProgressRequestsCount, icon: RefreshCw, color: 'text-yellow-600 bg-yellow-50', targetId: statuses.find((s: any) => s.name === 'En cours')?.id || 'all' },
    { label: 'Résolues', value: resolvedRequestsCount, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', targetId: statusResolved?.id || 'all' },
    { label: 'Rejetées', value: rejectedRequestsCount, icon: XCircle, color: 'text-red-600 bg-red-50', targetId: statusRejected?.id || 'all' },
  ];

  // Skeletons while loading
  const showLoading = statsLoading || requestsLoading || statusesLoading || prioritiesLoading || servicesLoading;

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">
              {isAgent ? 'Mes requêtes' : 'Gestion des requêtes'}
            </h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pagination.total}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAgent 
              ? 'Consultez et traitez vos requêtes assignées.' 
              : 'Consultez, traitez et suivez toutes les requêtes étudiantes.'}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer">
          <Download size={15} />
          Exporter
        </button>
      </div>

      {/* ── Compteurs rapides ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATS_TOP.map(({ label, value, icon: Icon, color, targetId }) => (
          <button
            key={label}
            onClick={() => { setStatusId(targetId); setPage(1); }}
            className={`bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer ${
              statusId === targetId ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Filtres rapides agent ── */}
      {isAgent && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setAssignedFilter('all'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              assignedFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toutes les requêtes
          </button>
          <button
            onClick={() => { setAssignedFilter('mine'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              assignedFilter === 'mine'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Mes requêtes assignées
          </button>
          <button
            onClick={() => { setAssignedFilter('unassigned'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              assignedFilter === 'unassigned'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Non assignées
          </button>
        </div>
      )}

      {/* ── Barre de recherche + filtres ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par ID, étudiant, titre..."
              className="w-full h-10 bg-slate-50 rounded-xl pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 border border-transparent focus:border-emerald-300 transition-all"
            />
          </div>

          {/* Bouton filtres avancés */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtres
            {hasActiveFilters && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-10 px-3 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all font-medium border border-transparent cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filtres dépliants */}
        {showFilters && (
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 animate-fadeIn">
            {/* Statut */}
            <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide min-w-[70px]">Statut</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => { setStatusId('all'); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                    statusId === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tous
                </button>
                {statuses.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => { setStatusId(s.id); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                      statusId === s.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Priorité */}
            <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide min-w-[70px]">Priorité</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => { setPriorityId('all'); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                    priorityId === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Toutes
                </button>
                {priorities.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { setPriorityId(p.id); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                      priorityId === p.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Service - seulement pour admin */}
            {isAdmin && (
              <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide min-w-[70px]">Service</span>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => { setServiceId('all'); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                      serviceId === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Tous
                  </button>
                  {services.map((sv: any) => (
                    <button
                      key={sv.id}
                      onClick={() => { setServiceId(sv.id); setPage(1); }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                        serviceId === sv.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sv.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tableau / Contenu ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[350px]">
        {showLoading ? (
          /* Loading Skeletons */
          <div className="p-5 space-y-4 animate-pulse">
            <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0"></div>
                <div className="h-5 bg-slate-100 rounded w-1/4"></div>
                <div className="h-5 bg-slate-100 rounded w-1/5"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-20"></div>
                <div className="h-5 bg-slate-100 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : requestsList.length === 0 ? (
          /* État vide */
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">Aucune requête trouvée</p>
            <p className="text-sm mt-1">Modifiez vos filtres ou effectuez une autre recherche.</p>
            <button onClick={resetFilters} className="mt-4 text-emerald-600 text-sm font-semibold hover:underline cursor-pointer">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {[
                      { label: 'Référence', col: 'reference' },
                      { label: 'Étudiant', col: 'student_id' },
                      { label: 'Catégorie', col: 'category_id' },
                      { label: 'Service', col: 'service_id' },
                      { label: 'Statut', col: 'status_id' },
                      { label: 'Priorité', col: 'priority_id' },
                      { label: 'Date', col: 'submitted_at' },
                      { label: 'Agent', col: 'assigned_to' },
                      { label: '', col: null },
                    ].map(({ label, col }) => (
                      <th
                        key={label}
                        className={`text-left py-3.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide ${col ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}
                        onClick={() => col && handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {col && (
                            <ArrowUpDown
                              size={11}
                              className={sortCol === col ? 'text-emerald-500' : 'text-slate-300'}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requestsList.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">

                      {/* ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-500">{r.reference}</span>
                      </td>

                      {/* Étudiant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            {r.student ? `${r.student.first_name?.[0] || ''}${r.student.last_name?.[0] || ''}`.toUpperCase().slice(0, 2) : '?'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Inconnu'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{r.student?.matricule || 'Sans matricule'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[160px]">
                        <p className="truncate">{r.category?.name || 'Général'}</p>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                          {r.service?.name || 'Non assigné'}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${statutStyle[r.status?.name] || 'bg-slate-100 text-slate-600'}`}>
                          {getStatusIcon(r.status?.name)}
                          {r.status?.name}
                        </span>
                      </td>

                      {/* Priorité */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.priority?.name === 'Critique' || r.priority?.name === 'Haute' ? 'bg-red-500' :
                            r.priority?.name === 'Normale' ? 'bg-yellow-500' : 'bg-slate-300'
                          }`} />
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[r.priority?.name] || 'bg-slate-100'}`}>
                            {r.priority?.name || 'Normale'}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(r.submitted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Agent */}
                      <td className="py-3.5 px-4">
                        {r.assigned_agent ? (
                          <span className="text-xs text-slate-600 font-medium">
                            {r.assigned_agent.first_name} {r.assigned_agent.last_name[0]}.
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Non assigné</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/requetes/${r.id}`}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Voir le détail"
                          >
                            <Eye size={14} />
                          </Link>
                          {/* Bouton pour s'assigner (agent seulement) */}
                          {isAgent && !r.assigned_to && (
                            <button
                              onClick={() => assignToMeMutation.mutate(r.id)}
                              disabled={assignToMeMutation.isPending}
                              className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="M'assigner cette requête"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                          {r.status?.name !== 'Résolue' && statusResolved && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: r.id, statusId: statusResolved.id })}
                              disabled={updateStatusMutation.isPending}
                              className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Résoudre"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {r.status?.name !== 'Rejetée' && statusRejected && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: r.id, statusId: statusRejected.id })}
                              disabled={updateStatusMutation.isPending}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Rejeter"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Affichage <span className="font-bold text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)}</span> sur <span className="font-bold text-slate-700">{pagination.total}</span> requêtes
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      page === n
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
