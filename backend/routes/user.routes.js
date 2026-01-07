import express from 'express';
import * as UserController from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * User Routes (Protected - requires authentication)
 * GET /user/profile - Get current user profile
 * PUT /user/profile - Update user profile
 * POST /user/change-password - Change user password
 */

router.get('/profile', verifyToken, UserController.getProfile);
router.put('/profile', verifyToken, UserController.updateProfile);
router.post('/change-password', verifyToken, UserController.changePassword);

export default router;
