import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateContent, isGeminiAvailable, MODELS } from '@/lib/gemini';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/ai/generate-response - Générer une réponse automatique
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  console.log('\n✨ === [AI GENERATE RESPONSE] Démarrage ===');
  
  try {
    console.log('[1/5] 📥 Parsing body...');
    const body = await parseRequestBody(request);
    const { requestId, customPrompt } = body;

    if (!requestId) {
      return errorResponse(
        'ID de requête requis',
        ErrorCodes.INVALID_INPUT,
        400
      );
    }

    console.log('[2/5] ✅ Request ID:', requestId);

    // Récupérer la requête
    const { data: requestData, error: fetchError } = await supabase
      .from('requests')
      .select(`
        *,
        student:users!requests_student_id_fkey(first_name, last_name, niveau, filiere),
        category:request_categories(name, description),
        comments:request_comments(content, created_at, user:users(first_name, last_name))
      `)
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      return errorResponse(
        'Requête non trouvée',
        ErrorCodes.NOT_FOUND,
        404
      );
    }

    console.log('[3/5] ✅ Requête récupérée:', requestData.title);

    // Vérifier si Gemini est disponible
    if (!isGeminiAvailable()) {
      console.log('[4/5] ⚠️ Gemini non disponible - Mode fallback');
      return getFallbackResponse(requestData);
    }

    console.log('[4/5] 🔑 Gemini disponible');

    // Construire le prompt
    const prompt = buildResponsePrompt(requestData, customPrompt);
    console.log('[4/5] 📝 Prompt construit');

    // Générer la réponse
    console.log('[5/5] 🚀 Génération de la réponse...');
    const response = await generateContent(prompt, MODELS.FLASH);

    console.log('[5/5] ✅ Réponse générée:', response.length, 'caractères');

    // Nettoyer la réponse (enlever markdown si présent)
    const cleanResponse = response
      .replace(/```/g, '')
      .replace(/\*\*/g, '')
      .trim();

    console.log('✅✨ SUCCÈS: Réponse générée');
    console.log('=== [AI GENERATE RESPONSE] Terminé ===\n');

    return successResponse({
      response: cleanResponse,
      metadata: {
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        requestReference: requestData.reference,
        category: requestData.category?.name
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

function buildResponsePrompt(requestData: any, customPrompt?: string): string {
  const commentsText = requestData.comments && requestData.comments.length > 0
    ? requestData.comments.map((c: any) => 
        `- ${c.user?.first_name} ${c.user?.last_name}: ${c.content}`
      ).join('\n')
    : 'Aucun commentaire';

  return `Tu es un assistant virtuel d'une université qui aide à rédiger des réponses professionnelles aux requêtes étudiantes.

**CONTEXTE DE LA REQUÊTE :**
- Référence: ${requestData.reference}
- Catégorie: ${requestData.category?.name}
- Titre: ${requestData.title}
- Description: ${requestData.description}

**INFORMATIONS ÉTUDIANT :**
- Nom: ${requestData.student?.first_name} ${requestData.student?.last_name}
- Niveau: ${requestData.student?.niveau || 'Non spécifié'}
- Filière: ${requestData.student?.filiere || 'Non spécifiée'}

**HISTORIQUE DES ÉCHANGES :**
${commentsText}

${customPrompt ? `**INSTRUCTION SPÉCIALE :**\n${customPrompt}\n` : ''}

**CONSIGNES DE RÉDACTION :**
1. Ton professionnel et courtois
2. S'adresser à l'étudiant par son nom
3. Répondre de manière claire et concise
4. Proposer une solution concrète ou expliquer les prochaines étapes
5. Inclure les informations de contact si nécessaire
6. Terminer par une formule de politesse appropriée

**FORMAT :**
Rédige une réponse complète et professionnelle, prête à être envoyée à l'étudiant.
Ne pas inclure d'objet d'email, juste le corps du message.
Maximum 250 mots.

Réponds directement sans markdown ni formatage spécial.`;
}

function getFallbackResponse(requestData: any) {
  const studentName = `${requestData.student?.first_name} ${requestData.student?.last_name}`;
  const category = requestData.category?.name || 'votre demande';
  
  let response = `Bonjour ${studentName},\n\n`;
  response += `Nous accusons réception de votre requête concernant ${category}.\n\n`;
  
  // Réponse selon la catégorie
  if (category.toLowerCase().includes('attestation')) {
    response += `Votre demande d'attestation est en cours de traitement. Nous faisons le nécessaire pour vous la délivrer dans les meilleurs délais.\n\n`;
    response += `Vous serez notifié(e) dès que votre document sera prêt. Vous pourrez ensuite le récupérer au service Scolarité.\n\n`;
  } else if (category.toLowerCase().includes('note')) {
    response += `Votre réclamation de note a été transmise au département pédagogique concerné pour vérification.\n\n`;
    response += `Un retour vous sera fait dans les 72 heures suivant l'analyse de votre dossier.\n\n`;
  } else if (category.toLowerCase().includes('paiement')) {
    response += `Votre demande concernant un problème de paiement est en cours d'examen par notre service financier.\n\n`;
    response += `Nous vous contacterons rapidement pour clarifier la situation et trouver une solution.\n\n`;
  } else {
    response += `Votre demande est actuellement en cours de traitement par nos services.\n\n`;
    response += `Nous mettons tout en œuvre pour vous apporter une réponse satisfaisante dans les plus brefs délais.\n\n`;
  }
  
  response += `N'hésitez pas à nous contacter si vous avez des questions supplémentaires.\n\n`;
  response += `Cordialement,\n`;
  response += `Le Service IUC`;

  return successResponse({
    response,
    metadata: {
      fallback: true,
      timestamp: new Date().toISOString(),
      requestReference: requestData.reference,
      reason: 'Gemini API non disponible'
    }
  });
}
