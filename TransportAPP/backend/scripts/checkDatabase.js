const mysql = require('mysql2/promise');

// Configuration MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport_db' // Mets le nom de ta base MySQL
};

async function checkDatabaseMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL réussie.');

  // Vérifier si la table employees existe
  const [tables] = await connection.query("SHOW TABLES LIKE 'employees'");
  if (tables.length === 0) {
    console.log('❌ La table employees n\'existe pas.');
    await connection.end();
    return;
  }
  console.log('✅ La table employees existe.');

  // Compter le nombre d'employés
  const [countRows] = await connection.query('SELECT COUNT(*) as total FROM employees');
  console.log(`📊 Nombre total d'employés: ${countRows[0].total}`);

  // Afficher quelques employés pour vérification
  const [sampleRows] = await connection.query('SELECT nom, prenom, point_ramassage, circuit_affecte, equipe, atelier FROM employees LIMIT 5');
  console.log('\n📋 Premiers employés dans la base:');
  sampleRows.forEach((emp, index) => {
    console.log(`  ${index + 1}. ${emp.nom} ${emp.prenom} - ${emp.point_ramassage} (${emp.circuit_affecte}, ${emp.equipe}, ${emp.atelier})`);
  });

  // Statistiques par atelier
  const [atelierStats] = await connection.query(`
    SELECT atelier, COUNT(*) as count 
    FROM employees 
    WHERE atelier != '' 
    GROUP BY atelier 
    ORDER BY count DESC
  `);
  console.log('\n📈 Répartition par atelier:');
  atelierStats.forEach(stat => {
    console.log(`  ${stat.atelier}: ${stat.count} employés`);
  });

  await connection.end();
}

if (require.main === module) {
  checkDatabaseMySQL();
}

module.exports = { checkDatabaseMySQL }; 