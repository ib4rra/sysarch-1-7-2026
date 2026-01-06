const db = require('./config/db');

const activityId = process.argv[2];
const quizId = process.argv[3];

if (!activityId || !quizId) {
  console.error('Usage: node link_quiz_to_activity.js <activityId> <quizId>');
  process.exit(1);
}

const sql = `INSERT INTO activity_quiz_links (activity_id, quiz_id) VALUES (?, ?)`;

db.query(sql, [activityId, quizId], (err, res) => {
  if (err) {
    console.error('Failed to insert link:', err);
    process.exit(1);
  }
  console.log('Inserted link_id', res.insertId);
  process.exit(0);
});
