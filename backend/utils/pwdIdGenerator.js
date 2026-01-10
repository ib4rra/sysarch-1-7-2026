import db from '../config/db.js';

/**
 * Generate PWD_ID in format: PWD-MRK-CL[cluster_no]-[year]-[auto_number]
 * Example: PWD-MRK-CL01-2026-0001
 * 
 * The ID is unique per cluster per year. When a new year starts, the counter resets to 0001.
 * 
 * @param {number} clusterNo - The cluster/group number (e.g., 1, 2, 3)
 * @param {number} year - The registration year (defaults to current year)
 * @returns {Promise<string>} The generated PWD_ID in format PWD-MRK-CL##-####-####
 * @throws {Error} If database query fails
 */
export const generatePwdId = async (clusterNo = 1, year = new Date().getFullYear()) => {
  try {
    // Convert to integer if string
    const clusterInt = Number.isInteger(clusterNo) ? clusterNo : parseInt(clusterNo, 10);
    const yearInt = Number.isInteger(year) ? year : parseInt(year, 10);
    
    // Validate inputs
    if (isNaN(clusterInt) || clusterInt < 1 || clusterInt > 99) {
      throw new Error('Cluster number must be between 1 and 99');
    }
    
    if (isNaN(yearInt) || yearInt < 2000 || yearInt > 2099) {
      throw new Error('Year must be between 2000 and 2099');
    }

    // Ensure cluster number is zero-padded to 2 digits
    const formattedCluster = String(clusterInt).padStart(2, '0');
    
    // Count existing PWD records for this cluster in this year
    // Using YEAR() function to extract year from registration_date
    const [result] = await db.query(
      `SELECT COUNT(*) as count FROM Nangka_PWD_user 
       WHERE YEAR(registration_date) = ? 
       AND cluster_group_no = ?`,
      [yearInt, clusterInt]
    );

    // Get the next auto-increment number
    // Adding 1 to count to get the next sequential number
    const nextNumber = (result[0].count + 1);
    
    // Validate we haven't exceeded the maximum (9999)
    if (nextNumber > 9999) {
      throw new Error(
        `Maximum PWD registrations (9999) exceeded for Cluster ${clusterNo} in year ${year}`
      );
    }
    
    // Zero-pad the number to 4 digits (0001, 0002, ..., 9999)
    const formattedNumber = String(nextNumber).padStart(4, '0');

    // Construct and return the formatted PWD_ID
    const pwdId = `PWD-MRK-CL${formattedCluster}-${yearInt}-${formattedNumber}`;

    return pwdId;
  } catch (err) {
    throw new Error(`Failed to generate PWD_ID: ${err.message}`);
  }
};

/**
 * Parse PWD_ID to extract components
 * Useful for validating and understanding PWD_ID structure
 * 
 * @param {string} pwdId - The PWD_ID to parse (e.g., "PWD-MRK-CL01-2026-0001")
 * @returns {Object} Object with structure: { cluster: number, year: number, number: number }
 * @throws {Error} If PWD_ID format is invalid
 * 
 * @example
 * const parsed = parsePwdId('PWD-MRK-CL01-2026-0001');
 * // Returns: { cluster: 1, year: 2026, number: 1 }
 */
export const parsePwdId = (pwdId) => {
  // Regex pattern to match: PWD-MRK-CL##-####-####
  const pattern = /^PWD-MRK-CL(\d{2})-(\d{4})-(\d{4})$/;
  const match = pwdId.match(pattern);
  
  if (!match) {
    throw new Error(
      `Invalid PWD_ID format. Expected format: PWD-MRK-CL##-####-#### (e.g., PWD-MRK-CL01-2026-0001)`
    );
  }

  return {
    cluster: parseInt(match[1]),
    year: parseInt(match[2]),
    number: parseInt(match[3]),
  };
};
