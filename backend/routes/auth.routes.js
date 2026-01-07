import express from 'express';
import * as AuthController from '../controllers/auth.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  staffLoginValidationRules,
  pwdLoginValidationRules,
  createAdminValidationRules,
  createPwdValidationRules,
  handleValidationErrors,
} from '../validators/auth.validator.js';

const router = express.Router();

/**
 * ============================================
 * PUBLIC ROUTES (No Authentication Required)
 * ============================================
 */

/**
 * Staff/Admin/Super Admin Login
 * POST /auth/login
 */
router.post('/login', staffLoginValidationRules(), handleValidationErrors, AuthController.login);

/**
 * PWD User Login (Limited Access)
 * POST /auth/pwd-login
 */
router.post('/pwd-login', pwdLoginValidationRules(), handleValidationErrors, AuthController.pwdLogin);

/**
 * ============================================
 * PROTECTED ROUTES (Authentication Required)
 * ============================================
 */

/**
 * Create Admin/Staff Account (Super Admin Only)
 * POST /auth/create-admin
 */
router.post(
  '/create-admin',
  verifyToken,
  authorizeRoles([1]), // Super admin role_id = 1
  createAdminValidationRules(),
  handleValidationErrors,
  AuthController.createAdminAccount
);

/**
 * Create PWD User Account (Admin+)
 * POST /auth/create-pwd-account
 */
router.post(
  '/create-pwd-account',
  verifyToken,
  authorizeRoles([1, 2]), // Super admin (1) or Admin (2)
  createPwdValidationRules(),
  handleValidationErrors,
  AuthController.createPwdAccount
);

/**
 * Refresh Token
 * POST /auth/refresh
 */
router.post('/refresh', verifyToken, AuthController.refreshToken);

export default router;

