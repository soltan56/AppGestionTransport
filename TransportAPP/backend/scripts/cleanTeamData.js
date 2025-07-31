const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

async function cleanTeamData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connexion à la base de données établie\n');

    console.log('🧹 NETTOYAGE DES DONNÉES "undefined"...\n');

    // Supprimer toutes les assignations avec team = "undefined"
    const [result] = await connection.execute(`
      DELETE FROM weekly_assignments 
      WHERE team = 'undefined' OR team = '' OR team IS NULL
    `);
    
    console.log(`✅ ${result.affectedRows} assignations "undefined" supprimées`);

    // Vérifier les plannings orphelins (sans assignations)
    const [orphanPlannings] = await connection.execute(`
      SELECT wp.id, wp.year, wp.week_number
      FROM weekly_plannings wp
      LEFT JOIN weekly_assignments wa ON wp.id = wa.weekly_planning_id
      WHERE wa.id IS NULL
    `);

    if (orphanPlannings.length > 0) {
      console.log(`\n🗑️ ${orphanPlannings.length} planning(s) sans assignations trouvé(s):`);
      orphanPlannings.forEach(p => {
        console.log(`  - Semaine ${p.week_number}/${p.year} (ID: ${p.id})`);
      });

      // Supprimer les plannings orphelins
      for (const planning of orphanPlannings) {
        await connection.execute('DELETE FROM weekly_plannings WHERE id = ?', [planning.id]);
        console.log(`  ✅ Planning semaine ${planning.week_number}/${planning.year} supprimé`);
      }
    }

    console.log('\n📊 ÉTAT FINAL :');
    
    // Compter les plannings restants
    const [planningCount] = await connection.execute('SELECT COUNT(*) as count FROM weekly_plannings');
    console.log(`  Plannings restants: ${planningCount[0].count}`);

    // Compter les assignations restantes
    const [assignmentCount] = await connection.execute('SELECT COUNT(*) as count FROM weekly_assignments');
    console.log(`  Assignations restantes: ${assignmentCount[0].count}`);

    if (assignmentCount[0].count > 0) {
      const [validAssignments] = await connection.execute(`
        SELECT wa.team, COUNT(*) as count
        FROM weekly_assignments wa
        GROUP BY wa.team
      `);
      
      console.log('  Répartition par équipe:');
      validAssignments.forEach(a => {
        console.log(`    - ${a.team}: ${a.count} employé(s)`);
      });
    }

    console.log('\n🎉 Nettoyage terminé !');
    console.log('💡 Vous pouvez maintenant créer de nouveaux plannings propres.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

cleanTeamData(); 