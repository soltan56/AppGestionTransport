const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

async function checkTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connexion à la base de données "transport" établie\n');

    // Lister toutes les tables
    console.log('📋 TABLES DISPONIBLES :');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      const tableName = table[`Tables_in_transport`];
      console.log(`  - ${tableName}`);
    });

    console.log('\n' + '='.repeat(50));

    // Vérifier les plannings hebdomadaires
    console.log('\n📅 WEEKLY_PLANNINGS :');
    const [plannings] = await connection.execute('SELECT * FROM weekly_plannings ORDER BY year DESC, week_number DESC');
    if (plannings.length > 0) {
      console.log(`  Nombre de plannings: ${plannings.length}`);
      plannings.forEach(planning => {
        console.log(`  - Semaine ${planning.week_number}/${planning.year} (ID: ${planning.id})`);
      });
    } else {
      console.log('  ❌ Aucun planning hebdomadaire trouvé');
    }

    console.log('\n👥 WEEKLY_ASSIGNMENTS :');
    const [assignments] = await connection.execute(`
      SELECT wa.*, wp.year, wp.week_number 
      FROM weekly_assignments wa 
      JOIN weekly_plannings wp ON wa.weekly_planning_id = wp.id 
      ORDER BY wp.year DESC, wp.week_number DESC
    `);
    if (assignments.length > 0) {
      console.log(`  Nombre d'assignations: ${assignments.length}`);
      assignments.forEach(assignment => {
        console.log(`  - Employé ${assignment.employee_id} → Équipe ${assignment.team_name} (Semaine ${assignment.week_number}/${assignment.year})`);
      });
    } else {
      console.log('  ❌ Aucune assignation trouvée');
    }

    console.log('\n🏢 ANCIENNE TABLE PLANNINGS (pour comparaison) :');
    try {
      const [oldPlannings] = await connection.execute('SELECT COUNT(*) as count FROM plannings');
      console.log(`  Nombre dans l'ancienne table: ${oldPlannings[0].count}`);
      if (oldPlannings[0].count > 0) {
        const [sampleOld] = await connection.execute('SELECT * FROM plannings LIMIT 3');
        sampleOld.forEach(p => {
          console.log(`  - ${p.nom} (${p.equipe})`);
        });
      }
    } catch (error) {
      console.log('  ⚠️ Table plannings non trouvée ou erreur');
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n💡 EXPLICATION :');
    console.log('📊 Le nouveau système utilise :');
    console.log('   • weekly_plannings : Plannings par semaine');
    console.log('   • weekly_assignments : Assignations employé ↔ équipe');
    console.log('🗂️ L\'ancien système utilisait :');
    console.log('   • plannings : Anciens plannings (maintenant obsolète)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

checkTables(); 