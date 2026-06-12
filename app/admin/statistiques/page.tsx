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
  { label: 'Volume total', value: '478', change: '+12.4%', isPositive: true, subtext: 'vs période précédente', icon: BarChart2, color: 'text-indigo-600 bg-indigo-50' },
  { label: 'SLA respecté', value: '93.5%', change: '+1.2%', isPositive: true, subtext: 'Objectif : >90%', icon: Zap, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Temps moyen', value: '1.8j', change: '-8.5%', isPositive: true, subtext: 'vs 2.1j le mois dernier', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  { label: 'Satisfaction', value: '4.7/5', change: '+2.1%', isPositive: true, subtext: 'Basé sur 342 retours', icon: Star, color: 'text-amber-500 bg-amber-50' },
];

const REQUETES_BY_STATUS = [
  { label: 'Résolues', count: 310, pct: 65, color: 'bg-emerald-500 text-emerald-700 bg-emerald-50' },
  { label: 'En cours', count: 112, pct: 23, color: 'bg-yellow-500 text-yellow-700 bg-yellow-50' },
  { label: 'En attente', count: 42, pct: 9, color: 'bg-blue-500 text-blue-700 bg-blue-50' },
  { label: 'Rejetées', count: 14, pct: 3, color: 'bg-red-500 text-red-700 bg-red-50' },
];

const REQUETES_BY_DEPARTMENT = [
  { name: 'Scolarité', total: 250, active: 30, pct: 52, color: 'bg-indigo-500' },
  { name: 'Pédagogie', total: 120, active: 22, pct: 25, color: 'bg-emerald-500' },
  { name: 'Finance & Comptabilité', total: 95, active: 10, pct: 20, color: 'bg-amber-500' },
  { name: 'Direction Générale', total: 13, active: 2, pct: 3, color: 'bg-red-400' },
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
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm cursor-pointer"
            >
              {PERIODS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
            <Download size={15} /> Exporter le rapport
          </button>
        </div>
      </div>

      {/* ── Cartes d&apos;indicateurs de performance clés (KPIs) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_CARDS.map(({ label, value, change, isPositive, subtext, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
              <span className={`inline-flex items-center gap-0.5 text-xs font-black px-1.5 py-0.5 rounded-md ${
                isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{subtext}</span>
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

          {/* Rendu graphique vectoriel premium */}
          <div className="relative w-full h-[220px] bg-slate-50/50 rounded-2xl border border-slate-100/50 overflow-hidden flex items-end px-6 pb-8 pt-4">
            
            {/* Grille horizontale de fond */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 py-8 pointer-events-none opacity-40">
              <div className="border-b border-slate-200 w-full" />
              <div className="border-b border-slate-200 w-full" />
              <div className="border-b border-slate-200 w-full" />
            </div>

            {/* Tracé SVG interactif */}
            <svg className="absolute inset-0 w-full h-full p-4 py-8" viewBox="0 0 440 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
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
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Points */}
              {CHART_DATA_TREND.map(pt => (
                <circle
                  key={pt.label}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              ))}
            </svg>

            {/* Labels de l'axe X */}
            <div className="absolute bottom-2 inset-x-0 flex justify-between px-6 text-[10px] text-slate-400 font-bold font-mono">
              {CHART_DATA_TREND.map(pt => (
                <span key={pt.label}>{pt.label}</span>
              ))}
            </div>
            
            {/* Infobulle de survol fictive */}
            <div className="absolute top-8 right-8 bg-slate-900 text-white rounded-xl p-2 px-3 shadow-lg border border-white/10 flex flex-col pointer-events-none select-none z-10">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pic d&apos;Avril</span>
              <span className="text-xs font-black">210 requêtes</span>
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

      {/* Widget IA de suggestion stratégique */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-200" />
              <h3 className="font-bold text-sm">Analyses stratégiques IA</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed mb-3">
              Le service **Scolarité** respecte son SLA à 94%, mais le temps de réponse moyen s&apos;allonge légèrement le mercredi en raison d&apos;un pic récurrent d&apos;affluence. 
              **Recommandation** : Automatiser l&apos;approbation des demandes de *Certificat de Scolarité* via le routage instantané pour désengorger les agents durant ces créneaux.
            </p>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Optimisation de process active</div>
              <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Conseil : Automatisation du certificat</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-2xl p-3 shrink-0">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>
      </div>

    </div>
  );
}

const AVATAR_COLORS = [
  'from-indigo-400 to-indigo-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-amber-400 to-amber-600',
];
