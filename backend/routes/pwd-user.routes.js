import express from 'express';
import * as PwdUserController from '../controllers/pwd-user.controller.js';
import { verifyToken, verifyPwdUserAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * ============================================
 * PWD USER ROUTES (Limited Access)
 * ============================================
 * PWD users can only view their own information
 */

/**
 * Get own registration record
 * GET /pwd-user/me
 * @access Protected (PWD user only)
 */
router.get('/me', verifyToken, verifyPwdUserAccess, PwdUserController.getOwnRecord);

/**
 * Get own disabilities
 * GET /pwd-user/disabilities
 * @access Protected (PWD user only)
 */
router.get('/disabilities', verifyToken, verifyPwdUserAccess, PwdUserController.getOwnDisabilities);

/**
 * Get own claims status
 * GET /pwd-user/claims
 * @access Protected (PWD user only)
 */
router.get('/claims', verifyToken, verifyPwdUserAccess, PwdUserController.getOwnClaimsStatus);

/**
 * Verify registration
 * POST /pwd-user/verify
 * @access Protected (PWD user only)
 */
router.post('/verify', verifyToken, verifyPwdUserAccess, PwdUserController.verifyRegistration);

export default router;
