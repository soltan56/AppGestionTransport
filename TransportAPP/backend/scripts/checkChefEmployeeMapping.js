const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3001/api${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API Error: ${res.statusCode}`));
          }
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function checkChefEmployeeMapping() {
  try {
    console.log('🔍 Vérification de la correspondance Chefs <-> Employés\n');
    
    // Récupérer les employés
    const employees = await testAPI('/employees');
    console.log(`📊 Total employés: ${employees.length}`);
    
    // Analyser les assignations
    const employeesWithChef = employees.filter(emp => emp.atelier_chef_id !== null && emp.atelier_chef_id !== undefined);
    const employeesWithoutChef = employees.filter(emp => emp.atelier_chef_id === null || emp.atelier_chef_id === undefined);
    
    console.log(`👥 Employés avec chef assigné: ${employeesWithChef.length}`);
    console.log(`👤 Employés sans chef assigné: ${employeesWithoutChef.length}\n`);
    
    // Analyser les IDs de chef uniques
    const uniqueChefIds = [...new Set(employeesWithChef.map(emp => emp.atelier_chef_id))];
    console.log(`🔑 IDs de chef uniques trouvés: ${uniqueChefIds.join(', ')}\n`);
    
    // Grouper par chef
    console.log('📋 Répartition des employés par chef:');
    uniqueChefIds.forEach(chefId => {
      const employeesForChef = employeesWithChef.filter(emp => emp.atelier_chef_id === chefId);
      console.log(`  Chef ID ${chefId}: ${employeesForChef.length} employés`);
      
      // Afficher quelques exemples
      employeesForChef.slice(0, 3).forEach(emp => {
        console.log(`    - ${emp.nom} ${emp.prenom} (ID: ${emp.id})`);
      });
      if (employeesForChef.length > 3) {
        console.log(`    ... et ${employeesForChef.length - 3} autres`);
      }
    });
    
    console.log('\n🧪 Test de connexion avec chefs:');
    
    // Tester les connexions avec les chefs
    const testLogins = [
      { email: 'marc.dupont@transport.ma', password: 'password123', role: 'chef' },
      { email: 'sophie.bernard@transport.ma', password: 'password123', role: 'chef' },
      { email: 'admin@transport.ma', password: 'admin123', role: 'administrateur' }
    ];
    
    for (const login of testLogins) {
      try {
        const loginData = JSON.stringify(login);
        
        const loginResult = await new Promise((resolve, reject) => {
          const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(loginData)
            }
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (err) {
                reject(err);
              }
            });
          });
          
          req.on('error', reject);
          req.write(loginData);
          req.end();
        });
        
        if (loginResult.success) {
          const user = loginResult.user;
          console.log(`✅ ${login.email} -> ID: ${user.id}, Nom: ${user.name}, Rôle: ${user.role}`);
          
          // Vérifier combien d'employés sont assignés à ce chef
          const assignedEmployees = employees.filter(emp => emp.atelier_chef_id === user.id);
          console.log(`   🔗 Employés assignés: ${assignedEmployees.length}`);
          
        } else {
          console.log(`❌ ${login.email} -> ${loginResult.message}`);
        }
      } catch (error) {
        console.log(`❌ ${login.email} -> Erreur: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkChefEmployeeMapping(); 