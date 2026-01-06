const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const AdminController = require('../controllers/admin.controller');

router.get('/admin', verifyToken, authorizeRoles([1]), AdminController.getAdminDashboard);

module.exports = router;
