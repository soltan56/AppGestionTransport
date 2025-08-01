const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'transport'
};

const predefinedCircuits = [
  {
    nom: 'HAY MOLAY RCHID',
    description: 'Circuit desservant la zone Hay Molay Rchid',
    distance: 12.5,
    status: 'actif',
    temps_trajet: '35 min'
  },
  {
    nom: 'RAHMA',
    description: 'Circuit desservant la zone Rahma',
    distance: 8.2,
    status: 'actif',
    temps_trajet: '25 min'
  },
  {
    nom: 'SIDI MOUMEN',
    description: 'Circuit desservant la zone Sidi Moumen',
    distance: 15.3,
    status: 'actif',
    temps_trajet: '42 min'
  },
  {
    nom: 'AZHAR',
    description: 'Circuit desservant la zone Azhar',
    distance: 10.7,
    status: 'actif',
    temps_trajet: '30 min'
  },
  {
    nom: 'HAY MOHAMMEDI',
    description: 'Circuit desservant la zone Hay Mohammedi',
    distance: 18.9,
    status: 'actif',
    temps_trajet: '48 min'
  },
  {
    nom: 'DERB SULTAN',
    description: 'Circuit desservant la zone Derb Sultan',
    distance: 6.8,
    status: 'actif',
    temps_trajet: '22 min'
  },
  {
    nom: 'ANASSI',
    description: 'Circuit desservant la zone Anassi',
    distance: 14.1,
    status: 'actif',
    temps_trajet: '38 min'
  },
  {
    nom: 'SIDI OTHMANE',
    description: 'Circuit desservant la zone Sidi Othmane',
    distance: 11.6,
    status: 'actif',
    temps_trajet: '33 min'
  },
  {
    nom: 'MOHAMMEDIA',
    description: 'Circuit desservant la zone Mohammedia',
    distance: 22.4,
    status: 'actif',
    temps_trajet: '55 min'
  }
];

async function initializeCircuitsMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL établie.');

  const [rows] = await connection.query('SELECT COUNT(*) as count FROM circuits');
  if (rows[0].count > 0) {
    console.log(`ℹ️  ${rows[0].count} circuit(s) déjà présent(s) dans la base de données.`);
    console.log('🔄 Les nouveaux circuits seront ajoutés uniquement s\'ils n\'existent pas déjà.');
  } else {
    console.log('📝 Aucun circuit trouvé. Initialisation des circuits prédéfinis...');
  }

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < predefinedCircuits.length; i++) {
    const circuit = predefinedCircuits[i];
    const [existing] = await connection.query('SELECT id FROM circuits WHERE nom = ?', [circuit.nom]);
    if (existing.length > 0) {
      console.log(`ℹ️  Circuit "${circuit.nom}" déjà présent (ID: ${existing[0].id})`);
      continue;
    }
    try {
      await connection.execute(
        `INSERT INTO circuits (nom, description, distance, status, duree_estimee, points_arret, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          circuit.nom,
          circuit.description,
          circuit.distance,
          circuit.status,
          null,
          null
        ]
      );
      inserted++;
      console.log(`✅ Circuit "${circuit.nom}" ajouté.`);
    } catch (err) {
      failed++;
      console.error(`❌ Erreur lors de l'insertion du circuit ${circuit.nom}:`, err.message);
    }
  }

  console.log(`\n🎉 Initialisation terminée ! ${inserted} circuit(s) ajouté(s) avec succès.`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} circuit(s) n'ont pas pu être ajoutés.`);
  }
  await connection.end();
}

if (require.main === module) {
  console.log('🚀 Initialisation des circuits prédéfinis (MySQL)...');
  initializeCircuitsMySQL();
}

module.exports = { initializeCircuitsMySQL, predefinedCircuits }; 