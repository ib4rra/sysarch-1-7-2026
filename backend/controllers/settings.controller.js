import * as SystemModel from '../models/system.models.js'; // Import the new model
import { exec } from 'child_process';

// --- INTERFACE SETTINGS ---

export const getInterfaceSettings = async (req, res) => {
  try {
    const rows = await SystemModel.getSettings();
    
    // Convert rows array to object { headerTitle: "Value", ... }
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

export const updateInterfaceSettings = async (req, res) => {
  try {
    const settings = req.body; 
    
    // Loop through keys and save using the Model
    for (const [key, value] of Object.entries(settings)) {
      await SystemModel.upsertSetting(key, value);
    }

    res.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to save settings" });
  }
};

// --- AUDIT LOGS ---

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const logs = await SystemModel.getLogs(limit, offset);
    
    const formattedLogs = logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp).toLocaleString()
    }));

    res.json({ success: true, data: formattedLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

// --- STAFF USERS ---

export const getStaffUsers = async (req, res) => {
  try {
    const users = await SystemModel.getAllStaff();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// --- BACKUP (Remains the same as it doesn't use DB queries) ---
export const downloadBackup = async (req, res) => {
  const filename = `backup-${Date.now()}.sql`;
  const cmd = `mysqldump -u root nangka_mis`; 

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Backup creation failed');
    }
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/sql');
    res.send(stdout);
  });
};