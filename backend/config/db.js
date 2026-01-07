import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nangka_mis',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
try {
  const connection = await pool.getConnection();
  console.log('✅ MySQL Connected...');
  connection.release();
} catch (err) {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
}

export default pool;
