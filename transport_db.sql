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
) ENGINE=InnoDB AUTO_INCREMENT=289 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (126,'DENNI','AZIZ',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY ELBARAKA RUE JOUDART','HAY MOLAY RCHID',27,6,'2025-08-03 17:22:07'),(127,'EL BAKRI','REDOUANE',NULL,NULL,'SOIR','MPC','CDI',NULL,'FARAH EL SALLAM','RAHMA',30,6,'2025-08-03 17:22:07'),(128,'FADEL','Imad',NULL,NULL,'MATIN','MPC','CDI',NULL,'DAR BOUAAZA ESPACE AL MOHIT 1 ESSAADA','RAHMA',27,6,'2025-08-03 17:22:07'),(129,'JAMILI','MOHAMED',NULL,NULL,'SOIR','MPC','CDI',NULL,'FARAH EL SALLAM','RAHMA',30,6,'2025-08-03 17:22:07'),(130,'SOFIANE','MOURAD',NULL,NULL,'SOIR','MPC','CDI',NULL,'SIDI MOUMEN NOUR CITY 3','SIDI MOUMEN',27,6,'2025-08-03 17:22:07'),(131,'WAKRIM','MOHAMED',NULL,NULL,'MATIN','MPC','CDI',NULL,'CARNAUD COUPE','AZHAR',29,6,'2025-08-03 17:22:07'),(132,'KARNBAH','MOHAMED',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY MOHAMMEDY GRAND CEINTURE CAFE 7 3OYOUN','HAY MOHAMMEDI',27,6,'2025-08-03 17:22:07'),(133,'MOUDAKIR','SMAIN',NULL,NULL,'MATIN','MPC','CDI',NULL,'ROCHE NOIR','HAY MOHAMMEDI',37,6,'2025-08-03 17:22:07'),(134,'FEROUAL','ABDELALI',NULL,NULL,'MATIN','MPC','CDI',NULL,'PANORAMIQUE CAFE EL ANDALOUS','DERB SULTAN',37,6,'2025-08-03 17:22:07'),(135,'AZLAG','HASSAN',NULL,NULL,'MATIN','MPC','CDI',NULL,'AZHAR CAFE ELABDI','AZHAR',29,29,'2025-08-03 17:22:07'),(136,'NASSOUR','ABDELILAH',NULL,NULL,'MATIN','MPC','CDI',NULL,'JAWHARA SIDI MOUMEN PH ALAA','SIDI MOUMEN',30,6,'2025-08-03 17:22:07'),(137,'TABARANE','YOUNES',NULL,NULL,'MATIN','MPC','CDI',NULL,'SALMIA 2 RUE 14 IMM 10/POSTE SALMIA','HAY MOLAY RCHID',29,6,'2025-08-03 17:22:07'),(138,'OUAJHI','YOUNESS',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOSQUE QODS','ANASSI',29,6,'2025-08-03 17:22:07'),(139,'ELHANSALI','ABDERRAZAK',NULL,NULL,'SOIR','IND BTES',NULL,NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',28,9,'2025-08-03 17:22:07'),(140,'LABNI','MUSTAPHA',NULL,NULL,'SOIR','MPC','CDI',NULL,'CAFE FEM LEHCEN','HAY MOHAMMEDI',30,6,'2025-08-03 17:22:07'),(141,'IJABA','MOUNA',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY ELFALAH CINEMA FALAH','HAY MOLAY RCHID',29,6,'2025-08-03 17:22:07'),(142,'OUAHID','ADIL',NULL,NULL,'MATIN','MPC','CDI',NULL,'AZHAR PHARMACIE SAKANI','AZHAR',30,6,'2025-08-03 17:22:07'),(143,'SAIS','BRAHIM',NULL,NULL,'MATIN','MPC','CDI',NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',27,6,'2025-08-03 17:22:07'),(144,'ENNAJOUI','CHAKIR',NULL,NULL,'MATIN','MPC','CDI',NULL,'FARAH EL SALLAM','RAHMA',29,6,'2025-08-03 17:22:07'),(145,'KTRI','Abdelkarim',NULL,NULL,'MATIN','MPC','CDI',NULL,'ERRAHMA, ECOLE OTHMANE IBN AFFAN','RAHMA',29,6,'2025-08-03 17:22:07'),(146,'ADDAHR','AYOUB',NULL,NULL,'SOIR','EOLE','CDI',NULL,'HAY MOHAMMEDY BQ BMCE STATION TOTAL','HAY MOHAMMEDI',37,9,'2025-08-03 17:22:07'),(147,'EZZINE','ABDELALI',NULL,NULL,'SOIR','EOLE','CDI',NULL,'SIDI MOUMEN LOTS HOUDA','SIDI MOUMEN',27,7,'2025-08-03 17:22:07'),(148,'MAAGLI','SAID',NULL,NULL,'SOIR','EOLE','CDI',NULL,'SIDI OTHMANE CAFE ARSENAL','SIDI OTHMANE',27,7,'2025-08-03 17:22:07'),(149,'JAWAD','ABDERRAHIM',NULL,NULL,'MATIN','EOLE','CDI',NULL,'COMMUNE LISASFA ROUTE ELJADIDA','RAHMA',27,7,'2025-08-03 17:22:07'),(150,'TALEB','Rachid',NULL,NULL,'MATIN','EOLE','CDI',NULL,'CAFE SEVILLE BOURNAZIL','SIDI OTHMANE',27,7,'2025-08-03 17:22:07'),(151,'NADI','TARIK',NULL,NULL,'SOIR','EOLE','CDI',NULL,'AZHAR ECOLE ATLANTIC','AZHAR',27,7,'2025-08-03 17:22:07'),(152,'FELLAKI','ABDELKARIM',NULL,NULL,'MATIN','EOLE','CDI',NULL,'RIAD SIDI MOUMEN GROUPE 4','ANASSI',27,7,'2025-08-03 17:22:07'),(153,'SANID','TAOUFIK',NULL,NULL,'Normal','EOLE','CDI',NULL,'HAY MOHAMMEDY /TAKADOUM DAR DARIBA','HAY MOHAMMEDI',27,7,'2025-08-03 17:22:07'),(154,'BACHRI','HICHAM',NULL,NULL,'MATIN','EOLE','CDI',NULL,'BD BOUZIANE PH IKBAL','HAY MOLAY RCHID',27,7,'2025-08-03 17:22:07'),(155,'FARID','MOHAMMED',NULL,NULL,'SOIR','EOLE','CDI',NULL,'OULFA PH EL WOROUD','RAHMA',27,7,'2025-08-03 17:22:07'),(156,'BENNANNA','DRISS',NULL,NULL,'MATIN','EOLE','CDI',NULL,'SEBATA CAFE EL WAZIR','SIDI OTHMANE',27,7,'2025-08-03 17:22:07'),(157,'AOUZANE','Hamid',NULL,NULL,'SOIR','EOLE','CDI',NULL,'SOCICA STATION TOTAL','HAY MOHAMMEDI',30,7,'2025-08-03 17:22:07'),(158,'MAOUHOUB','JIHANE',NULL,NULL,'Normal','EOLE','CDI',NULL,'EL AZHAR','AZHAR',27,7,'2025-08-03 17:22:07'),(159,'HABACHI','SOUFIANE',NULL,NULL,'Normal','EOLE','CDI',NULL,'SIDI MOUMEN CHARAF','SIDI MOUMEN',27,7,'2025-08-03 17:22:07'),(160,'MOUKHTAM','NABIL',NULL,NULL,'Normal','EOLE','CDI',NULL,'AIN CHIFA 1 RUE 55 N° 119 CASA','DERB SULTAN',27,7,'2025-08-03 17:22:07'),(161,'LKIHAL','MEHDI',NULL,NULL,'Normal','SANA_ATELIER','CDI',NULL,'BERNOUSSI HAY QODSS','AZHAR',27,28,'2025-08-03 17:22:07'),(162,'JARNIJA','ABDLAH',NULL,NULL,'Normal','ACC','CDI',NULL,'hay lala meriem foryane','SIDI OTHMANE',27,19,'2025-08-03 17:22:07'),(163,'KASSI','AHMED',NULL,NULL,'Normal','ELECTRIQUE','CDI',NULL,'MOSQUE ADARISSA (SIDI MAAROUF)','DERB SULTAN',27,26,'2025-08-03 17:22:07'),(164,'SAIS','TARIK',NULL,NULL,'MATIN','ANAPEC','CDI',NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',27,27,'2025-08-03 17:22:07'),(165,'AYADI','MOSTAFA',NULL,NULL,'SOIR','EXPEDITIONS','CDI',NULL,'READ WALFA terminus bus 20','RAHMA',27,23,'2025-08-03 17:22:07'),(166,'FADEL','ABDELLATIF',NULL,NULL,'MATIN','VEG','CDI',NULL,'BOULEVARD DE LA CROIX PH CASABLANCA','DERB SULTAN',28,8,'2025-08-03 17:22:07'),(167,'FADEL','SAMI',NULL,NULL,'SOIR','VEG','CDI',NULL,'AZHAR SAKANI ECOLE EL KHANSAE','AZHAR',28,8,'2025-08-03 17:22:07'),(168,'BOUABID','JAWAD',NULL,NULL,'MATIN','VEG','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(169,'SAHRANI','MOHAMED',NULL,NULL,'SOIR','VEG','CDI',NULL,'SIDI MOUMEN 3OTOUR','SIDI MOUMEN',28,8,'2025-08-03 17:22:07'),(170,'KARBAL','BOUCHAIB',NULL,NULL,'MATIN','VEG','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(171,'BELYAKOUT','AZIZ',NULL,NULL,'MATIN','VEG','CDI',NULL,'COMMUNE LISASFA ROUTE ELJADIDA','RAHMA',28,8,'2025-08-03 17:22:07'),(172,'HOUAFI','AHMED',NULL,NULL,'SOIR','VEG','CDI',NULL,'ROUTE MOHAMMEDIA DIYAR ELMANSOUR','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(173,'SOULMANI','RACHID',NULL,NULL,'Normal','VEG',NULL,NULL,'SIDI MOUMEN NOUR CITY 2','SIDI MOUMEN',28,8,'2025-08-03 17:22:07'),(174,'FATHY','MEHDI',NULL,NULL,'Normal','VEG','CDI',NULL,'AIN HAROUDA','MOHAMMEDIA',28,8,'2025-08-03 17:22:07'),(175,'SOUALI','KHALISA',NULL,NULL,'Normal','VEG','CDI',NULL,'SEBATA BD','SIDI OTHMANE',28,8,'2025-08-03 17:22:07'),(176,'BOUKHAMI','Abdessamad',NULL,NULL,'Normal','VEG','CDI',NULL,'BD MAGHRIB ARABI AZHAR','AZHAR',28,8,'2025-08-03 17:22:07'),(177,'RTAIMAT','HAMZA',NULL,NULL,'Normal','VEG',NULL,NULL,'GRAND SEINTURE SBAA AYOUN','HAY MOHAMMEDI',28,8,'2025-08-03 17:22:07'),(178,'BAYI','HICHAM',NULL,NULL,'Normal','VEG','CDI',NULL,'HAY QOUDS BERNOUSSI','AZHAR',28,8,'2025-08-03 17:22:07'),(179,'NASSIR','Abdelali',NULL,NULL,'Normal','VEG','CDI',NULL,'AL AZHAR 1 TR IMMOY APPT 47','AZHAR',28,8,'2025-08-03 17:22:07'),(180,'BIYANI','AHEMAD',NULL,NULL,'Normal','VEG','CDI',NULL,'AL HAOUZIA) /Tel :0630131606','SIDI OTHMANE',28,8,'2025-08-03 17:22:07'),(181,'ESSAIDI','MOHAMED',NULL,NULL,'MATIN','TECHNIQUE','CDI',NULL,'BOURNAZIL BMCI','SIDI OTHMANE',28,24,'2025-08-03 17:22:07'),(182,'NABBAR','ABID',NULL,NULL,'SOIR','ELECTRIQUE','CDI',NULL,'CAFE 8 RES 8 HAY LALLA MERYEM','HAY MOLAY RCHID',28,26,'2025-08-03 17:22:07'),(183,'YASSINE','ABDLHADI',NULL,NULL,'Normal','ACC','CDI',NULL,'BOULEVARD HASSAN AL ALAOUI (SOCIETE TOOL BOIS)','SIDI OTHMANE',28,19,'2025-08-03 17:22:07'),(184,'OUMALELK','MOUAD',NULL,NULL,'Normal','SANA_ATELIER','CDI',NULL,'AIN HARROUDA MOHAMMEDIA','MOHAMMEDIA',28,28,'2025-08-03 17:22:07'),(185,'AZOUZI','AHMED',NULL,NULL,'MATIN','IND BTES','CDI',NULL,'POSTE HAY MOHAMMEDY','HAY MOHAMMEDI',29,9,'2025-08-03 17:22:07'),(186,'KOBBI','AHMED',NULL,NULL,'MATIN','IND BTES','CDI',NULL,'SIDI MOUMEN 3OTOUR','SIDI MOUMEN',29,9,'2025-08-03 17:22:07'),(187,'ERRADI','ABDELWAHED',NULL,NULL,'SOIR','IND BTES','CDI',NULL,'ANASSI SOUK NAMODAJI','ANASSI',29,9,'2025-08-03 17:22:07'),(188,'ESSOLAMI','HASSAN',NULL,NULL,'SOIR','IND BTES','CDI',NULL,'DERB SULTAN BD MOHAMMED 6 RESIDENCE EL NASR','DERB SULTAN',29,9,'2025-08-03 17:22:07'),(189,'MARBOUH','MUSTAPHA',NULL,NULL,'SOIR','ACC','CDI',NULL,'HAY LALA MERYEM ECOLE QODS','HAY MOLAY RCHID',39,19,'2025-08-03 17:22:07'),(190,'KAITER','RACHID',NULL,NULL,'MATIN','IND BTES','CDI',NULL,'BD MOULAY DRISS (2MARS)','DERB SULTAN',29,9,'2025-08-03 17:22:07'),(191,'ERREJIOUI','SAID',NULL,NULL,'Normal','IND BTES','CDI',NULL,'AZHAR RESIDENCE EL NASR','AZHAR',29,9,'2025-08-03 17:22:07'),(192,'LMERS','ACHERAF',NULL,NULL,'Normal','IND BTES',NULL,NULL,'BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(193,'HATOULI','OMAR',NULL,NULL,'Normal','IND BTES','CDI',NULL,'SIDI MOUMEN','SIDI MOUMEN',29,9,'2025-08-03 17:22:07'),(194,'LAABID','KABIRA',NULL,NULL,'Normal','IND BTES','CDI',NULL,'HAY MOHMADI','HAY MOHAMMEDI',29,9,'2025-08-03 17:22:07'),(195,'HAMZA','OULHADR',NULL,NULL,'Normal','IND BTES','CDI',NULL,'ROCHE NOIR BV MOLAY SMAIL','HAY MOHAMMEDI',29,9,'2025-08-03 17:22:07'),(196,'AIT IDAR','RACHID',NULL,NULL,'Normal','IND BTES','CDI',NULL,'RES MADINATI TR 10 IMM 05 NR 34 BERNOUSSI','AZHAR',29,25,'2025-08-03 17:22:07'),(197,'KHAMLICHI','AHEMAD',NULL,NULL,'Normal','IND BTES','CDI',NULL,'HAY L HABITAT BL 28 N 5 MOHMMADIA','MOHAMMEDIA',29,9,'2025-08-03 17:22:07'),(198,'ADLANI','MOHAMED',NULL,NULL,'Normal','IND BTES','CDI',NULL,'SIDI BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(199,'EZZOUBIR','Akram',NULL,NULL,'Normal','IND BTES',NULL,NULL,'BERNOUSSI','AZHAR',29,9,'2025-08-03 17:22:07'),(200,'LAHRICHI','HAMZA',NULL,NULL,'SOIR','IND BTES','CDI',NULL,'ELHIYANI HAY FALLAH','HAY MOLAY RCHID',29,9,'2025-08-03 17:22:07'),(201,'MOUHAL','SOUAD',NULL,NULL,'Normal','IND BTES','CDI',NULL,'SIDI MOUMEN SIDI BERNOUSSI','SIDI MOUMEN',29,9,'2025-08-03 17:22:07'),(202,'HADDOU','Fatima Zahra',NULL,NULL,'SOIR','INFIRMERIE','CDI',NULL,'HAY MOHAMMEDY HALAWIYAT ERRABI3','HAY MOHAMMEDI',29,25,'2025-08-03 17:22:07'),(203,'ANWAR','AZIZ',NULL,NULL,'MATIN','ELECTRIQUE','CDI',NULL,'TRAVAUX PUBLIC AL QODS SALLE DE FETE','AZHAR',29,9,'2025-08-03 17:22:07'),(204,'ERRADOUANI','KARIMA',NULL,NULL,'MATIN','ACC','CDI',NULL,'HAY MOHAMADI','HAY MOHAMMEDI',29,19,'2025-08-03 17:22:07'),(205,'MORABIT','SALAHDINE',NULL,NULL,'Normal','SANA_ATELIER','CDI',NULL,'HAY MASSIRA 2 MOULAY RACHID','HAY MOLAY RCHID',29,28,'2025-08-03 17:22:07'),(206,'RJAFALLAH','LARBI',NULL,NULL,'MATIN','QUALITE','CDI',NULL,'AIN CHOCK BD DAKHLA MOSQUE OUHOUD','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(207,'EL AZAR','ABDELJALIL',NULL,NULL,'MATIN','QUALITE',NULL,NULL,'HAY MOULAY RACHID PH IKBAK BD BOUZIANE','HAY MOLAY RCHID',30,10,'2025-08-03 17:22:07'),(208,'FAIZ','SAID',NULL,NULL,'SOIR','QUALITE',NULL,NULL,'OULFA 35','RAHMA',30,10,'2025-08-03 17:22:07'),(209,'SABIR','NOUREDDINE',NULL,NULL,'SOIR','QUALITE','CDI',NULL,'STATION PETRONIM BD SAKIA ELHAMRA','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(210,'ERRAJI','ELMEHDI',NULL,NULL,'MATIN','QUALITE',NULL,NULL,'STATION TOTAL BD DRISS ELHARTI','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(211,'MISSAOUI','ABDELMAJID',NULL,NULL,'SOIR','QUALITE',NULL,NULL,'SEBATA RUE ABDELKADER SAHRAOUI','HAY MOLAY RCHID',30,10,'2025-08-03 17:22:07'),(212,'FETHERRAHIM','BADR',NULL,NULL,'SOIR','QUALITE','CDI',NULL,'SEBATA CINEMA MADANIA','SIDI OTHMANE',30,10,'2025-08-03 17:22:07'),(213,'ORANGE','MOHAMMED',NULL,NULL,'SOIR','QUALITE',NULL,NULL,'ANASSI BV ZEFZAF','ANASSI',30,10,'2025-08-03 17:22:07'),(214,'ZITOUNI','TALALI',NULL,NULL,'Normal','QUALITE','CDI',NULL,'OULFA','RAHMA',30,10,'2025-08-03 17:22:07'),(215,'ELMAABADY','MOHAMED',NULL,NULL,'Normal','QUALITE','CDI',NULL,'JAWHARA FARMACI AL ALAA','SIDI MOUMEN',30,10,'2025-08-03 17:22:07'),(216,'TIJAHI','ASMAA',NULL,NULL,'MATIN','INFIRMERIE','CDI',NULL,'BD BAGHDAD QODS','AZHAR',30,25,'2025-08-03 17:22:07'),(217,'SAADOUNI','SAID',NULL,NULL,'SOIR','ELECTRIQUE','CDI',NULL,'BOURNAZIL BV 9OWAT ALMOSA3IDA CAFE ZAYTOUNA','SIDI OTHMANE',30,26,'2025-08-03 17:22:07'),(218,'MAHMAH','AYOUB',NULL,NULL,'SOIR','ANAPEC','CDI',NULL,'ABIR, SIDI MOUMEN','SIDI MOUMEN',30,27,'2025-08-03 17:22:07'),(219,'LAHMIDI','ABDELHAMID',NULL,NULL,'MATIN','ACC','CDI',NULL,'ABIR SIDI MOUMEN','SIDI MOUMEN',30,19,'2025-08-03 17:22:07'),(221,'AMIZ','REDOUANE',NULL,NULL,'MATIN','ACC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',29,19,'2025-08-03 17:22:07'),(222,'HAILI','MOHAMED',NULL,NULL,'MATIN','ACC','CDI',NULL,'HAY MOHAMMEDI CAFE 7 AAYOUN','HAY MOHAMMEDI',27,19,'2025-08-03 17:22:07'),(223,'HIRMANE','FOUAD',NULL,NULL,'MATIN','ACC','CDI',NULL,'AZHAR PANORAMA','AZHAR',28,19,'2025-08-03 17:22:07'),(224,'BAHROUNE','MOHAMED',NULL,NULL,'MATIN','ACC','CDI',NULL,'AZHAR ECOLE ATLANTIC','AZHAR',29,19,'2025-08-03 17:22:07'),(225,'MASSAKI','ABDESSAMAD',NULL,NULL,'Normal','ACC','CDI',NULL,'MABROUKA SIDI OTHMANE','SIDI OTHMANE',30,19,'2025-08-03 17:22:07'),(226,'JMOUHI','MOHAMED',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'DERB SULTAN BD BOUCHAIB DOUKALI PH EL NASER','DERB SULTAN',27,23,'2025-08-03 17:22:07'),(227,'GHOUFRAOUI','MUSTAPHA',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',27,23,'2025-08-03 17:22:07'),(229,'SOUBAIR','HANANE',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'AIN SEBAA','HAY MOHAMMEDI',29,23,'2025-08-03 17:22:07'),(230,'NABIL','MOHAMED',NULL,NULL,'Normal','EXPEDITIONS','CDI',NULL,'SIDI MOUMEN','SIDI MOUMEN',30,23,'2025-08-03 17:22:07'),(231,'CHAFIQ','SAFAA',NULL,NULL,'Normal','EXPEDITIONS','CDI',NULL,'HAY MOHAMMADI AIN SBAA','HAY MOHAMMEDI',27,23,'2025-08-03 17:22:07'),(232,'CHAMITI','Salah Eddine',NULL,NULL,'SOIR','ACC','CDI',NULL,'HAY MOUHEMADI','HAY MOHAMMEDI',27,19,'2025-08-03 17:22:07'),(233,'BOUKADOM','MOHAMED',NULL,NULL,'MATIN','ACC','CDI',NULL,'SIDI MOUMANE','SIDI MOUMEN',28,19,'2025-08-03 17:22:07'),(235,'HABACHI','MOHAMED',NULL,NULL,'Normal','MPC','CDI',NULL,'SIDI MOUMEN','SIDI MOUMEN',30,6,'2025-08-03 17:22:07'),(236,'BELHACHEMI','OTHMANE',NULL,NULL,'Normal','ANAPEC','CDI',NULL,'ROCHE NOIR BV MOLAY SMAIL','HAY MOHAMMEDI',27,27,'2025-08-03 17:22:07'),(237,'DARWICH','SAID',NULL,NULL,'MATIN','MPC','CDI',NULL,'HAY ELMASSIRA','HAY MOLAY RCHID',27,6,'2025-08-03 17:22:07'),(238,'SKOURI','ABDELAZIZ',NULL,NULL,'SOIR','MPC','CDI',NULL,'HAY ELMASSIRA 1 FACULTE DES LETTRES','HAY MOLAY RCHID',28,6,'2025-08-03 17:22:07'),(239,'AITBRAHIM','SAID',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',29,9,'2025-08-03 17:22:07'),(240,'SOUAT','MALIKA',NULL,NULL,'MATIN','MPC','CDI',NULL,'A COTE DU CINEMA ENNAJAH MOHMMEDIA','MOHAMMEDIA',30,6,'2025-08-03 17:22:07'),(241,'BROGI','MINA',NULL,NULL,'MATIN','MPC','CDI',NULL,'RUE PALESTINE A COTE BANQUE POPULAIRE MOHAMMEDIA','MOHAMMEDIA',29,6,'2025-08-03 17:22:07'),(242,'MARHRAOUI','SAADIA',NULL,NULL,'MATIN','MPC','CDI',NULL,'BD MOHAMED 6 ACOTE DE CAFE OULADE HAMASSE MOHAMMEDI','MOHAMMEDIA',27,6,'2025-08-03 17:22:07'),(243,'ARICHI','SOUAD',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,29,'2025-08-03 17:22:07'),(244,'HOSNI','KHADIJA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',29,6,'2025-08-03 17:22:07'),(245,'RAFYA','SAADIA',NULL,NULL,'MATIN','MPC','CDI',NULL,'TERMINUS BUS 33 SOUK ENNAMOUDAJA ANASSI','ANASSI',30,6,'2025-08-03 17:22:07'),(246,'HMIMSY','FATIMA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,6,'2025-08-03 17:22:07'),(247,'HABIBI','MINA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',27,6,'2025-08-03 17:22:07'),(248,'HASSI','NAIMA',NULL,NULL,'MATIN','MPC','CDI',NULL,'MOHAMMEDIA','MOHAMMEDIA',28,6,'2025-08-03 17:22:07'),(255,'ABDELKAML','YOUSSEF',NULL,NULL,'MATIN','MPC','CDI',NULL,'DOUAR BIA RUE 14 N°2',NULL,37,29,'2025-08-13 14:37:39'),(257,'ALSAFI ','KAMAL',NULL,NULL,'MATIN','EXPEDITIONS','CDI',NULL,'BD ZERKTOUNI ROND POINT D\'EUROPE','DERB SULTAN',40,25,'2025-08-14 08:08:16'),(258,'Dahr','Khalid',NULL,NULL,'Normal','ACC','CDI',NULL,'ANASSI','ANASSI',39,19,'2025-08-14 08:51:54');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_file_logs`
--

DROP TABLE IF EXISTS `finance_file_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `finance_file_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` enum('upload','download','delete') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_finance_file_logs_file` FOREIGN KEY (`file_id`) REFERENCES `finance_files` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_finance_file_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_file_logs`
--

LOCK TABLES `finance_file_logs` WRITE;
/*!40000 ALTER TABLE `finance_file_logs` DISABLE KEYS */;
INSERT INTO `finance_file_logs` VALUES (1,1,3,'upload','2025-08-27 15:10:28'),(2,2,3,'upload','2025-08-27 15:10:53'),(3,3,3,'upload','2025-08-27 15:23:25'),(4,3,3,'download','2025-08-28 06:46:26'),(5,3,3,'download','2025-08-28 06:46:28'),(6,3,3,'download','2025-08-28 06:46:33'),(7,3,3,'download','2025-08-28 06:46:33'),(8,3,3,'download','2025-08-28 06:46:33'),(9,3,3,'download','2025-08-28 06:46:34'),(10,3,3,'download','2025-08-28 06:46:34'),(11,3,3,'download','2025-08-28 06:46:34'),(12,3,3,'download','2025-08-28 06:46:35'),(13,3,3,'download','2025-08-28 06:46:35'),(14,3,3,'download','2025-08-28 06:46:35'),(15,3,3,'download','2025-08-28 06:46:36'),(16,3,3,'download','2025-08-28 06:46:36'),(17,3,3,'download','2025-08-28 06:46:36'),(18,3,3,'download','2025-08-28 06:46:37'),(19,3,3,'download','2025-08-28 06:46:37'),(20,3,3,'download','2025-08-28 06:46:37'),(21,3,3,'download','2025-08-28 06:46:38'),(22,3,3,'download','2025-08-28 06:46:38'),(23,2,3,'download','2025-08-28 06:46:39'),(24,2,3,'download','2025-08-28 06:46:39'),(25,2,3,'download','2025-08-28 06:46:39'),(26,2,3,'download','2025-08-28 06:46:39'),(27,2,3,'download','2025-08-28 06:46:39'),(28,3,3,'download','2025-08-28 06:46:40'),(29,2,3,'download','2025-08-28 06:46:40'),(30,2,3,'download','2025-08-28 06:46:40'),(31,2,3,'download','2025-08-28 06:46:41'),(32,2,3,'download','2025-08-28 06:46:41'),(33,2,3,'download','2025-08-28 06:46:42'),(34,2,3,'download','2025-08-28 06:46:43'),(35,2,3,'download','2025-08-28 06:46:43'),(36,2,3,'download','2025-08-28 06:46:44'),(37,2,3,'download','2025-08-28 06:46:44'),(38,2,3,'download','2025-08-28 06:46:44'),(39,2,3,'download','2025-08-28 06:46:45'),(40,2,3,'download','2025-08-28 06:46:45'),(41,2,3,'download','2025-08-28 06:46:46'),(42,2,3,'download','2025-08-28 06:46:46'),(43,2,3,'download','2025-08-28 06:46:47'),(44,2,3,'download','2025-08-28 06:46:47'),(45,2,3,'download','2025-08-28 06:46:47'),(46,2,3,'download','2025-08-28 06:46:48'),(47,2,3,'download','2025-08-28 06:46:48'),(48,2,3,'download','2025-08-28 06:46:49'),(49,2,3,'download','2025-08-28 06:46:49'),(50,2,3,'download','2025-08-28 06:46:49'),(51,3,3,'download','2025-08-28 06:47:01'),(52,3,3,'download','2025-08-28 06:48:42'),(53,3,3,'download','2025-08-28 06:54:10'),(54,2,3,'download','2025-08-28 06:54:14'),(55,2,3,'download','2025-08-28 06:54:14'),(56,2,3,'download','2025-08-28 06:54:16');
/*!40000 ALTER TABLE `finance_file_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_files`
--

DROP TABLE IF EXISTS `finance_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `finance_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `mimetype` varchar(127) NOT NULL,
  `size` bigint(20) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `stored_name` (`stored_name`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_uploaded_at` (`uploaded_at`),
  CONSTRAINT `fk_finance_files_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_files`
--

LOCK TABLES `finance_files` WRITE;
/*!40000 ALTER TABLE `finance_files` DISABLE KEYS */;
INSERT INTO `finance_files` VALUES (1,'The-Idiot.pdf','72db65e4-028d-402a-897d-d15b1674e050.pdf','application/pdf',2098245,3,'2025-08-27 15:10:28'),(2,'The-Idiot.pdf','8a2b3243-d1c6-4d26-aed4-3a24d2f12178.pdf','application/pdf',2098245,3,'2025-08-27 15:10:53'),(3,'The-Idiot.pdf','d3d61b6b-b0ce-4cee-a503-12866c5b4195.pdf','application/pdf',2098245,3,'2025-08-27 15:23:25');
/*!40000 ALTER TABLE `finance_files` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interim_loans`
--

LOCK TABLES `interim_loans` WRITE;
/*!40000 ALTER TABLE `interim_loans` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'001_create_atelier_chefs_table.sql','2025-08-12 12:26:22'),(2,'002_add_atelier_id_to_employees.sql','2025-08-12 12:28:28'),(3,'003_remove_atelier_id_from_users.sql','2025-08-12 12:29:38'),(4,'004_fix_circuits_table.sql','2025-08-12 12:30:10'),(5,'005_migrate_existing_data.sql','2025-08-12 12:31:17'),(6,'006_add_day_assignments_to_weekly_plannings.sql','2025-08-27 10:07:35'),(7,'007_add_notifications_and_locks.sql','2025-08-27 13:26:52'),(8,'007_add_status_and_consolidation_fields.sql','2025-08-28 07:21:41'),(9,'008_add_reopen_workflow_fields.sql','2025-08-28 07:21:41'),(10,'009_add_missing_reopen_columns.sql','2025-08-28 07:38:44'),(11,'010_create_requests_tables.sql','2025-08-28 08:46:09'),(12,'011_create_notifications.sql','2025-08-28 13:01:19');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('reopen_request','reopen_approved','employee_request','employee_approved') NOT NULL,
  `message` text DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `recipient_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_recipient_created` (`recipient_user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=250 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'employee_request','Demande d\'employés #10 par FOUAJ','{\"requestId\":10}',1,'2025-08-28 13:59:28','2025-08-28 14:48:40'),(2,'employee_request','Demande d\'employés #10 par FOUAJ','{\"requestId\":10}',3,'2025-08-28 13:59:28','2025-08-28 13:59:45'),(3,'employee_request','Demande d\'employés #10 par FOUAJ','{\"requestId\":10}',50,'2025-08-28 13:59:28',NULL),(4,'employee_request','Demande d\'employés #10 par FOUAJ','{\"requestId\":10}',51,'2025-08-28 13:59:28',NULL),(5,'reopen_request','Demande de réouverture planning #284','{\"planningId\":284,\"reason\":\"hh\"}',3,'2025-08-28 14:01:29','2025-08-28 14:01:41'),(6,'reopen_request','Demande de réouverture planning #284','{\"planningId\":284,\"reason\":\"hh\"}',1,'2025-08-28 14:01:29','2025-08-28 14:48:40'),(7,'reopen_request','Demande de réouverture planning #284','{\"planningId\":284,\"reason\":\"hh\"}',50,'2025-08-28 14:01:29',NULL),(8,'reopen_request','Demande de réouverture planning #284','{\"planningId\":284,\"reason\":\"hh\"}',51,'2025-08-28 14:01:29',NULL),(9,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":284}',29,'2025-08-28 14:01:44','2025-08-28 14:50:34'),(10,'reopen_request','Demande de réouverture planning #286','{\"planningId\":286,\"reason\":\"hh\"}',1,'2025-08-28 14:12:20','2025-08-28 14:48:40'),(11,'reopen_request','Demande de réouverture planning #286','{\"planningId\":286,\"reason\":\"hh\"}',3,'2025-08-28 14:12:20','2025-08-28 14:48:50'),(12,'reopen_request','Demande de réouverture planning #286','{\"planningId\":286,\"reason\":\"hh\"}',50,'2025-08-28 14:12:20',NULL),(13,'reopen_request','Demande de réouverture planning #286','{\"planningId\":286,\"reason\":\"hh\"}',51,'2025-08-28 14:12:20',NULL),(14,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":286}',42,'2025-08-28 14:12:35','2025-08-29 19:00:08'),(15,'reopen_request','Demande de réouverture planning #288','{\"planningId\":288,\"reason\":\"tt\"}',3,'2025-08-28 14:14:07','2025-08-28 14:48:50'),(16,'reopen_request','Demande de réouverture planning #288','{\"planningId\":288,\"reason\":\"tt\"}',51,'2025-08-28 14:14:07',NULL),(17,'reopen_request','Demande de réouverture planning #288','{\"planningId\":288,\"reason\":\"tt\"}',1,'2025-08-28 14:14:07','2025-08-28 14:32:34'),(18,'reopen_request','Demande de réouverture planning #288','{\"planningId\":288,\"reason\":\"tt\"}',50,'2025-08-28 14:14:07',NULL),(19,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":288}',37,'2025-08-28 14:14:24',NULL),(20,'employee_request','Demande d\'employés #11 par FARIH','{\"requestId\":11}',51,'2025-08-28 14:15:27',NULL),(21,'employee_request','Demande d\'employés #11 par FARIH','{\"requestId\":11}',3,'2025-08-28 14:15:27','2025-08-28 14:48:50'),(22,'employee_request','Demande d\'employés #11 par FARIH','{\"requestId\":11}',1,'2025-08-28 14:15:27','2025-08-28 14:32:33'),(23,'employee_request','Demande d\'employés #11 par FARIH','{\"requestId\":11}',50,'2025-08-28 14:15:27',NULL),(24,'employee_approved','Demande d\'employés approuvée: AIT IDAR RACHID, ALSAFI  KAMAL','{\"requestId\":\"11\",\"employeeIds\":[196,257]}',37,'2025-08-28 14:15:40',NULL),(25,'reopen_request','Demande de réouverture planning #290','{\"planningId\":290,\"reason\":\"tt\"}',1,'2025-08-28 14:19:27','2025-08-28 14:32:33'),(26,'reopen_request','Demande de réouverture planning #290','{\"planningId\":290,\"reason\":\"tt\"}',3,'2025-08-28 14:19:27','2025-08-28 14:48:50'),(27,'reopen_request','Demande de réouverture planning #290','{\"planningId\":290,\"reason\":\"tt\"}',50,'2025-08-28 14:19:27',NULL),(28,'reopen_request','Demande de réouverture planning #290','{\"planningId\":290,\"reason\":\"tt\"}',51,'2025-08-28 14:19:27',NULL),(29,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":290}',48,'2025-08-28 14:19:40','2025-09-01 10:39:29'),(30,'reopen_request','Demande de réouverture planning #292','{\"planningId\":292,\"reason\":\"\"}',1,'2025-08-28 14:33:31','2025-08-28 14:48:38'),(31,'reopen_request','Demande de réouverture planning #292','{\"planningId\":292,\"reason\":\"\"}',50,'2025-08-28 14:33:31',NULL),(32,'reopen_request','Demande de réouverture planning #292','{\"planningId\":292,\"reason\":\"\"}',51,'2025-08-28 14:33:31',NULL),(33,'reopen_request','Demande de réouverture planning #292','{\"planningId\":292,\"reason\":\"\"}',3,'2025-08-28 14:33:31','2025-08-28 14:48:50'),(34,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":292}',42,'2025-08-28 14:33:48','2025-08-29 19:00:08'),(35,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":290}',48,'2025-08-28 14:34:29','2025-09-01 10:39:29'),(36,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',1,'2025-08-28 14:52:50','2025-08-28 14:53:13'),(37,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',3,'2025-08-28 14:52:50','2025-08-28 14:55:31'),(38,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',50,'2025-08-28 14:52:50',NULL),(39,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',51,'2025-08-28 14:52:50',NULL),(40,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":295}',29,'2025-08-28 14:53:23','2025-08-28 14:55:08'),(41,'employee_request','Demande d\'employés #12 par FOUAJ','{\"requestId\":12}',3,'2025-08-28 14:54:24','2025-08-28 14:55:30'),(42,'employee_request','Demande d\'employés #12 par FOUAJ','{\"requestId\":12}',1,'2025-08-28 14:54:24','2025-08-28 14:58:56'),(43,'employee_request','Demande d\'employés #12 par FOUAJ','{\"requestId\":12}',50,'2025-08-28 14:54:24',NULL),(44,'employee_request','Demande d\'employés #12 par FOUAJ','{\"requestId\":12}',51,'2025-08-28 14:54:24',NULL),(45,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID, ADLANI MOHAMED, ABDELKAML YOUSSEF','{\"requestId\":\"12\",\"employeeIds\":[146,196,198,255]}',29,'2025-08-28 14:54:51','2025-08-28 14:55:08'),(46,'employee_request','Demande d\'employés #13 par BOUZARDA','{\"requestId\":13}',3,'2025-08-28 14:55:40','2025-08-28 15:30:14'),(47,'employee_request','Demande d\'employés #13 par BOUZARDA','{\"requestId\":13}',50,'2025-08-28 14:55:40',NULL),(48,'employee_request','Demande d\'employés #13 par BOUZARDA','{\"requestId\":13}',51,'2025-08-28 14:55:40',NULL),(49,'employee_request','Demande d\'employés #13 par BOUZARDA','{\"requestId\":13}',1,'2025-08-28 14:55:40','2025-08-28 14:58:55'),(50,'employee_approved','Demande d\'employés approuvée: AIT IDAR RACHID, ALSAFI  KAMAL','{\"requestId\":\"13\",\"employeeIds\":[196,257]}',47,'2025-08-28 14:56:07','2025-08-29 18:33:51'),(51,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":299}',42,'2025-08-28 14:59:11','2025-08-29 19:00:08'),(52,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',1,'2025-08-29 17:27:19',NULL),(53,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',3,'2025-08-29 17:27:19','2025-08-29 17:27:49'),(54,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',50,'2025-08-29 17:27:19',NULL),(55,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',51,'2025-08-29 17:27:19',NULL),(56,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":295}',29,'2025-08-29 17:27:46','2025-09-01 07:05:27'),(57,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',1,'2025-08-29 17:49:01',NULL),(58,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',3,'2025-08-29 17:49:01','2025-08-29 17:49:47'),(59,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',50,'2025-08-29 17:49:01',NULL),(60,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',51,'2025-08-29 17:49:01',NULL),(61,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":300}',40,'2025-08-29 17:49:24','2025-08-29 18:58:18'),(62,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par Ouakrim 3 )','{\"requestId\":14,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"Ouakrim 3 \"}',1,'2025-08-29 17:49:58',NULL),(63,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par Ouakrim 3 )','{\"requestId\":14,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"Ouakrim 3 \"}',3,'2025-08-29 17:49:58','2025-08-29 17:52:51'),(64,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par Ouakrim 3 )','{\"requestId\":14,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"Ouakrim 3 \"}',50,'2025-08-29 17:49:58',NULL),(65,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par Ouakrim 3 )','{\"requestId\":14,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"Ouakrim 3 \"}',51,'2025-08-29 17:49:58',NULL),(66,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',51,'2025-08-29 17:50:20',NULL),(67,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',1,'2025-08-29 17:50:20',NULL),(68,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',50,'2025-08-29 17:50:20',NULL),(69,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',3,'2025-08-29 17:50:20','2025-08-29 17:52:50'),(70,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":301}',42,'2025-08-29 17:50:50','2025-08-29 19:00:08'),(71,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID','{\"requestId\":\"14\",\"employeeIds\":[146,196]}',42,'2025-08-29 17:50:52','2025-08-29 19:00:08'),(72,'employee_request','Demande d\'employés: AZLAG HASSAN, ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":15,\"employeeIds\":[135,203],\"employeeNames\":\"AZLAG HASSAN, ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',1,'2025-08-29 17:59:12',NULL),(73,'employee_request','Demande d\'employés: AZLAG HASSAN, ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":15,\"employeeIds\":[135,203],\"employeeNames\":\"AZLAG HASSAN, ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',3,'2025-08-29 17:59:12','2025-08-29 18:02:18'),(74,'employee_request','Demande d\'employés: AZLAG HASSAN, ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":15,\"employeeIds\":[135,203],\"employeeNames\":\"AZLAG HASSAN, ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',50,'2025-08-29 17:59:12',NULL),(75,'employee_request','Demande d\'employés: AZLAG HASSAN, ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":15,\"employeeIds\":[135,203],\"employeeNames\":\"AZLAG HASSAN, ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',51,'2025-08-29 17:59:12',NULL),(76,'employee_approved','Demande d\'employés approuvée: AZLAG HASSAN, ANWAR AZIZ','{\"requestId\":\"15\",\"employeeIds\":[135,203]}',46,'2025-08-29 17:59:32','2025-08-29 19:11:02'),(77,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par OUADIF KACEM)','{\"requestId\":16,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"OUADIF KACEM\"}',3,'2025-08-29 18:02:29','2025-08-29 18:03:01'),(78,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par OUADIF KACEM)','{\"requestId\":16,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"OUADIF KACEM\"}',50,'2025-08-29 18:02:29',NULL),(79,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par OUADIF KACEM)','{\"requestId\":16,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"OUADIF KACEM\"}',51,'2025-08-29 18:02:29',NULL),(80,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par OUADIF KACEM)','{\"requestId\":16,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"OUADIF KACEM\"}',1,'2025-08-29 18:02:29',NULL),(81,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID','{\"requestId\":\"16\",\"employeeIds\":[146,196]}',28,'2025-08-29 18:03:02','2025-09-01 07:41:03'),(82,'reopen_request','Demande de réouverture planning #302','{\"planningId\":302,\"reason\":\"\"}',1,'2025-08-29 18:03:20',NULL),(83,'reopen_request','Demande de réouverture planning #302','{\"planningId\":302,\"reason\":\"\"}',3,'2025-08-29 18:03:20','2025-08-29 18:05:55'),(84,'reopen_request','Demande de réouverture planning #302','{\"planningId\":302,\"reason\":\"\"}',50,'2025-08-29 18:03:20',NULL),(85,'reopen_request','Demande de réouverture planning #302','{\"planningId\":302,\"reason\":\"\"}',51,'2025-08-29 18:03:20',NULL),(86,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":302}',28,'2025-08-29 18:03:56','2025-09-01 07:41:03'),(87,'employee_request','Demande d\'employés: ARICHI SOUAD (par OUADIF KACEM)','{\"requestId\":17,\"employeeIds\":[243],\"employeeNames\":\"ARICHI SOUAD\",\"requestedByName\":\"OUADIF KACEM\"}',1,'2025-08-29 18:04:09',NULL),(88,'employee_request','Demande d\'employés: ARICHI SOUAD (par OUADIF KACEM)','{\"requestId\":17,\"employeeIds\":[243],\"employeeNames\":\"ARICHI SOUAD\",\"requestedByName\":\"OUADIF KACEM\"}',3,'2025-08-29 18:04:09','2025-08-29 18:05:54'),(89,'employee_request','Demande d\'employés: ARICHI SOUAD (par OUADIF KACEM)','{\"requestId\":17,\"employeeIds\":[243],\"employeeNames\":\"ARICHI SOUAD\",\"requestedByName\":\"OUADIF KACEM\"}',50,'2025-08-29 18:04:09',NULL),(90,'employee_request','Demande d\'employés: ARICHI SOUAD (par OUADIF KACEM)','{\"requestId\":17,\"employeeIds\":[243],\"employeeNames\":\"ARICHI SOUAD\",\"requestedByName\":\"OUADIF KACEM\"}',51,'2025-08-29 18:04:09',NULL),(91,'employee_approved','Demande d\'employés approuvée: ARICHI SOUAD','{\"requestId\":\"17\",\"employeeIds\":[243]}',28,'2025-08-29 18:05:27','2025-09-01 07:41:03'),(92,'employee_request','Demande d\'employés: ANWAR AZIZ, ALSAFI  KAMAL (par AIT BENTAAZA OMAR)','{\"requestId\":18,\"employeeIds\":[203,257],\"employeeNames\":\"ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"AIT BENTAAZA OMAR\"}',1,'2025-08-29 18:11:38',NULL),(93,'employee_request','Demande d\'employés: ANWAR AZIZ, ALSAFI  KAMAL (par AIT BENTAAZA OMAR)','{\"requestId\":18,\"employeeIds\":[203,257],\"employeeNames\":\"ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"AIT BENTAAZA OMAR\"}',50,'2025-08-29 18:11:38',NULL),(94,'employee_request','Demande d\'employés: ANWAR AZIZ, ALSAFI  KAMAL (par AIT BENTAAZA OMAR)','{\"requestId\":18,\"employeeIds\":[203,257],\"employeeNames\":\"ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"AIT BENTAAZA OMAR\"}',51,'2025-08-29 18:11:38',NULL),(95,'employee_request','Demande d\'employés: ANWAR AZIZ, ALSAFI  KAMAL (par AIT BENTAAZA OMAR)','{\"requestId\":18,\"employeeIds\":[203,257],\"employeeNames\":\"ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"AIT BENTAAZA OMAR\"}',3,'2025-08-29 18:11:38','2025-08-29 18:15:09'),(96,'reopen_request','Demande de réouverture planning #303','{\"planningId\":303,\"reason\":\"\"}',1,'2025-08-29 18:11:52',NULL),(97,'reopen_request','Demande de réouverture planning #303','{\"planningId\":303,\"reason\":\"\"}',3,'2025-08-29 18:11:52','2025-08-29 18:15:09'),(98,'reopen_request','Demande de réouverture planning #303','{\"planningId\":303,\"reason\":\"\"}',50,'2025-08-29 18:11:52',NULL),(99,'reopen_request','Demande de réouverture planning #303','{\"planningId\":303,\"reason\":\"\"}',51,'2025-08-29 18:11:52',NULL),(100,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":303}',27,'2025-08-29 18:15:07',NULL),(101,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',50,'2025-08-29 18:18:02',NULL),(102,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',51,'2025-08-29 18:18:02',NULL),(103,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',1,'2025-08-29 18:18:02',NULL),(104,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',3,'2025-08-29 18:18:02','2025-08-29 18:27:55'),(105,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":300}',40,'2025-08-29 18:18:56','2025-08-29 18:58:18'),(106,'employee_request','Demande d\'employés: ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":19,\"employeeIds\":[203],\"employeeNames\":\"ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',1,'2025-08-29 18:21:51',NULL),(107,'employee_request','Demande d\'employés: ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":19,\"employeeIds\":[203],\"employeeNames\":\"ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',3,'2025-08-29 18:21:51','2025-08-29 18:27:55'),(108,'employee_request','Demande d\'employés: ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":19,\"employeeIds\":[203],\"employeeNames\":\"ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',51,'2025-08-29 18:21:51',NULL),(109,'employee_request','Demande d\'employés: ANWAR AZIZ (par OUAKRIM 6 )','{\"requestId\":19,\"employeeIds\":[203],\"employeeNames\":\"ANWAR AZIZ\",\"requestedByName\":\"OUAKRIM 6 \"}',50,'2025-08-29 18:21:51',NULL),(110,'employee_approved','Demande d\'employés approuvée: ANWAR AZIZ','{\"requestId\":\"19\",\"employeeIds\":[203]}',46,'2025-08-29 18:22:11','2025-08-29 19:11:01'),(111,'reopen_request','Demande de réouverture planning #305','{\"planningId\":305,\"reason\":\"\"}',1,'2025-08-29 18:25:25',NULL),(112,'reopen_request','Demande de réouverture planning #305','{\"planningId\":305,\"reason\":\"\"}',3,'2025-08-29 18:25:25','2025-08-29 18:27:55'),(113,'reopen_request','Demande de réouverture planning #305','{\"planningId\":305,\"reason\":\"\"}',50,'2025-08-29 18:25:25',NULL),(114,'reopen_request','Demande de réouverture planning #305','{\"planningId\":305,\"reason\":\"\"}',51,'2025-08-29 18:25:25',NULL),(115,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":305}',41,'2025-08-29 18:26:13',NULL),(116,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par ZETA)','{\"requestId\":20,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"ZETA\"}',3,'2025-08-29 18:28:12',NULL),(117,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par ZETA)','{\"requestId\":20,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"ZETA\"}',1,'2025-08-29 18:28:12',NULL),(118,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par ZETA)','{\"requestId\":20,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"ZETA\"}',50,'2025-08-29 18:28:12',NULL),(119,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID (par ZETA)','{\"requestId\":20,\"employeeIds\":[146,196],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID\",\"requestedByName\":\"ZETA\"}',51,'2025-08-29 18:28:12',NULL),(120,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',1,'2025-08-29 18:28:45',NULL),(121,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',50,'2025-08-29 18:28:45',NULL),(122,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',3,'2025-08-29 18:28:45',NULL),(123,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',51,'2025-08-29 18:28:45',NULL),(124,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID','{\"requestId\":\"20\",\"employeeIds\":[146,196]}',43,'2025-08-29 18:29:09',NULL),(125,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":306}',43,'2025-08-29 18:29:11',NULL),(126,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par BOUZARDA)','{\"requestId\":21,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"BOUZARDA\"}',1,'2025-08-29 18:33:44',NULL),(127,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par BOUZARDA)','{\"requestId\":21,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"BOUZARDA\"}',50,'2025-08-29 18:33:44',NULL),(128,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par BOUZARDA)','{\"requestId\":21,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"BOUZARDA\"}',3,'2025-08-29 18:33:44',NULL),(129,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par BOUZARDA)','{\"requestId\":21,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"BOUZARDA\"}',51,'2025-08-29 18:33:44',NULL),(130,'reopen_request','Demande de réouverture planning #307','{\"planningId\":307,\"reason\":\"\"}',3,'2025-08-29 18:34:27',NULL),(131,'reopen_request','Demande de réouverture planning #307','{\"planningId\":307,\"reason\":\"\"}',50,'2025-08-29 18:34:27',NULL),(132,'reopen_request','Demande de réouverture planning #307','{\"planningId\":307,\"reason\":\"\"}',51,'2025-08-29 18:34:27',NULL),(133,'reopen_request','Demande de réouverture planning #307','{\"planningId\":307,\"reason\":\"\"}',1,'2025-08-29 18:34:27',NULL),(134,'employee_approved','Demande d\'employés approuvée: ALSAFI  KAMAL','{\"requestId\":\"21\",\"employeeIds\":[257]}',47,'2025-08-29 18:35:00','2025-09-03 07:19:58'),(135,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":307}',47,'2025-08-29 18:35:18','2025-09-03 07:19:58'),(136,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par MAZOUAR)','{\"requestId\":23,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"MAZOUAR\"}',1,'2025-08-29 18:42:13',NULL),(137,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par MAZOUAR)','{\"requestId\":23,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"MAZOUAR\"}',3,'2025-08-29 18:42:13',NULL),(138,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par MAZOUAR)','{\"requestId\":23,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"MAZOUAR\"}',50,'2025-08-29 18:42:13',NULL),(139,'employee_request','Demande d\'employés: ALSAFI  KAMAL (par MAZOUAR)','{\"requestId\":23,\"employeeIds\":[257],\"employeeNames\":\"ALSAFI  KAMAL\",\"requestedByName\":\"MAZOUAR\"}',51,'2025-08-29 18:42:13',NULL),(140,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',1,'2025-08-29 18:42:27',NULL),(141,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',3,'2025-08-29 18:42:27',NULL),(142,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',50,'2025-08-29 18:42:27',NULL),(143,'reopen_request','Demande de réouverture planning #300','{\"planningId\":300,\"reason\":\"\"}',51,'2025-08-29 18:42:27',NULL),(144,'employee_approved','Demande d\'employés approuvée: ALSAFI  KAMAL','{\"requestId\":\"23\",\"employeeIds\":[257]}',40,'2025-08-29 18:43:17','2025-08-29 18:58:18'),(145,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":300}',40,'2025-08-29 18:43:25','2025-08-29 18:58:18'),(146,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',1,'2025-08-29 18:59:58',NULL),(147,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',3,'2025-08-29 18:59:58',NULL),(148,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',50,'2025-08-29 18:59:58',NULL),(149,'reopen_request','Demande de réouverture planning #301','{\"planningId\":301,\"reason\":\"\"}',51,'2025-08-29 18:59:58',NULL),(150,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":25,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',1,'2025-08-29 19:00:14',NULL),(151,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":25,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',3,'2025-08-29 19:00:14',NULL),(152,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":25,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',50,'2025-08-29 19:00:14',NULL),(153,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":25,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',51,'2025-08-29 19:00:14',NULL),(154,'employee_approved','Demande d\'employés approuvée: AIT IDAR RACHID, ALSAFI  KAMAL','{\"requestId\":\"25\",\"employeeIds\":[196,257]}',42,'2025-08-29 19:00:42','2025-09-01 07:22:05'),(155,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',1,'2025-08-29 19:03:36',NULL),(156,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',3,'2025-08-29 19:03:36',NULL),(157,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',50,'2025-08-29 19:03:36',NULL),(158,'reopen_request','Demande de réouverture planning #295','{\"planningId\":295,\"reason\":\"\"}',51,'2025-08-29 19:03:36',NULL),(159,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":295}',29,'2025-08-29 19:05:06','2025-09-01 07:05:27'),(160,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":301}',42,'2025-08-29 19:05:09','2025-09-01 07:22:05'),(161,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',51,'2025-08-29 19:10:27',NULL),(162,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',50,'2025-08-29 19:10:27',NULL),(163,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',3,'2025-08-29 19:10:27',NULL),(164,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',1,'2025-08-29 19:10:27',NULL),(165,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":308}',46,'2025-08-29 19:10:45','2025-08-29 19:11:01'),(166,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',1,'2025-08-29 19:11:16',NULL),(167,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',50,'2025-08-29 19:11:16',NULL),(168,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',51,'2025-08-29 19:11:16',NULL),(169,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',3,'2025-08-29 19:11:16',NULL),(170,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',1,'2025-08-29 19:11:18',NULL),(171,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',3,'2025-08-29 19:11:18',NULL),(172,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',50,'2025-08-29 19:11:18',NULL),(173,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',51,'2025-08-29 19:11:18',NULL),(174,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',1,'2025-08-29 19:11:20',NULL),(175,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',3,'2025-08-29 19:11:20',NULL),(176,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',50,'2025-08-29 19:11:20',NULL),(177,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',51,'2025-08-29 19:11:20',NULL),(178,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',1,'2025-08-29 19:11:22',NULL),(179,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',3,'2025-08-29 19:11:22',NULL),(180,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',50,'2025-08-29 19:11:22',NULL),(181,'reopen_request','Demande de réouverture planning #308','{\"planningId\":308,\"reason\":\"\"}',51,'2025-08-29 19:11:22',NULL),(182,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":308}',46,'2025-08-29 19:11:48','2025-09-01 07:20:35'),(183,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',3,'2025-08-29 19:13:15',NULL),(184,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',51,'2025-08-29 19:13:15',NULL),(185,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',1,'2025-08-29 19:13:15',NULL),(186,'reopen_request','Demande de réouverture planning #306','{\"planningId\":306,\"reason\":\"\"}',50,'2025-08-29 19:13:15',NULL),(187,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',1,'2025-08-29 19:14:04',NULL),(188,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',3,'2025-08-29 19:14:04',NULL),(189,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',50,'2025-08-29 19:14:04',NULL),(190,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',51,'2025-08-29 19:14:04',NULL),(191,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":299}',42,'2025-08-29 19:19:24','2025-09-01 07:22:05'),(192,'reopen_approved','Réouverture approuvée pour S35/2025','{\"planningId\":306}',43,'2025-08-29 19:19:26',NULL),(193,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":27,\"employeeIds\":[146,196,203,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',3,'2025-09-01 07:14:09',NULL),(194,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":27,\"employeeIds\":[146,196,203,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',1,'2025-09-01 07:14:09',NULL),(195,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":27,\"employeeIds\":[146,196,203,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',50,'2025-09-01 07:14:09',NULL),(196,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":27,\"employeeIds\":[146,196,203,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',51,'2025-09-01 07:14:09',NULL),(197,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID, ANWAR AZIZ, ALSAFI  KAMAL','{\"requestId\":\"27\",\"employeeIds\":[146,196,203,257]}',29,'2025-09-01 07:14:28','2025-09-01 07:30:05'),(198,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":28,\"employeeIds\":[146,196,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',3,'2025-09-01 07:15:07',NULL),(199,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":28,\"employeeIds\":[146,196,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',50,'2025-09-01 07:15:07',NULL),(200,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":28,\"employeeIds\":[146,196,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',1,'2025-09-01 07:15:07',NULL),(201,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL (par FOUAJ)','{\"requestId\":28,\"employeeIds\":[146,196,257],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"FOUAJ\"}',51,'2025-09-01 07:15:07',NULL),(202,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID, ALSAFI  KAMAL','{\"requestId\":\"28\",\"employeeIds\":[146,196,257]}',29,'2025-09-01 07:15:19','2025-09-01 07:30:05'),(203,'employee_request','Demande d\'employés: ARICHI SOUAD, ALSAFI  KAMAL (par OUAKRIM 6 )','{\"requestId\":29,\"employeeIds\":[243,257],\"employeeNames\":\"ARICHI SOUAD, ALSAFI  KAMAL\",\"requestedByName\":\"OUAKRIM 6 \"}',1,'2025-09-01 07:20:32',NULL),(204,'employee_request','Demande d\'employés: ARICHI SOUAD, ALSAFI  KAMAL (par OUAKRIM 6 )','{\"requestId\":29,\"employeeIds\":[243,257],\"employeeNames\":\"ARICHI SOUAD, ALSAFI  KAMAL\",\"requestedByName\":\"OUAKRIM 6 \"}',50,'2025-09-01 07:20:32',NULL),(205,'employee_request','Demande d\'employés: ARICHI SOUAD, ALSAFI  KAMAL (par OUAKRIM 6 )','{\"requestId\":29,\"employeeIds\":[243,257],\"employeeNames\":\"ARICHI SOUAD, ALSAFI  KAMAL\",\"requestedByName\":\"OUAKRIM 6 \"}',3,'2025-09-01 07:20:32',NULL),(206,'employee_request','Demande d\'employés: ARICHI SOUAD, ALSAFI  KAMAL (par OUAKRIM 6 )','{\"requestId\":29,\"employeeIds\":[243,257],\"employeeNames\":\"ARICHI SOUAD, ALSAFI  KAMAL\",\"requestedByName\":\"OUAKRIM 6 \"}',51,'2025-09-01 07:20:32',NULL),(207,'employee_approved','Demande d\'employés approuvée: ARICHI SOUAD, ALSAFI  KAMAL','{\"requestId\":\"29\",\"employeeIds\":[243,257]}',46,'2025-09-01 07:20:53','2025-09-02 13:48:58'),(208,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',1,'2025-09-01 07:22:02',NULL),(209,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',3,'2025-09-01 07:22:02',NULL),(210,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',50,'2025-09-01 07:22:02',NULL),(211,'reopen_request','Demande de réouverture planning #299','{\"planningId\":299,\"reason\":\"\"}',51,'2025-09-01 07:22:02',NULL),(212,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":299}',42,'2025-09-01 07:22:20','2025-09-02 13:36:01'),(213,'reopen_request','Demande de réouverture planning #309','{\"planningId\":309,\"reason\":\"\"}',51,'2025-09-01 07:29:27',NULL),(214,'reopen_request','Demande de réouverture planning #309','{\"planningId\":309,\"reason\":\"\"}',1,'2025-09-01 07:29:27',NULL),(215,'reopen_request','Demande de réouverture planning #309','{\"planningId\":309,\"reason\":\"\"}',3,'2025-09-01 07:29:27',NULL),(216,'reopen_request','Demande de réouverture planning #309','{\"planningId\":309,\"reason\":\"\"}',50,'2025-09-01 07:29:27',NULL),(217,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":309}',29,'2025-09-01 07:29:37','2025-09-01 07:30:05'),(218,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID (par FOUAJ)','{\"requestId\":30,\"employeeIds\":[146,196,239],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID\",\"requestedByName\":\"FOUAJ\"}',1,'2025-09-01 07:30:01',NULL),(219,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID (par FOUAJ)','{\"requestId\":30,\"employeeIds\":[146,196,239],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID\",\"requestedByName\":\"FOUAJ\"}',50,'2025-09-01 07:30:01',NULL),(220,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID (par FOUAJ)','{\"requestId\":30,\"employeeIds\":[146,196,239],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID\",\"requestedByName\":\"FOUAJ\"}',51,'2025-09-01 07:30:01',NULL),(221,'employee_request','Demande d\'employés: ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID (par FOUAJ)','{\"requestId\":30,\"employeeIds\":[146,196,239],\"employeeNames\":\"ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID\",\"requestedByName\":\"FOUAJ\"}',3,'2025-09-01 07:30:01',NULL),(222,'employee_approved','Demande d\'employés approuvée: ADDAHR AYOUB, AIT IDAR RACHID, AITBRAHIM SAID','{\"requestId\":\"30\",\"employeeIds\":[146,196,239]}',29,'2025-09-01 07:30:23','2025-09-01 09:57:30'),(223,'employee_request','Demande d\'employés: ADLANI MOHAMED, AITBRAHIM SAID (par Ouakrim 3 )','{\"requestId\":31,\"employeeIds\":[198,239],\"employeeNames\":\"ADLANI MOHAMED, AITBRAHIM SAID\",\"requestedByName\":\"Ouakrim 3 \"}',1,'2025-09-01 07:32:46',NULL),(224,'employee_request','Demande d\'employés: ADLANI MOHAMED, AITBRAHIM SAID (par Ouakrim 3 )','{\"requestId\":31,\"employeeIds\":[198,239],\"employeeNames\":\"ADLANI MOHAMED, AITBRAHIM SAID\",\"requestedByName\":\"Ouakrim 3 \"}',3,'2025-09-01 07:32:46',NULL),(225,'employee_request','Demande d\'employés: ADLANI MOHAMED, AITBRAHIM SAID (par Ouakrim 3 )','{\"requestId\":31,\"employeeIds\":[198,239],\"employeeNames\":\"ADLANI MOHAMED, AITBRAHIM SAID\",\"requestedByName\":\"Ouakrim 3 \"}',50,'2025-09-01 07:32:46',NULL),(226,'employee_request','Demande d\'employés: ADLANI MOHAMED, AITBRAHIM SAID (par Ouakrim 3 )','{\"requestId\":31,\"employeeIds\":[198,239],\"employeeNames\":\"ADLANI MOHAMED, AITBRAHIM SAID\",\"requestedByName\":\"Ouakrim 3 \"}',51,'2025-09-01 07:32:46',NULL),(227,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":32,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',1,'2025-09-01 07:33:11',NULL),(228,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":32,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',3,'2025-09-01 07:33:11',NULL),(229,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":32,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',50,'2025-09-01 07:33:11',NULL),(230,'employee_request','Demande d\'employés: AIT IDAR RACHID, ALSAFI  KAMAL (par Ouakrim 3 )','{\"requestId\":32,\"employeeIds\":[196,257],\"employeeNames\":\"AIT IDAR RACHID, ALSAFI  KAMAL\",\"requestedByName\":\"Ouakrim 3 \"}',51,'2025-09-01 07:33:11',NULL),(231,'employee_approved','Demande d\'employés approuvée: AIT IDAR RACHID, ALSAFI  KAMAL','{\"requestId\":\"32\",\"employeeIds\":[196,257]}',42,'2025-09-01 07:33:19','2025-09-02 13:36:01'),(232,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":318}',27,'2025-09-01 08:13:25',NULL),(233,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":317}',40,'2025-09-01 08:13:49',NULL),(234,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":364}',29,'2025-09-01 14:11:36',NULL),(235,'employee_request','Demande d\'employés: ABDELKAML YOUSSEF (par OUAKRIM 6 )','{\"requestId\":33,\"employeeIds\":[255],\"employeeNames\":\"ABDELKAML YOUSSEF\",\"requestedByName\":\"OUAKRIM 6 \"}',1,'2025-09-02 13:49:18',NULL),(236,'employee_request','Demande d\'employés: ABDELKAML YOUSSEF (par OUAKRIM 6 )','{\"requestId\":33,\"employeeIds\":[255],\"employeeNames\":\"ABDELKAML YOUSSEF\",\"requestedByName\":\"OUAKRIM 6 \"}',51,'2025-09-02 13:49:18',NULL),(237,'employee_request','Demande d\'employés: ABDELKAML YOUSSEF (par OUAKRIM 6 )','{\"requestId\":33,\"employeeIds\":[255],\"employeeNames\":\"ABDELKAML YOUSSEF\",\"requestedByName\":\"OUAKRIM 6 \"}',50,'2025-09-02 13:49:18',NULL),(238,'employee_request','Demande d\'employés: ABDELKAML YOUSSEF (par OUAKRIM 6 )','{\"requestId\":33,\"employeeIds\":[255],\"employeeNames\":\"ABDELKAML YOUSSEF\",\"requestedByName\":\"OUAKRIM 6 \"}',3,'2025-09-02 13:49:18',NULL),(239,'employee_approved','Demande d\'employés approuvée: ABDELKAML YOUSSEF','{\"requestId\":\"33\",\"employeeIds\":[255]}',46,'2025-09-02 13:49:30',NULL),(240,'reopen_request','Demande de réouverture planning #366','{\"planningId\":366,\"reason\":\"\"}',1,'2025-09-03 07:26:00',NULL),(241,'reopen_request','Demande de réouverture planning #366','{\"planningId\":366,\"reason\":\"\"}',51,'2025-09-03 07:26:00',NULL),(242,'reopen_request','Demande de réouverture planning #366','{\"planningId\":366,\"reason\":\"\"}',3,'2025-09-03 07:26:00',NULL),(243,'reopen_request','Demande de réouverture planning #366','{\"planningId\":366,\"reason\":\"\"}',50,'2025-09-03 07:26:00',NULL),(244,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":366}',40,'2025-09-03 07:26:14',NULL),(245,'reopen_request','Demande de réouverture planning #367','{\"planningId\":367,\"reason\":\"\"}',3,'2025-09-03 07:26:48',NULL),(246,'reopen_request','Demande de réouverture planning #367','{\"planningId\":367,\"reason\":\"\"}',50,'2025-09-03 07:26:48',NULL),(247,'reopen_request','Demande de réouverture planning #367','{\"planningId\":367,\"reason\":\"\"}',1,'2025-09-03 07:26:48',NULL),(248,'reopen_request','Demande de réouverture planning #367','{\"planningId\":367,\"reason\":\"\"}',51,'2025-09-03 07:26:48',NULL),(249,'reopen_approved','Réouverture approuvée pour S36/2025','{\"planningId\":367}',46,'2025-09-03 07:27:16',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
-- Table structure for table `request_employees`
--

DROP TABLE IF EXISTS `request_employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `request_employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_request_employee` (`request_id`,`employee_id`),
  CONSTRAINT `fk_request_employees_request` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_employees`
--

LOCK TABLES `request_employees` WRITE;
/*!40000 ALTER TABLE `request_employees` DISABLE KEYS */;
INSERT INTO `request_employees` VALUES (1,2,181),(3,3,239),(2,3,257),(4,4,196),(5,5,198),(6,5,239),(7,6,196),(8,6,257),(9,7,196),(10,7,257),(12,8,146),(11,8,255),(14,11,196),(13,11,257),(16,12,146),(17,12,196),(18,12,198),(15,12,255),(20,13,196),(19,13,257),(22,14,146),(21,14,196),(24,15,135),(23,15,203),(26,16,146),(25,16,196),(27,17,243),(28,18,203),(29,18,257),(30,19,203),(31,20,146),(32,20,196),(33,21,257),(34,23,257),(35,25,196),(36,25,257),(39,27,146),(40,27,196),(37,27,203),(38,27,257),(42,28,146),(43,28,196),(41,28,257),(44,29,243),(45,29,257),(48,30,146),(47,30,196),(46,30,239),(50,31,198),(49,31,239),(51,32,196),(52,32,257),(53,33,255);
/*!40000 ALTER TABLE `request_employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('employee','general') NOT NULL,
  `message` text DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content`)),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `target_role` enum('administrateur','rh') DEFAULT NULL,
  `requested_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_requests_status` (`status`),
  KEY `idx_requests_type` (`type`),
  KEY `idx_requests_target_role` (`target_role`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (1,'general','test\n','{}','approved','administrateur',40,3,'2025-08-28 08:57:59','2025-08-28 08:58:15'),(2,'employee',NULL,'{\"employee_ids\":[181]}','approved','rh',41,3,'2025-08-28 09:02:42','2025-08-28 09:02:56'),(3,'employee',NULL,'{\"employee_ids\":[257,239]}','approved','rh',42,3,'2025-08-28 09:07:39','2025-08-28 09:07:55'),(4,'employee',NULL,'{\"employee_ids\":[196]}','approved','rh',40,1,'2025-08-28 09:09:38','2025-08-28 09:34:55'),(5,'employee',NULL,'{\"employee_ids\":[198,239]}','approved','rh',42,1,'2025-08-28 09:13:41','2025-08-28 09:14:20'),(6,'employee',NULL,'{\"employee_ids\":[196,257]}','approved','rh',46,3,'2025-08-28 09:18:23','2025-08-28 09:19:08'),(7,'employee',NULL,'{\"employee_ids\":[196,257]}','approved','rh',46,3,'2025-08-28 09:19:55','2025-08-28 09:20:08'),(8,'employee',NULL,'{\"employee_ids\":[255,146]}','approved','rh',28,3,'2025-08-28 09:57:07','2025-08-28 09:57:20'),(9,'general','test\n','{}','approved','administrateur',28,3,'2025-08-28 09:59:07','2025-08-28 09:59:31'),(10,'general','lllllllll\n','{}','approved','administrateur',29,3,'2025-08-28 13:59:28','2025-08-28 13:59:42'),(11,'employee',NULL,'{\"employee_ids\":[257,196]}','approved','rh',37,1,'2025-08-28 14:15:27','2025-08-28 14:15:40'),(12,'employee',NULL,'{\"employee_ids\":[255,146,196,198]}','approved','rh',29,1,'2025-08-28 14:54:24','2025-08-28 14:54:51'),(13,'employee',NULL,'{\"employee_ids\":[257,196]}','approved','rh',47,3,'2025-08-28 14:55:40','2025-08-28 14:56:07'),(14,'employee',NULL,'{\"employee_ids\":[196,146]}','approved','rh',42,3,'2025-08-29 17:49:58','2025-08-29 17:50:52'),(15,'employee',NULL,'{\"employee_ids\":[203,135]}','approved','rh',46,3,'2025-08-29 17:59:12','2025-08-29 17:59:32'),(16,'employee',NULL,'{\"employee_ids\":[196,146]}','approved','rh',28,3,'2025-08-29 18:02:29','2025-08-29 18:03:02'),(17,'employee',NULL,'{\"employee_ids\":[243]}','approved','rh',28,3,'2025-08-29 18:04:09','2025-08-29 18:05:27'),(18,'employee',NULL,'{\"employee_ids\":[203,257]}','rejected','rh',27,3,'2025-08-29 18:11:38','2025-08-29 18:12:33'),(19,'employee',NULL,'{\"employee_ids\":[203]}','approved','rh',46,3,'2025-08-29 18:21:51','2025-08-29 18:22:11'),(20,'employee',NULL,'{\"employee_ids\":[146,196]}','approved','rh',43,3,'2025-08-29 18:28:12','2025-08-29 18:29:09'),(21,'employee',NULL,'{\"employee_ids\":[257]}','approved','rh',47,3,'2025-08-29 18:33:44','2025-08-29 18:35:00'),(22,'general','sdfhjk','{}','approved','administrateur',47,3,'2025-08-29 18:33:59','2025-08-29 18:35:16'),(23,'employee',NULL,'{\"employee_ids\":[257]}','approved','rh',40,3,'2025-08-29 18:42:13','2025-08-29 18:43:17'),(24,'general','ddddddddddd','{}','rejected','administrateur',40,3,'2025-08-29 18:42:33','2025-08-29 18:43:10'),(25,'employee',NULL,'{\"employee_ids\":[196,257]}','approved','rh',42,3,'2025-08-29 19:00:14','2025-08-29 19:00:42'),(26,'general','asdf','{}','approved','administrateur',42,3,'2025-08-29 19:00:22','2025-08-29 19:00:44'),(27,'employee',NULL,'{\"employee_ids\":[203,257,146,196]}','approved','rh',29,1,'2025-09-01 07:14:09','2025-09-01 07:14:28'),(28,'employee',NULL,'{\"employee_ids\":[257,146,196]}','approved','rh',29,1,'2025-09-01 07:15:07','2025-09-01 07:15:19'),(29,'employee',NULL,'{\"employee_ids\":[243,257]}','approved','rh',46,1,'2025-09-01 07:20:32','2025-09-01 07:20:53'),(30,'employee',NULL,'{\"employee_ids\":[239,196,146]}','approved','rh',29,1,'2025-09-01 07:30:01','2025-09-01 07:30:23'),(31,'employee',NULL,'{\"employee_ids\":[239,198]}','rejected','rh',42,3,'2025-09-01 07:32:46','2025-09-01 07:32:55'),(32,'employee',NULL,'{\"employee_ids\":[196,257]}','approved','rh',42,3,'2025-09-01 07:33:11','2025-09-01 07:33:19'),(33,'employee',NULL,'{\"employee_ids\":[255]}','approved','rh',46,3,'2025-09-02 13:49:18','2025-09-02 13:49:30');
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
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
  `atelier_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Transport','admin@transport.ma','admin123','administrateur',NULL,'2025-08-02 22:33:17'),(3,'RH Manager','rh@transport.ma','rh1234','rh',NULL,'2025-08-02 19:26:29'),(27,'AIT BENTAAZA OMAR','chef.eole@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-03 17:22:07'),(28,'OUADIF KACEM','chef.veg@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-03 17:22:07'),(29,'FOUAJ','chef.indbtes@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-03 17:22:07'),(30,'EL HASSI OMAR','chef.qualite@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-03 17:22:07'),(37,'FARIH','chef.mpc1@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-12 14:34:07'),(39,'FALLAHI','chef.acc@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 07:19:26'),(40,'MAZOUAR','chef.expeditions@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 08:01:50'),(41,'EL-BETTAH','chef.technique@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 08:09:56'),(42,'Ouakrim 3 ','chef.infirmerie@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 08:19:00'),(43,'ZETA','chef.electrique@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 08:21:05'),(44,'Ouakrim 3 ','chef.anapec@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 08:28:54'),(45,'Ouakrim 5 ','chef.sansatelier@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 08:56:30'),(46,'OUAKRIM 6 ','chef.interimqualite@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 09:28:56'),(47,'BOUZARDA','chef.expeditions2@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 13:56:51'),(48,'OUALOUSSI','chef.qualite2@transport.ma','chef123','chef_d_atelier',NULL,'2025-08-14 13:58:42'),(49,'youssef Dirgham','chefaaa@email.com','youssef','chef_d_atelier',NULL,'2025-08-27 07:54:03'),(50,'Admin Transport','admin@test.com','admin123','administrateur',NULL,'2025-08-27 15:09:08'),(51,'RH Manager','rh@test.com','rh123','rh',NULL,'2025-08-27 15:09:08'),(52,'hhhhhhhhh','hhhH2@hhh.com','chef123','chef_d_atelier',NULL,'2025-08-28 15:36:16');
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
  `reopen_requested` tinyint(1) DEFAULT 0,
  `reopen_reason` text DEFAULT NULL,
  `reopened_at` timestamp NULL DEFAULT NULL,
  `reopened_by` int(11) DEFAULT NULL,
  `reopen_requested_by` int(11) DEFAULT NULL,
  `reopen_requested_at` timestamp NULL DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=369 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_plannings`
--

LOCK TABLES `weekly_plannings` WRITE;
/*!40000 ALTER TABLE `weekly_plannings` DISABLE KEYS */;
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

-- Dump completed on 2025-09-03  9:52:58
