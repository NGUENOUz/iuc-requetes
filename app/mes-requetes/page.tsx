'use client';

import { useState } from 'react';
import {
  FileText, Search, Clock, CheckCircle, XCircle, Eye,
  ChevronLeft, ChevronRight, Filter, Calendar, AlertCircle,
  RefreshCw, Home, PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import StudentLayout from '../components/StudentLayout';

const REQUETES = [
  { id: 'REQ-1248', titre: 'Réclamation de note', categorie: 'Scolarité', statut: 'En cours', priorite: 'Haute', date: '19 mai 2025', reponse: 'En cours de vérification par le service scolarité...' },
  { id: 'REQ-1247', titre: "Demande d'attestation de scolarité", categorie: 'Documents', statut: 'En attente', priorite: 'Moyenne', date: '17 mai 2025', reponse: null },
  { id: 'REQ-1246', titre: 'Changement de groupe TP', categorie: 'Pédagogie', statut: 'Résolue', priorite: 'Basse', date: '15 mai 2025', reponse: 'Votre demande a été acceptée. Nouveau groupe: TP-A2.' },
  { id: 'REQ-1245', titre: 'Problème paiement frais scolaires', categorie: 'Finance', statut: 'En cours', priorite: 'Haute', date: '14 mai 2025', reponse: 'Vérification en cours avec le service financier.' },
  { id: 'REQ-1244', titre: 'Demande de report de session', categorie: 'Scolarité', statut: 'En attente', priorite: 'Moyenne', date: '12 mai 2025', reponse: null },
  { id: 'REQ-1243', titre: "Demande d'attestation d'inscription", categorie: 'Documents', statut: 'Résolue', priorite: 'Basse', date: '10 mai 2025', reponse: 'Document disponible au secrétariat.' },
  { id: 'REQ-1242', titre: 'Réclamation résultats manquants', categorie: 'Scolarité', statut: 'Résolue', priorite: 'Haute', date: '08 mai 2025', reponse: 'Notes mises à jour dans votre relevé.' },
  { id: 'REQ-1241', titre: 'Demande aide financière', categorie: 'Bourse', statut: 'Rejetée', priorite: 'Haute', date: '05 mai 2025', reponse: 'Conditions d\'éligibilité non remplies.' },
];

const STATS = [
  { label: 'Total', value: 12, icon: FileText, color: 'bg-slate-100 text-slate-600' },
  { label: 'En attente', value: 4, icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { label: 'En cours', value: 5, icon: RefreshCw, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Résolues', value: 3, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
];

const STATUTS = ['Tous', 'En attente', 'En cours', 'Résolue', 'Rejetée'];

const statutStyle: Record<string, string> = {
  'En attente': 'bg-blue-100 text-blue-700 border-blue-200',
  'En cours': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Résolue': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejetée': 'bg-red-100 text-red-700 border-red-200',
};

const PAGE_SIZE = 5;

function MesRequetesContent() {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('Tous');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  let filtered = REQUETES.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.id.toLowerCase().includes(q) || r.titre.toLowerCase().includes(q);
    const matchStatut = statut === 'Tous' || r.statut === statut;
    return matchSearch && matchStatut;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <Home size={14} />
            Tableau de bord
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-medium">Mes requêtes</span>
        </div>

        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Mes requêtes</h1>
            <p className="text-slate-500 text-sm mt-0.5">Consultez et suivez l'état de vos demandes.</p>
          </div>
          <Link 
            href="/nouvelle-requete"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
            Nouvelle requête
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <button
              key={label}
              onClick={() => { setStatut(label === 'Total' ? 'Tous' : label === 'Résolues' ? 'Résolue' : label); setPage(1); }}
              className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all text-left ${
                statut === (label === 'Total' ? 'Tous' : label === 'Résolues' ? 'Résolue' : label) ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </button>
          ))}
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher par ID ou titre..."
                className="w-full h-10 bg-slate-50 rounded-xl pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all ${
                showFilters ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Filter size={15} />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 pt-1 border-t">
              {STATUTS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatut(s); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    statut === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste des requêtes */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText size={40} className="mb-3 opacity-30" />
              <p className="font-semibold text-slate-500">Aucune requête trouvée</p>
              <p className="text-sm mt-1">Modifiez vos filtres ou créez une nouvelle requête.</p>
            </div>
          ) : (
            <div className="divide-y">
              {paginated.map((r) => (
                <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">{r.titre}</h3>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${statutStyle[r.statut]}`}>
                              {r.statut}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="font-mono">#{r.id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {r.date}
                            </span>
                            <span>•</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{r.categorie}</span>
                          </div>
                          {r.reponse && (
                            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                              <p className="text-xs text-blue-800 flex items-start gap-2">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <span>{r.reponse}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/mes-requetes/${r.id}`}
                      className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      <Eye size={14} />
                      Détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {paginated.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Affichage <span className="font-bold">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> sur <span className="font-bold">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      page === n ? 'bg-emerald-600 text-white' : 'border text-slate-600 hover:bg-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function MesRequetesPage() {
  return (
    <StudentLayout>
      <MesRequetesContent />
    </StudentLayout>
  );
}
