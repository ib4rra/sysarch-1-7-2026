const path = require("path");
const fs = require("fs");
const multer = require("multer");
const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const InstructorController = require("../controllers/instructor.controller");
const db = require('../config/db');

// -------------------- ANNOUNCEMENT ROUTES -------------------- //
const uploadsDir = path.join(__dirname, "..", "uploads", "announcements");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/mkv",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const uploadAnnouncement = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 6 },
});

// Ensure avatars upload directory exists (reuse uploads/avatars)
const avatarsDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: avatarsDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router
  .route("/announcements")
  .post(
    verifyToken,
    authorizeRoles([2]),
    uploadAnnouncement.array("attachments", 6),
    InstructorController.createAnnouncement
  )
  .get(verifyToken, authorizeRoles([2]), InstructorController.getAnnouncements);

// Update and delete announcement routes
router
  .route("/announcements/:announcementId")
  .put(
    verifyToken,
    authorizeRoles([2]),
    uploadAnnouncement.array("attachments", 6),
    InstructorController.updateAnnouncement
  )
  .delete(verifyToken, authorizeRoles([2]), InstructorController.deleteAnnouncement);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message === "Unsupported file type") {
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

// -------------------- OTHER INSTRUCTOR ROUTES -------------------- //
router.get("/dashboard", verifyToken, authorizeRoles([2]), InstructorController.getDashboard);
router.get("/content_management", verifyToken, authorizeRoles([2]), InstructorController.getContentManagement);
router.get("/dragdropactivity", verifyToken, authorizeRoles([2]), InstructorController.getDragDropActivity);
router.get("/compiler", verifyToken, authorizeRoles([2]), InstructorController.getCompiler);

router.post("/classes", verifyToken, authorizeRoles([2]), InstructorController.createClass);
router.get("/subjects", verifyToken, authorizeRoles([2]), InstructorController.getSubject);
router.get("/subjects/:subjectId", verifyToken, authorizeRoles([2]), InstructorController.getSubject);
router.get("/subjects/:subjectId/activities", verifyToken, authorizeRoles([2]), InstructorController.getActivitiesBySubject);
router.get("/subjects/:subjectId/students", verifyToken, authorizeRoles([2]), InstructorController.getStudentsBySubject);
router.put("/subjects/:subjectId", verifyToken, authorizeRoles([2]), InstructorController.updateSubject);

router.get("/archived", verifyToken, authorizeRoles([2]), InstructorController.getArchivedSubjects);
router.put("/archive/:subjectId", verifyToken, authorizeRoles([2]), InstructorController.archiveSubject);
router.put("/restore/:subjectId", verifyToken, authorizeRoles([2]), InstructorController.restoreSubject);

// -------------------- INSTRUCTOR SETTINGS (profile/avatar) -------------------- //
// GET /instructor/setting
router.get('/setting', verifyToken, authorizeRoles([2]), (req, res) => {
  const userId = req.userId;
  const sql = `SELECT u.user_id, u.username, u.email,
    ua.file_path AS avatar_path, ua.stored_name, ua.original_name, ua.mime_type, ua.uploaded_at
    FROM users u
    LEFT JOIN user_avatars ua ON ua.user_id = u.user_id AND ua.is_current = 1
    WHERE u.user_id = ? LIMIT 1`;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Failed to fetch instructor setting:', err);
      return res.status(500).json({ message: 'Failed to load settings' });
    }
    const row = rows && rows[0] ? rows[0] : null;
    if (!row) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Instructor settings',
      user: {
        user_id: row.user_id,
        username: row.username,
        email: row.email,
        avatar: row.avatar_path || null,
      },
    });
  });
});

// PUT /instructor/setting - allow instructor to upload avatar or pass avatar URL
router.put('/setting', verifyToken, authorizeRoles([2]), uploadAvatar.single('avatar'), (req, res) => {
  const userId = req.userId;

  // If a file was uploaded, persist to user_avatars table and mark previous as not current
  if (req.file) {
    const { originalname, filename, mimetype, size } = req.file;
    const filePath = `/uploads/avatars/${filename}`;

    const updateSql = 'UPDATE user_avatars SET is_current = 0 WHERE user_id = ?';
    db.query(updateSql, [userId], (uErr) => {
      if (uErr) console.warn('Failed to unset previous avatars', uErr);

      const insertSql = `INSERT INTO user_avatars (user_id, original_name, stored_name, file_path, mime_type, file_size, is_current, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`;
      db.query(insertSql, [userId, originalname, filename, filePath, mimetype, size], (iErr, result) => {
        if (iErr) {
          console.error('Failed to insert avatar record:', iErr);
          return res.status(500).json({ message: 'Failed to save avatar' });
        }

        return res.json({ message: 'Avatar updated', avatar: { file_path: filePath, stored_name: filename } });
      });
    });
    return;
  }

  // Otherwise allow updating display name via body (non-file updates) or set avatar by path
  const { username, avatar_path } = req.body || {};

  // If avatar_path is provided, mark matching user_avatars row as current (or insert if not found)
  if (avatar_path) {
    // Normalize avatar_path: if a full URL was provided, extract pathname
    let pathValue = String(avatar_path || '');
    try {
      if (pathValue.startsWith('http')) {
        const u = new URL(pathValue);
        pathValue = u.pathname;
      }
    } catch (e) {}

    const unsetSql = 'UPDATE user_avatars SET is_current = 0 WHERE user_id = ?';
    db.query(unsetSql, [userId], (uErr) => {
      if (uErr) console.warn('Failed to unset previous avatars', uErr);

      // Try to find existing avatar row
      const findSql = 'SELECT avatar_id FROM user_avatars WHERE user_id = ? AND file_path = ? LIMIT 1';
      db.query(findSql, [userId, pathValue], (fErr, rows) => {
        if (fErr) {
          console.error('Failed to query user_avatars', fErr);
          return res.status(500).json({ message: 'Failed to set avatar' });
        }

        if (rows && rows.length > 0) {
          const avatarId = rows[0].avatar_id;
          const setSql = 'UPDATE user_avatars SET is_current = 1, uploaded_at = NOW() WHERE avatar_id = ?';
          db.query(setSql, [avatarId], (sErr) => {
            if (sErr) {
              console.error('Failed to mark avatar current', sErr);
              return res.status(500).json({ message: 'Failed to set avatar' });
            }
            return res.json({ message: 'Avatar updated', avatar: { file_path: pathValue } });
          });
          return;
        }

        // Not found: insert a new row referencing the existing file path
        // Do not populate original_name/stored_name for null-mime entries (username already lives in users table)
        const insertSql = `INSERT INTO user_avatars (user_id, original_name, stored_name, file_path, mime_type, file_size, is_current, uploaded_at)
          VALUES (?, NULL, NULL, ?, NULL, NULL, 1, NOW())`;
        db.query(insertSql, [userId, pathValue], (iErr, result) => {
          if (iErr) {
            console.error('Failed to insert avatar record for path', iErr);
            return res.status(500).json({ message: 'Failed to save avatar' });
          }
          return res.json({ message: 'Avatar updated', avatar: { file_path: pathValue } });
        });
      });
    });
    return;
  }

  // Otherwise update username if provided
  if (username) {
    const trimmed = String(username).trim();
    const updateUserSql = 'UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
    db.query(updateUserSql, [trimmed, userId], (err, result) => {
      if (err) {
        console.error('Failed to update username:', err);
        return res.status(500).json({ message: 'Failed to update profile' });
      }
      return res.json({ message: 'Profile updated', username: trimmed });
    });
    return;
  }

  return res.status(400).json({ message: 'No valid payload provided' });
});

module.exports = router;
