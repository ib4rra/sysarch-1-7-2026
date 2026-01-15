/**
 * Disability Routes
 */

import express from 'express';
import * as DisabilityController from '../controllers/disability.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/types', verifyToken, DisabilityController.getDisabilityTypes);
router.get('/conditions', verifyToken, DisabilityController.getAllDisabilityConditions);
router.get('/conditions/:disabilityId', verifyToken, DisabilityController.getConditionsByDisabilityId);

/**
 * Staff routes
 */
router.get('/pwd/:pwdId', verifyToken, authorizeRoles([1, 2, 3, 4]), DisabilityController.getPwdDisabilities);
router.post('/pwd/:pwdId', verifyToken, authorizeRoles([1, 2, 3, 4]), DisabilityController.addDisabilityRecord);
router.put('/record/:recordId', verifyToken, authorizeRoles([1, 2, 3, 4]), DisabilityController.updateDisabilityRecord);
router.delete('/record/:recordId', verifyToken, authorizeRoles([1,2]), DisabilityController.deleteDisabilityRecord); // Admin + SuperAdmin

export default router;
