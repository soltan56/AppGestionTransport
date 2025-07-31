const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

async function fixTeamNames() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connexion à la base de données établie\n');

    // Vérifier la structure de la table
    console.log('📋 STRUCTURE DE LA TABLE weekly_assignments :');
    const [structure] = await connection.execute('DESCRIBE weekly_assignments');
    structure.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n📊 DONNÉES ACTUELLES :');
    const [assignments] = await connection.execute('SELECT * FROM weekly_assignments');
    assignments.forEach(assignment => {
      console.log(`  ID: ${assignment.id} | Employee: ${assignment.employee_id} | Team: "${assignment.team_name}" | Planning: ${assignment.weekly_planning_id}`);
    });

    console.log('\n🔍 VÉRIFICATION DES VALEURS NULL :');
    const [nullTeams] = await connection.execute('SELECT COUNT(*) as count FROM weekly_assignments WHERE team_name IS NULL OR team_name = ""');
    console.log(`  Assignations avec team_name NULL/vide: ${nullTeams[0].count}`);

    // Si des team_name sont NULL, proposer de les corriger
    if (nullTeams[0].count > 0) {
      console.log('\n🔧 CORRECTION DES NOMS D\'ÉQUIPE NULL...');
      
      // Assigner des équipes par défaut basées sur l'ID
      const updates = [
        { start: 1, end: 3, team: 'Matin' },
        { start: 4, end: 6, team: 'Soir' },
        { start: 7, end: 9, team: 'Nuit' },
        { start: 10, end: 20, team: 'Normal' }
      ];

      for (const update of updates) {
        await connection.execute(`
          UPDATE weekly_assignments 
          SET team_name = ? 
          WHERE id >= ? AND id <= ? AND (team_name IS NULL OR team_name = "")
        `, [update.team, update.start, update.end]);
        
        const [affected] = await connection.execute('SELECT ROW_COUNT() as count');
        console.log(`  ✅ ${affected[0].count || 0} assignations mises à jour pour l'équipe ${update.team}`);
      }
    }

    console.log('\n📊 DONNÉES APRÈS CORRECTION :');
    const [finalAssignments] = await connection.execute(`
      SELECT wa.*, wp.year, wp.week_number 
      FROM weekly_assignments wa 
      JOIN weekly_plannings wp ON wa.weekly_planning_id = wp.id 
      ORDER BY wp.year DESC, wp.week_number DESC
    `);
    finalAssignments.forEach(assignment => {
      console.log(`  - Employé ${assignment.employee_id} → Équipe "${assignment.team_name}" (Semaine ${assignment.week_number}/${assignment.year})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

fixTeamNames(); 