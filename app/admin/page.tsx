'use client';

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

/* ─── Données mockées ─── */
const STATS = [
  { label: 'Total requêtes', value: '1 248', icon: FileText, color: 'bg-emerald-500', trend: '+12.5%', up: true },
  { label: 'En attente', value: '356', icon: Clock, color: 'bg-blue-500', trend: '+8.2%', up: true },
  { label: 'En cours', value: '472', icon: Clock, color: 'bg-yellow-500', trend: '+15.7%', up: true },
  { label: 'Résolues', value: '389', icon: CheckCircle2, color: 'bg-emerald-600', trend: '+20.3%', up: true },
  { label: 'Rejetées', value: '31', icon: XCircle, color: 'bg-red-500', trend: '-9.1%', up: false },
];

const REQUETES = [
  { id: '#REQ-1248', etudiant: 'NGUENOU Wilfried', categorie: 'Réclamation de note', service: 'Scolarité', statut: 'En cours', statClass: 'bg-yellow-100 text-yellow-700', priorite: 'Haute', prioClass: 'bg-red-100 text-red-700', date: '19 mai 2025' },
  { id: '#REQ-1247', etudiant: 'TCHUENTE Marie', categorie: "Demande d'attestation", service: 'Scolarité', statut: 'En attente', statClass: 'bg-blue-100 text-blue-700', priorite: 'Moyenne', prioClass: 'bg-yellow-100 text-yellow-700', date: '19 mai 2025' },
  { id: '#REQ-1246', etudiant: 'KAMGA Junior', categorie: 'Changement de groupe', service: 'Pédagogie', statut: 'Résolue', statClass: 'bg-emerald-100 text-emerald-700', priorite: 'Basse', prioClass: 'bg-slate-100 text-slate-600', date: '18 mai 2025' },
  { id: '#REQ-1245', etudiant: 'FOUDA Sarah', categorie: 'Problème de paiement', service: 'Finance', statut: 'En cours', statClass: 'bg-yellow-100 text-yellow-700', priorite: 'Haute', prioClass: 'bg-red-100 text-red-700', date: '18 mai 2025' },
  { id: '#REQ-1244', etudiant: 'MBALLA Chris', categorie: 'Demande de transfert', service: 'Scolarité', statut: 'En attente', statClass: 'bg-blue-100 text-blue-700', priorite: 'Moyenne', prioClass: 'bg-yellow-100 text-yellow-700', date: '17 mai 2025' },
];

/* ─── Graphique SVG ─── */
const CHART_POINTS = [
  { x: 0, y: 80 }, { x: 1, y: 120 }, { x: 2, y: 100 }, { x: 3, y: 180 },
  { x: 4, y: 160 }, { x: 5, y: 220 }, { x: 6, y: 200 }, { x: 7, y: 280 },
  { x: 8, y: 260 }, { x: 9, y: 340 }, { x: 10, y: 380 }, { x: 11, y: 312 },
];
const W = 500, H = 160, PAD = 20, MAX_Y = 400;
const cx = (x: number) => PAD + (x / 11) * (W - PAD * 2);
const cy = (y: number) => H - PAD - (y / MAX_Y) * (H - PAD * 2);
const polyline = CHART_POINTS.map(p => `${cx(p.x)},${cy(p.y)}`).join(' ');
const area = `M${cx(0)},${cy(0)} ` + CHART_POINTS.map(p => `L${cx(p.x)},${cy(p.y)}`).join(' ') + ` L${cx(11)},${H - PAD} L${cx(0)},${H - PAD} Z`;

/* ─── Donut chart ─── */
const DONUT = [
  { label: 'En attente', pct: 28.5, count: 356, color: '#3b82f6' },
  { label: 'En cours', pct: 37.8, count: 472, color: '#f59e0b' },
  { label: 'Résolues', pct: 31.2, count: 389, color: '#10b981' },
  { label: 'Rejetées', pct: 2.5, count: 31, color: '#ef4444' },
];

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

export default function AdminDashboard() {
  let donutOffset = 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Tableau de bord 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bienvenue sur le panel d&apos;administration de la gestion des requêtes.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0 shadow-sm">
          <Calendar size={15} className="text-emerald-600" />
          <span className="font-medium">19 mai 2025</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, trend, up }) => (
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
            <h2 className="font-bold text-slate-900">Évolution des requêtes</h2>
            <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white outline-none focus:ring-2 focus:ring-emerald-400">
              <option>Ce mois</option>
              <option>3 mois</option>
              <option>6 mois</option>
            </select>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 100, 200, 300, 400].map(v => (
                <line key={v} x1={PAD} y1={cy(v)} x2={W - PAD} y2={cy(v)} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {[0, 100, 200, 300, 400].map(v => (
                <text key={v} x={PAD - 4} y={cy(v) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
              ))}
              <path d={area} fill="url(#adminChartGrad)" />
              <polyline points={polyline} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {CHART_POINTS.filter((_, i) => i % 3 === 0 || i === 11).map((p, i) => (
                <circle key={i} cx={cx(p.x)} cy={cy(p.y)} r="3.5" fill="#10b981" stroke="white" strokeWidth="2" />
              ))}
              {['01 mai', '05 mai', '10 mai', '15 mai', '19 mai'].map((label, i) => (
                <text key={label} x={cx(i * 2.75)} y={H - 2} textAnchor="middle" fontSize="9" fill="#94a3b8">{label}</text>
              ))}
              {/* Tooltip flottant */}
              <g transform={`translate(${cx(11) - 48},${cy(312) - 36})`}>
                <rect x="0" y="0" width="80" height="28" rx="6" fill="#0f172a" />
                <text x="40" y="11" textAnchor="middle" fontSize="9" fill="#94a3b8">19 mai 2025</text>
                <text x="40" y="23" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="bold">↗ Requêtes : 312</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Donut */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Répartition par statut</h2>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                {DONUT.map((d) => {
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
                <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">1 248</text>
                <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#64748b">Total</text>
              </svg>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {DONUT.map((d) => (
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
            <h2 className="font-bold text-slate-900">Requêtes récentes</h2>
            <button className="text-emerald-600 text-xs font-semibold hover:underline flex items-center gap-1">
              Voir toutes <ChevronRight size={13} />
            </button>
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
                {REQUETES.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-1 text-xs font-mono text-slate-500">{r.id}</td>
                    <td className="py-3 px-1 font-semibold text-slate-800 text-xs">{r.etudiant}</td>
                    <td className="py-3 px-1 text-xs text-slate-600">{r.categorie}</td>
                    <td className="py-3 px-1 text-xs text-slate-500">{r.service}</td>
                    <td className="py-3 px-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${r.statClass}`}>{r.statut}</span>
                    </td>
                    <td className="py-3 px-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${r.prioClass}`}>{r.priorite}</span>
                    </td>
                    <td className="py-3 px-1 text-xs text-slate-400">{r.date}</td>
                    <td className="py-3 px-1">
                      <button className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                        <Eye size={14} />
                      </button>
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
            <p className="text-xs text-slate-500 mb-4">Bonjour Administrateur 👋<br />Voici un résumé intelligent de votre activité.</p>

            {/* Recommandation */}
            <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={12} className="text-violet-600" />
                <p className="text-xs font-bold text-violet-800">Recommandation IA</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Le service Scolarité a un délai de réponse supérieur à la moyenne. Suggestion : réaffecter 2 agents.
              </p>
              <button className="mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                Voir les suggestions
              </button>
            </div>

            {/* Actions rapides IA */}
            <div className="space-y-2">
              {[
                { icon: Zap, label: 'Automatiser les réponses fréquentes', sub: '32 requêtes similaires détectées', color: 'text-yellow-600 bg-yellow-50' },
                { icon: Users, label: 'Rééquilibrer la charge', sub: 'Le service Scolarité est surchargé', color: 'text-blue-600 bg-blue-50' },
              ].map(({ icon: Icon, label, sub, color }) => (
                <button key={label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{label}</p>
                    <p className="text-[10px] text-slate-400">{sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Insights IA */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">Insights IA</h3>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, label: 'Pic de requêtes le lundi', sub: 'Les lundis sont 40% plus chargés en moyenne.', color: 'bg-emerald-50 text-emerald-600' },
                { icon: AlertTriangle, label: 'Catégorie la plus fréquente', sub: 'Réclamation de note (28.6% des requêtes)', color: 'bg-yellow-50 text-yellow-600' },
                { icon: CheckCircle2, label: 'Délai moyen de résolution', sub: '2.4 jours (+0.3 vs mois dernier)', color: 'bg-blue-50 text-blue-600' },
              ].map(({ icon: Icon, label, sub, color }) => (
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
                { icon: Users, label: 'Étudiants inscrits', value: '5 842', color: 'bg-emerald-50 text-emerald-600' },
                { icon: Building2, label: 'Départements actifs', value: '12', color: 'bg-blue-50 text-blue-600' },
                { icon: AlertTriangle, label: 'Requêtes urgentes', value: '18', color: 'bg-red-50 text-red-600' },
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