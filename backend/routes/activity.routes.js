const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'activity_files');
try {
	fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
	console.error('Failed to create upload directory', e);
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-()_ ]/g, '_');
		cb(null, `${unique}-${safeName}`);
	},
});

const upload = multer({ storage });

// ✅ CRUD Endpoints
// Accept file uploads under field name 'attachments'
router.post('/', verifyToken, upload.array('attachments'), activityController.createActivity);
router.post('/:id/submission', verifyToken, upload.array('attachments'), activityController.submitActivity);
// Get attachments for a specific activity
router.get('/:id/attachments', activityController.getActivityAttachments);
// Get linked quiz for an activity
router.get('/:id/quiz', activityController.getLinkedQuiz);
// Link a quiz to an activity
router.post('/:id/quiz', verifyToken, activityController.linkQuizToActivity);
// Download a stored activity file by filename (forces download)
router.get('/download/:filename', (req, res) => {
	try {
		const filename = req.params.filename;
		// basic validation to prevent directory traversal
		if (!filename || typeof filename !== 'string' || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
			return res.status(400).send('Invalid filename');
		}
		const filePath = path.join(uploadDir, filename);
		if (!fs.existsSync(filePath)) {
			return res.status(404).send('File not found');
		}
		return res.download(filePath);
	} catch (err) {
		console.error('Download error', err);
		return res.status(500).send('Server error');
	}
});
router.get('/:id/submissions', verifyToken, activityController.getActivitySubmissions);
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivityById);
router.put('/:id/submissions/:submission_id/grade', verifyToken, activityController.saveGrade);
// Allow multipart/form-data on update so instructors can modify attachments
router.put('/:id', upload.array('attachments'), activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

// Get the current student's submission for an activity (with grade/feedback)
router.get('/:id/my-submission', verifyToken, activityController.getMySubmission);

// Save checkpoint progress for an activity
router.post('/:id/checkpoint', verifyToken, activityController.saveCheckpoint);

module.exports = router;
