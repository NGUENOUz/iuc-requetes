'use client';

import { useState } from 'react';
import {
  FileText, Search, Filter, Download, Eye, CheckCircle, XCircle,
  Clock, ChevronRight, ChevronLeft, SlidersHorizontal,
  ArrowUpDown, AlertCircle, Users, Calendar, RefreshCw,
  ChevronDown, MoreHorizontal, Inbox,
} from 'lucide-react';
import Link from 'next/link';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const REQUETES = [
  { id: 'REQ-1248', etudiant: 'NGUENOU Wilfried', matricule: 'IUC2021001', categorie: 'Réclamation de note', service: 'Scolarité', statut: 'En cours', priorite: 'Haute', date: '19 mai 2025', agent: 'M. TAMBA', },
  { id: 'REQ-1247', etudiant: 'TCHUENTE Marie', matricule: 'IUC2022045', categorie: "Demande d'attestation", service: 'Scolarité', statut: 'En attente', priorite: 'Moyenne', date: '19 mai 2025', agent: null, },
  { id: 'REQ-1246', etudiant: 'KAMGA Junior', matricule: 'IUC2020112', categorie: 'Changement de groupe', service: 'Pédagogie', statut: 'Résolue', priorite: 'Basse', date: '18 mai 2025', agent: 'Mme. FOUDA', },
  { id: 'REQ-1245', etudiant: 'FOUDA Sarah', matricule: 'IUC2023008', categorie: 'Problème de paiement', service: 'Finance', statut: 'En cours', priorite: 'Haute', date: '18 mai 2025', agent: 'M. TAMBA', },
  { id: 'REQ-1244', etudiant: 'MBALLA Chris', matricule: 'IUC2021089', categorie: 'Demande de transfert', service: 'Scolarité', statut: 'En attente', priorite: 'Moyenne', date: '17 mai 2025', agent: null, },
  { id: 'REQ-1243', etudiant: 'BIYA Estelle', matricule: 'IUC2022133', categorie: 'Bourse & aide financière', service: 'Finance', statut: 'Rejetée', priorite: 'Haute', date: '17 mai 2025', agent: 'Mme. FOUDA', },
  { id: 'REQ-1242', etudiant: 'NJOYA Patrick', matricule: 'IUC2020056', categorie: 'Résultats manquants', service: 'Scolarité', statut: 'Résolue', priorite: 'Haute', date: '16 mai 2025', agent: 'M. TAMBA', },
  { id: 'REQ-1241', etudiant: 'ONANA Cécile', matricule: 'IUC2023201', categorie: 'Certificat de scolarité', service: 'Scolarité', statut: 'En attente', priorite: 'Basse', date: '16 mai 2025', agent: null, },
  { id: 'REQ-1240', etudiant: 'ABEGA Denis', matricule: 'IUC2021177', categorie: 'Changement de filière', service: 'Pédagogie', statut: 'En cours', priorite: 'Haute', date: '15 mai 2025', agent: 'Mme. FOUDA', },
  { id: 'REQ-1239', etudiant: 'NKENG Aline', matricule: 'IUC2022067', categorie: 'Réclamation de note', service: 'Scolarité', statut: 'Résolue', priorite: 'Moyenne', date: '15 mai 2025', agent: 'M. TAMBA', },
  { id: 'REQ-1238', etudiant: 'MENYE Paul', matricule: 'IUC2020234', categorie: 'Inscription tardive', service: 'Scolarité', statut: 'Rejetée', priorite: 'Basse', date: '14 mai 2025', agent: 'Mme. FOUDA', },
  { id: 'REQ-1237', etudiant: 'ETOA Lucie', matricule: 'IUC2023156', categorie: "Demande d'attestation", service: 'Scolarité', statut: 'Résolue', priorite: 'Basse', date: '13 mai 2025', agent: 'M. TAMBA', },
];

/* ═══════════════════════ CONFIG ═══════════════════════ */

const STATUTS = ['Tous', 'En attente', 'En cours', 'Résolue', 'Rejetée'];
const PRIORITES = ['Toutes', 'Haute', 'Moyenne', 'Basse'];
const SERVICES = ['Tous', 'Scolarité', 'Pédagogie', 'Finance'];

const statutStyle: Record<string, string> = {
  'En attente': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'En cours':   'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'Résolue':    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Rejetée':    'bg-red-100 text-red-700 ring-1 ring-red-200',
};
const prioriteStyle: Record<string, string> = {
  'Haute':   'bg-red-50 text-red-600',
  'Moyenne': 'bg-yellow-50 text-yellow-700',
  'Basse':   'bg-slate-100 text-slate-500',
};
const statutIcon: Record<string, React.ReactNode> = {
  'En attente': <Clock size={11} />,
  'En cours':   <RefreshCw size={11} />,
  'Résolue':    <CheckCircle size={11} />,
  'Rejetée':    <XCircle size={11} />,
};

const STATS_TOP = [
  { label: 'Total', value: 1248, icon: Inbox, color: 'text-slate-600 bg-slate-100' },
  { label: 'En attente', value: 356, icon: Clock, color: 'text-blue-600 bg-blue-50' },
  { label: 'En cours', value: 472, icon: RefreshCw, color: 'text-yellow-600 bg-yellow-50' },
  { label: 'Résolues', value: 389, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Rejetées', value: 31, icon: XCircle, color: 'text-red-600 bg-red-50' },
];

const PAGE_SIZE = 8;

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminRequetesPage() {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('Tous');
  const [priorite, setPriorite] = useState('Toutes');
  const [service, setService] = useState('Tous');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ── Filtrage ── */
  let filtered = REQUETES.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.etudiant.toLowerCase().includes(q) ||
      r.categorie.toLowerCase().includes(q) ||
      r.matricule.toLowerCase().includes(q);
    const matchStatut = statut === 'Tous' || r.statut === statut;
    const matchPriorite = priorite === 'Toutes' || r.priorite === priorite;
    const matchService = service === 'Tous' || r.service === service;
    return matchSearch && matchStatut && matchPriorite && matchService;
  });

  /* ── Tri ── */
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const va = (a as Record<string, string>)[sortCol] ?? '';
      const vb = (b as Record<string, string>)[sortCol] ?? '';
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  /* ── Pagination ── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setStatut('Tous'); setPriorite('Toutes'); setService('Tous'); setPage(1);
  };

  const hasActiveFilters = search || statut !== 'Tous' || priorite !== 'Toutes' || service !== 'Tous';

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Gestion des requêtes</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Consultez, traitez et suivez toutes les requêtes étudiantes.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
          <Download size={15} />
          Exporter
        </button>
      </div>

      {/* ── Compteurs rapides ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATS_TOP.map(({ label, value, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => { setStatut(label === 'Total' ? 'Tous' : label === 'Résolues' ? 'Résolue' : label === 'Rejetées' ? 'Rejetée' : label); setPage(1); }}
            className={`bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm hover:shadow-md transition-all text-left group ${
              (statut === (label === 'Total' ? 'Tous' : label === 'Résolues' ? 'Résolue' : label === 'Rejetées' ? 'Rejetée' : label)) ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-black text-slate-900">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Barre de recherche + filtres ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par ID, étudiant, matricule..."
              className="w-full h-10 bg-slate-50 rounded-xl pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 border border-transparent focus:border-emerald-300 transition-all"
            />
          </div>

          {/* Bouton filtres avancés */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtres
            {hasActiveFilters && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-10 px-3 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all font-medium border border-transparent"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filtres dépliants */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-100">

            {/* Statut */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</span>
              <div className="flex gap-1 flex-wrap">
                {STATUTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatut(s); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                      statut === s
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px bg-slate-200 self-stretch hidden sm:block" />

            {/* Priorité */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Priorité</span>
              <div className="flex gap-1 flex-wrap">
                {PRIORITES.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPriorite(p); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                      priorite === p
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px bg-slate-200 self-stretch hidden sm:block" />

            {/* Service */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Service</span>
              <div className="flex gap-1 flex-wrap">
                {SERVICES.map((sv) => (
                  <button
                    key={sv}
                    onClick={() => { setService(sv); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                      service === sv
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sv}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          /* État vide */
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">Aucune requête trouvée</p>
            <p className="text-sm mt-1">Modifiez vos filtres ou effectuez une autre recherche.</p>
            <button onClick={resetFilters} className="mt-4 text-emerald-600 text-sm font-semibold hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {[
                      { label: 'ID', col: 'id' },
                      { label: 'Étudiant', col: 'etudiant' },
                      { label: 'Catégorie', col: 'categorie' },
                      { label: 'Service', col: 'service' },
                      { label: 'Statut', col: 'statut' },
                      { label: 'Priorité', col: 'priorite' },
                      { label: 'Date', col: 'date' },
                      { label: 'Agent', col: 'agent' },
                      { label: '', col: null },
                    ].map(({ label, col }) => (
                      <th
                        key={label}
                        className={`text-left py-3.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide ${col ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}
                        onClick={() => col && handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {col && (
                            <ArrowUpDown
                              size={11}
                              className={sortCol === col ? 'text-emerald-500' : 'text-slate-300'}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">

                      {/* ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-500">#{r.id}</span>
                      </td>

                      {/* Étudiant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            {r.etudiant.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{r.etudiant}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{r.matricule}</p>
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[160px]">
                        <p className="truncate">{r.categorie}</p>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                          {r.service}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${statutStyle[r.statut]}`}>
                          {statutIcon[r.statut]}
                          {r.statut}
                        </span>
                      </td>

                      {/* Priorité */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.priorite === 'Haute' ? 'bg-red-500' :
                            r.priorite === 'Moyenne' ? 'bg-yellow-500' : 'bg-slate-300'
                          }`} />
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[r.priorite]}`}>
                            {r.priorite}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">{r.date}</td>

                      {/* Agent */}
                      <td className="py-3.5 px-4">
                        {r.agent ? (
                          <span className="text-xs text-slate-600 font-medium">{r.agent}</span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Non assigné</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/requetes/${r.id}`}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Voir le détail"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Traiter"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            title="Rejeter"
                          >
                            <XCircle size={14} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            title="Plus d'actions"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Affichage <span className="font-bold text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> sur <span className="font-bold text-slate-700">{filtered.length}</span> requêtes
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      page === n
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
