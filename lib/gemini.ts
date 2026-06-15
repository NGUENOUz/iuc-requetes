import { GoogleGenerativeAI } from '@google/generative-ai';

// ═══════════════════════════════════════════════════════════════
// CLIENT GEMINI AI
// ═══════════════════════════════════════════════════════════════

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY non définie - Mode fallback activé');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Modèles disponibles
export const MODELS = {
  FLASH: 'gemini-1.5-flash', // Rapide et efficace
  PRO: 'gemini-1.5-pro',     // Plus puissant
} as const;

// Configuration par défaut
export const DEFAULT_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Helper pour générer du contenu
export async function generateContent(
  prompt: string,
  model: string = MODELS.FLASH,
  config = DEFAULT_CONFIG
) {
  if (!genAI) {
    throw new Error('Gemini API non configurée');
  }

  const generativeModel = genAI.getGenerativeModel({ 
    model,
    generationConfig: config,
  });

  const result = await generativeModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Helper pour extraire JSON de la réponse
export function extractJSON(text: string): any {
  // Nettoyer le texte
  const cleanText = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Extraire le JSON
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Impossible d\'extraire JSON de la réponse');
  }

  return JSON.parse(jsonMatch[0]);
}

// Vérifier si l'API est disponible
export function isGeminiAvailable(): boolean {
  return genAI !== null;
}
