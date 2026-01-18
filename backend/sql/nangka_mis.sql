-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 10, 2026 at 02:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nangka_mis`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `notice_type` enum('General','Update','Emergency') DEFAULT 'General',
  `posted_by` int(11) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beneficiary_claims`
--

CREATE TABLE `beneficiary_claims` (
  `claim_id` int(11) NOT NULL,
  `pwd_id` int(11) NOT NULL,
  `claim_type` varchar(100) NOT NULL,
  `claim_date` date NOT NULL,
  `claim_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','denied','processed') DEFAULT 'pending',
  `processed_by` int(11) DEFAULT NULL,
  `processing_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disability_types`
--

CREATE TABLE `disability_types` (
  `disability_id` int(11) NOT NULL,
  `disability_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disability_types`
--

INSERT INTO `disability_types` (`disability_id`, `disability_name`, `description`, `created_at`) VALUES
(1, 'Visual Impairment', 'Blindness or low vision', '2026-01-09 23:42:45'),
(2, 'Hearing Impairment', 'Deafness or hard of hearing', '2026-01-09 23:42:45'),
(3, 'Physical Disability', 'Mobility or physical limitations', '2026-01-09 23:42:45'),
(4, 'Intellectual Disability', 'Cognitive or developmental disability', '2026-01-09 23:42:45'),
(5, 'Psychosocial Disability', 'Mental health conditions', '2026-01-09 23:42:45'),
(6, 'Speech Disability', 'Speech or language impairment', '2026-01-09 23:42:45'),
(7, 'Multiple Disabilities', 'More than one type of disability', '2026-01-09 23:42:45');

-- --------------------------------------------------------

--
-- Table structure for table `disability_conditions`
--

CREATE TABLE `disability_conditions` (
  `condition_id` int(11) NOT NULL,
  `disability_id` int(11) NOT NULL,
  `condition_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  FOREIGN KEY (`disability_id`) REFERENCES `disability_types`(`disability_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disability_conditions`
--

INSERT INTO `disability_conditions` (`disability_id`, `condition_name`, `created_at`) VALUES
(1, 'Cataract', '2026-01-15 00:00:00'),
(1, 'Retinitis Pigmentosa', '2026-01-15 00:00:00'),
(1, 'Macular Degeneration', '2026-01-15 00:00:00'),
(1, 'Diabetic Retinopathy', '2026-01-15 00:00:00'),
(1, 'Color Blindness', '2026-01-15 00:00:00'),
(2, 'Complete Deafness', '2026-01-15 00:00:00'),
(2, 'Hard of Hearing', '2026-01-15 00:00:00'),
(2, 'Auditory Processing Disorder', '2026-01-15 00:00:00'),
(2, 'Tinnitus', '2026-01-15 00:00:00'),
(2, 'Conductive Hearing Loss', '2026-01-15 00:00:00'),
(3, 'Spinal Cord Injury', '2026-01-15 00:00:00'),
(3, 'Cerebral Palsy', '2026-01-15 00:00:00'),
(3, 'Muscular Dystrophy', '2026-01-15 00:00:00'),
(3, 'Amputation', '2026-01-15 00:00:00'),
(3, 'Arthritis', '2026-01-15 00:00:00'),
(4, 'Congenital / Inborn - Down Syndrome', '2026-01-15 00:00:00'),
(4, 'Autism Spectrum', '2026-01-15 00:00:00'),
(4, 'Fragile X Syndrome', '2026-01-15 00:00:00'),
(4, 'Williams Syndrome', '2026-01-15 00:00:00'),
(4, 'Intellectual Delay', '2026-01-15 00:00:00'),
(5, 'Depression', '2026-01-15 00:00:00'),
(5, 'Anxiety Disorder', '2026-01-15 00:00:00'),
(5, 'Bipolar Disorder', '2026-01-15 00:00:00'),
(5, 'Schizophrenia', '2026-01-15 00:00:00'),
(5, 'PTSD', '2026-01-15 00:00:00'),
(6, 'Stuttering', '2026-01-15 00:00:00'),
(6, 'Apraxia', '2026-01-15 00:00:00'), 
(6, 'Dysarthria', '2026-01-15 00:00:00'),
(6, 'Aphasia', '2026-01-15 00:00:00'),
(6, 'Voice Disorder', '2026-01-15 00:00:00'),
(7, 'Deaf-Blindness', '2026-01-15 00:00:00'),
(7, 'Physical + Hearing', '2026-01-15 00:00:00'),
(7, 'Intellectual + Physical', '2026-01-15 00:00:00'),
(7, 'Visual + Speech', '2026-01-15 00:00:00'),
(7, 'Combined Conditions', '2026-01-15 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `pwd_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(50) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nangka_pwd_user`
--

CREATE TABLE `nangka_pwd_user` (
  `pwd_id` int(11) NOT NULL,
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
  `cluster_group_area` char(1) DEFAULT NULL COMMENT 'Area letter (A, B, C, or D)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nangka_pwd_user`
--

INSERT INTO `nangka_pwd_user` (`pwd_id`, `firstname`, `middlename`, `lastname`, `suffix`, `sex`, `birthdate`, `age`, `civil_status`, `hoa`, `address`, `barangay`, `contact_no`, `tag_no`, `disability_type`, `disability_cause`, `registration_status`, `guardian_name`, `guardian_contact`, `registration_date`, `updated_at`, `is_active`, `cluster_group_no`) VALUES
(1, 'SHOBE', 'ROQUE', 'PIERRE', NULL, 'Male', '2004-08-22', 21, 'Single', 'PAROLA', '0123 BARANGAY MARIKINA, NANGKA', 'Nangka', '09167498805', '001', 3, 'Congenital / Inborn - HEART CONDITION', 'Active', 'JUAN DELA CRUZ', '09876543122', '2026-01-10 01:45:18', '2026-01-10 01:45:18', 1, 1),
(2, 'SEBASTIAN', 'BOLANTE', 'ONNAGAN', NULL, 'Male', '2004-05-01', 21, 'Single', 'SAMPALOC', '0123 BARANGAY MARIKINA, NANGKA', 'Nangka', '09123456789', '002', 1, 'Acquired - CATARATA', 'Active', 'JUAN DELA CRUZ', '09876543122', '2026-01-10 01:46:48', '2026-01-10 01:46:48', 1, 1),
(3, 'IVELL', 'JAY', 'IBARRA', NULL, 'Male', '2004-10-31', 21, 'Single', 'NANGKA', '0123 BARANGAY MARIKINA, NANGKA', 'Nangka', '09123456789', '003', 6, 'Acquired - BULOL SA LETTER R', 'Active', 'JUAN DELA CRUZ', '09876543122', '2026-01-10 01:50:12', '2026-01-10 01:50:12', 1, 2),
(4, 'RAPH ', 'KENNETH ', 'ZAMBRONA', NULL, 'Male', '2004-12-18', 21, 'Single', 'TONDO', '0123 BARANGAY MARIKINA, NANGKA', 'Nangka', '09123456789', '004', 2, 'Congenital / Inborn - CHICKEN FOX', 'Active', 'JUAN DELA CRUZ', '09876543122', '2026-01-10 01:51:18', '2026-01-10 01:51:18', 1, 3),
(5, 'JOSHUA', 'JAN', 'TRAQUEÑA', NULL, 'Male', '2004-01-01', 22, 'Single', 'QC', '0123 BARANGAY MARIKINA, NANGKA', 'Nangka', '09123456789', '005', 1, 'Congenital / Inborn - catarata', 'Active', 'JUAN DELA CRUZ', '09876543122', '2026-01-10 01:53:50', '2026-01-10 01:53:50', 1, 4),
(6, 'JEREMY ', 'MUME', 'ALBUERA', NULL, 'Male', '2004-08-21', 21, 'Single', 'ANTIPOLO', '0123 BARANGAY MARIKINA, NANGKA', 'Nangka', '09123456789', '006', 6, 'Congenital / Inborn - NORMAL', 'Active', 'JUAN DELA CRUZ', '09876543122', '2026-01-10 01:56:09', '2026-01-10 01:56:09', 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `sender_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `person_in_charge`
--

CREATE TABLE `person_in_charge` (
  `person_id` int(11) NOT NULL,
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
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `person_in_charge`
--

INSERT INTO `person_in_charge` (`person_id`, `fullname`, `username`, `password_hash`, `role_id`, `position`, `contact_no`, `email`, `avatar_url`, `created_at`, `updated_at`, `last_login`, `is_active`) VALUES
(1, 'admin_test', 'jeremume', '$2b$10$hpwuYNQX2hF9pnlh4Z3nDuCeCTZIqTRcM89Ym5wjtjnVUFaXE22/K', 2, 'tester', '12345679101', 'tester@gmail.com', NULL, '2026-01-10 00:28:41', '2026-01-10 00:28:41', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pwd_disabilities`
--

CREATE TABLE `pwd_disabilities` (
  `pwd_disability_id` int(11) NOT NULL,
  `pwd_id` int(11) NOT NULL,
  `disability_id` int(11) NOT NULL,
  `severity` enum('mild','moderate','severe') DEFAULT 'moderate',
  `date_identified` date DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pwd_mis`
--

CREATE TABLE `pwd_mis` (
  `pwd_mis_id` int(11) NOT NULL,
  `pwd_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `registration_status` enum('registered','pending','rejected','archived') DEFAULT 'pending',
  `date_processed` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pwd_mis`
--

INSERT INTO `pwd_mis` (`pwd_mis_id`, `pwd_id`, `person_id`, `registration_status`, `date_processed`, `notes`) VALUES
(1, 1, 1, 'registered', '2026-01-10 01:45:18', NULL),
(2, 2, 1, 'registered', '2026-01-10 01:46:48', NULL),
(3, 3, 1, 'registered', '2026-01-10 01:50:12', NULL),
(4, 4, 1, 'registered', '2026-01-10 01:51:18', NULL),
(5, 5, 1, 'registered', '2026-01-10 01:53:50', NULL),
(6, 6, 1, 'registered', '2026-01-10 01:56:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pwd_user_login`
--

CREATE TABLE `pwd_user_login` (
  `login_id` int(11) NOT NULL,
  `pwd_id` varchar(50) NOT NULL,
  `numeric_pwd_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pwd_user_login`
-- 

INSERT INTO `pwd_user_login` (`login_id`, `pwd_id`, `numeric_pwd_id`, `password_hash`, `last_login`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'PWD-MRK-CL01-2026-0002', 1, '$2b$10$sl3lvG6cBtt40OryBMwJN.mbjS46NjMxj3xBmOF8IBv7tiwvKV9vW', '2026-01-10 01:45:38', 1, '2026-01-10 01:45:18', '2026-01-10 01:45:38'),
(2, 'PWD-MRK-CL01-2026-0003', 2, '$2b$10$kjQrMUSRnOaR0AXMYgVJ8OT8NBTpkEMrAn1YNGqRBEXh.3QGDFhWu', NULL, 1, '2026-01-10 01:46:48', '2026-01-10 01:46:48'),
(3, 'PWD-MRK-CL02-2026-0002', 3, '$2b$10$EcXr/yXRC/rO53V5DJXAIe54OfylxqgLdGcuNnsxQdlFzK7/gAUIS', NULL, 1, '2026-01-10 01:50:12', '2026-01-10 01:50:12'),
(4, 'PWD-MRK-CL03-2026-0002', 4, '$2b$10$k7iE2TONOkcCqZu2G2Ro9Om14StYTZtxMl827yUafn1sJ0fcRaI1i', NULL, 1, '2026-01-10 01:51:19', '2026-01-10 01:51:19'),
(5, 'PWD-MRK-CL04-2026-0002', 5, '$2b$10$iKkEXEmUyejNMp9XgDwkAeEOY64E9zHzEfoujlYcb9sWU85mfnTsi', NULL, 1, '2026-01-10 01:53:50', '2026-01-10 01:53:50'),
(6, 'PWD-MRK-CL05-2026-0002', 6, '$2b$10$vhXf0KqGUV8Pbf7ovV8rqO8JBKI2UrGlKb53Zk/ElXQ8mc0RtnOOG', NULL, 1, '2026-01-10 01:56:09', '2026-01-10 01:56:09');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `created_at`) VALUES
(1, 'super_admin', 'System administrator - manages admin accounts and system settings', '2026-01-09 23:42:45'),
(2, 'admin', 'Person-in-Charge - manages PWD records and staff operations', '2026-01-09 23:42:45'),
(3, 'pwd_user', 'PWD User - limited access to view own registration information', '2026-01-09 23:42:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `idx_date` (`created_at`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_id`),
  ADD KEY `posted_by` (`posted_by`),
  ADD KEY `idx_type` (`notice_type`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_event_date` (`event_date`);

--
-- Indexes for table `beneficiary_claims`
--
ALTER TABLE `beneficiary_claims`
  ADD PRIMARY KEY (`claim_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_pwd` (`pwd_id`);

--
-- Indexes for table `disability_types`
--
ALTER TABLE `disability_types`
  ADD PRIMARY KEY (`disability_id`),
  ADD UNIQUE KEY `disability_name` (`disability_name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_pwd` (`pwd_id`);

--
-- Indexes for table `nangka_pwd_user`
--
ALTER TABLE `nangka_pwd_user`
  ADD PRIMARY KEY (`pwd_id`),
  ADD KEY `idx_name` (`firstname`,`lastname`),
  ADD KEY `idx_contact` (`contact_no`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `fk_nangka_disability_type` (`disability_type`),
  ADD KEY `idx_registration_date` (`registration_date`),
  ADD KEY `idx_cluster_group` (`cluster_group_no`),
  ADD KEY `idx_cluster_year` (`cluster_group_no`,`registration_date`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `recipient_id` (`recipient_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `idx_read` (`is_read`,`recipient_id`);

--
-- Indexes for table `person_in_charge`
--
ALTER TABLE `person_in_charge`
  ADD PRIMARY KEY (`person_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `pwd_disabilities`
--
ALTER TABLE `pwd_disabilities`
  ADD PRIMARY KEY (`pwd_disability_id`),
  ADD UNIQUE KEY `unique_pwd_disability` (`pwd_id`,`disability_id`),
  ADD KEY `fk_pwd_disability_type` (`disability_id`);

--
-- Indexes for table `pwd_mis`
--
ALTER TABLE `pwd_mis`
  ADD PRIMARY KEY (`pwd_mis_id`),
  ADD UNIQUE KEY `unique_pwd_registration` (`pwd_id`,`person_id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `idx_status` (`registration_status`);

--
-- Indexes for table `pwd_user_login`
--
ALTER TABLE `pwd_user_login`
  ADD PRIMARY KEY (`login_id`),
  ADD UNIQUE KEY `uk_pwd_login` (`pwd_id`),
  ADD UNIQUE KEY `uk_pwd_id_formatted` (`pwd_id`),
  ADD KEY `idx_numeric_pwd_id` (`numeric_pwd_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beneficiary_claims`
--
ALTER TABLE `beneficiary_claims`
  MODIFY `claim_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disability_types`
--
ALTER TABLE `disability_types`
  MODIFY `disability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nangka_pwd_user`
--
ALTER TABLE `nangka_pwd_user`
  MODIFY `pwd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `person_in_charge`
--
ALTER TABLE `person_in_charge`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pwd_disabilities`
--
ALTER TABLE `pwd_disabilities`
  MODIFY `pwd_disability_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pwd_mis`
--
ALTER TABLE `pwd_mis`
  MODIFY `pwd_mis_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pwd_user_login`
--
ALTER TABLE `pwd_user_login`
  MODIFY `login_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person_in_charge` (`person_id`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL;

--
-- Constraints for table `beneficiary_claims`
--
ALTER TABLE `beneficiary_claims`
  ADD CONSTRAINT `beneficiary_claims_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `beneficiary_claims_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL;

--
-- Constraints for table `nangka_pwd_user`
--
ALTER TABLE `nangka_pwd_user`
  ADD CONSTRAINT `fk_nangka_disability_type` FOREIGN KEY (`disability_type`) REFERENCES `disability_types` (`disability_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `person_in_charge` (`person_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `person_in_charge` (`person_id`) ON DELETE SET NULL;

--
-- Constraints for table `person_in_charge`
--
ALTER TABLE `person_in_charge`
  ADD CONSTRAINT `person_in_charge_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Constraints for table `pwd_disabilities`
--
ALTER TABLE `pwd_disabilities`
  ADD CONSTRAINT `fk_pwd_disability_pwd` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pwd_disability_type` FOREIGN KEY (`disability_id`) REFERENCES `disability_types` (`disability_id`) ON UPDATE CASCADE;

--
-- Constraints for table `pwd_mis`
--
ALTER TABLE `pwd_mis`
  ADD CONSTRAINT `pwd_mis_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pwd_mis_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person_in_charge` (`person_id`);

--
-- Constraints for table `pwd_user_login`
--
ALTER TABLE `pwd_user_login`
  ADD CONSTRAINT `fk_login_pwd_numeric` FOREIGN KEY (`numeric_pwd_id`) REFERENCES `nangka_pwd_user` (`pwd_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
