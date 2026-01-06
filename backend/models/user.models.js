const db = require('../config/db');

exports.findByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], callback);
};

exports.createUser = (username, email, password, role_id, callback) => {
  const sql = `INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)`;
  db.query(sql, [username, email, password, role_id], callback);
};

// New helpers aligned with schema (users.user_id, role_id, etc.)
exports.findById = (user_id, callback) => {
  const sql = 'SELECT * FROM users WHERE user_id = ?';
  db.query(sql, [user_id], callback);
};

exports.getAll = (callback) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, [], callback);
};

exports.updateUser = (user_id, fields, callback) => {
  const allowed = ['username', 'email', 'password', 'role_id'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return callback(null, { affectedRows: 0 });

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  const sql = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
  db.query(sql, [...values, user_id], callback);
};

exports.deleteUser = (user_id, callback) => {
  const sql = 'DELETE FROM users WHERE user_id = ?';
  db.query(sql, [user_id], callback);
};
