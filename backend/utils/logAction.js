import db from '../config/db.js';

export const logAction = async ({ person_id, action, details, entity_type = null, entity_id = null }) => {
  await db.query(
    'INSERT INTO activity_logs (person_id, action, details, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
    [person_id, action, details, entity_type, entity_id]
  );
};