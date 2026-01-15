import mysql from 'mysql2/promise';

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'nangka_mis'
    });

    await conn.execute(
      "ALTER TABLE nangka_pwd_user MODIFY registration_status enum('Active','Pending','Inactive','Disease') DEFAULT 'Active'"
    );
    
    console.log('✓ Database table updated successfully!');
    console.log('✓ registration_status now includes Disease option');
    
    conn.end();
  } catch (error) {
    console.error('✗ Error updating database:', error.message);
    process.exit(1);
  }
})();
