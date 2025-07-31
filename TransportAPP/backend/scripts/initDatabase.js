const mysql = require('mysql2/promise');

async function initializeDatabase() {
  let connection;
  
  try {
    // Se connecter à MySQL sans spécifier de base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connexion à MySQL réussie');

    // Créer la base de données si elle n'existe pas
    await connection.execute(`CREATE DATABASE IF NOT EXISTS transport`);
    console.log('✅ Base de données "transport" créée ou vérifiée');

    // Fermer la connexion actuelle et se reconnecter à la base transport
    await connection.end();
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'transport'
    });
    console.log('✅ Connexion à la base "transport" réussie');

    // Créer la table users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('chef', 'rh', 'administrateur') NOT NULL,
        atelier_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "users" créée');

    // Créer la table employees
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
    console.log('✅ Table "employees" créée');

    // Créer la table circuits
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS circuits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        atelier VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "circuits" créée');

    // Créer la table buses
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) NOT NULL,
        modele VARCHAR(100),
        capacite INT,
        statut ENUM('actif', 'maintenance', 'hors_service') DEFAULT 'actif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "buses" créée');

    // Créer la table plannings
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plannings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        date_debut DATE,
        date_fin DATE,
        equipe VARCHAR(50),
        point_ramassage VARCHAR(255),
        circuit VARCHAR(255),
        atelier VARCHAR(100),
        status ENUM('actif', 'inactif', 'termine') DEFAULT 'actif',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "plannings" créée');

    // Créer la table weekly_plannings
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
    console.log('✅ Table "weekly_plannings" créée');

    // Créer la table weekly_assignments
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
    console.log('✅ Table "weekly_assignments" créée');

    // Créer la table ateliers
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ateliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "ateliers" créée');

    console.log('\n🎉 Base de données initialisée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase(); 