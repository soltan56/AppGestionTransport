#!/usr/bin/env node

/**
 * Script pour créer la table interim_loans
 * Gestion des prêts d'intérimaires entre ateliers
 */

const mysql = require('mysql2/promise');
const config = require('./mysql-config.js');

async function createInterimLoansTable() {
  let pool;
  
  try {
    console.log('🔧 Création de la table des prêts d\'intérimaires...\n');
    
    // Connexion à la base
    pool = mysql.createPool(config);
    console.log('✅ Connexion MySQL établie');
    
    // Vérifier si la table existe déjà
    const [existingTables] = await pool.execute(
      'SHOW TABLES LIKE "interim_loans"'
    );
    
    if (existingTables.length > 0) {
      console.log('ℹ️  Table interim_loans existe déjà');
      
      // Vérifier la structure
      const [columns] = await pool.execute('DESCRIBE interim_loans');
      console.log('\n📋 Structure actuelle de la table:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      return;
    }
    
    // Créer la table interim_loans
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS interim_loans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        from_atelier_id INT NOT NULL,
        to_atelier_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (from_atelier_id) REFERENCES ateliers(id),
        FOREIGN KEY (to_atelier_id) REFERENCES ateliers(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        
        INDEX idx_employee (employee_id),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await pool.execute(createTableSQL);
    console.log('✅ Table interim_loans créée avec succès');
    
    // Vérifier la structure
    const [columns] = await pool.execute('DESCRIBE interim_loans');
    console.log('\n📋 Structure de la table:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    console.log('\n🎉 Table des prêts d\'intérimaires prête !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Connexion MySQL fermée');
    }
  }
}

// Lancer le script
createInterimLoansTable().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
}); 