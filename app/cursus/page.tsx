'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, Award, BookOpen, AlertCircle, ArrowUpRight,
  ChevronRight, Calendar, User, CheckCircle2, Clock,
  Printer, Download, ShieldCheck, Sparkles, Filter, Info, FileText
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useAcademicGrades } from '@/lib/hooks';

import GradeClaimModal from '@/components/GradeClaimModal';

export default function CursusPage() {
  const router = useRouter();
  const { student, loading: studentLoading } = useStudent();
  const [selectedCycle, setSelectedCycle] = useState<string>('Licence');
  const [selectedSemester, setSelectedSemester] = useState<string>('S5');
  const [selectedGradeClaim, setSelectedGradeClaim] = useState<any | null>(null);

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

  return (
    <StudentLayout>
      <div className="relative min-h-screen pb-16">
        {/* Ambient Warm Sunset Orange Glows */}
        <div className="ambient-glow-orange top-0 left-1/4 -translate-x-1/2 opacity-35 pointer-events-none" />
        <div className="ambient-glow-amber top-40 right-10 opacity-30 pointer-events-none" />

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative z-10">

          {/* ═══════════════════════════════════════════════════════════════
              HERO HEADER GLASSMORPHISM (Cursus & Cycle de Vie)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="glass-badge glass-badge-orange px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
                    <GraduationCap size={14} />
                    Cycle de Vie Universitaire
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    Matricule : {student?.matricule || '22IUC01452'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                  Relevé de Notes & Progression Académique
                </h1>

                <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-2xl leading-relaxed">
                  Consultez vos évaluations de Contrôle Continu (CC), Session Normale (SN), vos moyennes par matière ainsi que les enseignants attitrés. Vous pouvez soumettre directement une réclamation en cas d&apos;anomalie.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="glass-pill px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] transition-transform"
                >
                  <Printer size={15} />
                  Imprimer le bulletin
                </button>
                <Link
                  href="/nouvelle-requete"
                  className="btn-orange font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <AlertCircle size={15} />
                  Faire une réclamation
                </Link>
              </div>
            </div>

            {/* Filter Pills (Cycle & Semestre) */}
            <div className="mt-8 pt-6 border-t border-zinc-200/70 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mr-2 flex items-center gap-1">
                  <Filter size={13} />
                  Cycle :
                </span>
                {['Licence', 'BTS', 'Master'].map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setSelectedCycle(cycle)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedCycle === cycle
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                        : 'glass-card text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {cycle}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mr-2 flex items-center gap-1">
                  <Calendar size={13} />
                  Semestre :
                </span>
                {['S5', 'S6', 'S4', 'S2'].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedSemester === sem
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm border border-indigo-500/30'
                        : 'glass-card text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Semestre {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              ACADEMIC STATS KPI (Glassmorphism Cards)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Moyenne Générale */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Moyenne Semestrielle</span>
                <Award size={18} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                  {stats?.moyenne_generale !== null ? stats?.moyenne_generale : '--'}
                </span>
                <span className="text-sm font-mono text-zinc-400 dark:text-zinc-500">/ 20</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="glass-badge glass-badge-emerald px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Mention {stats?.mention || 'En cours'}
                </span>
              </div>
            </div>

            {/* Crédits ECTS Validés */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Crédits ECTS</span>
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                  {stats?.credits_valides ?? 0}
                </span>
                <span className="text-sm font-mono text-zinc-400 dark:text-zinc-500">/ {stats?.total_credits ?? 0} ECTS</span>
              </div>
              <div className="mt-3 w-full bg-zinc-200 dark:bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.taux_reussite ?? 0}%` }}
                />
              </div>
            </div>

            {/* Matières Validées */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Unités Validées</span>
                <BookOpen size={18} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {stats?.matieres_validees ?? 0}
                </span>
                <span className="text-sm font-mono text-zinc-400 dark:text-zinc-500">sur {stats?.total_matieres ?? 0} UEs</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 font-mono">
                {stats?.matieres_rattrapage ? `${stats.matieres_rattrapage} rattrapage(s)` : '0 rattrapage'}
              </p>
            </div>

            {/* Statut Global */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Validation Cycle</span>
                <ShieldCheck size={18} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                  {stats?.taux_reussite === 100 ? 'Semestre Validé' : 'En délibération'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Année académique 2025-2026
              </p>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TABLEAU DES NOTES PAR MATIÈRE (Obsidian Glass Table)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-white/10 shadow-xs">
            <div className="p-5 sm:p-6 border-b border-zinc-200/70 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
                  Détail des Matières • {selectedCycle} ({selectedSemester})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                  Évaluation continue (CC 30%) • Examen terminal (SN 70%)
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/5">
                <Info size={14} className="text-cyan-600 dark:text-cyan-400" />
                Cliquez sur &quot;Contester&quot; pour ouvrir une requête ciblée
              </div>
            </div>

            {gradesLoading ? (
              <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 font-mono text-sm">
                Chargement des notes en cours...
              </div>
            ) : grades.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">
                  Aucune note enregistrée pour le cycle {selectedCycle} ({selectedSemester}).
                </p>
                <button
                  onClick={() => { setSelectedCycle('Licence'); setSelectedSemester('S5'); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono cursor-pointer"
                >
                  Revenir au Semestre 5 (Licence)
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/70 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 font-semibold">Matière / UE</th>
                      <th className="py-3.5 px-4 font-semibold">Enseignant</th>
                      <th className="py-3.5 px-3 font-semibold text-center">Crédits</th>
                      <th className="py-3.5 px-3 font-semibold text-center">CC /20</th>
                      <th className="py-3.5 px-3 font-semibold text-center">SN /20</th>
                      <th className="py-3.5 px-3 font-semibold text-center">Rattrapage</th>
                      <th className="py-3.5 px-3 font-semibold text-center">Moyenne</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Décision</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70 dark:divide-white/5 font-sans">
                    {grades.map((grade) => {
                      const course = grade.course;
                      const isValidated = grade.status === 'valide';
                      const isPending = grade.status === 'en_attente';
                      const isRattrapage = grade.status === 'rattrapage';

                      return (
                        <tr
                          key={grade.id}
                          className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          {/* Code & Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px] bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                                {course?.code || 'UE'}
                              </span>
                              <div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                                  {course?.name || 'Matière'}
                                </p>
                                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                                  {course?.filiere || 'Génie Logiciel'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Enseignant */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {course?.teacher_name?.[0] || 'P'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
                                  {course?.teacher_name || 'Professeur'}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-mono truncate">
                                  {course?.teacher_office || course?.teacher_title || 'Enseignant IUC'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Crédits */}
                          <td className="py-4 px-3 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                            {course?.credits || 3}
                          </td>

                          {/* CC */}
                          <td className="py-4 px-3 text-center font-mono">
                            {grade.cc !== null ? (
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                {grade.cc.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600">--</span>
                            )}
                          </td>

                          {/* SN */}
                          <td className="py-4 px-3 text-center font-mono">
                            {grade.sn !== null ? (
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                {grade.sn.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600">--</span>
                            )}
                          </td>

                          {/* Rattrapage */}
                          <td className="py-4 px-3 text-center font-mono">
                            {grade.rattrapage != null ? (
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {grade.rattrapage.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600">-</span>
                            )}
                          </td>

                          {/* Moyenne Finale */}
                          <td className="py-4 px-3 text-center font-mono">
                            {grade.moyenne !== null ? (
                              <span className={`text-sm font-extrabold ${
                                grade.moyenne >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                {grade.moyenne.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-xs">En cours</span>
                            )}
                          </td>

                          {/* Décision Badge */}
                          <td className="py-4 px-4 text-center">
                            {isValidated ? (
                              <span className="glass-badge glass-badge-emerald px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                                Validé
                              </span>
                            ) : isRattrapage ? (
                              <span className="glass-badge glass-badge-amber px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                                Rattrapage
                              </span>
                            ) : (
                              <span className="glass-badge glass-badge-indigo px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                                En attente
                              </span>
                            )}
                          </td>

                          {/* Actions (Réclamation directe) */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenGradeClaim(grade, 'CC')}
                                title="Contester la note de Contrôle Continu (CC)"
                                className="glass-pill px-2.5 py-1 rounded-md text-[11px] font-mono hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer"
                              >
                                Recours CC
                              </button>
                              <button
                                onClick={() => handleOpenGradeClaim(grade, 'SN')}
                                title="Contester la note d'Examen (Session Normale)"
                                className="glass-pill px-2.5 py-1 rounded-md text-[11px] font-mono hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer"
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
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              CYCLE DE VIE & MILESTONES (Timeline Cursus)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-white/10">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              Jalons du Cycle de Vie Étudiant • Cursus Académique
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="glass-card rounded-xl p-4 border-l-2 border-l-emerald-500 space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
                  Cycle 1 • BTS / DSEP (Validé)
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Génie Logiciel & Systèmes</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">120 ECTS validés • Mention Bien</p>
                <div className="pt-2 text-[11px] text-zinc-500 font-mono">Promotion 2023-2024</div>
              </div>

              <div className="glass-card rounded-xl p-4 border-l-2 border-l-orange-500 space-y-1">
                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 uppercase tracking-widest font-bold">
                  Cycle 2 • Licence Professionnelle (En cours)
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Ingénierie Logicielle & Cloud</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Semestre 5 validé • Semestre 6 en cours</p>
                <div className="pt-2 text-[11px] text-orange-600 dark:text-orange-400 font-mono flex items-center gap-1">
                  <Clock size={12} /> Examen final prévu en Juin 2026
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 border-l-2 border-l-zinc-300 dark:border-l-zinc-700 space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">
                  Cycle 3 • Master & Cycle Ingénieur (Futur)
                </span>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Architectures Distribuées & IA</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Accessible après soutenance de Licence</p>
                <div className="pt-2 text-[11px] text-zinc-500 font-mono">Admission sur dossier</div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Modal guidée de réclamation de note CC/SN */}
      <GradeClaimModal
        isOpen={!!selectedGradeClaim}
        onClose={() => setSelectedGradeClaim(null)}
        gradeData={selectedGradeClaim}
      />
    </StudentLayout>
  );
}
