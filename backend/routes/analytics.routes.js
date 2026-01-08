import express from 'express';
import * as AnalyticsController from '../controllers/analytics.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Overview analytics (admin + super admin)
router.get('/overview', verifyToken, authorizeRoles([1,2]), AnalyticsController.getOverview);

export default router;
