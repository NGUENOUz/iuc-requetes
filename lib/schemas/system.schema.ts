import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SCHÉMAS ZOD - ÉVALUATIONS, IA ET SYSTÈME
// ═══════════════════════════════════════════════════════════════

// Schéma des évaluations de satisfaction
export const requestRatingSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid(),
  student_id: z.string().uuid(),
  agent_id: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1, 'La note minimum est 1').max(5, 'La note maximum est 5'),
  comment: z.string().nullable().optional(),
  response_quality: z.number().int().min(1).max(5).nullable().optional(),
  speed_rating: z.number().int().min(1).max(5).nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma pour créer une évaluation
export const createRatingSchema = z.object({
  request_id: z.string().uuid(),
  rating: z.number().int().min(1, 'La note minimum est 1').max(5, 'La note maximum est 5'),
  comment: z.string().max(500).optional(),
  response_quality: z.number().int().min(1).max(5).optional(),
  speed_rating: z.number().int().min(1).max(5).optional(),
});

// Schéma des suggestions IA
export const aiSuggestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['optimization', 'alert', 'recommendation']),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'applied', 'dismissed']).default('pending'),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  impact: z.string().nullable().optional(),
  recommended_action: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schéma pour créer une suggestion
export const createSuggestionSchema = z.object({
  type: z.enum(['optimization', 'alert', 'recommendation']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  impact: z.string().optional(),
  recommended_action: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Schéma pour mettre à jour le statut d'une suggestion
export const updateSuggestionStatusSchema = z.object({
  status: z.enum(['pending', 'applied', 'dismissed']),
});

// Schéma des templates de réponses IA
export const aiResponseTemplateSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  template: z.string().min(1),
  variables: z.record(z.any()).nullable().optional(),
  usage_count: z.number().int().default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schéma pour créer un template
export const createTemplateSchema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  template: z.string().min(1),
  variables: z.record(z.any()).optional(),
});

// Schéma des notifications
export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  link: z.string().nullable().optional(),
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma pour créer une notification
export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  link: z.string().optional(),
});

// Schéma pour marquer comme lu
export const markAsReadSchema = z.object({
  notification_ids: z.array(z.string().uuid()).min(1),
});

// Schéma des paramètres système
export const systemSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schéma pour mettre à jour un paramètre
export const updateSettingSchema = z.object({
  value: z.string().min(1),
});

// Schéma du journal d'activité
export const activityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  action: z.string().min(1).max(100),
  entity_type: z.string().max(50).nullable().optional(),
  entity_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma pour créer un log
export const createActivityLogSchema = z.object({
  action: z.string().min(1).max(100),
  entity_type: z.string().max(50).optional(),
  entity_id: z.string().uuid().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Schéma des statistiques quotidiennes
export const dailyStatisticsSchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
  total_requests: z.number().int().default(0),
  resolved_requests: z.number().int().default(0),
  pending_requests: z.number().int().default(0),
  average_resolution_time_hours: z.number().nullable().optional(),
  sla_breach_count: z.number().int().default(0),
  average_satisfaction_rating: z.number().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma pour les filtres de statistiques
export const statisticsFilterSchema = z.object({
  date_from: z.string().date(),
  date_to: z.string().date(),
  service_id: z.string().uuid().optional(),
  agent_id: z.string().uuid().optional(),
});

// Types TypeScript
export type RequestRating = z.infer<typeof requestRatingSchema>;
export type CreateRating = z.infer<typeof createRatingSchema>;
export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;
export type CreateSuggestion = z.infer<typeof createSuggestionSchema>;
export type UpdateSuggestionStatus = z.infer<typeof updateSuggestionStatusSchema>;
export type AiResponseTemplate = z.infer<typeof aiResponseTemplateSchema>;
export type CreateTemplate = z.infer<typeof createTemplateSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type MarkAsRead = z.infer<typeof markAsReadSchema>;
export type SystemSetting = z.infer<typeof systemSettingSchema>;
export type UpdateSetting = z.infer<typeof updateSettingSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;
export type CreateActivityLog = z.infer<typeof createActivityLogSchema>;
export type DailyStatistics = z.infer<typeof dailyStatisticsSchema>;
export type StatisticsFilter = z.infer<typeof statisticsFilterSchema>;
