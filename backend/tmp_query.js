const db = require('./config/db');

function q(sql, params=[]) {
  return new Promise((resolve, reject) => db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}

(async () => {
  try {
    const quizzes = await q('SELECT quiz_id, title, instructor_id, created_at FROM quizzes ORDER BY created_at DESC LIMIT 50');
    console.log('---QUIZZES---');
    console.log(JSON.stringify(quizzes, null, 2));

    const links = await q('SELECT link_id, activity_id, quiz_id, created_at FROM activity_quiz_links ORDER BY created_at DESC LIMIT 50');
    console.log('---LINKS---');
    console.log(JSON.stringify(links, null, 2));

    const activityId = 15;
    const activities = await q('SELECT activity_id, title, description, type, config_json, created_at FROM activities WHERE activity_id = ?', [activityId]);
    console.log('---ACTIVITY 15---');
    console.log(JSON.stringify(activities, null, 2));
  } catch (e) {
    console.error('DB QUERY ERROR', e);
  } finally {
    process.exit(0);
  }
})();
