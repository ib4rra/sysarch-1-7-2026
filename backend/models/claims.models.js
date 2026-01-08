/**
 * Beneficiary Claims Model
 * Handles assistance claims for PWD
 */

import db from '../config/db.js';

/**
 * Get all claims with pagination
 */
export const getAllClaims = async (page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT bc.*, 
              CONCAT(pr.firstname, ' ', pr.lastname) as pwd_name,
              ap.program_name,
              CONCAT(u.first_name, ' ', u.last_name) as approved_by_name
       FROM beneficiary_claims bc
       LEFT JOIN Nangka_PWD_user pr ON bc.pwd_id = pr.pwd_id
       LEFT JOIN assistance_programs ap ON bc.program_id = ap.program_id
       LEFT JOIN users u ON bc.approved_by = u.user_id
       ORDER BY bc.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM beneficiary_claims');

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
 * Get claims for specific PWD
 */
export const getClaimsForPwd = async (pwdId) => {
  try {
    const [rows] = await db.query(
      `SELECT bc.*, ap.program_name, ap.program_type, ap.monthly_benefit
       FROM beneficiary_claims bc
       LEFT JOIN assistance_programs ap ON bc.program_id = ap.program_id
       WHERE bc.pwd_id = ?
       ORDER BY bc.claim_date DESC`,
      [pwdId]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

/**
 * Get claim by ID
 */
export const getClaimById = async (claimId) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM beneficiary_claims WHERE claim_id = ?`,
      [claimId]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

/**
 * Create new claim
 */
export const createClaim = async (claimData) => {
  const { pwdId, programId, claimDate, claimAmount, notes } = claimData;

  if (!pwdId || !programId || !claimDate) {
    throw new Error('Required fields: pwdId, programId, claimDate');
  }

  try {
    const [result] = await db.query(
      `INSERT INTO beneficiary_claims 
       (pwd_id, program_id, claim_date, claim_amount, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [pwdId, programId, claimDate, claimAmount, notes]
    );
    return { claim_id: result.insertId, ...claimData };
  } catch (err) {
    throw err;
  }
};

/**
 * Update claim status
 */
export const updateClaimStatus = async (claimId, status, approvedBy, approvalDate, notes) => {
  try {
    const [result] = await db.query(
      `UPDATE beneficiary_claims 
       SET status = ?, approved_by = ?, approval_date = ?, notes = ?
       WHERE claim_id = ?`,
      [status, approvedBy, approvalDate, notes, claimId]
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete claim
 */
export const deleteClaim = async (claimId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM beneficiary_claims WHERE claim_id = ?`,
      [claimId]
    );
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
};

/**
 * Get claims statistics
 */
export const getClaimsStatistics = async () => {
  try {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_claims,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_claims,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_claims,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received_claims,
        SUM(CASE WHEN status = 'approved' THEN claim_amount ELSE 0 END) as total_disbursed
       FROM beneficiary_claims`
    );
    return stats[0];
  } catch (err) {
    throw err;
  }
};
