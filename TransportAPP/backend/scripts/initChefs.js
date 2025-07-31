const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport_db' // Mets le nom de ta base MySQL
};

// Données des chefs d'atelier fictifs
const chefs = [
  {
    name: 'Marc Dupont',
    email: 'marc.dupont@transport.ma',
    password: 'chef123',
    role: 'chef',
    atelier_id: 1,
    atelier_name: 'Atelier Nord'
  },
  {
    name: 'Sophie Bernard',
    email: 'sophie.bernard@transport.ma', 
    password: 'chef123',
    role: 'chef',
    atelier_id: 2,
    atelier_name: 'Atelier Sud'
  }
];

// Fonction pour initialiser les chefs d'atelier
async function initChefs() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 Initialisation des chefs d\'atelier...');
    
    // Vérifier si la table users existe, sinon la créer
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
    
    // Vérifier si la table ateliers existe, sinon la créer
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ateliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        localisation VARCHAR(255),
        responsable VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Ajouter les ateliers si ils n'existent pas
    for (const chef of chefs) {
      const [atelierExists] = await connection.query(
        'SELECT id FROM ateliers WHERE id = ?',
        [chef.atelier_id]
      );
      
      if (atelierExists.length === 0) {
        await connection.execute(
          'INSERT INTO ateliers (id, nom, description, responsable) VALUES (?, ?, ?, ?)',
          [chef.atelier_id, chef.atelier_name, `Description de l'${chef.atelier_name}`, chef.name]
        );
        console.log(`✅ Atelier "${chef.atelier_name}" créé`);
      }
    }
    
    // Ajouter les chefs d'atelier
    for (const chef of chefs) {
      // Vérifier si le chef existe déjà
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [chef.email]
      );
      
      if (existingUser.length === 0) {
        await connection.execute(
          'INSERT INTO users (name, email, password, role, atelier_id) VALUES (?, ?, ?, ?, ?)',
          [chef.name, chef.email, chef.password, chef.role, chef.atelier_id]
        );
        console.log(`✅ Chef d'atelier "${chef.name}" créé`);
      } else {
        console.log(`ℹ️ Chef d'atelier "${chef.name}" existe déjà`);
      }
    }
    
    // Ajouter une colonne atelier_chef_id à la table employees si elle n'existe pas
    try {
      await connection.execute(`
        ALTER TABLE employees ADD COLUMN atelier_chef_id INT DEFAULT NULL
      `);
      console.log('✅ Colonne atelier_chef_id ajoutée à la table employees');
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.error('Erreur lors de l\'ajout de la colonne:', error.message);
      }
    }
    
    // Assigner quelques employés aux chefs d'atelier
    console.log('🔄 Assignation des employés aux chefs...');
    
    // Récupérer tous les employés
    const [employees] = await connection.query('SELECT id, nom, prenom FROM employees LIMIT 20');
    
    if (employees.length > 0) {
      // Assigner la première moitié au chef 1
      const halfPoint = Math.ceil(employees.length / 2);
      
      for (let i = 0; i < halfPoint; i++) {
        await connection.execute(
          'UPDATE employees SET atelier_chef_id = ? WHERE id = ?',
          [1, employees[i].id]
        );
      }
      
      // Assigner la seconde moitié au chef 2
      for (let i = halfPoint; i < employees.length; i++) {
        await connection.execute(
          'UPDATE employees SET atelier_chef_id = ? WHERE id = ?',
          [2, employees[i].id]
        );
      }
      
      console.log(`✅ ${halfPoint} employés assignés au chef 1 (Marc Dupont)`);
      console.log(`✅ ${employees.length - halfPoint} employés assignés au chef 2 (Sophie Bernard)`);
    }
    
    // Ajouter un administrateur pour test complet
    const [adminExists] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@transport.ma']
    );
    
    if (adminExists.length === 0) {
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin Transport', 'admin@transport.ma', 'admin123', 'administrateur']
      );
      console.log('✅ Administrateur "Admin Transport" créé');
    }
    
    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('\n📋 Comptes créés :');
    console.log('👤 Chef 1: marc.dupont@transport.ma / chef123');
    console.log('👤 Chef 2: sophie.bernard@transport.ma / chef123');
    console.log('👤 Admin: admin@transport.ma / admin123');
    console.log('\n🔍 Testez les différences de droits en vous connectant avec chaque compte.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await connection.end();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  initChefs();
}

module.exports = { initChefs }; 