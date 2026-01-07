-- Barangay Nangka PWD MIS Database Schema
-- Created: January 7, 2026

-- ============================================
-- 0. Roles and Permissions (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 1. Person_In_Charge (Staff/Admin Users)
-- ============================================
CREATE TABLE IF NOT EXISTS Person_In_Charge (
  person_id INT PRIMARY KEY AUTO_INCREMENT,
  fullname VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  position VARCHAR(100),
  contact_no VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Nangka_PWD_user (PWD Registrants)
-- ============================================
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
  contact_no VARCHAR(20),
  guardian_name VARCHAR(255),
  guardian_contact VARCHAR(20),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2a. PWD User Login (Separate from Person_In_Charge)
-- ============================================
-- PWD users login with: username = PWD_ID, password = surname (hashed)
-- This allows PWD users to verify their registration
CREATE TABLE IF NOT EXISTS pwd_user_login (
  login_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL UNIQUE,
  login_username VARCHAR(50) NOT NULL UNIQUE,
  -- Password hash of surname (bcryptjs hashed)
  password_hash VARCHAR(255) NOT NULL,
  -- Limited info visible to PWD users
  can_view_own_record BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pwd_id) REFERENCES Nangka_PWD_user(pwd_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. PWD_MIS (Relationship/Management)
-- ============================================
CREATE TABLE IF NOT EXISTS PWD_MIS (
  pwd_mis_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  person_id INT NOT NULL,
  registration_status ENUM('registered', 'pending', 'rejected', 'archived') DEFAULT 'pending',
  date_processed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (pwd_id) REFERENCES Nangka_PWD_user(pwd_id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES Person_In_Charge(person_id) ON DELETE RESTRICT,
  UNIQUE KEY unique_pwd_registration (pwd_id, person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Disability Types
-- ============================================
CREATE TABLE IF NOT EXISTS disability_types (
  disability_id INT PRIMARY KEY AUTO_INCREMENT,
  disability_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. PWD Disabilities (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS pwd_disabilities (
  pwd_disability_id INT PRIMARY KEY AUTO_INCREMENT,
  pwd_id INT NOT NULL,
  disability_id INT NOT NULL,
  severity ENUM('mild', 'moderate', 'severe') DEFAULT 'moderate',
  date_identified DATE,
  notes TEXT,
  FOREIGN KEY (pwd_id) REFERENCES Nangka_PWD_user(pwd_id) ON DELETE CASCADE,
  FOREIGN KEY (disability_id) REFERENCES disability_types(disability_id) ON DELETE RESTRICT,
  UNIQUE KEY unique_pwd_disability (pwd_id, disability_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Beneficiary Claims
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
  FOREIGN KEY (processed_by) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Notifications
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
  FOREIGN KEY (sender_id) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Activity Logs
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
  FOREIGN KEY (person_id) REFERENCES Person_In_Charge(person_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Documents/Attachments
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
  FOREIGN KEY (uploaded_by) REFERENCES Person_In_Charge(person_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Setup & Pre-made Accounts)
-- ============================================

-- ============================================
-- Insert Roles
-- ============================================
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'super_admin', 'System administrator - can manage admins and system settings'),
(2, 'admin', 'Admin - can manage staff and create PWD user accounts'),
(3, 'staff', 'Staff - can process claims and manage PWD records'),
(4, 'social_worker', 'Social Worker - can assist PWD and process applications')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- ============================================
-- Insert Permissions
-- ============================================
INSERT INTO permissions (permission_id, permission_name, description) VALUES
-- Super Admin Permissions
(1, 'manage_admins', 'Create, edit, delete admin accounts'),
(2, 'manage_staff', 'Create, edit, delete staff accounts'),
(3, 'view_all_records', 'View all PWD records in system'),
(4, 'manage_system_settings', 'Manage system configuration and roles'),
(5, 'view_system_logs', 'View activity logs and audit trails'),
-- Admin Permissions
(6, 'create_pwd_account', 'Create PWD user accounts and login credentials'),
(7, 'manage_pwd_records', 'Manage PWD records and information'),
(8, 'process_claims', 'Process beneficiary claims'),
(9, 'manage_disabilities', 'Manage disability types'),
(10, 'view_claims_analytics', 'View claims and registration analytics'),
-- Staff Permissions
(11, 'view_pwd_records', 'View PWD records'),
(12, 'edit_pwd_records', 'Edit PWD records'),
(13, 'process_pwd_claims', 'Process PWD claims'),
(14, 'upload_documents', 'Upload PWD documents'),
-- PWD User Permissions
(15, 'view_own_record', 'View own registration record (limited info)'),
(16, 'view_own_disabilities', 'View own disability information')
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- ============================================
-- Assign Permissions to Roles
-- ============================================

-- Super Admin permissions (all permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), 
(1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Admin permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
(2, 11), (2, 12), (2, 13), (2, 14)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Staff permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 11), (3, 12), (3, 13), (3, 14)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- ============================================
-- PRE-MADE SUPER ADMIN ACCOUNT
-- ============================================
-- Username: superadmin
-- Password: SuperAdmin@123 (bcryptjs hashed)
-- NOTE: Replace the password_hash with actual bcryptjs hash in production
-- To generate hash: bcrypt.hash('SuperAdmin@123', 10)
INSERT INTO Person_In_Charge (fullname, username, password_hash, role_id, position, email, is_active) VALUES
('System Administrator', 'superadmin', '$2b$10$YourBcryptHashedPasswordHere', 1, 'Super Administrator', 'admin@barangay-nangka.gov.ph', TRUE)
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- ============================================
-- Insert Sample Disabilities
-- ============================================
INSERT INTO disability_types (disability_name, description) VALUES
('Visual Impairment', 'Blindness or low vision'),
('Hearing Impairment', 'Deafness or hard of hearing'),
('Physical Disability', 'Mobility or physical limitations'),
('Intellectual Disability', 'Cognitive or developmental disability'),
('Psychosocial Disability', 'Mental health conditions'),
('Speech Disability', 'Speech or language impairment'),
('Multiple Disabilities', 'More than one type of disability')
ON DUPLICATE KEY UPDATE disability_name = VALUES(disability_name);

-- Create indexes for better performance
CREATE INDEX idx_pwd_name ON Nangka_PWD_user(firstname, lastname);
CREATE INDEX idx_pwd_contact ON Nangka_PWD_user(contact_no);
CREATE INDEX idx_person_username ON Person_In_Charge(username);
CREATE INDEX idx_person_role ON Person_In_Charge(role_id);
CREATE INDEX idx_pwd_login_username ON pwd_user_login(login_username);
CREATE INDEX idx_pwd_login_active ON pwd_user_login(is_active);
CREATE INDEX idx_claim_status ON beneficiary_claims(status);
CREATE INDEX idx_claim_pwd ON beneficiary_claims(pwd_id);
CREATE INDEX idx_notif_read ON notifications(is_read, recipient_id);
CREATE INDEX idx_log_date ON activity_logs(created_at);
CREATE INDEX idx_doc_pwd ON documents(pwd_id);

-- ============================================
-- Login Workflow Documentation
-- ============================================
-- 
-- STAFF/ADMIN LOGIN (Person_In_Charge):
-- - Username: [staffusername]
-- - Password: [staff password, bcryptjs hashed]
-- - Login endpoint: POST /auth/login
-- - Returns: JWT token with role_id and permissions
-- 
-- PWD USER LOGIN (Nangka_PWD_user):
-- - Username: [PWD_ID] (numeric auto-generated from registration)
-- - Password: [surname] (bcryptjs hashed at account creation)
-- - Login endpoint: POST /auth/pwd-login
-- - Returns: Limited JWT token (can only view own record)
-- - Visible fields: firstname, lastname, sex, birthdate, disability info
-- 
-- ADMIN CREATING PWD ACCOUNT WORKFLOW:
-- 1. Admin creates Nangka_PWD_user record
-- 2. System auto-generates pwd_id
-- 3. Admin provides surname + password confirmation
-- 4. System creates pwd_user_login entry with:
--    - login_username = pwd_id
--    - password_hash = bcryptjs.hash(surname, 10)
-- 5. PWD receives login credentials (PWD_ID + Surname)
-- 
-- ============================================
