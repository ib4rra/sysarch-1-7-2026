import express from 'express';
import * as PwdController from '../controllers/pwd.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/verify/:id', PwdController.verifyRegistrant); 
router.get('/search', verifyToken, PwdController.searchRegistrants);


router.get('/', verifyToken, authorizeRoles([2, 3, 4]), PwdController.getAllRegistrants);
router.post('/', verifyToken, authorizeRoles([2, 3, 4]), PwdController.createRegistrant);
router.get('/:pwdId', verifyToken, authorizeRoles([2, 3, 4]), PwdController.getRegistrantById);
router.put('/:pwdId', verifyToken, authorizeRoles([2, 3, 4]), PwdController.updateRegistrant);
router.delete('/:pwdId', verifyToken, authorizeRoles([2]), PwdController.deleteRegistrant); // Admin only

export default router;
