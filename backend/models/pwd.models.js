/**
 * PWD Registrant Model
 * Handles all PWD registrant database operations
 */

import db from '../config/db.js';

/**
 * Calculate age from birthdate
 */
const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Get all PWD registrants with pagination
 */
export const getAllRegistrants = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    // Fetch registrants with their formatted PWD IDs using LEFT JOIN
    const [rows] = await db.query(
      `SELECT u.pwd_id, u.firstname, u.middlename, u.lastname, u.suffix, u.sex, u.birthdate, u.age, u.contact_no, u.address, u.hoa, u.disability_type, u.disability_cause, u.registration_status, u.guardian_name, u.guardian_contact, u.registration_date, u.cluster_group_no, u.is_active, u.tag_no, l.pwd_id as formattedPwdId, l.qr_image_path as qr_image_path
       FROM Nangka_PWD_user u
       LEFT JOIN pwd_user_login l ON l.numeric_pwd_id = u.pwd_id
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
      `SELECT pwd_id, firstname, middlename, lastname, suffix, contact_no
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
    suffix,
    dateOfBirth,
    gender,
    civilStatus,
    hoa,
    address,
    barangay,
    contactNumber,
    tagNo,
    emergencyContact,
    emergencyNumber,
    disabilityType,
    disabilityCause,
    registrationStatus,
    clusterGroupNo,
  } = pwdData;

  if (!firstName || !lastName || !contactNumber) {
    throw new Error('Required fields: firstName, lastName, contactNumber');
  }

  try {
    const age = calculateAge(dateOfBirth);
    const [result] = await db.query(
      `INSERT INTO Nangka_PWD_user 
       (firstname, middlename, lastname, suffix, sex, birthdate, age, civil_status, hoa, address, barangay, contact_no, tag_no, disability_type, disability_cause, registration_status, guardian_name, guardian_contact, cluster_group_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        middleName,
        lastName,
        suffix || null,
        gender || 'Male',
        dateOfBirth || null,
        age,
        civilStatus || 'Single',
        hoa || null,
        address || '',
        barangay || 'Nangka',
        contactNumber,
        tagNo || null,
        disabilityType || null,
        disabilityCause || null,
        registrationStatus || 'Active',
        emergencyContact || '',
        emergencyNumber || '',
        clusterGroupNo || 1,
      ]
    );

    const newPwd = { 
      pwd_id: result.insertId, 
      firstname: firstName, 
      middlename: middleName, 
      lastname: lastName,
      suffix: suffix || null,
      birthdate: dateOfBirth, 
      age: age,
      contact_no: contactNumber, 
      barangay: barangay || 'Nangka', 
      cluster_group_no: clusterGroupNo || 1, 
      disability_type: disabilityType || null,
      disability_cause: disabilityCause || null,
      registration_status: registrationStatus || 'Active',
      hoa: hoa || null,
    };

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
    firstName: 'firstname',
    middleName: 'middlename',
    lastName: 'lastname',
    suffix: 'suffix',
    dateOfBirth: 'birthdate',
    gender: 'sex',
    civilStatus: 'civil_status',
    hoa: 'hoa',
    address: 'address',
    barangay: 'barangay',
    contactNumber: 'contact_no',
    tagNo: 'tag_no',
    emergencyContact: 'guardian_name',
    emergencyNumber: 'guardian_contact',
    disabilityType: 'disability_type',
    disabilityCause: 'disability_cause',
    registrationStatus: 'registration_status',
    clusterGroupNo: 'cluster_group_no',
  };

  const entries = Object.entries(updateData).filter(([key]) => Object.keys(mapping).includes(key));

  if (entries.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Calculate age if birthdate is being updated
  const setClause = entries.map(([key]) => {
    if (key === 'dateOfBirth') {
      return `${mapping[key]} = ?, age = ?`;
    }
    return `${mapping[key]} = ?`;
  }).join(', ');

  const values = entries.map(([key, value]) => {
    const result = [value];
    if (key === 'dateOfBirth') {
      result.push(calculateAge(value));
    }
    return result;
  }).flat();
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

    // Fetch formatted PWD ID, QR path and login active flag from pwd_user_login
    const [loginRows] = await db.query(
      `SELECT pwd_id, qr_image_path, is_active FROM pwd_user_login WHERE numeric_pwd_id = ? OR pwd_id = ? LIMIT 1`,
      [pwdId, pwdId]
    );

    const [disabilityRows] = await db.query(
      `SELECT pwd.*, dt.disability_name, dt.description
       FROM pwd_disabilities pwd
       JOIN disability_types dt ON pwd.disability_id = dt.disability_id
       WHERE pwd.pwd_id = ?`,
      [pwdId]
    );

    return {
      ...pwdRows[0],
      formattedPwdId: loginRows[0]?.pwd_id || null,
      qr_image_path: loginRows[0]?.qr_image_path || null,
      is_active: loginRows[0]?.is_active || 0,
      disabilities: disabilityRows,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Get PWD ID from pwd_user_login by login_id
 * Joins pwd_user_login with Nangka_PWD_user to fetch complete PWD information
 */
export const getPwdIdByLoginId = async (loginId) => {
  try {
    const [rows] = await db.query(
      `SELECT n.*, l.login_id, l.password_hash, l.last_login, l.is_active, l.created_at, l.pwd_id as formattedPwdId, l.qr_image_path as qr_image_path
       FROM pwd_user_login l
       JOIN Nangka_PWD_user n ON l.numeric_pwd_id = n.pwd_id
       WHERE l.login_id = ?`,
      [loginId]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};
