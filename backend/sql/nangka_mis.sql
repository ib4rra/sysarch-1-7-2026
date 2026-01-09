-- ============================================================================
-- Barangay Nangka PWD MIS Database Schema
-- Three-Role-Based Access Control (RBAC)
-- Created: January 7, 2026
-- 
-- Role Structure:
--   role_id 1: super_admin     - System management, admin account creation
--   role_id 2: admin           - Records management, CRUD operations  
--   role_id 4: pwd_user        - PWD users with limited access to own info
-- ============================================================================

-- ============================================
-- 1. Roles Table
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Person_In_Charge (Staff/Admin Users)
-- ============================================
-- Stores all admin accounts including:
--   - super_admin (role_id = 1): System administrators
--   - admin (role_id = 2): Person-in-Charge, records management
CREATE TABLE IF NOT EXISTS Person_In_Charge (
  person_id INT PRIMARY KEY AUTO_INCREMENT,
  fullname VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  position VARCHAR(100),
  contact_no VARCHAR(20),
  email VARCHAR(100),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
  INDEX idx_username (username),
  INDEX idx_role (role_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Nangka_PWD_user (PWD Registrants)
-- ============================================
-- Core PWD registration data
CREATE TABLE IF NOT EXISTS Nangka_PWD_user (
  pwd_id INT PRIMARY KEY AUTO_INCREMENT,
  firstname VARCHAR(100) NOT NULL,
  middlename VARCHAR(100),
  lastname VARCHAR(100) NOT NULL,
  suffix VARCHAR(50),
  sex ENUM('Male', 'Female', 'Other') NOT NULL,
  birthdate DATE NOT NULL,
  age INT,
  civil_status ENUM('Single', 'Married', 'Divorced', 'Widowed', 'Separated') NOT NULL,
  address TEXT NOT NULL,
  barangay VARCHAR(100) DEFAULT 'Nangka',
  contact_no VARCHAR(20),
  disability_type VARCHAR(100) NULL COMMENT 'Primary disability type (optional, for quick reference)',
  guardian_name VARCHAR(255),
  guardian_contact VARCHAR(20),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_name (firstname, lastname),
  INDEX idx_contact (contact_no),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3a. PWD User Login Credentials
-- ============================================
-- Separate login table for PWD users (role_id = 4 in login responses)
-- PWD users login with: username = pwd_id, password = surname (hashed)
CREATE TABLE pwd_user_login (
  login_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_login_pwd
    FOREIGN KEY (pwd_id)
    REFERENCES Nangka_PWD_user(pwd_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  UNIQUE KEY uk_pwd_login (pwd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================
-- 4. PWD_MIS (Relationship/Management)
-- ============================================
-- Tracks which admin manages which PWD registrant
CREATE TABLE IF NOT EXISTS PWD_MIS (
  pwd_mis_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  person_id INT NOT NULL,
  registration_status ENUM('registered', 'pending', 'rejected', 'archived') DEFAULT 'pending',
  date_processed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (pwd_id) REFERENCES Nangka_PWD_user(pwd_id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES Person_In_Charge(person_id) ON DELETE RESTRICT,
  UNIQUE KEY unique_pwd_registration (pwd_id, person_id),
  INDEX idx_status (registration_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Disability Types
-- ============================================
CREATE TABLE IF NOT EXISTS disability_types (
  disability_id INT PRIMARY KEY AUTO_INCREMENT,
  disability_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. PWD Disabilities (Many-to-Many)
-- ============================================
CREATE TABLE pwd_disabilities (
  pwd_disability_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  disability_id INT NOT NULL,
  severity ENUM('mild', 'moderate', 'severe') DEFAULT 'moderate',
  date_identified DATE,
  notes TEXT,
  CONSTRAINT fk_pwd_disability_pwd
    FOREIGN KEY (pwd_id)
    REFERENCES Nangka_PWD_user(pwd_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_pwd_disability_type
    FOREIGN KEY (disability_id)
    REFERENCES disability_types(disability_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  UNIQUE KEY unique_pwd_disability (pwd_id, disability_id)
) ENGINE=InnoDB;


-- ============================================
-- 7. Beneficiary Claims
-- ============================================
CREATE TABLE IF NOT EXISTS beneficiary_claims (
  claim_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  claim_type VARCHAR(100) NOT NULL,
  claim_date DATE NOT NULL,
  claim_amount DECIMAL(10, 2),
  status ENUM('pending', 'approved', 'denied', 'processed') DEFAULT 'pending',
  processed_by INT,
  processing_date TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pwd_id) REFERENCES Nangka_PWD_user(pwd_id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_pwd (pwd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  recipient_id INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  sender_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES Person_In_Charge(person_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL,
  INDEX idx_read (is_read, recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Activity Logs
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  person_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES Person_In_Charge(person_id) ON DELETE CASCADE,
  INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. Documents/Attachments
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  document_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(50),
  uploaded_by INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pwd_id) REFERENCES Nangka_PWD_user(pwd_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL,
  INDEX idx_pwd (pwd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. Announcements & Updates
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  notice_type ENUM('General', 'Update', 'Emergency') DEFAULT 'General',
  posted_by INT,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (posted_by) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL,
  INDEX idx_type (notice_type),
  INDEX idx_created (created_at),
  INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA & TEST ACCOUNTS
-- ============================================================================

-- Disable foreign key checks temporarily for truncating tables
SET FOREIGN_KEY_CHECKS=0;

-- ============================================
-- Delete all data in correct order (all child tables first)
-- ============================================
DELETE FROM pwd_user_login;
DELETE FROM pwd_disabilities;
DELETE FROM beneficiary_claims;
DELETE FROM activity_logs;
DELETE FROM notifications;
DELETE FROM documents;
DELETE FROM PWD_MIS;
DELETE FROM Person_In_Charge;
DELETE FROM Nangka_PWD_user;
DELETE FROM disability_types;
DELETE FROM roles;

-- ============================================
-- Insert Roles (Three-Tier System)
-- ============================================
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'super_admin', 'System administrator - manages admin accounts and system settings'),
(2, 'admin', 'Person-in-Charge - manages PWD records and staff operations'),
(4, 'pwd_user', 'PWD User - limited access to view own registration information');

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================
-- ⚠️  PASSWORD HASHING IS NOW HANDLED BY THE SYSTEM
-- 
-- Instead of hardcoding hashed passwords in this SQL file,
-- the system now uses Node.js with bcryptjs to securely hash
-- passwords dynamically. This prevents password leakage through
-- version control and SQL backups.
--
-- To insert test data:
--   1. Ensure database tables are created (this script handles it)
--   2. Run: node seed-db.js
--
-- The seed-db.js script will:
--   • Hash passwords using bcrypt (10 salt rounds)
--   • Insert test accounts securely
--   • Display login credentials for testing
--   • Prevent duplicate data
--
-- Test Credentials (created by seed-db.js):
--   Super Admin:  username=super_admin, password=password123
--   Admin:        username=admin_user, password=password123
--   PWD User:     id=1 (auto), password=surname
--
-- SECURITY NOTES:
--   ✓ Never hardcode passwords in SQL files
--   ✓ Always use bcrypt to hash passwords
--   ✓ SQL files should only contain table schemas
--   ✓ Use separate seed scripts for test data
-- ============================================

-- No test data is inserted here. Run: node seed-db.js

-- ============================================
-- Sample Disability Types
-- ============================================
INSERT INTO disability_types (disability_name, description) VALUES
('Visual Impairment', 'Blindness or low vision'),
('Hearing Impairment', 'Deafness or hard of hearing'),
('Physical Disability', 'Mobility or physical limitations'),
('Intellectual Disability', 'Cognitive or developmental disability'),
('Psychosocial Disability', 'Mental health conditions'),
('Speech Disability', 'Speech or language impairment'),
('Multiple Disabilities', 'More than one type of disability');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- ============================================================================
-- AUTHENTICATION WORKFLOW
-- ============================================================================
-- 
-- 1. SUPER ADMIN LOGIN (role_id = 1)
--    Endpoint: POST /auth/unified-login
--    Request: { idNumber: "super_admin", password: "password123" }
--    Response: { token, user { id, username, role, role_id: 1 } }
--    Redirect: /super-admin
--
-- 2. ADMIN LOGIN (role_id = 2)
--    Endpoint: POST /auth/unified-login
--    Request: { idNumber: "admin_user", password: "password123" }
--    Response: { token, user { id, username, role, role_id: 2 } }
--    Redirect: /admin
--
-- 3. PWD USER LOGIN (role_id = 4)
--    Endpoint: POST /auth/unified-login
--    Request: { idNumber: "1", password: "Lopez" }
--    Response: { token, user { id, pwd_id, username, role, role_id: 4 } }
--    Redirect: /dashboard (read-only access to own record)
--
-- ============================================================================
-- BACKEND LOGIN LOGIC (auth.controller.js)
-- ============================================================================
-- 
-- The /auth/unified-login endpoint:
-- 1. Checks Person_In_Charge table first (super_admin, admin)
-- 2. If not found, checks pwd_user_login table (pwd users)
-- 3. Returns appropriate role_id based on user type
-- 4. Frontend redirects based on role_id:
--    - role_id 1 → /super-admin
--    - role_id 2 → /admin
--    - role_id 4 → /dashboard (read-only)
--
-- ============================================================================
-- PASSWORD HASHING NOTE
-- ============================================================================
-- 
-- The password_hash values in this sample data are bcryptjs hashes of:
-- Password: password123
-- Hash: $2b$10$n7Wy0s9BG7i/yOPmKaB7Hei7QzR3cSAhkFzR8kQHx8hf8eVCVQ.zy
--
-- To generate hashes in Node.js:
--   const bcrypt = require('bcryptjs');
--   const hash = await bcrypt.hash('your_password', 10);
--
-- To verify in login:
--   const isValid = await bcrypt.compare(password, password_hash);
--
-- ============================================================================
