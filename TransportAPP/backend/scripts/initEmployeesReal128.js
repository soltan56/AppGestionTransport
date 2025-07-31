const mysql = require('mysql2/promise');

// Configuration MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport_db' // Mets le nom de ta base MySQL
};

// Données des 128 employés avec leurs informations exactes
const employeesData = [
  { nom: 'DENNI', prenom: 'AZIZ', pointRamassage: 'HAY ELBARAKA RUE JOUDART', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'EL BAKRI', prenom: 'REDOUANE', pointRamassage: ' FARAH EL SALLAM, ', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'FADEL', prenom: 'Imad', pointRamassage: 'DAR BOUAAZA ESPACE AL MOHIT 1 ESSAADA', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'JAMILI', prenom: 'MOHAMED', pointRamassage: ' FARAH EL SALLAM, ', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'SOFIANE', prenom: 'MOURAD', pointRamassage: 'SIDI MOUMEN NOUR CITY 3', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'WAKRIM', prenom: 'MOHAMED', pointRamassage: 'CARNAUD COUPE', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'KARNBAH', prenom: 'MOHAMED', pointRamassage: 'HAY  MOHAMMEDY GRAND CEINTURE CAFE 7 3OYOUN', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'MOUDAKIR', prenom: 'SMAIN', pointRamassage: 'ROCHE NOIR', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'FEROUAL', prenom: 'ABDELALI', pointRamassage: 'PANORAMIQUE CAFE EL ANDALOUS', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'AZLAG', prenom: 'HASSAN', pointRamassage: 'AZHAR CAFE ELABDI', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'NASSOUR', prenom: 'ABDELILAH', pointRamassage: 'JAWHARA SIDI MOUMEN PH ALAA', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'TABARANE', prenom: 'YOUNES', pointRamassage: ' SALMIA 2 RUE 14 IMM 10/POSTE SALMIA', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'OUAJHI', prenom: 'YOUNESS', pointRamassage: 'MOSQUE QODS', circuit: 'ANASSI', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ELHANSALI', prenom: 'ABDERRAZAK', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'LABNI', prenom: 'MUSTAPHA', pointRamassage: 'CAFE FEM LEHCEN', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'IJABA', prenom: 'MOUNA', pointRamassage: 'HAY ELFALAH CINEMA FALAH', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'OUAHID', prenom: 'ADIL', pointRamassage: 'AZHAR PHARMACIE SAKANI', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'SAIS', prenom: 'BRAHIM', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ENNAJOUI', prenom: 'CHAKIR', pointRamassage: ' FARAH EL SALLAM, ', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'KTRI', prenom: 'Abdelkarim', pointRamassage: 'ERRAHMA, ECOLE OTHMANE IBN AFFAN', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ADDAHR', prenom: 'AYOUB', pointRamassage: 'HAY MOHAMMEDY BQ BMCE STATION TOTAL', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'EZZINE', prenom: 'ABDELALI', pointRamassage: 'SIDI MOUMEN LOTS HOUDA', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'MAAGLI', prenom: 'SAID', pointRamassage: 'SIDI OTHMANE CAFE ARSENAL', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'JAWAD', prenom: 'ABDERRAHIM', pointRamassage: 'COMMUNE LISASFA ROUTE ELJADIDA', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'TALEB', prenom: 'Rachid', pointRamassage: 'CAFE SEVILLE BOURNAZIL', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'NADI', prenom: 'TARIK', pointRamassage: 'AZHAR ECOLE ATLANTIC', circuit: 'AZHAR', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'FELLAKI', prenom: 'ABDELKARIM', pointRamassage: 'RIAD SIDI MOUMEN GROUPE 4', circuit: 'ANASSI', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'SANID', prenom: 'TAOUFIK', pointRamassage: 'HAY MOHAMMEDY /TAKADOUM DAR DARIBA', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'BACHRI', prenom: 'HICHAM', pointRamassage: 'BD BOUZIANE PH IKBAL', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'FARID', prenom: 'MOHAMMED', pointRamassage: 'OULFA PH EL WOROUD', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'BENNANNA', prenom: 'DRISS', pointRamassage: 'SEBATA CAFE EL WAZIR', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'AOUZANE', prenom: 'Hamid', pointRamassage: 'SOCICA STATION TOTAL', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'AMIZ', prenom: 'REDOUANE', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'HAILI', prenom: 'MOHAMED', pointRamassage: 'HAY MOHAMMEDI CAFE 7 AAYOUN', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'HIRMANE', prenom: 'FOUAD', pointRamassage: 'AZHAR PANORAMA ', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'BAHROUNE', prenom: 'MOHAMED', pointRamassage: 'AZHAR ECOLE ATLANTIC', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'MASSAKI', prenom: 'ABDESSAMAD', pointRamassage: 'MABROUKA SIDI OTHMANE ', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'AZOUZI', prenom: 'AHMED', pointRamassage: 'POSTE HAY MOHAMMEDY', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'KOBBI', prenom: 'AHMED', pointRamassage: 'SIDI MOUMEN 3OTOUR', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'ERRADI', prenom: 'ABDELWAHED', pointRamassage: 'ANASSI SOUK NAMODAJI', circuit: 'ANASSI', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'ESSOLAMI', prenom: 'HASSAN', pointRamassage: 'DERB SULTAN BD MOHAMMED 6 RESIDENCE EL NASR', circuit: 'DERB SULTAN', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'MARBOUH', prenom: 'MUSTAPHA', pointRamassage: 'HAY LALA MERYEM ECOLE QODS', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'KAITER', prenom: 'RACHID', pointRamassage: 'BD MOULAY DRISS (2MARS)', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'ERREJIOUI', prenom: 'SAID', pointRamassage: 'AZHAR RESIDENCE EL NASR', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'JMOUHI', prenom: 'MOHAMED', pointRamassage: 'DERB SULTAN BD BOUCHAIB DOUKALI PH EL NASER', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'GHOUFRAOUI', prenom: 'MUSTAPHA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'ALSAFI', prenom: 'KAMAL', pointRamassage: 'BD ZERKTOUNI ROND POINT D\'EUROPE', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'ESSAIDI', prenom: 'MOHAMED', pointRamassage: 'BOURNAZIL BMCI', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'TECHNIQUE' },
  { nom: 'FADEL', prenom: 'ABDELLATIF', pointRamassage: 'BOULEVARD DE LA CROIX PH CASABLANCA', circuit: 'DERB SULTAN', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'FADEL', prenom: 'SAMI', pointRamassage: 'AZHAR SAKANI ECOLE EL KHANSAE', circuit: 'AZHAR', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'BOUABID', prenom: 'JAWAD', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'SAHRANI', prenom: 'MOHAMED', pointRamassage: 'SIDI MOUMEN 3OTOUR', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'KARBAL', prenom: 'BOUCHAIB', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'BELYAKOUT', prenom: 'AZIZ', pointRamassage: 'COMMUNE LISASFA ROUTE ELJADIDA', circuit: 'RAHMA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'HOUAFI', prenom: 'AHMED', pointRamassage: 'ROUTE MOHAMMEDIA DIYAR ELMANSOUR', circuit: 'MOHAMMEDIA', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'SOULMANI', prenom: 'RACHID', pointRamassage: 'SIDI MOUMEN NOUR CITY 2', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'HADDOU', prenom: 'Fatima Zahra', pointRamassage: 'HAY MOHAMMEDY HALAWIYAT ERRABI3', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'INFIRMERIE' },
  { nom: 'TIJAHI', prenom: 'ASMAA', pointRamassage: 'BD BAGHDAD QODS', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'INFIRMERIE' },
  { nom: 'SAADOUNI', prenom: 'SAID', pointRamassage: 'BOURNAZIL BV 9OWAT ALMOSA3IDA CAFE ZAYTOUNA ', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'ELECTRIQUE' },
  { nom: 'KASSI', prenom: 'AHMED', pointRamassage: 'MOSQUE ADARISSA (SIDI MAAROUF)', circuit: 'DERB SULTAN', equipe: 'N/A', atelier: 'ELECTRIQUE' },
  { nom: 'NABBAR', prenom: 'ABID', pointRamassage: 'CAFE 8 RES 8 HAY LALLA MERYEM', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'ELECTRIQUE' },
  { nom: 'ANWAR', prenom: 'AZIZ', pointRamassage: 'TRAVAUX PUBLIC AL QODS SALLE DE FETE ', circuit: 'AZHAR', equipe: 'MATIN', atelier: 'ELECTRIQUE' },
  { nom: 'RJAFALLAH', prenom: 'LARBI', pointRamassage: 'AIN CHOCK BD DAKHLA MOSQUE OUHOUD', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'EL AZAR', prenom: 'ABDELJALIL', pointRamassage: 'HAY MOULAY RACHID PH IKBAK BD BOUZIANE', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'FAIZ', prenom: 'SAID', pointRamassage: 'OULFA 35', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'SABIR', prenom: 'NOUREDDINE', pointRamassage: 'STATION PETRONIM BD SAKIA ELHAMRA', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'ERRAJI', prenom: 'ELMEHDI', pointRamassage: 'STATION TOTAL BD DRISS ELHARTI', circuit: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'MISSAOUI', prenom: 'ABDELMAJID', pointRamassage: 'SEBATA RUE ABDELKADER SAHRAOUI', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'FETHERRAHIM', prenom: 'BADR', pointRamassage: 'SEBATA CINEMA MADANIA', circuit: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'MAHMAH', prenom: 'AYOUB', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'ANAPEC' },
  { nom: 'BELHACHEMI', prenom: 'OTHMANE', pointRamassage: 'ROCHE NOIR BV MOLAY SMAIL', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'ANAPEC' },
  { nom: 'SAIS', prenom: 'TARIK', pointRamassage: 'ABIR, SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ANAPEC' },
  { nom: 'DARWICH', prenom: 'SAID', pointRamassage: 'HAY ELMASSIRA', circuit: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'SKOURI', prenom: 'ABDELAZIZ', pointRamassage: 'HAY ELMASSIRA 1 FACULTE DES LETTRES', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'INTERIM QUALITE' },
  { nom: 'ORANGE', prenom: 'MOHAMMED', pointRamassage: 'ANASSI BV ZEFZAF', circuit: 'ANASSI', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'AITBRAHIM', prenom: 'SAID', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'SOUAT', prenom: 'MALIKA', pointRamassage: 'A COTE DU CINEMA ENNAJAH MOHMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'BROGI', prenom: 'MINA', pointRamassage: 'RUE PALESTINE A COTE BANQUE POPULAIRE MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'MARHRAOUI', prenom: 'SAADIA', pointRamassage: 'BD MOHAMED 6 ACOTE DE CAFE OULADE HAMASSE  MOHAMMEDI', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'ARICHI', prenom: 'SOUAD', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HOSNI', prenom: 'KHADIJA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'RAFYA', prenom: 'SAADIA', pointRamassage: 'TERMINUS BUS 33 SOUK ENNAMOUDAJA ANASSI', circuit: 'ANASSI', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HMIMSY', prenom: 'FATIMA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HABIBI', prenom: 'MINA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HASSI', prenom: 'NAIMA', pointRamassage: 'MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HABACHI', prenom: 'MOHAMED', pointRamassage: 'SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'MPC' },
  { nom: 'FATHY', prenom: 'MEHDI', pointRamassage: 'AIN HAROUDA', circuit: 'MOHAMMEDIA', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'MAOUHOUB', prenom: 'JIHANE', pointRamassage: 'EL AZHAR ', circuit: 'AZHAR', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'SOUALI', prenom: 'KHALISA', pointRamassage: 'SEBATA BD', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'BOUKHAMI', prenom: 'Abdessamad', pointRamassage: '/ BD MAGHRIB ARABI AZHAR ', circuit: 'AZHAR', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'RTAIMAT', prenom: 'HAMZA', pointRamassage: 'GRAND SEINTURE SBAA AYOUN', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'BAYI', prenom: 'HICHAM', pointRamassage: 'HAY QOUDS BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'LMERS', prenom: 'ACHERAF', pointRamassage: 'BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'NASSIR', prenom: 'Abdelali', pointRamassage: 'AL AZHAR 1 TR IMMOY APPT 47', circuit: 'AZHAR', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'HATOULI', prenom: 'OMAR', pointRamassage: 'SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'ABDELKAML', prenom: 'YOUSSEF', pointRamassage: 'DOUAR BIA RUE 14 N°2', circuit: '', equipe: 'N/A', atelier: 'MPC' },
  { nom: 'BIYANI', prenom: 'AHEMAD', pointRamassage: 'AL HAOUZIA) /Tel :0630131606', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'VEG' },
  { nom: 'SOUBAIR', prenom: 'HANANE', pointRamassage: 'AIN SEBAA ', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'NABIL', prenom: 'MOHAMED', pointRamassage: 'SIDI MOUMEN ', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'EXPEDITIONS' },
  { nom: 'CHAFIQ', prenom: 'SAFAA', pointRamassage: 'HAY MOHAMMADI AIN SBAA', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'EXPEDITIONS' },
  { nom: 'AYADI', prenom: 'MOSTAFA', pointRamassage: 'READ WALFA terminus bus 20', circuit: 'RAHMA', equipe: 'SOIR', atelier: 'EXPEDITIONS' },
  { nom: 'LAABID', prenom: 'KABIRA', pointRamassage: 'HAY MOHMADI ', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'HABACHI', prenom: 'SOUFIANE', pointRamassage: 'SIDI MOUMEN CHARAF', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'HAMZA', prenom: 'OULHADR', pointRamassage: 'ROCHE NOIR BV MOLAY SMAIL', circuit: 'HAY MOHAMMEDI', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'AIT IDAR', prenom: 'RACHID', pointRamassage: 'RES MADINATI TR 10 IMM 05 NR 34 BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'KHAMLICHI', prenom: 'AHEMAD', pointRamassage: 'HAY L HABITAT BL 28 N 5 MOHMMADIA', circuit: 'MOHAMMEDIA', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'LAHMIDI', prenom: 'ABDELHAMID', pointRamassage: 'ABIR SIDI MOUMEN', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'CHAMITI', prenom: 'Salah Eddine', pointRamassage: 'HAY MOUHEMADI', circuit: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'ACC' },
  { nom: 'JARNIJA', prenom: 'ABDLAH', pointRamassage: 'hay lala meriem foryane ', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'YASSINE', prenom: 'ABDLHADI', pointRamassage: 'BOULEVARD HASSAN AL ALAOUI ( SOCIETE TOOL BOIS) ', circuit: 'SIDI OTHMANE', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'ERRADOUANI', prenom: 'KARIMA', pointRamassage: 'HAY MOHAMADI', circuit: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'DAHR', prenom: 'KHALID', pointRamassage: 'ANASSI', circuit: 'ANASSI', equipe: 'N/A', atelier: 'ACC' },
  { nom: 'BOUKADOM', prenom: 'MOHAMED', pointRamassage: 'SIDI MOUMANE', circuit: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'ADLANI', prenom: 'MOHAMED', pointRamassage: 'SIDI BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'EZZOUBIR', prenom: 'Akram', pointRamassage: 'BERNOUSSI', circuit: 'AZHAR', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'LAHRICHI', prenom: 'HAMZA', pointRamassage: 'ELHIYANI HAY FALLAH', circuit: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'MOUHAL', prenom: 'SOUAD', pointRamassage: 'SIDI  MOUMEN SIDI BERNOUSSI', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'IND BTES' },
  { nom: 'ZITOUNI', prenom: 'TALALI', pointRamassage: 'OULFA', circuit: 'RAHMA', equipe: 'N/A', atelier: 'QUALITE' },
  { nom: 'ELMAABADY', prenom: 'MOHAMED', pointRamassage: 'JAWHARA FARMACI AL ALAA', circuit: 'SIDI MOUMEN', equipe: 'N/A', atelier: 'QUALITE' },
  { nom: 'MOUKHTAM', prenom: 'NABIL', pointRamassage: 'AIN CHIFA 1 RUE 55 N° 119  CASA', circuit: 'DERB SULTAN', equipe: 'N/A', atelier: 'EOLE' },
  { nom: 'LKIHAL', prenom: 'MEHDI', pointRamassage: 'BERNOUSSI HAY QODSS', circuit: 'AZHAR', equipe: 'N/A', atelier: '' },
  { nom: 'OUMALELK', prenom: 'MOUAD', pointRamassage: 'AIN HARROUDA MOHAMMEDIA', circuit: 'MOHAMMEDIA', equipe: '', atelier: '' },
  { nom: 'MORABIT', prenom: 'SALAHDINE', pointRamassage: 'HAY MASSIRA 2 MOULAY RACHID', circuit: 'HAY MOLAY RCHID', equipe: 'N/A', atelier: ' ' }
];

async function initEmployeesMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL établie.');

  // Supprimer tous les employés existants
  await connection.query('DELETE FROM employees');
  console.log('🗑️ Employés existants supprimés.');

  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < employeesData.length; i++) {
    const employee = employeesData[i];
    const email = `${employee.nom.toLowerCase()}${employee.prenom ? '.' + employee.prenom.toLowerCase().replace(/\s+/g, '') : ''}@transport.ma`;
    const telephone = `06${String(Math.floor(Math.random() * 90000000) + 10000000)}`;
    const dateEmbauche = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    let typeContrat;
    if (employee.atelier && employee.atelier.includes('INTERIM')) {
      typeContrat = 'Intérimaire';
    } else if (Math.random() > 0.7) {
      typeContrat = 'CDD';
    } else {
      typeContrat = 'CDI';
    }
    try {
      await connection.execute(
        `INSERT INTO employees (nom, prenom, email, telephone, type_contrat, equipe, atelier, date_embauche, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          employee.nom,
          employee.prenom,
          email,
          telephone,
          typeContrat,
          employee.equipe === 'N/A' ? 'Normal' : employee.equipe,
          employee.atelier,
          dateEmbauche
        ]
      );
      insertedCount++;
    } catch (err) {
      errorCount++;
      console.error(`❌ Erreur pour ${employee.nom} ${employee.prenom}:`, err.message);
    }
  }

  console.log(`\n✅ Insertion terminée !`);
  console.log(`📊 Employés insérés: ${insertedCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📋 Total attendu: 128`);
  await connection.end();
}

if (require.main === module) {
  initEmployeesMySQL();
}

module.exports = { initEmployeesMySQL }; 