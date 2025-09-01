const mysql = require('mysql2/promise');

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'transport_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

console.log('🔧 Configuration MySQL:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
});

// Créer le pool de connexions
const pool = mysql.createPool(dbConfig);

// Variable pour s'assurer que l'initialisation n'est faite qu'une fois
let isInitialized = false;

// Créer la base de données si elle n'existe pas
const createDatabase = async () => {
  const tempConfig = { ...dbConfig };
  delete tempConfig.database; // Connexion sans spécifier la DB
  
  const tempConnection = await mysql.createConnection(tempConfig);
  
  try {
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Base de données '${dbConfig.database}' créée/vérifiée`);
  } catch (err) {
    console.error('❌ Erreur création base de données:', err.message);
    throw err;
  } finally {
    await tempConnection.end();
  }
};

// Initialiser les tables
const initDatabase = async () => {
  if (isInitialized) return;
  
  try {
    // Créer la base de données d'abord
    await createDatabase();
    
    console.log('🚀 Initialisation des tables MySQL...');

    // Table users
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('chef', 'rh', 'administrateur') NOT NULL,
        atelier_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table users créée/vérifiée');

    // Table employees
    await pool.execute(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_atelier_chef (atelier_chef_id),
        INDEX idx_equipe (equipe),
        INDEX idx_atelier (atelier)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table employees créée/vérifiée');

    // Table ateliers
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ateliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        localisation VARCHAR(255),
        responsable VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table ateliers créée/vérifiée');

    // Table plannings
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS plannings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        point_ramassage TEXT,
        circuit VARCHAR(100),
        equipe VARCHAR(50),
        atelier VARCHAR(100),
        date_debut DATE,
        date_fin DATE,
        heure_debut TIME,
        heure_fin TIME,
        status VARCHAR(20) DEFAULT 'actif',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_by (created_by),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table plannings créée/vérifiée');

    // Table weekly_plannings
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS weekly_plannings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year INT NOT NULL,
        week_number INT NOT NULL,
        teams TEXT,
        assignments TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_planning (year, week_number, created_by),
        INDEX idx_year_week (year, week_number),
        INDEX idx_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table weekly_plannings créée/vérifiée');

    // Table requests
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('employee','general') NOT NULL,
        message TEXT NULL,
        content JSON NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        target_role ENUM('administrateur','rh') NULL,
        requested_by INT NOT NULL,
        approved_by INT NULL,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        INDEX idx_requests_status (status),
        INDEX idx_requests_type (type),
        INDEX idx_requests_target_role (target_role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table requests créée/vérifiée');

    // Table request_employees
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS request_employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        employee_id INT NOT NULL,
        CONSTRAINT fk_request_employees_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_request_employee (request_id, employee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table request_employees créée/vérifiée');

    // Ajouter les contraintes de clés étrangères
    try {
      await pool.execute(`
        ALTER TABLE employees 
        ADD CONSTRAINT fk_employees_chef 
        FOREIGN KEY (atelier_chef_id) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Contrainte FK employees -> users ajoutée');
    } catch (err) {
      // Contrainte existe probablement déjà
      if (!err.message.includes('Duplicate key')) {
        console.warn('⚠️ Contrainte FK employees déjà présente');
      }
    }

    try {
      await pool.execute(`
        ALTER TABLE plannings 
        ADD CONSTRAINT fk_plannings_user 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Contrainte FK plannings -> users ajoutée');
    } catch (err) {
      if (!err.message.includes('Duplicate key')) {
        console.warn('⚠️ Contrainte FK plannings déjà présente');
      }
    }

    try {
      await pool.execute(`
        ALTER TABLE weekly_plannings 
        ADD CONSTRAINT fk_weekly_plannings_user 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Contrainte FK weekly_plannings -> users ajoutée');
    } catch (err) {
      if (!err.message.includes('Duplicate key')) {
        console.warn('⚠️ Contrainte FK weekly_plannings déjà présente');
      }
    }

    isInitialized = true;
    console.log('🎉 Toutes les tables MySQL créées avec succès !');
    
  } catch (err) {
    console.error('❌ Erreur initialisation base MySQL:', err.message);
    throw err;
  }
};

// Insérer des utilisateurs de test
const insertTestUsers = async () => {
  try {
    const users = [
      {
        name: 'Admin Transport',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'administrateur',
        atelier_id: null
      },
      {
        name: 'RH Manager',
        email: 'rh@test.com',
        password: 'rh123',
        role: 'rh',
        atelier_id: null
      }
    ];

    for (const user of users) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const [existing] = await pool.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );

        if (existing.length === 0) {
          await pool.execute(
            'INSERT INTO users (name, email, password, role, atelier_id) VALUES (?, ?, ?, ?, ?)',
            [user.name, user.email, user.password, user.role, user.atelier_id]
          );
          console.log(`✅ Utilisateur créé: ${user.email}`);
        } else {
          console.log(`ℹ️  Utilisateur existe déjà: ${user.email}`);
        }
      } catch (err) {
        console.error(`❌ Erreur création utilisateur ${user.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Erreur insertion utilisateurs test:', err.message);
    throw err;
  }
};

// Tester la connexion
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL testée avec succès');
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MySQL:', err.message);
    return false;
  }
};

// Fermer le pool de connexions
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool MySQL fermé');
  } catch (err) {
    console.error('❌ Erreur fermeture pool:', err.message);
  }
};

module.exports = {
  pool,
  initDatabase,
  insertTestUsers,
  testConnection,
  closePool
};