-- Migration 004: Corriger la table circuits
-- Date: 2024-12-19
-- Description: Correction de la table circuits pour assurer la cohérence des données

-- Vérifier si la table circuits existe, sinon la créer
CREATE TABLE IF NOT EXISTS circuits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  distance DECIMAL(10,2),
  duree_estimee INT, -- en minutes
  points_arret JSON,
  status ENUM('actif', 'inactif') DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nom (nom),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les 9 circuits réels s'ils n'existent pas
INSERT IGNORE INTO circuits (nom, description, distance, duree_estimee, status) VALUES
('HAY MOLAY RCHID', 'Circuit Hay Moulay Rachid', 12.5, 35, 'actif'),
('RAHMA', 'Circuit Rahma', 8.2, 25, 'actif'),
('SIDI MOUMEN', 'Circuit Sidi Moumen', 15.3, 42, 'actif'),
('AZHAR', 'Circuit Azhar', 10.7, 30, 'actif'),
('HAY MOHAMMEDI', 'Circuit Hay Mohammedi', 18.9, 48, 'actif'),
('DERB SULTAN', 'Circuit Derb Sultan', 6.8, 22, 'actif'),
('ANASSI', 'Circuit Anassi', 14.1, 38, 'actif'),
('SIDI OTHMANE', 'Circuit Sidi Othmane', 11.6, 33, 'actif'),
('MOHAMMEDIA', 'Circuit Mohammedia', 22.4, 55, 'actif');

-- Mettre à jour les employés pour utiliser les noms exacts des circuits
UPDATE employees 
SET circuit_affecte = 'HAY MOLAY RCHID' 
WHERE circuit_affecte LIKE '%MOLAY%' OR circuit_affecte LIKE '%RCHID%';

UPDATE employees 
SET circuit_affecte = 'RAHMA' 
WHERE circuit_affecte LIKE '%RAHMA%';

UPDATE employees 
SET circuit_affecte = 'SIDI MOUMEN' 
WHERE circuit_affecte LIKE '%SIDI MOUMEN%';

UPDATE employees 
SET circuit_affecte = 'AZHAR' 
WHERE circuit_affecte LIKE '%AZHAR%';

UPDATE employees 
SET circuit_affecte = 'HAY MOHAMMEDI' 
WHERE circuit_affecte LIKE '%MOHAMMEDI%' OR circuit_affecte LIKE '%MOHAMMEDY%';

UPDATE employees 
SET circuit_affecte = 'DERB SULTAN' 
WHERE circuit_affecte LIKE '%DERB SULTAN%';

UPDATE employees 
SET circuit_affecte = 'ANASSI' 
WHERE circuit_affecte LIKE '%ANASSI%';

UPDATE employees 
SET circuit_affecte = 'SIDI OTHMANE' 
WHERE circuit_affecte LIKE '%SIDI OTHMANE%';

UPDATE employees 
SET circuit_affecte = 'MOHAMMEDIA' 
WHERE circuit_affecte LIKE '%MOHAMMEDIA%'; 