/**
 * Template Routes
 * Copy this file and customize for your needs
 */

import express from 'express';
import * as TemplateController from '../controllers/TEMPLATE.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Example routes with authentication and authorization
 * TODO: Replace these with your actual endpoints
 */

// Public routes (no authentication required)
// router.get('/', TemplateController.getAll);
// router.get('/:id', TemplateController.getById);

// Protected routes (authentication required)
router.get('/', verifyToken, TemplateController.getAll);
router.get('/:id', verifyToken, TemplateController.getById);
router.post('/', verifyToken, TemplateController.create);
router.put('/:id', verifyToken, TemplateController.update);
router.delete('/:id', verifyToken, TemplateController.delete_);

// Admin only routes (specific role required)
// router.delete('/:id', verifyToken, authorizeRoles([2]), TemplateController.delete_);

export default router;
