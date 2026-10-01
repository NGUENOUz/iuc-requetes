'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays, Clock, MapPin, Users, Video, Wifi, Wind,
  ChevronLeft, ChevronRight, Filter, AlertCircle, ArrowUpRight,
  Printer, Building, CheckCircle2,
  Calendar as CalendarIcon, BookOpen, Layers, Search, Sparkles
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useTimetable } from '@/lib/hooks';
import RoomDetailModal from '@/components/RoomDetailModal';

const DAY_NAMES_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;
const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

type ViewMode = 'calendar' | 'week' | 'rooms';

export default function PlannerPage() {
  const { student } = useStudent();

  // Navigation par date
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('auto');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedRoomModal, setSelectedRoomModal] = useState<any | null>(null);

  const isTeacher = student?.role_code === 'enseignant';

  // Si l'utilisateur est un prof, filtrer par défaut sur ses cours
  const effectiveTeacherId =
    selectedTeacherFilter === 'all'
      ? undefined
      : selectedTeacherFilter !== 'auto'
      ? selectedTeacherFilter
      : isTeacher
      ? student?.id
      : undefined;

  const { slots, rooms, loading } = useTimetable({
    teacherId: effectiveTeacherId,
  });

  // Calcul du jour de la semaine sélectionné (ex: "Jeudi")
  const selectedDayName = useMemo(() => {
    return DAY_NAMES_FR[selectedDate.getDay()];
  }, [selectedDate]);

  // Filtrage des cours pour le jour sélectionné
  const daySlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchDay = slot.day_of_week === selectedDayName;
      const matchType =
        selectedTypeFilter === 'all'
          ? true
          : slot.session_type?.toLowerCase().includes(selectedTypeFilter.toLowerCase());
      return matchDay && matchType;
    });
  }, [slots, selectedDayName, selectedTypeFilter]);

  // Tous les cours de la semaine filtrés par type
  const filteredAllSlots = useMemo(() => {
    if (selectedTypeFilter === 'all') return slots;
    return slots.filter((s) => s.session_type?.toLowerCase().includes(selectedTypeFilter.toLowerCase()));
  }, [slots, selectedTypeFilter]);

  // Calendrier mensuel : calcul des cases
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Début de semaine le Lundi (1 = Lun, 0 = Dim)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dayOfWeekName: string;
      slotsCount: number;
    }> = [];

    // Jours du mois précédent pour combler la première ligne
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dayName = DAY_NAMES_FR[d.getDay()];
      const count = slots.filter((s) => s.day_of_week === dayName).length;
      days.push({
        date: d,
        isCurrentMonth: false,
        dayOfWeekName: dayName,
        slotsCount: count,
      });
    }

    // Jours du mois courant
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const d = new Date(year, month, day);
      const dayName = DAY_NAMES_FR[d.getDay()];
      const count = slots.filter((s) => s.day_of_week === dayName).length;
      days.push({
        date: d,
        isCurrentMonth: true,
        dayOfWeekName: dayName,
        slotsCount: count,
      });
    }

    // Jours du mois suivant pour compléter à un multiple de 7 (max 42 cases)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dayName = DAY_NAMES_FR[d.getDay()];
      const count = slots.filter((s) => s.day_of_week === dayName).length;
      days.push({
        date: d,
        isCurrentMonth: false,
        dayOfWeekName: dayName,
        slotsCount: count,
      });
    }

    return days;
  }, [viewMonth, slots]);

  const handlePrevMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonth(today);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  const handleOpenRoomModal = (slot: any) => {
    setSelectedRoomModal({
      name: slot.room_name,
      building: slot.room_building,
      capacity: slot.room_capacity,
      slotInfo: slot,
    });
  };

  return (
    <StudentLayout>
      <div className="relative min-h-screen pb-16">
        {/* Glows d'ambiance coucher de soleil */}
        <div className="ambient-glow-orange top-0 left-1/3 -translate-x-1/2 opacity-30 pointer-events-none" />
        <div className="ambient-glow-amber top-48 right-12 opacity-25 pointer-events-none" />

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative z-10">

          {/* ═══════════════════════════════════════════════════════════════
              HERO HEADER GLASSMORPHISM & CONTRÔLES
              ═══════════════════════════════════════════════════════════════ */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-zinc-200/80 dark:border-white/10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="glass-badge glass-badge-orange px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    Calendrier Académique & Salles
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {isTeacher ? 'Programmation Enseignant' : 'Emploi du Temps Étudiant'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                  {isTeacher ? 'Mon Calendrier & Attribution des Salles' : 'Planning des Cours & Calendrier des Salles'}
                </h1>

                <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-2xl leading-relaxed">
                  Sélectionnez une date dans le calendrier pour consulter le programme complet de la journée, les professeurs responsables, les salles assignées et leurs équipements logistiques.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="glass-pill px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] transition-transform"
                >
                  <Printer size={15} />
                  Imprimer
                </button>
                <Link
                  href="/nouvelle-requete"
                  className="btn-orange font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <AlertCircle size={15} />
                  Permutation / Salle
                </Link>
              </div>
            </div>

            {/* View Mode Switcher & Filters */}
            <div className="mt-8 pt-6 border-t border-zinc-200/70 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Mode Tabs */}
              <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'calendar'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <CalendarIcon size={14} />
                  Calendrier & Journée
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'week'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Layers size={14} />
                  Grille Semaine
                </button>
                <button
                  onClick={() => setViewMode('rooms')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'rooms'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Building size={14} />
                  Parc des Salles ({rooms.length})
                </button>
              </div>

              {/* Filters dropdowns */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Type Filter */}
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="glass-input text-xs px-3 py-1.5 rounded-lg font-mono cursor-pointer"
                >
                  <option value="all">Tous types (CM, TP, TD)</option>
                  <option value="CM">Cours Magistraux (CM)</option>
                  <option value="TP">Travaux Pratiques (TP)</option>
                  <option value="TD">Travaux Dirigés (TD)</option>
                </select>

                {/* Teacher Selector Filter */}
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="glass-input text-xs px-3 py-1.5 rounded-lg font-mono cursor-pointer"
                >
                  <option value="auto">
                    {isTeacher ? 'Mes cours uniquement' : 'Tous les enseignants'}
                  </option>
                  <option value="all">Toutes programmations</option>
                  <option value="a1a2c3d4-0007-4000-8000-000000000007">Dr. Samuel Ewane (Cloud & Web)</option>
                  <option value="a1a2c3d4-0008-4000-8000-000000000008">Mme Nicole Bilong (Bases de Données)</option>
                  <option value="ens-ext-002">Dr. Boris Kamtchueng (Cybersécurité)</option>
                </select>
              </div>

            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              VUE 1 : CALENDRIER INTERACTIF & PROGRAMME DU JOUR SÉLECTIONNÉ
              ═══════════════════════════════════════════════════════════════ */}
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Calendrier Mensuel (5 colonnes sur desktop) */}
              <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10 space-y-4">
                
                {/* Header Calendrier avec mois et boutons de navigation */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 dark:border-white/10">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white capitalize">
                      {MONTH_NAMES_FR[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                    </h2>
                    <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      Cliquez sur une date pour voir le programme
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleToday}
                      className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Aujourd&apos;hui
                    </button>
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      title="Mois précédent"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      title="Mois suivant"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* En-tête des jours de semaine (Lun - Dim) */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-zinc-500 dark:text-zinc-400 font-bold pb-1">
                  <div>Lun</div>
                  <div>Mar</div>
                  <div>Mer</div>
                  <div>Jeu</div>
                  <div>Ven</div>
                  <div>Sam</div>
                  <div>Dim</div>
                </div>

                {/* Grille des jours */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((item, idx) => {
                    const isSelected = isSameDay(item.date, selectedDate);
                    const isCurrentDay = isToday(item.date);
                    const hasClasses = item.slotsCount > 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(item.date)}
                        className={`
                          min-h-[52px] rounded-xl p-1.5 flex flex-col items-center justify-between text-xs transition-all cursor-pointer relative group
                          ${!item.isCurrentMonth ? 'opacity-35' : 'opacity-100'}
                          ${isSelected
                            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold shadow-md ring-2 ring-orange-500/30'
                            : isCurrentDay
                            ? 'bg-orange-500/10 border border-orange-500/40 text-orange-600 dark:text-orange-400 font-bold'
                            : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200 border border-transparent'
                          }
                        `}
                      >
                        <span className="text-xs font-mono">{item.date.getDate()}</span>

                        {/* Pastille indiquant le nombre de cours */}
                        {hasClasses && (
                          <div className="flex items-center gap-0.5 mt-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-orange-500'
                              }`}
                            />
                            {item.slotsCount > 1 && (
                              <span className={`text-[9px] font-mono leading-none ${isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {item.slotsCount}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Légende du calendrier */}
                <div className="pt-3 border-t border-zinc-200/70 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Séances programmées</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-orange-500 bg-orange-500/20" />
                    <span>Aujourd&apos;hui</span>
                  </div>
                </div>

              </div>

              {/* Programme de la journée sélectionnée (7 colonnes sur desktop) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Header de la journée sélectionnée */}
                <div className="glass-panel rounded-2xl p-5 border border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {selectedDayName}
                      </span>
                      {isToday(selectedDate) && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Aujourd&apos;hui
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white capitalize">
                      {selectedDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h2>
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200">
                      {daySlots.length} {daySlots.length > 1 ? 'séances' : 'séance'}
                    </span>
                  </div>
                </div>

                {/* Liste des cours pour ce jour */}
                {loading ? (
                  <div className="glass-card rounded-2xl p-12 text-center text-zinc-500 font-mono text-sm">
                    Chargement du programme horaire...
                  </div>
                ) : daySlots.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-zinc-200/80 dark:border-white/10">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
                      <CalendarDays size={22} />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                      Aucun cours programmé ce {selectedDayName.toLowerCase()}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      Il n&apos;y a pas de séance enregistrée sur ce créneau pour les filtres actifs. Choisissez un autre jour dans le calendrier ci-contre.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedTypeFilter('all');
                        setSelectedTeacherFilter('all');
                      }}
                      className="text-xs font-mono text-orange-600 dark:text-orange-400 hover:underline pt-2 inline-block cursor-pointer"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {daySlots.map((slot) => {
                      const isAmphi = slot.room_name?.toLowerCase().includes('amphi');
                      const isLab =
                        slot.room_name?.toLowerCase().includes('lab') ||
                        slot.room_name?.toLowerCase().includes('info');

                      return (
                        <div
                          key={slot.id}
                          className="glass-card rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10 hover:border-orange-500/40 transition-all shadow-xs space-y-5 group"
                        >
                          {/* Haut : Horaire, Code Matière, Type */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-500/20">
                                {slot.course_code}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {slot.session_type}
                              </span>
                            </div>

                            {/* Heure du cours */}
                            <span className="text-xs font-mono text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-zinc-200 dark:border-white/5">
                              <Clock size={13} className="text-orange-500" />
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>

                          {/* Titre du cours */}
                          <div>
                            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {slot.course_name}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                              <Users size={13} className="text-zinc-400 shrink-0" />
                              <span>Filière : {slot.filiere} ({slot.niveau})</span>
                            </p>
                          </div>

                          {/* 2 Colonnes : Enseignant & Salle Assignée */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            
                            {/* Colonne Professeur */}
                            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/5 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0">
                                {slot.teacher_name ? slot.teacher_name.charAt(0) : 'P'}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                                  Enseignant Responsable
                                </span>
                                <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                  {slot.teacher_name}
                                </p>
                              </div>
                            </div>

                            {/* Colonne Salle Interactive */}
                            <div
                              onClick={() => handleOpenRoomModal(slot)}
                              className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/5 hover:border-orange-500/40 cursor-pointer transition-all group/room flex items-center justify-between gap-3"
                              title="Cliquer pour afficher la fiche logistique de la salle"
                            >
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600 dark:text-orange-400 font-bold block">
                                  Salle Assignée
                                </span>
                                <p className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5 group-hover/room:text-orange-500 transition-colors truncate">
                                  <MapPin size={14} className="text-orange-500 shrink-0" />
                                  {slot.room_name}
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                                  {slot.room_building || 'Campus Principal'}
                                </p>
                              </div>

                              <span className="glass-badge px-2 py-0.5 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-300 shrink-0">
                                {slot.room_capacity || 60} pl.
                              </span>
                            </div>

                          </div>

                          {/* Équipements de la salle & Bouton de permutation */}
                          <div className="pt-3 border-t border-zinc-200/70 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isAmphi && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-mono">
                                  <Video size={10} className="text-orange-500" /> Vidéo 4K
                                </span>
                              )}
                              {isLab && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-mono">
                                  <Wifi size={10} className="text-amber-500" /> Postes PC
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-mono">
                                <Wind size={10} className="text-emerald-500" /> Climatisation
                              </span>
                            </div>

                            <button
                              onClick={() => handleOpenRoomModal(slot)}
                              className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-300 flex items-center gap-1.5 transition-colors cursor-pointer group/btn"
                            >
                              <AlertCircle size={13} className="text-orange-500" />
                              <span>Inspecter / Permuter</span>
                              <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              VUE 2 : GRILLE HEBDOMADAIRE COMPLÈTE
              ═══════════════════════════════════════════════════════════════ */}
          {viewMode === 'week' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-orange-500" />
                  Grille Hebdomadaire Complète ({filteredAllSlots.length} séances)
                </h2>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  Vue Panoramique • Tous les jours
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAllSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="glass-card rounded-2xl p-5 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 group hover:border-orange-500/40 transition-all shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="glass-badge glass-badge-orange px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5">
                          <CalendarIcon size={12} />
                          {slot.day_of_week}
                        </span>

                        <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1 bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-white/5">
                          <Clock size={12} className="text-orange-500" />
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-500/20">
                            {slot.course_code}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            {slot.session_type}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors leading-snug">
                          {slot.course_name}
                        </h3>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <p className="flex items-center gap-2">
                          <Users size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>{slot.filiere} ({slot.niveau})</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[9px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                            P
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200 font-medium">{slot.teacher_name}</span>
                        </p>
                      </div>

                      <div
                        onClick={() => handleOpenRoomModal(slot)}
                        className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/70 dark:border-white/10 hover:border-orange-500/40 cursor-pointer transition-all space-y-1 group/room"
                        title="Cliquer pour afficher la fiche de la salle"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600 dark:text-orange-400 font-bold block">
                              Salle Assignée
                            </span>
                            <p className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1 mt-0.5 group-hover/room:text-orange-500 transition-colors">
                              <MapPin size={14} className="text-orange-500 shrink-0" />
                              {slot.room_name}
                            </p>
                          </div>
                          <span className="glass-badge px-2 py-0.5 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                            {slot.room_capacity || 50} pl.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/70 dark:border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenRoomModal(slot)}
                        className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-300 flex items-center gap-1.5 transition-colors cursor-pointer group/btn"
                      >
                        <AlertCircle size={13} className="text-orange-500" />
                        <span>Inspecter / Permuter</span>
                        <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>

                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Confirmé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              VUE 3 : RÉPERTOIRE DES SALLES & CAPACITÉS
              ═══════════════════════════════════════════════════════════════ */}
          {viewMode === 'rooms' && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Building size={18} className="text-orange-500" />
                    Répertoire des Salles & Laboratoires Universitaires
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    Visualisez les capacités et équipements pour vos réservations et soutenances
                  </p>
                </div>
                <span className="glass-badge glass-badge-orange px-3 py-1 rounded-full text-xs font-mono font-medium">
                  {rooms.length} Salles enregistrées
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() =>
                      setSelectedRoomModal({
                        name: room.name,
                        building: room.building,
                        capacity: room.capacity,
                      })
                    }
                    className="glass-card rounded-xl p-4 space-y-2 border border-zinc-200/80 dark:border-white/10 hover:border-orange-500/40 cursor-pointer transition-all group"
                    title="Cliquer pour voir la fiche de la salle"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">
                          {room.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{room.building}</p>
                      </div>
                      <span className="glass-badge px-2 py-0.5 rounded text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">
                        {room.capacity} pl.
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/70 dark:border-white/5 flex flex-wrap gap-1">
                      {room.equipments?.slice(0, 3).map((eq: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal d'inspection logistique de salle avec permutation */}
      <RoomDetailModal
        isOpen={!!selectedRoomModal}
        onClose={() => setSelectedRoomModal(null)}
        room={selectedRoomModal}
      />
    </StudentLayout>
  );
}
