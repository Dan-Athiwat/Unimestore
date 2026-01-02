// server.js
// AppHub – Express server bootstrap, static serving, API mounting

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const UPLOAD_ROOT = path.join(__dirname, 'uploads');
const DESKTOP_DIR = path.join(UPLOAD_ROOT, 'desktop');
const MOBILE_DIR = path.join(UPLOAD_ROOT, 'mobile');
const PROFILE_DIR = path.join(UPLOAD_ROOT, 'profile');
[UPLOAD_ROOT, DESKTOP_DIR, MOBILE_DIR, PROFILE_DIR].forEach((p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use('/uploads', express.static(UPLOAD_ROOT));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
const appsRouter = require('./routes/apps');
app.use('/api/apps', appsRouter);

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AppHub running at http://localhost:${PORT}`);
});