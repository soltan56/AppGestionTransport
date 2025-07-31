const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../database.db');

function deleteAllEmployees() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
      return;
    }
    
    console.log('🗑️  Suppression de tous les employés...');
    
    // Compter d'abord le nombre d'employés
    db.get('SELECT COUNT(*) as total FROM employees', (err, row) => {
      if (err) {
        console.error('Erreur lors du comptage:', err.message);
        db.close();
        return;
      }
      
      const totalEmployees = row.total;
      console.log(`📊 Nombre d'employés à supprimer: ${totalEmployees}`);
      
      if (totalEmployees === 0) {
        console.log('✅ Aucun employé à supprimer, la table est déjà vide.');
        db.close();
        return;
      }
      
      // Supprimer tous les employés
      db.run('DELETE FROM employees', function(err) {
        if (err) {
          console.error('Erreur lors de la suppression:', err.message);
          db.close();
          return;
        }
        
        console.log(`✅ ${this.changes} employés supprimés avec succès.`);
        
        // Réinitialiser l'auto-increment
        db.run('DELETE FROM sqlite_sequence WHERE name="employees"', (err) => {
          if (err) {
            console.log('ℹ️  Note: Impossible de réinitialiser l\'auto-increment (normal si pas d\'auto-increment)');
          } else {
            console.log('✅ Compteur d\'ID réinitialisé.');
          }
          
          // Vérifier que la table est vide
          db.get('SELECT COUNT(*) as total FROM employees', (err, row) => {
            if (err) {
              console.error('Erreur lors de la vérification:', err.message);
            } else {
              console.log(`📊 Nombre d'employés restants: ${row.total}`);
            }
            
            db.close();
            console.log('\n🎉 Suppression terminée ! La table employees est maintenant vide.');
          });
        });
      });
    });
  });
}

if (require.main === module) {
  deleteAllEmployees();
}

module.exports = { deleteAllEmployees }; 