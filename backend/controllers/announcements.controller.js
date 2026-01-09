import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsByType
} from '../models/announcements.models.js';

/**
 * GET /announcements
 * Get all active announcements
 */
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await getAllAnnouncements();
    
    res.json({
      success: true,
      data: announcements,
      count: announcements.length
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

/**
 * GET /announcements/:id
 * Get announcement by ID
 */
export const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
};

/**
 * POST /announcements
 * Create new announcement (Admin only)
 */
export const createNewAnnouncement = async (req, res) => {
  try {
    const { title, content, notice_type, event_date, start_time, end_time } = req.body;
    const posted_by = req.user?.id || null;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Validate notice_type
    const validTypes = ['General', 'Update', 'Emergency'];
    if (notice_type && !validTypes.includes(notice_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice type. Must be: General, Update, or Emergency'
      });
    }

    const announcementId = await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      notice_type: notice_type || 'General',
      posted_by,
      event_date: event_date || null,
      start_time: start_time || null,
      end_time: end_time || null
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement_id: announcementId
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

/**
 * PUT /announcements/:id
 * Update announcement (Admin only)
 */
export const updateAnnouncementData = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, notice_type, is_active } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    // Validate notice_type if provided
    if (notice_type) {
      const validTypes = ['General', 'Update', 'Emergency'];
      if (!validTypes.includes(notice_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notice type. Must be: General, Update, or Emergency'
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (notice_type !== undefined) updateData.notice_type = notice_type;
    if (is_active !== undefined) updateData.is_active = is_active;

    const success = await updateAnnouncement(id, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

/**
 * DELETE /announcements/:id
 * Delete/Deactivate announcement (Admin only)
 */
export const deleteAnnouncementData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID'
      });
    }

    const success = await deleteAnnouncement(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};

/**
 * GET /announcements/type/:type
 * Get announcements by type
 */
export const getAnnouncementsByTypeController = async (req, res) => {
  try {
    const { type } = req.params;

    const validTypes = ['General', 'Update', 'Emergency'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be: General, Update, or Emergency'
      });
    }

    const announcements = await getAnnouncementsByType(type);

    res.json({
      success: true,
      data: announcements,
      count: announcements.length,
      type
    });
  } catch (error) {
    console.error('Error fetching announcements by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};
