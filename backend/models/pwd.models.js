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
    // Join to get the primary disability type (if any) for each user
    const [rows] = await db.query(
      `SELECT u.pwd_id, u.firstname, u.middlename, u.lastname, u.sex, u.birthdate, u.contact_no, u.address, u.registration_date, u.cluster_group_no, u.is_active,
        (
          SELECT dt.disability_name
          FROM pwd_disabilities pd
          JOIN disability_types dt ON pd.disability_id = dt.disability_id
          WHERE pd.pwd_id = u.pwd_id
          LIMIT 1
        ) AS disability_type
       FROM Nangka_PWD_user u
       ORDER BY u.registration_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM Nangka_PWD_user');

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
      `SELECT * FROM Nangka_PWD_user WHERE pwd_id = ?`,
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
    // PWD user login is stored separately in pwd_user_login; if needed, join
    const [rows] = await db.query(
      `SELECT n.* FROM Nangka_PWD_user n
       JOIN pwd_user_login l ON l.pwd_id = n.pwd_id
       WHERE l.login_username = ?`,
      [String(userId)]
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
      `SELECT pwd_id, firstname, middlename, lastname, contact_no
       FROM Nangka_PWD_user 
       WHERE firstname LIKE ? OR lastname LIKE ? OR CAST(pwd_id AS CHAR) LIKE ?
       ORDER BY lastname, firstname
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
    disabilityType, // new field
  } = pwdData;

  if (!firstName || !lastName || !contactNumber) {
    throw new Error('Required fields: firstName, lastName, contactNumber');
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Nangka_PWD_user 
       (firstname, middlename, lastname, sex, birthdate, civil_status, address, barangay, contact_no, disability_type, guardian_name, guardian_contact, cluster_group_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        middleName,
        lastName,
        gender || 'Male',
        dateOfBirth || null,
        civilStatus || 'Single',
        address || '',
        barangay || 'Nangka',
        contactNumber,
        disabilityType || null,
        emergencyContact || '',
        emergencyNumber || '',
        pwdData.clusterGroupNo || 1,
      ]
    );

    const newPwd = { pwd_id: result.insertId, firstname: firstName, middlename: middleName, lastname: lastName, birthdate: dateOfBirth, contact_no: contactNumber, barangay: barangay || 'Nangka', cluster_group_no: pwdData.clusterGroupNo || 1, disability_type: disabilityType || null };

    // If an admin/user created this, insert into PWD_MIS to record the assignment
    if (userId) {
      try {
        await db.query(
          `INSERT INTO PWD_MIS (pwd_id, person_id, registration_status) VALUES (?, ?, ?)`,
          [result.insertId, userId, 'registered']
        );
      } catch (innerErr) {
        // Log but don't fail the overall operation
        console.warn('Failed to insert into PWD_MIS:', innerErr.message);
      }
    }

    return newPwd;
  } catch (err) {
    throw err;
  }
};

/**
 * Update PWD registrant
 */
export const update = async (pwdId, updateData) => {
  const mapping = {
    registry_number: 'registry_number',
    first_name: 'firstname',
    middle_name: 'middlename',
    last_name: 'lastname',
    date_of_birth: 'birthdate',
    gender: 'sex',
    civil_status: 'civil_status',
    address: 'address',
    barangay: 'barangay',
    contact_number: 'contact_no',
    emergency_contact: 'guardian_name',
    emergency_number: 'guardian_contact',
    cluster_group_no: 'cluster_group_no',
    disability_type: 'disability_type',
  };

  const entries = Object.entries(updateData).filter(([key]) => Object.keys(mapping).includes(key));

  if (entries.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = entries.map(([key]) => `${mapping[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(pwdId);

  try {
    const [result] = await db.query(
      `UPDATE Nangka_PWD_user SET ${setClause} WHERE pwd_id = ?`,
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
      `DELETE FROM Nangka_PWD_user WHERE pwd_id = ?`,
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
      `SELECT * FROM Nangka_PWD_user WHERE pwd_id = ?`,
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
