'use client';

import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  Brain,
  TrendingUp,
  Zap,
  Eye,
  Calendar,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import {
  useAdminKPIs,
  useRecentRequests,
  useRequestChart,
  useStatusDistribution,
  useSuggestions,
  useAgentStats,
  useAgentRecentRequests,
  useAgentRequestChart,
  useAgentStatusDistribution,
} from '@/lib/hooks';

/* ─── Graphique SVG Config ─── */
const W = 500, H = 160, PAD = 20;

/* ─── Donut chart Config ─── */
const CIRCUMFERENCE = 2 * Math.PI * 52;
function DonutSlice({ pct, colorClass, offset }: { pct: number; colorClass: string; offset: number }) {
  const dash = (pct / 100) * CIRCUMFERENCE;
  return (
    <circle
      cx="60" cy="60" r="52"
      fill="none"
      stroke="currentColor"
      className={colorClass}
      strokeWidth="14"
      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
      strokeDashoffset={-offset}
      strokeLinecap="butt"
      transform="rotate(-90 60 60)"
    />
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data: statsData, isLoading: statsLoading } = useAdminKPIs();
  const { data: agentStatsData, isLoading: agentStatsLoading } = useAgentStats();
  const { data: adminRecentRequests = [], isLoading: adminRequestsLoading } = useRecentRequests();
  const { data: agentRecentRequests = [], isLoading: agentRequestsLoading } = useAgentRecentRequests();
  const { data: adminChartPoints = [], isLoading: adminChartLoading } = useRequestChart(12);
  const { data: agentChartPoints = [], isLoading: agentChartLoading } = useAgentRequestChart(12);
  const { data: adminDonutData = [], total: adminDonutTotal = 0, isLoading: adminDonutLoading } = useStatusDistribution();
  const { data: agentDonutData = [], total: agentDonutTotal = 0, isLoading: agentDonutLoading } = useAgentStatusDistribution();
  const { data: suggestions = [], isLoading: suggestionsLoading } = useSuggestions();

  const isAdmin = user?.role?.name === 'admin';
  const isAgent = user?.role?.name === 'agent';
  
  const currentStats = isAgent ? agentStatsData : statsData;
  const currentStatsLoading = isAgent ? agentStatsLoading : statsLoading;
  const recentRequests = isAgent ? agentRecentRequests : adminRecentRequests;
  const requestsLoading = isAgent ? agentRequestsLoading : adminRequestsLoading;
  const chartPoints = isAgent ? agentChartPoints : adminChartPoints;
  const chartLoading = isAgent ? agentChartLoading : adminChartLoading;
  const donutData = isAgent ? agentDonutData : adminDonutData;
  const donutTotal = isAgent ? agentDonutTotal : adminDonutTotal;
  const donutLoading = isAgent ? agentDonutLoading : adminDonutLoading;

  let donutOffset = 0;

  if (currentStatsLoading || requestsLoading || chartLoading || donutLoading || suggestionsLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"></div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusCount = (names: string[]) => {
    if (!currentStats?.by_status) return 0;
    return names.reduce((sum, name) => sum + (currentStats.by_status[name]?.count ?? 0), 0);
  };

  const totalRequests = currentStats?.overview?.total_requests ?? currentStats?.overview?.total_assigned ?? 0;
  const pendingRequestsCount = getStatusCount(['En attente', 'Soumise', 'Assignée', 'En attente d\'information']);
  const inProgressRequestsCount = getStatusCount(['En cours']);
  const resolvedRequestsCount = getStatusCount(['Résolue']);
  const rejectedRequestsCount = getStatusCount(['Rejetée']);

  // Clean Notion/Vercel Monochrome KPI Cards
  const STATS_CARDS = [
    {
      label: isAgent ? 'Requêtes assignées' : 'Total des requêtes',
      value: totalRequests,
      icon: FileText,
      trend: '+12.5%',
      sub: 'Flux global enregistré',
    },
    {
      label: 'En attente',
      value: pendingRequestsCount,
      icon: Clock,
      trend: '+8.2%',
      sub: 'En cours d\'affectation',
    },
    {
      label: 'En cours d\'instruction',
      value: inProgressRequestsCount,
      icon: Activity,
      trend: '+15.7%',
      sub: 'Pris en charge actif',
    },
    {
      label: 'Résolues & Certifiées',
      value: resolvedRequestsCount,
      icon: CheckCircle2,
      trend: '+20.3%',
      sub: 'Délivrées avec QR code',
    },
    {
      label: 'Rejetées / Clôturées',
      value: rejectedRequestsCount,
      icon: XCircle,
      trend: '-9.1%',
      sub: 'Dossiers non conformes',
    },
  ];

  const N = chartPoints.length > 1 ? chartPoints.length - 1 : 11;
  const maxY = chartPoints.length > 0 ? Math.max(...chartPoints.map(p => p.y), 10) : 10;
  
  const cx = (x: number) => PAD + (x / N) * (W - PAD * 2);
  const cy = (y: number) => H - PAD - (y / maxY) * (H - PAD * 2);
  
  const polyline = chartPoints.map(p => `${cx(p.x)},${cy(p.y)}`).join(' ');

  const activeSuggestion = suggestions.find(s => s.status === 'pending') || suggestions[0];

  return (
    <div className="p-6 sm:p-8 space-y-7 max-w-7xl mx-auto">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] dark:border-[#27272a] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
            {isAgent ? `Bonjour, ${user?.first_name || 'Agent'}` : 'Tableau de bord de gestion'}
          </h1>
          <p className="text-[13px] text-[#737373] dark:text-[#a1a1aa] mt-0.5">
            {isAgent
              ? 'Supervision de vos requêtes assignées et suivi de vos délais de réponse (SLA).'
              : 'Supervision centrale du flux des requêtes, des affectations et des certifications.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#e5e5e5] dark:border-[#27272a] bg-white dark:bg-[#121215] text-[12px] font-mono text-[#525252] dark:text-[#d4d4d8] shadow-2xs">
            <Calendar size={13} className="text-[#737373] dark:text-[#a1a1aa]" />
            <span>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <Link
            href="/admin/requetes"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#171717] hover:bg-[#262626] dark:bg-white dark:hover:bg-[#f0f0f0] text-white dark:text-black text-[12px] font-semibold transition-colors shadow-2xs"
          >
            <span>Consulter les requêtes</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Notion / Vercel KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {STATS_CARDS.map(({ label, value, icon: Icon, trend, sub }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#121215] rounded-lg border border-[#e5e5e5] dark:border-[#27272a] p-4 hover:border-[#171717] dark:hover:border-[#71717a] transition-all flex flex-col justify-between card-hover"
          >
            <div>
              <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa] mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider font-mono">
                  {label}
                </span>
                <Icon size={15} className="text-[#737373] dark:text-[#a1a1aa]" />
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-[#171717] dark:text-white">
                {value}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#f5f5f5] dark:border-[#27272a] flex items-center justify-between text-[11px] text-[#737373] dark:text-[#a1a1aa] font-mono">
              <span>{sub}</span>
              <span className="text-[#171717] dark:text-white font-semibold">{trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts & Analytics Section (Vercel Style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Evolution Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-[#121215] rounded-lg border border-[#e5e5e5] dark:border-[#27272a] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f5f5f5] dark:border-[#27272a]">
            <div>
              <h2 className="text-[13px] font-semibold text-[#171717] dark:text-white">
                {isAgent ? 'Évolution de mes requêtes' : 'Activité & Volume des requêtes'}
              </h2>
              <p className="text-[11px] text-[#737373] dark:text-[#a1a1aa]">
                Nombre de demandes enregistrées sur les 12 derniers jours
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#525252] dark:text-[#d4d4d8] border border-[#e5e5e5] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#18181b] px-2 py-0.5 rounded">
              12 derniers jours
            </span>
          </div>

          <div className="w-full h-44 overflow-hidden pt-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" className="text-[#171717] dark:text-white" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-[#171717] dark:text-white" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = PAD + pct * (H - PAD * 2);
                return (
                  <line
                    key={pct}
                    x1={PAD}
                    y1={y}
                    x2={W - PAD}
                    y2={y}
                    className="stroke-[#f0f0f0] dark:stroke-[#27272a]"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Data line */}
              {polyline && (
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="currentColor"
                  className="text-[#171717] dark:text-white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {chartPoints.map((p) => (
                <circle
                  key={p.x}
                  cx={cx(p.x)}
                  cy={cy(p.y)}
                  r="3.5"
                  className="fill-white dark:fill-[#121215] stroke-[#171717] dark:stroke-white"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>

          <div className="pt-3 border-t border-[#f5f5f5] dark:border-[#27272a] flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a1a1aa]">
            <span>15 sept.</span>
            <span>18 sept.</span>
            <span>21 sept.</span>
            <span>24 sept.</span>
            <span className="text-[#171717] dark:text-white font-semibold">Aujourd'hui</span>
          </div>
        </div>

        {/* Status Breakdown (Donut & List) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121215] rounded-lg border border-[#e5e5e5] dark:border-[#27272a] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f5f5f5] dark:border-[#27272a]">
            <h2 className="text-[13px] font-semibold text-[#171717] dark:text-white">
              Répartition par état
            </h2>
            <span className="text-[11px] font-mono text-[#737373] dark:text-[#a1a1aa]">
              {totalRequests} tickets
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                {donutData.length > 0 ? (
                  donutData.map((d: any, idx: number) => {
                    const currentOffset = donutOffset;
                    donutOffset += (d.percentage / 100) * CIRCUMFERENCE;
                    const shades = [
                      'text-[#171717] dark:text-white',
                      'text-[#525252] dark:text-[#d4d4d8]',
                      'text-[#737373] dark:text-[#a1a1aa]',
                      'text-[#a3a3a3] dark:text-[#71717a]',
                      'text-[#d4d4d4] dark:text-[#3f3f46]'
                    ];
                    return (
                      <DonutSlice
                        key={d.name || idx}
                        pct={d.percentage}
                        colorClass={shades[idx % shades.length]}
                        offset={currentOffset}
                      />
                    );
                  })
                ) : (
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="currentColor"
                    className="text-[#171717] dark:text-white"
                    strokeWidth="14"
                  />
                )}
              </svg>
              <div className="absolute text-center leading-tight">
                <span className="text-xl font-bold font-mono text-[#171717] dark:text-white">{totalRequests}</span>
                <span className="block text-[10px] uppercase font-mono text-[#737373] dark:text-[#a1a1aa]">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#f5f5f5] dark:border-[#27272a] text-[12px]">
            <div className="flex items-center justify-between text-[#525252] dark:text-[#d4d4d8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#171717] dark:bg-white" /> Résolues & Délivrées
              </span>
              <span className="font-mono font-semibold text-[#171717] dark:text-white">{resolvedRequestsCount}</span>
            </div>
            <div className="flex items-center justify-between text-[#525252] dark:text-[#d4d4d8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#737373] dark:text-[#a1a1aa]" /> En cours de traitement
              </span>
              <span className="font-mono font-semibold text-[#171717] dark:text-white">{inProgressRequestsCount}</span>
            </div>
            <div className="flex items-center justify-between text-[#525252] dark:text-[#d4d4d8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#52525b]" /> En attente d'assignation
              </span>
              <span className="font-mono font-semibold text-[#171717] dark:text-white">{pendingRequestsCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Data Table & Activity (Vercel Style) ── */}
      <div className="bg-white dark:bg-[#121215] rounded-lg border border-[#e5e5e5] dark:border-[#27272a] overflow-hidden">
        
        <div className="p-4 sm:px-5 border-b border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-[#171717] dark:text-white">
              Dernières requêtes enregistrées
            </h2>
            <p className="text-[11px] text-[#737373] dark:text-[#a1a1aa]">
              Suivi en temps réel des dépôts, assignations et résolutions
            </p>
          </div>

          <Link
            href="/admin/requetes"
            className="text-[12px] font-medium text-[#171717] dark:text-white hover:underline flex items-center gap-1 font-mono"
          >
            Toutes les requêtes ({recentRequests.length})
            <ChevronRight size={13} />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#737373] dark:text-[#a1a1aa]">
            Aucune requête récente trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#fafafa] dark:bg-[#18181b] border-b border-[#e5e5e5] dark:border-[#27272a] text-[11px] font-semibold text-[#737373] dark:text-[#a1a1aa] uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-4">Référence</th>
                  <th className="py-2.5 px-4">Objet de la demande</th>
                  <th className="py-2.5 px-4">Demandeur</th>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4">État</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#27272a]">
                {recentRequests.slice(0, 7).map((req: any) => {
                  const isResolved = req.status?.name === 'Résolue';
                  return (
                    <tr key={req.id} className="hover:bg-[#fafafa] dark:hover:bg-[#18181b]/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[12px] text-[#737373] dark:text-[#a1a1aa]">
                        {req.reference}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          href={`/admin/requetes/${req.id}`}
                          className="font-medium text-[#171717] dark:text-white hover:underline truncate block"
                        >
                          {req.title}
                        </Link>
                        <span className="text-[11px] text-[#737373] dark:text-[#71717a] font-mono">
                          {new Date(req.submitted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#525252] dark:text-[#d4d4d8]">
                        <span className="font-medium text-[#171717] dark:text-white">
                          {req.student?.first_name} {req.student?.last_name}
                        </span>
                        <span className="block text-[11px] font-mono text-[#737373] dark:text-[#71717a]">
                          {req.student?.matricule || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#525252] dark:text-[#d4d4d8] text-[12px]">
                        {req.service?.name || 'Scolarité Centrale'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          isResolved
                            ? 'bg-[#171717] dark:bg-white text-white dark:text-black font-semibold'
                            : 'bg-[#f0f0f0] dark:bg-[#18181b] text-[#171717] dark:text-[#f4f4f5] border border-[#e5e5e5] dark:border-[#27272a]'
                        }`}>
                          {req.status?.name || 'En attente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/requetes/${req.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#e5e5e5] dark:border-[#27272a] text-[11px] font-medium text-[#171717] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#27272a] transition-colors"
                        >
                          <Eye size={12} />
                          Examiner
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}