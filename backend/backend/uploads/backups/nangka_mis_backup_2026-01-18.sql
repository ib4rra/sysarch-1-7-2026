-- Nangka MIS backup generated at 2026-01-18T13:43:54.916Z
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
  KEY `idx_date` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_logs` (`log_id`, `person_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `created_at`) VALUES
(1,1,'add','PWD',7,NULL,NULL,'2026-01-15 22:11:40.000'),
(2,1,'add','PWD',8,NULL,NULL,'2026-01-15 22:15:02.000'),
(3,1,'add','PWD',9,NULL,NULL,'2026-01-15 22:23:25.000'),
(4,1,'add','PWD',10,NULL,NULL,'2026-01-15 22:29:54.000'),
(5,1,'add','PWD',11,NULL,NULL,'2026-01-15 23:18:30.000'),
(6,1,'add','PWD',12,NULL,NULL,'2026-01-15 23:19:43.000'),
(7,1,'add','PWD',13,NULL,NULL,'2026-01-17 18:27:23.000'),
(8,1,'add','PWD',14,NULL,NULL,'2026-01-17 18:30:09.000'),
(9,1,'add','PWD',15,NULL,NULL,'2026-01-17 18:34:15.000'),
(10,1,'add','PWD',17,NULL,NULL,'2026-01-18 16:57:56.000'),
(11,1,'add','PWD',18,NULL,NULL,'2026-01-18 16:59:13.000'),
(12,1,'add','PWD',20,NULL,NULL,'2026-01-18 17:00:42.000'),
(13,1,'add','PWD',22,NULL,NULL,'2026-01-18 17:13:18.000'),
(14,1,'add','PWD',23,NULL,NULL,'2026-01-18 17:13:31.000'),
(15,1,'add','PWD',27,NULL,NULL,'2026-01-18 17:21:15.000'),
(16,1,'add','PWD',28,NULL,NULL,'2026-01-18 17:21:16.000'),
(17,1,'add','PWD',29,NULL,NULL,'2026-01-18 17:22:27.000'),
(18,1,'add','PWD',30,NULL,NULL,'2026-01-18 17:55:50.000'),
(19,1,'add','PWD',31,NULL,NULL,'2026-01-18 18:18:51.000'),
(20,1,'add','PWD',32,NULL,NULL,'2026-01-18 18:41:21.000'),
(21,1,'add','PWD',33,NULL,NULL,'2026-01-18 18:41:24.000'),
(22,1,'add','PWD',34,NULL,NULL,'2026-01-18 18:42:20.000'),
(23,1,'add','PWD',35,NULL,NULL,'2026-01-18 18:56:41.000'),
(24,1,'add','PWD',36,NULL,NULL,'2026-01-18 20:04:37.000'),
(25,1,'add','PWD',37,NULL,NULL,'2026-01-18 20:06:06.000'),
(26,1,'add','PWD',38,NULL,NULL,'2026-01-18 20:21:50.000'),
(27,1,'add','PWD',39,NULL,NULL,'2026-01-18 20:24:32.000'),
(28,1,'add','PWD',40,NULL,NULL,'2026-01-18 20:26:44.000'),
(29,1,'add','PWD',41,NULL,NULL,'2026-01-18 20:49:42.000');

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
  KEY `idx_event_date` (`event_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`announcement_id`, `title`, `content`, `notice_type`, `posted_by`, `event_date`, `start_time`, `end_time`, `created_at`, `updated_at`, `is_active`) VALUES
(1,'aadas','asdsad','General',NULL,'2221-12-21 00:00:00.000','07:24:00','22:23:00','2026-01-17 19:23:03.000','2026-01-17 19:23:03.000',1);

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
  KEY `idx_pwd` (`pwd_id`)
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
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cluster_area_definitions` (`id`, `cluster_no`, `area_letter`, `area_name`) VALUES
(1,1,'A','Poblacion East'),
(2,1,'B','Poblacion West'),
(3,1,'C','Mira Verde'),
(4,1,'D','Upper Nangka'),
(5,2,'A','Twin River Subdivision & Bayabas Extension'),
(6,2,'B','Barangay Hall Area'),
(7,2,'C','Bulihan'),
(8,2,'D','Sagana'),
(9,3,'A','Bangkal'),
(10,3,'B','Malanday East'),
(11,3,'C','Malanday West'),
(12,4,'A','Concepcion'),
(13,4,'B','Taytayan'),
(14,4,'C','San Jose'),
(15,5,'A','Nangka North'),
(16,5,'B','Nangka South'),
(17,6,'A','Filemon Area'),
(18,6,'B','Cristal Area'),
(19,6,'C','De Luna'),
(20,6,'D','Anastacia'),
(21,7,'A','Industrial Area'),
(22,7,'B','Commercial Area');

DROP TABLE IF EXISTS `disability_conditions`;
CREATE TABLE `disability_conditions` (
  `condition_id` int(11) NOT NULL,
  `disability_id` int(11) NOT NULL,
  `condition_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  KEY `disability_id` (`disability_id`),
  CONSTRAINT `disability_conditions_ibfk_1` FOREIGN KEY (`disability_id`) REFERENCES `disability_types` (`disability_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `disability_conditions` (`condition_id`, `disability_id`, `condition_name`, `created_at`) VALUES
(0,1,'Cataract','2026-01-15 00:00:00.000'),
(0,1,'Retinitis Pigmentosa','2026-01-15 00:00:00.000'),
(0,1,'Macular Degeneration','2026-01-15 00:00:00.000'),
(0,1,'Diabetic Retinopathy','2026-01-15 00:00:00.000'),
(0,1,'Color Blindness','2026-01-15 00:00:00.000'),
(0,2,'Complete Deafness','2026-01-15 00:00:00.000'),
(0,2,'Hard of Hearing','2026-01-15 00:00:00.000'),
(0,2,'Auditory Processing Disorder','2026-01-15 00:00:00.000'),
(0,2,'Tinnitus','2026-01-15 00:00:00.000'),
(0,2,'Conductive Hearing Loss','2026-01-15 00:00:00.000'),
(0,3,'Spinal Cord Injury','2026-01-15 00:00:00.000'),
(0,3,'Cerebral Palsy','2026-01-15 00:00:00.000'),
(0,3,'Muscular Dystrophy','2026-01-15 00:00:00.000'),
(0,3,'Amputation','2026-01-15 00:00:00.000'),
(0,3,'Arthritis','2026-01-15 00:00:00.000'),
(0,4,'Down Syndrome','2026-01-15 00:00:00.000'),
(0,4,'Autism Spectrum','2026-01-15 00:00:00.000'),
(0,4,'Fragile X Syndrome','2026-01-15 00:00:00.000'),
(0,4,'Williams Syndrome','2026-01-15 00:00:00.000'),
(0,4,'Intellectual Delay','2026-01-15 00:00:00.000'),
(0,5,'Depression','2026-01-15 00:00:00.000'),
(0,5,'Anxiety Disorder','2026-01-15 00:00:00.000'),
(0,5,'Bipolar Disorder','2026-01-15 00:00:00.000'),
(0,5,'Schizophrenia','2026-01-15 00:00:00.000'),
(0,5,'PTSD','2026-01-15 00:00:00.000'),
(0,6,'Stuttering','2026-01-15 00:00:00.000'),
(0,6,'Apraxia','2026-01-15 00:00:00.000'),
(0,6,'Dysarthria','2026-01-15 00:00:00.000'),
(0,6,'Aphasia','2026-01-15 00:00:00.000'),
(0,6,'Voice Disorder','2026-01-15 00:00:00.000'),
(0,7,'Deaf-Blindness','2026-01-15 00:00:00.000'),
(0,7,'Physical + Hearing','2026-01-15 00:00:00.000'),
(0,7,'Intellectual + Physical','2026-01-15 00:00:00.000'),
(0,7,'Visual + Speech','2026-01-15 00:00:00.000'),
(0,7,'Combined Conditions','2026-01-15 00:00:00.000');

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
  KEY `idx_pwd` (`pwd_id`)
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
  `registration_status` enum('Active','Pending','Inactive','Deceased') DEFAULT 'Active' COMMENT 'PWD registration status',
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
  KEY `idx_cluster_year` (`cluster_group_no`,`registration_date`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `nangka_pwd_user` (`pwd_id`, `firstname`, `middlename`, `lastname`, `suffix`, `sex`, `birthdate`, `age`, `civil_status`, `hoa`, `address`, `barangay`, `contact_no`, `tag_no`, `disability_type`, `disability_cause`, `registration_status`, `guardian_name`, `guardian_contact`, `registration_date`, `updated_at`, `is_active`, `cluster_group_no`, `cluster_group_area`) VALUES
(27,'GAREN','MUME','SANTIAGO','','Male','2002-12-27 00:00:00.000',23,'Single','dsadadsad','ASDASDASD','Nangka','098625765622','12',2,'Congenital / Inborn - Auditory Processing Disorder','Pending','ASDASD','asdasd','2026-01-18 17:21:15.000','2026-01-18 17:44:26.000',1,1,NULL),
(28,'YASUO','VS','ZED','DR.','Male','2001-12-31 00:00:00.000',24,'Single','121','SITIO TIBAGAN BRGY. CUPANG','Nangka','09123456712','51',3,'Acquired - Amputation','Active','SDSAD','sdsad','2026-01-18 17:21:16.000','2026-01-18 17:21:16.000',1,2,NULL),
(29,'DINGDONG','R.','MARTIN','','Male','2026-01-04 00:00:00.000',0,'Single','Baguio','271 HEV ABI DOWNTOWN, Q.C','Nangka','0963727341','11',6,'Congenital / Inborn - Stuttering','Deceased','IVELL MONGGI','0949442456','2026-01-18 17:22:27.000','2026-01-18 18:18:18.000',1,1,NULL),
(30,'LANCE ','MAIN','MARTIN','','Male','2003-12-21 00:00:00.000',22,'Single','sadsadsad','SADSADASD','Nangka','0963727341','11',2,'Congenital / Inborn - Complete Deafness','Deceased','SADASD','asdasdad','2026-01-18 17:55:50.000','2026-01-18 18:18:10.000',1,1,NULL),
(31,'DINGDONG','MUME','SANTIAGO','','Male','2000-12-30 00:00:00.000',25,'Single','dasdsad','ASDSADA','Nangka','09123456789','111',2,'Congenital / Inborn - Hard of Hearing','Active','SADSAD','asdsadas','2026-01-18 18:18:51.000','2026-01-18 18:40:39.000',1,1,NULL),
(32,'JEREMY ','SANTOS ','MARTIN',NULL,'Male','2005-02-01 00:00:00.000',20,'Single','vcxvxvcxv','CXVCXVCXVCV','Nangka','09672456566','56',3,'Congenital / Inborn - Cerebral Palsy','Deceased','XCVVCXVXC','vcxvcxvv','2026-01-18 18:41:21.000','2026-01-18 18:41:21.000',1,1,NULL),
(33,'DUMMY','W','DUMMY',NULL,'Female','2000-01-23 00:00:00.000',25,'Single','dsadsd','DUMMY','Nangka','0986257641','122',2,'Congenital / Inborn - Complete Deafness','Deceased','DASDASD','asdsadas','2026-01-18 18:41:24.000','2026-01-18 18:41:24.000',1,2,NULL),
(34,'BOMBA','R.','CLAT',NULL,'Male','1991-03-01 00:00:00.000',34,'Single','Baguio','271 HEV ABI DOWNTOWN, Q.C','Nangka','0963727341','51',6,'Acquired - Aphasia','Active','IVELL MONGGI','0949442456','2026-01-18 18:42:19.000','2026-01-18 18:42:19.000',1,1,NULL),
(35,'DINGDONG','MUME','ZAMBRONA',NULL,'Male','2020-01-01 00:00:00.000',6,'Single','sadsadsad','DSFSDFSDF','Nangka','0965467654132','21',1,'Congenital / Inborn - Cataract','Deceased','SDFDSF','sadasdasd','2026-01-18 18:56:41.000','2026-01-18 18:56:41.000',1,1,NULL),
(36,'BORAT','W','SAMAR',NULL,'Female','1993-02-01 00:00:00.000',32,'Single','dsadsd','MANILA, PHILIPPINES','Nangka','09123456721','32',2,'Congenital / Inborn - Hard of Hearing','Active','DASDASD','asdsadas','2026-01-18 20:04:36.000','2026-01-18 20:04:36.000',1,4,NULL),
(37,'HARRY','BALIW','ROQUE',NULL,'Female','1990-01-01 00:00:00.000',36,'Single','Baguio','271 HEV ABI DOWNTOWN, Q.C','Nangka','09123421321','35',6,'Acquired - Cataract','Active','IVELL MONGGI','0949442456','2026-01-18 20:06:06.000','2026-01-18 20:06:06.000',1,4,NULL),
(38,'NUNU','MUNDO','JALJALANI',NULL,'Male','2002-12-12 00:00:00.000',23,'Single','HOA 6','TAGA BABA','Nangka','09999923','13',1,'Acquired - Cataract','Active','HAHAHA','HAHAHA','2026-01-18 20:21:50.000','2026-01-18 20:21:50.000',1,2,NULL),
(39,'NANANA','NNONOO','NENENE','','Male','1997-01-11 00:00:00.000',29,'Single','HOA 7','TAGA TAAS','Nangka','0922323112','2',4,'Acquired - Autism Spectrum','Active','NBNBN','BNBN','2026-01-18 20:24:32.000','2026-01-18 21:34:34.000',1,2,'A'),
(40,'ERIC','R','DELOS REYES','','Male','1982-12-10 00:00:00.000',43,'Single','asdasd','ASDA','Nangka','0995312312','02',3,'Congenital / Inborn - Amputation','Active','ASDA','asd','2026-01-18 20:26:44.000','2026-01-18 21:27:38.000',1,1,'D'),
(41,'JEREMY ','R.','SANTIAGO','','Male','2000-12-28 00:00:00.000',25,'Single','sadada','DASDASDA','Nangka','09564763561','34',2,'Congenital / Inborn - Conductive Hearing Loss','Deceased','ASDASDA','sdadasdasd','2026-01-18 20:49:42.000','2026-01-18 21:41:14.000',1,1,'B');

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
  KEY `idx_read` (`is_read`,`recipient_id`)
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
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `person_in_charge` (`person_id`, `fullname`, `username`, `password_hash`, `role_id`, `position`, `contact_no`, `email`, `avatar_url`, `created_at`, `updated_at`, `last_login`, `is_active`) VALUES
(1,'admin_test','jeremume','$2b$10$hpwuYNQX2hF9pnlh4Z3nDuCeCTZIqTRcM89Ym5wjtjnVUFaXE22/K',2,'tester','12345679101','tester@gmail.com',NULL,'2026-01-10 08:28:41.000','2026-01-10 08:28:41.000',NULL,1),
(2,'Super_admin','Super_admin','$2b$10$UivGVk/PrpJbgZh1VEqq6.VK9ep6PHr9fNpTH/llbVwWPtgkyS/32',1,NULL,NULL,NULL,NULL,'2026-01-18 18:44:03.000','2026-01-18 18:47:05.000',NULL,1);

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
  KEY `fk_pwd_disability_type` (`disability_id`)
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
  KEY `idx_status` (`registration_status`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pwd_mis` (`pwd_mis_id`, `pwd_id`, `person_id`, `registration_status`, `date_processed`, `notes`) VALUES
(26,26,1,'registered','2026-01-18 17:19:03.000',NULL),
(27,27,1,'registered','2026-01-18 17:21:15.000',NULL),
(28,28,1,'registered','2026-01-18 17:21:16.000',NULL),
(29,29,1,'registered','2026-01-18 17:22:27.000',NULL),
(30,30,1,'registered','2026-01-18 17:55:50.000',NULL),
(31,31,1,'registered','2026-01-18 18:18:51.000',NULL),
(32,32,1,'registered','2026-01-18 18:41:21.000',NULL),
(33,33,1,'registered','2026-01-18 18:41:24.000',NULL),
(34,34,1,'registered','2026-01-18 18:42:19.000',NULL),
(35,35,1,'registered','2026-01-18 18:56:41.000',NULL),
(36,36,1,'registered','2026-01-18 20:04:36.000',NULL),
(37,37,1,'registered','2026-01-18 20:06:06.000',NULL),
(38,38,1,'registered','2026-01-18 20:21:50.000',NULL),
(39,39,1,'registered','2026-01-18 20:24:32.000',NULL),
(40,40,1,'registered','2026-01-18 20:26:44.000',NULL),
(41,41,1,'registered','2026-01-18 20:49:42.000',NULL);

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
  KEY `idx_numeric_pwd_id` (`numeric_pwd_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pwd_user_login` (`login_id`, `pwd_id`, `numeric_pwd_id`, `password_hash`, `last_login`, `is_active`, `created_at`, `updated_at`, `qr_image_path`) VALUES
(27,'PWD-MRK-CL01-2026-0002',27,'$2b$10$rCa9TuTL7HrSKiqRNbnpIea9hfVauKa9JacWOztCz1PjoOzQRArim',NULL,1,'2026-01-18 17:21:15.000','2026-01-18 17:21:15.000',NULL),
(28,'PWD-MRK-CL02-2026-0002',28,'$2b$10$O/sdQUhCW8cbrygmuhkRbOaG.BjmyQ3bTdv9Ib5DsD9djk4o5AzHW',NULL,1,'2026-01-18 17:21:16.000','2026-01-18 17:21:44.000','uploads/qr/qr-PWD-MRK-CL02-2026-0002.png'),
(29,'PWD-MRK-CL01-2026-0003',29,'$2b$10$IO5lOwjrzYOGlngC7XdBu.u.cboo5OkngUSGvVQ/0zAWF0Mso4G1W',NULL,1,'2026-01-18 17:22:27.000','2026-01-18 17:24:43.000','uploads/qr/qr-PWD-MRK-CL01-2026-0003.png'),
(30,'PWD-MRK-CL01-2026-0004',30,'$2b$10$Gli3.n9D1MqhCZK95pamV.GDUh0ZhYpizq0aPBwocsvkmPW4vE9xe',NULL,1,'2026-01-18 17:55:50.000','2026-01-18 17:55:50.000',NULL),
(31,'PWD-MRK-CL01-2026-0005',31,'$2b$10$XusP5ZyOlY3IMfH5niczyurR7dxruiWcm3yYgXBtWhHR37zFBK/82',NULL,1,'2026-01-18 18:18:51.000','2026-01-18 20:40:26.000','uploads/qr/qr-PWD-MRK-CL01-2026-0005.png'),
(32,'PWD-MRK-CL01-2026-0006',32,'$2b$10$EOs.icNaixJgwbXdYUjQ.e.nVQLrbimaDlWAQOlL2JU.u.EzzYflC',NULL,1,'2026-01-18 18:41:21.000','2026-01-18 18:41:21.000',NULL),
(33,'PWD-MRK-CL02-2026-0003',33,'$2b$10$a.x6B/A3XTRy6euy8x4MJ.bWD/mhUHhUJuuhaD927Syjn2eK4iCZ6',NULL,1,'2026-01-18 18:41:24.000','2026-01-18 18:41:24.000',NULL),
(34,'PWD-MRK-CL01-2026-0007',34,'$2b$10$KmCHjc/ZWzKi7qN/RvVdTeUveMO1aIsBtJpsPWo4G8xa9aJmRWBQW',NULL,1,'2026-01-18 18:42:20.000','2026-01-18 18:42:20.000',NULL),
(35,'PWD-MRK-CL01-2026-0008',35,'$2b$10$orN8PaDaaJL2XpJ3S57ruehpT74UQ2ohVgcoUiliPUwfzGWlUVG62',NULL,1,'2026-01-18 18:56:41.000','2026-01-18 19:07:09.000','uploads/qr/qr-PWD-MRK-CL01-2026-0008.png'),
(36,'PWD-MRK-CL04-2026-0002',36,'$2b$10$uYhqrJLO3JwB4wcE3x8SYeaijNczuCm2ybDqO5kcRg2qcc3AwSeou','2026-01-18 21:32:03.000',1,'2026-01-18 20:04:37.000','2026-01-18 21:32:03.000',NULL),
(37,'PWD-MRK-CL04-2026-0003',37,'$2b$10$ottSlAYXOvNKAKH2gWbTjeQRwQcFhZE0Qu0HW847s.8fXGqx9Q7Ze',NULL,1,'2026-01-18 20:06:06.000','2026-01-18 20:06:06.000',NULL),
(38,'PWD-MRK-CL02-2026-0004',38,'$2b$10$JyCl/f65tE3Z.4A8oQ.XNu8EiTTSofYMTS4Twqk9DHsKFg06VuqbS',NULL,1,'2026-01-18 20:21:50.000','2026-01-18 20:21:50.000',NULL),
(39,'552-221',39,'$2b$10$wZzqmWj1ajflnffip2R6xuWV2V6pagv9/QGMlsm5CjQALVn3dIJES',NULL,1,'2026-01-18 20:24:32.000','2026-01-18 20:24:37.000','uploads/qr/qr-552-221.png'),
(40,'13-7402-000-0600880',40,'$2b$10$spYSZPwjGkIbEWcuKvtfmur8vKMmikbvpZiJ7oxiitH2Y22uhdYJy',NULL,1,'2026-01-18 20:26:44.000','2026-01-18 20:26:49.000','uploads/qr/qr-13-7402-000-0600880.png'),
(41,'334-334',41,'$2b$10$JYtwgvPw3RFuFsijcQn2JO5nvWvVWJO5ZnFE4mAVKanAW.IbqF3BG',NULL,1,'2026-01-18 20:49:42.000','2026-01-18 21:25:29.000','uploads/qr/qr-334-334.png');

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
