import db from '../config/db.js';

/**
 * Get PWD user own record (limited information)
 * Only returns fields that PWD user should see
 */
export const getPwdOwnRecord = async (pwdId) => {
  try {
    const [result] = await db.query(
      `SELECT 
        u.pwd_id,
        u.firstname,
        u.middlename,
        u.lastname,
        u.suffix,
        u.sex,
        u.birthdate,
        u.civil_status,
        u.contact_no,
        u.registration_date,
        l.is_active as login_active,
        l.pwd_id as formattedPwdId,
        l.qr_image_path
      FROM Nangka_PWD_user u
      LEFT JOIN pwd_user_login l ON l.numeric_pwd_id = u.pwd_id OR l.pwd_id = u.pwd_id
      WHERE u.pwd_id = ?`,
      [pwdId]
    );
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    throw err;
  }
};

/**
 * Get PWD user disabilities
 */
export const getPwdDisabilities = async (pwdId) => {
  try {
    const [result] = await db.query(
      `SELECT 
        pwd_disability_id,
        disability_id,
        dt.disability_name,
        pd.severity,
        pd.date_identified
      FROM pwd_disabilities pd
      JOIN disability_types dt ON pd.disability_id = dt.disability_id
      WHERE pd.pwd_id = ?
      ORDER BY pd.date_identified DESC`,
      [pwdId]
    );
    return result;
  } catch (err) {
    throw err;
  }
};

/**
 * Get PWD user claims status
 */
export const getPwdClaimsStatus = async (pwdId) => {
  try {
    const [result] = await db.query(
      `SELECT 
        claim_id,
        claim_type,
        claim_date,
        status,
        updated_at
      FROM beneficiary_claims
      WHERE pwd_id = ?
      ORDER BY claim_date DESC
      LIMIT 10`,
      [pwdId]
    );
    return result;
  } catch (err) {
    throw err;
  }
};

/**
 * Check if PWD user exists
 */
export const pwdUserExists = async (pwdId) => {
  try {
    const [result] = await db.query(
      'SELECT pwd_id FROM Nangka_PWD_user WHERE pwd_id = ?',
      [pwdId]
    );
    return result.length > 0;
  } catch (err) {
    throw err;
  }
};

/**
 * Update login active flag on pwd_user_login
 */
export const updateLoginActive = async (pwdId, isActive) => {
  try {
    const [result] = await db.query(
      `UPDATE pwd_user_login SET is_active = ? WHERE numeric_pwd_id = ? OR pwd_id = ?`,
      [isActive ? 1 : 0, pwdId, pwdId]
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};
