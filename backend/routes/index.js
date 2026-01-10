import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import pwdRoutes from './pwd.routes.js';
import pwdUserRoutes from './pwd-user.routes.js';
import disabilityRoutes from './disability.routes.js';
import claimsRoutes from './claims.routes.js';
import analyticsRoutes from './analytics.routes.js';
import announcementsRoutes from './announcements.routes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    system: 'PWD Management Information System - Barangay Nangka, Marikina'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

// PWD MIS specific routes
router.use('/pwd', pwdRoutes);
router.use('/pwd-user', pwdUserRoutes); // PWD user limited access routes
router.use('/disability', disabilityRoutes);
router.use('/claims', claimsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/announcements', announcementsRoutes);

export default router;


