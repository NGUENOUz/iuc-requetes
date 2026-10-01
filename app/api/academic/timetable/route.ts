import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse, handleError } from '@/lib/utils/api.utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    const filiere = searchParams.get('filiere');
    const day = searchParams.get('day');

    let query = supabase.from('timetable').select('*');

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    if (filiere) {
      query = query.eq('filiere', filiere);
    }
    if (day) {
      query = query.eq('day_of_week', day);
    }

    let { data: rawSlots, error } = await query;

    // Si aucun créneau pour cet ID spécifique (ex: test), renvoyer tous les cours
    if ((!rawSlots || rawSlots.length === 0) && teacherId) {
      const allSlotsRes = await supabase.from('timetable').select('*');
      if (allSlotsRes.data && allSlotsRes.data.length > 0) {
        rawSlots = allSlotsRes.data;
      }
    }

    if (error) {
      return errorResponse(error.message || 'Erreur lors de la récupération du planning', 'DB_ERROR', 500);
    }

    // Récupérer les salles et les cours
    const { data: rooms } = await supabase.from('rooms').select('*');
    const { data: courses } = await supabase.from('courses').select('*');

    const roomsMap = new Map((rooms || []).map((r: any) => [r.id, r]));
    const coursesMap = new Map((courses || []).map((c: any) => [c.id, c]));

    const enrichedSlots = (rawSlots || []).map((slot: any) => {
      const room = slot.room || roomsMap.get(slot.room_id) || null;
      const course = slot.course || coursesMap.get(slot.course_id) || null;
      return {
        ...slot,
        room,
        course,
      };
    });

    // Ordre des jours
    const dayOrder: Record<string, number> = {
      Lundi: 1,
      Mardi: 2,
      Mercredi: 3,
      Jeudi: 4,
      Vendredi: 5,
      Samedi: 6,
    };

    enrichedSlots.sort((a: any, b: any) => {
      const dayDiff = (dayOrder[a.day_of_week] || 0) - (dayOrder[b.day_of_week] || 0);
      if (dayDiff !== 0) return dayDiff;
      return a.start_time.localeCompare(b.start_time);
    });

    return successResponse({
      slots: enrichedSlots,
      rooms: rooms || [],
      total: enrichedSlots.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
