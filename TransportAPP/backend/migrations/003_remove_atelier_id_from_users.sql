-- Migration 003: Supprimer atelier_id de la table users
-- Date: 2024-12-19
-- Description: Suppression de la colonne atelier_id de la table users car maintenant géré via atelier_chefs

-- Vérifier que tous les chefs ont été migrés vers atelier_chefs
-- SELECT COUNT(*) as chefs_sans_atelier FROM users u 
-- LEFT JOIN atelier_chefs ac ON u.id = ac.user_id 
-- WHERE u.role = 'chef' AND ac.user_id IS NULL;

-- Supprimer la colonne atelier_id de la table users
ALTER TABLE users DROP COLUMN atelier_id;

-- Mettre à jour le rôle 'chef' vers 'chef_d_atelier' pour plus de clarté
UPDATE users SET role = 'chef_d_atelier' WHERE role = 'chef'; 