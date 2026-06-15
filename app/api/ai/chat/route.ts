import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateContent, extractJSON, isGeminiAvailable, MODELS } from '@/lib/gemini';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/ai/chat - Chat avec l'assistant IA
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  console.log('\n✨ === [AI CHAT] Démarrage ===');
  
  try {
    // Authentification
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return errorResponse(
        'Non authentifié',
        ErrorCodes.UNAUTHORIZED,
        401
      );
    }

    console.log('[1/5] 📥 Parsing body...');
    const body = await parseRequestBody(request);
    const { message, context } = body;

    if (!message) {
      return errorResponse(
        'Message requis',
        ErrorCodes.INVALID_INPUT,
        400
      );
    }

    console.log('[2/5] ✅ Message reçu:', message.substring(0, 50) + '...');

    // Vérifier si Gemini est disponible
    if (!isGeminiAvailable()) {
      console.log('[3/5] ⚠️ Gemini non disponible - Mode fallback');
      return getFallbackResponse(message);
    }

    console.log('[3/5] 🔑 Gemini disponible');

    // Récupérer le contexte de la base de données
    console.log('[4/5] 📊 Récupération du contexte...');
    const dbContext = await getDatabaseContext();

    // Construire le prompt
    const prompt = buildPrompt(message, context, dbContext);
    console.log('[4/5] 📝 Prompt construit (', prompt.length, 'caractères)');

    // Appeler Gemini
    console.log('[5/5] 🚀 Appel Gemini Flash...');
    const response = await generateContent(prompt, MODELS.FLASH);

    console.log('[5/5] ✅ Réponse reçue:', response.length, 'caractères');

    // Parser la réponse JSON
    let parsedResponse;
    try {
      parsedResponse = extractJSON(response);
    } catch (error) {
      // Si pas de JSON, retourner le texte brut
      parsedResponse = {
        response: response,
        suggestions: [],
        metrics: []
      };
    }

    console.log('✅✨ SUCCÈS: Réponse générée');
    console.log('=== [AI CHAT] Terminé ===\n');

    return successResponse({
      message: parsedResponse.response || parsedResponse,
      suggestions: parsedResponse.suggestions || [],
      metrics: parsedResponse.metrics || [],
      metadata: {
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('❌ [Erreur Gemini]:' , error.message);
    console.log('🔄 [FALLBACK] Utilisation du mode secours');
    
    const body = await parseRequestBody(request);
    return getFallbackResponse(body.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// FONCTIONS HELPERS
// ═══════════════════════════════════════════════════════════════

function buildPrompt(userMessage: string, additionalContext: any, dbContext: any): string {
  return `Tu es l'Assistant IA d'IUC Requêtes, un système de gestion de requêtes étudiantes pour l'université.

**TON RÔLE :**
- Analyser les données de l'établissement en temps réel
- Répondre aux questions des administrateurs
- Fournir des insights et recommandations
- Identifier les problèmes et proposer des solutions

**CONTEXTE DE LA BASE DE DONNÉES :**
- Total de requêtes: ${dbContext.totalRequests}
- Requêtes en attente: ${dbContext.pendingRequests}
- Requêtes dépassant le SLA: ${dbContext.slaBreaches}
- Agents actifs: ${dbContext.activeAgents}
- Services disponibles: ${dbContext.services?.map((s: any) => s.name).join(', ')}

**STATISTIQUES RÉCENTES :**
${JSON.stringify(dbContext.recentStats, null, 2)}

**QUESTION DE L'UTILISATEUR :**
${userMessage}

**CONSIGNES DE RÉPONSE :**
1. Réponds de manière professionnelle et concise
2. Base-toi uniquement sur les données fournies
3. Si tu détectes un problème, propose une action concrète
4. Si tu manques d'informations, demande des précisions

**FORMAT DE RÉPONSE (JSON STRICT) :**
{
  "response": "Ta réponse détaillée ici",
  "suggestions": ["Action 1", "Action 2"],
  "metrics": [
    { "label": "Métrique", "value": "Valeur", "color": "text-red-600 bg-red-50 border-red-100" }
  ]
}

Réponds UNIQUEMENT en JSON, sans markdown.`;
}

async function getDatabaseContext() {
  try {
    // Statistiques globales
    const { count: totalRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true });

    const { count: pendingRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .in('status_id', await getPendingStatusIds());

    const { count: slaBreaches } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_sla_breached', true);

    const { count: activeAgents } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .neq('role_id', await getStudentRoleId());

    const { data: services } = await supabase
      .from('services')
      .select('name')
      .eq('is_active', true);

    // Statistiques récentes (dernières 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: recentRequests } = await supabase
      .from('requests')
      .select('*, category:request_categories(name), priority:priorities(name)')
      .gte('submitted_at', yesterday.toISOString())
      .order('submitted_at', { ascending: false })
      .limit(10);

    return {
      totalRequests: totalRequests || 0,
      pendingRequests: pendingRequests || 0,
      slaBreaches: slaBreaches || 0,
      activeAgents: activeAgents || 0,
      services: services || [],
      recentStats: {
        recentRequestsCount: recentRequests?.length || 0,
        topCategories: getTopCategories(recentRequests || []),
        topPriorities: getTopPriorities(recentRequests || []),
      }
    };
  } catch (error) {
    console.error('Erreur contexte DB:', error);
    return {
      totalRequests: 0,
      pendingRequests: 0,
      slaBreaches: 0,
      activeAgents: 0,
      services: [],
      recentStats: {}
    };
  }
}

async function getPendingStatusIds(): Promise<string[]> {
  const { data } = await supabase
    .from('request_statuses')
    .select('id')
    .in('name', ['Soumise', 'En attente', 'Assignée', 'En cours']);
  
  return data?.map(s => s.id) || [];
}

async function getStudentRoleId(): Promise<string> {
  const { data } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'etudiant')
    .single();
  
  return data?.id || '';
}

function getTopCategories(requests: any[]): string[] {
  const categoryCount: Record<string, number> = {};
  requests.forEach(req => {
    const cat = req.category?.name || 'Inconnu';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  
  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);
}

function getTopPriorities(requests: any[]): string[] {
  const priorityCount: Record<string, number> = {};
  requests.forEach(req => {
    const priority = req.priority?.name || 'Normal';
    priorityCount[priority] = (priorityCount[priority] || 0) + 1;
  });
  
  return Object.entries(priorityCount)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => `${name}: ${count}`);
}

function getFallbackResponse(message: string) {
  const lowerMessage = message.toLowerCase();
  
  let response = "Je suis l'Assistant IA d'IUC Requêtes. ";
  
  if (lowerMessage.includes('charge') || lowerMessage.includes('surchargé')) {
    response += "Pour analyser la charge de travail, consultez la page Statistiques qui affiche la répartition des requêtes par agent.";
  } else if (lowerMessage.includes('retard') || lowerMessage.includes('sla')) {
    response += "Pour voir les requêtes en retard, utilisez le filtre 'Dépassement SLA' sur la page des requêtes.";
  } else if (lowerMessage.includes('performance') || lowerMessage.includes('agent')) {
    response += "Les performances des agents sont disponibles dans les rapports détaillés.";
  } else {
    response += "Je peux vous aider à analyser les requêtes, identifier les goulots d'étranglement et optimiser votre gestion. Que souhaitez-vous savoir ?";
  }
  
  return successResponse({
    message: response,
    suggestions: [
      'Analyser les goulots d\'étranglement',
      'Identifier les requêtes en retard',
      'Faire un bilan de satisfaction'
    ],
    metadata: {
      fallback: true,
      timestamp: new Date().toISOString(),
    }
  });
}
