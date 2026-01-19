-- Nangka MIS backup generated at 2026-01-12T07:25:32.395Z
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `person_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person_in_charge` (`person_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `activity_logs` (`log_id`, `person_id`, `action`, `details`, `created_at`, `entity_type`, `entity_id`) VALUES
(1,1,'CREATE','PWD-2024-001 (Jerome Santos)','2026-01-11 20:55:36.000',NULL,NULL),
(2,2,'EDIT','PWD-2024-042 (New Record)','2026-01-11 20:55:36.000',NULL,NULL),
(3,1,'DELETE','PWD-2020-004 (Expired)','2026-01-11 20:55:36.000',NULL,NULL),
(4,1,'SETTINGS','Updated System Logo','2026-01-11 20:55:36.000',NULL,NULL),
(5,2,'LOGIN','System Access','2026-01-11 20:55:36.000',NULL,NULL),
(6,2,'EXPORT','Downloaded CSV Report','2026-01-11 20:55:36.000',NULL,NULL),
(7,NULL,'delete','Deleted record: {\"name\":\"RAPH  ZAMBRONA\",\"id\":\"PWD-MRK-CL01-2026-0003\"}','2026-01-12 10:41:42.000','PWD',59),
(8,1,'add',NULL,'2026-01-12 10:54:15.000','PWD',60),
(9,NULL,'delete','Deleted record: {\"name\":\"SEBASTIAN ONNAGAN\",\"id\":\"PWD-MRK-CL01-2026-0002\"}','2026-01-12 11:00:49.000','PWD',58),
(10,NULL,'edit','Changed fields: userId, registryNumber, firstName, lastName, middleName, suffix, gender, dateOfBirth, civilStatus, hoa, address, contactNumber, emergencyContact, emergencyNumber, disabilityType, disabilityCause, registrationStatus, clusterGroupNo','2026-01-12 11:02:08.000','PWD',60),
(11,1,'add',NULL,'2026-01-12 14:36:30.000','PWD',61),
(12,NULL,'delete','Deleted record: {\"name\":\"JEREMY ALBUERA\",\"id\":\"PWD-MRK-CL02-2026-0002\"}','2026-01-12 14:50:19.000','PWD',61),
(13,1,'add',NULL,'2026-01-12 14:59:38.000','PWD',62),
(14,NULL,'edit','Changed fields: userId, registryNumber, firstName, lastName, middleName, suffix, gender, dateOfBirth, civilStatus, hoa, address, contactNumber, emergencyContact, emergencyNumber, disabilityType, disabilityCause, registrationStatus, clusterGroupNo','2026-01-12 15:21:25.000','PWD',62);

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`announcement_id`, `title`, `content`, `notice_type`, `posted_by`, `event_date`, `start_time`, `end_time`, `created_at`, `updated_at`, `is_active`) VALUES
(9,'Community Clean Up','Extra Description','General',NULL,'2026-01-12 00:00:00.000','17:48:00',NULL,'2026-01-12 14:48:37.000','2026-01-12 14:48:37.000',1);

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_name_snapshot` varchar(100) DEFAULT NULL,
  `action_type` varchar(20) NOT NULL,
  `target_details` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `audit_logs` (`log_id`, `user_id`, `user_name_snapshot`, `action_type`, `target_details`, `timestamp`) VALUES
(1,1,'Admin','EDIT','PWD-2024-001 (Jerome Santos)','2024-03-15 10:42:00.000'),
(2,2,'Staff_Maria','CREATE','PWD-2024-042 (New Record)','2024-03-15 09:15:00.000'),
(3,1,'Admin','DELETE','PWD-2020-004 (Expired)','2024-03-14 16:30:00.000'),
(4,1,'Admin','SETTINGS','Updated System Logo','2024-03-14 14:00:00.000'),
(5,2,'Staff_Jo','LOGIN','System Access','2024-03-14 08:00:00.000'),
(6,1,'Admin','EXPORT','Downloaded CSV Report','2024-03-13 17:45:00.000');

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
  `contact_no` varchar(100) DEFAULT NULL,
  `disability_type` int(11) DEFAULT NULL COMMENT 'Foreign key reference to disability_types table',
  `disability_cause` varchar(255) DEFAULT NULL COMMENT 'Cause of disability (e.g., Congenital - Birth Defect)',
  `registration_status` enum('Active','Pending','Inactive') DEFAULT 'Active' COMMENT 'PWD registration status',
  `guardian_name` varchar(255) DEFAULT NULL,
  `guardian_contact` varchar(100) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `cluster_group_no` int(11) DEFAULT 1,
  PRIMARY KEY (`pwd_id`),
  KEY `idx_name` (`firstname`,`lastname`),
  KEY `idx_contact` (`contact_no`),
  KEY `idx_active` (`is_active`),
  KEY `fk_nangka_disability_type` (`disability_type`),
  KEY `idx_registration_date` (`registration_date`),
  KEY `idx_cluster_group` (`cluster_group_no`),
  KEY `idx_cluster_year` (`cluster_group_no`,`registration_date`),
  CONSTRAINT `fk_nangka_disability_type` FOREIGN KEY (`disability_type`) REFERENCES `disability_types` (`disability_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `nangka_pwd_user` (`pwd_id`, `firstname`, `middlename`, `lastname`, `suffix`, `sex`, `birthdate`, `age`, `civil_status`, `hoa`, `address`, `barangay`, `contact_no`, `disability_type`, `disability_cause`, `registration_status`, `guardian_name`, `guardian_contact`, `registration_date`, `updated_at`, `is_active`, `cluster_group_no`) VALUES
(62,'ERIC','CREMEN','DELOS REYES','','Male','1970-01-19 00:00:00.000',55,'Single','AREA 1 NHA HOA','3 AREA I NHA BALUBAD NANGKA','Nangka','09237289544',3,'Acquired - ORTHOPHEDIC','Inactive','ANNA ROSA CRUZ DELOS REYES ','09228539216','2026-01-12 14:59:38.000','2026-01-12 15:21:25.000',1,1);

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
(2,'Ivell Ibarra','ibarra','$2b$10$jpYhNX.NcgfH89ce9s5mBuAKShfzA8tfQTGZIMN7/zx6r.NdgQtU2',1,NULL,NULL,NULL,NULL,'2026-01-11 19:54:21.000','2026-01-11 19:56:01.000',NULL,1);

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
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pwd_mis` (`pwd_mis_id`, `pwd_id`, `person_id`, `registration_status`, `date_processed`, `notes`) VALUES
(60,60,1,'registered','2026-01-12 10:54:15.000',NULL),
(62,62,1,'registered','2026-01-12 14:59:38.000',NULL);

DROP TABLE IF EXISTS `pwd_user_login`;
CREATE TABLE `pwd_user_login` (
  `login_id` int(11) NOT NULL AUTO_INCREMENT,
  `pwd_id` varchar(50) NOT NULL,
  `numeric_pwd_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `qr_image_path` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`login_id`),
  UNIQUE KEY `uk_pwd_login` (`pwd_id`),
  UNIQUE KEY `uk_pwd_id_formatted` (`pwd_id`),
  KEY `idx_numeric_pwd_id` (`numeric_pwd_id`),
  CONSTRAINT `fk_login_pwd_numeric` FOREIGN KEY (`numeric_pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pwd_user_login` (`login_id`, `pwd_id`, `numeric_pwd_id`, `password_hash`, `qr_image_path`, `last_login`, `is_active`, `created_at`, `updated_at`) VALUES
(62,'PWD-MRK-CL01-2026-0002',62,'$2b$10$clVJZI.K.VyVWC/P5l08ruZRLgdqsCEjy39Dp5L37YBM5hXK6m5GC','uploads/qr/qr-PWD-MRK-CL01-2026-0002.png',NULL,1,'2026-01-12 14:59:38.000','2026-01-12 15:02:58.000');

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

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL DEFAULT 1,
  `header_title` varchar(100) DEFAULT 'Barangay Nangka',
  `sub_header` varchar(100) DEFAULT 'Marikina City',
  `footer_text` varchar(255) DEFAULT 'Barangay Nangka PWD Management System v2.0',
  `logo_url` varchar(255) DEFAULT NULL,
  `primary_color` varchar(7) DEFAULT '#800000',
  `accent_color` varchar(7) DEFAULT '#eab308',
  `auto_backup_enabled` tinyint(1) DEFAULT 1,
  `backup_frequency` enum('daily','weekly','monthly') DEFAULT 'weekly',
  `retention_policy` varchar(50) DEFAULT 'Keep last 30 days',
  `last_backup_date` datetime DEFAULT NULL,
  PRIMARY KEY (`setting_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `system_settings` (`setting_id`, `header_title`, `sub_header`, `footer_text`, `logo_url`, `primary_color`, `accent_color`, `auto_backup_enabled`, `backup_frequency`, `retention_policy`, `last_backup_date`) VALUES
(1,'Barangay Nangka','Marikina City','Barangay Nangka PWD Management System v2.0',NULL,'#800000','#eab308',1,'weekly','Keep last 30 days',NULL);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Staff') DEFAULT 'Staff',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1,'Celso R. Delas Armas Jr.','kap.celso@nangka.gov.ph','hashed_pass_123','Admin','Active','2026-01-11 00:44:24.000','2026-01-11 00:44:24.000'),
(2,'Maria Clara','m.clara@nangka.gov.ph','hashed_pass_123','Staff','Active','2026-01-11 00:44:24.000','2026-01-11 00:44:24.000'),
(3,'Juan Tamad','j.tamad@nangka.gov.ph','hashed_pass_123','Staff','Inactive','2026-01-11 00:44:24.000','2026-01-11 00:44:24.000');

SET FOREIGN_KEY_CHECKS=1;
