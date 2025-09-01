-- Migration: Ajout de la fonctionnalité de consolidation des plannings hebdomadaires
-- Date: $(date +%Y-%m-%d)

-- 1. Ajouter la colonne status pour gérer les états des plannings
ALTER TABLE weekly_plannings 
ADD COLUMN status ENUM('draft', 'completed', 'consolidated') DEFAULT 'draft' 
AFTER assignments;

-- 2. Ajouter la colonne is_consolidated pour identifier les plannings consolidés
ALTER TABLE weekly_plannings 
ADD COLUMN is_consolidated BOOLEAN DEFAULT FALSE 
AFTER status;

-- 3. Ajouter la colonne consolidated_from pour tracer les sources de consolidation
ALTER TABLE weekly_plannings 
ADD COLUMN consolidated_from TEXT NULL 
AFTER is_consolidated;

-- 4. Ajouter des index pour optimiser les requêtes de consolidation
CREATE INDEX idx_status_year_week ON weekly_plannings (status, year, week_number);
CREATE INDEX idx_consolidated ON weekly_plannings (is_consolidated, year, week_number);

-- 5. Mettre à jour les plannings existants avec le status par défaut
UPDATE weekly_plannings 
SET status = 'completed' 
WHERE id IN (SELECT id FROM (SELECT id FROM weekly_plannings) as temp);

-- 6. Ajouter une contrainte pour éviter plusieurs plannings consolidés par semaine
-- Note: Cette contrainte sera gérée au niveau application pour plus de flexibilité

-- 7. Créer une vue pour faciliter les requêtes de consolidation
CREATE OR REPLACE VIEW weekly_planning_status AS
SELECT 
    year,
    week_number,
    COUNT(*) as total_plannings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_plannings,
    COUNT(CASE WHEN is_consolidated = TRUE THEN 1 END) as consolidated_plannings,
    GROUP_CONCAT(DISTINCT created_by) as chef_ids,
    MAX(updated_at) as last_updated
FROM weekly_plannings 
GROUP BY year, week_number;

-- Commentaires sur les statuts:
-- 'draft': Planning en cours de création/modification
-- 'completed': Planning terminé par le chef, prêt pour consolidation
-- 'consolidated': Planning résultant de la consolidation (lecture seule) 