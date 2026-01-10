import db from '../config/db.js';

/**
 * Get all active announcements
 * @returns {Promise<Array>} Array of announcements
 */
export const getAllAnnouncements = async () => {
  const sql = `
    SELECT 
      a.announcement_id,
      a.title,
      a.content,
      a.notice_type,
      a.posted_by,
      a.event_date,
      a.start_time,
      a.end_time,
      p.fullname as posted_by_name,
      a.created_at,
      a.updated_at,
      a.is_active
    FROM announcements a
    LEFT JOIN Person_In_Charge p ON a.posted_by = p.person_id
    WHERE a.is_active = TRUE
    ORDER BY a.created_at DESC
  `;

  const [results] = await db.query(sql);
  return results;
};

/**
 * Get announcement by ID
 * @param {number} announcementId - Announcement ID
 * @returns {Promise<Object>} Announcement object
 */
export const getAnnouncementById = async (announcementId) => {
  const sql = `
    SELECT 
      a.announcement_id,
      a.title,
      a.content,
      a.notice_type,
      a.posted_by,
      a.event_date,
      a.start_time,
      a.end_time,
      p.fullname as posted_by_name,
      a.created_at,
      a.updated_at,
      a.is_active
    FROM announcements a
    LEFT JOIN Person_In_Charge p ON a.posted_by = p.person_id
    WHERE a.announcement_id = ? AND a.is_active = TRUE
  `;

  const [results] = await db.query(sql, [announcementId]);
  return results.length > 0 ? results[0] : null;
};

/**
 * Create new announcement
 * @param {Object} announcementData - Announcement data
 * @param {string} announcementData.title - Announcement title
 * @param {string} announcementData.content - Announcement content
 * @param {string} announcementData.notice_type - Type (General, Update, Emergency)
 * @param {number} announcementData.posted_by - Person ID who posted
 * @returns {Promise<number>} ID of created announcement
 */
export const createAnnouncement = async (announcementData) => {
  const { title, content, notice_type = 'General', posted_by, event_date, start_time, end_time } = announcementData;

  const sql = `
    INSERT INTO announcements (title, content, notice_type, posted_by, event_date, start_time, end_time, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
  `;

  const [result] = await db.query(sql, [title, content, notice_type, posted_by || null, event_date || null, start_time || null, end_time || null]);
  return result.insertId;
};

/**
 * Update announcement
 * @param {number} announcementId - Announcement ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} Success flag
 */
export const updateAnnouncement = async (announcementId, updateData) => {
  const { title, content, notice_type, is_active, event_date, start_time, end_time } = updateData;

  const sql = `
    UPDATE announcements 
    SET 
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      notice_type = COALESCE(?, notice_type),
      is_active = COALESCE(?, is_active),
      event_date = COALESCE(?, event_date),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time)
    WHERE announcement_id = ?
  `;

  const [result] = await db.query(sql, [title || null, content || null, notice_type || null, is_active !== undefined ? is_active : null, event_date || null, start_time || null, end_time || null, announcementId]);
  return result.affectedRows > 0;
};

/**
 * Delete/Remove announcement (hard delete)
 * @param {number} announcementId - Announcement ID
 * @returns {Promise<boolean>} Success flag
 */
export const deleteAnnouncement = async (announcementId) => {
  const sql = `
    DELETE FROM announcements 
    WHERE announcement_id = ?
  `;

  const [result] = await db.query(sql, [announcementId]);
  return result.affectedRows > 0;
};

/**
 * Get announcements by type
 * @param {string} noticeType - Type of notice (General, Update, Emergency)
 * @returns {Promise<Array>} Array of announcements
 */
export const getAnnouncementsByType = async (noticeType) => {
  const sql = `
    SELECT 
      a.announcement_id,
      a.title,
      a.content,
      a.notice_type,
      a.posted_by,
      a.event_date,
      a.start_time,
      a.end_time,
      p.fullname as posted_by_name,
      a.created_at,
      a.updated_at,
      a.is_active
    FROM announcements a
    LEFT JOIN Person_In_Charge p ON a.posted_by = p.person_id
    WHERE a.notice_type = ? AND a.is_active = TRUE
    ORDER BY a.created_at DESC
  `;

  const [results] = await db.query(sql, [noticeType]);
  return results;
};
