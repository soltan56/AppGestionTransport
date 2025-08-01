const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'transport_db' 
};

async function checkEmployees() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Vérification des employés dans la base de données...\n');
    
    const [totalResult] = await connection.query('SELECT COUNT(*) as total FROM employees');
    console.log(`📊 Total employés: ${totalResult[0].total}`);
    
    const [chefResult] = await connection.query(`
      SELECT atelier_chef_id, COUNT(*) as count 
      FROM employees 
      GROUP BY atelier_chef_id
    `);
    
    console.log('\n📋 Répartition par chef:');
    chefResult.forEach(row => {
      if (row.atelier_chef_id === null) {
        console.log(`  - Non assignés: ${row.count} employés`);
      } else {
        console.log(`  - Chef ID ${row.atelier_chef_id}: ${row.count} employés`);
      }
    });
    
    const [employeesSample] = await connection.query(`
      SELECT id, nom, prenom, atelier_chef_id 
      FROM employees 
      LIMIT 15
    `);
    
    console.log('\n👥 Échantillon d\'employés:');
    employeesSample.forEach(emp => {
      console.log(`  - ID: ${emp.id}, ${emp.nom} ${emp.prenom}, Chef: ${emp.atelier_chef_id || 'Non assigné'}`);
    });
    
    // Vérifier les users (chefs)
    const [users] = await connection.query('SELECT id, name, role FROM users WHERE role = "chef"');
    console.log('\n👨‍💼 Chefs d\'atelier:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, ${user.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  checkEmployees();
}

module.exports = { checkEmployees }; 