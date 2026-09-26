'use client';

import { useState } from 'react';
import {
  FileText, Search, Clock, CheckCircle, Eye,
  ChevronLeft, ChevronRight, Filter, Calendar,
  Plus, Loader2, FileCheck, Zap
} from 'lucide-react';
import Link from 'next/link';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useStudentRequests } from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';

const STATUTS = ['Tous', 'En attente', 'En cours', 'Résolue', 'Rejetée'];
const PAGE_SIZE = 10;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

function MesRequetesContent() {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('Tous');
  const [page, setPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const { student, loading: studentLoading } = useStudent();
  const { requests, stats, loading: requestsLoading, error } = useStudentRequests(student?.id);

  let filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.reference.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
    const matchStatut = statut === 'Tous' || r.status.name === statut;
    return matchSearch && matchStatut;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (studentLoading || requestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-950 mx-auto mb-3" />
          <p className="text-zinc-500 text-xs font-mono">Chargement de vos requêtes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Registres Académiques & Administratifs
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Mes requêtes & demandes
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Suivi en temps réel de vos démarches, délais d'instruction et attestations officielles.
          </p>
        </div>

        <Link
          href="/nouvelle-requete"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white font-bold text-xs transition-colors shadow-2xs"
        >
          <Plus size={14} />
          Nouvelle requête
        </Link>
      </div>

      {/* KPI Stats Minimalistes Black & White */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total', count: stats.total, filter: 'Tous' },
          { label: 'Résolues', count: stats.resolved, filter: 'Résolue' },
          { label: 'En cours', count: stats.in_progress, filter: 'En cours' },
          { label: 'En attente', count: stats.pending, filter: 'En attente' },
        ].map((item) => {
          const isActive = statut === item.filter;
          return (
            <button
              key={item.label}
              onClick={() => { setStatut(item.filter); setPage(1); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {item.label}
              </p>
              <p className="text-2xl font-extrabold font-mono mt-1">
                {item.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Barre de recherche et filtres de statuts */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par référence (ex: REQ-2026-0001) ou par mot-clé..."
              className="w-full h-10 pl-9 pr-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-black focus:bg-white transition-all font-sans"
            />
          </div>

          {/* Onglets de filtrage */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUTS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatut(s); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statut === s
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des requêtes (Tableau épuré) */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        {paginated.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 space-y-2">
            <FileText size={32} className="mx-auto text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-700">Aucune demande trouvée</p>
            <p className="text-xs text-zinc-400">
              Modifiez votre recherche ou réinitialisez les filtres.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {paginated.map((r) => {
              const isResolved = r.status.name === 'Résolue';
              const hasDoc = (r as any).metadata?.document_code;

              return (
                <div
                  key={r.id}
                  className="p-4 sm:px-6 hover:bg-zinc-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {r.reference}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                        isResolved
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}>
                        {r.status.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                        {r.category?.name || 'Catégorie'}
                      </span>
                      {hasDoc && (
                        <span className="text-[10px] font-mono font-bold text-zinc-900 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap size={11} /> Certificat prêt
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/mes-requetes/${r.id}`}
                      className="block text-sm font-bold text-zinc-900 hover:text-black transition-colors"
                    >
                      {r.title}
                    </Link>

                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {r.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(r.submitted_at)}
                      </span>
                      <span>•</span>
                      <span>Priorité : {r.priority.name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasDoc && (
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-colors"
                        title="Consulter et imprimer le document certifié"
                      >
                        <FileCheck size={13} />
                        Document
                      </button>
                    )}
                    <Link
                      href={`/mes-requetes/${r.id}`}
                      className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page {page} sur {totalPages} ({filtered.length} résultats)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal du document certifié */}
      {selectedDoc && (
        <OfficialDocumentModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={{
            type: 'attestation',
            title: selectedDoc.title,
            code: selectedDoc.metadata?.document_code || 'CERT-IUC-2026',
            date: new Date(selectedDoc.resolved_at || selectedDoc.submitted_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            requesterName: `${student?.first_name} ${student?.last_name}`,
            matricule: student?.matricule || 'N/A',
            programOrFunction:
              student?.role_code === 'enseignant'
                ? (student?.fonction || 'Enseignant - IUC')
                : student?.role_code === 'personnel'
                ? (student?.fonction || 'Personnel Administratif')
                : `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`,
            academicYear: student?.annee_academique || '2025-2026',
          }}
        />
      )}

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
