/**
 * Beneficiary Claims Controller
 * Handles claims and disbursements for PWD
 */

import * as ClaimsModel from '../models/claims.models.js';

/**
 * Get all claims
 */
export const getAllClaims = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // Optional filter

    let result = await ClaimsModel.getAllClaims(page, limit);

    // Filter by status if provided
    if (status) {
      result.data = result.data.filter(claim => claim.status === status);
    }

    res.json({
      success: true,
      message: 'Claims fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('Error fetching claims:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch claims',
    });
  }
};

/**
 * Get claims for specific PWD
 */
export const getClaimsForPwd = async (req, res) => {
  try {
    const { pwdId } = req.params;

    const claims = await ClaimsModel.getClaimsForPwd(pwdId);

    res.json({
      success: true,
      message: 'PWD claims fetched successfully',
      data: claims,
    });
  } catch (err) {
    console.error('Error fetching PWD claims:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch PWD claims',
    });
  }
};

/**
 * Get claim by ID
 */
export const getClaimById = async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await ClaimsModel.getClaimById(claimId);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    res.json({
      success: true,
      message: 'Claim fetched successfully',
      data: claim,
    });
  } catch (err) {
    console.error('Error fetching claim:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch claim',
    });
  }
};

/**
 * Create new claim
 */
export const createClaim = async (req, res) => {
  try {
    const { pwdId, programId, claimDate, claimAmount, notes } = req.body;

    if (!pwdId || !programId || !claimDate) {
      return res.status(400).json({
        success: false,
        message: 'PWD ID, program ID, and claim date are required',
      });
    }

    const claim = await ClaimsModel.createClaim({
      pwdId,
      programId,
      claimDate,
      claimAmount,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: claim,
    });
  } catch (err) {
    console.error('Error creating claim:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create claim',
    });
  }
};

/**
 * Update claim status
 */
export const updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, approvalDate, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const affectedRows = await ClaimsModel.updateClaimStatus(
      claimId,
      status,
      req.userId, // approved_by is current user
      approvalDate,
      notes
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    res.json({
      success: true,
      message: 'Claim status updated successfully',
    });
  } catch (err) {
    console.error('Error updating claim status:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update claim status',
    });
  }
};

/**
 * Delete claim
 */
export const deleteClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    const affectedRows = await ClaimsModel.deleteClaim(claimId);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    res.json({
      success: true,
      message: 'Claim deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting claim:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete claim',
    });
  }
};

/**
 * Get claims statistics (dashboard)
 */
export const getClaimsStatistics = async (req, res) => {
  try {
    const stats = await ClaimsModel.getClaimsStatistics();

    res.json({
      success: true,
      message: 'Claims statistics fetched successfully',
      data: stats,
    });
  } catch (err) {
    console.error('Error fetching claims statistics:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch statistics',
    });
  }
};
