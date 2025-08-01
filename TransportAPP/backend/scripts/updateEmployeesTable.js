const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

async function updateEmployeesTableMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('🔧 Mise à jour de la table employees...');

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