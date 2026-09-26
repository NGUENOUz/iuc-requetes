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
  'Soumise':    'bg-[#f5f5f5] dark:bg-[#18181b] text-[#171717] dark:text-[#f4f4f5] border border-[#e5e5e5] dark:border-[#27272a]',
  'En attente': 'bg-[#f5f5f5] dark:bg-[#18181b] text-[#171717] dark:text-[#f4f4f5] border border-[#e5e5e5] dark:border-[#27272a]',
  'Assignée':   'bg-[#f0f0f0] dark:bg-[#27272a] text-[#171717] dark:text-[#f4f4f5] border border-[#d4d4d4] dark:border-[#3f3f46]',
  'En cours':   'bg-[#171717] dark:bg-white text-white dark:text-black font-semibold shadow-2xs',
  'En attente d\'information': 'bg-[#f5f5f5] dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border border-[#e5e5e5] dark:border-[#27272a]',
  'Résolue':    'bg-[#171717] dark:bg-white text-white dark:text-black border border-[#171717] dark:border-white font-semibold',
  'Rejetée':    'bg-[#fafafa] dark:bg-[#18181b] text-[#737373] dark:text-[#71717a] border border-[#e5e5e5] dark:border-[#27272a] line-through',
  'Fermée':     'bg-[#f5f5f5] dark:bg-[#18181b] text-[#737373] dark:text-[#71717a] border border-[#e5e5e5] dark:border-[#27272a]',
};

const prioriteStyle: Record<string, string> = {
  'Critique': 'bg-[#171717] dark:bg-white text-white dark:text-black font-mono',
  'Haute':    'bg-[#171717] dark:bg-white text-white dark:text-black font-mono',
  'Normale':  'bg-[#f5f5f5] dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border border-[#e5e5e5] dark:border-[#27272a] font-mono',
  'Basse':    'bg-[#fafafa] dark:bg-[#18181b] text-[#737373] dark:text-[#71717a] border border-[#e5e5e5] dark:border-[#27272a] font-mono',
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
    { label: 'Total', value: totalRequests, icon: Inbox, targetId: 'all' },
    { label: 'En attente', value: pendingRequestsCount, icon: Clock, targetId: statuses.find((s: any) => s.name === 'En attente')?.id || 'all' },
    { label: 'En cours', value: inProgressRequestsCount, icon: RefreshCw, targetId: statuses.find((s: any) => s.name === 'En cours')?.id || 'all' },
    { label: 'Résolues', value: resolvedRequestsCount, icon: CheckCircle, targetId: statusResolved?.id || 'all' },
    { label: 'Rejetées', value: rejectedRequestsCount, icon: XCircle, targetId: statusRejected?.id || 'all' },
  ];

  // Skeletons while loading
  const showLoading = statsLoading || requestsLoading || statusesLoading || prioritiesLoading || servicesLoading;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] dark:border-[#27272a] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
              {isAgent ? 'Mes requêtes assignées' : 'Registre des requêtes & tickets'}
            </h1>
            <span className="bg-[#f0f0f0] dark:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] text-[#171717] dark:text-[#f4f4f5] text-[11px] font-mono font-medium px-2 py-0.5 rounded">
              {pagination.total} tickets
            </span>
          </div>
          <p className="text-[#737373] dark:text-[#a1a1aa] text-[13px] mt-0.5">
            {isAgent 
              ? 'Dossiers étudiants et réclamations sous votre charge directe'
              : 'Supervision générale de l\'ensemble des requêtes académiques et administratives'}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-[#18181b] hover:bg-[#fafafa] dark:hover:bg-[#27272a] text-[#171717] dark:text-white border border-[#e5e5e5] dark:border-[#27272a] text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-2xs cursor-pointer">
          <Download size={13} />
          Exporter CSV
        </button>
      </div>

      {/* ── Compteurs rapides (Vercel Style) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATS_TOP.map(({ label, value, icon: Icon, targetId }) => (
          <button
            key={label}
            onClick={() => { setStatusId(targetId); setPage(1); }}
            className={`rounded-lg border p-3 transition-all text-left cursor-pointer ${
              statusId === targetId
                ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#27272a] ring-1 ring-[#171717] dark:ring-white'
                : 'border-[#e5e5e5] dark:border-[#27272a] bg-white dark:bg-[#121215] hover:border-[#171717] dark:hover:border-[#71717a]'
            }`}
          >
            <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa] mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a1a1aa]">
                {label}
              </span>
              <Icon size={14} className="text-[#737373] dark:text-[#a1a1aa]" />
            </div>
            <p className="text-xl font-bold font-mono text-[#171717] dark:text-white">{value}</p>
          </button>
        ))}
      </div>

      {/* ── Filtres rapides agent ── */}
      {isAgent && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setAssignedFilter('all'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
              assignedFilter === 'all'
                ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#27272a]'
            }`}
          >
            Toutes les requêtes
          </button>
          <button
            onClick={() => { setAssignedFilter('mine'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
              assignedFilter === 'mine'
                ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#27272a]'
            }`}
          >
            Mes requêtes assignées
          </button>
          <button
            onClick={() => { setAssignedFilter('unassigned'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
              assignedFilter === 'unassigned'
                ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#27272a]'
            }`}
          >
            Non assignées
          </button>
        </div>
      )}

      {/* ── Barre de recherche + filtres ── */}
      <div className="bg-white dark:bg-[#121215] rounded-xl border border-[#e5e5e5] dark:border-[#27272a] shadow-2xs p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#a1a1aa] pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par référence, demandeur, objet..."
              className="w-full h-9 bg-[#f5f5f5] dark:bg-[#18181b] hover:bg-[#f0f0f0] dark:hover:bg-[#27272a] focus:bg-white dark:focus:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-[#27272a] focus:border-[#171717] dark:focus:border-white rounded-md pl-9 pr-3 text-[13px] text-[#171717] dark:text-white placeholder:text-[#a3a3a3] dark:placeholder:text-[#71717a] outline-none transition-all font-sans"
            />
          </div>

          {/* Bouton filtres avancés */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-md text-[12px] font-semibold border transition-all cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#27272a]'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filtres
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
            )}
          </button>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-9 px-2.5 rounded-md text-[12px] text-[#737373] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#18181b] transition-all font-medium cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filtres dépliants */}
        {showFilters && (
          <div className="flex flex-col gap-3.5 pt-3.5 border-t border-[#f5f5f5] dark:border-[#27272a] text-[12px]">
            {/* Statut */}
            <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
              <span className="font-mono uppercase text-[10px] text-[#737373] dark:text-[#a1a1aa] font-semibold min-w-[70px]">Statut</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => { setStatusId('all'); setPage(1); }}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all border cursor-pointer ${
                    statusId === 'all'
                      ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                      : 'bg-white dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#27272a]'
                  }`}
                >
                  Tous
                </button>
                {statuses.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => { setStatusId(s.id); setPage(1); }}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all border cursor-pointer ${
                      statusId === s.id
                        ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white dark:bg-[#18181b] text-[#525252] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#27272a]'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Priorité */}
            <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
              <span className="text-xs font-bold text-[#737373] dark:text-[#a1a1aa] uppercase tracking-wide min-w-[70px]">Priorité</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => { setPriorityId('all'); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors border cursor-pointer ${
                    priorityId === 'all'
                      ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                      : 'bg-white dark:bg-[#18181b] text-[#737373] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  Toutes
                </button>
                {priorities.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { setPriorityId(p.id); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors border cursor-pointer ${
                      priorityId === p.id
                        ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white dark:bg-[#18181b] text-[#737373] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:text-[#171717] dark:hover:text-white'
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
                <span className="text-xs font-bold text-[#737373] dark:text-[#a1a1aa] uppercase tracking-wide min-w-[70px]">Service</span>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => { setServiceId('all'); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors border cursor-pointer ${
                      serviceId === 'all'
                        ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white dark:bg-[#18181b] text-[#737373] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    Tous
                  </button>
                  {services.map((sv: any) => (
                    <button
                      key={sv.id}
                      onClick={() => { setServiceId(sv.id); setPage(1); }}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors border cursor-pointer ${
                        serviceId === sv.id
                          ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                          : 'bg-white dark:bg-[#18181b] text-[#737373] dark:text-[#a1a1aa] border-[#e5e5e5] dark:border-[#27272a] hover:text-[#171717] dark:hover:text-white'
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
      <div className="bg-white dark:bg-[#121215] rounded-xl border border-[#e5e5e5] dark:border-[#27272a] shadow-2xs overflow-hidden min-h-[350px]">
        {showLoading ? (
          /* Loading Skeletons */
          <div className="p-5 space-y-4 animate-pulse">
            <div className="h-10 bg-[#f5f5f5] dark:bg-[#18181b] rounded-lg w-full"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-[#18181b] shrink-0"></div>
                <div className="h-5 bg-[#f5f5f5] dark:bg-[#18181b] rounded w-1/4"></div>
                <div className="h-5 bg-[#f5f5f5] dark:bg-[#18181b] rounded w-1/5"></div>
                <div className="h-5 bg-[#f5f5f5] dark:bg-[#18181b] rounded w-1/6"></div>
                <div className="h-5 bg-[#f5f5f5] dark:bg-[#18181b] rounded w-20"></div>
                <div className="h-5 bg-[#f5f5f5] dark:bg-[#18181b] rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : requestsList.length === 0 ? (
          /* État vide */
          <div className="flex flex-col items-center justify-center py-20 text-[#737373] dark:text-[#a1a1aa]">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="font-semibold text-[#171717] dark:text-white">Aucune requête trouvée</p>
            <p className="text-sm mt-1 text-[#737373] dark:text-[#a1a1aa]">Modifiez vos filtres ou effectuez une autre recherche.</p>
            <button onClick={resetFilters} className="mt-4 text-[#171717] dark:text-white underline text-sm font-semibold hover:opacity-80 cursor-pointer">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-[#fafafa] dark:bg-[#18181b] border-b border-[#e5e5e5] dark:border-[#27272a]">
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
                        className={`text-left py-3.5 px-4 text-xs font-bold text-[#737373] dark:text-[#a1a1aa] uppercase tracking-wide ${col ? 'cursor-pointer hover:text-[#171717] dark:hover:text-white select-none' : ''}`}
                        onClick={() => col && handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {col && (
                            <ArrowUpDown
                              size={11}
                              className={sortCol === col ? 'text-[#171717] dark:text-white' : 'text-[#a3a3a3] dark:text-[#52525b]'}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#27272a]">
                  {requestsList.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#fafafa] dark:hover:bg-[#18181b]/70 transition-colors group">

                      {/* ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-[#737373] dark:text-[#a1a1aa]">{r.reference}</span>
                      </td>

                      {/* Étudiant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-2xs">
                            {r.student ? `${r.student.first_name?.[0] || ''}${r.student.last_name?.[0] || ''}`.toUpperCase().slice(0, 2) : '?'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171717] dark:text-white">
                              {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Inconnu'}
                            </p>
                            <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa] font-mono">{r.student?.matricule || 'Sans matricule'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 px-4 text-xs text-[#171717] dark:text-[#d4d4d8] max-w-[160px]">
                        <p className="truncate">{r.category?.name || 'Général'}</p>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs bg-[#f5f5f5] dark:bg-[#18181b] text-[#525252] dark:text-[#d4d4d8] border border-[#e5e5e5] dark:border-[#27272a] px-2 py-0.5 rounded-md font-medium">
                          {r.service?.name || 'Non assigné'}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${statutStyle[r.status?.name] || 'bg-[#f5f5f5] dark:bg-[#18181b] text-[#737373]'}`}>
                          {getStatusIcon(r.status?.name)}
                          {r.status?.name}
                        </span>
                      </td>

                      {/* Priorité */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.priority?.name === 'Critique' || r.priority?.name === 'Haute' ? 'bg-[#171717] dark:bg-white' :
                            r.priority?.name === 'Normale' ? 'bg-[#737373]' : 'bg-[#a3a3a3]'
                          }`} />
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${prioriteStyle[r.priority?.name] || 'bg-[#f5f5f5] dark:bg-[#18181b]'}`}>
                            {r.priority?.name || 'Normale'}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-[#737373] dark:text-[#a1a1aa] whitespace-nowrap">
                        {new Date(r.submitted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Agent */}
                      <td className="py-3.5 px-4">
                        {r.assigned_agent ? (
                          <span className="text-xs text-[#525252] dark:text-[#d4d4d8] font-medium">
                            {r.assigned_agent.first_name} {r.assigned_agent.last_name[0]}.
                          </span>
                        ) : (
                          <span className="text-xs text-[#a3a3a3] dark:text-[#71717a] italic">Non assigné</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/requetes/${r.id}`}
                            className="w-7 h-7 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white transition-colors"
                            title="Voir le détail"
                          >
                            <Eye size={14} />
                          </Link>
                          {/* Bouton pour s'assigner (agent seulement) */}
                          {isAgent && !r.assigned_to && (
                            <button
                              onClick={() => assignToMeMutation.mutate(r.id)}
                              disabled={assignToMeMutation.isPending}
                              className="w-7 h-7 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                              title="M'assigner cette requête"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                          {r.status?.name !== 'Résolue' && statusResolved && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: r.id, statusId: statusResolved.id })}
                              disabled={updateStatusMutation.isPending}
                              className="w-7 h-7 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                              title="Résoudre"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {r.status?.name !== 'Rejetée' && statusRejected && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: r.id, statusId: statusRejected.id })}
                              disabled={updateStatusMutation.isPending}
                              className="w-7 h-7 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] hover:text-red-500 transition-colors cursor-pointer"
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
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t border-[#e5e5e5] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#18181b]/50">
              <p className="text-xs text-[#737373] dark:text-[#a1a1aa]">
                Affichage <span className="font-bold text-[#171717] dark:text-white">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)}</span> sur <span className="font-bold text-[#171717] dark:text-white">{pagination.total}</span> requêtes
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-md border border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] bg-white dark:bg-[#18181b] hover:text-[#171717] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#27272a] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-7 h-7 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                        page === n
                          ? 'bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-black dark:border-white'
                          : 'border-[#e5e5e5] dark:border-[#27272a] text-[#737373] dark:text-[#a1a1aa] bg-white dark:bg-[#18181b] hover:bg-[#f5f5f5] dark:hover:bg-[#27272a]'
                      }`}
                    >
                      {n}
                    </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="w-8 h-8 rounded-md border border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] bg-white dark:bg-[#18181b] hover:text-[#171717] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#27272a] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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
