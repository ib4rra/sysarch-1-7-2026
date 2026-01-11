import db from '../config/db.js';

export const logAction = async ({ person_id, action, details }) => {
  await db.query(
    'INSERT INTO activity_logs (person_id, action, details) VALUES (?, ?, ?)',
    [person_id, action, details]
  );
};