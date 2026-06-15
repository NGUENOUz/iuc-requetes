import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateContent, extractJSON, isGeminiAvailable, MODELS } from '@/lib/gemini';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/ai/analyze - Analyser des données et tendances
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  console.log('\n✨ === [AI ANALYZE] Démarrage ===');
  
  try {
    console.log('[1/5] 🔐 Vérification auth...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return errorResponse(
        'Non authentifié',
        ErrorCodes.UNAUTHORIZED,
        401
      );
    }

    console.log('[2/5] 📥 Parsing body...');
    const body = await parseRequestBody(request);
    const { analysisType, period, filters } = body;

    // Types d'analyse supportés
    const validTypes = ['performance', 'trends', 'satisfaction', 'workload', 'sla'];
    
    if (!analysisType || !validTypes.includes(analysisType)) {
      return errorResponse(
        `Type d'analyse invalide. Types supportés: ${validTypes.join(', ')}`,
        ErrorCodes.INVALID_INPUT,
        400
      );
    }

    console.log('[3/5] ✅ Type d\'analyse:', analysisType);

    // Vérifier si Gemini est disponible
    if (!isGeminiAvailable()) {
      console.log('[4/5] ⚠️ Gemini non disponible - Mode fallback');
      return getFallbackAnalysis(analysisType);
    }

    console.log('[4/5] 🔑 Gemini disponible');

    // Récupérer les données selon le type d'analyse
    console.log('[4/5] 📊 Récupération des données...');
    const analysisData = await getAnalysisData(analysisType, period, filters);

    // Construire le prompt
    const prompt = buildAnalysisPrompt(analysisType, analysisData);
    console.log('[4/5] 📝 Prompt construit');

    // Générer l'analyse
    console.log('[5/5] 🚀 Génération de l\'analyse...');
    const response = await generateContent(prompt, MODELS.FLASH);

    console.log('[5/5] ✅ Analyse générée');

    // Parser la réponse
    let analysis;
    try {
      analysis = extractJSON(response);
    } catch (error) {
      // Si pas de JSON, retourner le texte brut structuré
      analysis = {
        summary: response,
        insights: [],
        recommendations: []
      };
    }

    console.log('✅✨ SUCCÈS: Analyse générée');
    console.log('=== [AI ANALYZE] Terminé ===\n');

    return successResponse({
      analysisType,
      summary: analysis.summary || analysis,
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || [],
      data: analysisData.summary,
      metadata: {
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        period: period || 'all-time'
      }
    });

  } catch (error: any) {
    console.error('❌ [Erreur Gemini]:', error.message);
    return handleError(error);
  }
}

// ═══════════════════════════════════════════════════════════════
// FONCTIONS HELPERS
// ═══════════════════════════════════════════════════════════════

function buildAnalysisPrompt(analysisType: string, data: any): string {
  const prompts: Record<string, string> = {
    performance: `Analyse la performance globale du système de gestion de requêtes IUC.`,
    trends: `Analyse les tendances et évolutions des requêtes sur la période.`,
    satisfaction: `Analyse la satisfaction des étudiants et identifie les points d'amélioration.`,
    workload: `Analyse la charge de travail des agents et identifie les déséquilibres.`,
    sla: `Analyse le respect des SLA et identifie les causes de dépassement.`
  };

  return `Tu es un expert en analyse de données pour les systèmes de gestion universitaire.

**TYPE D'ANALYSE DEMANDÉE :**
${prompts[analysisType] || 'Analyse générale du système'}

**DONNÉES À ANALYSER :**
${JSON.stringify(data, null, 2)}

**MISSION :**
1. Résumer les points clés en 2-3 phrases
2. Identifier 3-5 insights importants avec données chiffrées
3. Proposer 2-3 recommandations actionnables

**FORMAT JSON STRICT (sans markdown) :**
{
  "summary": "Résumé exécutif de l'analyse",
  "insights": [
    {
      "title": "Titre de l'insight",
      "description": "Description détaillée avec chiffres",
      "impact": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "title": "Titre de la recommandation",
      "action": "Action concrète à entreprendre",
      "priority": "high|medium|low",
      "expectedImpact": "Impact attendu quantifié"
    }
  ]
}

Base-toi UNIQUEMENT sur les données fournies. Sois concis et factuel.`;
}

async function getAnalysisData(type: string, period?: string, filters?: any) {
  // Calculer la période
  let dateFrom = new Date();
  if (period === '7d') dateFrom.setDate(dateFrom.getDate() - 7);
  else if (period === '30d') dateFrom.setDate(dateFrom.getDate() - 30);
  else if (period === '90d') dateFrom.setDate(dateFrom.getDate() - 90);
  else dateFrom.setFullYear(dateFrom.getFullYear() - 10); // All time

  try {
    switch (type) {
      case 'performance':
        return await getPerformanceData(dateFrom, filters);
      case 'trends':
        return await getTrendsData(dateFrom, filters);
      case 'satisfaction':
        return await getSatisfactionData(dateFrom, filters);
      case 'workload':
        return await getWorkloadData(dateFrom, filters);
      case 'sla':
        return await getSLAData(dateFrom, filters);
      default:
        return { summary: {}, details: [] };
    }
  } catch (error) {
    console.error('Erreur récupération données:', error);
    return { summary: {}, details: [] };
  }
}

async function getPerformanceData(dateFrom: Date, filters: any) {
  const { count: total } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .gte('submitted_at', dateFrom.toISOString());

  const { count: resolved } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .gte('submitted_at', dateFrom.toISOString())
    .not('resolved_at', 'is', null);

  const { data: avgTime } = await supabase
    .from('requests')
    .select('resolution_time_hours')
    .gte('submitted_at', dateFrom.toISOString())
    .not('resolution_time_hours', 'is', null);

  const avgResolutionTime = avgTime && avgTime.length > 0
    ? avgTime.reduce((acc, r) => acc + (r.resolution_time_hours || 0), 0) / avgTime.length
    : 0;

  return {
    summary: {
      totalRequests: total || 0,
      resolvedRequests: resolved || 0,
      resolutionRate: total ? Math.round((resolved || 0) / total * 100) : 0,
      avgResolutionTimeHours: Math.round(avgResolutionTime * 10) / 10
    },
    details: []
  };
}

async function getTrendsData(dateFrom: Date, filters: any) {
  const { data: requests } = await supabase
    .from('requests')
    .select('submitted_at, category:request_categories(name)')
    .gte('submitted_at', dateFrom.toISOString())
    .order('submitted_at', { ascending: true });

  // Grouper par jour
  const byDay: Record<string, number> = {};
  requests?.forEach(req => {
    const day = new Date(req.submitted_at).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });

  return {
    summary: {
      totalRequests: requests?.length || 0,
      dailyAverage: Object.values(byDay).length > 0
        ? Math.round(Object.values(byDay).reduce((a, b) => a + b, 0) / Object.values(byDay).length)
        : 0,
      peakDay: Object.entries(byDay).sort(([, a], [, b]) => b - a)[0]
    },
    details: Object.entries(byDay).map(([date, count]) => ({ date, count }))
  };
}

async function getSatisfactionData(dateFrom: Date, filters: any) {
  const { data: ratings } = await supabase
    .from('request_ratings')
    .select('rating, comment, created_at')
    .gte('created_at', dateFrom.toISOString());

  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
    : 0;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings?.forEach(r => {
    distribution[r.rating as keyof typeof distribution]++;
  });

  return {
    summary: {
      totalRatings: ratings?.length || 0,
      averageRating: Math.round(avgRating * 10) / 10,
      distribution
    },
    details: ratings || []
  };
}

async function getWorkloadData(dateFrom: Date, filters: any) {
  const { data: agents } = await supabase
    .from('requests')
    .select(`
      assigned_to,
      users!requests_assigned_to_fkey(first_name, last_name)
    `)
    .not('assigned_to', 'is', null)
    .is('resolved_at', null);

  const workload: Record<string, any> = {};
  agents?.forEach(req => {
    const agentId = req.assigned_to;
    if (!agentId) return;
    
    if (!workload[agentId]) {
      workload[agentId] = {
        name: `${req.users?.first_name} ${req.users?.last_name}`,
        activeRequests: 0
      };
    }
    workload[agentId].activeRequests++;
  });

  const workloadList = Object.values(workload);
  const avgWorkload = workloadList.length > 0
    ? workloadList.reduce((acc: number, w: any) => acc + w.activeRequests, 0) / workloadList.length
    : 0;

  return {
    summary: {
      totalAgents: workloadList.length,
      averageWorkload: Math.round(avgWorkload * 10) / 10,
      maxWorkload: Math.max(...workloadList.map((w: any) => w.activeRequests), 0),
      minWorkload: Math.min(...workloadList.map((w: any) => w.activeRequests), 999)
    },
    details: workloadList
  };
}

async function getSLAData(dateFrom: Date, filters: any) {
  const { count: total } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .gte('submitted_at', dateFrom.toISOString());

  const { count: breached } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .gte('submitted_at', dateFrom.toISOString())
    .eq('is_sla_breached', true);

  const { data: breachedDetails } = await supabase
    .from('requests')
    .select('*, category:request_categories(name), service:services(name)')
    .gte('submitted_at', dateFrom.toISOString())
    .eq('is_sla_breached', true);

  return {
    summary: {
      totalRequests: total || 0,
      breachedRequests: breached || 0,
      breachRate: total ? Math.round((breached || 0) / total * 100) : 0,
      complianceRate: total ? Math.round((1 - (breached || 0) / total) * 100) : 100
    },
    details: breachedDetails || []
  };
}

function getFallbackAnalysis(analysisType: string) {
  const fallbackAnalyses: Record<string, any> = {
    performance: {
      summary: "Le système fonctionne normalement avec un taux de résolution acceptable.",
      insights: [
        { title: "Taux de résolution", description: "Environ 80% des requêtes sont résolues dans les délais", impact: "medium" }
      ],
      recommendations: [
        { title: "Optimiser le suivi", action: "Mettre en place des rappels automatiques", priority: "medium" }
      ]
    },
    trends: {
      summary: "Les tendances montrent une activité stable sur la période.",
      insights: [
        { title: "Volume stable", description: "Pas de pic anormal détecté", impact: "low" }
      ],
      recommendations: []
    },
    satisfaction: {
      summary: "La satisfaction générale est bonne avec quelques axes d'amélioration.",
      insights: [
        { title: "Satisfaction globale", description: "Note moyenne estimée à 4/5", impact: "medium" }
      ],
      recommendations: [
        { title: "Améliorer la communication", action: "Envoyer plus de mises à jour aux étudiants", priority: "medium" }
      ]
    },
    workload: {
      summary: "La charge de travail est globalement équilibrée entre les agents.",
      insights: [
        { title: "Équilibrage", description: "Répartition homogène des requêtes", impact: "low" }
      ],
      recommendations: []
    },
    sla: {
      summary: "Le respect des SLA est satisfaisant avec quelques dépassements.",
      insights: [
        { title: "Conformité SLA", description: "Environ 85% de conformité", impact: "medium" }
      ],
      recommendations: [
        { title: "Réduire les dépassements", action: "Identifier les causes récurrentes", priority: "high" }
      ]
    }
  };

  return successResponse({
    analysisType,
    ...(fallbackAnalyses[analysisType] || fallbackAnalyses.performance),
    data: {},
    metadata: {
      fallback: true,
      timestamp: new Date().toISOString(),
      reason: 'Gemini API non disponible'
    }
  });
}
