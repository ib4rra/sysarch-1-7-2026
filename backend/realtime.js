const jwt = require('jsonwebtoken');
const db = require('./config/db');

// In-memory maps of subscribers
// subjectId -> Set of response objects
const subjectSubscribers = new Map();
// userId -> Set of response objects
const userSubscribers = new Map();

function sendSSE(res, event, data) {
  try {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    if (event) res.write(`event: ${event}\n`);
    res.write(`data: ${payload}\n\n`);
  } catch (e) {
    // ignore write errors
  }
}

function addUserSubscriber(userId, res) {
  if (!userSubscribers.has(userId)) userSubscribers.set(userId, new Set());
  userSubscribers.get(userId).add(res);
}

function removeUserSubscriber(userId, res) {
  const s = userSubscribers.get(userId);
  if (!s) return;
  s.delete(res);
  if (s.size === 0) userSubscribers.delete(userId);
}

function addSubjectSubscriber(subjectId, res) {
  if (!subjectSubscribers.has(subjectId)) subjectSubscribers.set(subjectId, new Set());
  subjectSubscribers.get(subjectId).add(res);
}

function removeSubjectSubscriber(subjectId, res) {
  const s = subjectSubscribers.get(subjectId);
  if (!s) return;
  s.delete(res);
  if (s.size === 0) subjectSubscribers.delete(subjectId);
}

function broadcastToSubject(subjectId, payload) {
  const subs = subjectSubscribers.get(String(subjectId)) || new Set();
  subs.forEach((res) => {
    sendSSE(res, 'notification', payload);
  });
}

function broadcastToUser(userId, payload) {
  const subs = userSubscribers.get(String(userId)) || new Set();
  subs.forEach((res) => {
    sendSSE(res, 'notification', payload);
  });
}

async function addConnection(req, res) {
  // Establish SSE headers
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  res.write(':ok\n\n');

  const token = req.query && req.query.token;
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      userId = decoded.id;
    } catch (e) {
      // invalid token - still allow non-auth SSE but no user subscriptions
      console.log('SSE auth failed:', e && e.message);
    }
  }

  if (userId) addUserSubscriber(String(userId), res);

  // Subjects may be provided as comma-separated list in query
  const subjectsParam = req.query && req.query.subjects;
  if (subjectsParam) {
    const ids = subjectsParam.split(',').map(s => s.trim()).filter(Boolean);
    ids.forEach(id => addSubjectSubscriber(String(id), res));
  }

  // Keep connection alive with a comment ping every 20s
  const keepAlive = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (e) {}
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAlive);
    try {
      if (userId) removeUserSubscriber(String(userId), res);
      if (subjectsParam) {
        const ids = subjectsParam.split(',').map(s => s.trim()).filter(Boolean);
        ids.forEach(id => removeSubjectSubscriber(String(id), res));
      }
    } catch (e) {}
  });
}

module.exports = {
  addConnection,
  broadcastToSubject,
  broadcastToUser,
};
