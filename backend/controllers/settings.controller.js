import * as SystemModel from '../models/system.models.js'; // Import the new model
import { exec } from 'child_process';
import bcryptjs from 'bcryptjs';

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

export const createStaffUser = async (req, res) => {
  try {
    const { username, fullname, role, password } = req.body;

    if (!username || !fullname || !password) {
      return res.status(400).json({ success: false, message: "Username, fullname, and password are required" });
    }

    // Hash password using bcryptjs
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Get role_id from role name
    const roleMap = {
      'Admin': 2,
      'Super Admin': 1
    };
    const roleId = roleMap[role] || 2;

    // Create staff user
    const result = await SystemModel.createStaffUser({
      username,
      fullname,
      password: hashedPassword,
      roleId,
      isActive: 1
    });

    res.json({ success: true, data: result, message: "Staff user created successfully" });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to create staff user" });
  }
};

// --- BACKUP: attempt Node mysqldump, then CLI, then manual SQL dump ---
import db from '../config/db.js';
import fs from 'fs';
import path from 'path';

export const downloadBackup = async (req, res) => {
  const filename = `nangka_mis_backup_${new Date().toISOString().slice(0, 10)}.sql`;
  const backupsDir = path.join(process.cwd(), 'backend', 'uploads', 'backups');

  // 1) Try Node mysqldump module (if installed)
  try {
    let mysqldump;
    try {
      const mod = await import('mysqldump');
      mysqldump = mod?.default || mod;
    } catch (importErr) {
      mysqldump = null;
    }

    if (mysqldump) {
      await fs.promises.mkdir(backupsDir, { recursive: true });
      const outPath = path.join(backupsDir, filename);

      await mysqldump({
        connection: {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'nangka_mis',
        },
        dumpToFile: outPath,
      });

      return res.download(outPath, filename, (err) => {
        if (err) {
          console.error('Error sending backup file:', err);
          return res.status(500).json({ success: false, message: 'Failed to send backup file' });
        }
      });
    }
  } catch (nodeErr) {
    console.warn('Node mysqldump error, continuing to CLI/manual fallback:', nodeErr.message || nodeErr);
  }

  // 2) Try system mysqldump CLI
  try {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASS = process.env.DB_PASSWORD || '';
    const DB_NAME = process.env.DB_NAME || 'nangka_mis';

    const { exec } = await import('child_process');
    const cmd = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${DB_NAME}`;

    const execResult = await new Promise((resolve, reject) => {
      exec(cmd, { env: { ...process.env, MYSQL_PWD: DB_PASS }, maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
        if (error) return reject(new Error(stderr || error.message));
        resolve(stdout);
      });
    });

    // Send stdout as file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Length', Buffer.byteLength(execResult, 'utf8'));
    return res.send(execResult);
  } catch (cliErr) {
    console.warn('CLI mysqldump failed, falling back to manual dump:', cliErr.message || cliErr);
  }

  // 3) Manual DB dump (SQL statements via queries)
  try {
    await fs.promises.mkdir(backupsDir, { recursive: true });
    const outPath = path.join(backupsDir, filename);
    const writeStream = fs.createWriteStream(outPath, { encoding: 'utf8' });

    writeStream.write(`-- Nangka MIS backup generated at ${new Date().toISOString()}\n`);
    writeStream.write('SET FOREIGN_KEY_CHECKS=0;\n\n');

    const connection = await db.getConnection();

    // Get tables
    const [tablesRows] = await connection.query('SHOW TABLES');
    const tableNames = tablesRows.map(r => Object.values(r)[0]);

    for (const table of tableNames) {
      // Create table
      const [createRows] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      const createSql = createRows[0]['Create Table'] || createRows[0]['CREATE TABLE'];

      writeStream.write(`DROP TABLE IF EXISTS \`${table}\`;\n`);
      writeStream.write(`${createSql};\n\n`);

      // Rows
      const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
      if (!rows || rows.length === 0) continue;

      const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');

      const batchSize = 200;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuesSql = batch.map(r => {
          const vals = Object.values(r).map(v => connection.escape(v));
          return `(${vals.join(',')})`;
        }).join(',\n');
        writeStream.write(`INSERT INTO \`${table}\` (${columns}) VALUES\n${valuesSql};\n\n`);
      }
    }

    writeStream.write('SET FOREIGN_KEY_CHECKS=1;\n');
    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Close connection if available
    try { await connection.release(); } catch (e) {}

    return res.download(outPath, filename, (err) => {
      if (err) {
        console.error('Error sending manual backup file:', err);
        return res.status(500).json({ success: false, message: 'Failed to send backup file' });
      }
    });
  } catch (manualErr) {
    console.error('Manual DB dump failed:', manualErr);
    return res.status(500).json({ success: false, message: 'Backup creation failed (all methods failed).' });
  }
};