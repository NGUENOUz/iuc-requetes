-- ═══════════════════════════════════════════════════════════════
-- VÉRIFICATION DES RÔLES ET UTILISATEURS
-- ═══════════════════════════════════════════════════════════════

-- Afficher tous les rôles
SELECT 
  id,
  name,
  description,
  created_at
FROM roles
ORDER BY name;

-- Afficher les utilisateurs avec leurs rôles
SELECT 
  u.id,
  u.email,
  u.matricule,
  u.first_name,
  u.last_name,
  r.name as role_name,
  u.is_active,
  u.must_set_password,
  u.auth_user_id IS NOT NULL as has_auth_account
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY r.name, u.email;

-- Vérifier spécifiquement l'admin
SELECT 
  u.id,
  u.email,
  u.matricule,
  r.name as role_name,
  r.id as role_id
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email LIKE '%admin%' OR r.name = 'admin';

-- Vérifier si le nom du rôle a des espaces ou caractères bizarres
SELECT 
  id,
  name,
  LENGTH(name) as name_length,
  ASCII(name) as first_char_ascii,
  name = 'admin' as is_exactly_admin,
  LOWER(TRIM(name)) as normalized_name
FROM roles;
