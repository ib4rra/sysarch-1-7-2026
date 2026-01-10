import db from '../config/db.js';

// --- SETTINGS ---

export const getSettings = async () => {
  const query = "SELECT setting_key, setting_value FROM system_settings";
  const [rows] = await db.query(query);
  return rows;
};

export const upsertSetting = async (key, value) => {
  const query = `
    INSERT INTO system_settings (setting_key, setting_value) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE setting_value = ?
  `;
  return await db.query(query, [key, value, value]);
};

// --- LOGS ---

export const getLogs = async (limit, offset) => {
  const query = `
    SELECT al.created_at as timestamp, al.action, al.entity_type as target, p.fullname as user
    FROM activity_logs al
    LEFT JOIN person_in_charge p ON al.person_id = p.person_id
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(query, [limit, offset]);
  return rows;
};

// --- STAFF ---

export const getAllStaff = async () => {
  const query = `
    SELECT p.person_id as id, p.fullname as name, p.email, r.role_name as role, 
           CASE WHEN p.is_active = 1 THEN 'Active' ELSE 'Inactive' END as status
    FROM person_in_charge p
    JOIN roles r ON p.role_id = r.role_id
  `;
  const [rows] = await db.query(query);
  return rows;
};