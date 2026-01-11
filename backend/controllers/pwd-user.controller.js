import * as PwdUserModel from '../models/pwd-user.models.js';

/**
 * Get PWD user own record
 * @route GET /pwd-user/me
 * @access Protected (PWD user only)
 */
export const getOwnRecord = async (req, res) => {
  try {
    const pwdId = req.pwdId;

    // Get limited record information (includes login status)
    const record = await PwdUserModel.getPwdOwnRecord(pwdId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    // Get disabilities
    const disabilities = await PwdUserModel.getPwdDisabilities(pwdId);

    // Get claims status
    const claims = await PwdUserModel.getPwdClaimsStatus(pwdId);

    // Normalize returned personal info to include a boolean flag for account active
    const personalInfo = {
      ...record,
      isActive: !!record.login_active,
      login_active: !!record.login_active,
    };

    res.json({
      success: true,
      data: {
        personal_info: personalInfo,
        disabilities: disabilities || [],
        recent_claims: claims || [],
      },
    });
  } catch (err) {
    console.error('Get own record error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve record',
    });
  }
};

/**
 * Get PWD user disabilities only
 * @route GET /pwd-user/disabilities
 * @access Protected (PWD user only)
 */
export const getOwnDisabilities = async (req, res) => {
  try {
    const pwdId = req.pwdId;

    const disabilities = await PwdUserModel.getPwdDisabilities(pwdId);

    res.json({
      success: true,
      data: disabilities || [],
    });
  } catch (err) {
    console.error('Get disabilities error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disabilities',
    });
  }
};

/**
 * Get PWD user claims status
 * @route GET /pwd-user/claims
 * @access Protected (PWD user only)
 */
export const getOwnClaimsStatus = async (req, res) => {
  try {
    const pwdId = req.pwdId;

    const claims = await PwdUserModel.getPwdClaimsStatus(pwdId);

    res.json({
      success: true,
      data: claims || [],
    });
  } catch (err) {
    console.error('Get claims status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve claims',
    });
  }
};

/**
 * Verify PWD registration (simple verification endpoint)
 * @route POST /pwd-user/verify
 * @access Protected (PWD user only)
 */
export const verifyRegistration = async (req, res) => {
  try {
    const pwdId = req.pwdId;

    const exists = await PwdUserModel.pwdUserExists(pwdId);

    res.json({
      success: true,
      data: {
        registered: exists,
        pwd_id: pwdId,
        message: exists
          ? 'You are officially registered in Barangay Nangka PWD MIS'
          : 'Registration not found',
      },
    });
  } catch (err) {
    console.error('Verify registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
};
