/**
 * Template Model
 * Copy this file and customize for your needs
 */

import db from '../config/db.js';

// TODO: Replace 'items' with your actual table name

export const getAll = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM items');
    return rows;
  } catch (err) {
    throw err;
  }
};

export const findById = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

export const create = async (data) => {
  // TODO: Update fields based on your table structure
  const { field1, field2, field3 } = data;

  try {
    const [result] = await db.query(
      'INSERT INTO items (field1, field2, field3) VALUES (?, ?, ?)',
      [field1, field2, field3]
    );
    return { id: result.insertId, ...data };
  } catch (err) {
    throw err;
  }
};

export const update = async (id, updateData) => {
  // TODO: Define which fields are allowed to be updated
  const allowed = ['field1', 'field2', 'field3'];
  const entries = Object.entries(updateData).filter(([key]) => allowed.includes(key));

  if (entries.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(id);

  try {
    const [result] = await db.query(
      `UPDATE items SET ${setClause} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

export const delete_ = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};
