const mysql = require('mysql2/promise');

async function testEmployees() {
  let connection;
  
  try {
    // Configuration de la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'transport'
    });

    console.log('✅ Connexion à la base de données réussie');

    // Vérifier le nombre total d'employés
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM employees');
    console.log(`📊 Nombre total d'employés: ${countResult[0].total}`);

    // Afficher les premiers employés
    const [employees] = await connection.execute('SELECT id, nom, prenom, atelier_chef_id FROM employees LIMIT 10');
    
    console.log('\n👥 Premiers employés:');
    employees.forEach(emp => {
      console.log(`- ID: ${emp.id}, Nom: ${emp.nom} ${emp.prenom}, Chef: ${emp.atelier_chef_id || 'Non assigné'}`);
    });

    // Vérifier les chefs
    const [chefs] = await connection.execute('SELECT id, name, email, role FROM users WHERE role = "chef"');
    console.log(`\n👨‍💼 Nombre de chefs: ${chefs.length}`);
    chefs.forEach(chef => {
      console.log(`- Chef: ${chef.name} (${chef.email})`);
    });

    // Vérifier les employés par chef
    for (const chef of chefs) {
      const [empByChef] = await connection.execute(
        'SELECT COUNT(*) as count FROM employees WHERE atelier_chef_id = ?', 
        [chef.id]
      );
      console.log(`  → Employés assignés au chef ${chef.name}: ${empByChef[0].count}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testEmployees(); 