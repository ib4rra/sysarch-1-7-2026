import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createNewAnnouncement,
  updateAnnouncementData,
  deleteAnnouncementData,
  getAnnouncementsByTypeController
} from '../controllers/announcements.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Public Routes (No authentication required)
 */

/**
 * GET /announcements
 * Get all active announcements
 */
router.get('/', getAnnouncements);

/**
 * GET /announcements/:id
 * Get announcement by ID
 */
router.get('/:id', getAnnouncement);

/**
 * GET /announcements/type/:type
 * Get announcements by type (General, Update, Emergency)
 */
router.get('/type/:type', getAnnouncementsByTypeController);

/**
 * Protected Routes (Admin & Super Admin only)
 */

/**
 * POST /announcements
 * Create new announcement
 */
router.post('/', verifyToken, createNewAnnouncement);

/**
 * PUT /announcements/:id
 * Update announcement
 */
router.put('/:id', verifyToken, updateAnnouncementData);

/**
 * DELETE /announcements/:id
 * Delete announcement
 */
router.delete('/:id', verifyToken, deleteAnnouncementData);

export default router;
