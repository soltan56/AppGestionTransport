const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const mysqlConfig = require('./mysql-config');

console.log('🔄 Migration EMPLOYÉS avec REMAPPING des IDs chefs');
console.log('================================================\n');

// Connexion SQLite
const sqlitePath = path.join(__dirname, 'transport.db');
const sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion SQLite:', err.message);
    process.exit(1);
  }
  console.log('✅ Connexion SQLite ouverte');
});

// Mapping des anciens IDs vers les nouveaux
const chefIdMapping = {
  44: 4,  // Ahmed Ben Ali
  45: 5,  // Fatima Zahra  
  46: 6,  // Mohamed Rachid
  47: 7,  // Aicha Benali
  48: 8   // Hassan Alami
};

console.log('🗺️  Mapping des IDs chefs:');
Object.entries(chefIdMapping).forEach(([oldId, newId]) => {
  console.log(`   SQLite ID ${oldId} → MySQL ID ${newId}`);
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

async function migrateEmployeesWithMapping() {
  let mysqlPool = null;
  
  try {
    console.log('\n📡 Connexion à MySQL...');
    mysqlPool = mysql.createPool({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database
    });
    
    console.log('📦 Lecture des employés SQLite...');
    const employees = await readSQLiteEmployees();
    console.log(`   📊 ${employees.length} employés trouvés dans SQLite`);
    
    console.log('🗑️  Vidage table employees MySQL...');
    await mysqlPool.execute('DELETE FROM employees');
    await mysqlPool.execute('ALTER TABLE employees AUTO_INCREMENT = 1');
    
    console.log('📥 Migration des employés avec remapping...');
    
    // Préparer l'insertion
    const firstEmployee = employees[0];
    const columns = Object.keys(firstEmployee).filter(col => col !== 'id');
    const placeholders = columns.map(() => '?').join(', ');
    const columnsStr = columns.join(', ');
    
    const insertSQL = `INSERT INTO employees (${columnsStr}) VALUES (${placeholders})`;
    
    let successCount = 0;
    let errorCount = 0;
    let remappedCount = 0;
    let unmappedCount = 0;
    
    for (const [index, employee] of employees.entries()) {
      try {
        // Remapper l'atelier_chef_id si nécessaire
        let mappedChefId = employee.atelier_chef_id;
        
        if (employee.atelier_chef_id && chefIdMapping[employee.atelier_chef_id]) {
          mappedChefId = chefIdMapping[employee.atelier_chef_id];
          remappedCount++;
          
          if (index < 3) { // Debug pour les premiers
            console.log(`   🔄 ${employee.nom}: Chef ID ${employee.atelier_chef_id} → ${mappedChefId}`);
          }
        } else if (employee.atelier_chef_id) {
          unmappedCount++;
          console.log(`   ⚠️  ${employee.nom}: Chef ID ${employee.atelier_chef_id} non mappé`);
        }
        
        // Préparer les valeurs avec l'ID remappé
        const values = columns.map(col => {
          if (col === 'atelier_chef_id') {
            return mappedChefId;
          }
          return employee[col] === undefined ? null : employee[col];
        });
        
        await mysqlPool.execute(insertSQL, values);
        successCount++;
        
        if (successCount % 25 === 0) {
          console.log(`   📈 ${successCount}/${employees.length} employés migrés...`);
        }
        
      } catch (err) {
        errorCount++;
        console.error(`   ❌ Erreur employé ${employee.nom}:`, err.message);
        
        if (errorCount > 5) {
          console.error('❌ Trop d\'erreurs, arrêt de la migration');
          break;
        }
      }
    }
    
    console.log(`\n✅ Migration terminée:`);
    console.log(`   📊 ${successCount}/${employees.length} employés migrés`);
    console.log(`   🔄 ${remappedCount} IDs de chefs remappés`);
    console.log(`   ⚠️  ${unmappedCount} IDs de chefs non mappés`);
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} erreurs rencontrées`);
    }
    
    // Vérification finale
    const [countResult] = await mysqlPool.execute('SELECT COUNT(*) as count FROM employees');
    console.log(`\n🔍 Vérification: ${countResult[0].count} employés dans MySQL`);
    
    if (countResult[0].count === employees.length) {
      console.log('🎉 Migration des employés réussie !');
    } else {
      console.log('⚠️  Nombre d\'employés différent, vérifiez les erreurs');
    }
    
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
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
migrateEmployeesWithMapping().catch(console.error);