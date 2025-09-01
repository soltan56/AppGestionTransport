const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

async function resetPlannings() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔄 Connexion à la base de données établie');

    // Supprimer toutes les assignations
    await connection.execute('DELETE FROM weekly_assignments');
    console.log('✅ Toutes les assignations supprimées');

    // Supprimer tous les plannings hebdomadaires
    await connection.execute('DELETE FROM weekly_plannings');
    console.log('✅ Tous les plannings hebdomadaires supprimés');

    // Reset des auto_increment
    await connection.execute('ALTER TABLE weekly_assignments AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE weekly_plannings AUTO_INCREMENT = 1');
    console.log('✅ Compteurs auto_increment réinitialisés');

    console.log('\n🎉 Reset des plannings terminé avec succès !');
    console.log('📋 Toutes les données de planning ont été supprimées');
    console.log('🚀 Vous pouvez maintenant créer de nouveaux plannings');

  } catch (error) {
    console.error('❌ Erreur lors du reset:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Demander confirmation avant reset
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️ Êtes-vous sûr de vouloir supprimer TOUS les plannings ? (tapez "RESET" pour confirmer): ', (answer) => {
  if (answer === 'RESET') {
    resetPlannings();
  } else {
    console.log('❌ Reset annulé');
  }
  rl.close();
}); 