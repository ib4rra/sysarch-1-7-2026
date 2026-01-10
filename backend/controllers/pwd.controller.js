/**
 * PWD Registrant Controller
 * Handles PWD registration and management
 */

import * as PwdModel from '../models/pwd.models.js';
import bcrypt from 'bcryptjs';
import { generatePwdId } from '../utils/pwdIdGenerator.js';
import db from '../config/db.js';


/**
 * Get PWD ID from pwd_user_login by login_id
 * Fetches pwd_id from pwd_user_login and joins with Nangka_PWD_user for complete information
 */
export const getPwdID = async (req, res) => {
  try {
    const { loginId } = req.params;

    if (!loginId) {
      return res.status(400).json({
        success: false,
        message: 'Login ID is required',
      });
    }

    const pwdData = await PwdModel.getPwdIdByLoginId(loginId);

    if (!pwdData) {
      return res.status(404).json({
        success: false,
        message: 'PWD record not found for the given login ID',
      });
    }

    res.json({
      success: true,
      message: 'PWD ID retrieved successfully',
      data: pwdData,
    });
  } catch (err) {
    console.error('Error fetching PWD ID:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch PWD ID',
    });
  }
};
  



/**
 * Get all PWD registrants
 */
export const getAllRegistrants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await PwdModel.getAllRegistrants(page, limit);

    res.json({
      success: true,
      message: 'PWD registrants fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('Error fetching registrants:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch registrants',
    });
  }
};

/**
 * Get PWD by ID
 */
export const getRegistrantById = async (req, res) => {
  try {
    const { pwdId } = req.params;

    const pwd = await PwdModel.getPwdWithDisabilities(pwdId);

    if (!pwd) {
      return res.status(404).json({
        success: false,
        message: 'PWD registrant not found',
      });
    }

    res.json({
      success: true,
      message: 'PWD registrant fetched successfully',
      data: pwd,
    });
  } catch (err) {
    console.error('Error fetching registrant:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch registrant',
    });
  }
};

/**
 * Search PWD registrants
 */
export const searchRegistrants = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const results = await PwdModel.search(query);

    res.json({
      success: true,
      message: 'Search completed',
      data: results,
    });
  } catch (err) {
    console.error('Error searching registrants:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Search failed',
    });
  }
};

/**
 * Create new PWD registrant
 */
export const createRegistrant = async (req, res) => {
  try {
    const {
      userId,
      registryNumber,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      civilStatus,
      hoa,
      address,
      barangay,
      contactNumber,
      emergencyContact,
      emergencyNumber,
      disabilityType,
      disabilityCause,
      registrationStatus,
      clusterGroupNo,
    } = req.body;

    // allow staff identity from token if userId not supplied
    const finalUserId = userId || req.userId || null;

    if (!finalUserId) {
      return res.status(400).json({ success: false, message: 'userId is required (admin id).' });
    }

    // Validation
    if (!firstName || !lastName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and contact number are required',
      });
    }

    const pwd = await PwdModel.create({
      userId: finalUserId,
      registryNumber,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      civilStatus,
      hoa,
      address,
      barangay,
      contactNumber,
      emergencyContact,
      emergencyNumber,
      disabilityType,
      disabilityCause,
      registrationStatus,
      clusterGroupNo: clusterGroupNo || 1,
    });

    // After creating the registrant, create PWD user login credentials
    try {
      // Convert cluster number to integer (form data comes as string)
      const clusterNum = parseInt(clusterGroupNo) || 1;
      
      // Generate formatted PWD_ID (e.g., PWD-MRK-CL01-2026-0001)
      const formattedPwdId = await generatePwdId(clusterNum);
      
      // Hash surname as password
      const hashedPassword = await bcrypt.hash(lastName, 10);
      
      // Get the numeric pwd_id from the created registrant
      const numericPwdId = pwd.pwd_id;
      
      // Create PWD login record with formatted PWD_ID and numeric reference
      const [loginResult] = await db.query(
        `INSERT INTO pwd_user_login (pwd_id, numeric_pwd_id, password_hash, is_active)
         VALUES (?, ?, ?, TRUE)`,
        [formattedPwdId, numericPwdId, hashedPassword]
      );

      // Add formatted PWD_ID to response
      pwd.formattedPwdId = formattedPwdId;
    } catch (loginErr) {
      console.error('Error creating PWD login credentials:', loginErr);
      // Return error response
      return res.status(500).json({
        success: false,
        message: 'Registrant created but failed to create login credentials: ' + loginErr.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'PWD registrant and login credentials created successfully',
      data: pwd,
    });
  } catch (err) {
    console.error('Error creating registrant:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create registrant',
    });
  }
};

/**
 * Update PWD registrant
 */
export const updateRegistrant = async (req, res) => {
  try {
    const { pwdId } = req.params;
    const updateData = req.body;

    const affectedRows = await PwdModel.update(pwdId, updateData);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'PWD registrant not found',
      });
    }

    // Fetch and return the updated record
    const updatedPwd = await PwdModel.getPwdWithDisabilities(pwdId);

    res.json({
      success: true,
      message: 'PWD registrant updated successfully',
      data: updatedPwd,
    });
  } catch (err) {
    console.error('Error updating registrant:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update registrant',
    });
  }
};

/**
 * Delete PWD registrant
 */
export const deleteRegistrant = async (req, res) => {
  try {
    const { pwdId } = req.params;

    const affectedRows = await PwdModel.delete_(pwdId);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'PWD registrant not found',
      });
    }

    res.json({
      success: true,
      message: 'PWD registrant deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting registrant:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete registrant',
    });
  }
};
