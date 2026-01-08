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

    // Execute table creation queries
    // await connection.execute(createUsersTableQuery);
    // await connection.execute(createRolesTableQuery);

    // Ensure `cluster_group_no` column exists for PWD records (used by analytics and cluster features)
    try {
      await connection.execute(`ALTER TABLE Nangka_PWD_user ADD COLUMN IF NOT EXISTS cluster_group_no INT DEFAULT 1`);
      console.log('✅ Ensured column `cluster_group_no` exists on Nangka_PWD_user');
    } catch (colErr) {
      console.warn('⚠️ Could not ensure `cluster_group_no` column:', colErr.message);
    }

    console.log('✅ Database tables initialized');
    connection.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    // Don't exit on error to allow graceful handling
  }
}
