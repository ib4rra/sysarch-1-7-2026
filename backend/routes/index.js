const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/user', require('./user.routes'));
router.use('/events', require('./realtime.routes'));
router.use('/student', require('./student.routes'));
router.use('/instructor', require('./instructor.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/activity', require('./activity.routes'));
router.use('/code', require('./code.routes'));
router.use('/subject', require('./subjectRoutes'));
router.use('/quiz', require('./quiz.routes'));

module.exports = router;
