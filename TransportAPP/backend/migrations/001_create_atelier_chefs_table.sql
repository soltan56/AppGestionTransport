-- Migration 001: Créer la table atelier_chefs
-- Date: 2024-12-19
-- Description: Création de la table de jointure atelier_chefs pour gérer les relations many-to-many entre ateliers et chefs

-- Créer la table atelier_chefs
CREATE TABLE IF NOT EXISTS atelier_chefs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  atelier_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Contraintes de clés étrangères
  FOREIGN KEY (atelier_id) REFERENCES ateliers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contraintes d'unicité
  UNIQUE KEY unique_user_atelier (user_id),
  UNIQUE KEY unique_atelier_user (atelier_id, user_id),
  
  -- Index pour performance
  INDEX idx_atelier_id (atelier_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 