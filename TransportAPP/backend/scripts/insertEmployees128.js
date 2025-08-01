const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transport'
};

const employeesData = [
  { nom: 'DENNI AZIZ', pointRamassage: 'HAY ELBARAKA RUE JOUDART', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'EL BAKRI REDOUANE', pointRamassage: ' FARAH EL SALLAM, ', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'FADEL Imad', pointRamassage: 'DAR BOUAAZA ESPACE AL MOHIT 1 ESSAADA', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'JAMILI MOHAMED', pointRamassage: ' FARAH EL SALLAM, ', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'SOFIANE MOURAD', pointRamassage: 'SIDI MOUMEN NOUR CITY 3', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'WAKRIM MOHAMED', pointRamassage: 'CARNAUD COUPE', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'KARNBAH MOHAMED', pointRamassage: 'HAY  MOHAMMEDY GRAND CEINTURE CAFE 7 3OYOUN', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'MOUDAKIR  SMAIN', pointRamassage: 'ROCHE NOIR', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'FEROUAL ABDELALI', pointRamassage: 'PANORAMIQUE CAFE EL ANDALOUS', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'AZLAG HASSAN', pointRamassage: 'AZHAR CAFE ELABDI', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'NASSOUR  ABDELILAH', pointRamassage: 'JAWHARA SIDI MOUMEN PH ALAA', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'TABARANE  YOUNES', pointRamassage: ' SALMIA 2 RUE 14 IMM 10/POSTE SALMIA', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'OUAJHI YOUNESS', pointRamassage: 'MOSQUE QODS', circuit: 'ANASSI', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ELHANSALI ABDERRAZAK', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'LABNI MUSTAPHA', pointRamassage: 'CAFE FEM LEHCEN', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'IJABA MOUNA', pointRamassage: 'HAY ELFALAH CINEMA FALAH', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'OUAHID ADIL', pointRamassage: 'AZHAR PHARMACIE SAKANI', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'SAIS BRAHIM', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ENNAJOUI CHAKIR', pointRamassage: ' FARAH EL SALLAM, ', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'KTRI Abdelkarim', pointRamassage: 'ERRAHMA, ECOLE OTHMANE IBN AFFAN', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ADDAHR AYOUB', pointRamassage: 'HAY MOHAMMEDY BQ BMCE STATION TOTAL', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'EZZINE ABDELALI', pointRamassage: 'SIDI MOUMEN LOTS HOUDA', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'MAAGLI SAID', pointRamassage: 'SIDI OTHMANE CAFE ARSENAL', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'JAWAD ABDERRAHIM', pointRamassage: 'COMMUNE LISASFA ROUTE ELJADIDA', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'TALEB Rachid', pointRamassage: 'CAFE SEVILLE BOURNAZIL', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'NADI TARIK', pointRamassage: 'AZHAR ECOLE ATLANTIC', circuit: 'AZHAR', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'FELLAKI ABDELKARIM', pointRamassage: 'RIAD SIDI MOUMEN GROUPE 4', circuit: 'ANASSI', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'SANID TAOUFIK', pointRamassage: 'HAY MOHAMMEDY /TAKADOUM DAR DARIBA', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'BACHRI HICHAM', pointRamassage: 'BD BOUZIANE PH IKBAL', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'FARID  MOHAMMED', pointRamassage: 'OULFA PH EL WOROUD', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'BENNANNA DRISS', pointRamassage: 'SEBATA CAFE EL WAZIR', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'AOUZANE Hamid', pointRamassage: 'SOCICA STATION TOTAL', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'AMIZ REDOUANE', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'HAILI MOHAMED', pointRamassage: 'HAY MOHAMMEDI CAFE 7 AAYOUN', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'HIRMANE FOUAD', pointRamassage: 'AZHAR PANORAMA ', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'BAHROUNE MOHAMED', pointRamassage: 'AZHAR ECOLE ATLANTIC', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'MASSAKI ABDESSAMAD', pointRamassage: 'MABROUKA SIDI OTHMANE ', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'AZOUZI AHMED', pointRamassage: 'POSTE HAY MOHAMMEDY', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'KOBBI AHMED', pointRamassage: 'SIDI MOUMEN 3OTOUR', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'ERRADI ABDELWAHED', pointRamassage: 'ANASSI SOUK NAMODAJI', circuit: 'ANASSI', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'ESSOLAMI HASSAN', pointRamassage: 'DERB SULTAN BD MOHAMMED 6 RESIDENCE EL NASR', circuit: 'DERB SULTAN', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'MARBOUH MUSTAPHA', pointRamassage: 'HAY LALA MERYEM ECOLE QODS', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'KAITER RACHID', pointRamassage: 'BD MOULAY DRISS (2MARS)', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'ERREJIOUI  SAID', pointRamassage: 'AZHAR RESIDENCE EL NASR', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'JMOUHI MOHAMED', pointRamassage: 'DERB SULTAN BD BOUCHAIB DOUKALI PH EL NASER', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'GHOUFRAOUI MUSTAPHA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'ALSAFI KAMAL', pointRamassage: 'BD ZERKTOUNI ROND POINT D\'EUROPE', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'ESSAIDI MOHAMED', pointRamassage: 'BOURNAZIL BMCI', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'TECHNIQUE' },
  { nom: 'FADEL ABDELLATIF', pointRamassage: 'BOULEVARD DE LA CROIX PH CASABLANCA', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'FADEL SAMI', pointRamassage: 'AZHAR SAKANI ECOLE EL KHANSAE', circuit: 'AZHAR', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'BOUABID JAWAD', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'SAHRANI MOHAMED', pointRamassage: 'SIDI MOUMEN 3OTOUR', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'KARBAL BOUCHAIB', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'BELYAKOUT AZIZ', pointRamassage: 'COMMUNE LISASFA ROUTE ELJADIDA', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'HOUAFI AHMED', pointRamassage: 'ROUTE MOHAMMEDIA DIYAR ELMANSOUR', circuit: 'MOHAMMEDIA', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'SOULMANI RACHID', pointRamassage: 'SIDI MOUMEN NOUR CITY 2', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'HADDOU Fatima Zahra', pointRamassage: 'HAY MOHAMMEDY HALAWIYAT ERRABI3', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'INFIRMERIE' },
  { nom: 'TIJAHI ASMAA', pointRamassage: 'BD BAGHDAD QODS', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'INFIRMERIE' },
  { nom: 'SAADOUNI SAID', pointRamassage: 'BOURNAZIL BV 9OWAT ALMOSA3IDA CAFE ZAYTOUNA ', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'ELECTRIQUE' },
  { nom: 'KASSI AHMED', pointRamassage: 'MOSQUE ADARISSA (SIDI MAAROUF)', circuit: 'DERB SULTAN', equipe: 'N/A', atelier: 'ELECTRIQUE' },
  { nom: 'NABBAR ABID', pointRamassage: 'CAFE 8 RES 8 HAY LALLA MERYEM', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'ELECTRIQUE' },
  { nom: 'ANWAR AZIZ', pointRamassage: 'TRAVAUX PUBLIC AL QODS SALLE DE FETE ', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'ELECTRIQUE' },
  { nom: 'RJAFALLAH LARBI', pointRamassage: 'AIN CHOCK BD DAKHLA MOSQUE OUHOUD', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'EL AZAR  ABDELJALIL', pointRamassage: 'HAY MOULAY RACHID PH IKBAK BD BOUZIANE', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'FAIZ SAID', pointRamassage: 'OULFA 35', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'SABIR NOUREDDINE', pointRamassage: 'STATION PETRONIM BD SAKIA ELHAMRA', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'ERRAJI ELMEHDI', pointRamassage: 'STATION TOTAL BD DRISS ELHARTI', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'MISSAOUI ABDELMAJID', pointRamassage: 'SEBATA RUE ABDELKADER SAHRAOUI', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'FETHERRAHIM BADR', pointRamassage: 'SEBATA CINEMA MADANIA', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'MAHMAH AYOUB', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'ANAPEC' },
  { nom: 'BELHACHEMI OTHMANE', pointRamassage: 'ROCHE NOIR BV MOLAY SMAIL', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'ANAPEC' },
  { nom: 'SAIS TARIK', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ANAPEC' },
  { nom: 'DARWICH SAID', pointRamassage: 'HAY ELMASSIRA', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'SKOURI ABDELAZIZ', pointRamassage: 'HAY ELMASSIRA 1 FACULTE DES LETTRES', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'INTERIM QUALITE' },
  { nom: 'ORANGE MOHAMMED', pointRamassage: 'ANASSI BV ZEFZAF', circuit: 'ANASSI', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'AITBRAHIM SAID ', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'SOUAT MALIKA', pointRamassage: 'A COTE DU CINEMA ENNAJAH MOHMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'BROGI MINA', pointRamassage: 'RUE PALESTINE A COTE BANQUE POPULAIRE MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'MARHRAOUI SAADIA ', pointRamassage: 'BD MOHAMED 6 ACOTE DE CAFE OULADE HAMASSE  MOHAMMEDI', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'ARICHI SOUAD ', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HOSNI KHADIJA ', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'RAFYA SAADIA ', pointRamassage: 'TERMINUS BUS 33 SOUK ENNAMOUDAJA ANASSI', circuit: 'ANASSI', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HMIMSY FATIMA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HABIBI MINA ', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HASSI NAIMA ', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HABACHI MOHAMED', pointRamassage: 'SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'MPC' },
  { nom: 'FATHY MEHDI ', pointRamassage: 'AIN HAROUDA', circuit: 'MOHAMMEDIA', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'MAOUHOUB JIHANE ', pointRamassage: 'EL AZHAR ', circuit: 'AZHAR', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'SOUALI  KHALISA ', pointRamassage: 'SEBATA BD', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'BOUKHAMI Abdessamad ', pointRamassage: '/ BD MAGHRIB ARABI AZHAR ', circuit: 'AZHAR', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'RTAIMAT HAMZA ', pointRamassage: 'GRAND SEINTURE SBAA AYOUN', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'BAYI HICHAM  ', pointRamassage: 'HAY QOUDS BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'LMERS ACHERAF ', pointRamassage: 'BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'NASSIR Abdelali', pointRamassage: 'AL AZHAR 1 TR IMMOY APPT 47', circuit: 'AZHAR', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'HATOULI OMAR', pointRamassage: 'SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'ABDELKAML YOUSSEF', pointRamassage: 'DOUAR BIA RUE 14 N°2', circuit: '', equipe: 'N/A', atelier: 'MPC' },
  { nom: 'BIYANI AHEMAD', pointRamassage: 'AL HAOUZIA) /Tel :0630131606', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'SOUBAIR HANANE ', pointRamassage: 'AIN SEBAA ', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'NABIL MOHAMED', pointRamassage: 'SIDI MOUMEN ', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'EXPEDITIONS' },
  { nom: 'CHAFIQ SAFAA', pointRamassage: 'HAY MOHAMMADI AIN SBAA', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'EXPEDITIONS' },
  { nom: 'AYADI MOSTAFA ', pointRamassage: 'READ WALFA terminus bus 20', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'EXPEDITIONS' },
  { nom: 'LAABID KABIRA', pointRamassage: 'HAY MOHMADI ', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'HABACHI SOUFIANE ', pointRamassage: 'SIDI MOUMEN CHARAF', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'HAMZA OULHADR ', pointRamassage: 'ROCHE NOIR BV MOLAY SMAIL', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'AIT IDAR RACHID ', pointRamassage: 'RES MADINATI TR 10 IMM 05 NR 34 BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'KHAMLICHI  AHEMAD ', pointRamassage: 'HAY L HABITAT BL 28 N 5 MOHMMADIA', circuit: 'MOHAMMEDIA', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'LAHMIDI ABDELHAMID', pointRamassage: 'ABIR SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'CHAMITI Salah Eddine', pointRamassage: 'HAY MOUHEMADI', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'ACC' },
  { nom: 'JARNIJA ABDLAH ', pointRamassage: 'hay lala meriem foryane ', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'YASSINE ABDLHADI ', pointRamassage: 'BOULEVARD HASSAN AL ALAOUI ( SOCIETE TOOL BOIS) ', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'ERRADOUANI KARIMA', pointRamassage: 'HAY MOHAMADI', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'DAHR KHALID', pointRamassage: 'ANASSI', circuit: 'ANASSI', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'BOUKADOM MOHAMED', pointRamassage: 'SIDI MOUMANE', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'ADLANI MOHAMED ', pointRamassage: 'SIDI BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'EZZOUBIR Akram', pointRamassage: 'BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'LAHRICHI HAMZA ', pointRamassage: 'ELHIYANI HAY FALLAH', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'MOUHAL SOUAD', pointRamassage: 'SIDI  MOUMEN SIDI BERNOUSSI', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'ZITOUNI TALALI ', pointRamassage: 'OULFA', circuit: 'RAHMA', equipe: 'N/A', atelier: 'QUALITE' },
  { nom: 'ELMAABADY MOHAMED ', pointRamassage: 'JAWHARA FARMACI AL ALAA', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'QUALITE' },
  { nom: 'MOUKHTAM NABIL', pointRamassage: 'AIN CHIFA 1 RUE 55 N° 119  CASA', circuit: 'DERB SULTAN', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'LKIHAL MEHDI ', pointRamassage: 'BERNOUSSI HAY QODSS', circuit: 'AZHAR', equipe: 'N/A', atelier: '' },
  { nom: 'OUMALELK MOUAD', pointRamassage: 'AIN HARROUDA MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: '', atelier: '' },
  { nom: 'MORABIT SALAHDINE', pointRamassage: 'HAY MASSIRA 2 MOULAY RACHID', circuit: 'HAY MOLAY RCHID', equipe: 'N/A', atelier: ' ' }
];

async function insertEmployeesMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL établie.');

  await connection.query('DELETE FROM employees');
  console.log('🗑️ Employés existants supprimés.');

  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < employeesData.length; i++) {
    const employee = employeesData[i];
    try {
      await connection.execute(
        `INSERT INTO employees (nom, prenom, point_ramassage, circuit, equipe, atelier, type_contrat, email, telephone, date_embauche, created_at, updated_at) VALUES (?, '', ?, ?, ?, ?, 'CDI', '', '', '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          employee.nom,
          employee.pointRamassage,
          employee.circuit,
          employee.equipe,
          employee.atelier.trim()
        ]
      );
      insertedCount++;
    } catch (err) {
      errorCount++;
      console.error(`❌ Erreur pour ${employee.nom}:`, err.message);
    }
  }

  console.log(`\n✅ Insertion terminée !`);
  console.log(`📊 Employés insérés: ${insertedCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📋 Total attendu: 128`);
  await connection.end();
}

if (require.main === module) {
  insertEmployeesMySQL();
}

module.exports = { insertEmployeesMySQL }; 