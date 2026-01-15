/**
 * PWD Registrant Controller
 * Handles PWD registration and management
 */

import * as PwdModel from '../models/pwd.models.js';

import bcrypt from 'bcryptjs';
import { generatePwdId } from '../utils/pwdIdGenerator.js';
import db from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';


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

export const verifyRegistrant = async (req, res) => {
  const searchId = req.params.id;

  try {
    const query = `
        SELECT 
            pl.pwd_id AS formatted_id,
            pl.qr_image_path AS qr_image_path,
            u.pwd_id AS numeric_id,
            u.firstname,
            u.middlename,
            u.lastname,
            u.sex,
            u.birthdate,
            u.age,
            u.contact_no,
            u.hoa,
            u.registration_date,
            u.guardian_name,
            u.guardian_contact,
            u.address,
            u.cluster_group_no,
            dt.disability_name,
            u.disability_cause,
            u.registration_status
        FROM pwd_user_login pl
        JOIN Nangka_PWD_user u ON pl.numeric_pwd_id = u.pwd_id
        LEFT JOIN disability_types dt ON u.disability_type = dt.disability_id
        WHERE pl.pwd_id = ? 
    `;

    // Use the imported db connection
    const [rows] = await db.execute(query, [searchId]);

    if (rows.length === 0) {
      return res.json({ 
        success: false, 
        message: "ID not found in Nangka MIS database." 
      });
    }

    const user = rows[0];
    
    return res.json({
      success: true,
      data: {
        id: user.formatted_id,
        formattedPwdId: user.formatted_id,
        qrImagePath: user.qr_image_path || null,
        qr_image_path: user.qr_image_path || null,
        pwd_id: user.numeric_id,
        firstName: user.firstname,
        middleName: user.middlename,
        lastName: user.lastname,
        sex: user.sex,
        birthdate: user.birthdate,
        age: user.age,
        contactNumber: user.contact_no,
        contactNo: user.contact_no,
        hoa: user.hoa,
        dateRegistered: user.registration_date,
        registration_date: user.registration_date,
        guardian: user.guardian_name,
        guardianContact: user.guardian_contact,
        address: user.address,
        clusterGroupNo: user.cluster_group_no,
        disabilityType: user.disability_name || 'Unspecified',
        disabilityCause: user.disability_cause || null,
        status: user.registration_status || null
      }
    });

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error checking ID" 
    });
  }
};

// Internal helper to generate and save a QR image and update DB
async function generateAndStoreQr(formattedId) {
  // Prepare uploads dir
  const uploadsDir = path.join(process.cwd(), 'backend', 'uploads', 'qr');
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = `qr-${String(formattedId).replace(/[^a-zA-Z0-9-_\.]/g, '_')}.png`;
  const outPath = path.join(uploadsDir, safeName);

  // Generate PNG buffer
  const buffer = await QRCode.toBuffer(String(formattedId), { type: 'png', width: 300, margin: 1 });
  await fs.writeFile(outPath, buffer);

  // Relative path stored in DB (uploads/qr/<name>)
  const dbPath = `uploads/qr/${safeName}`;

  // Update any matching login rows (by formatted or numeric id)
  await db.execute(`UPDATE pwd_user_login SET qr_image_path = ? WHERE pwd_id = ? OR numeric_pwd_id = ?`, [dbPath, formattedId, formattedId]);

  return `/${dbPath}`; // public path
}

export const generateQrImage = async (req, res) => {
  const { pwdId } = req.params;
  if (!pwdId) return res.status(400).json({ success: false, message: 'PWD id is required' });

  try {
    // Resolve a formatted id (prefer existing formatted pwd_id if present)
    const [rows] = await db.execute(`SELECT pwd_id, numeric_pwd_id FROM pwd_user_login WHERE pwd_id = ? OR numeric_pwd_id = ? LIMIT 1`, [pwdId, pwdId]);
    const login = rows[0];
    if (!login) return res.status(404).json({ success: false, message: 'PWD login not found' });

    const formattedId = login.pwd_id || String(pwdId);
    const publicPath = await generateAndStoreQr(formattedId);

    return res.json({ success: true, path: publicPath });
  } catch (err) {
    console.error('Error generating QR image:', err);
    return res.status(500).json({ success: false, message: 'Server error generating QR image' });
  }
};

export const getQrImage = async (req, res) => {
  const { pwdId } = req.params;
  if (!pwdId) return res.status(400).json({ success: false, message: 'PWD id is required' });

  try {
    const [rows] = await db.execute(
      `SELECT qr_image_path FROM pwd_user_login WHERE pwd_id = ? OR numeric_pwd_id = ? LIMIT 1`,
      [pwdId, pwdId]
    );

    const row = rows[0];

    if (!row || !row.qr_image_path) {
      // No stored image, generate one and then redirect to the new asset
      try {
        const pathOnDisk = await generateAndStoreQr(pwdId);
        return res.redirect(pathOnDisk);
      } catch (genErr) {
        console.warn('QR generation failed in getQrImage:', genErr.message || genErr);
        const generatorUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pwdId)}`;
        return res.redirect(generatorUrl);
      }
    }

    let qrPath = String(row.qr_image_path || '').trim();

    // If stored as full URL, redirect there
    if (qrPath.match(/^https?:\/\//i)) return res.redirect(qrPath);

    // Normalize relative paths to the /uploads static route
    if (!qrPath.startsWith('/')) {
      if (qrPath.startsWith('uploads')) qrPath = '/' + qrPath;
      else qrPath = '/uploads/' + qrPath;
    }

    // Redirect to the static uploads path (served by express)
    return res.redirect(qrPath);
  } catch (err) {
    console.error('Error fetching QR image:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
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

    // Log activity
    try {
      await db.query(
        `INSERT INTO activity_logs (person_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)`,
        [finalUserId, 'add', 'PWD', pwd.pwd_id]
      );
    } catch (logErr) {
      console.warn('Failed to log activity:', logErr.message);
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

    // If caller toggled login active status, update pwd_user_login table
    if (updateData.hasOwnProperty('isActive') || updateData.hasOwnProperty('is_active')) {
      const isActive = updateData.isActive !== undefined ? !!updateData.isActive : !!updateData.is_active;
      try {
        await PwdModel.updateLoginActive(pwdId, isActive);
      } catch (loginErr) {
        console.warn('Failed to update login active flag:', loginErr.message || loginErr);
      }
    }

    // Fetch and return the updated record (includes login info now)
    const updatedPwd = await PwdModel.getPwdWithDisabilities(pwdId);
    // Log activity with details of changed fields
    try {
      const changedFields = Object.keys(updateData).join(', ');
      await db.query(
        `INSERT INTO activity_logs (person_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
        [req.userId || null, 'edit', 'PWD', pwdId, `Changed fields: ${changedFields}`]
      );
    } catch (logErr) {
      console.warn('Failed to log activity:', logErr.message);
    }

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

    // Fetch record before delete for logging
    const record = await PwdModel.getPwdWithDisabilities(pwdId);
    const affectedRows = await PwdModel.delete_(pwdId);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'PWD registrant not found',
      });
    }

    // Log activity with deleted record details
    try {
      await db.query(
        `INSERT INTO activity_logs (person_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
        [req.userId || null, 'delete', 'PWD', pwdId, `Deleted record: ${record ? JSON.stringify({ name: record.firstname + ' ' + record.lastname, id: record.formattedPwdId || record.pwd_id }) : 'N/A'}`]
      );
    } catch (logErr) {
      console.warn('Failed to log activity:', logErr.message);
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
