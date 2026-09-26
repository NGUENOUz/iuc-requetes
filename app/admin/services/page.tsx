'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2, Search, Download, Eye,
  Plus, ArrowUpDown, ChevronLeft, ChevronRight,
  ShieldCheck, Users, Clock, Settings, User
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
  { label: 'Total services', value: 4, icon: Building2 },
  { label: 'Agents affectés', value: 10, icon: Users },
  { label: 'Dossiers en cours', value: 64, icon: Clock },
  { label: 'SLA Moyen', value: '93%', icon: ShieldCheck },
];

const PAGE_SIZE = 5;

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

  /* Jauge SLA monochrome */
  const slaIndicator = (pct: number) => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden hidden sm:block">
          <div className="h-full rounded-full bg-[#171717]" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
          {pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#171717] tracking-tight">Services & Départements</h1>
            <span className="bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] text-xs font-medium px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <p className="text-[#737373] text-sm mt-0.5">Organisation structurelle et attribution des réclamations</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-white hover:bg-[#fafafa] text-[#171717] text-xs font-medium px-3 py-2 rounded-md border border-[#e5e5e5] transition-colors">
            <Download size={13} className="text-[#737373]" /> Exporter
          </button>
          <button className="flex items-center gap-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors">
            <Plus size={13} /> Nouveau service
          </button>
        </div>
      </div>

      {/* ── Compteurs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS_TOP.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-md border border-[#e5e5e5] p-4 hover:border-[#171717]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#737373] font-medium">{label}</span>
              <Icon size={14} className="text-[#a3a3a3]" />
            </div>
            <p className="text-2xl font-semibold text-[#171717] tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Barre de recherche ── */}
      <div className="bg-white rounded-md border border-[#e5e5e5] p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, code ou responsable..."
            className="w-full h-8 bg-transparent rounded-md pl-8 pr-3 text-xs text-[#171717] placeholder:text-[#a3a3a3] outline-none focus:border-[#171717] border border-[#e5e5e5] transition-colors"
          />
        </div>

        {/* Boutons de bascule de vue */}
        <div className="flex items-center bg-[#f5f5f5] rounded-md p-0.5 gap-0.5 border border-[#e5e5e5]">
          {['cards', 'table'].map(v => (
            <button key={v} onClick={() => setViewMode(v as 'table' | 'cards')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === v ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737373] hover:text-[#171717]'}`}>
              {v === 'table' ? 'Tableau' : 'Cartes'}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-[#737373] hover:text-[#171717] transition-colors font-medium px-2">
            Effacer
          </button>
        )}
      </div>

      {/* ─── VUE GRILLE (CARTES) ─── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-md border border-[#e5e5e5]">
              <Building2 size={32} className="mb-2 text-[#d4d4d4]" />
              <p className="font-medium text-xs text-[#737373]">Aucun service trouvé</p>
              <button onClick={resetFilters} className="mt-2 text-xs text-[#171717] font-medium hover:underline">Réinitialiser</button>
            </div>
          ) : paginated.map(d => (
            <div key={d.id} className="bg-white rounded-md border border-[#e5e5e5] hover:border-[#171717]/40 transition-colors p-4 flex flex-col justify-between group">
              <div>
                {/* Badge ID + Titre */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono bg-[#f5f5f5] text-[#737373] px-1.5 py-0.5 rounded border border-[#e5e5e5]">
                      {d.code}
                    </span>
                    <h3 className="font-semibold text-[#171717] text-sm mt-1">
                      {d.nom}
                    </h3>
                  </div>
                  <Link href={`/admin/services/${d.id}`}
                    className="w-7 h-7 rounded border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#737373] hover:text-[#171717] flex items-center justify-center transition-colors">
                    <Eye size={13} />
                  </Link>
                </div>

                <p className="text-xs text-[#737373] leading-relaxed mb-3 line-clamp-2">
                  {d.description}
                </p>

                {/* Chef de Service */}
                <div className="flex items-center gap-2.5 mb-3 bg-[#fafafa] rounded-md p-2 border border-[#e5e5e5]">
                  <div className="w-6 h-6 rounded bg-[#171717] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <User size={12} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#737373] font-semibold uppercase tracking-wider">Chef de service</p>
                    <p className="text-xs font-medium text-[#171717] truncate">{d.chef}</p>
                  </div>
                </div>

                {/* Catégories gérées */}
                <div className="space-y-1 mb-3">
                  <div className="flex flex-wrap gap-1">
                    {d.categories.map(c => (
                      <span key={c} className="text-[10px] bg-[#f5f5f5] text-[#737373] px-1.5 py-0.5 rounded border border-[#e5e5e5]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats & SLA */}
              <div className="border-t border-[#f0f0f0] pt-2.5 mt-2 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#171717]">{d.nbAgents}</p>
                  <p className="text-[9px] text-[#737373] uppercase tracking-wide">Agents</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#171717]">{d.nbRequetesActives}</p>
                  <p className="text-[9px] text-[#737373] uppercase tracking-wide">Actives</p>
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#171717]">{d.slaRespecte}%</span>
                  <p className="text-[9px] text-[#737373] uppercase tracking-wide">SLA</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── VUE TABLEAU ─── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-md border border-[#e5e5e5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[750px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <tr>
                  {[
                    { label: 'Service', col: 'nom' },
                    { label: 'Chef de Service', col: 'chef' },
                    { label: 'Agents', col: 'nbAgents' },
                    { label: 'Actives', col: 'nbRequetesActives' },
                    { label: 'Traitées', col: 'nbRequetesResolues' },
                    { label: 'Respect SLA', col: 'slaRespecte' },
                    { label: 'Délai moyen', col: 'tempsReponseMoyen' },
                    { label: '', col: null },
                  ].map(({ label, col }) => (
                    <th key={label} onClick={() => col && handleSort(col)}
                      className={`text-left py-2.5 px-3 font-semibold text-[#737373] uppercase tracking-wide ${col ? 'cursor-pointer hover:text-[#171717] select-none' : ''}`}>
                      <div className="flex items-center gap-1">
                        {label}
                        {col && <ArrowUpDown size={10} className="text-[#a3a3a3]" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {paginated.map(d => (
                  <tr key={d.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="py-2.5 px-3 font-medium text-[#171717]">
                      <div>
                        <p className="text-xs font-medium text-[#171717]">{d.nom}</p>
                        <p className="text-[10px] text-[#737373] font-mono">{d.code}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div>
                        <p className="text-xs text-[#171717] font-medium">{d.chef}</p>
                        <p className="text-[10px] text-[#737373]">{d.chefEmail}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#171717] font-medium">{d.nbAgents}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                        {d.nbRequetesActives}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#737373]">{d.nbRequetesResolues}</td>
                    <td className="py-2.5 px-3">{slaIndicator(d.slaRespecte)}</td>
                    <td className="py-2.5 px-3 font-medium text-[#171717]">{d.tempsReponseMoyen}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/services/${d.id}`}
                          className="w-6 h-6 rounded hover:bg-[#f5f5f5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-colors" title="Détail du service">
                          <Eye size={12} />
                        </Link>
                        <button className="w-6 h-6 rounded hover:bg-[#f5f5f5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-colors">
                          <Settings size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-[#e5e5e5] bg-[#fafafa]">
            <p className="text-xs text-[#737373]">
              Page {page} sur {totalPages || 1}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 rounded border border-[#e5e5e5] flex items-center justify-center text-[#737373] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-7 h-7 rounded border border-[#e5e5e5] flex items-center justify-center text-[#737373] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
