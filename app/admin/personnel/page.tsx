'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserCog, Search, SlidersHorizontal, Download, Eye,
  UserPlus, ArrowUpDown, ChevronLeft, ChevronRight,
  CheckCircle, Clock, RefreshCw, Mail, Phone,
  MoreHorizontal, Shield, Star, Zap, TrendingUp,
  UserCheck, UserX, Building2, Award,
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const PERSONNEL = [
  { id: 'PER-001', nom: 'TAMBA Eric', matricule: 'AGT-2019-041', email: 'e.tamba@iuc.cm', telephone: '+237 691 100 200', role: 'Agent', departement: 'Scolarité', statut: 'Disponible', requetesAssignees: 12, requetesResolues: 9, tauxResolution: 75, tempsReponseMoyen: '1.8j', avatar: 'TE', specialites: ['Attestations', 'Réclamations'], dateEntree: '12 jan. 2019' },
  { id: 'PER-002', nom: 'FOUDA Martine', matricule: 'AGT-2020-015', email: 'm.fouda@iuc.cm', telephone: '+237 677 200 300', role: 'Agent', departement: 'Scolarité', statut: 'Disponible', requetesAssignees: 8, requetesResolues: 8, tauxResolution: 100, tempsReponseMoyen: '1.2j', avatar: 'FM', specialites: ['Inscriptions', 'Transferts'], dateEntree: '03 sept. 2020' },
  { id: 'PER-003', nom: 'NKEMENI Paul', matricule: 'SUP-2018-007', email: 'p.nkemeni@iuc.cm', telephone: '+237 655 300 400', role: 'Superviseur', departement: 'Scolarité', statut: 'Disponible', requetesAssignees: 3, requetesResolues: 3, tauxResolution: 100, tempsReponseMoyen: '2.5j', avatar: 'NP', specialites: ['Supervision', 'Validation'], dateEntree: '15 juin 2018' },
  { id: 'PER-004', nom: 'AYISSI Rachel', matricule: 'AGT-2021-032', email: 'r.ayissi@iuc.cm', telephone: '+237 699 400 500', role: 'Agent', departement: 'Finance', statut: 'En congé', requetesAssignees: 0, requetesResolues: 47, tauxResolution: 92, tempsReponseMoyen: '2.1j', avatar: 'AR', specialites: ['Paiements', 'Bourses'], dateEntree: '28 fév. 2021' },
  { id: 'PER-005', nom: 'MBARGA Jean', matricule: 'AGT-2022-055', email: 'j.mbarga@iuc.cm', telephone: '+237 670 500 600', role: 'Agent', departement: 'Pédagogie', statut: 'Disponible', requetesAssignees: 7, requetesResolues: 5, tauxResolution: 71, tempsReponseMoyen: '3.0j', avatar: 'MJ', specialites: ['Groupes', 'Filières'], dateEntree: '10 jan. 2022' },
  { id: 'PER-006', nom: 'ETOGA Sylvie', matricule: 'SUP-2017-003', email: 's.etoga@iuc.cm', telephone: '+237 655 600 700', role: 'Superviseur', departement: 'Finance', statut: 'Disponible', requetesAssignees: 2, requetesResolues: 61, tauxResolution: 95, tempsReponseMoyen: '1.5j', avatar: 'ES', specialites: ['Supervision', 'Audit'], dateEntree: '01 mars 2017' },
  { id: 'PER-007', nom: 'ONDOA Claude', matricule: 'ADM-2015-001', email: 'c.ondoa@iuc.cm', telephone: '+237 691 700 800', role: 'Administrateur', departement: 'Direction', statut: 'Disponible', requetesAssignees: 0, requetesResolues: 0, tauxResolution: 0, tempsReponseMoyen: '—', avatar: 'OC', specialites: ['Administration', 'Système'], dateEntree: '01 jan. 2015' },
  { id: 'PER-008', nom: 'BELLO Awa', matricule: 'AGT-2023-071', email: 'a.bello@iuc.cm', telephone: '+237 677 800 900', role: 'Agent', departement: 'Pédagogie', statut: 'Occupé', requetesAssignees: 15, requetesResolues: 8, tauxResolution: 53, tempsReponseMoyen: '4.2j', avatar: 'BA', specialites: ['Notes', 'Examens'], dateEntree: '05 sept. 2023' },
  { id: 'PER-009', nom: 'MOUKAM Thierry', matricule: 'AGT-2020-028', email: 't.moukam@iuc.cm', telephone: '+237 694 900 010', role: 'Agent', departement: 'Scolarité', statut: 'Disponible', requetesAssignees: 10, requetesResolues: 9, tauxResolution: 90, tempsReponseMoyen: '1.6j', avatar: 'MT', specialites: ['Attestations', 'Certificats'], dateEntree: '20 oct. 2020' },
];

/* ═══════════════════════ CONFIG ═══════════════════════ */

const ROLES         = ['Tous', 'Agent', 'Superviseur', 'Administrateur'];
const DEPARTEMENTS  = ['Tous', 'Scolarité', 'Finance', 'Pédagogie', 'Direction'];
const STATUTS_AGENT = ['Tous', 'Disponible', 'Occupé', 'En congé'];

const statutStyle: Record<string, string> = {
  'Disponible': 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Occupé':     'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'En congé':   'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
};
const statutDot: Record<string, string> = {
  'Disponible': 'bg-emerald-500',
  'Occupé':     'bg-yellow-500',
  'En congé':   'bg-blue-400',
};
const roleStyle: Record<string, string> = {
  'Agent':          'bg-slate-100 text-slate-700',
  'Superviseur':    'bg-violet-100 text-violet-700',
  'Administrateur': 'bg-amber-100 text-amber-700',
};
const roleIcon: Record<string, React.ReactNode> = {
  'Agent':          <UserCog size={11} />,
  'Superviseur':    <Shield size={11} />,
  'Administrateur': <Star size={11} />,
};

const AVATAR_COLORS = [
  'from-emerald-400 to-green-600',
  'from-blue-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-orange-400 to-red-500',
  'from-teal-400 to-cyan-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-yellow-600',
  'from-indigo-400 to-blue-700',
  'from-emerald-500 to-teal-600',
];

const STATS_TOP = [
  { label: 'Total personnel', value: 9, icon: UserCog, color: 'text-slate-600 bg-slate-100' },
  { label: 'Agents', value: 6, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Superviseurs', value: 2, icon: Shield, color: 'text-violet-600 bg-violet-50' },
  { label: 'Administrateurs', value: 1, icon: Star, color: 'text-amber-600 bg-amber-50' },
  { label: 'Disponibles', value: 7, icon: Zap, color: 'text-blue-600 bg-blue-50' },
];

const PAGE_SIZE = 8;

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminPersonnelPage() {
  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState('Tous');
  const [dep, setDep]           = useState('Tous');
  const [statut, setStatut]     = useState('Tous');
  const [page, setPage]         = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  /* Filtrage */
  let filtered = PERSONNEL.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nom.toLowerCase().includes(q) || p.matricule.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.departement.toLowerCase().includes(q);
    const matchRole   = role === 'Tous' || p.role === role;
    const matchDep    = dep === 'Tous' || p.departement === dep;
    const matchStatut = statut === 'Tous' || p.statut === statut;
    return matchSearch && matchRole && matchDep && matchStatut;
  });

  /* Tri */
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const va = String((a as Record<string, unknown>)[sortCol] ?? '');
      const vb = String((b as Record<string, unknown>)[sortCol] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const resetFilters = () => { setSearch(''); setRole('Tous'); setDep('Tous'); setStatut('Tous'); setPage(1); };
  const hasFilters   = search || role !== 'Tous' || dep !== 'Tous' || statut !== 'Tous';

  /* Barre de performance colorée */
  const perfBar = (pct: number) => {
    const color = pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-yellow-400' : pct >= 50 ? 'bg-orange-400' : 'bg-red-400';
    return (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs font-bold ${pct >= 90 ? 'text-emerald-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
          {pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Gestion du personnel</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Gérez les agents, superviseurs et administrateurs de la plateforme.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm">
            <Download size={15} /> Exporter
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
            <UserPlus size={15} /> Ajouter un agent
          </button>
        </div>
      </div>

      {/* ── Compteurs rapides ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATS_TOP.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Barre de recherche + filtres ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, matricule, email, département..."
              className="w-full h-10 bg-slate-50 rounded-xl pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 border border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all ${showFilters || hasFilters ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            <SlidersHorizontal size={15} /> Filtres
            {hasFilters && <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>
          {/* Toggle vue */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 ml-auto">
            {['table', 'cards'].map(v => (
              <button key={v} onClick={() => setViewMode(v as 'table' | 'cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {v === 'table' ? 'Tableau' : 'Cartes'}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={resetFilters} className="h-10 px-3 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all font-medium">
              Réinitialiser
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
            {[
              { label: 'Rôle', values: ROLES, current: role, set: setRole },
              { label: 'Département', values: DEPARTEMENTS, current: dep, set: setDep },
              { label: 'Disponibilité', values: STATUTS_AGENT, current: statut, set: setStatut },
            ].map(({ label, values, current, set }) => (
              <div key={label} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
                {values.map(v => (
                  <button key={v} onClick={() => { set(v); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${current === v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {v}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ VUE TABLEAU ═══ */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <UserCog size={40} className="mb-3 text-slate-200" />
              <p className="font-semibold text-slate-500">Aucun agent trouvé</p>
              <button onClick={resetFilters} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Réinitialiser</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {[
                        { label: 'Agent', col: 'nom' },
                        { label: 'Rôle', col: 'role' },
                        { label: 'Département', col: 'departement' },
                        { label: 'Disponibilité', col: 'statut' },
                        { label: 'Assignées', col: 'requetesAssignees' },
                        { label: 'Taux résolution', col: 'tauxResolution' },
                        { label: 'Tps moyen', col: 'tempsReponseMoyen' },
                        { label: '', col: null },
                      ].map(({ label, col }) => (
                        <th key={label} onClick={() => col && handleSort(col)}
                          className={`text-left py-3.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide ${col ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}>
                          <div className="flex items-center gap-1">
                            {label}
                            {col && <ArrowUpDown size={11} className={sortCol === col ? 'text-emerald-500' : 'text-slate-300'} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Agent */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-xs font-black flex items-center justify-center shrink-0`}>
                                {p.avatar}
                              </div>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statutDot[p.statut]}`} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{p.nom}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.matricule}</p>
                            </div>
                          </div>
                        </td>
                        {/* Rôle */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${roleStyle[p.role]}`}>
                            {roleIcon[p.role]} {p.role}
                          </span>
                        </td>
                        {/* Département */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{p.departement}</span>
                        </td>
                        {/* Statut */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-lg ${statutStyle[p.statut]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statutDot[p.statut]}`} />
                            {p.statut}
                          </span>
                        </td>
                        {/* Requêtes assignées */}
                        <td className="py-3.5 px-4">
                          <span className={`text-sm font-black ${p.requetesAssignees > 10 ? 'text-red-600' : p.requetesAssignees > 5 ? 'text-yellow-600' : 'text-slate-800'}`}>
                            {p.requetesAssignees}
                          </span>
                        </td>
                        {/* Taux résolution */}
                        <td className="py-3.5 px-4">
                          {p.role !== 'Administrateur' ? perfBar(p.tauxResolution) : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        {/* Temps moyen */}
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-600">{p.tempsReponseMoyen}</td>
                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/personnel/${p.id}`}
                              className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors" title="Voir le profil">
                              <Eye size={14} />
                            </Link>
                            <a href={`mailto:${p.email}`}
                              className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="Email">
                              <Mail size={14} />
                            </a>
                            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Affichage <span className="font-bold text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> sur <span className="font-bold text-slate-700">{filtered.length}</span> membres
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${page === n ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ VUE CARTES ═══ */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <UserCog size={40} className="mb-3 text-slate-200" />
              <p className="font-semibold text-slate-500">Aucun agent trouvé</p>
              <button onClick={resetFilters} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Réinitialiser</button>
            </div>
          ) : paginated.map((p, idx) => (
            <Link key={p.id} href={`/admin/personnel/${p.id}`}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 group">
              {/* Avatar + statut */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white font-black text-sm flex items-center justify-center`}>
                    {p.avatar}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statutDot[p.statut]}`} />
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${roleStyle[p.role]}`}>
                  {roleIcon[p.role]} {p.role}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{p.nom}</p>
              <p className="text-[10px] text-slate-400 font-mono mb-1">{p.matricule}</p>
              <p className="text-xs text-slate-500 mb-3">{p.departement}</p>
              {/* Spécialités */}
              <div className="flex flex-wrap gap-1 mb-3">
                {p.specialites.map(s => (
                  <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">{s}</span>
                ))}
              </div>
              {/* Stats */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-slate-400">Taux résolution</span>
                  <span className={`text-xs font-black ${p.tauxResolution >= 90 ? 'text-emerald-600' : p.tauxResolution >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {p.role !== 'Administrateur' ? `${p.tauxResolution}%` : '—'}
                  </span>
                </div>
                {p.role !== 'Administrateur' && (
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.tauxResolution >= 90 ? 'bg-emerald-500' : p.tauxResolution >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${p.tauxResolution}%` }} />
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900">{p.requetesAssignees}</p>
                    <p className="text-[10px] text-slate-400">Assignées</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-emerald-600">{p.requetesResolues}</p>
                    <p className="text-[10px] text-slate-400">Résolues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-blue-600">{p.tempsReponseMoyen}</p>
                    <p className="text-[10px] text-slate-400">Tps moyen</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
