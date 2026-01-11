import db from './db.js';

/**
 * Initialize database tables
 * Add your table creation queries here
 */
export async function initializeDatabase() {
  try {
    const connection = await db.getConnection();

    // Example: Create a basic users table
    // Uncomment and modify based on your actual schema
    /*
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role_id INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    */

    // Example: Create a basic roles table
    // Uncomment and modify based on your actual schema
    /*
    const createRolesTableQuery = `
      CREATE TABLE IF NOT EXISTS roles (
        role_id INT PRIMARY KEY,
        role_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `;
    */

    // Ensure `qr_image_path` column exists on pwd_user_login
    try {
      await connection.query(`ALTER TABLE pwd_user_login ADD COLUMN IF NOT EXISTS qr_image_path VARCHAR(255) DEFAULT NULL`);
      console.log('✅ Ensured qr_image_path column exists on pwd_user_login');
    } catch (err) {
      console.warn('⚠️ Could not add qr_image_path column (maybe it already exists):', err.message);
    }

    console.log('✅ Database tables initialized');
    connection.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    // Don't exit on error to allow graceful handling
  }
}
