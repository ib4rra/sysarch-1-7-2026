import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// ============================================
// STAFF/ADMIN/SUPER ADMIN LOGIN
// ============================================

/**
 * Login for staff, admin, and super admin
 * @route POST /auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // Find staff/admin user
    const [users] = await db.query(
      `SELECT p.person_id, p.fullname, p.username, p.password_hash, 
              p.role_id, p.email, p.is_active, r.role_name 
       FROM Person_In_Charge p
       JOIN roles r ON p.role_id = r.role_id
       WHERE p.username = ?`,
      [username]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Fetch user permissions
    const [permissions] = await db.query(
      `SELECT p.permission_name FROM permissions p
       JOIN role_permissions rp ON p.permission_id = rp.permission_id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    const permissionsList = permissions.map((p) => p.permission_name);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.person_id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name,
        permissions: permissionsList,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Update last login
    await db.query('UPDATE Person_In_Charge SET last_login = CURRENT_TIMESTAMP WHERE person_id = ?', [
      user.person_id,
    ]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.person_id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          role: user.role_name,
          permissions: permissionsList,
        },
      },
    });
  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// ============================================
// PWD USER LOGIN (Limited Access)
// ============================================

/**
 * Login for PWD users (with PWD_ID and surname)
 * @route POST /auth/pwd-login
 * @access Public
 */
export const pwdLogin = async (req, res) => {
  try {
    const { pwd_id, password } = req.body;

    if (!pwd_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'PWD ID and password (surname) are required',
      });
    }

    // Find PWD user login record
    const [pwdLogins] = await db.query(
      `SELECT pl.login_id, pl.pwd_id, pl.password_hash, pl.can_view_own_record, pl.is_active,
              p.firstname, p.lastname, p.sex, p.birthdate, p.contact_no
       FROM pwd_user_login pl
       JOIN Nangka_PWD_user p ON pl.pwd_id = p.pwd_id
       WHERE pl.login_username = ?`,
      [pwd_id]
    );

    if (!pwdLogins || pwdLogins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PWD ID or password',
      });
    }

    const pwdLogin = pwdLogins[0];

    if (!pwdLogin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact the barangay office.',
      });
    }

    // Verify password (surname)
    const isPasswordValid = await bcrypt.compare(password, pwdLogin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PWD ID or password',
      });
    }

    // Generate limited JWT token for PWD user
    const token = jwt.sign(
      {
        id: pwdLogin.pwd_id,
        type: 'pwd_user',
        firstname: pwdLogin.firstname,
        lastname: pwdLogin.lastname,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Update last login
    await db.query('UPDATE pwd_user_login SET last_login = CURRENT_TIMESTAMP WHERE login_id = ?', [
      pwdLogin.login_id,
    ]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          pwd_id: pwdLogin.pwd_id,
          fullname: `${pwdLogin.firstname} ${pwdLogin.lastname}`,
          type: 'pwd_user',
          can_view_record: pwdLogin.can_view_own_record,
        },
      },
    });
  } catch (err) {
    console.error('PWD login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// ============================================
// ADMIN CREATE STAFF/ADMIN ACCOUNT
// ============================================

/**
 * Create admin account (Super Admin only)
 * @route POST /auth/create-admin
 * @access Protected (Super Admin only)
 */
export const createAdminAccount = async (req, res) => {
  try {
    const { fullname, username, email, password, role_id, position, contact_no } = req.body;

    if (!fullname || !username || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Fullname, username, email, password, and role are required',
      });
    }

    // Check if username already exists
    const [existing] = await db.query('SELECT person_id FROM Person_In_Charge WHERE username = ?', [
      username,
    ]);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin account
    const [result] = await db.query(
      `INSERT INTO Person_In_Charge (fullname, username, password_hash, role_id, position, contact_no, email, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [fullname, username, hashedPassword, role_id, position || null, contact_no || null, email]
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        person_id: result.insertId,
        fullname,
        username,
        email,
        role_id,
      },
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
    });
  }
};

// ============================================
// ADMIN CREATE PWD USER ACCOUNT
// ============================================

/**
 * Create PWD user account (Admin only)
 * @route POST /auth/create-pwd-account
 * @access Protected (Admin+ only)
 */
export const createPwdAccount = async (req, res) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      suffix,
      sex,
      birthdate,
      civil_status,
      address,
      contact_no,
      guardian_name,
      guardian_contact,
    } = req.body;

    if (!firstname || !lastname || !sex || !birthdate || !civil_status || !address) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: firstname, lastname, sex, birthdate, civil_status, address',
      });
    }

    // Create PWD user record
    const [pwdResult] = await db.query(
      `INSERT INTO Nangka_PWD_user (firstname, middlename, lastname, suffix, sex, birthdate, civil_status, address, contact_no, guardian_name, guardian_contact, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        firstname,
        middlename || null,
        lastname,
        suffix || null,
        sex,
        birthdate,
        civil_status,
        address,
        contact_no || null,
        guardian_name || null,
        guardian_contact || null,
      ]
    );

    const pwdId = pwdResult.insertId;

    // Hash surname as password
    const hashedPassword = await bcrypt.hash(lastname, 10);

    // Create PWD login record with PWD_ID as username
    const [loginResult] = await db.query(
      `INSERT INTO pwd_user_login (pwd_id, login_username, password_hash, can_view_own_record, is_active)
       VALUES (?, ?, ?, TRUE, TRUE)`,
      [pwdId, pwdId, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'PWD account created successfully',
      data: {
        pwd_id: pwdId,
        fullname: `${firstname} ${lastname}`,
        login_credentials: {
          username: pwdId,
          password_note: `Surname: ${lastname}`,
          instruction: 'Username is the PWD ID, Password is the surname',
        },
      },
    });
  } catch (err) {
    console.error('Create PWD account error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create PWD account',
    });
  }
}

// ============================================
// TOKEN REFRESH
// ============================================

/**
 * Refresh JWT token (for staff/admin users)
 * @route POST /auth/refresh
 * @access Protected
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }, async (err, decoded) => {
      if (err && err.name !== 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }

      // Verify user still exists and is active
      const [users] = await db.query(
        'SELECT person_id, role_id, is_active FROM Person_In_Charge WHERE person_id = ? AND is_active = TRUE',
        [decoded.id]
      );

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
        });
      }

      const newToken = jwt.sign(
        {
          id: decoded.id,
          username: decoded.username,
          role_id: decoded.role_id,
          role_name: decoded.role_name,
          permissions: decoded.permissions,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.json({
        success: true,
        message: 'Token refreshed',
        data: {
          token: newToken,
        },
      });
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

// ============================================
// UNIFIED LOGIN (STAFF + PWD USERS)
// ============================================

/**
 * Unified login endpoint - backend handles both staff and PWD users
 * @route POST /auth/unified-login
 * @access Public
 */
export const unifiedLogin = async (req, res) => {
  try {
    const { idNumber, password } = req.body;

    if (!idNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'ID Number and password are required',
      });
    }

    // Try staff/admin login first
    const [staffUsers] = await db.query(
      `SELECT p.person_id, p.fullname, p.username, p.password_hash, 
              p.role_id, p.email, p.is_active, r.role_name 
       FROM Person_In_Charge p
       JOIN roles r ON p.role_id = r.role_id
       WHERE (p.username = ? OR p.email = ? OR p.person_id = ?)`,
      [idNumber, idNumber, idNumber]
    );

    // If staff user found
    if (staffUsers && staffUsers.length > 0) {
      const user = staffUsers[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          person_id: user.person_id,
          username: user.username,
          role_id: user.role_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return res.status(200).json({
        success: true,
        message: 'Staff login successful',
        token,
        user: {
          id: user.person_id,
          username: user.username,
          email: user.email,
          role: user.role_name,
          role_id: user.role_id,
        },
      });
    }

    // Try PWD user login
    const [pwdUsers] = await db.query(
      `SELECT pul.pwd_id, pul.login_username, pul.password_hash, pul.is_active,
              pu.firstname, pu.lastname
       FROM pwd_user_login pul
       JOIN Nangka_PWD_user pu ON pul.pwd_id = pu.pwd_id
       WHERE pul.login_username = ? OR pul.pwd_id = ?`,
      [idNumber, idNumber]
    );

    if (pwdUsers && pwdUsers.length > 0) {
      const pwdUser = pwdUsers[0];

      if (!pwdUser.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, pwdUser.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Generate JWT token for PWD user
      const token = jwt.sign(
        {
          pwd_id: pwdUser.pwd_id,
          role_id: 4, // PWD user role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return res.status(200).json({
        success: true,
        message: 'PWD user login successful',
        token,
        user: {
          id: pwdUser.pwd_id,
          username: `${pwdUser.firstname} ${pwdUser.lastname}`,
          role: 'pwd_user',
          role_id: 4,
        },
      });
    }

    // Neither staff nor PWD user found
    return res.status(401).json({
      success: false,
      message: 'Invalid ID number or password',
    });
  } catch (err) {
    console.error('Unified login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};
