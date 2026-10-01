'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Clock, CheckCircle, ArrowRight,
  Zap, Calendar, FileCheck, ExternalLink, Printer,
  ShieldCheck, Activity, Search, GraduationCap, CalendarDays,
  MapPin, Award, BookOpen, AlertCircle, ArrowUpRight,
  CheckCircle2, Sparkles, Lightbulb, UserCheck
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useStudentRequests, useAcademicGrades, useTimetable } from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
import RoomDetailModal from '@/components/RoomDetailModal';
import GradeClaimModal from '@/components/GradeClaimModal';

export default function DashboardPage() {
  const { student, loading: studentLoading } = useStudent();
  const { requests, stats, loading: requestsLoading } = useStudentRequests(student?.id);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [selectedRoomModal, setSelectedRoomModal] = useState<any | null>(null);
  const [selectedGradeModal, setSelectedGradeModal] = useState<any | null>(null);

  const roleCode = student?.role_code || 'etudiant';
  const isTeacher = roleCode === 'enseignant';

  // Récupérer les notes académiques si étudiant
  const { grades, stats: academicStats } = useAcademicGrades(student?.id, 'Licence', 'S5');

  // Récupérer le planning / salles
  const { slots } = useTimetable({
    teacherId: isTeacher ? student?.id : undefined,
  });

  const nextSlot = slots[0] || null;

  const roleTitle =
    roleCode === 'enseignant'
      ? 'Espace Enseignant & Chercheur'
      : roleCode === 'personnel'
      ? 'Espace Personnel Administratif'
      : 'Cycle Universitaire & Hub Étudiant';

  const roleSubtitle =
    roleCode === 'enseignant'
      ? `${student?.fonction || 'Corps Professoral'} • Campus Universitaire`
      : roleCode === 'personnel'
      ? `${student?.fonction || 'Administration'} • Campus Universitaire`
      : `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'}) • Année ${student?.annee_academique || '2025-2026'}`;

  const recentRequests = requests.slice(0, 5);

  const avatarUrl =
    student?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80';

  return (
    <StudentLayout>
      <div className="relative min-h-screen pb-16">
        {/* Ambient Warm Sunset Orange Glows */}
        <div className="ambient-glow-orange top-0 left-1/3 -translate-x-1/2 opacity-40 pointer-events-none" />
        <div className="ambient-glow-amber top-48 right-10 opacity-30 pointer-events-none" />

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* ═══════════════════════════════════════════════════════════════
              HERO BANNER GLASSMORPHISM WITH ORANGE SUNSET TOUCH
              ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════
              HERO BANNER ORANGE SUNSET GRADIENT & CIRCULAR CURVE
              Design dynamique avec photo étudiant, courbes organiques et actions rapides
              ═══════════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-[2.25rem] p-6 sm:p-8 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 dark:from-orange-600 dark:via-amber-600 dark:to-orange-950 text-white shadow-xl shadow-orange-500/15 border border-orange-400/30">
            
            {/* Formes circulaires décoratives en arrière-plan */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/20 bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute top-1/2 -right-8 w-44 h-44 rounded-full border border-white/15 bg-amber-400/20 blur-lg pointer-events-none" />
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full border border-white/10 bg-orange-600/30 blur-2xl pointer-events-none" />
            <div className="absolute top-4 left-1/3 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Profile Spotlight: Photo circulaire + Infos Étudiant */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                
                {/* Photo de l'étudiant avec ring circulaire et badge statut */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-white/25 backdrop-blur-md ring-4 ring-white/30 shadow-2xl transition-transform hover:scale-105 duration-200">
                    <img
                      src={avatarUrl}
                      alt={student?.first_name || 'Étudiant'}
                      className="w-full h-full rounded-full object-cover shadow-inner"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Status Indicator (Pulse) */}
                  <span
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-md ring-2 ring-emerald-300 animate-pulse"
                    title="Compte Actif"
                  />
                </div>

                {/* Typography & Identité */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-1.5 shadow-xs">
                      <Sparkles size={11} className="text-amber-200" />
                      {roleTitle}
                    </span>
                    <span className="text-white/60">•</span>
                    <span className="text-xs text-white/90 font-mono">
                      {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                    Bonjour, {student?.first_name || 'Kevin'} {student?.last_name || 'Fotso'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/90 font-medium">
                    <span>{roleSubtitle}</span>
                    <span className="text-white/50">•</span>
                    <span className="font-mono text-white/80 bg-black/15 px-2 py-0.5 rounded-md text-[11px]">
                      Matricule : {student?.matricule || '22G00142'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons Glassmorphism sur le Dégradé Orange */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                <Link
                  href="/nouvelle-requete"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-orange-600 hover:bg-orange-50 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  Nouvelle demande
                </Link>

                <Link
                  href="/cursus"
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 shadow-xs hover:scale-105 transition-all flex items-center gap-2"
                >
                  <GraduationCap size={15} className="text-white" />
                  Mon Cursus & Notes
                </Link>

                <Link
                  href="/planner"
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 shadow-xs hover:scale-105 transition-all flex items-center gap-2"
                >
                  <CalendarDays size={15} className="text-white" />
                  {isTeacher ? 'Mon Planning' : 'Emploi du Temps'}
                </Link>
              </div>

            </div>

            {/* Micro KPI Bar Intégrée en Bas de la Bannière */}
            <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 bg-black/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
                <Award size={15} className="text-amber-200 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[10px] uppercase font-mono text-white/70">Moyenne Générale</p>
                  <p className="text-xs font-bold text-white font-mono">
                    {academicStats?.moyenne_generale ?? '15.85'} / 20 • {academicStats?.mention || 'Très Bien'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-black/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
                <CheckCircle2 size={15} className="text-emerald-300 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[10px] uppercase font-mono text-white/70">Crédits ECTS</p>
                  <p className="text-xs font-bold text-white font-mono">
                    {academicStats?.credits_valides ?? 22} / 22 Validés (100%)
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2.5 bg-black/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
                <UserCheck size={15} className="text-cyan-200 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[10px] uppercase font-mono text-white/70">Statut Dossier</p>
                  <p className="text-xs font-bold text-white">Scolarité Validée & En Règle</p>
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════
              DUAL SPOTLIGHT WIDGETS : ACADEMIC LIFE + TIMETABLE / ROOM
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Widget 1: Cursus & Notes Évaluation */}
            <div className="glass-card rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
                    <Award size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {isTeacher ? 'Enseignements Attribués & Notes' : 'Cycle Académique • Semestre 5'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      {isTeacher ? 'Dr. Samuel Ewane • Génie Logiciel' : 'Contrôles Continus (CC) & Examens (SN)'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/cursus"
                  className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  Bulletin complet
                  <ArrowRight size={13} />
                </Link>
              </div>

              {!isTeacher ? (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Moyenne</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                      {academicStats?.moyenne_generale ?? '15.85'}<span className="text-xs text-zinc-400 dark:text-zinc-500">/20</span>
                    </p>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold block">
                      Mention {academicStats?.mention || 'Très Bien'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Crédits</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                      {academicStats?.credits_valides ?? 22}<span className="text-xs text-zinc-400 dark:text-zinc-500">/22</span>
                    </p>
                    <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold block">
                      100% Validés
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Dernière Note</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      18.0<span className="text-xs text-zinc-400 dark:text-zinc-500">/20</span>
                    </p>
                    <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate block">
                      INF302 (Web & Next)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-2">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    <strong className="text-zinc-900 dark:text-white">3 Unités d&apos;Enseignement</strong> sous votre responsabilité pédagogique ce semestre (Architectures Cloud, Web Moderne, IA).
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Les procès-verbaux de notes de CC et de SN sont synchronisés avec la scolarité.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 text-zinc-500 dark:text-zinc-400 font-mono">
                <span>Dernière mise à jour par la Scolarité</span>
                <button
                  type="button"
                  onClick={() => setSelectedGradeModal({
                    courseCode: 'INF302',
                    courseName: 'Développement Web Moderne (Next.js)',
                    teacherName: 'Dr. Samuel Ewane',
                    type: 'CC',
                    currentGrade: 18.0,
                    semester: 'S5',
                    academicYear: '2025-2026'
                  })}
                  className="text-orange-600 dark:text-orange-400 hover:underline font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Lightbulb size={13} className="text-orange-500 shrink-0" />
                  <span>Contester une note</span>
                </button>
              </div>
            </div>

            {/* Widget 2: Prochaine séance & Salle assignée */}
            <div className="glass-card rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {isTeacher ? 'Votre Prochain Cours & Salle' : 'Prochain Cours Programmé'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Emploi du temps officiel • Campus Principal
                    </p>
                  </div>
                </div>

                <Link
                  href="/planner"
                  className="text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 flex items-center gap-1"
                >
                  Voir la grille
                  <ArrowRight size={13} />
                </Link>
              </div>

              {nextSlot ? (
                <div
                  onClick={() => setSelectedRoomModal({
                    name: nextSlot.room_name,
                    building: nextSlot.room_building,
                    capacity: nextSlot.room_capacity,
                    slotInfo: nextSlot
                  })}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 hover:border-orange-500/50 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/80 cursor-pointer group transition-all space-y-2.5 shadow-sm"
                  title="Cliquer pour voir la fiche logistique de la salle"
                >
                  <div className="flex items-center justify-between">
                    <span className="glass-badge glass-badge-orange px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                      {nextSlot.day_of_week} • {nextSlot.start_time} - {nextSlot.end_time}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">
                      {nextSlot.session_type}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {nextSlot.course_name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      {nextSlot.filiere} ({nextSlot.niveau}) • Prof : {nextSlot.teacher_name}
                    </p>
                  </div>

                  {/* Salle en Évidence */}
                  <div className="pt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-extrabold text-sm">
                      <MapPin size={16} className="text-orange-500 shrink-0" />
                      <span>{nextSlot.room_name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400 font-semibold group-hover:underline inline-flex items-center gap-1">
                      <Search size={12} className="text-orange-500 shrink-0" />
                      <span>Inspecter la salle</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-center text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                  Aucun cours immédiat programmé.
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 text-zinc-500 dark:text-zinc-400 font-mono">
                <span>Besoin d&apos;un vidéoprojecteur ou clim ?</span>
                <button
                  type="button"
                  onClick={() => nextSlot && setSelectedRoomModal({
                    name: nextSlot.room_name,
                    building: nextSlot.room_building,
                    capacity: nextSlot.room_capacity,
                    slotInfo: nextSlot
                  })}
                  className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                >
                  Demande de permutation
                </button>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════
              KPI METRICS REQUÊTES (Épuré Glassmorphism)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card rounded-2xl p-5 shadow-xs border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Requêtes</span>
                <FileText size={16} className="text-zinc-400" />
              </div>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
                {stats.total}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Historique complet archivé
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Résolues & Certifiées</span>
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
                  {stats.resolved}
                </p>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 glass-badge glass-badge-emerald px-1.5 py-0.5 rounded">
                  {stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '100%'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Documents avec signature QR
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">En Instruction</span>
                <Clock size={16} className="text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
                {stats.in_progress}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Instruction par les services
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs border border-zinc-200/80 dark:border-white/10">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">En Attente</span>
                <Activity size={16} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
                {stats.pending}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Routage automatique SLA
              </p>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════
              MAIN 2-COLUMN SECTION (Demandes & Express Actions)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne gauche (2/3) : Demandes récentes */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                    Demandes & Réclamations Récentes
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Consultez vos dossiers en cours et téléchargez vos justificatifs certifiés
                  </p>
                </div>

                <Link
                  href="/mes-requetes"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                >
                  Voir tout ({requests.length})
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-zinc-200/70 dark:divide-white/5 shadow-sm border border-zinc-200/80 dark:border-white/10">
                {recentRequests.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500 space-y-2">
                    <FileText size={32} className="mx-auto text-zinc-400 dark:text-zinc-600" />
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">Aucune demande enregistrée</p>
                    <p className="text-xs text-zinc-500">
                      Créez votre première requête pour suivre son traitement en temps réel.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/nouvelle-requete"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl hover:bg-black dark:hover:bg-zinc-200 transition-colors"
                      >
                        <Plus size={14} /> Créer une requête
                      </Link>
                    </div>
                  </div>
                ) : (
                  recentRequests.map((req) => {
                    const isResolved = req.status?.name === 'Résolue';
                    const hasCert = (req as any).metadata?.document_code;

                    return (
                      <div
                        key={req.id}
                        className="p-4 hover:bg-zinc-100/60 dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                              {req.reference}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isResolved
                                ? 'glass-badge glass-badge-emerald'
                                : 'glass-badge text-zinc-700 dark:text-zinc-300'
                            }`}>
                              {req.status?.name || 'En cours'}
                            </span>
                            {hasCert && (
                              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-300 glass-badge glass-badge-cyan px-2 py-0.5 rounded flex items-center gap-1">
                                <Zap size={10} />
                                Certifié
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/mes-requetes/${req.id}`}
                            className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-white line-clamp-1 transition-colors"
                          >
                            {req.title}
                          </Link>

                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                            <span>{req.category?.name || 'Catégorie'}</span>
                            <span>•</span>
                            <span>
                              {new Date(req.submitted_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasCert && (
                            <button
                              type="button"
                              onClick={() => setSelectedDoc(req)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 glass-pill text-zinc-800 dark:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Consulter le document certifié"
                            >
                              <Printer size={13} />
                              Document
                            </button>
                          )}
                          <Link
                            href={`/mes-requetes/${req.id}`}
                            className="px-3 py-1.5 glass-card text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Détails
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Colonne droite (1/3) : Accès rapide & Contrôle de service */}
            <div className="space-y-6">
              
              {/* Boîte d'action rapide */}
              <div className="glass-panel rounded-2xl p-5 shadow-xs border border-zinc-200/80 dark:border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500 dark:text-amber-400" />
                  Délivrance Express
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Attestations officielles et demandes académiques certifiées avec scellement numérique immédiat.
                </p>

                <div className="space-y-2">
                  <Link
                    href="/nouvelle-requete"
                    className="w-full flex items-center justify-between p-3 rounded-xl glass-card hover:border-zinc-300 dark:hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                        <Zap size={14} className="text-amber-500" />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">
                          {roleCode === 'enseignant'
                            ? 'Attestation de travail & vacation'
                            : roleCode === 'personnel'
                            ? 'Attestation de prise de service'
                            : 'Attestation de scolarité officielle'}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Délivrance immédiate &lt; 3s</p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    href="/cursus"
                    className="w-full flex items-center justify-between p-3 rounded-xl glass-card hover:border-zinc-300 dark:hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                        <FileText size={14} className="text-indigo-500" />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">
                          {roleCode === 'enseignant'
                            ? 'Permutation de salle de cours'
                            : roleCode === 'personnel'
                            ? 'Fournitures de bureau & matériel'
                            : 'Contestation de Note CC / SN'}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Aiguillage pédagogique SLA</p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>

              {/* Normes de vérification */}
              <div className="glass-card rounded-2xl p-5 border border-zinc-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500 dark:text-emerald-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-zinc-900 dark:text-white">
                    Sécurité Cryptographique QR
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tout document officiel dispose d&apos;une empreinte vérifiable en ligne par les consulats et les universités partenaires.
                </p>
                <div className="pt-1">
                  <Link
                    href="/documents"
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    Accéder au coffre-fort numérique
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Modal du document officiel certifié */}
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
              roleCode === 'enseignant'
                ? (student?.fonction || 'Enseignant - IUC')
                : roleCode === 'personnel'
                ? (student?.fonction || 'Personnel Administratif')
                : `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`,
            academicYear: student?.annee_academique || '2025-2026',
          }}
        />
      )}

      {/* Modal d'inspection logistique de salle avec permutation */}
      <RoomDetailModal
        isOpen={!!selectedRoomModal}
        onClose={() => setSelectedRoomModal(null)}
        room={selectedRoomModal}
      />

      {/* Modal guidée de réclamation de note CC/SN */}
      <GradeClaimModal
        isOpen={!!selectedGradeModal}
        onClose={() => setSelectedGradeModal(null)}
        gradeData={selectedGradeModal}
      />
    </StudentLayout>
  );
}
