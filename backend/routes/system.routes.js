import express from 'express';
import * as SystemController from '../controllers/system.controller.js';

const router = express.Router();

// Interface Settings
router.get('/interface', SystemController.getInterfaceSettings);
router.post('/interface', SystemController.updateInterfaceSettings);

// Audit Logs
router.get('/logs', SystemController.getAuditLogs);

// Staff/Users
router.get('/users', SystemController.getStaffUsers);

// Backup
router.get('/backup', SystemController.downloadBackup);

export default router;