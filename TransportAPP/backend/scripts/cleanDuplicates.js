const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

function cleanDuplicates() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
      return;
    }
    console.log('🔧 Analyse des doublons dans la base de données...');
    
    db.get('SELECT COUNT(*) as total FROM employees', (err, row) => {
      if (err) {
        console.error('Erreur lors du comptage:', err.message);
        db.close();
        return;
      }
      
      console.log(`📊 Nombre total d'employés actuellement: ${row.total}`);
      
      db.all(`
        SELECT nom, prenom, COUNT(*) as count 
        FROM employees 
        GROUP BY nom, prenom 
        HAVING COUNT(*) > 1
        ORDER BY count DESC
      `, (err, duplicates) => {
        if (err) {
          console.error('Erreur lors de la recherche de doublons:', err.message);
          db.close();
          return;
        }
        
        if (duplicates.length === 0) {
          console.log('✅ Aucun doublon trouvé.');
          db.close();
          return;
        }
        
        console.log(`\n⚠️  ${duplicates.length} employés ont des doublons:`);
        duplicates.forEach(dup => {
          console.log(`   ${dup.nom} ${dup.prenom}: ${dup.count} occurrences`);
        });
        
        console.log('\n🧹 Suppression des doublons (gardant le plus récent)...');
        
        db.run(`
          DELETE FROM employees 
          WHERE id NOT IN (
            SELECT MAX(id) 
            FROM employees 
            GROUP BY nom, prenom
          )
        `, function(err) {
          if (err) {
            console.error('Erreur lors de la suppression des doublons:', err.message);
            db.close();
            return;
          }
          
          console.log(`✅ ${this.changes} doublons supprimés.`);
          
          db.get('SELECT COUNT(*) as total FROM employees', (err, row) => {
            if (err) {
              console.error('Erreur lors du comptage final:', err.message);
            } else {
              console.log(`📊 Nombre final d'employés: ${row.total}`);
            }
            
            db.all(`
              SELECT atelier, COUNT(*) as count 
              FROM employees 
              WHERE atelier != '' 
              GROUP BY atelier 
              ORDER BY count DESC
            `, (err, rows) => {
              if (!err && rows) {
                console.log('\n📈 Répartition finale par atelier:');
                rows.forEach(stat => {
                  console.log(`  ${stat.atelier}: ${stat.count} employés`);
                });
              }
              
              db.close();
              console.log('\n🎉 Nettoyage terminé !');
            });
          });
        });
      });
    });
  });
}

if (require.main === module) {
  cleanDuplicates();
}

module.exports = { cleanDuplicates }; 