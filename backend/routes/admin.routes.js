import express from 'express';
import * as AdminController from '../controllers/adminController.js';
import * as SettingsController from '../controllers/settings.controller.js'; // Import the new controller
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * ==========================================
 * USER & DASHBOARD MANAGEMENT
 * ==========================================
 */
router.get('/dashboard', verifyToken, authorizeRoles([2]), AdminController.getAdminDashboard);
router.get('/users', verifyToken, authorizeRoles([2]), AdminController.getAllUsers);
router.put('/users/:userId', verifyToken, authorizeRoles([2]), AdminController.updateUser);
router.delete('/users/:userId', verifyToken, authorizeRoles([2]), AdminController.deleteUser);

/**
 * ==========================================
 * SYSTEM SETTINGS & LOGS
 * ==========================================
 */
// Interface Configuration (Header/Subheader only)
router.get('/interface', verifyToken, authorizeRoles([2]), SettingsController.getInterfaceSettings);
router.put('/interface', verifyToken, authorizeRoles([2]), SettingsController.updateInterfaceSettings);

// Audit Logs
router.get('/logs', verifyToken, authorizeRoles([2]), SettingsController.getAuditLogs);

// Database Backup
router.get('/backup', verifyToken, authorizeRoles([2]), SettingsController.downloadBackup);

export default router;