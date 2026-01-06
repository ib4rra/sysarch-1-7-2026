const express = require('express');
const router = express.Router();
const realtime = require('../realtime');

// SSE endpoint: GET /events?token=...&subjects=1,2,3
router.get('/', (req, res) => {
  realtime.addConnection(req, res);
});

module.exports = router;
