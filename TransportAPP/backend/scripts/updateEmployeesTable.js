const mysql = require('mysql2/promise');

// Configuration MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport_db' // Mets le nom de ta base MySQL
};

async function updateEmployeesTableMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('🔧 Mise à jour de la table employees...');

  // Ajouter la colonne point_ramassage si elle n'existe pas
  try {
    await connection.query("ALTER TABLE employees ADD COLUMN point_ramassage TEXT");
    console.log('✅ Colonne point_ramassage ajoutée.');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column name')) {
      console.log('✅ Colonne point_ramassage déjà existante.');
    } else {
      console.error("Erreur lors de l'ajout de la colonne point_ramassage:", err.message);
    }
  }

  // Ajouter la colonne circuit si elle n'existe pas
  try {
    await connection.query("ALTER TABLE employees ADD COLUMN circuit TEXT");
    console.log('✅ Colonne circuit ajoutée.');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column name')) {
      console.log('✅ Colonne circuit déjà existante.');
    } else {
      console.error("Erreur lors de l'ajout de la colonne circuit:", err.message);
    }
  }

  // Ajouter la colonne circuit_affecte si elle n'existe pas
  try {
    await connection.query("ALTER TABLE employees ADD COLUMN circuit_affecte TEXT");
    console.log('✅ Colonne circuit_affecte ajoutée.');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column name')) {
      console.log('✅ Colonne circuit_affecte déjà existante.');
    } else {
      console.error("Erreur lors de l'ajout de la colonne circuit_affecte:", err.message);
    }
  }

  // Afficher la structure finale
  const [columns] = await connection.query("DESCRIBE employees");
  console.log('📊 Structure de la table employees:');
  columns.forEach(col => {
    console.log(`  - ${col.Field}: ${col.Type}`);
  });

  await connection.end();
  console.log('\n🎉 Mise à jour de la table terminée !');
}

if (require.main === module) {
  updateEmployeesTableMySQL();
}

module.exports = { updateEmployeesTableMySQL }; 