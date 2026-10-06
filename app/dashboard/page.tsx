'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  AlertTriangle,
  FileCheck,
  GraduationCap,
  X,
  BellRing,
  Eye,
  EyeOff,
  Radio,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import {
  useStudent,
  useStudentRequests,
  useAcademicGrades,
  useTimetable,
  useNotifications,
} from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
import RoomDetailModal from '@/components/RoomDetailModal';
import GradeClaimModal from '@/components/GradeClaimModal';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import ProgressRing from '@/components/ui/ProgressRing';
import MiniAreaChart from '@/components/ui/MiniAreaChart';
import DayTimeline, { DayCourseSlot } from '@/components/ui/DayTimeline';
import RequestTimeline from '@/components/ui/RequestTimeline';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const { student, loading: studentLoading } = useStudent();
  const { requests, stats, loading: requestsLoading } = useStudentRequests(student?.id);
  const { data: notifications = [] } = useNotifications();
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [selectedRoomModal, setSelectedRoomModal] = useState<any | null>(null);
  const [selectedGradeModal, setSelectedGradeModal] = useState<any | null>(null);

  // État de visibilité des notices flottantes (sticky à droite)
  const [showStickyNotices, setShowStickyNotices] = useState(true);
  const [dismissedDocNotice, setDismissedDocNotice] = useState(false);
  const [dismissedRejectNotice, setDismissedRejectNotice] = useState(false);

  // Heure actuelle cohérente pour la journée de démonstration
  const [currentTime] = useState<string>('09:15');

  const roleCode = student?.role_code || 'etudiant';
  const isTeacher = roleCode === 'enseignant';

  // Notes académiques
  const { grades, stats: academicStats } = useAcademicGrades(student?.id, 'Licence', 'S5');

  // Planning / Salles
  const { slots } = useTimetable({
    teacherId: isTeacher ? student?.id : undefined,
  });

  // Détection rigoureuse et cohérente de la séance selon currentTime (09:15)
  // Séances ordonnées : slot 1 (08:00 - 11:00), slot 2 (11:15 - 14:15), etc.
  const currentSlot = slots.find(
    (s) => s.start_time <= currentTime && currentTime < s.end_time
  );

  const upcomingSlot = slots.find(
    (s) => s.start_time > currentTime
  );

  const activeFocusSlot = currentSlot || upcomingSlot || slots[0] || null;

  const recentRequests = requests.slice(0, 3);
  const latestGrade = grades && grades.length > 0 ? grades[0] : null;

  // Requêtes nécessitant une action (pour les notices sticky discrètes)
  const rejectedRequest = requests.find(
    (r) => r.status?.name?.toLowerCase().includes('rejet') || r.status?.name?.toLowerCase().includes('refus')
  );
  const readyDocument = requests.find(
    (r) => (r as any).metadata?.document_code && r.status?.name?.toLowerCase().includes('résol')
  );

  const hasActiveStickyNotice =
    (readyDocument && !dismissedDocNotice) ||
    (rejectedRequest && !dismissedRejectNotice);

  // Données de la courbe d'évolution par semestre
  const evolutionData = [
    { label: 'S1', value: 13.8 },
    { label: 'S2', value: 14.2 },
    { label: 'S3', value: 14.5 },
    { label: 'S4', value: 15.0 },
    {
      label: 'S5',
      value:
        academicStats?.moyenne_generale !== undefined
          ? Number(academicStats.moyenne_generale)
          : 15.8,
    },
  ];

  // Calcul du message d'en-tête temporel 100% cohérent
  const getHeroStatus = () => {
    if (currentSlot) {
      return {
        badgeText: `Séance en cours • ${currentSlot.start_time} - ${currentSlot.end_time}`,
        badgeVariant: 'success' as const,
        title: `En cours : ${currentSlot.course_name}`,
        detail: `Salle ${currentSlot.room_name} • Fin de séance à ${currentSlot.end_time} • ${currentSlot.teacher_name || 'Enseignant'}`,
        nextHint: upcomingSlot
          ? `Prochain cours à ${upcomingSlot.start_time} (${upcomingSlot.course_name})`
          : undefined,
        slot: currentSlot,
      };
    }

    if (upcomingSlot) {
      return {
        badgeText: `Prochain cours à ${upcomingSlot.start_time}`,
        badgeVariant: 'info' as const,
        title: `Ton prochain cours commence à ${upcomingSlot.start_time}`,
        detail: `${upcomingSlot.course_name} • Salle ${upcomingSlot.room_name} (${upcomingSlot.teacher_name || 'Enseignant'})`,
        nextHint: undefined,
        slot: upcomingSlot,
      };
    }

    return {
      badgeText: 'Journée terminée',
      badgeVariant: 'neutral' as const,
      title: 'Tous les cours de la journée sont terminés',
      detail: 'Aucune séance restante pour aujourd’hui. Bon repos ou préparation des projets !',
      nextHint: undefined,
      slot: null,
    };
  };

  const heroStatus = getHeroStatus();

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 relative">
        
        {/* ── 1. NOTICES STICKY FLOTTANTES À DROITE (Pour ne pas encombrer le dashboard) ── */}
        {hasActiveStickyNotice && showStickyNotices && (
          <aside className="fixed bottom-6 right-6 sm:bottom-auto sm:top-20 z-40 w-80 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-surface-muted/90 backdrop-blur-md border border-line text-xs">
              <span className="font-semibold text-fg flex items-center gap-1.5">
                <BellRing size={13} className="text-accent" />
                Actions administratives
              </span>
              <button
                type="button"
                onClick={() => setShowStickyNotices(false)}
                className="text-fg-muted hover:text-fg text-[11px] flex items-center gap-1 cursor-pointer"
                title="Masquer le volet"
              >
                <EyeOff size={12} />
                <span>Masquer</span>
              </button>
            </div>

            {/* Notice 1 : Document officiel prêt */}
            {readyDocument && !dismissedDocNotice && (
              <GlassCard
                variant="glass-raised"
                className="p-3.5 border-success/40 bg-success-bg/80 backdrop-blur-xl shadow-lg relative space-y-2"
              >
                <button
                  type="button"
                  onClick={() => setDismissedDocNotice(true)}
                  className="absolute top-2.5 right-2.5 text-fg-muted hover:text-fg p-0.5 rounded cursor-pointer"
                  title="Fermer cette alerte"
                >
                  <X size={14} />
                </button>
                <div className="flex items-start gap-2.5 pr-5">
                  <div className="w-7 h-7 rounded-md bg-success-fg/15 text-success-fg flex items-center justify-center shrink-0">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-fg">Document prêt au retrait</p>
                    <p className="text-[11px] text-fg-secondary mt-0.5 leading-snug">
                      Attestation scellée pour la requête {readyDocument.reference}.
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedDoc(readyDocument)}
                    className="text-xs h-7 px-2.5"
                  >
                    Télécharger
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Notice 2 : Requête rejetée */}
            {rejectedRequest && !dismissedRejectNotice && (
              <GlassCard
                variant="glass-raised"
                className="p-3.5 border-danger/40 bg-danger-bg/80 backdrop-blur-xl shadow-lg relative space-y-2"
              >
                <button
                  type="button"
                  onClick={() => setDismissedRejectNotice(true)}
                  className="absolute top-2.5 right-2.5 text-fg-muted hover:text-fg p-0.5 rounded cursor-pointer"
                  title="Fermer cette alerte"
                >
                  <X size={14} />
                </button>
                <div className="flex items-start gap-2.5 pr-5">
                  <div className="w-7 h-7 rounded-md bg-danger-fg/15 text-danger-fg flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-fg">Dossier à réviser ({rejectedRequest.reference})</p>
                    <p className="text-[11px] text-fg-secondary mt-0.5 leading-snug">
                      Demande non retenue. Droit de recours ouvert (7 jours).
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Link href={`/mes-requetes/${rejectedRequest.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs h-7 px-2.5 text-danger-fg"
                    >
                      Consulter
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            )}
          </aside>
        )}

        {/* Bouton de réouverture si masqué (discret, en bas à droite) */}
        {hasActiveStickyNotice && !showStickyNotices && (
          <button
            type="button"
            onClick={() => setShowStickyNotices(true)}
            className="fixed bottom-6 right-6 z-40 px-3 py-1.5 rounded-full bg-accent text-accent-fg text-xs font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          >
            <BellRing size={13} />
            <span>2 actions en attente</span>
          </button>
        )}

        {/* ── 2. PHRASE "MAINTENANT" DYNAMIQUE (Hero Card Verre) ── */}
        <GlassCard variant="glass" withShine={true} className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <StatusBadge variant={heroStatus.badgeVariant} className="text-[11px] py-0.5 font-medium">
                  {heroStatus.badgeText}
                </StatusBadge>
                <span className="text-xs text-fg-muted font-mono">• Actuellement {currentTime}</span>
                <span className="text-xs text-fg-muted">• Bonjour {student?.first_name || 'Kevin'}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-fg tracking-tight font-title">
                {heroStatus.title}
              </h1>

              <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
                {heroStatus.detail}
              </p>

              {heroStatus.nextHint && (
                <p className="text-xs text-accent font-medium pt-0.5 flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>{heroStatus.nextHint}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {heroStatus.slot && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSelectedRoomModal({
                      name: heroStatus.slot.room_name,
                      building: heroStatus.slot.room_building,
                      capacity: heroStatus.slot.room_capacity,
                      slotInfo: heroStatus.slot,
                    })
                  }
                  leftIcon={<MapPin size={15} className="text-accent" />}
                >
                  Localiser la salle ({heroStatus.slot.room_name})
                </Button>
              )}
              <Link href="/nouvelle-requete">
                <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
                  Nouvelle demande
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>

        {/* ── 3. FRISE DE LA JOURNÉE (Signature Visuelle A) ── */}
        <GlassCard variant="glass" withShine={true}>
          <DayTimeline
            currentTimeString={currentTime}
            slots={slots.map((s, idx) => {
              const status: 'past' | 'current' | 'upcoming' =
                s.end_time <= currentTime
                  ? 'past'
                  : s.start_time <= currentTime && currentTime < s.end_time
                  ? 'current'
                  : 'upcoming';

              return {
                id: s.id || String(idx),
                courseName: s.course_name,
                roomName: s.room_name,
                startTime: s.start_time,
                endTime: s.end_time,
                teacherName: s.teacher_name,
                status,
              };
            })}
            onSelectSlot={(slot) => {
              const matchingSlot = slots.find((s) => s.room_name === slot.roomName);
              if (matchingSlot) {
                setSelectedRoomModal({
                  name: matchingSlot.room_name,
                  building: matchingSlot.room_building,
                  capacity: matchingSlot.room_capacity,
                  slotInfo: matchingSlot,
                });
              }
            }}
          />
        </GlassCard>

        {/* ── 4. TON PARCOURS AVEC GRAPHIQUES (Mini-courbe + Anneau + Dernière note) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-fg tracking-tight font-title">
                Ton parcours académique
              </h2>
              <p className="text-xs text-fg-muted">
                {student?.filiere || 'Licence Génie Logiciel'} • Semestre 5
              </p>
            </div>
            <Link
              href="/cursus"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Voir le relevé complet
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Graphique 1 : Mini-courbe de progression de moyenne */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <p className="text-xs text-fg-muted">Évolution de la moyenne</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-fg tabular font-title">
                    {academicStats?.moyenne_generale !== undefined
                      ? `${academicStats.moyenne_generale}`
                      : '15.8'}
                  </span>
                  <span className="text-xs text-fg-muted">/ 20</span>
                  <span className="text-xs text-success-fg font-medium">
                    +1.2 pt vs S4
                  </span>
                </div>
              </div>

              {/* GRAPHIQUE EN AIRE */}
              <div className="pt-3">
                <MiniAreaChart data={evolutionData} height={100} />
              </div>
            </GlassCard>

            {/* Graphique 2 : Anneau de progression des crédits (ProgressRing) */}
            <GlassCard className="flex items-center justify-center p-5">
              <ProgressRing
                value={academicStats?.credits_valides ?? 22}
                total={30}
                label="Crédits S5 validés"
                size={105}
                strokeWidth={9}
              />
            </GlassCard>

            {/* Fiche : Dernière note publiée avec lien contester */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <p className="text-xs text-fg-muted">Dernière note publiée</p>
                {latestGrade ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-fg">
                      {latestGrade.course_name || 'Architectures Cloud (INF302)'}
                    </p>
                    <p className="text-xs text-fg-muted">
                      {latestGrade.course_code || 'INF302'} • {latestGrade.evaluation_type || 'Examen final'}
                    </p>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-bold text-fg tabular font-title">
                        {latestGrade.grade || '18.0'}
                      </span>
                      <span className="text-xs text-fg-muted">/ 20</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-xs text-fg-muted">
                      Pas encore de nouvelle note. On te prévient dès qu&apos;elle est publiée.
                    </p>
                  </div>
                )}
              </div>

              {latestGrade && (
                <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="text-fg-muted">Publiée par la scolarité</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedGradeModal({
                        courseCode: latestGrade.course_code || 'INF302',
                        courseName: latestGrade.course_name || 'Architectures Cloud',
                        teacherName: latestGrade.teacher_name || 'Dr. Samuel Ewane',
                        type: latestGrade.evaluation_type || 'Examen',
                        currentGrade: latestGrade.grade || 18.0,
                        semester: 'S5',
                        academicYear: '2025-2026',
                      })
                    }
                    className="text-accent hover:underline font-medium cursor-pointer"
                  >
                    Contester la note
                  </button>
                </div>
              )}
            </GlassCard>

          </div>
        </div>

        {/* ── 5. SUIVI DES REQUÊTES AVEC FRISE (RequestTimeline intégrée) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-fg tracking-tight font-title">
                Suivi de tes requêtes récentes
              </h2>
              <p className="text-xs text-fg-muted">
                Statut et progression en temps réel de tes démarches
              </p>
            </div>
            <Link
              href="/mes-requetes"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Toutes les requêtes ({requests.length})
              <ArrowRight size={14} />
            </Link>
          </div>

          {requestsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : recentRequests.length === 0 ? (
            <GlassCard>
              <EmptyState
                title="Aucune requête en cours"
                description="Tu n'as déposé aucune demande pour le moment. Besoin d'une attestation ou d'une réclamation ?"
                action={
                  <Link href="/nouvelle-requete">
                    <Button variant="primary" size="sm">
                      Créer une requête
                    </Button>
                  </Link>
                }
              />
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => {
                const isResolved = req.status?.name?.toLowerCase().includes('résol');
                const isRejected = req.status?.name?.toLowerCase().includes('rejet') || req.status?.name?.toLowerCase().includes('refus');
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
                    label: isRejected ? 'Rejetée' : 'Résolue',
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
                  <GlassCard key={req.id} className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/50">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-fg-muted font-medium">
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
                        </div>
                        <Link
                          href={`/mes-requetes/${req.id}`}
                          className="text-sm font-semibold text-fg hover:text-accent transition-colors block"
                        >
                          {req.title}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasCert && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedDoc(req)}
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

                    {/* FRISE SIGNATURE POUR CETTE REQUÊTE */}
                    <div className="pt-3">
                      <RequestTimeline
                        variant="compact"
                        steps={timelineSteps}
                        statusSentence={
                          isResolved
                            ? 'Demande traitée et validée par l’administration.'
                            : isRejected
                            ? 'Demande non validée. Consultez le motif dans les détails.'
                            : 'Dossier actuellement examiné par la scolarité.'
                        }
                      />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 6. RACCOURCIS EXPRESS (Cartes de verre interactives) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link href="/nouvelle-requete" className="block">
            <GlassCard
              interactive={true}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-sm font-semibold text-fg">Nouvelle demande</p>
                <p className="text-xs text-fg-muted mt-0.5">Démarche ou attestation</p>
              </div>
              <ArrowUpRight size={16} className="text-fg-muted" />
            </GlassCard>
          </Link>

          <Link href="/cursus" className="block">
            <GlassCard
              interactive={true}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-sm font-semibold text-fg">Relevé de notes</p>
                <p className="text-xs text-fg-muted mt-0.5">Semestres S1 à S5</p>
              </div>
              <ArrowUpRight size={16} className="text-fg-muted" />
            </GlassCard>
          </Link>

          <Link href="/documents" className="block">
            <GlassCard
              interactive={true}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-sm font-semibold text-fg">Coffre documents</p>
                <p className="text-xs text-fg-muted mt-0.5">Justificatifs certifiés</p>
              </div>
              <ArrowUpRight size={16} className="text-fg-muted" />
            </GlassCard>
          </Link>
        </div>

      </div>

      {/* Modales fonctionnelles */}
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

      {selectedRoomModal && (
        <RoomDetailModal
          isOpen={!!selectedRoomModal}
          onClose={() => setSelectedRoomModal(null)}
          room={selectedRoomModal}
        />
      )}

      {selectedGradeModal && (
        <GradeClaimModal
          isOpen={!!selectedGradeModal}
          onClose={() => setSelectedGradeModal(null)}
          gradeData={selectedGradeModal}
        />
      )}
    </StudentLayout>
  );
}
