import express from 'express';
import * as PwdController from '../controllers/pwd.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/verify/:id', PwdController.verifyRegistrant); 
router.get('/search', verifyToken, PwdController.searchRegistrants);
router.get('/check/duplicate', verifyToken, PwdController.checkDuplicate);


router.get('/', verifyToken, authorizeRoles([1, 2, 3, 4]), PwdController.getAllRegistrants);
router.post('/', verifyToken, authorizeRoles([1, 2, 3, 4]), PwdController.createRegistrant);
// Route to get QR image for a PWD (returns or redirects to QR image; falls back to generated QR)
router.get('/:pwdId/qr', PwdController.getQrImage);
// Generate and save QR image for a PWD (creates asset and stores path in DB) - Admin/SuperAdmin only
router.post('/:pwdId/qr/generate', verifyToken, authorizeRoles([1,2]), PwdController.generateQrImage);

router.get('/:pwdId', verifyToken, authorizeRoles([1, 2, 3, 4]), PwdController.getRegistrantById);
router.put('/:pwdId', verifyToken, authorizeRoles([1, 2, 3, 4]), PwdController.updateRegistrant);
router.delete('/:pwdId', verifyToken, authorizeRoles([1,2]), PwdController.deleteRegistrant); // Admin + SuperAdmin

export default router;
