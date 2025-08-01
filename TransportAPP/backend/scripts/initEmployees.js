const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

const predefinedEmployees = [
  'DENNI AZIZ', 'EL BAKRI REDOUANE', 'FADEL Imad', 'JAMILI MOHAMED', 'SOFIANE MOURAD',
  'WAKRIM MOHAMED', 'KARNBAH MOHAMED', 'MOUDAKIR SMAIN', 'FEROUAL ABDELALI', 'AZLAG HASSAN',
  'NASSOUR ABDELILAH', 'TABARANE YOUNES', 'OUAJHI YOUNESS', 'ELHANSALI ABDERRAZAK', 'LABNI MUSTAPHA',
  'IJABA MOUNA', 'OUAHID ADIL', 'SAIS BRAHIM', 'ENNAJOUI CHAKIR', 'KTRI Abdelkarim',
  'ADDAHR AYOUB', 'EZZINE ABDELALI', 'MAAGLI SAID', 'JAWAD ABDERRAHIM', 'TALEB Rachid',
  'NADI TARIK', 'FELLAKI ABDELKARIM', 'SANID TAOUFIK', 'BACHRI HICHAM', 'FARID MOHAMMED',
  'BENNANNA DRISS', 'AOUZANE Hamid', 'AMIZ REDOUANE', 'HAILI MOHAMED', 'HIRMANE FOUAD',
  'BAHROUNE MOHAMED', 'MASSAKI ABDESSAMAD', 'AZOUZI AHMED', 'KOBBI AHMED', 'ERRADI ABDELWAHED',
  'ESSOLAMI HASSAN', 'MARBOUH MUSTAPHA', 'KAITER RACHID', 'ERREJIOUI SAID', 'JMOUHI MOHAMED',
  'GHOUFRAOUI MUSTAPHA', 'ALSAFI KAMAL', 'ESSAIDI MOHAMED', 'FADEL ABDELLATIF', 'FADEL SAMI',
  'BOUABID JAWAD', 'SAHRANI MOHAMED', 'KARBAL BOUCHAIB', 'BELYAKOUT AZIZ', 'HOUAFI AHMED',
  'SOULMANI RACHID', 'HADDOU Fatima Zahra', 'TIJAHI ASMAA', 'SAADOUNI SAID', 'KASSI AHMED',
  'NABBAR ABID', 'ANWAR AZIZ', 'RJAFALLAH LARBI', 'EL AZAR ABDELJALIL', 'FAIZ SAID',
  'SABIR NOUREDDINE', 'ERRAJI ELMEHDI', 'MISSAOUI ABDELMAJID', 'FETHERRAHIM BADR', 'MAHMAH AYOUB',
  'BELHACHEMI OTHMANE', 'SAIS TARIK', 'DARWICH SAID', 'SKOURI ABDELAZIZ', 'ORANGE MOHAMMED',
  'AITBRAHIM SAID', 'SOUAT MALIKA', 'BROGI MINA', 'MARHRAOUI SAADIA', 'ARICHI SOUAD',
  'HOSNI KHADIJA', 'RAFYA SAADIA', 'HMIMSY FATIMA', 'HABIBI MINA', 'HASSI NAIMA',
  'HABACHI MOHAMED', 'FATHY MEHDI', 'MAOUHOUB JIHANE', 'SOUALI KHALISA', 'BOUKHAMI Abdessamad',
  'RTAIMAT HAMZA', 'BAYI HICHAM', 'LMERS ACHERAF', 'NASSIR Abdelali', 'HATOULI OMAR',
  'ABDELKAML YOUSSEF', 'BIYANI AHEMAD', 'SOUBAIR HANANE', 'NABIL MOHAMED', 'CHAFIQ SAFAA',
  'AYADI MOSTAFA', 'LAABID KABIRA', 'HABACHI SOUFIANE', 'HAMZA OULHADR', 'AIT IDAR RACHID',
  'KHAMLICHI AHEMAD', 'LAHMIDI ABDELHAMID', 'CHAMITI Salah Eddine', 'JARNIJA ABDLAH', 'YASSINE ABDLHADI',
  'ERRADOUANI KARIMA', 'DAHR KHALID', 'BOUKADOM MOHAMED', 'ADLANI MOHAMED', 'EZZOUBIR Akram',
  'LAHRICHI HAMZA', 'MOUHAL SOUAD', 'ZITOUNI TALALI', 'ELMAABADY MOHAMED', 'MOUKHTAM NABIL',
  'LKIHAL MEHDI', 'OUMALELK MOUAD', 'MORABIT SALAHDINE'
];

const teams = ['Matin', 'Soir', 'Nuit', 'Normal'];
const contractTypes = ['CDI', 'CDD', 'Intérimaire'];
const ateliers = ['ACC', 'EOLE', 'VEG', 'Qualite'];

function generateRandomDate(startYear = 2020, endYear = 2024) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0];
}

function generatePhoneNumber() {
  return `06${String(Math.floor(Math.random() * 90000000) + 10000000)}`;
}

function generateEmail(nom, prenom) {
  const cleanNom = nom.toLowerCase().replace(/\s+/g, '');
  const cleanPrenom = prenom ? prenom.toLowerCase().replace(/\s+/g, '') : '';
  return `${cleanNom}${cleanPrenom ? '.' + cleanPrenom : ''}@transport.ma`;
}

function parseEmployeeName(fullName) {
  const nameParts = fullName.trim().split(' ');
  const nom = nameParts[0];
  const prenom = nameParts.slice(1).join(' ') || '';
  return { nom, prenom };
}

async function initializeEmployeesMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL établie.');

  const [rows] = await connection.query('SELECT COUNT(*) as count FROM employees');
  if (rows[0].count > 0) {
    console.log(`ℹ️  ${rows[0].count} employé(s) déjà présent(s) dans la base de données.`);
    console.log('🔄 Les nouveaux employés seront ajoutés uniquement s\'ils n\'existent pas déjà.');
  } else {
    console.log('📝 Aucun employé trouvé. Initialisation des employés prédéfinis...');
  }

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < predefinedEmployees.length; i++) {
    const fullName = predefinedEmployees[i];
    const { nom, prenom } = parseEmployeeName(fullName);
    const equipe = teams[i % teams.length];
    const typeContrat = contractTypes[i % contractTypes.length];
    const atelier = ateliers[i % ateliers.length];
    const email = generateEmail(nom, prenom);
    const telephone = generatePhoneNumber();
    const dateEmbauche = generateRandomDate();

    const [existing] = await connection.query('SELECT id FROM employees WHERE nom = ? AND prenom = ?', [nom, prenom]);
    if (existing.length > 0) {
      console.log(`ℹ️  Employé "${nom} ${prenom}" déjà présent (ID: ${existing[0].id})`);
      continue;
    }

    try {
      await connection.execute(
        `INSERT INTO employees (
          nom, prenom, email, telephone, type_contrat, equipe, atelier, date_embauche, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [nom, prenom, email, telephone, typeContrat, equipe, atelier, dateEmbauche]
      );
      inserted++;
      console.log(`✅ Employé "${nom} ${prenom}" ajouté (${typeContrat}, ${equipe})`);
    } catch (err) {
      failed++;
      console.error(`❌ Erreur lors de l'insertion de l'employé ${nom} ${prenom}:`, err.message);
    }
  }

  console.log(`\n🎉 Initialisation terminée ! ${inserted} employé(s) ajouté(s) avec succès.`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} employé(s) n'ont pas pu être ajoutés.`);
  }
  await connection.end();
}

if (require.main === module) {
  console.log('🚀 Initialisation des employés prédéfinis (MySQL)...');
  console.log(`📝 ${predefinedEmployees.length} employés à traiter...`);
  initializeEmployeesMySQL();
}

module.exports = {
  initializeEmployeesMySQL,
  predefinedEmployees,
  parseEmployeeName,
  generateEmail,
  generatePhoneNumber
}; 