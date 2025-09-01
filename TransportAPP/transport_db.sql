/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.5.27-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: transport_db
-- ------------------------------------------------------
-- Server version	10.5.27-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `atelier_chefs`
--

DROP TABLE IF EXISTS `atelier_chefs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `atelier_chefs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `atelier_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_atelier` (`user_id`),
  UNIQUE KEY `unique_atelier_user` (`atelier_id`,`user_id`),
  KEY `idx_atelier_id` (`atelier_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `atelier_chefs_ibfk_1` FOREIGN KEY (`atelier_id`) REFERENCES `ateliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `atelier_chefs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atelier_chefs`
--

LOCK TABLES `atelier_chefs` WRITE;
/*!40000 ALTER TABLE `atelier_chefs` DISABLE KEYS */;
INSERT INTO `atelier_chefs` VALUES (16,9,29,'2025-08-13 09:00:22','2025-08-13 09:00:22'),(19,8,28,'2025-08-13 09:01:23','2025-08-13 09:01:23'),(26,7,27,'2025-08-13 14:30:03','2025-08-13 14:30:03'),(29,24,41,'2025-08-14 08:10:07','2025-08-14 08:10:07'),(30,25,42,'2025-08-14 08:19:16','2025-08-14 08:19:16'),(31,26,43,'2025-08-14 08:21:10','2025-08-14 08:21:10'),(32,27,44,'2025-08-14 08:58:22','2025-08-14 08:58:22'),(33,28,45,'2025-08-14 08:59:14','2025-08-14 08:59:14'),(34,29,46,'2025-08-14 09:29:16','2025-08-14 09:29:16'),(35,23,40,'2025-08-14 13:57:06','2025-08-14 13:57:06'),(36,23,47,'2025-08-14 13:57:06','2025-08-14 13:57:06'),(37,10,30,'2025-08-14 13:58:55','2025-08-14 13:58:55'),(38,10,48,'2025-08-14 13:58:55','2025-08-14 13:58:55'),(42,19,39,'2025-08-27 09:30:06','2025-08-27 09:30:06'),(45,6,37,'2025-08-27 09:34:10','2025-08-27 09:34:10');
/*!40000 ALTER TABLE `atelier_chefs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ateliers`
--

DROP TABLE IF EXISTS `ateliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ateliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `localisation` varchar(255) DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ateliers`
--

LOCK TABLES `ateliers` WRITE;
/*!40000 ALTER TABLE `ateliers` DISABLE KEYS */;
INSERT INTO `ateliers` VALUES (6,'MPC','Atelier MPC','Localisation à définir','Responsable à définir','2025-08-12 12:28:28'),(7,'EOLE','Atelier EOLE','Localisation à définir','Responsable à définir','2025-08-12 12:28:28'),(8,'VEG','Atelier VEG','Localisation à définir','Responsable à définir','2025-08-12 12:28:28'),(9,'IND BTES','Atelier IND BTES','Localisation à définir','Responsable à définir','2025-08-12 12:28:28'),(10,'QUALITE','Atelier QUALITE','Localisation à définir','Responsable à définir','2025-08-12 12:28:28'),(19,'ACC',NULL,NULL,NULL,'2025-08-14 07:18:13'),(23,'EXPEDITIONS','','','','2025-08-14 08:00:55'),(24,'TECHNIQUE','','','','2025-08-14 08:09:19'),(25,'INFIRMERIE','','','','2025-08-14 08:17:41'),(26,'ELECTRIQUE','','','','2025-08-14 08:20:43'),(27,'ANAPEC','','','','2025-08-14 08:28:23'),(28,'SANS_ATELIER',NULL,NULL,NULL,'2025-08-14 08:55:53'),(29,'INTERIMAIRE',NULL,NULL,NULL,'2025-08-14 09:28:21');
/*!40000 ALTER TABLE `ateliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `buses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `modele` varchar(100) DEFAULT NULL,
  `capacite` int(11) DEFAULT NULL,
  `status` enum('disponible','en_service','maintenance') DEFAULT 'disponible',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `circuits`
--

DROP TABLE IF EXISTS `circuits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `circuits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `distance` decimal(10,2) DEFAULT NULL,
  `duree_estimee` int(11) DEFAULT NULL,
  `status` enum('actif','inactif') DEFAULT 'actif',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `circuits`
--

LOCK TABLES `circuits` WRITE;
/*!40000 ALTER TABLE `circuits` DISABLE KEYS */;
INSERT INTO `circuits` VALUES (1,'AZHAR','Circuit desservant la zone AZHAR et ses environs','2025-08-03 17:26:18',NULL,NULL,'actif'),(2,'SIDI MOUMEN','Circuit desservant SIDI MOUMEN et quartiers adjacents','2025-08-03 17:26:18',NULL,NULL,'actif'),(3,'HAY MOHAMMEDI','Circuit HAY MOHAMMEDI - zone industrielle et résidentielle','2025-08-03 17:26:18',NULL,NULL,'actif'),(4,'MOHAMMEDIA','Circuit MOHAMMEDIA - liaison ville de Mohammedia','2025-08-03 17:26:18',NULL,NULL,'actif'),(5,'SIDI OTHMANE','Circuit SIDI OTHMANE - quartiers sud de Casablanca','2025-08-03 17:26:18',NULL,NULL,'actif'),(6,'HAY MOLAY RCHID','Circuit HAY MOULAY RACHID - zone est de Casablanca','2025-08-03 17:26:18',NULL,NULL,'actif'),(7,'RAHMA','Circuit RAHMA - quartiers résidentiels','2025-08-03 17:26:18',NULL,NULL,'actif'),(8,'DERB SULTAN','Circuit DERB SULTAN - centre ville historique','2025-08-03 17:26:18',NULL,NULL,'actif'),(9,'ANASSI','Circuit ANASSI - zone périphérique nord','2025-08-03 17:26:18',NULL,NULL,'actif');
/*!40000 ALTER TABLE `circuits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `equipe` varchar(50) DEFAULT NULL,
  `atelier` varchar(100) DEFAULT NULL,
  `type_contrat` varchar(50) DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `point_ramassage` text DEFAULT NULL,
  `circuit_affecte` text DEFAULT NULL,
  `atelier_chef_id` int(11) DEFAULT NULL,
  `atelier_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_employees_chef` (`atelier_chef_id`),
  KEY `idx_atelier_id` (`atelier_id`),
  CONSTRAINT `fk_employees_atelier` FOREIGN KEY (`atelier_id`) REFERENCES `ateliers` (`id`),
  CONSTRAINT `fk_employees_chef` FOREIGN KEY (`atelier_chef_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=287 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (126,'DENNI','AZIZ',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY ELBARAKA RUE JOUDART','HAY MOLAY RCHID',27,6,'2025-08-03 17:22:07'),(127,'EL BAKRI','REDOUANE',NULL,NULL,'SOIR','MPC','CDI',NULL,'FARAH EL SALLAM','RAHMA',30,6,'2025-08-03 17:22:07'),(128,'FADEL','Imad',NULL,NULL,'MATIN','MPC','CDI',NULL,'DAR BOUAAZA ESPACE AL MOHIT 1 ESSAADA','RAHMA',27,6,'2025-08-03 17:22:07'),(129,'JAMILI','MOHAMED',NULL,NULL,'SOIR','MPC','CDI',NULL,'FARAH EL SALLAM','RAHMA',30,6,'2025-08-03 17:22:07'),(130,'SOFIANE','MOURAD',NULL,NULL,'SOIR','MPC','CDI',NULL,'SIDI MOUMEN NOUR CITY 3','SIDI MOUMEN',27,6,'2025-08-03 17:22:07'),(131,'WAKRIM','MOHAMED',NULL,NULL,'MATIN','MPC','CDI',NULL,'CARNAUD COUPE','AZHAR',29,6,'2025-08-03 17:22:07'),(132,'KARNBAH','MOHAMED',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY MOHAMMEDY GRAND CEINTURE CAFE 7 3OYOUN','HAY MOHAMMEDI',27,6,'2025-08-03 17:22:07'),(133,'MOUDAKIR','SMAIN',NULL,NULL,'MATIN','MPC','CDI',NULL,'ROCHE NOIR','HAY MOHAMMEDI',37,6,'2025-08-03 17:22:07'),(134,'FEROUAL','ABDELALI',NULL,NULL,'MATIN','MPC','CDI',NULL,'PANORAMIQUE CAFE EL ANDALOUS','DERB SULTAN',37,6,'2025-08-03 17:22:07'),(135,'AZLAG','HASSAN',NULL,NULL,'MATIN','MPC','CDI',NULL,'AZHAR CAFE ELABDI','AZHAR',29,6,'2025-08-03 17:22:07'),(136,'NASSOUR','ABDELILAH',NULL,NULL,'MATIN','MPC','CDI',NULL,'JAWHARA SIDI MOUMEN PH ALAA','SIDI MOUMEN',30,6,'2025-08-03 17:22:07'),(137,'TABARANE','YOUNES',NULL,NULL,'MATIN','MPC','CDI',NULL,'SALMIA 2 RUE 14 IMM 10/POSTE SALMIA','HAY MOLAY RCHID',29,6,'2025-08-03 17:22:07'),(138,'OUAJHI','YOUNESS',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOSQUE QODS','ANASSI',29,6,'2025-08-03 17:22:07'),(139,'ELHANSALI','ABDERRAZAK',NULL,NULL,'SOIR','IND BTES',NULL,NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',28,9,'2025-08-03 17:22:07'),(140,'LABNI','MUSTAPHA',NULL,NULL,'SOIR','MPC','CDI',NULL,'CAFE FEM LEHCEN','HAY MOHAMMEDI',30,6,'2025-08-03 17:22:07'),(141,'IJABA','MOUNA',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY ELFALAH CINEMA FALAH','HAY MOLAY RCHID',29,6,'2025-08-03 17:22:07'),(142,'OUAHID','ADIL',NULL,NULL,'MATIN','MPC','CDI',NULL,'AZHAR PHARMACIE SAKANI','AZHAR',30,6,'2025-08-03 17:22:07'),(143,'SAIS','BRAHIM',NULL,NULL,'MATIN','MPC','CDI',NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',27,6,'2025-08-03 17:22:07'),(144,'ENNAJOUI','CHAKIR',NULL,NULL,'MATIN','MPC','CDI',NULL,'FARAH EL SALLAM','RAHMA',29,6,'2025-08-03 17:22:07'),(145,'KTRI','Abdelkarim',NULL,NULL,'MATIN','MPC','CDI',NULL,'ERRAHMA, ECOLE OTHMANE IBN AFFAN','RAHMA',29,6,'2025-08-03 17:22:07'),(146,'ADDAHR','AYOUB',NULL,NULL,'SOIR','EOLE','CDI',NULL,'HAY MOHAMMEDY BQ BMCE STATION TOTAL','HAY MOHAMMEDI',37,7,'2025-08-03 17:22:07'),(147,'EZZINE','ABDELALI',NULL,NULL,'SOIR','EOLE','CDI',NULL,'SIDI MOUMEN LOTS HOUDA','SIDI MOUMEN',27,7,'2025-08-03 17:22:07'),(148,'MAAGLI','SAID',NULL,NULL,'SOIR','EOLE','CDI',NULL,'SIDI OTHMANE CAFE ARSENAL','SIDI OTHMANE',27,7,'2025-08-03 17:22:07'),(149,'JAWAD','ABDERRAHIM',NULL,NULL,'MATIN','EOLE','CDI',NULL,'COMMUNE LISASFA ROUTE ELJADIDA','RAHMA',27,7,'2025-08-03 17:22:07'),(150,'TALEB','Rachid',NULL,NULL,'MATIN','EOLE','CDI',NULL,'CAFE SEVILLE BOURNAZIL','SIDI OTHMANE',27,7,'2025-08-03 17:22:07'),(151,'NADI','TARIK',NULL,NULL,'SOIR','EOLE','CDI',NULL,'AZHAR ECOLE ATLANTIC','AZHAR',27,7,'2025-08-03 17:22:07'),(152,'FELLAKI','ABDELKARIM',NULL,NULL,'MATIN','EOLE','CDI',NULL,'RIAD SIDI MOUMEN GROUPE 4','ANASSI',27,7,'2025-08-03 17:22:07'),(153,'SANID','TAOUFIK',NULL,NULL,'Normal','EOLE','CDI',NULL,'HAY MOHAMMEDY /TAKADOUM DAR DARIBA','HAY MOHAMMEDI',27,7,'2025-08-03 17:22:07'),(154,'BACHRI','HICHAM',NULL,NULL,'MATIN','EOLE','CDI',NULL,'BD BOUZIANE PH IKBAL','HAY MOLAY RCHID',27,7,'2025-08-03 17:22:07'),(155,'FARID','MOHAMMED',NULL,NULL,'SOIR','EOLE','CDI',NULL,'OULFA PH EL WOROUD','RAHMA',27,7,'2025-08-03 17:22:07'),(156,'BENNANNA','DRISS',NULL,NULL,'MATIN','EOLE','CDI',NULL,'SEBATA CAFE EL WAZIR','SIDI OTHMANE',27,7,'2025-08-03 17:22:07'),(157,'AOUZANE','Hamid',NULL,NULL,'SOIR','EOLE','CDI',NULL,'SOCICA STATION TOTAL','HAY MOHAMMEDI',30,7,'2025-08-03 17:22:07'),(158,'MAOUHOUB','JIHANE',NULL,NULL,'Normal','EOLE','CDI',NULL,'EL AZHAR','AZHAR',27,7,'2025-08-03 17:22:07'),(159,'HABACHI','SOUFIANE',NULL,NULL,'Normal','EOLE','CDI',NULL,'SIDI MOUMEN CHARAF','SIDI MOUMEN',27,7,'2025-08-03 17:22:07'),(160,'MOUKHTAM','NABIL',NULL,NULL,'Normal','EOLE','CDI',NULL,'AIN CHIFA 1 RUE 55 N° 119 CASA','DERB SULTAN',27,7,'2025-08-03 17:22:07'),(161,'LKIHAL','MEHDI',NULL,NULL,'Normal','SANA_ATELIER','CDI',NULL,'BERNOUSSI HAY QODSS','AZHAR',27,28,'2025-08-03 17:22:07'),(162,'JARNIJA','ABDLAH',NULL,NULL,'Normal','ACC','CDI',NULL,'hay lala meriem foryane','SIDI OTHMANE',27,19,'2025-08-03 17:22:07'),(163,'KASSI','AHMED',NULL,NULL,'Normal','ELECTRIQUE','CDI',NULL,'MOSQUE ADARISSA (SIDI MAAROUF)','DERB SULTAN',27,26,'2025-08-03 17:22:07'),(164,'SAIS','TARIK',NULL,NULL,'MATIN','ANAPEC','CDI',NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',27,27,'2025-08-03 17:22:07'),(165,'AYADI','MOSTAFA',NULL,NULL,'SOIR','EXPEDITIONS','CDI',NULL,'READ WALFA terminus bus 20','RAHMA',27,23,'2025-08-03 17:22:07'),(166,'FADEL','ABDELLATIF',NULL,NULL,'MATIN','VEG','CDI',NULL,'BOULEVARD DE LA CROIX PH CASABLANCA','DERB SULTAN',28,8,'2025-08-03 17:22:07'),(167,'FADEL','SAMI',NULL,NULL,'SOIR','VEG','CDI',NULL,'AZHAR SAKANI ECOLE EL KHANSAE','AZHAR',28,8,'2025-08-03 17:22:07'),(168,'BOUABID','JAWAD',NULL,NULL,'MATIN','VEG','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(169,'SAHRANI','MOHAMED',NULL,NULL,'SOIR','VEG','CDI',NULL,'SIDI MOUMEN 3OTOUR','SIDI MOUMEN',28,8,'2025-08-03 17:22:07'),(170,'KARBAL','BOUCHAIB',NULL,NULL,'MATIN','VEG','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(171,'BELYAKOUT','AZIZ',NULL,NULL,'MATIN','VEG','CDI',NULL,'COMMUNE LISASFA ROUTE ELJADIDA','RAHMA',28,8,'2025-08-03 17:22:07'),(172,'HOUAFI','AHMED',NULL,NULL,'SOIR','VEG','CDI',NULL,'ROUTE MOHAMMEDIA DIYAR ELMANSOUR','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(173,'SOULMANI','RACHID',NULL,NULL,'Normal','VEG',NULL,NULL,'SIDI MOUMEN NOUR CITY 2','SIDI MOUMEN',28,8,'2025-08-03 17:22:07'),(174,'FATHY','MEHDI',NULL,NULL,'Normal','VEG','CDI',NULL,'AIN HAROUDA','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(175,'SOUALI','KHALISA',NULL,NULL,'Normal','VEG','CDI',NULL,'SEBATA BD','SIDI OTHMANE',28,8,'2025-08-03 17:22:07'),(176,'BOUKHAMI','Abdessamad',NULL,NULL,'Normal','VEG','CDI',NULL,'BD MAGHRIB ARABI AZHAR','AZHAR',28,8,'2025-08-03 17:22:07'),(177,'RTAIMAT','HAMZA',NULL,NULL,'Normal','VEG',NULL,NULL,'GRAND SEINTURE SBAA AYOUN','HAY MOHAMMEDI',28,8,'2025-08-03 17:22:07'),(178,'BAYI','HICHAM',NULL,NULL,'Normal','VEG','CDI',NULL,'HAY QOUDS BERNOUSSI','AZHAR',28,8,'2025-08-03 17:22:07'),(179,'NASSIR','Abdelali',NULL,NULL,'Normal','VEG','CDI',NULL,'AL AZHAR 1 TR IMMOY APPT 47','AZHAR',28,8,'2025-08-03 17:22:07'),(180,'BIYANI','AHEMAD',NULL,NULL,'Normal','VEG','CDI',NULL,'AL HAOUZIA) /Tel :0630131606','SIDI OTHMANE',28,8,'2025-08-03 17:22:07'),(181,'ESSAIDI','MOHAMED',NULL,NULL,'MATIN','TECHNIQUE','CDI',NULL,'BOURNAZIL BMCI','SIDI OTHMANE',28,24,'2025-08-03 17:22:07'),(182,'NABBAR','ABID',NULL,NULL,'SOIR','ELECTRIQUE','CDI',NULL,'CAFE 8 RES 8 HAY LALLA MERYEM','HAY MOLAY RCHID',28,26,'2025-08-03 17:22:07'),(183,'YASSINE','ABDLHADI',NULL,NULL,'Normal','ACC','CDI',NULL,'BOULEVARD HASSAN AL ALAOUI (SOCIETE TOOL BOIS)','SIDI OTHMANE',28,19,'2025-08-03 17:22:07'),(184,'OUMALELK','MOUAD',NULL,NULL,'Normal','SANA_ATELIER','CDI',NULL,'AIN HARROUDA MOHAMMEDIA','MOHAMMEDIA',28,28,'2025-08-03 17:22:07'),(185,'AZOUZI','AHMED',NULL,NULL,'MATIN','IND BTES','CDI',NULL,'POSTE HAY MOHAMMEDY','HAY MOHAMMEDI',29,9,'2025-08-03 17:22:07'),(186,'KOBBI','AHMED',NULL,NULL,'MATIN','IND BTES','CDI',NULL,'SIDI MOUMEN 3OTOUR','SIDI MOUMEN',29,9,'2025-08-03 17:22:07'),(187,'ERRADI','ABDELWAHED',NULL,NULL,'SOIR','IND BTES','CDI',NULL,'ANASSI SOUK NAMODAJI','ANASSI',29,9,'2025-08-03 17:22:07'),(188,'ESSOLAMI','HASSAN',NULL,NULL,'SOIR','IND BTES','CDI',NULL,'DERB SULTAN BD MOHAMMED 6 RESIDENCE EL NASR','DERB SULTAN',29,9,'2025-08-03 17:22:07'),(189,'MARBOUH','MUSTAPHA',NULL,NULL,'SOIR','ACC','CDI',NULL,'HAY LALA MERYEM ECOLE QODS','HAY MOLAY RCHID',39,19,'2025-08-03 17:22:07'),(190,'KAITER','RACHID',NULL,NULL,'MATIN','IND BTES','CDI',NULL,'BD MOULAY DRISS (2MARS)','DERB SULTAN',29,9,'2025-08-03 17:22:07'),(191,'ERREJIOUI','SAID',NULL,NULL,'Normal','IND BTES','CDI',NULL,'AZHAR RESIDENCE EL NASR','AZHAR',29,9,'2025-08-03 17:22:07'),(192,'LMERS','ACHERAF',NULL,NULL,'Normal','IND BTES',NULL,NULL,'BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(193,'HATOULI','OMAR',NULL,NULL,'Normal','IND BTES','CDI',NULL,'SIDI MOUMEN','SIDI MOUMEN',29,9,'2025-08-03 17:22:07'),(194,'LAABID','KABIRA',NULL,NULL,'Normal','IND BTES','CDI',NULL,'HAY MOHMADI','HAY MOHAMMEDI',29,9,'2025-08-03 17:22:07'),(195,'HAMZA','OULHADR',NULL,NULL,'Normal','IND BTES','CDI',NULL,'ROCHE NOIR BV MOLAY SMAIL','HAY MOHAMMEDI',29,9,'2025-08-03 17:22:07'),(196,'AIT IDAR','RACHID',NULL,NULL,'Normal','IND BTES','CDI',NULL,'RES MADINATI TR 10 IMM 05 NR 34 BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(197,'KHAMLICHI','AHEMAD',NULL,NULL,'Normal','IND BTES','CDI',NULL,'HAY L HABITAT BL 28 N 5 MOHMMADIA','MOHAMMEDIA',29,9,'2025-08-03 17:22:07'),(198,'ADLANI','MOHAMED',NULL,NULL,'Normal','IND BTES','CDI',NULL,'SIDI BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(199,'EZZOUBIR','Akram',NULL,NULL,'Normal','IND BTES',NULL,NULL,'BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(200,'LAHRICHI','HAMZA',NULL,NULL,'SOIR','IND BTES','CDI',NULL,'ELHIYANI HAY FALLAH','HAY MOLAY RCHID',29,9,'2025-08-03 17:22:07'),(201,'MOUHAL','SOUAD',NULL,NULL,'Normal','IND BTES','CDI',NULL,'SIDI MOUMEN SIDI BERNOUSSI','SIDI MOUMEN',29,9,'2025-08-03 17:22:07'),(202,'HADDOU','Fatima Zahra',NULL,NULL,'SOIR','INFIRMERIE','CDI',NULL,'HAY MOHAMMEDY HALAWIYAT ERRABI3','HAY MOHAMMEDI',29,25,'2025-08-03 17:22:07'),(203,'ANWAR','AZIZ',NULL,NULL,'MATIN','ELECTRIQUE','CDI',NULL,'TRAVAUX PUBLIC AL QODS SALLE DE FETE','AZHAR',29,26,'2025-08-03 17:22:07'),(204,'ERRADOUANI','KARIMA',NULL,NULL,'MATIN','ACC','CDI',NULL,'HAY MOHAMADI','HAY MOHAMMEDI',29,19,'2025-08-03 17:22:07'),(205,'MORABIT','SALAHDINE',NULL,NULL,'Normal','SANA_ATELIER','CDI',NULL,'HAY MASSIRA 2 MOULAY RACHID','HAY MOLAY RCHID',29,28,'2025-08-03 17:22:07'),(206,'RJAFALLAH','LARBI',NULL,NULL,'MATIN','QUALITE','CDI',NULL,'AIN CHOCK BD DAKHLA MOSQUE OUHOUD','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(207,'EL AZAR','ABDELJALIL',NULL,NULL,'MATIN','QUALITE',NULL,NULL,'HAY MOULAY RACHID PH IKBAK BD BOUZIANE','HAY MOLAY RCHID',30,10,'2025-08-03 17:22:07'),(208,'FAIZ','SAID',NULL,NULL,'SOIR','QUALITE',NULL,NULL,'OULFA 35','RAHMA',30,10,'2025-08-03 17:22:07'),(209,'SABIR','NOUREDDINE',NULL,NULL,'SOIR','QUALITE','CDI',NULL,'STATION PETRONIM BD SAKIA ELHAMRA','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(210,'ERRAJI','ELMEHDI',NULL,NULL,'MATIN','QUALITE',NULL,NULL,'STATION TOTAL BD DRISS ELHARTI','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(211,'MISSAOUI','ABDELMAJID',NULL,NULL,'SOIR','QUALITE',NULL,NULL,'SEBATA RUE ABDELKADER SAHRAOUI','HAY MOLAY RCHID',30,10,'2025-08-03 17:22:07'),(212,'FETHERRAHIM','BADR',NULL,NULL,'SOIR','QUALITE','CDI',NULL,'SEBATA CINEMA MADANIA','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(213,'ORANGE','MOHAMMED',NULL,NULL,'SOIR','QUALITE',NULL,NULL,'ANASSI BV ZEFZAF','ANASSI',30,10,'2025-08-03 17:22:07'),(214,'ZITOUNI','TALALI',NULL,NULL,'Normal','QUALITE','CDI',NULL,'OULFA','RAHMA',30,10,'2025-08-03 17:22:07'),(215,'ELMAABADY','MOHAMED',NULL,NULL,'Normal','QUALITE','CDI',NULL,'JAWHARA FARMACI AL ALAA','SIDI MOUMEN',30,10,'2025-08-03 17:22:07'),(216,'TIJAHI','ASMAA',NULL,NULL,'MATIN','INFIRMERIE','CDI',NULL,'BD BAGHDAD QODS','AZHAR',30,25,'2025-08-03 17:22:07'),(217,'SAADOUNI','SAID',NULL,NULL,'SOIR','ELECTRIQUE','CDI',NULL,'BOURNAZIL BV 9OWAT ALMOSA3IDA CAFE ZAYTOUNA','SIDI OTHMANE',30,26,'2025-08-03 17:22:07'),(218,'MAHMAH','AYOUB',NULL,NULL,'SOIR','ANAPEC','CDI',NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',30,27,'2025-08-03 17:22:07'),(219,'LAHMIDI','ABDELHAMID',NULL,NULL,'MATIN','ACC','CDI',NULL,'ABIR SIDI MOUMEN','SIDI MOUMEN',30,19,'2025-08-03 17:22:07'),(221,'AMIZ','REDOUANE',NULL,NULL,'MATIN','ACC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',29,19,'2025-08-03 17:22:07'),(222,'HAILI','MOHAMED',NULL,NULL,'MATIN','ACC','CDI',NULL,'HAY MOHAMMEDI CAFE 7 AAYOUN','HAY MOHAMMEDI',27,19,'2025-08-03 17:22:07'),(223,'HIRMANE','FOUAD',NULL,NULL,'MATIN','ACC','CDI',NULL,'AZHAR PANORAMA','AZHAR',28,19,'2025-08-03 17:22:07'),(224,'BAHROUNE','MOHAMED',NULL,NULL,'MATIN','ACC','CDI',NULL,'AZHAR ECOLE ATLANTIC','AZHAR',29,19,'2025-08-03 17:22:07'),(225,'MASSAKI','ABDESSAMAD',NULL,NULL,'Normal','ACC','CDI',NULL,'MABROUKA SIDI OTHMANE','SIDI OTHMANE',30,19,'2025-08-03 17:22:07'),(226,'JMOUHI','MOHAMED',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'DERB SULTAN BD BOUCHAIB DOUKALI PH EL NASER','DERB SULTAN',27,23,'2025-08-03 17:22:07'),(227,'GHOUFRAOUI','MUSTAPHA',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',27,23,'2025-08-03 17:22:07'),(229,'SOUBAIR','HANANE',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'AIN SEBAA','HAY MOHAMMEDI',29,23,'2025-08-03 17:22:07'),(230,'NABIL','MOHAMED',NULL,NULL,'Normal','EXPEDITIONS','CDI',NULL,'SIDI MOUMEN','SIDI MOUMEN',30,23,'2025-08-03 17:22:07'),(231,'CHAFIQ','SAFAA',NULL,NULL,'Normal','EXPEDITIONS','CDI',NULL,'HAY MOHAMMADI AIN SBAA','HAY MOHAMMEDI',27,23,'2025-08-03 17:22:07'),(232,'CHAMITI','Salah Eddine',NULL,NULL,'SOIR','ACC','CDI',NULL,'HAY MOUHEMADI','HAY MOHAMMEDI',27,19,'2025-08-03 17:22:07'),(233,'BOUKADOM','MOHAMED',NULL,NULL,'MATIN','ACC','CDI',NULL,'SIDI MOUMANE','SIDI MOUMEN',28,19,'2025-08-03 17:22:07'),(235,'HABACHI','MOHAMED',NULL,NULL,'Normal','MPC','CDI',NULL,'SIDI MOUMEN','SIDI MOUMEN',30,6,'2025-08-03 17:22:07'),(236,'BELHACHEMI','OTHMANE',NULL,NULL,'Normal','ANAPEC','CDI',NULL,'ROCHE NOIR BV MOLAY SMAIL','HAY MOHAMMEDI',27,27,'2025-08-03 17:22:07'),(237,'DARWICH','SAID',NULL,NULL,'MATIN','MPC','CDI',NULL,'HAY ELMASSIRA','HAY MOLAY RCHID',27,6,'2025-08-03 17:22:07'),(238,'SKOURI','ABDELAZIZ',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY ELMASSIRA 1 FACULTE DES LETTRES','HAY MOLAY RCHID',28,6,'2025-08-03 17:22:07'),(239,'AITBRAHIM','SAID',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',29,6,'2025-08-03 17:22:07'),(240,'SOUAT','MALIKA',NULL,NULL,'MATIN','MPC','CDI',NULL,'A COTE DU CINEMA ENNAJAH MOHMMEDIA','MOHAMMEDIA',30,6,'2025-08-03 17:22:07'),(241,'BROGI','MINA',NULL,NULL,'MATIN','MPC','CDI',NULL,'RUE PALESTINE A COTE BANQUE POPULAIRE MOHAMMEDIA','MOHAMMEDIA',29,6,'2025-08-03 17:22:07'),(242,'MARHRAOUI','SAADIA',NULL,NULL,'MATIN','MPC','CDI',NULL,'BD MOHAMED 6 ACOTE DE CAFE OULADE HAMASSE MOHAMMEDI','MOHAMMEDIA',27,6,'2025-08-03 17:22:07'),(243,'ARICHI','SOUAD',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,6,'2025-08-03 17:22:07'),(244,'HOSNI','KHADIJA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',29,6,'2025-08-03 17:22:07'),(245,'RAFYA','SAADIA',NULL,NULL,'MATIN','MPC','CDI',NULL,'TERMINUS BUS 33 SOUK ENNAMOUDAJA ANASSI','ANASSI',30,6,'2025-08-03 17:22:07'),(246,'HMIMSY','FATIMA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,6,'2025-08-03 17:22:07'),(247,'HABIBI','MINA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',27,6,'2025-08-03 17:22:07'),(248,'HASSI','NAIMA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,6,'2025-08-03 17:22:07'),(255,'ABDELKAML','YOUSSEF',NULL,NULL,'MATIN','MPC','CDI',NULL,'DOUAR BIA RUE 14 N°2',NULL,37,6,'2025-08-13 14:37:39'),(257,'ALSAFI ','KAMAL',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'BD ZERKTOUNI ROND POINT D\'EUROPE','DERB SULTAN',40,23,'2025-08-14 08:08:16'),(258,'Dahr','Khalid',NULL,NULL,'Normal','ACC','CDI',NULL,'ANASSI','ANASSI',39,19,'2025-08-14 08:51:54'),(260,'TEST','RH Employee',NULL,NULL,'MATIN','MPC','CDI',NULL,'Test Point','Test Circuit',NULL,6,'2025-08-18 09:25:55'),(262,'TEST','INTERIM',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test','Circuit Test',NULL,29,'2025-08-18 15:14:04'),(263,'TEST','INTERIM',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test','Circuit Test',NULL,29,'2025-08-18 15:14:37'),(264,'TEST','INTERIM',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test','Circuit Test',NULL,29,'2025-08-18 15:15:19'),(265,'TEST','INTERIM',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test','Circuit Test',NULL,29,'2025-08-18 15:15:47'),(266,'TEST','INTERIM',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test','Circuit Test',NULL,29,'2025-08-18 15:16:03'),(269,'TEST','LOAN',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test Loan','Circuit Test Loan',NULL,29,'2025-08-18 15:42:59'),(270,'TEST','LOAN',NULL,NULL,'MATIN','INTERIMAIRE','Intérimaire','2024-01-01','Point Test Loan','Circuit Test Loan',NULL,29,'2025-08-18 15:44:13'),(275,'TEST','NEWNAME',NULL,NULL,'MATIN',NULL,'Intérimaire','2024-01-01','Point Test New Name','Circuit Test New Name',NULL,NULL,'2025-08-25 08:09:01'),(276,'TEST','NEWNAME',NULL,NULL,'MATIN',NULL,'Intérimaire','2024-01-01','Point Test New Name','Circuit Test New Name',NULL,NULL,'2025-08-25 08:09:27');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interim_loans`
--

DROP TABLE IF EXISTS `interim_loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interim_loans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `from_atelier_id` int(11) NOT NULL,
  `to_atelier_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `from_atelier_id` (`from_atelier_id`),
  KEY `to_atelier_id` (`to_atelier_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  CONSTRAINT `interim_loans_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interim_loans_ibfk_2` FOREIGN KEY (`from_atelier_id`) REFERENCES `ateliers` (`id`),
  CONSTRAINT `interim_loans_ibfk_3` FOREIGN KEY (`to_atelier_id`) REFERENCES `ateliers` (`id`),
  CONSTRAINT `interim_loans_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interim_loans`
--

LOCK TABLES `interim_loans` WRITE;
/*!40000 ALTER TABLE `interim_loans` DISABLE KEYS */;
INSERT INTO `interim_loans` VALUES (3,262,29,10,'2024-08-19','2025-08-25','Test d\'authentification','completed',3,'2025-08-25 07:52:11','2025-08-25 11:44:09'),(10,270,29,24,'2025-08-29','2025-08-27','dd','completed',3,'2025-08-25 13:21:38','2025-08-27 07:42:39');
/*!40000 ALTER TABLE `interim_loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `filename` (`filename`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'001_create_atelier_chefs_table.sql','2025-08-12 12:26:22'),(2,'002_add_atelier_id_to_employees.sql','2025-08-12 12:28:28'),(3,'003_remove_atelier_id_from_users.sql','2025-08-12 12:29:38'),(4,'004_fix_circuits_table.sql','2025-08-12 12:30:10'),(5,'005_migrate_existing_data.sql','2025-08-12 12:31:17'),(6,'006_add_day_assignments_to_weekly_plannings.sql','2025-08-27 10:07:35');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plannings`
--

DROP TABLE IF EXISTS `plannings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plannings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `point_ramassage` varchar(255) DEFAULT NULL,
  `circuit` varchar(255) DEFAULT NULL,
  `equipe` varchar(50) DEFAULT NULL,
  `atelier` varchar(100) DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin` time DEFAULT NULL,
  `status` enum('actif','inactif','archive') DEFAULT 'actif',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_plannings_user` (`created_by`),
  CONSTRAINT `fk_plannings_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plannings`
--

LOCK TABLES `plannings` WRITE;
/*!40000 ALTER TABLE `plannings` DISABLE KEYS */;
/*!40000 ALTER TABLE `plannings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Transport','admin@transport.ma','admin123','administrateur','2025-08-02 22:33:17'),(3,'RH Manager','rh@transport.ma','rh1234','rh','2025-08-02 19:26:29'),(27,'AIT BENTAAZA OMAR','chef.eole@transport.ma','chef123','chef_d_atelier','2025-08-03 17:22:07'),(28,'OUADIF KACEM','chef.veg@transport.ma','chef123','chef_d_atelier','2025-08-03 17:22:07'),(29,'FOUAJ','chef.indbtes@transport.ma','chef123','chef_d_atelier','2025-08-03 17:22:07'),(30,'EL HASSI OMAR','chef.qualite@transport.ma','chef123','chef_d_atelier','2025-08-03 17:22:07'),(37,'FARIH','chef.mpc1@transport.ma','chef123','chef_d_atelier','2025-08-12 14:34:07'),(39,'FALLAHI','chef.acc@transport.ma','chef123','chef_d_atelier','2025-08-14 07:19:26'),(40,'MAZOUAR','chef.expeditions@transport.ma','chef123','chef_d_atelier','2025-08-14 08:01:50'),(41,'EL-BETTAH','chef.technique@transport.ma','chef123','chef_d_atelier','2025-08-14 08:09:56'),(42,'Ouakrim 3 ','chef.infirmerie@transport.ma','chef123','chef_d_atelier','2025-08-14 08:19:00'),(43,'ZETA','chef.electrique@transport.ma','chef123','chef_d_atelier','2025-08-14 08:21:05'),(44,'Ouakrim 3 ','chef.anapec@transport.ma','chef123','chef_d_atelier','2025-08-14 08:28:54'),(45,'Ouakrim 5 ','chef.sansatelier@transport.ma','chef123','chef_d_atelier','2025-08-14 08:56:30'),(46,'OUAKRIM 6 ','chef.interimqualite@transport.ma','chef123','chef_d_atelier','2025-08-14 09:28:56'),(47,'BOUZARDA','chef.expeditions2@transport.ma','chef123','chef_d_atelier','2025-08-14 13:56:51'),(48,'OUALOUSSI','chef.qualite2@transport.ma','chef123','chef_d_atelier','2025-08-14 13:58:42'),(49,'youssef Dirgham','chefaaa@email.com','youssef','chef_d_atelier','2025-08-27 07:54:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_assignments`
--

DROP TABLE IF EXISTS `weekly_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weekly_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `weekly_planning_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `team` enum('Matin','Soir','Nuit','Normal') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_week` (`weekly_planning_id`,`employee_id`),
  KEY `employee_id` (`employee_id`),
  KEY `idx_weekly_assignments_team` (`team`),
  CONSTRAINT `weekly_assignments_ibfk_1` FOREIGN KEY (`weekly_planning_id`) REFERENCES `weekly_plannings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `weekly_assignments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_assignments`
--

LOCK TABLES `weekly_assignments` WRITE;
/*!40000 ALTER TABLE `weekly_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `weekly_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `weekly_planning_status`
--

DROP TABLE IF EXISTS `weekly_planning_status`;
/*!50001 DROP VIEW IF EXISTS `weekly_planning_status`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `weekly_planning_status` AS SELECT
 1 AS `year`,
  1 AS `week_number`,
  1 AS `total_plannings`,
  1 AS `completed_plannings`,
  1 AS `consolidated_plannings`,
  1 AS `chef_ids`,
  1 AS `last_updated` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `weekly_plannings`
--

DROP TABLE IF EXISTS `weekly_plannings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weekly_plannings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year` year(4) NOT NULL,
  `week_number` tinyint(4) NOT NULL,
  `teams` text DEFAULT NULL,
  `assignments` text DEFAULT NULL,
  `day_assignments` text DEFAULT NULL,
  `status` enum('draft','completed','consolidated') DEFAULT 'draft',
  `is_consolidated` tinyint(1) DEFAULT 0,
  `consolidated_from` text DEFAULT NULL,
  `consolidated_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_planning` (`year`,`week_number`,`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_weekly_plannings_year` (`year`),
  KEY `fk_weekly_plannings_user` (`created_by`),
  KEY `idx_status_year_week` (`status`,`year`,`week_number`),
  KEY `idx_consolidated` (`is_consolidated`,`year`,`week_number`),
  CONSTRAINT `fk_weekly_plannings_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `weekly_plannings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `weekly_plannings_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_plannings`
--

LOCK TABLES `weekly_plannings` WRITE;
/*!40000 ALTER TABLE `weekly_plannings` DISABLE KEYS */;
INSERT INTO `weekly_plannings` VALUES (234,2025,35,'[\"Matin\",\"Soir\"]','{\"Matin\":[198,196],\"Soir\":[185]}','{\"Lundi\":{\"Matin\":[198],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Mardi\":{\"Matin\":[196],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Mercredi\":{\"Matin\":[],\"Soir\":[185],\"Nuit\":[],\"Normal\":[]}}','completed',0,NULL,NULL,29,NULL,'2025-08-27 11:43:10','2025-08-27 11:53:16'),(238,2025,35,'[\"Matin\"]','{\"Matin\":[146,157,154,156,147,155,152,159]}','{\"Lundi\":{\"Matin\":[146,156],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Mardi\":{\"Matin\":[157,156],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Mercredi\":{\"Matin\":[154,156],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Jeudi\":{\"Matin\":[156,147],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Vendredi\":{\"Matin\":[156,155],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Samedi\":{\"Matin\":[156,152],\"Soir\":[],\"Nuit\":[],\"Normal\":[]},\"Dimanche\":{\"Matin\":[156,159],\"Soir\":[],\"Nuit\":[],\"Normal\":[]}}','completed',0,NULL,NULL,27,NULL,'2025-08-27 11:55:16','2025-08-27 11:55:25');
/*!40000 ALTER TABLE `weekly_plannings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `weekly_planning_status`
--

/*!50001 DROP VIEW IF EXISTS `weekly_planning_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `weekly_planning_status` AS select `weekly_plannings`.`year` AS `year`,`weekly_plannings`.`week_number` AS `week_number`,count(0) AS `total_plannings`,count(case when `weekly_plannings`.`status` = 'completed' then 1 end) AS `completed_plannings`,count(case when `weekly_plannings`.`is_consolidated` = 1 then 1 end) AS `consolidated_plannings`,group_concat(distinct `weekly_plannings`.`created_by` separator ',') AS `chef_ids`,max(`weekly_plannings`.`updated_at`) AS `last_updated` from `weekly_plannings` group by `weekly_plannings`.`year`,`weekly_plannings`.`week_number` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-27 14:26:02
