/**
 * Beneficiary Claims Routes
 */

import express from 'express';
import * as ClaimsController from '../controllers/claims.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Staff routes
 */
router.get('/', verifyToken, authorizeRoles([2, 3]), ClaimsController.getAllClaims);
router.get('/pwd/:pwdId', verifyToken, authorizeRoles([2, 3]), ClaimsController.getClaimsForPwd);
router.get('/stats', verifyToken, authorizeRoles([2, 3]), ClaimsController.getClaimsStatistics);
router.get('/:claimId', verifyToken, authorizeRoles([2, 3]), ClaimsController.getClaimById);
router.post('/', verifyToken, authorizeRoles([2, 3]), ClaimsController.createClaim);
router.put('/:claimId', verifyToken, authorizeRoles([2, 3]), ClaimsController.updateClaimStatus);
router.delete('/:claimId', verifyToken, authorizeRoles([2]), ClaimsController.deleteClaim); // Admin only

export default router;
