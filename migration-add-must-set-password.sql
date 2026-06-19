-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Ajout de la colonne must_set_password
-- ═══════════════════════════════════════════════════════════════

-- Ajouter la colonne must_set_password si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'must_set_password'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN must_set_password BOOLEAN DEFAULT true;
    
    RAISE NOTICE 'Colonne must_set_password ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne must_set_password existe déjà';
  END IF;
END $$;

-- Mettre à jour les utilisateurs existants qui ont déjà un auth_user_id
-- (ils ont déjà défini leur mot de passe)
UPDATE users 
SET must_set_password = false 
WHERE auth_user_id IS NOT NULL;

-- Afficher un résumé
DO $$
DECLARE
  total_users INTEGER;
  users_with_password INTEGER;
  users_without_password INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_password FROM users WHERE must_set_password = false;
  SELECT COUNT(*) INTO users_without_password FROM users WHERE must_set_password = true;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'MIGRATION TERMINÉE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Total utilisateurs: %', total_users;
  RAISE NOTICE 'Avec mot de passe défini: %', users_with_password;
  RAISE NOTICE 'Sans mot de passe: %', users_without_password;
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
