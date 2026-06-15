import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SCHÉMAS ZOD - UTILISATEURS ET RÔLES
// ═══════════════════════════════════════════════════════════════

// Schéma des rôles
export const roleSchema = z.object({
  id: z.string().uuid(),
  name: z.enum(['admin', 'agent', 'chef_service', 'etudiant']),
  description: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

// Schéma des services
export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Le nom est requis').max(100),
  code: z.string().min(1).max(20),
  description: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schéma utilisateur complet
export const userSchema = z.object({
  id: z.string().uuid(),
  auth_user_id: z.string().uuid().nullable().optional(),
  role_id: z.string().uuid(),
  service_id: z.string().uuid().nullable().optional(),
  
  // Informations générales
  matricule: z.string().min(1, 'Le matricule est requis').max(50),
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().max(20).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  
  // Pour les étudiants
  niveau: z.string().max(50).nullable().optional(),
  filiere: z.string().max(100).nullable().optional(),
  annee_academique: z.string().max(20).nullable().optional(),
  
  // Pour le personnel
  fonction: z.string().max(100).nullable().optional(),
  specialite: z.string().max(100).nullable().optional(),
  date_embauche: z.string().date().nullable().optional(),
  
  // Statut et métadonnées
  is_active: z.boolean().default(true),
  last_login: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schémas pour création/mise à jour
export const createUserSchema = userSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  last_login: true,
});

export const updateUserSchema = createUserSchema.partial();

// Schéma de login
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// Schéma d'inscription étudiant
export const registerStudentSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis'),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone: z.string().optional(),
  niveau: z.string().min(1, 'Le niveau est requis'),
  filiere: z.string().min(1, 'La filière est requise'),
  annee_academique: z.string().optional(),
});

// Schéma d'inscription personnel
export const registerStaffSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis'),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone: z.string().optional(),
  role_id: z.string().uuid(),
  service_id: z.string().uuid(),
  fonction: z.string().min(1, 'La fonction est requise'),
  specialite: z.string().optional(),
  date_embauche: z.string().date().optional(),
});

// Types TypeScript générés automatiquement
export type Role = z.infer<typeof roleSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Login = z.infer<typeof loginSchema>;
export type RegisterStudent = z.infer<typeof registerStudentSchema>;
export type RegisterStaff = z.infer<typeof registerStaffSchema>;
