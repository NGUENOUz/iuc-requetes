'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart2, TrendingUp, Users, Clock, ShieldAlert,
  Sparkles, Filter, Download, ArrowUpRight, ArrowDownRight,
  Calendar, Building2, Tag, Star, ChevronRight, Zap,
  CheckCircle, XCircle, RefreshCw, AlertCircle
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const PERIODS = ['7 derniers jours', 'Ce mois', 'Dernier trimestre', 'Cette année'];

const OVERVIEW_CARDS = [
  { label: 'Volume total', value: '478', change: '+12.4%', isPositive: true, subtext: 'Flux enregistré', icon: BarChart2 },
  { label: 'SLA respecté', value: '93.5%', change: '+1.2%', isPositive: true, subtext: 'Objectif : >90%', icon: Zap },
  { label: 'Délai moyen', value: '1.8j', change: '-8.5%', isPositive: true, subtext: 'Prise en charge', icon: Clock },
  { label: 'Satisfaction usagers', value: '4.7/5', change: '+2.1%', isPositive: true, subtext: '342 avis vérifiés', icon: Star },
];

const REQUETES_BY_STATUS = [
  { label: 'Résolues', count: 310, pct: 65, color: 'bg-[#171717]' },
  { label: 'En cours', count: 112, pct: 23, color: 'bg-[#525252]' },
  { label: 'En attente', count: 42, pct: 9, color: 'bg-[#a3a3a3]' },
  { label: 'Rejetées', count: 14, pct: 3, color: 'bg-[#d4d4d4]' },
];

const REQUETES_BY_DEPARTMENT = [
  { name: 'Scolarité', total: 250, active: 30, pct: 52, color: 'bg-[#171717]' },
  { name: 'Pédagogie', total: 120, active: 22, pct: 25, color: 'bg-[#525252]' },
  { name: 'Finance & Comptabilité', total: 95, active: 10, pct: 20, color: 'bg-[#737373]' },
  { name: 'Direction Générale', total: 13, active: 2, pct: 3, color: 'bg-[#a3a3a3]' },
];

const REQUETES_BY_CATEGORY = [
  { name: 'Réclamation de note', count: 184, trend: '+15%', isUp: true },
  { name: 'Attestation de scolarité', count: 142, trend: '+5%', isUp: true },
  { name: 'Correction de relevé de notes', count: 65, trend: '-2%', isUp: false },
  { name: 'Changement de groupe de TD', count: 47, trend: '+12%', isUp: true },
  { name: 'Demande de transfert', count: 25, trend: '0%', isUp: null },
  { name: 'Problème de paiement', count: 15, trend: '-8%', isUp: false },
];

const AGENT_LEADERBOARD = [
  { nom: 'FOUDA Martine', service: 'Scolarité', resolues: 120, sla: 100, temps: '1.2j', avatar: 'FM', satisfaction: 4.9 },
  { nom: 'TAMBA Eric', service: 'Scolarité', resolues: 184, sla: 92, temps: '1.8j', avatar: 'TE', satisfaction: 4.8 },
  { nom: 'AYISSI Rachel', service: 'Finance', resolues: 47, sla: 92, temps: '2.1j', avatar: 'AR', satisfaction: 4.7 },
  { nom: 'MBARGA Jean', service: 'Pédagogie', resolues: 58, sla: 91, temps: '3.0j', avatar: 'MJ', satisfaction: 4.6 },
];

/* Graphique linéaire SVG Simulé (Tendance des requêtes sur 6 mois) */
const CHART_DATA_TREND = [
  { label: 'Déc', value: 80, x: 20, y: 150 },
  { label: 'Jan', value: 120, x: 100, y: 110 },
  { label: 'Fév', value: 95, x: 180, y: 135 },
  { label: 'Mar', value: 160, x: 260, y: 70 },
  { label: 'Avr', value: 210, x: 340, y: 30 },
  { label: 'Mai', value: 185, x: 420, y: 55 },
];

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminStatistiquesPage() {
  const [period, setPeriod] = useState('Ce mois');
  const [activeSegment, setActiveSegment] = useState<'volume' | 'sla' | 'temps'>('volume');

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analyses & Statistiques</h1>
          <p className="text-slate-500 text-sm mt-0.5">Mesurez l&apos;efficacité du support et la satisfaction globale des étudiants.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sélecteur de période */}
          <div className="relative">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="bg-white border border-[#e5e5e5] text-[#171717] text-xs font-medium px-3 py-2 rounded-md outline-none focus:border-[#171717] cursor-pointer"
            >
              {PERIODS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors">
            <Download size={13} /> Exporter
          </button>
        </div>
      </div>

      {/* ── Cartes d'indicateurs de performance clés (KPIs) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_CARDS.map(({ label, value, change, isPositive, subtext, icon: Icon }) => (
          <div key={label} className="bg-white rounded-md border border-[#e5e5e5] p-4 hover:border-[#171717]/40 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-[#737373] font-medium">{label}</p>
                <h3 className="text-2xl font-semibold text-[#171717] tracking-tight mt-1">{value}</h3>
              </div>
              <div className="w-7 h-7 rounded border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center shrink-0 text-[#171717]">
                <Icon size={14} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#f0f0f0]">
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.2 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {change}
              </span>
              <span className="text-[11px] text-[#737373]">{subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Graphiques principaux ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Graphique de Tendance (2/3 de large) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-950 text-sm">Évolution temporelle</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Nombre de requêtes traitées par mois.</p>
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {[
                { key: 'volume', label: 'Volume total' },
                { key: 'sla', label: 'Taux SLA' },
                { key: 'temps', label: 'Temps moyen' }
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setActiveSegment(opt.key as typeof activeSegment)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    activeSegment === opt.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rendu graphique vectoriel premium monochrome Vercel */}
          <div className="relative w-full h-[220px] bg-[#fafafa] dark:bg-[#121215] rounded-xl border border-[#e5e5e5] dark:border-[#27272a] overflow-hidden flex items-end px-6 pb-8 pt-4">
            
            {/* Grille horizontale de fond */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 py-8 pointer-events-none opacity-40">
              <div className="border-b border-[#e5e5e5] dark:border-[#27272a] w-full" />
              <div className="border-b border-[#e5e5e5] dark:border-[#27272a] w-full" />
              <div className="border-b border-[#e5e5e5] dark:border-[#27272a] w-full" />
            </div>

            {/* Tracé SVG interactif */}
            <svg className="absolute inset-0 w-full h-full p-4 py-8" viewBox="0 0 440 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#171717" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#171717" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Aire sous la courbe */}
              <path
                d="M 20 150 L 100 110 L 180 135 L 260 70 L 340 30 L 420 55 L 420 150 L 20 150 Z"
                fill="url(#chart-grad)"
              />
              {/* Ligne principale */}
              <path
                d="M 20 150 L 100 110 L 180 135 L 260 70 L 340 30 L 420 55"
                fill="none"
                stroke="#171717"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Points */}
              {CHART_DATA_TREND.map(pt => (
                <circle
                  key={pt.label}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#171717"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Labels de l'axe X */}
            <div className="absolute bottom-2 inset-x-0 flex justify-between px-6 text-[10px] text-[#737373] font-medium font-mono">
              {CHART_DATA_TREND.map(pt => (
                <span key={pt.label}>{pt.label}</span>
              ))}
            </div>
            
            {/* Infobulle de survol fictive */}
            <div className="absolute top-8 right-8 bg-[#171717] text-white rounded-md p-2 px-3 shadow-md border border-[#262626] flex flex-col pointer-events-none select-none z-10">
              <span className="text-[9px] text-[#a3a3a3] font-medium uppercase tracking-wider">Pic de volume</span>
              <span className="text-xs font-semibold font-mono">210 requêtes</span>
            </div>
          </div>
        </div>

        {/* Répartition par Statut (1/3 de large) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-950 text-sm">Répartition par statut</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">État actuel de traitement des requêtes.</p>
          </div>

          <div className="space-y-3 pt-2">
            {REQUETES_BY_STATUS.map(s => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{s.label}</span>
                  <span className="text-slate-400 font-medium">{s.count} ({s.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color.split(' ')[0]}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Encadré d'alerte SLA */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-4 flex gap-2.5 items-start">
            <ShieldAlert size={15} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-950">Dépassements SLA en hausse</p>
              <p className="text-[10px] text-red-700 mt-0.5 leading-relaxed">
                4 dossiers Scolarité approchent du délai critique de 48 heures. Pensez à réassigner d&apos;urgence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section répartition par Départements & Leaderboard des agents ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Performance par Services */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-sm">Volume par Services</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Répartition des requêtes reçues par département.</p>
            </div>
            <Building2 size={16} className="text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {REQUETES_BY_DEPARTMENT.map(d => (
              <div key={d.name} className="flex items-start gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 truncate">{d.name}</span>
                    <span className="text-slate-400 font-mono">{d.total} totaux · {d.active} actifs</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
                <span className="text-xs bg-slate-100 font-bold px-2 py-0.5 rounded-md min-w-[36px] text-center">
                  {d.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories de requêtes les plus fréquentes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-sm">Top Catégories de Requêtes</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Types de réclamations récurrents.</p>
            </div>
            <Tag size={16} className="text-slate-400" />
          </div>

          <div className="divide-y divide-slate-50">
            {REQUETES_BY_CATEGORY.map((c, i) => (
              <div key={c.name} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 font-black flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-700 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-slate-900">{c.count} dossiers</span>
                  {c.isUp !== null && (
                    <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      c.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {c.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Leaderboard du Personnel ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-950 text-sm">Performance des Agents</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Temps moyen de réponse, satisfaction et respect du SLA par membre du personnel.</p>
          </div>
          <Users size={16} className="text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Agent', 'Département', 'Requêtes résolues', 'Respect SLA', 'Temps de réponse', 'Satisfaction client', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {AGENT_LEADERBOARD.map((a, idx) => (
                <tr key={a.nom} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
                        {a.avatar}
                      </div>
                      <span className="font-bold text-slate-800 text-xs">{a.nom}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg font-semibold">
                      {a.service}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-black text-slate-800">{a.resolues} résolues</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
                      a.sla >= 95 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.sla}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 font-semibold">{a.temps}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>{a.satisfaction} / 5</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/admin/personnel`}
                      className="inline-flex w-7 h-7 rounded-lg hover:bg-slate-100 items-center justify-center text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Widget IA de suggestion stratégique (Style Vercel Dark Card) */}
      <div className="bg-[#171717] dark:bg-[#121215] border border-[#262626] dark:border-[#27272a] rounded-xl p-5 text-white shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-white" />
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">Recommandation Stratégique IA</h3>
            </div>
            <p className="text-xs text-[#a3a3a3] leading-relaxed mb-3">
              Le service <strong className="text-white font-medium">Scolarité</strong> maintient un SLA de 94%, avec une légère hausse des délais constatée en milieu de semaine suite aux délibérations académiques. 
              <br />
              <span className="text-[#d4d4d4] font-medium">Action suggérée :</span> L&apos;activation de la certification numérique instantanée pour les attestations d&apos;inscription absorbera 40% des flux récurrents.
            </p>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-[#262626] border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono text-[#d4d4d4]">Routage automatisé actif</div>
              <div className="bg-[#262626] border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono text-[#d4d4d4]">Gain estimé : -1.2j de délai</div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#262626] border border-white/10 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-white" />
          </div>
        </div>
      </div>

    </div>
  );
}

const AVATAR_COLORS = [
  'from-neutral-700 to-neutral-900',
  'from-zinc-600 to-zinc-800',
  'from-slate-700 to-slate-900',
  'from-neutral-800 to-black',
];
