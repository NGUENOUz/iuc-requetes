'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2, Search, SlidersHorizontal, Download, Eye,
  Plus, ArrowUpDown, ChevronLeft, ChevronRight,
  CheckCircle, Clock, RefreshCw, Mail, Phone,
  User, Shield, ShieldCheck, Zap, Activity, Users, Settings
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const DEPARTEMENTS = [
  {
    id: 'DEP-SCOL',
    nom: 'Scolarité',
    code: 'SCOL',
    chef: 'NKEMENI Paul',
    chefEmail: 'p.nkemeni@iuc.cm',
    nbAgents: 4,
    nbRequetesActives: 30,
    nbRequetesResolues: 250,
    slaRespecte: 94,
    tempsReponseMoyen: '1.5j',
    description: 'Gestion des inscriptions, des attestations de scolarité, des réclamations de notes et des dossiers académiques.',
    categories: ['Réclamations', 'Attestations', 'Inscriptions', 'Transferts'],
    status: 'Actif',
  },
  {
    id: 'DEP-FIN',
    nom: 'Finance & Comptabilité',
    code: 'FIN',
    chef: 'ETOGA Sylvie',
    chefEmail: 's.etoga@iuc.cm',
    nbAgents: 2,
    nbRequetesActives: 10,
    nbRequetesResolues: 120,
    slaRespecte: 89,
    tempsReponseMoyen: '2.1j',
    description: 'Validation des versements, suivi des bourses d\'études, facturation et litiges financiers.',
    categories: ['Paiements', 'Bourses', 'Facturation'],
    status: 'Actif',
  },
  {
    id: 'DEP-PED',
    nom: 'Pédagogie',
    code: 'PED',
    chef: 'MBARGA Jean',
    chefEmail: 'j.mbarga@iuc.cm',
    nbAgents: 3,
    nbRequetesActives: 22,
    nbRequetesResolues: 180,
    slaRespecte: 91,
    tempsReponseMoyen: '2.8j',
    description: 'Gestion des plannings de cours, organisation des examens, affectations de groupes de TD et litiges pédagogiques.',
    categories: ['Groupes', 'Notes', 'Plannings', 'Examens'],
    status: 'Actif',
  },
  {
    id: 'DEP-DIR',
    nom: 'Direction Générale',
    code: 'DIR',
    chef: 'ONDOA Claude',
    chefEmail: 'c.ondoa@iuc.cm',
    nbAgents: 1,
    nbRequetesActives: 2,
    nbRequetesResolues: 15,
    slaRespecte: 98,
    tempsReponseMoyen: '1.0j',
    description: 'Recours exceptionnels, réclamations de haut niveau et coordination générale des politiques de l\'établissement.',
    categories: ['Recours', 'Administration', 'Audit'],
    status: 'Actif',
  },
];

const STATS_TOP = [
  { label: 'Total services', value: 4, icon: Building2, color: 'text-slate-600 bg-slate-100' },
  { label: 'Agents affectés', value: 10, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Dossiers en cours', value: 64, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  { label: 'SLA Moyen', value: '93%', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
];

const PAGE_SIZE = 5;

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminServicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  /* Filtrage */
  let filtered = DEPARTEMENTS.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.nom.toLowerCase().includes(q) || d.chef.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Tous' || d.status === statusFilter;
    return matchSearch && matchStatus;
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
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const resetFilters = () => { setSearch(''); setStatusFilter('Tous'); setPage(1); };
  const hasFilters = search || statusFilter !== 'Tous';

  /* Jauge SLA colorée */
  const slaIndicator = (pct: number) => {
    const color = pct >= 92 ? 'bg-emerald-500' : pct >= 85 ? 'bg-yellow-500' : 'bg-red-500';
    const textColor = pct >= 92 ? 'text-emerald-700 bg-emerald-50' : pct >= 85 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50';
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${textColor}`}>
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
            <h1 className="text-2xl font-black text-slate-900">Services & Départements</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Configurez et analysez les services d&apos;attribution des requêtes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm">
            <Download size={15} /> Exporter
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
            <Plus size={15} /> Créer un service
          </button>
        </div>
      </div>

      {/* ── Compteurs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* ── Barre de recherche ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, code ou responsable..."
            className="w-full h-10 bg-slate-50 rounded-xl pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 border border-transparent transition-all"
          />
        </div>

        {/* Boutons de bascule de vue */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
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

      {/* ─── VUE GRILLE (CARTES) ─── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
              <Building2 size={40} className="mb-3 text-slate-200" />
              <p className="font-semibold text-slate-500">Aucun service trouvé</p>
              <button onClick={resetFilters} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Réinitialiser</button>
            </div>
          ) : paginated.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
              <div>
                {/* Badge ID + Titre */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {d.code}
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-1 group-hover:text-emerald-700 transition-colors">
                      {d.nom}
                    </h3>
                  </div>
                  <Link href={`/admin/services/${d.id}`}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors">
                    <Eye size={15} />
                  </Link>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {d.description}
                </p>

                {/* Chef de Service */}
                <div className="flex items-center gap-2 mb-4 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <User size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chef de service</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{d.chef}</p>
                  </div>
                </div>

                {/* Catégories gérées */}
                <div className="space-y-1 mb-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Requêtes prioritaires</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.categories.map(c => (
                      <span key={c} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats & SLA */}
              <div className="border-t border-slate-100 pt-3 mt-2 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900">{d.nbAgents}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide">Agents</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-amber-600">{d.nbRequetesActives}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide">Actives</p>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-emerald-600">{d.slaRespecte}%</span>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">SLA</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── VUE TABLEAU ─── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Building2 size={40} className="mb-3 text-slate-200" />
              <p className="font-semibold text-slate-500">Aucun service trouvé</p>
              <button onClick={resetFilters} className="mt-3 text-emerald-600 text-sm font-semibold hover:underline">Réinitialiser</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {[
                        { label: 'Service', col: 'nom' },
                        { label: 'Chef de Service', col: 'chef' },
                        { label: 'Agents', col: 'nbAgents' },
                        { label: 'Actives', col: 'nbRequetesActives' },
                        { label: 'Traitées', col: 'nbRequetesResolues' },
                        { label: 'Respect SLA', col: 'slaRespecte' },
                        { label: 'Temps moyen', col: 'tempsReponseMoyen' },
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
                    {paginated.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{d.nom}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{d.code}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{d.chef}</p>
                            <p className="text-[10px] text-slate-400">{d.chefEmail}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-600">{d.nbAgents}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                            {d.nbRequetesActives}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">{d.nbRequetesResolues}</td>
                        <td className="py-3.5 px-4">{slaIndicator(d.slaRespecte)}</td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-600">{d.tempsReponseMoyen}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/services/${d.id}`}
                              className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors" title="Détail du service">
                              <Eye size={14} />
                            </Link>
                            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                              <Settings size={14} />
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
                  Affichage <span className="font-bold text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> sur <span className="font-bold text-slate-700">{filtered.length}</span> services
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
    </div>
  );
}
