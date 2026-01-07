import db from '../config/db.js';

/**
 * Get PWD user own record (limited information)
 * Only returns fields that PWD user should see
 */
export const getPwdOwnRecord = async (pwdId) => {
  try {
    const [result] = await db.query(
      `SELECT 
        pwd_id,
        firstname,
        middlename,
        lastname,
        suffix,
        sex,
        birthdate,
        civil_status,
        contact_no,
        registration_date
      FROM Nangka_PWD_user 
      WHERE pwd_id = ? AND is_active = TRUE`,
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
 * Check if PWD user exists and is active
 */
export const pwdUserExists = async (pwdId) => {
  try {
    const [result] = await db.query(
      'SELECT pwd_id FROM Nangka_PWD_user WHERE pwd_id = ? AND is_active = TRUE',
      [pwdId]
    );
    return result.length > 0;
  } catch (err) {
    throw err;
  }
};
