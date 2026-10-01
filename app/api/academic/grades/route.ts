import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse, handleError } from '@/lib/utils/api.utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const cycle = searchParams.get('cycle');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academic_year');

    const defaultStudentId = 'a1a2c3d4-0005-4000-8000-000000000005';
    const effectiveStudentId = studentId || defaultStudentId;

    let query = supabase
      .from('grades')
      .select('*')
      .eq('student_id', effectiveStudentId);

    if (cycle && cycle !== 'all' && cycle !== 'Tous') {
      query = query.eq('cycle', cycle);
    }
    if (semester && semester !== 'all' && semester !== 'Tous') {
      query = query.eq('semester', semester);
    }
    if (academicYear && academicYear !== 'all') {
      query = query.eq('academic_year', academicYear);
    }

    let { data: rawGrades, error } = await query;

    // Si aucune note trouvée pour cet ID spécifique (ex: compte admin en test), charger les notes de démo
    if (!rawGrades || rawGrades.length === 0) {
      let demoQuery = supabase
        .from('grades')
        .select('*')
        .eq('student_id', defaultStudentId);
      if (cycle && cycle !== 'all' && cycle !== 'Tous') demoQuery = demoQuery.eq('cycle', cycle);
      if (semester && semester !== 'all' && semester !== 'Tous') demoQuery = demoQuery.eq('semester', semester);
      const demoRes = await demoQuery;
      if (demoRes.data && demoRes.data.length > 0) {
        rawGrades = demoRes.data;
      }
    }

    if (error) {
      return errorResponse(error.message || 'Erreur lors de la récupération des notes', 'DB_ERROR', 500);
    }

    // Récupérer les cours correspondants si la jointure n'est pas déjà faite
    const { data: allCourses } = await supabase.from('courses').select('*');
    const coursesMap = new Map((allCourses || []).map((c: any) => [c.id, c]));

    const enrichedGrades = (rawGrades || []).map((grade: any) => {
      const course = grade.course || coursesMap.get(grade.course_id) || null;
      return {
        ...grade,
        course,
      };
    });

    // Calculs académiques
    let totalCredits = 0;
    let creditsValides = 0;
    let totalPondere = 0;
    let totalCoeffs = 0;
    let matieresValidees = 0;
    let matieresRattrapage = 0;
    let matieresEnAttente = 0;

    enrichedGrades.forEach((g: any) => {
      const credits = g.course?.credits || 3;
      totalCredits += credits;

      if (g.status === 'valide') {
        creditsValides += credits;
        matieresValidees++;
      } else if (g.status === 'rattrapage') {
        matieresRattrapage++;
      } else if (g.status === 'en_attente') {
        matieresEnAttente++;
      }

      if (g.moyenne !== null && g.moyenne !== undefined) {
        totalPondere += g.moyenne * credits;
        totalCoeffs += credits;
      }
    });

    const moyenneGenerale = totalCoeffs > 0 ? parseFloat((totalPondere / totalCoeffs).toFixed(2)) : null;

    let mention = 'En cours';
    if (moyenneGenerale !== null) {
      if (moyenneGenerale >= 16) mention = 'Très Bien';
      else if (moyenneGenerale >= 14) mention = 'Bien';
      else if (moyenneGenerale >= 12) mention = 'Assez Bien';
      else if (moyenneGenerale >= 10) mention = 'Passable';
      else mention = 'Ajourné / Non validé';
    }

    return successResponse({
      grades: enrichedGrades,
      stats: {
        moyenne_generale: moyenneGenerale,
        total_credits: totalCredits,
        credits_valides: creditsValides,
        matieres_validees: matieresValidees,
        matieres_rattrapage: matieresRattrapage,
        matieres_en_attente: matieresEnAttente,
        total_matieres: enrichedGrades.length,
        mention,
        taux_reussite: totalCredits > 0 ? Math.round((creditsValides / totalCredits) * 100) : 0,
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
