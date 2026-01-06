const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const CodeController = require('../controllers/codeExecution.controller');

router.post('/runcode', verifyToken, authorizeRoles([3, 2]), CodeController.runCode);

module.exports = router;