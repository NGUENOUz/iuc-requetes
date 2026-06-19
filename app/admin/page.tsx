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
function DonutSlice({ pct, color, offset }: { pct: number; color: string; offset: number }) {
  const dash = (pct / 100) * CIRCUMFERENCE;
  return (
    <circle
      cx="60" cy="60" r="52"
      fill="none"
      stroke={color}
      strokeWidth="16"
      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
      strokeDashoffset={-offset}
      strokeLinecap="butt"
      transform="rotate(-90 60 60)"
    />
  );
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Soumise':
    case 'En attente':
      return 'bg-blue-100 text-blue-700';
    case 'Assignée':
    case 'En cours':
    case 'En attente d\'information':
      return 'bg-yellow-100 text-yellow-700';
    case 'Résolue':
      return 'bg-emerald-100 text-emerald-700';
    case 'Rejetée':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'Critique':
    case 'Haute':
      return 'bg-red-100 text-red-700';
    case 'Normale':
      return 'bg-yellow-100 text-yellow-700';
    case 'Basse':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

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
  
  // Utiliser les stats agent si c'est un agent, sinon stats admin
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

  // Loading Skeleton
  if (currentStatsLoading || requestsLoading || chartLoading || donutLoading || suggestionsLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
            <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-xl"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
              <div className="w-11 h-11 bg-slate-200 rounded-xl"></div>
              <div className="h-7 w-20 bg-slate-200 rounded-lg"></div>
              <div className="h-3 w-16 bg-slate-100 rounded-lg"></div>
              <div className="h-3 w-24 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Charts & Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 h-64 flex flex-col justify-between">
            <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
            <div className="h-40 w-full bg-slate-100 rounded-lg"></div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 h-64 flex flex-col justify-between">
            <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
            <div className="flex items-center gap-4 mt-6">
              <div className="w-28 h-28 bg-slate-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-slate-100 rounded-lg"></div>
                <div className="h-4 w-5/6 bg-slate-100 rounded-lg"></div>
                <div className="h-4 w-4/5 bg-slate-100 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculer les compteurs à partir de by_status pour être cohérent avec l'UI
  const getStatusCount = (names: string[]) => {
    if (!currentStats?.by_status) return 0;
    return names.reduce((sum, name) => sum + (currentStats.by_status[name]?.count ?? 0), 0);
  };

  const totalRequests = currentStats?.overview?.total_requests ?? currentStats?.overview?.total_assigned ?? 0;
  const pendingRequestsCount = getStatusCount(['En attente', 'Soumise', 'Assignée', 'En attente d\'information']);
  const inProgressRequestsCount = getStatusCount(['En cours']);
  const resolvedRequestsCount = getStatusCount(['Résolue']);
  const rejectedRequestsCount = getStatusCount(['Rejetée']);

  const STATS_CARDS = [
    { 
      label: isAgent ? 'Requêtes assignées' : 'Total requêtes', 
      value: totalRequests, 
      icon: FileText, 
      color: 'bg-emerald-500', 
      trend: '+12.5%', 
      up: true 
    },
    { label: 'En attente', value: pendingRequestsCount, icon: Clock, color: 'bg-blue-500', trend: '+8.2%', up: true },
    { label: 'En cours', value: inProgressRequestsCount, icon: Clock, color: 'bg-yellow-500', trend: '+15.7%', up: true },
    { label: 'Résolues', value: resolvedRequestsCount, icon: CheckCircle2, color: 'bg-emerald-600', trend: '+20.3%', up: true },
    { label: 'Rejetées', value: rejectedRequestsCount, icon: XCircle, color: 'bg-red-500', trend: '-9.1%', up: false },
  ];

  // Calcul des coordonnées du graphique
  const N = chartPoints.length > 1 ? chartPoints.length - 1 : 11;
  const maxY = chartPoints.length > 0 ? Math.max(...chartPoints.map(p => p.y), 10) : 10;
  
  const cx = (x: number) => PAD + (x / N) * (W - PAD * 2);
  const cy = (y: number) => H - PAD - (y / maxY) * (H - PAD * 2);
  
  const polyline = chartPoints.map(p => `${cx(p.x)},${cy(p.y)}`).join(' ');
  const area = chartPoints.length > 0
    ? `M${cx(0)},${H - PAD} ` + chartPoints.map(p => `L${cx(p.x)},${cy(p.y)}`).join(' ') + ` L${cx(N)},${H - PAD} Z`
    : '';

  // Suggestion IA active
  const activeSuggestion = suggestions.find(s => s.status === 'pending') || suggestions[0];

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {isAgent ? `Bonjour ${user?.first_name}` : 'Tableau de bord'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAgent 
              ? 'Voici un aperçu de vos requêtes et de votre activité.' 
              : 'Bienvenue sur le panel d\'administration de la gestion des requêtes.'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0 shadow-sm">
          <Calendar size={15} className="text-emerald-600" />
          <span className="font-medium">
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS_CARDS.map(({ label, value, icon: Icon, color, trend, up }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`${color} w-11 h-11 rounded-xl text-white flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
            <p className={`text-[11px] font-bold mt-1.5 ${up ? 'text-emerald-500' : 'text-red-400'}`}>
              {up ? '↗' : '↘'} {trend} vs mois dernier
            </p>
          </div>
        ))}
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Évolution */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">
              {isAgent ? 'Évolution de mes requêtes' : 'Évolution des requêtes'}
            </h2>
            <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white outline-none focus:ring-2 focus:ring-emerald-400">
              <option>12 derniers jours</option>
            </select>
          </div>

          <div className="w-full overflow-hidden">
            {chartPoints.length > 0 ? (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[0, Math.round(maxY / 4), Math.round(maxY / 2), Math.round((3 * maxY) / 4), maxY].map(v => (
                  <line key={v} x1={PAD} y1={cy(v)} x2={W - PAD} y2={cy(v)} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {[0, Math.round(maxY / 4), Math.round(maxY / 2), Math.round((3 * maxY) / 4), maxY].map(v => (
                  <text key={v} x={PAD - 4} y={cy(v) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
                ))}
                <path d={area} fill="url(#adminChartGrad)" />
                <polyline points={polyline} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {chartPoints.filter((_, i) => i % 3 === 0 || i === N).map((p, i) => (
                  <circle key={i} cx={cx(p.x)} cy={cy(p.y)} r="3.5" fill="#10b981" stroke="white" strokeWidth="2" />
                ))}
                {chartPoints.filter((_, i) => i % 3 === 0 || i === N).map((p) => (
                  <text key={p.x} x={cx(p.x)} y={H - 2} textAnchor="middle" fontSize="9" fill="#94a3b8">{p.label}</text>
                ))}
              </svg>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                Pas assez de données pour le graphique
              </div>
            )}
          </div>
        </div>

        {/* Donut */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Répartition par statut</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                {donutData.map((d) => {
                  const slice = (
                    <DonutSlice
                      key={d.label}
                      pct={d.pct}
                      color={d.color}
                      offset={(donutOffset / 100) * CIRCUMFERENCE}
                    />
                  );
                  donutOffset += d.pct;
                  return slice;
                })}
                <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">{donutTotal}</text>
                <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#64748b">Total</text>
              </svg>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {donutData.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-slate-600 truncate">{d.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 shrink-0">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tableau + IA ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Tableau des requêtes récentes */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">
              {isAgent ? 'Mes requêtes récentes' : 'Requêtes récentes'}
            </h2>
            <Link href="/admin/requetes" className="text-emerald-600 text-xs font-semibold hover:underline flex items-center gap-1">
              Voir toutes <ChevronRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['ID', 'Étudiant', 'Catégorie', 'Service', 'Statut', 'Priorité', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left pb-3 px-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRequests.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-1 text-xs font-mono text-slate-500">{r.reference}</td>
                    <td className="py-3 px-1 font-semibold text-slate-800 text-xs">
                      {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Inconnu'}
                    </td>
                    <td className="py-3 px-1 text-xs text-slate-600">{r.category?.name || 'Général'}</td>
                    <td className="py-3 px-1 text-xs text-slate-500">{r.service?.name || 'Non assigné'}</td>
                    <td className="py-3 px-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${getStatusClass(r.status?.name)}`}>
                        {r.status?.name}
                      </span>
                    </td>
                    <td className="py-3 px-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${getPriorityClass(r.priority?.name)}`}>
                        {r.priority?.name || 'Moyenne'}
                      </span>
                    </td>
                    <td className="py-3 px-1 text-xs text-slate-400">
                      {new Date(r.submitted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-1">
                      <Link href={`/admin/requetes/${r.id}`} className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assistant IA */}
        <div className="space-y-4">

          {/* Widget IA */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-violet-600" />
                <h3 className="font-bold text-slate-900">Assistant IA</h3>
              </div>
              <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Bêta
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Bonjour {isAdmin ? 'Administrateur' : user?.first_name} <br />
              Voici un résumé intelligent de votre activité.
            </p>

            {/* Recommandation */}
            {activeSuggestion ? (
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 mb-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={12} className="text-violet-600" />
                  <p className="text-xs font-bold text-violet-800">{activeSuggestion.title}</p>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeSuggestion.description}
                </p>
                <Link href="/admin/suggestions-ia" className="block text-center mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                  Voir les suggestions
                </Link>
              </div>
            ) : (
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 mb-3 text-center">
                <p className="text-[11px] text-slate-500">Pas de suggestion active.</p>
                <Link href="/admin/suggestions-ia" className="block text-center mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                  Générer des suggestions
                </Link>
              </div>
            )}

            {/* Actions rapides IA */}
            <div className="space-y-2">
              {[
                { icon: Zap, label: 'Automatiser les réponses fréquentes', sub: 'Templates auto-réponse disponibles', color: 'text-yellow-600 bg-yellow-50', link: '/admin/suggestions-ia' },
                { icon: Users, label: 'Rééquilibrer la charge de travail', sub: 'Analyser la répartition des tâches', color: 'text-blue-600 bg-blue-50', link: '/admin/assistant-ia' },
              ].map(({ icon: Icon, label, sub, color, link }) => (
                <Link href={link} key={label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{label}</p>
                    <p className="text-[10px] text-slate-400">{sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Insights IA */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">Insights {isAgent ? 'personnels' : 'IA'}</h3>
            <div className="space-y-3">
              {[
                { 
                  icon: TrendingUp, 
                  label: 'Délai moyen de résolution', 
                  sub: `${currentStats?.overview?.avg_resolution_time_hours ?? 0} heures`, 
                  color: 'bg-emerald-50 text-emerald-600' 
                },
                isAgent ? {
                  icon: CheckCircle2,
                  label: 'Taux de résolution',
                  sub: `${currentStats?.overview?.resolution_rate ?? 0}% de vos requêtes résolues`,
                  color: 'bg-blue-50 text-blue-600'
                } : { 
                  icon: AlertTriangle, 
                  label: 'Dépassements SLA', 
                  sub: `${currentStats?.overview?.sla_breaches ?? 0} requêtes en dépassement`, 
                  color: 'bg-yellow-50 text-yellow-600' 
                },
                !isAgent && { 
                  icon: CheckCircle2, 
                  label: 'Satisfaction moyenne', 
                  sub: `${currentStats?.overview?.avg_satisfaction_rating ?? 0}/5 sur les évaluations`, 
                  color: 'bg-blue-50 text-blue-600' 
                },
              ].filter(Boolean).map(({ icon: Icon, label, sub, color }: any) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">Chiffres clés</h3>
            <div className="space-y-2">
              {[
                { icon: Users, label: 'Requêtes résolues', value: resolvedRequestsCount, color: 'bg-emerald-50 text-emerald-600' },
                { icon: Building2, label: 'Requêtes en cours', value: inProgressRequestsCount, color: 'bg-blue-50 text-blue-600' },
                { icon: AlertTriangle, label: 'Requêtes en attente', value: pendingRequestsCount, color: 'bg-red-50 text-red-600' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon size={13} />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{label}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}