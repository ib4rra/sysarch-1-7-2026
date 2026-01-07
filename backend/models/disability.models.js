/**
 * Disability Model
 * Handles disability records and types
 */

import db from '../config/db.js';

/**
 * Get all disability types
 */
export const getAllDisabilityTypes = async () => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM disability_types ORDER BY disability_name`
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

/**
 * Get disability type by ID
 */
export const getDisabilityTypeById = async (disabilityId) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM disability_types WHERE disability_id = ?`,
      [disabilityId]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Add disability record for PWD
 */
export const addDisabilityRecord = async (pwdId, disabilityData) => {
  const {
    disabilityId,
    severityLevel,
    disabilityPercentage,
    disabilityCertificateNumber,
    certificateDate,
    issuedBy,
    notes,
  } = disabilityData;

  if (!pwdId || !disabilityId) {
    throw new Error('Required fields: pwdId, disabilityId');
  }

  try {
    const [result] = await db.query(
      `INSERT INTO pwd_disabilities 
       (pwd_id, disability_id, severity_level, disability_percentage, 
        disability_certificate_number, certificate_date, issued_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pwdId,
        disabilityId,
        severityLevel,
        disabilityPercentage,
        disabilityCertificateNumber,
        certificateDate,
        issuedBy,
        notes,
      ]
    );
    return { record_id: result.insertId, ...disabilityData };
  } catch (err) {
    throw err;
  }
};

/**
 * Get disability records for PWD
 */
export const getPwdDisabilities = async (pwdId) => {
  try {
    const [rows] = await db.query(
      `SELECT pd.*, dt.disability_name, dt.description
       FROM pwd_disabilities pd
       JOIN disability_types dt ON pd.disability_id = dt.disability_id
       WHERE pd.pwd_id = ?
       ORDER BY pd.created_at DESC`,
      [pwdId]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

/**
 * Update disability record
 */
export const updateDisabilityRecord = async (recordId, updateData) => {
  const allowed = [
    'severity_level',
    'disability_percentage',
    'disability_certificate_number',
    'certificate_date',
    'issued_by',
    'notes',
  ];

  const entries = Object.entries(updateData).filter(([key]) => allowed.includes(key));

  if (entries.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(recordId);

  try {
    const [result] = await db.query(
      `UPDATE pwd_disabilities SET ${setClause} WHERE record_id = ?`,
      values
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete disability record
 */
export const deleteDisabilityRecord = async (recordId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM pwd_disabilities WHERE record_id = ?`,
      [recordId]
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};
