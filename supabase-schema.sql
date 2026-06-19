-- ═══════════════════════════════════════════════════════════════
-- SCHEMA DE BASE DE DONNÉES SUPABASE - IUC REQUÊTES
-- ═══════════════════════════════════════════════════════════════

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- 1. TABLES DES UTILISATEURS ET RÔLES
-- ═══════════════════════════════════════════════════════════════

-- Table des rôles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les rôles par défaut
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrateur système avec accès complet'),
  ('agent', 'Agent de traitement des requêtes'),
  ('chef_service', 'Chef de service avec droits de supervision'),
  ('etudiant', 'Étudiant pouvant soumettre des requêtes');

-- Table des services/départements
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisateurs (étudiants et personnel)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) NOT NULL,
  service_id UUID REFERENCES services(id),
  
  -- Informations générales
  matricule VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Pour les étudiants
  niveau VARCHAR(50), -- L1, L2, L3, M1, M2
  filiere VARCHAR(100),
  annee_academique VARCHAR(20),
  
  -- Pour le personnel
  fonction VARCHAR(100),
  specialite VARCHAR(100),
  date_embauche DATE,
  
  -- Statut et métadonnées
  is_active BOOLEAN DEFAULT true,
  must_set_password BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. TABLES DES REQUÊTES
-- ═══════════════════════════════════════════════════════════════

-- Table des catégories de requêtes
CREATE TABLE request_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  service_id UUID REFERENCES services(id),
  color VARCHAR(20),
  icon VARCHAR(50),
  sla_hours INTEGER DEFAULT 48, -- Délai SLA en heures
  requires_documents BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des priorités
CREATE TABLE priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  level INTEGER NOT NULL, -- 1=Basse, 2=Normale, 3=Haute, 4=Critique
  color VARCHAR(20),
  sla_multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les priorités par défaut
INSERT INTO priorities (name, level, color, sla_multiplier) VALUES
  ('Basse', 1, '#94a3b8', 1.5),
  ('Normale', 2, '#3b82f6', 1.0),
  ('Haute', 3, '#f59e0b', 0.7),
  ('Critique', 4, '#ef4444', 0.5);

-- Table des statuts de requêtes
CREATE TABLE request_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(20),
  is_closed BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les statuts par défaut
INSERT INTO request_statuses (name, description, color, is_closed, order_index) VALUES
  ('Soumise', 'Requête nouvellement soumise', '#64748b', false, 1),
  ('En attente', 'En attente d''assignation', '#f59e0b', false, 2),
  ('Assignée', 'Assignée à un agent', '#3b82f6', false, 3),
  ('En cours', 'En cours de traitement', '#8b5cf6', false, 4),
  ('En attente d''information', 'En attente de documents ou informations', '#f97316', false, 5),
  ('Résolue', 'Requête résolue', '#10b981', true, 6),
  ('Rejetée', 'Requête rejetée', '#ef4444', true, 7),
  ('Fermée', 'Requête fermée', '#6b7280', true, 8);

-- Table principale des requêtes
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(20) UNIQUE NOT NULL, -- REQ-XXXX
  
  -- Relations
  student_id UUID REFERENCES users(id) NOT NULL,
  category_id UUID REFERENCES request_categories(id) NOT NULL,
  status_id UUID REFERENCES request_statuses(id) NOT NULL,
  priority_id UUID REFERENCES priorities(id) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  
  -- Contenu
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Dates et délais
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Métriques
  response_time_hours INTEGER, -- Temps de première réponse
  resolution_time_hours INTEGER, -- Temps total de résolution
  is_sla_breached BOOLEAN DEFAULT false,
  
  -- Métadonnées
  tags TEXT[], -- Array de tags
  metadata JSONB, -- Données additionnelles flexibles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. TABLES DES INTERACTIONS
-- ═══════════════════════════════════════════════════════════════

-- Table des commentaires/messages
CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Note interne ou visible par l'étudiant
  is_system BOOLEAN DEFAULT false, -- Message automatique du système
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents/pièces jointes
CREATE TABLE request_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Chemin dans le storage Supabase
  file_type VARCHAR(100),
  file_size INTEGER, -- En octets
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'historique des requêtes
CREATE TABLE request_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id),
  
  action VARCHAR(100) NOT NULL, -- 'status_changed', 'assigned', 'commented', etc.
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. TABLES DE SATISFACTION ET FEEDBACK
-- ═══════════════════════════════════════════════════════════════

-- Table des évaluations de satisfaction
CREATE TABLE request_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE UNIQUE NOT NULL,
  student_id UUID REFERENCES users(id) NOT NULL,
  agent_id UUID REFERENCES users(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  response_quality INTEGER CHECK (response_quality >= 1 AND response_quality <= 5),
  speed_rating INTEGER CHECK (speed_rating >= 1 AND speed_rating <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. TABLES POUR L'IA ET SUGGESTIONS
-- ═══════════════════════════════════════════════════════════════

-- Table des suggestions IA
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  type VARCHAR(50) NOT NULL, -- 'optimization', 'alert', 'recommendation'
  priority VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'applied', 'dismissed'
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  recommended_action TEXT,
  
  metadata JSONB, -- Données contextuelles
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des templates de réponses IA
CREATE TABLE ai_response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES request_categories(id),
  
  name VARCHAR(100) NOT NULL,
  template TEXT NOT NULL,
  variables JSONB, -- Variables dynamiques du template
  usage_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 6. TABLES DE CONFIGURATION ET PARAMÈTRES
-- ═══════════════════════════════════════════════════════════════

-- Table des paramètres système
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer paramètres par défaut
INSERT INTO system_settings (key, value, description, category) VALUES
  ('sla_standard_hours', '48', 'Délai SLA standard en heures', 'sla'),
  ('sla_urgent_hours', '24', 'Délai SLA urgent en heures', 'sla'),
  ('auto_assignment_enabled', 'true', 'Activer l''assignation automatique', 'assignments'),
  ('ai_suggestions_enabled', 'true', 'Activer les suggestions IA', 'ai'),
  ('notification_email_enabled', 'true', 'Activer les notifications par email', 'notifications'),
  ('session_timeout_minutes', '30', 'Délai de déconnexion automatique', 'security');

-- Table des notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  type VARCHAR(50) NOT NULL, -- 'request_assigned', 'comment_added', 'status_changed', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du journal d'activité
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'request', 'user', 'service', etc.
  entity_id UUID,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. TABLES DE STATISTIQUES (OPTIONNEL - Pour optimisation)
-- ═══════════════════════════════════════════════════════════════

-- Table des statistiques quotidiennes
CREATE TABLE daily_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  
  total_requests INTEGER DEFAULT 0,
  resolved_requests INTEGER DEFAULT 0,
  pending_requests INTEGER DEFAULT 0,
  average_resolution_time_hours DECIMAL(10,2),
  sla_breach_count INTEGER DEFAULT 0,
  average_satisfaction_rating DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. FONCTIONS ET TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Fonction pour générer une référence unique de requête
CREATE OR REPLACE FUNCTION generate_request_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference := 'REQ-' || LPAD(NEXTVAL('request_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les références
CREATE SEQUENCE request_seq START 1000;

-- Trigger pour générer la référence
CREATE TRIGGER set_request_reference
  BEFORE INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_request_reference();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger updated_at sur toutes les tables nécessaires
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_comments_updated_at BEFORE UPDATE ON request_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer la date limite (SLA)
CREATE OR REPLACE FUNCTION calculate_due_date()
RETURNS TRIGGER AS $$
DECLARE
  sla_hours INTEGER;
  priority_multiplier DECIMAL(3,2);
BEGIN
  -- Récupérer le SLA de la catégorie
  SELECT rc.sla_hours INTO sla_hours
  FROM request_categories rc
  WHERE rc.id = NEW.category_id;
  
  -- Récupérer le multiplicateur de priorité
  SELECT p.sla_multiplier INTO priority_multiplier
  FROM priorities p
  WHERE p.id = NEW.priority_id;
  
  -- Calculer la date limite
  NEW.due_date := NEW.submitted_at + (sla_hours * priority_multiplier * INTERVAL '1 hour');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement la date limite
CREATE TRIGGER set_request_due_date
  BEFORE INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_due_date();

-- Fonction pour créer un log d'historique
CREATE OR REPLACE FUNCTION log_request_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log changement de statut
    IF OLD.status_id != NEW.status_id THEN
      INSERT INTO request_history (request_id, action, old_value, new_value, description)
      SELECT NEW.id, 'status_changed', 
        (SELECT name FROM request_statuses WHERE id = OLD.status_id),
        (SELECT name FROM request_statuses WHERE id = NEW.status_id),
        'Statut changé de ' || (SELECT name FROM request_statuses WHERE id = OLD.status_id) || 
        ' à ' || (SELECT name FROM request_statuses WHERE id = NEW.status_id);
    END IF;
    
    -- Log assignation
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO request_history (request_id, user_id, action, new_value, description)
      VALUES (NEW.id, NEW.assigned_to, 'assigned', NEW.assigned_to::TEXT, 'Requête assignée à un agent');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour logger les changements
CREATE TRIGGER log_request_changes
  AFTER UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION log_request_change();

-- ═══════════════════════════════════════════════════════════════
-- 9. INDEX POUR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_matricule ON users(matricule);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_service_id ON users(service_id);

CREATE INDEX idx_requests_reference ON requests(reference);
CREATE INDEX idx_requests_student_id ON requests(student_id);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX idx_requests_status_id ON requests(status_id);
CREATE INDEX idx_requests_category_id ON requests(category_id);
CREATE INDEX idx_requests_service_id ON requests(service_id);
CREATE INDEX idx_requests_submitted_at ON requests(submitted_at);
CREATE INDEX idx_requests_due_date ON requests(due_date);

CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_request_attachments_request_id ON request_attachments(request_id);
CREATE INDEX idx_request_history_request_id ON request_history(request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Activer RLS sur les tables principales
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (voir leur propre profil)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Politique pour les admins (voir tous les profils)
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.auth_user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Politique pour les requêtes (étudiants voient leurs requêtes)
CREATE POLICY "Students can view own requests"
  ON requests FOR SELECT
  USING (student_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Politique pour les agents (voir les requêtes de leur service)
CREATE POLICY "Agents can view service requests"
  ON requests FOR SELECT
  USING (
    assigned_to IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR
    service_id IN (SELECT service_id FROM users WHERE auth_user_id = auth.uid())
  );

-- Politique pour les admins (voir toutes les requêtes)
CREATE POLICY "Admins can view all requests"
  ON requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.auth_user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 11. DONNÉES DE TEST (OPTIONNEL)
-- ═══════════════════════════════════════════════════════════════

-- Insérer des services de test
INSERT INTO services (name, code, description, email) VALUES
  ('Scolarité', 'SCOL', 'Service de gestion de la scolarité', 'scolarite@iuc.cm'),
  ('Finance', 'FIN', 'Service financier et comptabilité', 'finance@iuc.cm'),
  ('Bibliothèque', 'BIB', 'Service de la bibliothèque', 'bibliotheque@iuc.cm'),
  ('Pédagogie', 'PED', 'Service pédagogique', 'pedagogie@iuc.cm'),
  ('IT Support', 'IT', 'Support informatique', 'it@iuc.cm');

-- Insérer des catégories de test
INSERT INTO request_categories (name, description, service_id, color, sla_hours) 
SELECT 
  'Attestation de scolarité', 
  'Demande d''attestation de scolarité',
  id,
  '#3b82f6',
  24
FROM services WHERE code = 'SCOL';

INSERT INTO request_categories (name, description, service_id, color, sla_hours) 
SELECT 
  'Réclamation de note', 
  'Contestation d''une note d''examen',
  id,
  '#ef4444',
  72
FROM services WHERE code = 'PED';

INSERT INTO request_categories (name, description, service_id, color, sla_hours) 
SELECT 
  'Problème de paiement', 
  'Questions sur les frais et paiements',
  id,
  '#10b981',
  48
FROM services WHERE code = 'FIN';

-- ═══════════════════════════════════════════════════════════════
-- FIN DU SCHEMA
-- ═══════════════════════════════════════════════════════════════
