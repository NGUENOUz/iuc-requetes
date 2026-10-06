'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Loader2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useStudentRequests } from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import SegmentedBar from '@/components/ui/SegmentedBar';
import RequestTimeline from '@/components/ui/RequestTimeline';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

const STATUTS = ['Tous', 'En attente', 'En cours', 'Résolue', 'Rejetée'];
const PAGE_SIZE = 10;

export default function MesRequetesPage() {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('Tous');
  const [page, setPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const { student, loading: studentLoading } = useStudent();
  const { requests, stats, loading: requestsLoading } = useStudentRequests(student?.id);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.reference.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q);
    const matchStatut = statut === 'Tous' || r.status?.name === statut;
    return matchSearch && matchStatut;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Données pour la barre segmentée
  const segments = [
    {
      id: 'resolue',
      label: 'Résolues',
      count: stats.resolved,
      color: 'bg-success-fg',
      bgColor: 'bg-success-bg',
    },
    {
      id: 'en_cours',
      label: 'En instruction',
      count: stats.in_progress,
      color: 'bg-accent',
      bgColor: 'bg-accent-soft',
    },
    {
      id: 'en_attente',
      label: 'En attente',
      count: stats.pending,
      color: 'bg-warning-fg',
      bgColor: 'bg-warning-bg',
    },
    {
      id: 'rejetee',
      label: 'Rejetées',
      count: Math.max(0, stats.total - (stats.resolved + stats.in_progress + stats.pending)),
      color: 'bg-danger-fg',
      bgColor: 'bg-danger-bg',
    },
  ];

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* ── EN-TÊTE SOBRE ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Mes démarches & requêtes
            </h1>
            <p className="text-xs text-fg-muted">
              Suivi en temps réel de tes demandes administratives et certificats officiels.
            </p>
          </div>

          <Link href="/nouvelle-requete">
            <Button variant="primary" leftIcon={<Plus size={15} />}>
              Nouvelle requête
            </Button>
          </Link>
        </div>

        {/* ── CARTE DE SYNTHÈSE GRAPHIQUE (SegmentedBar + StatTiles) ── */}
        <GlassCard variant="glass" withShine={true} className="p-5 sm:p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-fg">
                Répartition de tes dossiers ({stats.total} au total)
              </span>
              <span className="text-fg-muted">
                {stats.resolved > 0
                  ? `${Math.round((stats.resolved / (stats.total || 1)) * 100)} % résolus`
                  : 'En cours'}
              </span>
            </div>
            <SegmentedBar segments={segments} total={stats.total} />
          </div>

          {/* Grille de 4 tuiles interactives */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-line/60">
            {[
              { label: 'Toutes les démarches', count: stats.total, filter: 'Tous' },
              { label: 'Résolues & certifiées', count: stats.resolved, filter: 'Résolue' },
              { label: 'En cours d’instruction', count: stats.in_progress, filter: 'En cours' },
              { label: 'En attente d’attribution', count: stats.pending, filter: 'En attente' },
            ].map((item) => {
              const isActive = statut === item.filter;
              return (
                <div
                  key={item.label}
                  onClick={() => {
                    setStatut(item.filter);
                    setPage(1);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-surface text-fg border-accent ring-2 ring-accent/20 shadow-xs'
                      : 'bg-surface/50 text-fg-secondary border-line/60 hover:bg-surface hover:text-fg'
                  }`}
                >
                  <p className="text-xs text-fg-muted truncate">{item.label}</p>
                  <p className="text-2xl font-bold text-fg tabular mt-1 font-title">
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* ── BARRE DE RECHERCHE & FILTRES RAPIDES ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Rechercher par référence (ex: REQ-2026) ou mot-clé..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 rounded-md bg-surface border border-line text-xs text-fg placeholder:text-fg-muted focus:border-accent focus-visible:outline-2 focus-visible:outline-accent transition-colors-fast"
            />
          </div>

          {/* Filtres par bouton */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-md bg-surface-muted/60 border border-line text-xs">
            {STATUTS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatut(st);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors-fast cursor-pointer whitespace-nowrap ${
                  statut === st
                    ? 'bg-surface text-fg shadow-xs font-semibold'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ── LISTE DES REQUÊTES EN CARTES DE VERRE ── */}
        {studentLoading || requestsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : paginated.length === 0 ? (
          <GlassCard>
            <EmptyState
              title="Aucune requête trouvée"
              description={
                search || statut !== 'Tous'
                  ? 'Aucune démarche ne correspond à tes critères de recherche.'
                  : 'Tu n’as soumis aucune requête pour l’instant.'
              }
              action={
                search || statut !== 'Tous' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setStatut('Tous');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link href="/nouvelle-requete">
                    <Button variant="primary" size="sm">
                      Déposer une requête
                    </Button>
                  </Link>
                )
              }
            />
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {paginated.map((req) => {
              const isResolved = req.status?.name?.toLowerCase().includes('résol');
              const isRejected =
                req.status?.name?.toLowerCase().includes('rejet') ||
                req.status?.name?.toLowerCase().includes('refus');
              const hasCert = (req as any).metadata?.document_code;

              const timelineSteps = [
                {
                  id: '1',
                  label: 'Déposée',
                  date: new Date(req.submitted_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  }),
                  status: 'completed' as const,
                },
                {
                  id: '2',
                  label: 'Instruction',
                  date: undefined,
                  status: (isResolved || isRejected ? 'completed' : 'current') as const,
                },
                {
                  id: '3',
                  label: isRejected ? 'Rejetée' : 'Délivrée',
                  date: req.resolved_at
                    ? new Date(req.resolved_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : undefined,
                  status: (isRejected
                    ? 'rejected'
                    : isResolved
                    ? 'completed'
                    : 'upcoming') as const,
                },
              ];

              return (
                <GlassCard key={req.id} variant="glass" withShine={true} className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-fg-muted">
                          {req.reference}
                        </span>
                        <StatusBadge
                          variant={
                            isResolved
                              ? 'success'
                              : isRejected
                              ? 'danger'
                              : 'info'
                          }
                        >
                          {req.status?.name || 'En cours'}
                        </StatusBadge>
                        {req.category?.name && (
                          <span className="text-xs text-fg-secondary">
                            • {req.category.name}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/mes-requetes/${req.id}`}
                        className="text-base font-semibold text-fg hover:text-accent transition-colors block"
                      >
                        {req.title}
                      </Link>

                      {req.description && (
                        <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                      )}

                      <div className="text-xs text-fg-muted pt-1">
                        Déposée le{' '}
                        {new Date(req.submitted_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasCert && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedDoc(req)}
                          leftIcon={<Printer size={13} />}
                        >
                          Document
                        </Button>
                      )}
                      <Link href={`/mes-requetes/${req.id}`}>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Frise intégrée directement sur chaque carte de requête */}
                  <div className="pt-3 border-t border-line/60">
                    <RequestTimeline
                      variant="compact"
                      steps={timelineSteps}
                      statusSentence={
                        isResolved
                          ? 'Dossier instruit et certificat disponible.'
                          : isRejected
                          ? 'Demande non validée par les services.'
                          : 'Dossier actuellement examiné par la scolarité.'
                      }
                    />
                  </div>
                </GlassCard>
              );
            })}

            {/* Pagination sobre */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 text-xs text-fg-muted">
                <span>
                  Page {page} sur {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal document officiel */}
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
            requesterName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Étudiant',
            matricule: student?.matricule || 'N/A',
            programOrFunction: `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`,
            academicYear: student?.annee_academique || '2025-2026',
          }}
        />
      )}
    </StudentLayout>
  );
}
