import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

/**
 * ADMIN LOGIN
 */
export const loginAdmin = async (req, res) => {
  const { idNumber, password } = req.body;

  if (!idNumber || !password) {
    return res.status(400).json({
      message: 'ID Number and Password are required',
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE admin_id = ? AND status = "active"',
      [idNumber]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid ID Number or Password',
      });
    }

    const admin = rows[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid ID Number or Password',
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        adminId: admin.admin_id,
        name: admin.full_name,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/**
 * GET ADMIN PROFILE (Protected)
 */
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const [rows] = await db.query(
      'SELECT id, admin_id, full_name, role FROM admins WHERE id = ?',
      [adminId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
