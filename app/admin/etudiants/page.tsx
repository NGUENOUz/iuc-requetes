'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Search, SlidersHorizontal, Download, Eye,
  UserPlus, ArrowUpDown, ChevronLeft, ChevronRight,
  CheckCircle, Clock, XCircle, RefreshCw, TrendingUp,
  GraduationCap, BookOpen, MoreHorizontal, Mail, Phone,
  Filter, UserCheck, UserX, Star,
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const ETUDIANTS = [
  { id: 'ETU-001', nom: 'NGUENOU Wilfried', matricule: 'IUC2021001', email: 'w.nguenou@iuc.cm', telephone: '+237 691 234 567', filiere: 'Génie Logiciel', departement: 'Informatique', niveau: 'L3', annee: '2021', statut: 'Actif', requetes: 5, resolues: 3, enCours: 2, derniereActivite: '19 mai 2025', avatar: 'NW' },
  { id: 'ETU-002', nom: 'TCHUENTE Marie', matricule: 'IUC2022045', email: 'm.tchuente@iuc.cm', telephone: '+237 677 890 123', filiere: 'Comptabilité', departement: 'Gestion', niveau: 'L2', annee: '2022', statut: 'Actif', requetes: 3, resolues: 2, enCours: 1, derniereActivite: '19 mai 2025', avatar: 'TM' },
  { id: 'ETU-003', nom: 'KAMGA Junior', matricule: 'IUC2020112', email: 'j.kamga@iuc.cm', telephone: '+237 655 321 987', filiere: 'Génie Civil', departement: 'Ingénierie', niveau: 'M1', annee: '2020', statut: 'Actif', requetes: 7, resolues: 6, enCours: 1, derniereActivite: '18 mai 2025', avatar: 'KJ' },
  { id: 'ETU-004', nom: 'FOUDA Sarah', matricule: 'IUC2023008', email: 's.fouda@iuc.cm', telephone: '+237 699 456 789', filiere: 'Marketing', departement: 'Gestion', niveau: 'L1', annee: '2023', statut: 'Actif', requetes: 2, resolues: 0, enCours: 2, derniereActivite: '18 mai 2025', avatar: 'FS' },
  { id: 'ETU-005', nom: 'MBALLA Chris', matricule: 'IUC2021089', email: 'c.mballa@iuc.cm', telephone: '+237 680 111 222', filiere: 'Droit des affaires', departement: 'Droit', niveau: 'L3', annee: '2021', statut: 'Actif', requetes: 4, resolues: 2, enCours: 2, derniereActivite: '17 mai 2025', avatar: 'MC' },
  { id: 'ETU-006', nom: 'BIYA Estelle', matricule: 'IUC2022133', email: 'e.biya@iuc.cm', telephone: '+237 676 543 210', filiere: 'Finance', departement: 'Gestion', niveau: 'L2', annee: '2022', statut: 'Suspendu', requetes: 6, resolues: 3, enCours: 0, derniereActivite: '17 mai 2025', avatar: 'BE' },
  { id: 'ETU-007', nom: 'NJOYA Patrick', matricule: 'IUC2020056', email: 'p.njoya@iuc.cm', telephone: '+237 694 777 888', filiere: 'Génie Logiciel', departement: 'Informatique', niveau: 'M2', annee: '2020', statut: 'Diplômé', requetes: 12, resolues: 11, enCours: 0, derniereActivite: '16 mai 2025', avatar: 'NP' },
  { id: 'ETU-008', nom: 'ONANA Cécile', matricule: 'IUC2023201', email: 'c.onana@iuc.cm', telephone: '+237 655 999 000', filiere: 'Médecine', departement: 'Santé', niveau: 'L1', annee: '2023', statut: 'Actif', requetes: 1, resolues: 0, enCours: 1, derniereActivite: '16 mai 2025', avatar: 'OC' },
  { id: 'ETU-009', nom: 'ABEGA Denis', matricule: 'IUC2021177', email: 'd.abega@iuc.cm', telephone: '+237 677 234 567', filiere: 'Architecture', departement: 'Ingénierie', niveau: 'L3', annee: '2021', statut: 'Actif', requetes: 3, resolues: 1, enCours: 2, derniereActivite: '15 mai 2025', avatar: 'AD' },
  { id: 'ETU-010', nom: 'NKENG Aline', matricule: 'IUC2022067', email: 'a.nkeng@iuc.cm', telephone: '+237 680 345 678', filiere: 'Comptabilité', departement: 'Gestion', niveau: 'L2', annee: '2022', statut: 'Actif', requetes: 4, resolues: 3, enCours: 1, derniereActivite: '15 mai 2025', avatar: 'NA' },
  { id: 'ETU-011', nom: 'MENYE Paul', matricule: 'IUC2020234', email: 'p.menye@iuc.cm', telephone: '+237 699 876 543', filiere: 'Informatique de Gestion', departement: 'Informatique', niveau: 'M1', annee: '2020', statut: 'Actif', requetes: 8, resolues: 7, enCours: 0, derniereActivite: '14 mai 2025', avatar: 'MP' },
  { id: 'ETU-012', nom: 'ETOA Lucie', matricule: 'IUC2023156', email: 'l.etoa@iuc.cm', telephone: '+237 655 432 109', filiere: 'Ressources Humaines', departement: 'Gestion', niveau: 'L1', annee: '2023', statut: 'Actif', requetes: 2, resolues: 2, enCours: 0, derniereActivite: '13 mai 2025', avatar: 'EL' },
];

/* ═══════════════════════ CONFIG ═══════════════════════ */

const STATUTS    = ['Tous', 'Actif', 'Suspendu', 'Diplômé'];
const NIVEAUX    = ['Tous', 'L1', 'L2', 'L3', 'M1', 'M2'];
const DEPARTEMENTS = ['Tous', 'Informatique', 'Gestion', 'Ingénierie', 'Droit', 'Santé'];

const statutStyle: Record<string, string> = {
  'Actif':    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Suspendu': 'bg-red-100 text-red-700 ring-1 ring-red-200',
  'Diplômé':  'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
};
const statutIcon: Record<string, React.ReactNode> = {
  'Actif':    <UserCheck size={11} />,
  'Suspendu': <UserX size={11} />,
  'Diplômé':  <Star size={11} />,
};

const AVATAR_COLORS = [
  'from-emerald-400 to-green-600',
  'from-blue-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-orange-400 to-red-500',
  'from-pink-400 to-rose-600',
  'from-yellow-400 to-amber-600',
];

const PAGE_SIZE = 8;

const STATS_TOP = [
  { label: 'Total étudiants', value: 5842, icon: Users, color: 'text-slate-600 bg-slate-100' },
  { label: 'Actifs', value: 5610, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Suspendus', value: 48, icon: UserX, color: 'text-red-600 bg-red-50' },
  { label: 'Diplômés', value: 184, icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
  { label: 'Nouvelles inscriptions', value: 312, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
];

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminEtudiantsPage() {
  const [search, setSearch]       = useState('');
  const [statut, setStatut]       = useState('Tous');
  const [niveau, setNiveau]       = useState('Tous');
  const [departement, setDep]     = useState('Tous');
  const [page, setPage]           = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol]     = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode]   = useState<'table' | 'cards'>('table');

  /* Filtrage */
  let filtered = ETUDIANTS.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.nom.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.filiere.toLowerCase().includes(q);
    const matchStatut = statut === 'Tous' || e.statut === statut;
    const matchNiveau = niveau === 'Tous' || e.niveau === niveau;
    const matchDep    = departement === 'Tous' || e.departement === departement;
    return matchSearch && matchStatut && matchNiveau && matchDep;
  });

  /* Tri */
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const va = (a as Record<string, string | number>)[sortCol]?.toString() ?? '';
      const vb = (b as Record<string, string | number>)[sortCol]?.toString() ?? '';
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

  const resetFilters = () => { setSearch(''); setStatut('Tous'); setNiveau('Tous'); setDep('Tous'); setPage(1); };
  const hasFilters   = search || statut !== 'Tous' || niveau !== 'Tous' || departement !== 'Tous';

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Gestion des étudiants</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Consultez et gérez tous les étudiants inscrits à l&apos;IUC.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm">
            <Download size={15} /> Exporter
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
            <UserPlus size={15} /> Ajouter un étudiant
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
            <p className="text-xl font-black text-slate-900">{value.toLocaleString()}</p>
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
              placeholder="Rechercher par nom, matricule, email, filière..."
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

          {/* Mode vue */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 ml-auto">
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Tableau
            </button>
            <button onClick={() => setViewMode('cards')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Cartes
            </button>
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="h-10 px-3 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all font-medium border border-transparent">
              Réinitialiser
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
            {/* Statut */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</span>
              {STATUTS.map(s => (
                <button key={s} onClick={() => { setStatut(s); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${statut === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{s}</button>
              ))}
            </div>
            <div className="w-px bg-slate-200 self-stretch hidden sm:block" />
            {/* Niveau */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Niveau</span>
              {NIVEAUX.map(n => (
                <button key={n} onClick={() => { setNiveau(n); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${niveau === n ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{n}</button>
              ))}
            </div>
            <div className="w-px bg-slate-200 self-stretch hidden sm:block" />
            {/* Département */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Département</span>
              {DEPARTEMENTS.map(d => (
                <button key={d} onClick={() => { setDep(d); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${departement === d ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{d}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ VUE TABLEAU ═══ */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users size={40} className="mb-3 opacity-30" />
              <p className="font-semibold text-slate-500">Aucun étudiant trouvé</p>
              <button onClick={resetFilters} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Réinitialiser</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {[
                        { label: 'Étudiant', col: 'nom' },
                        { label: 'Filière', col: 'filiere' },
                        { label: 'Département', col: 'departement' },
                        { label: 'Niveau', col: 'niveau' },
                        { label: 'Statut', col: 'statut' },
                        { label: 'Requêtes', col: 'requetes' },
                        { label: 'Dernière activité', col: 'derniereActivite' },
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
                    {paginated.map((e, idx) => (
                      <tr key={e.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Étudiant */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-xs font-black flex items-center justify-center shrink-0`}>
                              {e.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{e.nom}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{e.matricule}</p>
                            </div>
                          </div>
                        </td>
                        {/* Filière */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[160px]">
                          <p className="truncate">{e.filiere}</p>
                        </td>
                        {/* Département */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{e.departement}</span>
                        </td>
                        {/* Niveau */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs bg-violet-50 text-violet-700 font-bold px-2 py-0.5 rounded-lg">{e.niveau}</span>
                        </td>
                        {/* Statut */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${statutStyle[e.statut]}`}>
                            {statutIcon[e.statut]} {e.statut}
                          </span>
                        </td>
                        {/* Requêtes */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{e.requetes}</span>
                            <div className="flex gap-1">
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md">{e.resolues} ✓</span>
                              {e.enCours > 0 && <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded-md">{e.enCours} ⟳</span>}
                            </div>
                          </div>
                        </td>
                        {/* Dernière activité */}
                        <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">{e.derniereActivite}</td>
                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/etudiants/${e.id}`}
                              className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors" title="Voir le profil">
                              <Eye size={14} />
                            </Link>
                            <a href={`mailto:${e.email}`}
                              className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="Envoyer un email">
                              <Mail size={14} />
                            </a>
                            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" title="Plus d'actions">
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
                  Affichage <span className="font-bold text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> sur <span className="font-bold text-slate-700">{filtered.length}</span> étudiants
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Users size={40} className="mb-3 opacity-30" />
                <p className="font-semibold text-slate-500">Aucun étudiant trouvé</p>
                <button onClick={resetFilters} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Réinitialiser</button>
              </div>
            ) : paginated.map((e, idx) => (
              <Link key={e.id} href={`/admin/etudiants/${e.id}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 group">
                {/* Avatar + statut */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white font-black text-sm flex items-center justify-center`}>
                    {e.avatar}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${statutStyle[e.statut]}`}>
                    {statutIcon[e.statut]} {e.statut}
                  </span>
                </div>
                {/* Infos */}
                <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{e.nom}</p>
                <p className="text-[10px] text-slate-400 font-mono mb-1">{e.matricule}</p>
                <p className="text-xs text-slate-500 truncate mb-3">{e.filiere}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{e.departement}</span>
                  <span className="text-xs bg-violet-50 text-violet-700 font-bold px-2 py-0.5 rounded-lg">{e.niveau}</span>
                </div>
                {/* Stats requêtes */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-900">{e.requetes}</p>
                    <p className="text-[10px] text-slate-400">Requêtes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-emerald-600">{e.resolues}</p>
                    <p className="text-[10px] text-slate-400">Résolues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-yellow-600">{e.enCours}</p>
                    <p className="text-[10px] text-slate-400">En cours</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination cartes */}
          {paginated.length > 0 && (
            <div className="flex justify-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${page === n ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
