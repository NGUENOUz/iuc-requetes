# 🤖 API Gemini - IUC Requêtes

## 📡 Endpoints disponibles

### 1. 💬 Chat Assistant IA
**POST** `/api/ai/chat`

Discuter avec l'assistant IA pour obtenir des analyses et recommandations.

**Body:**
```json
{
  "message": "Quels agents sont surchargés ?",
  "context": {
    "serviceId": "uuid",
    "period": "7d"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Après analyse...",
    "suggestions": [
      "Réassigner 2 dossiers",
      "Voir le profil de l'agent"
    ],
    "metrics": [
      {
        "label": "TAMBA Eric",
        "value": "12 actifs (Élevé)",
        "color": "text-red-600 bg-red-50 border-red-100"
      }
    ],
    "metadata": {
      "model": "gemini-1.5-flash",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Cas d'usage:**
- Analyser la charge de travail
- Identifier les goulots d'étranglement
- Obtenir des recommandations
- Poser des questions sur les données

---

### 2. 💡 Générer des Suggestions
**POST** `/api/ai/suggest`

Générer automatiquement des suggestions d'optimisation basées sur l'analyse du système.

**Body:** Aucun (analyse automatique)

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "alert",
        "priority": "high",
        "title": "Surcharge détectée - Service Scolarité",
        "description": "TAMBA Eric gère 12 dossiers...",
        "impact": "4 requêtes à risque",
        "action": "Réassigner 2-3 dossiers à FOUDA Martine"
      }
    ],
    "metadata": {
      "model": "gemini-1.5-flash",
      "timestamp": "2024-01-15T10:30:00Z",
      "saved": true
    }
  }
}
```

**Types de suggestions:**
- `alert` - Problème urgent
- `optimization` - Amélioration d'efficacité
- `recommendation` - Suggestion d'amélioration

**Priorités:**
- `high` - Action urgente
- `medium` - Important mais non critique
- `low` - Amélioration à long terme

---

### 3. ✍️ Générer une Réponse
**POST** `/api/ai/generate-response`

Générer automatiquement une réponse professionnelle à une requête étudiant.

**Body:**
```json
{
  "requestId": "uuid-de-la-requete",
  "customPrompt": "Ajouter une excuse pour le retard" // Optionnel
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Bonjour Monsieur NGUENOU,\n\nNous accusons réception...",
    "metadata": {
      "model": "gemini-1.5-flash",
      "timestamp": "2024-01-15T10:30:00Z",
      "requestReference": "REQ-1248",
      "category": "Réclamation de note"
    }
  }
}
```

**Cas d'usage:**
- Générer des réponses types
- Rédiger des emails de relance
- Créer des réponses personnalisées
- Gagner du temps sur les réponses standard

---

### 4. 📊 Analyser les Données
**POST** `/api/ai/analyze`

Analyser en profondeur les données selon différents axes.

**Body:**
```json
{
  "analysisType": "performance",
  "period": "30d",
  "filters": {
    "serviceId": "uuid",
    "categoryId": "uuid"
  }
}
```

**Types d'analyse supportés:**
- `performance` - Performance globale du système
- `trends` - Tendances et évolutions
- `satisfaction` - Satisfaction des étudiants
- `workload` - Charge de travail des agents
- `sla` - Respect des SLA

**Périodes:**
- `7d` - 7 derniers jours
- `30d` - 30 derniers jours
- `90d` - 90 derniers jours
- `all` - Depuis le début (défaut)

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisType": "performance",
    "summary": "Le système affiche une performance solide...",
    "insights": [
      {
        "title": "Taux de résolution élevé",
        "description": "92% des requêtes résolues dans les délais",
        "impact": "high"
      }
    ],
    "recommendations": [
      {
        "title": "Optimiser les pics de charge",
        "action": "Mettre en place une permanence renforcée 10h-12h",
        "priority": "medium",
        "expectedImpact": "Réduction de 15% du temps d'attente"
      }
    ],
    "data": {
      "totalRequests": 450,
      "resolvedRequests": 415,
      "resolutionRate": 92
    },
    "metadata": {
      "model": "gemini-1.5-flash",
      "timestamp": "2024-01-15T10:30:00Z",
      "period": "30d"
    }
  }
}
```

---

## 🔧 Configuration

### Variables d'environnement

Ajouter dans `.env.local`:
```env
GEMINI_API_KEY=votre_cle_api_gemini
# OU
GOOGLE_AI_API_KEY=votre_cle_api_gemini
```

### Obtenir une clé API

1. Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Se connecter avec un compte Google
3. Créer une nouvelle clé API
4. Copier la clé dans `.env.local`

---

## 🛡️ Sécurité

- ✅ Toutes les routes nécessitent l'authentification
- ✅ Certaines routes (suggest, analyze) nécessitent le rôle admin
- ✅ Rate limiting recommandé en production
- ✅ Validation des entrées avec Zod

---

## 🔄 Mode Fallback

Si Gemini n'est pas disponible (clé manquante, erreur API), toutes les routes **fonctionnent quand même** avec des réponses de secours intelligentes.

**Avantages:**
- Pas de crash de l'application
- Réponses cohérentes toujours disponibles
- Transition transparente vers Gemini quand disponible

---

## 📈 Modèles utilisés

- **gemini-1.5-flash** - Modèle par défaut (rapide et efficace)
- **gemini-1.5-pro** - Disponible pour analyses complexes

Configuration dans `lib/gemini.ts`:
```typescript
export const MODELS = {
  FLASH: 'gemini-1.5-flash',
  PRO: 'gemini-1.5-pro',
};
```

---

## 💡 Exemples d'utilisation

### Chat simple
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Analyse la charge de Eric Tamba"}'
```

### Générer des suggestions
```bash
curl -X POST http://localhost:3000/api/ai/suggest \
  -H "Authorization: Bearer <token>"
```

### Générer une réponse
```bash
curl -X POST http://localhost:3000/api/ai/generate-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"requestId": "uuid-de-la-requete"}'
```

### Analyser les tendances
```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"analysisType": "trends", "period": "30d"}'
```

---

## 🚀 Intégration Frontend

### Exemple avec React Query
```typescript
import { useMutation } from '@tanstack/react-query';

const useAIChat = () => {
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return response.json();
    }
  });
};

// Utilisation
const { mutate: sendMessage, data } = useAIChat();
sendMessage("Quels agents sont surchargés ?");
```

---

## 📝 Notes importantes

1. **Coûts:** Gemini a des limites gratuites généreuses, mais surveillez votre usage
2. **Performance:** gemini-1.5-flash répond en ~1-2 secondes
3. **Contexte:** Les API ont accès aux données en temps réel de votre base Supabase
4. **Logs:** Tous les appels sont loggés dans la console pour debugging
5. **Fallback:** Toujours disponible même sans clé API

---

## 🎯 Prochaines étapes

1. ✅ Obtenir une clé API Gemini
2. ✅ Ajouter dans `.env.local`
3. ✅ Tester les endpoints avec Postman
4. ✅ Intégrer dans les pages Assistant IA et Suggestions
5. ✅ Configurer le rate limiting en production
