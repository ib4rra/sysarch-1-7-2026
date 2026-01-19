-- Nangka MIS backup generated at 2026-01-19T14:50:10.426Z
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `person_id` (`person_id`),
  KEY `idx_date` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person_in_charge` (`person_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_logs` (`log_id`, `person_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `created_at`) VALUES
(1,1,'add','PWD',7,NULL,NULL,'2026-01-19 22:14:11.000'),
(2,1,'add','PWD',8,NULL,NULL,'2026-01-19 22:41:57.000');

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `announcement_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `notice_type` enum('General','Update','Emergency') DEFAULT 'General',
  `posted_by` int(11) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`announcement_id`),
  KEY `posted_by` (`posted_by`),
  KEY `idx_type` (`notice_type`),
  KEY `idx_created` (`created_at`),
  KEY `idx_event_date` (`event_date`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`announcement_id`, `title`, `content`, `notice_type`, `posted_by`, `event_date`, `start_time`, `end_time`, `created_at`, `updated_at`, `is_active`) VALUES
(1,'dddd','dsasss','Emergency',NULL,'2026-01-15 00:00:00.000','12:31:00','13:33:00','2026-01-19 22:31:30.000','2026-01-19 22:31:30.000',1),
(2,'May ayuda po','Bukas po ang ayuda','Emergency',NULL,'2026-01-22 00:00:00.000','02:38:00','16:40:00','2026-01-19 22:35:29.000','2026-01-19 22:35:29.000',1);

DROP TABLE IF EXISTS `beneficiary_claims`;
CREATE TABLE `beneficiary_claims` (
  `claim_id` int(11) NOT NULL AUTO_INCREMENT,
  `pwd_id` int(11) NOT NULL,
  `claim_type` varchar(100) NOT NULL,
  `claim_date` date NOT NULL,
  `claim_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','denied','processed') DEFAULT 'pending',
  `processed_by` int(11) DEFAULT NULL,
  `processing_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`claim_id`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_status` (`status`),
  KEY `idx_pwd` (`pwd_id`),
  CONSTRAINT `beneficiary_claims_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `beneficiary_claims_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cluster_area_definitions`;
CREATE TABLE `cluster_area_definitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cluster_no` int(11) NOT NULL,
  `area_letter` char(1) NOT NULL,
  `area_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cluster_area` (`cluster_no`,`area_letter`),
  KEY `idx_cluster` (`cluster_no`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cluster_area_definitions` (`id`, `cluster_no`, `area_letter`, `area_name`) VALUES
(1,1,'A','Nangka Centro'),
(2,1,'B','Old J.P. Rizal & J.P. Rizal'),
(3,1,'C','Marikit'),
(4,1,'D','Permaline'),
(5,2,'A','Twin River Subdivision & Bayabas Extension'),
(6,2,'B','Camacho Phase 1 & 2'),
(7,3,'A','Balubad Settlement Phase 1 & 2'),
(8,3,'B','PIDAMANA'),
(9,4,'A','Area 1, 2, 3, & 4'),
(10,4,'B','Twinville Subdivision part of Nangka'),
(11,5,'A','Greenland Phase 1 & 2'),
(12,5,'B','Ateneo Ville'),
(13,5,'C','Greenheights Phase 3 & 4'),
(14,5,'D','St. Benedict & Jaybee Subdivision'),
(15,6,'A','Libya Extension'),
(16,6,'B','Bagong Silang'),
(17,6,'C','St. Mary'),
(18,6,'D','Hampstead'),
(19,7,'A','Marikina Village'),
(20,7,'B','Tierra Vista'),
(21,7,'C','Anastacia'),
(22,7,'D','Mira Verde');

DROP TABLE IF EXISTS `disability_conditions`;
CREATE TABLE `disability_conditions` (
  `condition_id` int(11) NOT NULL AUTO_INCREMENT,
  `disability_id` int(11) NOT NULL,
  `condition_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`condition_id`),
  KEY `fk_disability_conditions_disability_type` (`disability_id`),
  CONSTRAINT `fk_disability_conditions_disability_type` FOREIGN KEY (`disability_id`) REFERENCES `disability_types` (`disability_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `disability_conditions` (`condition_id`, `disability_id`, `condition_name`, `created_at`) VALUES
(1,1,'Cataract','2026-01-15 08:00:00.000'),
(2,1,'Retinitis Pigmentosa','2026-01-15 08:00:00.000'),
(3,1,'Macular Degeneration','2026-01-15 08:00:00.000'),
(4,1,'Diabetic Retinopathy','2026-01-15 08:00:00.000'),
(5,1,'Color Blindness','2026-01-15 08:00:00.000'),
(6,2,'Complete Deafness','2026-01-15 08:00:00.000'),
(7,2,'Hard of Hearing','2026-01-15 08:00:00.000'),
(8,2,'Auditory Processing Disorder','2026-01-15 08:00:00.000'),
(9,2,'Tinnitus','2026-01-15 08:00:00.000'),
(10,2,'Conductive Hearing Loss','2026-01-15 08:00:00.000'),
(11,3,'Spinal Cord Injury','2026-01-15 08:00:00.000'),
(12,3,'Cerebral Palsy','2026-01-15 08:00:00.000'),
(13,3,'Muscular Dystrophy','2026-01-15 08:00:00.000'),
(14,3,'Amputation','2026-01-15 08:00:00.000'),
(15,3,'Arthritis','2026-01-15 08:00:00.000'),
(16,4,'Congenital / Inborn - Down Syndrome','2026-01-15 08:00:00.000'),
(17,4,'Autism Spectrum','2026-01-15 08:00:00.000'),
(18,4,'Fragile X Syndrome','2026-01-15 08:00:00.000'),
(19,4,'Williams Syndrome','2026-01-15 08:00:00.000'),
(20,4,'Intellectual Delay','2026-01-15 08:00:00.000'),
(21,5,'Depression','2026-01-15 08:00:00.000'),
(22,5,'Anxiety Disorder','2026-01-15 08:00:00.000'),
(23,5,'Bipolar Disorder','2026-01-15 08:00:00.000'),
(24,5,'Schizophrenia','2026-01-15 08:00:00.000'),
(25,5,'PTSD','2026-01-15 08:00:00.000'),
(26,6,'Stuttering','2026-01-15 08:00:00.000'),
(27,6,'Apraxia','2026-01-15 08:00:00.000'),
(28,6,'Dysarthria','2026-01-15 08:00:00.000'),
(29,6,'Aphasia','2026-01-15 08:00:00.000'),
(30,6,'Voice Disorder','2026-01-15 08:00:00.000'),
(31,7,'Deaf-Blindness','2026-01-15 08:00:00.000'),
(32,7,'Physical + Hearing','2026-01-15 08:00:00.000'),
(33,7,'Intellectual + Physical','2026-01-15 08:00:00.000'),
(34,7,'Visual + Speech','2026-01-15 08:00:00.000'),
(35,7,'Combined Conditions','2026-01-15 08:00:00.000');

DROP TABLE IF EXISTS `disability_types`;
CREATE TABLE `disability_types` (
  `disability_id` int(11) NOT NULL AUTO_INCREMENT,
  `disability_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`disability_id`),
  UNIQUE KEY `disability_name` (`disability_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `disability_types` (`disability_id`, `disability_name`, `description`, `created_at`) VALUES
(1,'Visual Impairment','Blindness or low vision','2026-01-10 07:42:45.000'),
(2,'Hearing Impairment','Deafness or hard of hearing','2026-01-10 07:42:45.000'),
(3,'Physical Disability','Mobility or physical limitations','2026-01-10 07:42:45.000'),
(4,'Intellectual Disability','Cognitive or developmental disability','2026-01-10 07:42:45.000'),
(5,'Psychosocial Disability','Mental health conditions','2026-01-10 07:42:45.000'),
(6,'Speech Disability','Speech or language impairment','2026-01-10 07:42:45.000'),
(7,'Multiple Disabilities','More than one type of disability','2026-01-10 07:42:45.000');

DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL AUTO_INCREMENT,
  `pwd_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(50) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`document_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_pwd` (`pwd_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `nangka_pwd_user`;
CREATE TABLE `nangka_pwd_user` (
  `pwd_id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) NOT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  `sex` enum('Male','Female','Other') NOT NULL,
  `birthdate` date NOT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Divorced','Widowed','Separated') NOT NULL,
  `hoa` varchar(255) DEFAULT NULL COMMENT 'Homeowners Association',
  `address` text NOT NULL,
  `barangay` varchar(100) DEFAULT 'Nangka',
  `contact_no` varchar(20) DEFAULT NULL,
  `tag_no` varchar(50) DEFAULT NULL COMMENT 'Manual tag number for PWD ID',
  `disability_type` int(11) DEFAULT NULL COMMENT 'Foreign key reference to disability_types table',
  `disability_cause` varchar(255) DEFAULT NULL COMMENT 'Cause of disability (e.g., Congenital - Birth Defect)',
  `registration_status` enum('Active','Pending','Deceased') DEFAULT 'Active',
  `guardian_name` varchar(255) DEFAULT NULL,
  `guardian_contact` varchar(20) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `cluster_group_no` int(11) DEFAULT 1,
  `cluster_group_area` char(1) DEFAULT NULL COMMENT 'Area letter (A, B, C, or D)',
  PRIMARY KEY (`pwd_id`),
  KEY `idx_name` (`firstname`,`lastname`),
  KEY `idx_contact` (`contact_no`),
  KEY `idx_active` (`is_active`),
  KEY `fk_nangka_disability_type` (`disability_type`),
  KEY `idx_registration_date` (`registration_date`),
  KEY `idx_cluster_group` (`cluster_group_no`),
  KEY `idx_cluster_year` (`cluster_group_no`,`registration_date`),
  CONSTRAINT `fk_nangka_disability_type` FOREIGN KEY (`disability_type`) REFERENCES `disability_types` (`disability_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `nangka_pwd_user` (`pwd_id`, `firstname`, `middlename`, `lastname`, `suffix`, `sex`, `birthdate`, `age`, `civil_status`, `hoa`, `address`, `barangay`, `contact_no`, `tag_no`, `disability_type`, `disability_cause`, `registration_status`, `guardian_name`, `guardian_contact`, `registration_date`, `updated_at`, `is_active`, `cluster_group_no`, `cluster_group_area`) VALUES
(1,'SHOBE','ROQUE','PIERRE',NULL,'Male','2004-08-22 00:00:00.000',21,'Single','PAROLA','0123 BARANGAY MARIKINA, NANGKA','Nangka','09167498805','001',3,'Congenital / Inborn - HEART CONDITION','Active','JUAN DELA CRUZ','09876543122','2026-01-10 09:45:18.000','2026-01-10 09:45:18.000',1,1,NULL),
(2,'SEBASTIAN','BOLANTE','ONNAGAN',NULL,'Male','2004-05-01 00:00:00.000',21,'Single','SAMPALOC','0123 BARANGAY MARIKINA, NANGKA','Nangka','09123456789','002',1,'Acquired - CATARATA','Active','JUAN DELA CRUZ','09876543122','2026-01-10 09:46:48.000','2026-01-10 09:46:48.000',1,1,NULL),
(3,'IVELL','JAY','IBARRA',NULL,'Male','2004-10-31 00:00:00.000',21,'Single','NANGKA','0123 BARANGAY MARIKINA, NANGKA','Nangka','09123456789','003',6,'Acquired - BULOL SA LETTER R','Active','JUAN DELA CRUZ','09876543122','2026-01-10 09:50:12.000','2026-01-10 09:50:12.000',1,2,NULL),
(4,'RAPH ','KENNETH ','ZAMBRONA',NULL,'Male','2004-12-18 00:00:00.000',21,'Single','TONDO','0123 BARANGAY MARIKINA, NANGKA','Nangka','09123456789','004',2,'Congenital / Inborn - CHICKEN FOX','Active','JUAN DELA CRUZ','09876543122','2026-01-10 09:51:18.000','2026-01-10 09:51:18.000',1,3,NULL),
(5,'JOSHUA','JAN','TRAQUEÑA',NULL,'Male','2004-01-01 00:00:00.000',22,'Single','QC','0123 BARANGAY MARIKINA, NANGKA','Nangka','09123456789','005',1,'Congenital / Inborn - catarata','Active','JUAN DELA CRUZ','09876543122','2026-01-10 09:53:50.000','2026-01-10 09:53:50.000',1,4,NULL),
(6,'JEREMY ','MUME','ALBUERA',NULL,'Male','2004-08-21 00:00:00.000',21,'Single','ANTIPOLO','0123 BARANGAY MARIKINA, NANGKA','Nangka','09123456789','006',6,'Congenital / Inborn - NORMAL','Active','JUAN DELA CRUZ','09876543122','2026-01-10 09:56:09.000','2026-01-10 09:56:09.000',1,5,NULL),
(7,'RAPH KENNETH','R.','ZAMBRONA','','Male','2002-12-31 00:00:00.000',23,'Single','sadsadsad','SADSAD','Nangka','09564763561','1',1,'Congenital / Inborn - Cataract','Active','ASDSAD','asdasd','2026-01-19 22:14:11.000','2026-01-19 22:14:25.000',1,1,'D');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `sender_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_read` (`is_read`,`recipient_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `person_in_charge` (`person_id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `person_in_charge`;
CREATE TABLE `person_in_charge` (
  `person_id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`person_id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `person_in_charge_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `person_in_charge` (`person_id`, `fullname`, `username`, `password_hash`, `role_id`, `position`, `contact_no`, `email`, `avatar_url`, `created_at`, `updated_at`, `last_login`, `is_active`) VALUES
(1,'admin_test','jeremume','$2b$10$hpwuYNQX2hF9pnlh4Z3nDuCeCTZIqTRcM89Ym5wjtjnVUFaXE22/K',2,'tester','12345679101','tester@gmail.com',NULL,'2026-01-10 08:28:41.000','2026-01-10 08:28:41.000',NULL,1),
(2,'super_admin','josh','$2b$10$TCohOtIZedQW8R1LOBLfZ.NLpE6MJc/RKLgk6UJtzNJMLtofHMpGy',1,NULL,NULL,NULL,NULL,'2026-01-19 22:19:51.000','2026-01-19 22:31:04.000',NULL,1);

DROP TABLE IF EXISTS `pwd_disabilities`;
CREATE TABLE `pwd_disabilities` (
  `pwd_disability_id` int(11) NOT NULL AUTO_INCREMENT,
  `pwd_id` int(11) NOT NULL,
  `disability_id` int(11) NOT NULL,
  `severity` enum('mild','moderate','severe') DEFAULT 'moderate',
  `date_identified` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`pwd_disability_id`),
  UNIQUE KEY `unique_pwd_disability` (`pwd_id`,`disability_id`),
  KEY `fk_pwd_disability_type` (`disability_id`),
  CONSTRAINT `fk_pwd_disability_pwd` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pwd_disability_type` FOREIGN KEY (`disability_id`) REFERENCES `disability_types` (`disability_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `pwd_mis`;
CREATE TABLE `pwd_mis` (
  `pwd_mis_id` int(11) NOT NULL AUTO_INCREMENT,
  `pwd_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `registration_status` enum('registered','pending','rejected','archived') DEFAULT 'pending',
  `date_processed` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`pwd_mis_id`),
  UNIQUE KEY `unique_pwd_registration` (`pwd_id`,`person_id`),
  KEY `person_id` (`person_id`),
  KEY `idx_status` (`registration_status`),
  CONSTRAINT `pwd_mis_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `pwd_mis_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person_in_charge` (`person_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pwd_mis` (`pwd_mis_id`, `pwd_id`, `person_id`, `registration_status`, `date_processed`, `notes`) VALUES
(1,1,1,'registered','2026-01-10 09:45:18.000',NULL),
(2,2,1,'registered','2026-01-10 09:46:48.000',NULL),
(3,3,1,'registered','2026-01-10 09:50:12.000',NULL),
(4,4,1,'registered','2026-01-10 09:51:18.000',NULL),
(5,5,1,'registered','2026-01-10 09:53:50.000',NULL),
(6,6,1,'registered','2026-01-10 09:56:09.000',NULL),
(7,7,1,'registered','2026-01-19 22:14:11.000',NULL);

DROP TABLE IF EXISTS `pwd_user_login`;
CREATE TABLE `pwd_user_login` (
  `login_id` int(11) NOT NULL AUTO_INCREMENT,
  `pwd_id` varchar(50) NOT NULL,
  `numeric_pwd_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `qr_image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`login_id`),
  UNIQUE KEY `uk_pwd_login` (`pwd_id`),
  UNIQUE KEY `uk_pwd_id_formatted` (`pwd_id`),
  KEY `idx_numeric_pwd_id` (`numeric_pwd_id`),
  CONSTRAINT `fk_login_pwd_numeric` FOREIGN KEY (`numeric_pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pwd_user_login` (`login_id`, `pwd_id`, `numeric_pwd_id`, `password_hash`, `last_login`, `is_active`, `created_at`, `updated_at`, `qr_image_path`) VALUES
(1,'PWD-MRK-CL01-2026-0002',1,'$2b$10$sl3lvG6cBtt40OryBMwJN.mbjS46NjMxj3xBmOF8IBv7tiwvKV9vW','2026-01-10 09:45:38.000',1,'2026-01-10 09:45:18.000','2026-01-19 22:42:48.000','uploads/qr/qr-PWD-MRK-CL01-2026-0002.png'),
(2,'PWD-MRK-CL01-2026-0003',2,'$2b$10$kjQrMUSRnOaR0AXMYgVJ8OT8NBTpkEMrAn1YNGqRBEXh.3QGDFhWu',NULL,1,'2026-01-10 09:46:48.000','2026-01-10 09:46:48.000',NULL),
(3,'PWD-MRK-CL02-2026-0002',3,'$2b$10$EcXr/yXRC/rO53V5DJXAIe54OfylxqgLdGcuNnsxQdlFzK7/gAUIS',NULL,1,'2026-01-10 09:50:12.000','2026-01-10 09:50:12.000',NULL),
(4,'PWD-MRK-CL03-2026-0002',4,'$2b$10$k7iE2TONOkcCqZu2G2Ro9Om14StYTZtxMl827yUafn1sJ0fcRaI1i',NULL,1,'2026-01-10 09:51:19.000','2026-01-10 09:51:19.000',NULL),
(5,'PWD-MRK-CL04-2026-0002',5,'$2b$10$iKkEXEmUyejNMp9XgDwkAeEOY64E9zHzEfoujlYcb9sWU85mfnTsi',NULL,1,'2026-01-10 09:53:50.000','2026-01-10 09:53:50.000',NULL),
(6,'PWD-MRK-CL05-2026-0002',6,'$2b$10$vhXf0KqGUV8Pbf7ovV8rqO8JBKI2UrGlKb53Zk/ElXQ8mc0RtnOOG',NULL,1,'2026-01-10 09:56:09.000','2026-01-10 09:56:09.000',NULL),
(7,'1',7,'$2b$10$rVxUCfhgR/vUex8rPdyA6.Z0AtmRO39tdJkn59e3auZCTkPumbB0q',NULL,1,'2026-01-19 22:14:11.000','2026-01-19 22:14:11.000',NULL);

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `created_at`) VALUES
(1,'super_admin','System administrator - manages admin accounts and system settings','2026-01-10 07:42:45.000'),
(2,'admin','Person-in-Charge - manages PWD records and staff operations','2026-01-10 07:42:45.000'),
(3,'pwd_user','PWD User - limited access to view own registration information','2026-01-10 07:42:45.000');

SET FOREIGN_KEY_CHECKS=1;
