import { body, validationResult } from 'express-validator';

/**
 * ============================================
 * STAFF/ADMIN/SUPER ADMIN LOGIN VALIDATION
 * ============================================
 */
export const staffLoginValidationRules = () => {
  return [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ];
};

/**
 * ============================================
 * PWD USER LOGIN VALIDATION
 * ============================================
 */
export const pwdLoginValidationRules = () => {
  return [
    body('pwd_id')
      .notEmpty()
      .withMessage('PWD ID is required')
      .isInt()
      .withMessage('PWD ID must be a number'),
    body('password')
      .notEmpty()
      .withMessage('Password (surname) is required')
      .isLength({ min: 2 })
      .withMessage('Password must be at least 2 characters'),
  ];
};

/**
 * ============================================
 * CREATE ADMIN ACCOUNT VALIDATION (Super Admin)
 * ============================================
 */
export const createAdminValidationRules = () => {
  return [
    body('fullname')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 3 })
      .withMessage('Full name must be at least 3 characters'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Username must be between 3-100 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscore, and hyphen'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email format'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('role_id')
      .notEmpty()
      .withMessage('Role is required')
      .isInt({ min: 2, max: 4 })
      .withMessage('Invalid role ID'),
    body('position')
      .optional()
      .trim(),
    body('contact_no')
      .optional()
      .trim()
      .matches(/^[0-9\s\-\+\(\)]+$/)
      .withMessage('Invalid contact number format'),
  ];
};

/**
 * ============================================
 * CREATE PWD USER ACCOUNT VALIDATION (Admin)
 * ============================================
 */
export const createPwdValidationRules = () => {
  return [
    body('firstname')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastname')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('middlename')
      .optional()
      .trim(),
    body('suffix')
      .optional()
      .trim(),
    body('sex')
      .notEmpty()
      .withMessage('Sex is required')
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Invalid sex value'),
    body('birthdate')
      .notEmpty()
      .withMessage('Birthdate is required')
      .isISO8601()
      .withMessage('Invalid date format (YYYY-MM-DD)')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate > today) {
          throw new Error('Birthdate cannot be in the future');
        }
        return true;
      }),
    body('civil_status')
      .notEmpty()
      .withMessage('Civil status is required')
      .isIn(['Single', 'Married', 'Divorced', 'Widowed', 'Separated'])
      .withMessage('Invalid civil status'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ min: 5 })
      .withMessage('Address must be at least 5 characters'),
    body('contact_no')
      .optional()
      .trim()
      .matches(/^[0-9\s\-\+\(\)]+$/)
      .withMessage('Invalid contact number format'),
    body('guardian_name')
      .optional()
      .trim(),
    body('guardian_contact')
      .optional()
      .trim()
      .matches(/^[0-9\s\-\+\(\)]+$/)
      .withMessage('Invalid guardian contact number format'),
  ];
};

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

