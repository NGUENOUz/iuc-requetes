'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Printer,
  Building,
  Navigation,
  Layers,
  Calendar as CalendarIcon,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useTimetable } from '@/lib/hooks';
import RoomDetailModal from '@/components/RoomDetailModal';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

const DAY_NAMES_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;
const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

type ViewMode = 'calendar' | 'week' | 'rooms';

export default function PlannerPage() {
  const { student } = useStudent();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedRoomModal, setSelectedRoomModal] = useState<any | null>(null);

  const isTeacher = student?.role_code === 'enseignant';

  const { slots, rooms, loading } = useTimetable({
    teacherId: isTeacher ? student?.id : undefined,
  });

  const selectedDayName = useMemo(() => {
    return DAY_NAMES_FR[selectedDate.getDay()];
  }, [selectedDate]);

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

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      slotsCount: number;
    }> = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dayName = DAY_NAMES_FR[d.getDay()];
      const count = slots.filter((s) => s.day_of_week === dayName).length;
      days.push({ date: d, isCurrentMonth: false, slotsCount: count });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const dayName = DAY_NAMES_FR[d.getDay()];
      const count = slots.filter((s) => s.day_of_week === dayName).length;
      days.push({ date: d, isCurrentMonth: true, slotsCount: count });
    }

    const remaining = 35 - days.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 0); i++) {
      const d = new Date(year, month + 1, i);
      const dayName = DAY_NAMES_FR[d.getDay()];
      const count = slots.filter((s) => s.day_of_week === dayName).length;
      days.push({ date: d, isCurrentMonth: false, slotsCount: count });
    }

    return days;
  }, [viewMonth, slots]);

  const handlePrevMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* ── EN-TÊTE SOBRE ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Planning académique & salles
            </h1>
            <p className="text-xs text-fg-muted">
              Consulte tes cours, amphis, équipements et localise ta salle sur le campus en 3D.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer size={14} />}
            >
              Imprimer la grille
            </Button>
            <Link href="/nouvelle-requete">
              <Button variant="primary" size="sm">
                Demander une permutation
              </Button>
            </Link>
          </div>
        </div>

        {/* ── SÉLECTEUR DE MODE & FILTRES ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 rounded-lg bg-surface-muted/60 border border-line text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors-fast flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Journée & Calendrier</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors-fast flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <Layers size={14} />
              <span>Grille de la semaine</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('rooms')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors-fast flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'rooms'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <Building size={14} />
              <span>Salles ({rooms.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-surface border border-line text-xs text-fg cursor-pointer"
            >
              <option value="all">Tous types (CM, TD, TP)</option>
              <option value="CM">Cours Magistraux (CM)</option>
              <option value="TP">Travaux Pratiques (TP)</option>
              <option value="TD">Travaux Dirigés (TD)</option>
            </select>
          </div>
        </div>

        {/* ── VUE 1 : CALENDRIER & SÉANCES DU JOUR ── */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calendrier Mensuel (5 colonnes) */}
            <GlassCard variant="glass" withShine={true} className="lg:col-span-5 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line/60">
                <div>
                  <h2 className="text-sm font-bold text-fg capitalize">
                    {MONTH_NAMES_FR[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                  </h2>
                  <p className="text-[11px] text-fg-muted">
                    Sélectionne un jour pour voir les cours
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevMonth}
                    title="Mois précédent"
                  >
                    <ChevronLeft size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    title="Mois suivant"
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </div>

              {/* Jours de semaine */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-fg-muted font-semibold pb-1">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mer</div>
                <div>Jeu</div>
                <div>Ven</div>
                <div>Sam</div>
                <div>Dim</div>
              </div>

              {/* Grille des dates */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, idx) => {
                  const isSelected = isSameDay(item.date, selectedDate);
                  const hasClasses = item.slotsCount > 0;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      className={`h-11 rounded-md p-1 flex flex-col items-center justify-between text-xs transition-colors cursor-pointer ${
                        !item.isCurrentMonth ? 'opacity-30' : 'opacity-100'
                      } ${
                        isSelected
                          ? 'bg-accent text-accent-fg font-bold shadow-xs'
                          : 'hover:bg-surface-hover text-fg'
                      }`}
                    >
                      <span className="font-mono text-xs">{item.date.getDate()}</span>
                      {hasClasses && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-accent-fg' : 'bg-accent'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Liste des séances du jour sélectionné (7 colonnes) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-fg">
                    Programme du {selectedDayName} {selectedDate.getDate()} {MONTH_NAMES_FR[selectedDate.getMonth()]}
                  </h2>
                  <p className="text-xs text-fg-muted">
                    {daySlots.length} séance(s) programmée(s)
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : daySlots.length === 0 ? (
                <GlassCard>
                  <EmptyState
                    title="Aucun cours ce jour-là"
                    description={`Pas de cours programmé pour le ${selectedDayName}.`}
                  />
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {daySlots.map((slot, idx) => (
                    <GlassCard
                      key={slot.id || idx}
                      variant="glass"
                      withShine={true}
                      className="p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-accent">
                              {slot.start_time} - {slot.end_time}
                            </span>
                            <StatusBadge variant="neutral">
                              {slot.session_type || 'Cours'}
                            </StatusBadge>
                          </div>
                          <p className="text-base font-semibold text-fg">
                            {slot.course_name}
                          </p>
                          <p className="text-xs text-fg-muted">
                            {slot.filiere} {slot.niveau ? `(${slot.niveau})` : ''} • Enseignant : {slot.teacher_name}
                          </p>
                        </div>

                        {/* Bouton pour ouvrir la modale avec GPS 3D */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setSelectedRoomModal({
                              name: slot.room_name,
                              building: slot.room_building,
                              capacity: slot.room_capacity,
                              slotInfo: slot,
                            })
                          }
                          leftIcon={<Navigation size={13} className="text-accent" />}
                        >
                          Localiser 3D
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-fg-secondary">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="text-accent" />
                          <span>Salle {slot.room_name} ({slot.room_building || 'Campus A'})</span>
                        </span>
                        <span className="text-fg-muted">
                          {slot.room_capacity || 60} places
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VUE 2 : GRILLE DE LA SEMAINE ── */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day) => {
                const slotsForDay = slots.filter((s) => s.day_of_week === day);

                return (
                  <GlassCard key={day} variant="glass" className="p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-line/60">
                      <span className="font-bold text-sm text-fg">{day}</span>
                      <span className="text-xs text-fg-muted font-mono">
                        {slotsForDay.length} cours
                      </span>
                    </div>

                    {slotsForDay.length === 0 ? (
                      <p className="text-xs text-fg-muted py-4 text-center">Aucun cours</p>
                    ) : (
                      <div className="space-y-2">
                        {slotsForDay.map((s, i) => (
                          <div
                            key={i}
                            onClick={() =>
                              setSelectedRoomModal({
                                name: s.room_name,
                                building: s.room_building,
                                capacity: s.room_capacity,
                                slotInfo: s,
                              })
                            }
                            className="p-2.5 rounded-md bg-surface/70 border border-line hover:border-accent cursor-pointer transition-colors space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-semibold text-accent">
                                {s.start_time} - {s.end_time}
                              </span>
                              <span className="text-fg-muted">{s.room_name}</span>
                            </div>
                            <p className="text-xs font-medium text-fg truncate">
                              {s.course_name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VUE 3 : PARC DES SALLES & RECHERCHE 3D ── */}
        {viewMode === 'rooms' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <GlassCard
                  key={room.id}
                  variant="glass"
                  withShine={true}
                  className="p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-fg">
                        {room.name}
                      </span>
                      <StatusBadge variant="info">
                        {room.capacity || 60} places
                      </StatusBadge>
                    </div>

                    <p className="text-xs text-fg-muted">
                      {room.building || 'Bâtiment Principal Pôle A'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 text-[11px] text-fg-secondary">
                      <span className="px-2 py-0.5 rounded bg-surface-muted border border-line">
                        Projecteur
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-muted border border-line">
                        Climatisation
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-muted border border-line">
                        Wi-Fi
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="text-xs text-fg-muted">1er Étage</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setSelectedRoomModal({
                          name: room.name,
                          building: room.building,
                          capacity: room.capacity,
                        })
                      }
                      leftIcon={<Navigation size={13} />}
                    >
                      Plan 3D & GPS
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal avec carte 3D intégrée et itinéraire */}
      {selectedRoomModal && (
        <RoomDetailModal
          isOpen={!!selectedRoomModal}
          onClose={() => setSelectedRoomModal(null)}
          room={selectedRoomModal}
        />
      )}
    </StudentLayout>
  );
}
