/**
 * PWD Registrants Routes
 */

import express from 'express';
import * as PwdController from '../controllers/pwd.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/search', verifyToken, PwdController.searchRegistrants);

/**
 * Staff routes (require staff role)
 */
router.get('/', verifyToken, authorizeRoles([2, 3, 4]), PwdController.getAllRegistrants);
router.post('/', verifyToken, authorizeRoles([2, 3, 4]), PwdController.createRegistrant);
router.get('/:pwdId', verifyToken, authorizeRoles([2, 3, 4]), PwdController.getRegistrantById);
router.put('/:pwdId', verifyToken, authorizeRoles([2, 3, 4]), PwdController.updateRegistrant);
router.delete('/:pwdId', verifyToken, authorizeRoles([2]), PwdController.deleteRegistrant); // Admin only

export default router;
