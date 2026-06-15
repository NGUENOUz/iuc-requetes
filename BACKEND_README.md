# 🔧 Backend Architecture - IUC Requêtes

## 📁 Structure des dossiers

```
lib/
├── schemas/           # Schémas Zod de validation
│   ├── user.schema.ts       # Utilisateurs, rôles, services
│   ├── request.schema.ts    # Requêtes, catégories, statuts
│   ├── system.schema.ts     # IA, notifications, paramètres
│   └── index.ts             # Export centralisé
├── utils/             # Fonctions utilitaires
│   └── api.utils.ts         # Helpers pour les API routes
└── supabase.ts        # Configuration du client Supabase
```

## 🎯 Schémas Zod disponibles

### Utilisateurs
- `userSchema` - Schéma complet d'un utilisateur
- `createUserSchema` - Création d'utilisateur
- `updateUserSchema` - Mise à jour d'utilisateur
- `loginSchema` - Connexion
- `registerStudentSchema` - Inscription étudiant
- `registerStaffSchema` - Inscription personnel

### Requêtes
- `requestSchema` - Schéma complet d'une requête
- `createRequestSchema` - Création de requête
- `updateRequestSchema` - Mise à jour de requête
- `assignRequestSchema` - Assignation à un agent
- `changeStatusSchema` - Changement de statut
- `filterRequestsSchema` - Filtres de recherche
- `createCommentSchema` - Ajout de commentaire

### Système
- `createRatingSchema` - Évaluation de satisfaction
- `createSuggestionSchema` - Suggestion IA
- `createNotificationSchema` - Notification
- `updateSettingSchema` - Paramètre système
- `createActivityLogSchema` - Log d'activité

## 🚀 Utilisation des schémas

```typescript
import { createRequestSchema, CreateRequest } from '@/lib/schemas';

// Validation des données
const result = createRequestSchema.safeParse(data);

if (!result.success) {
  // Gérer les erreurs de validation
  console.error(result.error);
}

// Utiliser les données validées
const validatedData: CreateRequest = result.data;
```

## 🔐 Client Supabase

```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Client standard (côté client)
const { data, error } = await supabase
  .from('requests')
  .select('*');

// Client admin (côté serveur)
const { data, error } = await supabaseAdmin
  .from('users')
  .insert(userData);
```

## 📡 Utilitaires API

```typescript
import { 
  successResponse, 
  errorResponse, 
  handleError,
  getPaginationParams 
} from '@/lib/utils/api.utils';

export async function GET(request: Request) {
  try {
    const { page, limit, offset } = getPaginationParams(
      new URL(request.url).searchParams
    );
    
    // Votre logique...
    
    return successResponse(data, { page, limit, total });
  } catch (error) {
    return handleError(error);
  }
}
```

## 🔑 Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## ✅ Prochaines étapes

1. Configurer Supabase (créer le projet et la base de données)
2. Créer les API routes dans `app/api/`
3. Implémenter l'authentification
4. Tester les endpoints avec Postman/Thunder Client
