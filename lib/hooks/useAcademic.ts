import { useState, useEffect, useCallback } from 'react';
import { Grade, TimetableSlot, Room } from '@/lib/types';

interface AcademicStats {
  moyenne_generale: number | null;
  total_credits: number;
  credits_valides: number;
  matieres_validees: number;
  matieres_rattrapage: number;
  matieres_en_attente: number;
  total_matieres: number;
  mention: string;
  taux_reussite: number;
}

export function useAcademicGrades(studentId?: string, cycle?: string, semester?: string) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<AcademicStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ student_id: studentId });
      if (cycle && cycle !== 'all') params.append('cycle', cycle);
      if (semester && semester !== 'all') params.append('semester', semester);

      const res = await fetch(`/api/academic/grades?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setGrades(json.data.grades || []);
        setStats(json.data.stats || null);
      } else {
        setError(json.error?.message || 'Erreur lors du chargement des notes');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [studentId, cycle, semester]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return { grades, stats, loading, error, refresh: fetchGrades };
}

export function useTimetable(options?: { teacherId?: string; filiere?: string; day?: string }) {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.teacherId) params.append('teacher_id', options.teacherId);
      if (options?.filiere) params.append('filiere', options.filiere);
      if (options?.day && options.day !== 'all') params.append('day', options.day);

      const res = await fetch(`/api/academic/timetable?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setSlots(json.data.slots || []);
        setRooms(json.data.rooms || []);
      } else {
        setError(json.error?.message || 'Erreur lors du chargement du planning');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [options?.teacherId, options?.filiere, options?.day]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  return { slots, rooms, loading, error, refresh: fetchTimetable };
}
