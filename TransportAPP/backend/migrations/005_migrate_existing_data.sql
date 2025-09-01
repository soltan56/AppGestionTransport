-- Migration 005: Migrer les données existantes
-- Date: 2024-12-19
-- Description: Migration des données existantes vers la nouvelle structure

-- Migrer les chefs existants vers atelier_chefs
INSERT IGNORE INTO atelier_chefs (atelier_id, user_id) 
SELECT DISTINCT atelier_id, id 
FROM users 
WHERE role = 'chef' AND atelier_id IS NOT NULL;

-- Migrer les chefs avec rôle 'chef_d_atelier' aussi
INSERT IGNORE INTO atelier_chefs (atelier_id, user_id) 
SELECT DISTINCT atelier_id, id 
FROM users 
WHERE role = 'chef_d_atelier' AND atelier_id IS NOT NULL; 