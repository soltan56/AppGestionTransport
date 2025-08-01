const http = require('http');

function testEmployeesAPI() {
  console.log('🧪 Test de l\'API /api/employees...\n');
  
  const req = http.get('http://localhost:3001/api/employees', (res) => {
    let data = '';
    
    console.log(`📡 Status: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        if (res.statusCode !== 200) {
          console.log('❌ Erreur API:', res.statusCode);
          console.log('📋 Réponse:', data);
          return;
        }
        
        const employees = JSON.parse(data);
        console.log(`✅ API fonctionnelle!`);
        console.log(`📊 Nombre d'employés retournés: ${employees.length}`);
        
        if (employees.length === 0) {
          console.log('⚠️ Aucun employé trouvé dans la base de données!');
          return;
        }
        
        const withChef = employees.filter(emp => emp.atelier_chef_id !== null && emp.atelier_chef_id !== undefined);
        const withoutChef = employees.filter(emp => emp.atelier_chef_id === null || emp.atelier_chef_id === undefined);
        
        console.log(`  - Avec chef assigné: ${withChef.length}`);
        console.log(`  - Sans chef assigné: ${withoutChef.length}`);
        
        console.log('\n👥 Premiers employés:');
        employees.slice(0, 10).forEach((emp, index) => {
          console.log(`  ${index + 1}. ${emp.nom} ${emp.prenom} (ID: ${emp.id}, Chef: ${emp.atelier_chef_id || 'Non assigné'})`);
        });
        
        console.log('\n🔍 Analyse des données:');
        const firstEmp = employees[0];
        console.log('  Structure du premier employé:', Object.keys(firstEmp));
        console.log('  Exemple:', firstEmp);
        
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError.message);
        console.log('📋 Données reçues:', data.substring(0, 200) + '...');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Erreur requête HTTP:', error.message);
    console.log('💡 Vérifiez que le serveur backend est démarré sur le port 3001');
  });
  
  req.setTimeout(5000, () => {
    console.log('⏰ Timeout - Le serveur ne répond pas');
    req.destroy();
  });
}

testEmployeesAPI(); 