const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport_db' // Mets le nom de ta base MySQL
};

async function createBaseTables() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 Création des tables de base...');
    
    // Table employees
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telephone VARCHAR(20),
        equipe VARCHAR(50),
        atelier VARCHAR(100),
        type_contrat VARCHAR(50),
        date_embauche DATE,
        point_ramassage TEXT,
        circuit_affecte TEXT,
        atelier_chef_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table employees créée');
    
    // Table circuits
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS circuits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        distance DECIMAL(10,2),
        duree_estimee INT,
        points_arret JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table circuits créée');
    
    // Table buses
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) NOT NULL UNIQUE,
        modele VARCHAR(100),
        capacite INT,
        status ENUM('disponible', 'en_service', 'maintenance') DEFAULT 'disponible',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table buses créée');
    
    // Table plannings
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plannings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        point_ramassage VARCHAR(255),
        circuit VARCHAR(255),
        equipe VARCHAR(50),
        atelier VARCHAR(100),
        date_debut DATE,
        date_fin DATE,
        heure_debut TIME,
        heure_fin TIME,
        status ENUM('actif', 'inactif', 'archive') DEFAULT 'actif',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table plannings créée');
    
    console.log('\n🎉 Tables de base créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    await connection.end();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  createBaseTables();
}

module.exports = { createBaseTables }; 