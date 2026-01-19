import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

/**
 * Verify JWT token from Authorization header, x-access-token, query, or body
 * Supports both staff/admin and PWD user tokens
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const xAccessToken = req.headers['x-access-token'];
  const tokenFromQuery = req.query?.token;
  const tokenFromBody = req.body?.token;

  let token = null;

  // Priority: Authorization Bearer > x-access-token > query > body
  if (typeof authHeader === 'string' && authHeader.split(' ').length > 1) {
    token = authHeader.split(' ')[1];
  } else if (typeof xAccessToken === 'string') {
    token = xAccessToken;
  } else if (tokenFromQuery) {
    token = tokenFromQuery;
  } else if (tokenFromBody) {
    token = tokenFromBody;
  }

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }
      console.warn('Token verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Store decoded token in request
    req.user = decoded;

    // For staff/admin tokens
    if (decoded.role_id) {
      req.userId = decoded.id;
      req.userRoleId = decoded.role_id;
      req.userPermissions = decoded.permissions || [];
      req.userType = 'staff';
    }

    // For PWD user tokens
    if (decoded.type === 'pwd_user') {
      req.pwdId = decoded.id;
      req.userId = decoded.id;
      req.userType = 'pwd_user';
    }

    next();
  });
};

/**
 * Authorize based on user roles (for staff/admin only)
 * @param {number[]} allowedRoles - Array of role IDs that are allowed
 * @returns Middleware function
 */
export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    // Check if user is staff/admin (not PWD user)
    if (!req.userRoleId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User role not found.',
      });
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.userRoleId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role privileges.',
      });
    }

    next();
  };
};

/**
 * Authorize based on specific permissions (for staff/admin)
 * @param {string[]} requiredPermissions - Array of permission names required
 * @returns Middleware function
 */
export const authorizePermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    // Check if user is staff/admin
    if (!req.userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Permissions not found.',
      });
    }

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((perm) =>
      req.userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Verify PWD user access (can only view own record)
 */
export const verifyPwdUserAccess = (req, res, next) => {
  if (!req.pwdId || req.userType !== 'pwd_user') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. PWD user access required.',
    });
  }

  // Check if requesting own record
  const requestedPwdId = req.params.pwd_id || req.body.pwd_id;
  if (requestedPwdId && parseInt(requestedPwdId) !== req.pwdId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own record.',
    });
  }

  next();
};

/**
 * Optional: Block PWD users from accessing staff endpoints
 */
export const blockPwdUsers = (req, res, next) => {
  if (req.userType === 'pwd_user') {
    return res.status(403).json({
      success: false,
      message: 'This resource is not available for PWD users.',
    });
  }

  next();
};

