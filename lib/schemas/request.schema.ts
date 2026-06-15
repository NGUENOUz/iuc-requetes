import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SCHÉMAS ZOD - REQUÊTES
// ═══════════════════════════════════════════════════════════════

// Schéma des catégories
export const requestCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  service_id: z.string().uuid().nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  sla_hours: z.number().int().positive().default(48),
  requires_documents: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
});

// Schéma des priorités
export const prioritySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  level: z.number().int().min(1).max(4),
  color: z.string().max(20).nullable().optional(),
  sla_multiplier: z.number().default(1.0),
  created_at: z.string().datetime().optional(),
});

// Schéma des statuts
export const requestStatusSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  is_closed: z.boolean().default(false),
  order_index: z.number().int().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma requête complète
export const requestSchema = z.object({
  id: z.string().uuid(),
  reference: z.string().max(20),
  
  // Relations
  student_id: z.string().uuid(),
  category_id: z.string().uuid(),
  status_id: z.string().uuid(),
  priority_id: z.string().uuid(),
  assigned_to: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid().nullable().optional(),
  
  // Contenu
  title: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  
  // Dates
  submitted_at: z.string().datetime().optional(),
  assigned_at: z.string().datetime().nullable().optional(),
  resolved_at: z.string().datetime().nullable().optional(),
  closed_at: z.string().datetime().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  
  // Métriques
  response_time_hours: z.number().int().nullable().optional(),
  resolution_time_hours: z.number().int().nullable().optional(),
  is_sla_breached: z.boolean().default(false),
  
  // Métadonnées
  tags: z.array(z.string()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schéma pour créer une requête
export const createRequestSchema = z.object({
  category_id: z.string().uuid('Catégorie invalide'),
  priority_id: z.string().uuid('Priorité invalide'),
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(255),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Schéma pour mettre à jour une requête
export const updateRequestSchema = z.object({
  category_id: z.string().uuid().optional(),
  priority_id: z.string().uuid().optional(),
  status_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Schéma pour assigner une requête
export const assignRequestSchema = z.object({
  assigned_to: z.string().uuid('Agent invalide'),
});

// Schéma pour changer le statut
export const changeStatusSchema = z.object({
  status_id: z.string().uuid('Statut invalide'),
  comment: z.string().optional(),
});

// Schéma des commentaires
export const requestCommentSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1, 'Le commentaire ne peut pas être vide'),
  is_internal: z.boolean().default(false),
  is_system: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schéma pour créer un commentaire
export const createCommentSchema = z.object({
  request_id: z.string().uuid(),
  content: z.string().min(1, 'Le commentaire ne peut pas être vide'),
  is_internal: z.boolean().default(false),
});

// Schéma des pièces jointes
export const requestAttachmentSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1),
  file_type: z.string().max(100).nullable().optional(),
  file_size: z.number().int().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma pour filtrer les requêtes
export const filterRequestsSchema = z.object({
  status_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  priority_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  search: z.string().optional(),
  is_sla_breached: z.boolean().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.enum(['submitted_at', 'due_date', 'updated_at']).default('submitted_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Types TypeScript
export type RequestCategory = z.infer<typeof requestCategorySchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type Request = z.infer<typeof requestSchema>;
export type CreateRequest = z.infer<typeof createRequestSchema>;
export type UpdateRequest = z.infer<typeof updateRequestSchema>;
export type AssignRequest = z.infer<typeof assignRequestSchema>;
export type ChangeStatus = z.infer<typeof changeStatusSchema>;
export type RequestComment = z.infer<typeof requestCommentSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type RequestAttachment = z.infer<typeof requestAttachmentSchema>;
export type FilterRequests = z.infer<typeof filterRequestsSchema>;
