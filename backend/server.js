require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const routes = require('./routes');

require('./config/db'); 
const { createTables } = require('./config/init-db');

// Initialize database tables
createTables();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

