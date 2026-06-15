# 🚀 API Routes - IUC Requêtes

## 📡 Liste complète des endpoints

### 🔐 Authentication (`/api/auth`)

#### POST `/api/auth/login`
Connexion utilisateur
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/register`
Inscription utilisateur (étudiant ou personnel)
```json
{
  "matricule": "IUC2024001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+237123456789",
  "niveau": "L3",
  "filiere": "Informatique"
}
```

#### POST `/api/auth/logout`
Déconnexion utilisateur

---

### 📝 Requests (`/api/requests`)

#### GET `/api/requests`
Récupérer toutes les requêtes avec filtres
**Query params:**
- `status_id` - Filtrer par statut
- `category_id` - Filtrer par catégorie
- `priority_id` - Filtrer par priorité
- `assigned_to` - Filtrer par agent assigné
- `service_id` - Filtrer par service
- `student_id` - Filtrer par étudiant
- `search` - Recherche textuelle
- `is_sla_breached` - Filtrer les dépassements SLA
- `date_from` - Date de début
- `date_to` - Date de fin
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre d'éléments par page (défaut: 20, max: 100)
- `sort_by` - Trier par (submitted_at, due_date, updated_at)
- `sort_order` - Ordre de tri (asc, desc)

#### POST `/api/requests`
Créer une nouvelle requête
```json
{
  "category_id": "uuid",
  "priority_id": "uuid",
  "title": "Demande d'attestation de scolarité",
  "description": "J'ai besoin d'une attestation...",
  "tags": ["attestation", "urgent"],
  "metadata": {}
}
```

#### GET `/api/requests/[id]`
Récupérer une requête spécifique avec tous les détails

#### PATCH `/api/requests/[id]`
Mettre à jour une requête
```json
{
  "title": "Nouveau titre",
  "description": "Nouvelle description",
  "priority_id": "uuid"
}
```

#### DELETE `/api/requests/[id]`
Supprimer une requête

---

### 💬 Comments (`/api/requests/[id]/comments`)

#### GET `/api/requests/[id]/comments`
Récupérer tous les commentaires d'une requête

#### POST `/api/requests/[id]/comments`
Ajouter un commentaire
```json
{
  "content": "Voici ma réponse...",
  "is_internal": false
}
```

---

### 👤 Assignment (`/api/requests/[id]/assign`)

#### POST `/api/requests/[id]/assign`
Assigner une requête à un agent
```json
{
  "assigned_to": "agent_uuid"
}
```

---

### 🔄 Status (`/api/requests/[id]/status`)

#### POST `/api/requests/[id]/status`
Changer le statut d'une requête
```json
{
  "status_id": "status_uuid",
  "comment": "Commentaire optionnel"
}
```

---

### 👥 Users (`/api/users`)

#### GET `/api/users`
Récupérer tous les utilisateurs
**Query params:**
- `role_id` - Filtrer par rôle
- `service_id` - Filtrer par service
- `is_active` - Filtrer par statut actif
- `search` - Recherche textuelle
- `page` - Numéro de page
- `limit` - Nombre d'éléments par page

---

### 🏢 Services (`/api/services`)

#### GET `/api/services`
Récupérer tous les services/départements
**Query params:**
- `is_active` - Filtrer par services actifs

---

### 🏷️ Categories (`/api/categories`)

#### GET `/api/categories`
Récupérer toutes les catégories de requêtes
**Query params:**
- `service_id` - Filtrer par service
- `is_active` - Filtrer par catégories actives

---

### 🔔 Notifications (`/api/notifications`)

#### GET `/api/notifications`
Récupérer les notifications de l'utilisateur connecté
**Query params:**
- `is_read` - Filtrer par statut lu/non lu
- `page` - Numéro de page
- `limit` - Nombre d'éléments par page

#### PATCH `/api/notifications?id=[uuid]`
Marquer une notification comme lue

#### PATCH `/api/notifications?mark_all=true`
Marquer toutes les notifications comme lues

---

### 📊 Statistics (`/api/statistics`)

#### GET `/api/statistics`
Récupérer les statistiques globales
**Query params:**
- `service_id` - Filtrer par service
- `agent_id` - Filtrer par agent
- `date_from` - Date de début
- `date_to` - Date de fin

**Retourne:**
```json
{
  "overview": {
    "total_requests": 150,
    "resolved_requests": 120,
    "pending_requests": 30,
    "sla_breaches": 5,
    "avg_resolution_time_hours": 38.5,
    "avg_satisfaction_rating": 4.3
  },
  "by_status": {...},
  "by_priority": {...},
  "by_service": {...},
  "top_agents": [...]
}
```

---

## 🔧 Format de réponse standard

### Succès
```json
{
  "success": true,
  "data": {...},
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Erreur
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erreur de validation",
    "details": [...]
  }
}
```

---

## 🔑 Authentification

Toutes les routes (sauf login/register) nécessitent un token JWT dans le header:
```
Authorization: Bearer <token>
```

---

## 📝 Notes importantes

1. ✅ Toutes les routes utilisent la validation Zod
2. ✅ Pagination automatique (défaut: 20 items/page, max: 100)
3. ✅ Gestion d'erreurs centralisée
4. ✅ Logs d'activité automatiques
5. ✅ Notifications automatiques pour les événements importants
6. ✅ Row Level Security (RLS) activé sur Supabase

---

## 🧪 Tester les API

### Avec curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Récupérer les requêtes
curl http://localhost:3000/api/requests?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

### Avec Postman/Thunder Client
Importez la collection d'endpoints ci-dessus et testez chaque route.

---

## 🚀 Prochaines étapes

1. Configurer `.env.local` avec vos clés Supabase
2. Exécuter le schéma SQL sur Supabase
3. Tester les endpoints avec Postman
4. Intégrer dans le frontend
