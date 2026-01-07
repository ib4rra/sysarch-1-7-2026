/**
 * PWD Registrant Model
 * Handles all PWD registrant database operations
 */

import db from '../config/db.js';

/**
 * Get all PWD registrants with pagination
 */
export const getAllRegistrants = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT pwd_id, registry_number, first_name, middle_name, last_name, 
              date_of_birth, gender, contact_number, address, created_at 
       FROM pwd_registrants 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM pwd_registrants');
    
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Find PWD by ID
 */
export const findById = async (pwdId) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM pwd_registrants WHERE pwd_id = ?`,
      [pwdId]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Find PWD by user ID
 */
export const findByUserId = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM pwd_registrants WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Search PWD registrants
 */
export const search = async (query) => {
  try {
    const searchTerm = `%${query}%`;
    const [rows] = await db.query(
      `SELECT pwd_id, registry_number, first_name, middle_name, last_name, contact_number
       FROM pwd_registrants 
       WHERE first_name LIKE ? OR last_name LIKE ? OR registry_number LIKE ?
       ORDER BY last_name, first_name
       LIMIT 50`,
      [searchTerm, searchTerm, searchTerm]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

/**
 * Create new PWD registrant
 */
export const create = async (pwdData) => {
  const {
    userId,
    registryNumber,
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    gender,
    civilStatus,
    address,
    barangay,
    contactNumber,
    emergencyContact,
    emergencyNumber,
  } = pwdData;

  if (!userId || !firstName || !lastName || !contactNumber) {
    throw new Error('Required fields: userId, firstName, lastName, contactNumber');
  }

  try {
    const [result] = await db.query(
      `INSERT INTO pwd_registrants 
       (user_id, registry_number, first_name, middle_name, last_name, 
        date_of_birth, gender, civil_status, address, barangay, 
        contact_number, emergency_contact, emergency_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        registryNumber,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        civilStatus,
        address,
        barangay,
        contactNumber,
        emergencyContact,
        emergencyNumber,
      ]
    );
    return { pwd_id: result.insertId, ...pwdData };
  } catch (err) {
    throw err;
  }
};

/**
 * Update PWD registrant
 */
export const update = async (pwdId, updateData) => {
  const allowed = [
    'registry_number',
    'first_name',
    'middle_name',
    'last_name',
    'date_of_birth',
    'gender',
    'civil_status',
    'address',
    'barangay',
    'contact_number',
    'emergency_contact',
    'emergency_number',
  ];

  const entries = Object.entries(updateData).filter(([key]) => allowed.includes(key));

  if (entries.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(pwdId);

  try {
    const [result] = await db.query(
      `UPDATE pwd_registrants SET ${setClause} WHERE pwd_id = ?`,
      values
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete PWD registrant
 */
export const delete_ = async (pwdId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM pwd_registrants WHERE pwd_id = ?`,
      [pwdId]
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

/**
 * Get PWD with disability information
 */
export const getPwdWithDisabilities = async (pwdId) => {
  try {
    const [pwdRows] = await db.query(
      `SELECT * FROM pwd_registrants WHERE pwd_id = ?`,
      [pwdId]
    );

    if (!pwdRows[0]) return null;

    const [disabilityRows] = await db.query(
      `SELECT pwd.*, dt.disability_name, dt.description
       FROM pwd_disabilities pwd
       JOIN disability_types dt ON pwd.disability_id = dt.disability_id
       WHERE pwd.pwd_id = ?`,
      [pwdId]
    );

    return {
      ...pwdRows[0],
      disabilities: disabilityRows,
    };
  } catch (err) {
    throw err;
  }
};
