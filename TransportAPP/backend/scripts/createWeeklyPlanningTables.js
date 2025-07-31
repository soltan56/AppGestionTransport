const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport_db' // Mets le nom de ta base MySQL
};

async function createWeeklyPlanningTables() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 Création des tables pour les plannings hebdomadaires...');
    
    // Table pour les plannings hebdomadaires
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS weekly_plannings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year YEAR NOT NULL,
        week_number TINYINT NOT NULL,
        created_by INT,
        updated_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_year_week (year, week_number),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table weekly_plannings créée');
    
    // Table pour les assignations d'employés aux équipes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS weekly_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        weekly_planning_id INT NOT NULL,
        employee_id INT NOT NULL,
        team ENUM('Matin', 'Soir', 'Nuit', 'Normal') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (weekly_planning_id) REFERENCES weekly_plannings(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_week (weekly_planning_id, employee_id)
      )
    `);
    console.log('✅ Table weekly_assignments créée');
    
    // Index pour améliorer les performances
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_weekly_assignments_team 
      ON weekly_assignments(team)
    `);
    
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_weekly_plannings_year 
      ON weekly_plannings(year)
    `);
    
    console.log('✅ Index créés');
    console.log('\n🎉 Tables créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    await connection.end();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  createWeeklyPlanningTables();
}

module.exports = { createWeeklyPlanningTables }; 