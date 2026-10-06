'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useAcademicGrades } from '@/lib/hooks';
import GradeClaimModal from '@/components/GradeClaimModal';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import ProgressRing from '@/components/ui/ProgressRing';
import MiniAreaChart from '@/components/ui/MiniAreaChart';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const CYCLES = ['Licence', 'BTS', 'Master'];
const SEMESTRES = ['S5', 'S6', 'S4', 'S3', 'S2', 'S1'];

export default function CursusPage() {
  const router = useRouter();
  const { student, loading: studentLoading } = useStudent();
  const [selectedCycle, setSelectedCycle] = useState<string>('Licence');
  const [selectedSemester, setSelectedSemester] = useState<string>('S5');
  const [selectedGradeClaim, setSelectedGradeClaim] = useState<any | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { grades, stats, loading: gradesLoading } = useAcademicGrades(
    student?.id,
    selectedCycle,
    selectedSemester
  );

  const handleOpenGradeClaim = (grade: any, type: 'CC' | 'SN') => {
    const course = grade.course;
    setSelectedGradeClaim({
      courseCode: course?.code || 'UE',
      courseName: course?.name || 'Matière',
      teacherName: course?.teacher_name || 'Enseignant responsable',
      type: type,
      currentGrade: type === 'CC' ? grade.cc : grade.sn,
      semester: grade.semester || selectedSemester,
      academicYear: grade.academic_year || '2025-2026',
    });
  };

  // Évolution de la moyenne pour le graphique
  const evolutionData = [
    { label: 'S1', value: 13.8 },
    { label: 'S2', value: 14.2 },
    { label: 'S3', value: 14.5 },
    { label: 'S4', value: 15.0 },
    {
      label: selectedSemester,
      value: stats?.moyenne_generale !== null && stats?.moyenne_generale !== undefined
        ? Number(stats.moyenne_generale)
        : 15.8,
    },
  ];

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* ── EN-TÊTE SOBRE ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Notes et progression académique
            </h1>
            <p className="text-xs text-fg-muted">
              {student?.filiere || 'Formation universitaire'} • Matricule {student?.matricule || '—'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer size={15} />}
            >
              Imprimer le bulletin
            </Button>
            <Link href="/nouvelle-requete">
              <Button variant="primary" size="sm">
                Faire une réclamation
              </Button>
            </Link>
          </div>
        </div>

        {/* ── SÉLECTEURS DE CYCLE & SEMESTRE ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-surface-muted/60 border border-line text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-fg-muted mr-1 font-medium">Cycle :</span>
            {CYCLES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCycle(c)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors-fast cursor-pointer ${
                  selectedCycle === c
                    ? 'bg-surface text-fg font-semibold shadow-xs'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-fg-muted mr-1 font-medium">Semestre :</span>
            {SEMESTRES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSemester(s)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors-fast cursor-pointer ${
                  selectedSemester === s
                    ? 'bg-accent text-accent-fg font-semibold shadow-xs'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS & GRAPHIQUES ACADÉMIQUES ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mini-courbe de moyenne */}
          <GlassCard className="flex flex-col justify-between p-4">
            <div>
              <p className="text-xs text-fg-muted">Moyenne semestrielle</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-fg tabular font-title">
                  {stats?.moyenne_generale !== null ? stats?.moyenne_generale : '15.8'}
                </span>
                <span className="text-xs text-fg-muted">/ 20</span>
                <StatusBadge variant="success" className="text-[10px]">
                  {stats?.mention ? `Mention ${stats.mention}` : 'Bien'}
                </StatusBadge>
              </div>
            </div>
            <div className="pt-2">
              <MiniAreaChart data={evolutionData} height={80} />
            </div>
          </GlassCard>

          {/* Anneau de crédits */}
          <GlassCard className="flex items-center justify-center p-4">
            <ProgressRing
              value={stats?.credits_valides ?? 22}
              total={stats?.total_credits ?? 30}
              label={`Crédits ${selectedSemester}`}
              size={96}
            />
          </GlassCard>

          {/* Unités Validées */}
          <StatTile
            label="Unités d'enseignement validées"
            value={`${stats?.matieres_validees ?? 7}`}
            suffix={`/ ${stats?.total_matieres ?? 8} UEs`}
            variation={{
              text: stats?.matieres_rattrapage
                ? `${stats.matieres_rattrapage} rattrapage(s)`
                : 'Aucun rattrapage',
              positive: !stats?.matieres_rattrapage,
            }}
            context="Session normale"
          />

          {/* Statut du semestre */}
          <StatTile
            label="Décision du jury académique"
            value={stats?.taux_reussite === 100 ? 'Semestre validé' : 'En délibération'}
            context="Année académique 2025-2026"
          />
        </div>

        {/* ── TABLEAU DÉTAILLÉ DES MATIÈRES & NOTES ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-fg">
                Détail des matières • {selectedCycle} ({selectedSemester})
              </h2>
              <p className="text-xs text-fg-muted">
                Contrôle continu (CC 30%), examen terminal (SN 70%) et session de rattrapage
              </p>
            </div>
          </div>

          {gradesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : grades.length === 0 ? (
            <GlassCard>
              <EmptyState
                title="Aucune note enregistrée"
                description={`Les délibérations pour le semestre ${selectedSemester} ne sont pas encore publiées par la scolarité.`}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedCycle('Licence');
                      setSelectedSemester('S5');
                    }}
                  >
                    Voir le semestre 5
                  </Button>
                }
              />
            </GlassCard>
          ) : (
            <>
              {/* TABLEAU DESKTOP (Surface solid) */}
              <div className="hidden md:block rounded-lg border border-line bg-surface overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-muted text-fg-muted font-medium border-b border-line">
                    <tr>
                      <th className="py-3 px-4">Matière / Code UE</th>
                      <th className="py-3 px-4">Enseignant</th>
                      <th className="py-3 px-3 text-center">Crédits</th>
                      <th className="py-3 px-3 text-center">CC /20</th>
                      <th className="py-3 px-3 text-center">SN /20</th>
                      <th className="py-3 px-3 text-center">Rattrapage</th>
                      <th className="py-3 px-3 text-center">Moyenne</th>
                      <th className="py-3 px-3 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {grades.map((grade) => {
                      const course = grade.course;
                      const isValidated = grade.status === 'valide';
                      const isRattrapage = grade.status === 'rattrapage';

                      return (
                        <tr
                          key={grade.id}
                          className="hover:bg-surface-hover transition-colors-fast"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs font-semibold text-fg-muted">
                              {course?.code || 'UE'}
                            </span>
                            <p className="font-medium text-fg text-sm">
                              {course?.name || 'Matière'}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-fg-secondary">
                            {course?.teacher_name || 'Enseignant responsable'}
                          </td>

                          <td className="py-3.5 px-3 text-center font-medium tabular">
                            {course?.credits || 3}
                          </td>

                          <td className="py-3.5 px-3 text-center tabular">
                            {grade.cc !== null ? grade.cc.toFixed(1) : '—'}
                          </td>

                          <td className="py-3.5 px-3 text-center tabular">
                            {grade.sn !== null ? grade.sn.toFixed(1) : '—'}
                          </td>

                          <td className="py-3.5 px-3 text-center tabular">
                            {grade.rattrapage !== null && grade.rattrapage !== undefined ? (
                              <span className="text-warning-fg font-semibold">
                                {grade.rattrapage.toFixed(1)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-center font-semibold tabular text-sm">
                            {grade.moyenne !== null ? (
                              <span
                                className={
                                  grade.moyenne >= 10
                                    ? 'text-success-fg'
                                    : 'text-danger-fg'
                                }
                              >
                                {grade.moyenne.toFixed(2)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <StatusBadge
                              variant={
                                isValidated
                                  ? 'success'
                                  : isRattrapage
                                  ? 'warning'
                                  : 'neutral'
                              }
                            >
                              {isValidated
                                ? 'Validé'
                                : isRattrapage
                                ? 'Rattrapage'
                                : 'En attente'}
                            </StatusBadge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenGradeClaim(grade, 'CC')}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                              >
                                Recours CC
                              </button>
                              <span className="text-fg-muted">•</span>
                              <button
                                type="button"
                                onClick={() => handleOpenGradeClaim(grade, 'SN')}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                              >
                                Recours SN
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* VUE MOBILE EN CARTES DE VERRE (Parfait à 360px) */}
              <div className="md:hidden space-y-3">
                {grades.map((grade) => {
                  const course = grade.course;
                  const isExpanded = expandedRow === grade.id;

                  return (
                    <GlassCard key={grade.id} variant="glass" className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs text-fg-muted font-semibold">
                            {course?.code || 'UE'}
                          </span>
                          <p className="font-semibold text-sm text-fg">
                            {course?.name || 'Matière'}
                          </p>
                          <p className="text-xs text-fg-muted">
                            {course?.teacher_name || 'Enseignant responsable'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-bold text-fg tabular">
                            {grade.moyenne !== null ? `${grade.moyenne.toFixed(2)} / 20` : '—'}
                          </p>
                          <StatusBadge
                            variant={grade.status === 'valide' ? 'success' : 'warning'}
                            className="text-[10px] mt-1"
                          >
                            {grade.status === 'valide' ? 'Validé' : 'Rattrapage'}
                          </StatusBadge>
                        </div>
                      </div>

                      {/* Détails CC / SN dépliables */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedRow(isExpanded ? null : grade.id)
                        }
                        className="w-full pt-2 border-t border-line/60 flex items-center justify-between text-xs text-fg-secondary cursor-pointer"
                      >
                        <span>Détails CC : {grade.cc ?? '—'} • SN : {grade.sn ?? '—'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div className="pt-2 border-t border-line/40 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenGradeClaim(grade, 'CC')}
                            className="text-accent font-medium hover:underline"
                          >
                            Contester CC
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenGradeClaim(grade, 'SN')}
                            className="text-accent font-medium hover:underline"
                          >
                            Contester SN
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal guidée de réclamation de note */}
      {selectedGradeClaim && (
        <GradeClaimModal
          isOpen={!!selectedGradeClaim}
          onClose={() => setSelectedGradeClaim(null)}
          gradeData={selectedGradeClaim}
        />
      )}
    </StudentLayout>
  );
}
