import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { generateContent, extractJSON, isGeminiAvailable, MODELS } from '@/lib/gemini';
import { successResponse, errorResponse, handleError, ErrorCodes } from '@/lib/utils/api.utils';
import { requireAuth } from '@/lib/middleware/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// POST /api/ai/suggest - Générer des suggestions IA automatiques
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  console.log('\n✨ === [AI SUGGEST] Démarrage ===');
  
  try {
    console.log('[1/4] 🔐 Vérification auth...');
    const { error: authError, user: authUser } = await requireAuth(request);
    
    if (authError || !authUser) {
      return authError || errorResponse(
        'Non authentifié',
        ErrorCodes.UNAUTHORIZED,
        401
      );
    }

    if (authUser.role?.name !== 'admin') {
      return errorResponse(
        'Accès réservé aux administrateurs',
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    console.log('[2/4] ✅ Admin authentifié');


    // Vérifier si Gemini est disponible
    if (!isGeminiAvailable()) {
      console.log('[3/4] ⚠️ Gemini non disponible - Mode fallback');
      return getFallbackSuggestions();
    }

    console.log('[3/4] 🔑 Gemini disponible');

    // Analyser les données
    console.log('[3/4] 📊 Analyse des données...');
    const analysisData = await analyzeSystemData();

    // Construire le prompt
    const prompt = buildSuggestionsPrompt(analysisData);
    console.log('[3/4] 📝 Prompt construit');

    // Générer les suggestions
    console.log('[4/4] 🚀 Génération des suggestions...');
    const response = await generateContent(prompt, MODELS.FLASH);

    console.log('[4/4] ✅ Réponse reçue');

    // Parser la réponse
    const suggestions = extractJSON(response);

    if (!suggestions.suggestions || !Array.isArray(suggestions.suggestions)) {
      throw new Error('Format de suggestions invalide');
    }

    // Sauvegarder les suggestions dans la base
    const suggestionsToInsert = suggestions.suggestions.map((sug: any) => ({
      type: sug.type || 'recommendation',
      priority: sug.priority || 'medium',
      title: sug.title,
      description: sug.description,
      impact: sug.impact,
      recommended_action: sug.action,
      metadata: { generatedBy: 'gemini-1.5-flash' }
    }));

    const { data: savedSuggestions, error: saveError } = await supabaseAdmin
      .from('ai_suggestions')
      .insert(suggestionsToInsert)
      .select();

    if (saveError) {
      console.error('Erreur sauvegarde:', saveError);
    }

    console.log('✅✨ SUCCÈS:', suggestions.suggestions.length, 'suggestions générées');
    console.log('=== [AI SUGGEST] Terminé ===\n');

    return successResponse({
      suggestions: savedSuggestions || suggestions.suggestions,
      metadata: {
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        saved: !!savedSuggestions
      }
    });

  } catch (error: any) {
    console.error('❌ [Erreur Gemini]:', error.message);
    console.log('🔄 [FALLBACK] Suggestions de secours');
    
    return getFallbackSuggestions();
  }
}

// ═══════════════════════════════════════════════════════════════
// FONCTIONS HELPERS
// ═══════════════════════════════════════════════════════════════

function buildSuggestionsPrompt(data: any): string {
  return `Tu es un expert en optimisation de systèmes de gestion de requêtes étudiantes.

**DONNÉES DU SYSTÈME IUC REQUÊTES :**

**Statistiques globales :**
- Total requêtes: ${data.totalRequests}
- Requêtes en cours: ${data.pendingRequests}
- Requêtes résolues: ${data.resolvedRequests}
- Dépassements SLA: ${data.slaBreaches}
- Taux de résolution: ${data.resolutionRate}%
- Temps moyen de résolution: ${data.avgResolutionTime}h

**Agents et charge de travail :**
${JSON.stringify(data.agentWorkload, null, 2)}

**Répartition par service :**
${JSON.stringify(data.serviceDistribution, null, 2)}

**Tendances récentes (7 derniers jours) :**
${JSON.stringify(data.recentTrends, null, 2)}

**MISSION :**
Analyse ces données et génère 3-5 suggestions concrètes pour optimiser le système.

**TYPES DE SUGGESTIONS :**
- "alert" : Problème urgent nécessitant action immédiate
- "optimization" : Amélioration d'efficacité
- "recommendation" : Suggestion d'amélioration

**PRIORITÉS :**
- "high" : Action urgente recommandée
- "medium" : Important mais non critique
- "low" : Amélioration à long terme

**FORMAT JSON STRICT (sans markdown) :**
{
  "suggestions": [
    {
      "type": "alert|optimization|recommendation",
      "priority": "high|medium|low",
      "title": "Titre court et clair",
      "description": "Description détaillée du problème ou opportunité",
      "impact": "Impact quantifié (ex: gain de 4h/semaine)",
      "action": "Action concrète recommandée"
    }
  ]
}

Focus sur des suggestions ACTIONNABLES et MESURABLES.`;
}

async function analyzeSystemData() {
  try {
    // Stats globales
    const { count: totalRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true });

    const { count: pendingRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .not('resolved_at', 'is', null)
      .is('closed_at', null);

    const { count: resolvedRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .not('resolved_at', 'is', null);

    const { count: slaBreaches } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_sla_breached', true);

    // Temps moyen de résolution
    const { data: resolvedWithTime } = await supabase
      .from('requests')
      .select('resolution_time_hours')
      .not('resolution_time_hours', 'is', null);

    const avgResolutionTime = resolvedWithTime && resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, r) => acc + (r.resolution_time_hours || 0), 0) / resolvedWithTime.length
      : 0;

    // Charge de travail des agents
    const { data: agentWorkload } = await supabase
      .from('requests')
      .select(`
        assigned_to,
        users!requests_assigned_to_fkey(first_name, last_name)
      `)
      .not('assigned_to', 'is', null)
      .is('resolved_at', null);

    const workloadByAgent: Record<string, any> = {};
    agentWorkload?.forEach(req => {
      const agentId = req.assigned_to;
      if (!agentId) return;
      
      if (!workloadByAgent[agentId]) {
        workloadByAgent[agentId] = {
          name: `${req.users?.first_name} ${req.users?.last_name}`,
          activeRequests: 0
        };
      }
      workloadByAgent[agentId].activeRequests++;
    });

    // Répartition par service
    const { data: serviceData } = await supabase
      .from('requests')
      .select(`
        service_id,
        services(name)
      `);

    const serviceDistribution: Record<string, number> = {};
    serviceData?.forEach(req => {
      const serviceName = req.services?.name || 'Non assigné';
      serviceDistribution[serviceName] = (serviceDistribution[serviceName] || 0) + 1;
    });

    // Tendances récentes (7 jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: recentRequests } = await supabase
      .from('requests')
      .select('submitted_at')
      .gte('submitted_at', weekAgo.toISOString());

    return {
      totalRequests: totalRequests || 0,
      pendingRequests: pendingRequests || 0,
      resolvedRequests: resolvedRequests || 0,
      slaBreaches: slaBreaches || 0,
      resolutionRate: totalRequests ? Math.round((resolvedRequests || 0) / totalRequests * 100) : 0,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      agentWorkload: Object.values(workloadByAgent),
      serviceDistribution,
      recentTrends: {
        newRequestsLast7Days: recentRequests?.length || 0,
        avgPerDay: Math.round((recentRequests?.length || 0) / 7)
      }
    };
  } catch (error) {
    console.error('Erreur analyse:', error);
    return {
      totalRequests: 0,
      pendingRequests: 0,
      resolvedRequests: 0,
      slaBreaches: 0,
      resolutionRate: 0,
      avgResolutionTime: 0,
      agentWorkload: [],
      serviceDistribution: {},
      recentTrends: {}
    };
  }
}

function getFallbackSuggestions() {
  const fallbackSuggestions = [
    {
      type: 'optimization',
      priority: 'medium',
      title: 'Automatiser les réponses types',
      description: 'Les requêtes standard comme les demandes d\'attestation pourraient bénéficier de réponses automatiques.',
      impact: 'Gain estimé de 3-4h par semaine par agent',
      action: 'Créer des templates de réponse pour les 5 types de requêtes les plus fréquents',
      status: 'pending'
    },
    {
      type: 'recommendation',
      priority: 'medium',
      title: 'Optimiser la répartition des requêtes',
      description: 'Mettre en place un système d\'équilibrage de charge pour éviter la surcharge de certains agents.',
      impact: 'Améliorer la satisfaction et réduire les délais',
      action: 'Activer l\'assignation automatique basée sur la charge de travail',
      status: 'pending'
    },
    {
      type: 'alert',
      priority: 'low',
      title: 'Former les agents aux outils',
      description: 'Une formation régulière améliorerait l\'efficacité du traitement.',
      impact: 'Réduction de 15-20% du temps de traitement',
      action: 'Organiser une session de formation mensuelle',
      status: 'pending'
    }
  ];

  return successResponse({
    suggestions: fallbackSuggestions,
    metadata: {
      fallback: true,
      timestamp: new Date().toISOString(),
      reason: 'Gemini API non disponible'
    }
  });
}
