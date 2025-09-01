-- Migration 002: Ajouter atelier_id à la table employees
-- Date: 2024-12-19
-- Description: Ajout de la colonne atelier_id à la table employees et migration des données existantes

-- Ajouter la colonne atelier_id à la table employees
ALTER TABLE employees 
ADD COLUMN atelier_id INT DEFAULT NULL AFTER atelier_chef_id;

-- Ajouter l'index pour performance
ALTER TABLE employees 
ADD INDEX idx_atelier_id (atelier_id);

-- Ajouter la contrainte de clé étrangère
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_atelier 
FOREIGN KEY (atelier_id) REFERENCES ateliers(id) ON DELETE RESTRICT;

-- Migrer les données existantes : déduire atelier_id à partir de atelier_chef_id
-- Si un employé a un atelier_chef_id, on récupère l'atelier de ce chef
UPDATE employees e
INNER JOIN users u ON e.atelier_chef_id = u.id
INNER JOIN atelier_chefs ac ON u.id = ac.user_id
SET e.atelier_id = ac.atelier_id
WHERE e.atelier_id IS NULL AND e.atelier_chef_id IS NOT NULL;

-- Pour les employés qui n'ont pas de chef assigné, essayer de déduire l'atelier par le nom
-- Créer d'abord les ateliers manquants basés sur les données existantes
INSERT IGNORE INTO ateliers (nom, description, localisation, responsable)
SELECT DISTINCT 
  atelier as nom,
  CONCAT('Atelier ', atelier) as description,
  'Localisation à définir' as localisation,
  'Responsable à définir' as responsable
FROM employees 
WHERE atelier IS NOT NULL AND atelier != '';

-- Maintenant assigner atelier_id basé sur le nom de l'atelier
UPDATE employees e
INNER JOIN ateliers a ON e.atelier = a.nom
SET e.atelier_id = a.id
WHERE e.atelier_id IS NULL AND e.atelier IS NOT NULL AND e.atelier != '';

-- Vérifier qu'il n'y a pas d'employés sans atelier_id
-- SELECT COUNT(*) as employes_sans_atelier FROM employees WHERE atelier_id IS NULL; 