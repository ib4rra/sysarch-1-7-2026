/**
 * Disability Controller
 * Handles disability records for PWD
 */

import * as DisabilityModel from '../models/disability.models.js';

/**
 * Get all disability types
 */
export const getDisabilityTypes = async (req, res) => {
  try {
    const types = await DisabilityModel.getAllDisabilityTypes();

    res.json({
      success: true,
      message: 'Disability types fetched successfully',
      data: types,
    });
  } catch (err) {
    console.error('Error fetching disability types:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch disability types',
    });
  }
};

/**
 * Get disabilities for PWD
 */
export const getPwdDisabilities = async (req, res) => {
  try {
    const { pwdId } = req.params;

    const disabilities = await DisabilityModel.getPwdDisabilities(pwdId);

    res.json({
      success: true,
      message: 'PWD disabilities fetched successfully',
      data: disabilities,
    });
  } catch (err) {
    console.error('Error fetching PWD disabilities:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch PWD disabilities',
    });
  }
};

/**
 * Add disability record
 */
export const addDisabilityRecord = async (req, res) => {
  try {
    const { pwdId } = req.params;
    const {
      disabilityId,
      severityLevel,
      disabilityPercentage,
      disabilityCertificateNumber,
      certificateDate,
      issuedBy,
      notes,
    } = req.body;

    if (!disabilityId) {
      return res.status(400).json({
        success: false,
        message: 'Disability ID is required',
      });
    }

    const record = await DisabilityModel.addDisabilityRecord(pwdId, {
      disabilityId,
      severityLevel,
      disabilityPercentage,
      disabilityCertificateNumber,
      certificateDate,
      issuedBy,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Disability record added successfully',
      data: record,
    });
  } catch (err) {
    console.error('Error adding disability record:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to add disability record',
    });
  }
};

/**
 * Update disability record
 */
export const updateDisabilityRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = req.body;

    const affectedRows = await DisabilityModel.updateDisabilityRecord(recordId, updateData);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disability record not found',
      });
    }

    res.json({
      success: true,
      message: 'Disability record updated successfully',
    });
  } catch (err) {
    console.error('Error updating disability record:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update disability record',
    });
  }
};

/**
 * Delete disability record
 */
export const deleteDisabilityRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    const affectedRows = await DisabilityModel.deleteDisabilityRecord(recordId);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disability record not found',
      });
    }

    res.json({
      success: true,
      message: 'Disability record deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting disability record:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete disability record',
    });
  }
};
