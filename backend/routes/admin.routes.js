import express from 'express';
import * as AdminController from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Admin Routes (Protected - requires admin role)
 * GET /admin/dashboard - Get admin dashboard
 * GET /admin/users - Get all users
 * PUT /admin/users/:userId - Update user
 * DELETE /admin/users/:userId - Delete user
 */

router.get('/dashboard', verifyToken, authorizeRoles([2]), AdminController.getAdminDashboard);
router.get('/users', verifyToken, authorizeRoles([2]), AdminController.getAllUsers);
router.put('/users/:userId', verifyToken, authorizeRoles([2]), AdminController.updateUser);
router.delete('/users/:userId', verifyToken, authorizeRoles([2]), AdminController.deleteUser);

export default router;

