const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const mysqlConfig = require('./mysql-config');

console.log('🔄 Migration EMPLOYÉS SEULEMENT (SQLite → MySQL)');
console.log('=================================================\n');

// Connexion SQLite
const sqlitePath = path.join(__dirname, 'transport.db');
const sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion SQLite:', err.message);
    process.exit(1);
  }
  console.log('✅ Connexion SQLite ouverte');
});

// Fonction pour lire les employés SQLite
const readSQLiteEmployees = () => {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM employees', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

async function migrateEmployeesOnly() {
  let mysqlPool = null;
  
  try {
    console.log('📡 Connexion à MySQL...');
    mysqlPool = mysql.createPool({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database
    });
    
    console.log('📦 Lecture des employés SQLite...');
    const employees = await readSQLiteEmployees();
    console.log(`   📊 ${employees.length} employés trouvés dans SQLite`);
    
    if (employees.length === 0) {
      console.log('❌ Aucun employé à migrer !');
      return;
    }
    
    console.log('🗑️  Vidage table employees MySQL...');
    await mysqlPool.execute('DELETE FROM employees');
    await mysqlPool.execute('ALTER TABLE employees AUTO_INCREMENT = 1');
    
    console.log('📥 Migration des employés...');
    
    // Préparer l'insertion
    const firstEmployee = employees[0];
    const columns = Object.keys(firstEmployee).filter(col => col !== 'id'); // Exclure l'ID auto-increment
    const placeholders = columns.map(() => '?').join(', ');
    const columnsStr = columns.join(', ');
    
    const insertSQL = `INSERT INTO employees (${columnsStr}) VALUES (${placeholders})`;
    console.log('🔧 SQL:', insertSQL);
    console.log('📋 Colonnes:', columns);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [index, employee] of employees.entries()) {
      try {
        const values = columns.map(col => employee[col] === undefined ? null : employee[col]);
        
        // Debug pour le premier employé
        if (index === 0) {
          console.log('\n🔍 Premier employé:');
          columns.forEach((col, i) => {
            console.log(`   ${col}: ${values[i]} (${typeof values[i]})`);
          });
          console.log('');
        }
        
        await mysqlPool.execute(insertSQL, values);
        successCount++;
        
        if (successCount % 25 === 0) {
          console.log(`   📈 ${successCount}/${employees.length} employés migrés...`);
        }
        
      } catch (err) {
        errorCount++;
        console.error(`   ❌ Erreur employé ID ${employee.id} (${employee.nom}):`, err.message);
        
        if (errorCount > 5) {
          console.error('❌ Trop d\'erreurs, arrêt de la migration');
          break;
        }
      }
    }
    
    console.log(`\n✅ Migration terminée: ${successCount}/${employees.length} employés migrés`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} erreurs rencontrées`);
    }
    
    // Vérification finale
    const [countResult] = await mysqlPool.execute('SELECT COUNT(*) as count FROM employees');
    console.log(`🔍 Vérification: ${countResult[0].count} employés dans MySQL`);
    
    if (countResult[0].count === employees.length) {
      console.log('🎉 Migration des employés réussie !');
    } else {
      console.log('⚠️  Nombre d\'employés différent, vérifiez les erreurs');
    }
    
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    console.error('Details:', err);
  } finally {
    if (mysqlPool) {
      await mysqlPool.end();
      console.log('✅ Connexion MySQL fermée');
    }
    
    sqliteDb.close((err) => {
      if (err) {
        console.error('❌ Erreur fermeture SQLite:', err.message);
      } else {
        console.log('✅ Connexion SQLite fermée');
      }
    });
  }
}

// Executer la migration
migrateEmployeesOnly().catch(console.error);