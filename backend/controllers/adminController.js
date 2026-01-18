/**
 * Admin Controller Template
 * Add your admin-specific business logic here
 */

import * as SystemModel from '../models/system.models.js';

export const getAdminDashboard = async (req, res) => {
  try {
    // TODO: Implement admin dashboard logic
    res.json({
      message: 'Admin dashboard',
      userId: req.userId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await SystemModel.getAllStaff();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, fullname, role, password } = req.body;

    console.log('Update request received:', { userId, username, fullname, role });

    if (!username || !fullname) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and fullname are required' 
      });
    }

    const roleMap = { 'Admin': 2, 'Super Admin': 1 };
    const roleId = roleMap[role] || 2;

    let query = 'UPDATE person_in_charge SET username = ?, fullname = ?, role_id = ?';
    let params = [username, fullname, roleId];

    if (password && password.trim() !== '') {
      query += ', password = ?';
      params.push(password);
    }

    query += ' WHERE person_id = ?';
    params.push(userId);

    const db = (await import('../config/db.js')).default;
    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User updated successfully:', userId);
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      data: { id: userId, username, fullname, role }
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update user' 
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Delete request received:', userId);

    const db = (await import('../config/db.js')).default;
    const [result] = await db.query('DELETE FROM person_in_charge WHERE person_id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User deleted successfully:', userId);
    res.json({ 
      success: true, 
      message: 'User deleted successfully',
      userId 
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to delete user' 
    });
  }
};
