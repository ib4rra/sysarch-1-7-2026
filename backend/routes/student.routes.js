const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const StudentController = require('../controllers/student.controller');

// Ensure avatars upload directory exists
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
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

const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/dashboard', verifyToken, authorizeRoles([3]), StudentController.getDashboard);
router.get('/dragdrop', verifyToken, authorizeRoles([3]), StudentController.getCompiler);
router.get('/todo', verifyToken, authorizeRoles([3]), StudentController.getTodo);
router.get('/quiz', verifyToken, authorizeRoles([3]), StudentController.getQuiz);
router.get('/archived', verifyToken, authorizeRoles([3]), StudentController.getArchived);
router.get('/setting', verifyToken, authorizeRoles([3]), StudentController.getSetting);
router.put('/setting', verifyToken, authorizeRoles([3]), uploadAvatar.single('avatar'), StudentController.updateSetting);
router.get('/active-classes', verifyToken, authorizeRoles([3]), StudentController.getActiveClasses);
router.get('/subjects', verifyToken, authorizeRoles([3]), StudentController.getSubject);
router.get('/subjects/:subjectId', verifyToken, authorizeRoles([3]), StudentController.getSubject);
router.get('/subjects/:subjectId/members', verifyToken, authorizeRoles([3]), StudentController.getClassMembers);
router.post('/join-class', verifyToken, authorizeRoles([3]), StudentController.joinClass);
router.post('/leave-class', verifyToken, authorizeRoles([3]), StudentController.leaveClass);
router.get('/announcements', verifyToken, authorizeRoles([3]), StudentController.getAnnouncements);
router.get('/activities', verifyToken, authorizeRoles([3]), StudentController.getActivities);

module.exports = router;
