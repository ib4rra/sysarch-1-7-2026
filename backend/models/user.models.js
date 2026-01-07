import db from '../config/db.js';

/**
 * User Model - Generic CRUD operations
 * Extend this with your specific user logic
 */

/**
 * Find user by email
 */
export const findByEmail = async (email) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Find user by ID
 */
export const findById = async (userId) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Get all users
 */
export const getAll = async () => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role_id, created_at FROM users');
    return rows;
  } catch (err) {
    throw err;
  }
};

/**
 * Create new user
 */
export const create = async (userData) => {
  const { username, email, password, roleId = 1 } = userData;

  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }

  try {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
      [username, email, password, roleId]
    );
    return { user_id: result.insertId, username, email, role_id: roleId };
  } catch (err) {
    throw err;
  }
};

/**
 * Update user
 */
export const update = async (userId, updateData) => {
  const allowed = ['username', 'email', 'password', 'role_id'];
  const entries = Object.entries(updateData).filter(([key]) => allowed.includes(key));

  if (entries.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(userId);

  try {
    const [result] = await db.query(`UPDATE users SET ${setClause} WHERE user_id = ?`, values);
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete user
/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};
