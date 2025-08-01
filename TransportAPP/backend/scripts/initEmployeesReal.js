const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport' // Même base que le serveur
};

// Données des employés réels
const employees = [
  { nom: 'DENNI', prenom: 'AZIZ', point_ramassage: 'HAY ELBARAKA RUE JOUDART', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'EL BAKRI', prenom: 'REDOUANE', point_ramassage: 'FARAH EL SALLAM', circuit_affecte: 'RAHMA', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'FADEL', prenom: 'Imad', point_ramassage: 'DAR BOUAAZA ESPACE AL MOHIT 1 ESSAADA', circuit_affecte: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'JAMILI', prenom: 'MOHAMED', point_ramassage: 'FARAH EL SALLAM', circuit_affecte: 'RAHMA', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'SOFIANE', prenom: 'MOURAD', point_ramassage: 'SIDI MOUMEN NOUR CITY 3', circuit_affecte: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'WAKRIM', prenom: 'MOHAMED', point_ramassage: 'CARNAUD COUPE', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'KARNBAH', prenom: 'MOHAMED', point_ramassage: 'HAY MOHAMMEDY GRAND CEINTURE CAFE 7 3OYOUN', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'MOUDAKIR', prenom: 'SMAIN', point_ramassage: 'ROCHE NOIR', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'FEROUAL', prenom: 'ABDELALI', point_ramassage: 'PANORAMIQUE CAFE EL ANDALOUS', circuit_affecte: 'DERB SULTAN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'AZLAG', prenom: 'HASSAN', point_ramassage: 'AZHAR CAFE ELABDI', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'NASSOUR', prenom: 'ABDELILAH', point_ramassage: 'JAWHARA SIDI MOUMEN PH ALAA', circuit_affecte: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'TABARANE', prenom: 'YOUNES', point_ramassage: 'SALMIA 2 RUE 14 IMM 10/POSTE SALMIA', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'OUAJHI', prenom: 'YOUNESS', point_ramassage: 'MOSQUE QODS', circuit_affecte: 'ANASSI', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ELHANSALI', prenom: 'ABDERRAZAK', point_ramassage: 'ABIR, SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'LABNI', prenom: 'MUSTAPHA', point_ramassage: 'CAFE FEM LEHCEN', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'IJABA', prenom: 'MOUNA', point_ramassage: 'HAY ELFALAH CINEMA FALAH', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'MPC' },
  { nom: 'OUAHID', prenom: 'ADIL', point_ramassage: 'AZHAR PHARMACIE SAKANI', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'SAIS', prenom: 'BRAHIM', point_ramassage: 'ABIR, SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ENNAJOUI', prenom: 'CHAKIR', point_ramassage: 'FARAH EL SALLAM', circuit_affecte: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'KTRI', prenom: 'Abdelkarim', point_ramassage: 'ERRAHMA, ECOLE OTHMANE IBN AFFAN', circuit_affecte: 'RAHMA', equipe: 'MATIN', atelier: 'MPC' },
  { nom: 'ADDAHR', prenom: 'AYOUB', point_ramassage: 'HAY MOHAMMEDY BQ BMCE STATION TOTAL', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'EZZINE', prenom: 'ABDELALI', point_ramassage: 'SIDI MOUMEN LOTS HOUDA', circuit_affecte: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'MAAGLI', prenom: 'SAID', point_ramassage: 'SIDI OTHMANE CAFE ARSENAL', circuit_affecte: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'JAWAD', prenom: 'ABDERRAHIM', point_ramassage: 'COMMUNE LISASFA ROUTE ELJADIDA', circuit_affecte: 'RAHMA', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'TALEB', prenom: 'Rachid', point_ramassage: 'CAFE SEVILLE BOURNAZIL', circuit_affecte: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'NADI', prenom: 'TARIK', point_ramassage: 'AZHAR ECOLE ATLANTIC', circuit_affecte: 'AZHAR', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'FELLAKI', prenom: 'ABDELKARIM', point_ramassage: 'RIAD SIDI MOUMEN GROUPE 4', circuit_affecte: 'ANASSI', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'SANID', prenom: 'TAOUFIK', point_ramassage: 'HAY MOHAMMEDY /TAKADOUM DAR DARIBA', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'Normal', atelier: 'EOLE' },
  { nom: 'BACHRI', prenom: 'HICHAM', point_ramassage: 'BD BOUZIANE PH IKBAL', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'FARID', prenom: 'MOHAMMED', point_ramassage: 'OULFA PH EL WOROUD', circuit_affecte: 'RAHMA', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'BENNANNA', prenom: 'DRISS', point_ramassage: 'SEBATA CAFE EL WAZIR', circuit_affecte: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'EOLE' },
  { nom: 'AOUZANE', prenom: 'Hamid', point_ramassage: 'SOCICA STATION TOTAL', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'EOLE' },
  { nom: 'AMIZ', prenom: 'REDOUANE', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'HAILI', prenom: 'MOHAMED', point_ramassage: 'HAY MOHAMMEDI CAFE 7 AAYOUN', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'HIRMANE', prenom: 'FOUAD', point_ramassage: 'AZHAR PANORAMA', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'BAHROUNE', prenom: 'MOHAMED', point_ramassage: 'AZHAR ECOLE ATLANTIC', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'MASSAKI', prenom: 'ABDESSAMAD', point_ramassage: 'MABROUKA SIDI OTHMANE', circuit_affecte: 'SIDI OTHMANE', equipe: 'Normal', atelier: 'ACC' },
  { nom: 'AZOUZI', prenom: 'AHMED', point_ramassage: 'POSTE HAY MOHAMMEDY', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'KOBBI', prenom: 'AHMED', point_ramassage: 'SIDI MOUMEN 3OTOUR', circuit_affecte: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'ERRADI', prenom: 'ABDELWAHED', point_ramassage: 'ANASSI SOUK NAMODAJI', circuit_affecte: 'ANASSI', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'ESSOLAMI', prenom: 'HASSAN', point_ramassage: 'DERB SULTAN BD MOHAMMED 6 RESIDENCE EL NASR', circuit_affecte: 'DERB SULTAN', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'MARBOUH', prenom: 'MUSTAPHA', point_ramassage: 'HAY LALA MERYEM ECOLE QODS', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'KAITER', prenom: 'RACHID', point_ramassage: 'BD MOULAY DRISS (2MARS)', circuit_affecte: 'DERB SULTAN', equipe: 'MATIN', atelier: 'IND BTES' },
  { nom: 'ERREJIOUI', prenom: 'SAID', point_ramassage: 'AZHAR RESIDENCE EL NASR', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'JMOUHI', prenom: 'MOHAMED', point_ramassage: 'DERB SULTAN BD BOUCHAIB DOUKALI PH EL NASER', circuit_affecte: 'DERB SULTAN', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'GHOUFRAOUI', prenom: 'MUSTAPHA', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'ALSAFI', prenom: 'KAMAL', point_ramassage: 'BD ZERKTOUNI ROND POINT D\'EUROPE', circuit_affecte: 'DERB SULTAN', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'ESSAIDI', prenom: 'MOHAMED', point_ramassage: 'BOURNAZIL BMCI', circuit_affecte: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'TECHNIQUE' },
  { nom: 'FADEL', prenom: 'ABDELLATIF', point_ramassage: 'BOULEVARD DE LA CROIX PH CASABLANCA', circuit_affecte: 'DERB SULTAN', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'FADEL', prenom: 'SAMI', point_ramassage: 'AZHAR SAKANI ECOLE EL KHANSAE', circuit_affecte: 'AZHAR', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'BOUABID', prenom: 'JAWAD', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'SAHRANI', prenom: 'MOHAMED', point_ramassage: 'SIDI MOUMEN 3OTOUR', circuit_affecte: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'KARBAL', prenom: 'BOUCHAIB', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'BELYAKOUT', prenom: 'AZIZ', point_ramassage: 'COMMUNE LISASFA ROUTE ELJADIDA', circuit_affecte: 'RAHMA', equipe: 'MATIN', atelier: 'VEG' },
  { nom: 'HOUAFI', prenom: 'AHMED', point_ramassage: 'ROUTE MOHAMMEDIA DIYAR ELMANSOUR', circuit_affecte: 'MOHAMMEDIA', equipe: 'SOIR', atelier: 'VEG' },
  { nom: 'SOULMANI', prenom: 'RACHID', point_ramassage: 'SIDI MOUMEN NOUR CITY 2', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'HADDOU', prenom: 'Fatima Zahra', point_ramassage: 'HAY MOHAMMEDY HALAWIYAT ERRABI3', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'INFIRMERIE' },
  { nom: 'TIJAHI', prenom: 'ASMAA', point_ramassage: 'BD BAGHDAD QODS', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'INFIRMERIE' },
  { nom: 'SAADOUNI', prenom: 'SAID', point_ramassage: 'BOURNAZIL BV 9OWAT ALMOSA3IDA CAFE ZAYTOUNA', circuit_affecte: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'ELECTRIQUE' },
  { nom: 'KASSI', prenom: 'AHMED', point_ramassage: 'MOSQUE ADARISSA (SIDI MAAROUF)', circuit_affecte: 'DERB SULTAN', equipe: 'Normal', atelier: 'ELECTRIQUE' },
  { nom: 'NABBAR', prenom: 'ABID', point_ramassage: 'CAFE 8 RES 8 HAY LALLA MERYEM', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'ELECTRIQUE' },
  { nom: 'ANWAR', prenom: 'AZIZ', point_ramassage: 'TRAVAUX PUBLIC AL QODS SALLE DE FETE', circuit_affecte: 'AZHAR', equipe: 'MATIN', atelier: 'ELECTRIQUE' },
  { nom: 'RJAFALLAH', prenom: 'LARBI', point_ramassage: 'AIN CHOCK BD DAKHLA MOSQUE OUHOUD', circuit_affecte: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'EL AZAR', prenom: 'ABDELJALIL', point_ramassage: 'HAY MOULAY RACHID PH IKBAK BD BOUZIANE', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'FAIZ', prenom: 'SAID', point_ramassage: 'OULFA 35', circuit_affecte: 'RAHMA', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'SABIR', prenom: 'NOUREDDINE', point_ramassage: 'STATION PETRONIM BD SAKIA ELHAMRA', circuit_affecte: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'ERRAJI', prenom: 'ELMEHDI', point_ramassage: 'STATION TOTAL BD DRISS ELHARTI', circuit_affecte: 'SIDI OTHMANE', equipe: 'MATIN', atelier: 'QUALITE' },
  { nom: 'MISSAOUI', prenom: 'ABDELMAJID', point_ramassage: 'SEBATA RUE ABDELKADER SAHRAOUI', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'FETHERRAHIM', prenom: 'BADR', point_ramassage: 'SEBATA CINEMA MADANIA', circuit_affecte: 'SIDI OTHMANE', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'MAHMAH', prenom: 'AYOUB', point_ramassage: 'ABIR, SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'SOIR', atelier: 'ANAPEC' },
  { nom: 'BELHACHEMI', prenom: 'OTHMANE', point_ramassage: 'ROCHE NOIR BV MOLAY SMAIL', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'Normal', atelier: 'ANAPEC' },
  { nom: 'SAIS', prenom: 'TARIK', point_ramassage: 'ABIR, SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ANAPEC' },
  { nom: 'DARWICH', prenom: 'SAID', point_ramassage: 'HAY ELMASSIRA', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'SKOURI', prenom: 'ABDELAZIZ', point_ramassage: 'HAY ELMASSIRA 1 FACULTE DES LETTRES', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'INTERIM QUALITE' },
  { nom: 'ORANGE', prenom: 'MOHAMMED', point_ramassage: 'ANASSI BV ZEFZAF', circuit_affecte: 'ANASSI', equipe: 'SOIR', atelier: 'QUALITE' },
  { nom: 'AITBRAHIM', prenom: 'SAID', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'SOUAT', prenom: 'MALIKA', point_ramassage: 'A COTE DU CINEMA ENNAJAH MOHMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'BROGI', prenom: 'MINA', point_ramassage: 'RUE PALESTINE A COTE BANQUE POPULAIRE MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'MARHRAOUI', prenom: 'SAADIA', point_ramassage: 'BD MOHAMED 6 ACOTE DE CAFE OULADE HAMASSE MOHAMMEDI', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'ARICHI', prenom: 'SOUAD', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HOSNI', prenom: 'KHADIJA', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'RAFYA', prenom: 'SAADIA', point_ramassage: 'TERMINUS BUS 33 SOUK ENNAMOUDAJA ANASSI', circuit_affecte: 'ANASSI', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HMIMSY', prenom: 'FATIMA', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HABIBI', prenom: 'MINA', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HASSI', prenom: 'NAIMA', point_ramassage: 'MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'MATIN', atelier: 'INTERIM QUALITE' },
  { nom: 'HABACHI', prenom: 'MOHAMED', point_ramassage: 'SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'MPC' },
  { nom: 'FATHY', prenom: 'MEHDI', point_ramassage: 'AIN HAROUDA', circuit_affecte: 'MOHAMMEDIA', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'MAOUHOUB', prenom: 'JIHANE', point_ramassage: 'EL AZHAR', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'EOLE' },
  { nom: 'SOUALI', prenom: 'KHALISA', point_ramassage: 'SEBATA BD', circuit_affecte: 'SIDI OTHMANE', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'BOUKHAMI', prenom: 'Abdessamad', point_ramassage: 'BD MAGHRIB ARABI AZHAR', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'RTAIMAT', prenom: 'HAMZA', point_ramassage: 'GRAND SEINTURE SBAA AYOUN', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'BAYI', prenom: 'HICHAM', point_ramassage: 'HAY QOUDS BERNOUSSI', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'LMERS', prenom: 'ACHERAF', point_ramassage: 'BERNOUSSI', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'NASSIR', prenom: 'Abdelali', point_ramassage: 'AL AZHAR 1 TR IMMOY APPT 47', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'HATOULI', prenom: 'OMAR', point_ramassage: 'SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'ABDELKAML', prenom: 'YOUSSEF', point_ramassage: 'DOUAR BIA RUE 14 N°2', circuit_affecte: '', equipe: 'Normal', atelier: 'MPC' },
  { nom: 'BIYANI', prenom: 'AHEMAD', point_ramassage: 'AL HAOUZIA', circuit_affecte: 'SIDI OTHMANE', equipe: 'Normal', atelier: 'VEG' },
  { nom: 'SOUBAIR', prenom: 'HANANE', point_ramassage: 'AIN SEBAA', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'EXPEDITIONS' },
  { nom: 'NABIL', prenom: 'MOHAMED', point_ramassage: 'SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'EXPEDITIONS' },
  { nom: 'CHAFIQ', prenom: 'SAFAA', point_ramassage: 'HAY MOHAMMADI AIN SBAA', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'Normal', atelier: 'EXPEDITIONS' },
  { nom: 'AYADI', prenom: 'MOSTAFA', point_ramassage: 'READ WALFA terminus bus 20', circuit_affecte: 'RAHMA', equipe: 'SOIR', atelier: 'EXPEDITIONS' },
  { nom: 'LAABID', prenom: 'KABIRA', point_ramassage: 'HAY MOHMADI', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'HABACHI', prenom: 'SOUFIANE', point_ramassage: 'SIDI MOUMEN CHARAF', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'EOLE' },
  { nom: 'HAMZA', prenom: 'OULHADR', point_ramassage: 'ROCHE NOIR BV MOLAY SMAIL', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'AIT IDAR', prenom: 'RACHID', point_ramassage: 'RES MADINATI TR 10 IMM 05 NR 34 BERNOUSSI', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'KHAMLICHI', prenom: 'AHEMAD', point_ramassage: 'HAY L HABITAT BL 28 N 5 MOHMMADIA', circuit_affecte: 'MOHAMMEDIA', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'LAHMIDI', prenom: 'ABDELHAMID', point_ramassage: 'ABIR SIDI MOUMEN', circuit_affecte: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'CHAMITI', prenom: 'Salah Eddine', point_ramassage: 'HAY MOUHEMADI', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'SOIR', atelier: 'ACC' },
  { nom: 'JARNIJA', prenom: 'ABDLAH', point_ramassage: 'hay lala meriem foryane', circuit_affecte: 'SIDI OTHMANE', equipe: 'Normal', atelier: 'ACC' },
  { nom: 'YASSINE', prenom: 'ABDLHADI', point_ramassage: 'BOULEVARD HASSAN AL ALAOUI (SOCIETE TOOL BOIS)', circuit_affecte: 'SIDI OTHMANE', equipe: 'Normal', atelier: 'ACC' },
  { nom: 'ERRADOUANI', prenom: 'KARIMA', point_ramassage: 'HAY MOHAMADI', circuit_affecte: 'HAY MOHAMMEDI', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'DAHR', prenom: 'KHALID', point_ramassage: 'ANASSI', circuit_affecte: 'ANASSI', equipe: 'Normal', atelier: 'ACC' },
  { nom: 'BOUKADOM', prenom: 'MOHAMED', point_ramassage: 'SIDI MOUMANE', circuit_affecte: 'SIDI MOUMEN', equipe: 'MATIN', atelier: 'ACC' },
  { nom: 'ADLANI', prenom: 'MOHAMED', point_ramassage: 'SIDI BERNOUSSI', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'EZZOUBIR', prenom: 'Akram', point_ramassage: 'BERNOUSSI', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'LAHRICHI', prenom: 'HAMZA', point_ramassage: 'ELHIYANI HAY FALLAH', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'SOIR', atelier: 'IND BTES' },
  { nom: 'MOUHAL', prenom: 'SOUAD', point_ramassage: 'SIDI MOUMEN SIDI BERNOUSSI', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'IND BTES' },
  { nom: 'ZITOUNI', prenom: 'TALALI', point_ramassage: 'OULFA', circuit_affecte: 'RAHMA', equipe: 'Normal', atelier: 'QUALITE' },
  { nom: 'ELMAABADY', prenom: 'MOHAMED', point_ramassage: 'JAWHARA FARMACI AL ALAA', circuit_affecte: 'SIDI MOUMEN', equipe: 'Normal', atelier: 'QUALITE' },
  { nom: 'MOUKHTAM', prenom: 'NABIL', point_ramassage: 'AIN CHIFA 1 RUE 55 N° 119 CASA', circuit_affecte: 'DERB SULTAN', equipe: 'Normal', atelier: 'EOLE' },
  { nom: 'LKIHAL', prenom: 'MEHDI', point_ramassage: 'BERNOUSSI HAY QODSS', circuit_affecte: 'AZHAR', equipe: 'Normal', atelier: '' },
  { nom: 'OUMALELK', prenom: 'MOUAD', point_ramassage: 'AIN HARROUDA MOHAMMEDIA', circuit_affecte: 'MOHAMMEDIA', equipe: '', atelier: '' },
  { nom: 'MORABIT', prenom: 'SALAHDINE', point_ramassage: 'HAY MASSIRA 2 MOULAY RACHID', circuit_affecte: 'HAY MOLAY RCHID', equipe: 'Normal', atelier: '' }
];

async function initializeEmployeesRealMySQL() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connexion à la base de données MySQL établie.');

  await connection.query('DELETE FROM employees');
  console.log('🗑️ Employés existants supprimés.');

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    try {
      await connection.execute(
        `INSERT INTO employees (nom, prenom, point_ramassage, circuit_affecte, equipe, atelier, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [emp.nom, emp.prenom, emp.point_ramassage, emp.circuit_affecte, emp.equipe, emp.atelier]
      );
      inserted++;
      console.log(`✅ Employé "${emp.nom} ${emp.prenom}" ajouté (${emp.equipe}, ${emp.atelier})`);
    } catch (err) {
      failed++;
      console.error(`❌ Erreur lors de l'insertion de ${emp.nom} ${emp.prenom}:`, err.message);
    }
  }

  console.log(`\n🎉 Initialisation terminée ! ${inserted} employé(s) ajouté(s) avec succès.`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} employé(s) n'ont pas pu être ajoutés.`);
  }
  await connection.end();
}

if (require.main === module) {
  console.log('🚀 Initialisation des employés réels (MySQL)...');
  initializeEmployeesRealMySQL();
}

module.exports = { initializeEmployeesRealMySQL }; 