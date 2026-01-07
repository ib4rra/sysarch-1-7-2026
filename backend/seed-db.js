import bcrypt from 'bcryptjs';
import db from './config/db.js';

/**
 * Database Seeding Script
 * This script inserts test data with properly hashed passwords
 * Run once after database initialization: node seed-db.js
 */

const SALT_ROUNDS = 10;

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // ============================================
    // 1. Check if test data already exists
    // ============================================
    const [existingAdmin] = await db.query(
      'SELECT person_id FROM Person_In_Charge WHERE username = ?',
      ['super_admin']
    );

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('⚠️  Test data already exists. Skipping seeding.');
      console.log('💡 To reseed: DELETE test accounts and run this script again.');
      process.exit(0);
    }

    // ============================================
    // 2. Insert Test Account 1: Super Admin
    // ============================================
    console.log('📝 Creating Super Admin account...');
    const superAdminPassword = 'password123';
    const superAdminHash = await bcrypt.hash(superAdminPassword, SALT_ROUNDS);

    const [superAdminResult] = await db.query(
      `INSERT INTO Person_In_Charge 
       (fullname, username, password_hash, role_id, position, email, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        'System Administrator',
        'super_admin',
        superAdminHash,
        1,
        'Super Administrator',
        'admin@barangay-nangka.gov.ph',
      ]
    );

    console.log(`   ✅ Super Admin created (ID: ${superAdminResult.insertId})`);
    console.log(`   📌 Username: super_admin`);
    console.log(`   📌 Password: ${superAdminPassword}`);
    console.log(`   🔐 Hash: ${superAdminHash}\n`);

    // ============================================
    // 3. Insert Test Account 2: Admin
    // ============================================
    console.log('📝 Creating Admin (Person-in-Charge) account...');
    const adminPassword = 'password123';
    const adminHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const [adminResult] = await db.query(
      `INSERT INTO Person_In_Charge 
       (fullname, username, password_hash, role_id, position, email, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        'Maria Santos',
        'admin_user',
        adminHash,
        2,
        'Person-in-Charge / Admin',
        'maria.santos@barangay-nangka.gov.ph',
      ]
    );

    console.log(`   ✅ Admin created (ID: ${adminResult.insertId})`);
    console.log(`   📌 Username: admin_user`);
    console.log(`   📌 Password: ${adminPassword}`);
    console.log(`   🔐 Hash: ${adminHash}\n`);

    // ============================================
    // 4. Insert Sample PWD User
    // ============================================
    console.log('📝 Creating Sample PWD User...');
    const [pwdUserResult] = await db.query(
      `INSERT INTO Nangka_PWD_user 
       (firstname, middlename, lastname, suffix, sex, birthdate, age, civil_status, address, barangay, contact_no, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        'Jose',
        'Garcia',
        'Lopez',
        null,
        'Male',
        '1985-05-15',
        39,
        'Married',
        '123 Main Street, Nangka',
        'Nangka',
        '09171234567',
      ]
    );

    const pwdId = pwdUserResult.insertId;
    console.log(`   ✅ PWD User created (PWD ID: ${pwdId})`);
    console.log(`   📌 Name: Jose Garcia Lopez`);
    console.log(`   📌 Birthdate: 1985-05-15\n`);

    // ============================================
    // 5. Insert PWD User Login Credentials
    // ============================================
    console.log('📝 Creating PWD User Login Credentials...');
    const pwdPassword = 'Lopez'; // Using surname as password
    const pwdHash = await bcrypt.hash(pwdPassword, SALT_ROUNDS);

    const [pwdLoginResult] = await db.query(
      `INSERT INTO pwd_user_login 
       (pwd_id, login_username, password_hash, can_view_own_record, is_active)
       VALUES (?, ?, ?, TRUE, TRUE)`,
      [pwdId, pwdId, pwdHash]
    );

    console.log(`   ✅ PWD Login credentials created (Login ID: ${pwdLoginResult.insertId})`);
    console.log(`   📌 Username (PWD ID): ${pwdId}`);
    console.log(`   📌 Password (Surname): ${pwdPassword}`);
    console.log(`   🔐 Hash: ${pwdHash}\n`);

    // ============================================
    // 6. Insert Sample Disability Types
    // ============================================
    console.log('📝 Checking Disability Types...');
    
    // Check if disability types already exist
    const [existingDisabilities] = await db.query(
      'SELECT COUNT(*) as count FROM disability_types'
    );

    if (existingDisabilities[0].count > 0) {
      console.log(`   ℹ️  ${existingDisabilities[0].count} disability types already exist. Skipping insertion.\n`);
    } else {
      console.log('📝 Inserting Disability Types...');
      const disabilityTypes = [
        ['Visual Impairment', 'Blindness or low vision'],
        ['Hearing Impairment', 'Deafness or hard of hearing'],
        ['Physical Disability', 'Mobility impairment or limb loss'],
        ['Mental/Psychiatric', 'Psychological or psychiatric conditions'],
        ['Developmental', 'Intellectual or developmental disabilities'],
        ['Chronic Illness', 'Long-term medical conditions'],
        ['Multiple Disabilities', 'More than one type of disability'],
      ];

      const [disabilityResult] = await db.query(
        `INSERT INTO disability_types (disability_name, description) 
         VALUES ${disabilityTypes.map(() => '(?, ?)').join(',')}`,
        disabilityTypes.flat()
      );

      console.log(`   ✅ ${disabilityResult.affectedRows} disability types inserted\n`);
    }

    // ============================================
    // 7. Summary
    // ============================================
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('📋 TEST CREDENTIALS:\n');

    console.log('🔑 Super Admin Login:');
    console.log('   Username: super_admin');
    console.log('   Password: password123\n');

    console.log('🔑 Admin Login:');
    console.log('   Username: admin_user');
    console.log('   Password: password123\n');

    console.log('🔑 PWD User Login (Unified):');
    console.log(`   ID Number: ${pwdId}`);
    console.log('   Password: Lopez\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📌 IMPORTANT NOTES:');
    console.log('   • All passwords are hashed using bcrypt with 10 salt rounds');
    console.log('   • To add more test users, run this script again');
    console.log('   • To reset: DELETE test accounts from database and run this script');
    console.log('   • Never hardcode passwords in SQL files');
    console.log('   • Always use bcrypt to hash passwords before storing\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Database seeding failed:', err);
    console.error('Error details:', err.message);
    process.exit(1);
  }
}

// Run seeding script
seedDatabase();
