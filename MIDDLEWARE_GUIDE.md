# 🔐 Guide du Middleware d'Authentification

## 📚 Vue d'ensemble

Le middleware d'authentification fournit des fonctions réutilisables pour sécuriser vos API routes avec vérification JWT, contrôle des rôles et des permissions.

## 🎯 Fonctions disponibles

### 1. `getUserFromRequest(request)`
Extrait et vérifie le token JWT de la requête.

**Retourne:** `AuthenticatedUser | null`

```typescript
const user = await getUserFromRequest(request);
if (!user) {
  // Non authentifié
}
```

### 2. `requireAuth(request)`
Vérifie que l'utilisateur est authentifié et actif.

**Retourne:** `{ error: NextResponse | null, user: AuthenticatedUser | null }`

```typescript
const { error, user } = await requireAuth(request);
if (error) return error;

// Utilisateur authentifié - continuer
```

### 3. `requireRole(request, allowedRoles)`
Vérifie que l'utilisateur a l'un des rôles autorisés.

**Paramètres:**
- `allowedRoles`: `string[]` - Liste des rôles autorisés (ex: `['admin', 'agent']`)

**Retourne:** `{ error: NextResponse | null, user: AuthenticatedUser | null }`

```typescript
const { error, user } = await requireRole(request, ['admin', 'chef_service']);
if (error) return error;

// Utilisateur a le bon rôle
```

### 4. `requirePermission(request, requiredPermission)`
Vérifie que l'utilisateur a une permission spécifique.

**Paramètres:**
- `requiredPermission`: `string` - Permission requise (ex: `'manage_users'`)

**Retourne:** `{ error: NextResponse | null, user: AuthenticatedUser | null }`

```typescript
const { error, user } = await requirePermission(request, 'delete_requests');
if (error) return error;

// Utilisateur a la permission
```

### 5. `canAccessRequest(user, requestId)`
Vérifie si un utilisateur peut accéder à une requête spécifique.

**Règles:**
- Admin: Accès total
- Étudiant: Seulement ses propres requêtes
- Agent/Chef: Requêtes de son service ou assignées à lui

**Retourne:** `Promise<boolean>`

```typescript
const hasAccess = await canAccessRequest(user, requestId);
if (!hasAccess) {
  return errorResponse('Accès refusé', ErrorCodes.FORBIDDEN, 403);
}
```

---

## 💡 Exemples d'utilisation

### Exemple 1 : Route protégée simple
```typescript
import { requireAuth } from '@/lib/middleware/auth.middleware';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  // Logique de la route...
  return successResponse({ user });
}
```

### Exemple 2 : Route avec vérification de rôle
```typescript
import { requireRole } from '@/lib/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  // Seuls les admins et chefs de service
  const { error, user } = await requireRole(request, ['admin', 'chef_service']);
  if (error) return error;

  // Logique de la route...
}
```

### Exemple 3 : Route avec contrôle d'accès aux requêtes
```typescript
import { requireAuth, canAccessRequest } from '@/lib/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  // Vérifier l'accès à la requête
  const hasAccess = await canAccessRequest(user!, params.id);
  if (!hasAccess) {
    return errorResponse('Accès refusé', ErrorCodes.FORBIDDEN, 403);
  }

  // Logique de la route...
}
```

### Exemple 4 : Route avec permission
```typescript
import { requirePermission } from '@/lib/middleware/auth.middleware';

export async function DELETE(request: NextRequest) {
  const { error, user } = await requirePermission(request, 'delete_users');
  if (error) return error;

  // Logique de suppression...
}
```

---

## 🔑 Interface AuthenticatedUser

```typescript
interface AuthenticatedUser {
  id: string;                    // UUID de l'utilisateur
  auth_user_id: string;          // UUID Supabase Auth
  email: string;
  first_name: string;
  last_name: string;
  role: {
    id: string;
    name: string;                // 'admin', 'agent', 'chef_service', 'etudiant'
    permissions: string[];       // Liste des permissions
  };
  service_id?: string;           // UUID du service (optionnel)
  is_active: boolean;
}
```

---

## 🎭 Rôles disponibles

- **admin** - Accès complet au système
- **chef_service** - Gestion d'un service spécifique
- **agent** - Traitement des requêtes
- **etudiant** - Soumission et suivi de requêtes

---

## 🛡️ Permissions communes

- `view_all_requests` - Voir toutes les requêtes
- `manage_requests` - Créer/modifier des requêtes
- `assign_requests` - Assigner des requêtes
- `change_status` - Changer le statut des requêtes
- `manage_users` - Gérer les utilisateurs
- `delete_requests` - Supprimer des requêtes
- `view_statistics` - Voir les statistiques

---

## 📝 Bonnes pratiques

1. **Toujours vérifier l'authentification en premier**
   ```typescript
   const { error, user } = await requireAuth(request);
   if (error) return error;
   ```

2. **Utiliser requireRole pour les routes sensibles**
   ```typescript
   const { error, user } = await requireRole(request, ['admin']);
   if (error) return error;
   ```

3. **Vérifier l'accès aux ressources spécifiques**
   ```typescript
   const hasAccess = await canAccessRequest(user!, requestId);
   if (!hasAccess) return errorResponse(...);
   ```

4. **Gérer le cas où user peut être null**
   ```typescript
   // Utiliser user! après vérification d'erreur
   if (error) return error;
   console.log(user!.email); // Safe
   ```

---

## 🔍 Débogage

Pour déboguer les problèmes d'authentification, vérifiez:

1. **Token dans le header**
   ```
   Authorization: Bearer <token>
   ```

2. **Token valide et non expiré**
   - Vérifier dans Supabase Dashboard

3. **Utilisateur existe dans la table users**
   - Vérifier le lien auth_user_id

4. **Utilisateur est actif**
   - Colonne is_active = true

---

## 🚨 Codes d'erreur

- `UNAUTHORIZED` (401) - Non authentifié
- `FORBIDDEN` (403) - Pas les permissions nécessaires
- `NOT_FOUND` (404) - Utilisateur non trouvé

---

## 📦 Import

```typescript
// Import individuel
import { requireAuth, requireRole } from '@/lib/middleware/auth.middleware';

// Import global
import { requireAuth, requireRole, canAccessRequest } from '@/lib/middleware';
```
