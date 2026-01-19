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

    // Ensure `cluster_group_area` column exists on Nangka_PWD_user
    try {
      await connection.query(`ALTER TABLE Nangka_PWD_user ADD COLUMN IF NOT EXISTS cluster_group_area CHAR(1) DEFAULT NULL COMMENT 'Area letter (A, B, C, or D)'`);
      console.log('✅ Ensured cluster_group_area column exists on Nangka_PWD_user');
    } catch (err) {
      console.warn('⚠️ Could not add cluster_group_area column (maybe it already exists):', err.message);
    }

    // Create cluster_area_definitions table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS cluster_area_definitions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cluster_no INT NOT NULL,
          area_letter CHAR(1) NOT NULL,
          area_name VARCHAR(255) NOT NULL,
          UNIQUE KEY unique_cluster_area (cluster_no, area_letter),
          KEY idx_cluster (cluster_no)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Cluster area definitions table created/verified');
    } catch (err) {
      console.warn('⚠️ Could not create cluster_area_definitions table:', err.message);
    }

    // Insert area definitions
    try {
      const areaDefinitions = [
        // Cluster 1
        [1, 'A', 'Nangka Centro'],
        [1, 'B', 'Old J.P. Rizal & J.P. Rizal'],
        [1, 'C', 'Marikit'],
        [1, 'D', 'Permaline'],
        // Cluster 2
        [2, 'A', 'Twin River Subdivision & Bayabas Extension'],
        [2, 'B', 'Camacho Phase 1 & 2'],
        // Cluster 3
        [3, 'A', 'Balubad Settlement Phase 1 & 2'],
        [3, 'B', 'PIDAMANA'],
        // Cluster 4
        [4, 'A', 'Area 1, 2, 3, & 4'],
        [4, 'B', 'Twinville Subdivision part of Nangka'],
        // Cluster 5
        [5, 'A', 'Greenland Phase 1 & 2'],
        [5, 'B', 'Ateneo Ville'],
        [5, 'C', 'Greenheights Phase 3 & 4'],
        [5, 'D', 'St. Benedict & Jaybee Subdivision'],
        // Cluster 6
        [6, 'A', 'Libya Extension'],
        [6, 'B', 'Bagong Silang'],
        [6, 'C', 'St. Mary'],
        [6, 'D', 'Hampstead'],
        // Cluster 7
        [7, 'A', 'Marikina Village'],
        [7, 'B', 'Tierra Vista'],
        [7, 'C', 'Anastacia'],
        [7, 'D', 'Mira Verde']
      ];

      for (const [clusterNo, areaLetter, areaName] of areaDefinitions) {
        await connection.query(
          `INSERT IGNORE INTO cluster_area_definitions (cluster_no, area_letter, area_name) VALUES (?, ?, ?)`,
          [clusterNo, areaLetter, areaName]
        );
      }
      console.log('✅ Cluster area definitions inserted/verified');
    } catch (err) {
      console.warn('⚠️ Could not insert cluster area definitions:', err.message);
    }



    console.log('✅ Database tables initialized');
    connection.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    // Don't exit on error to allow graceful handling
  }
}
