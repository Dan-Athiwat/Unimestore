// routes/apps.js
// API for create/list/detail/download apps

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db');

// Upload storage
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const DESKTOP_DIR = path.join(UPLOAD_ROOT, 'desktop');
const MOBILE_DIR = path.join(UPLOAD_ROOT, 'mobile');
const PROFILE_DIR = path.join(UPLOAD_ROOT, 'profile');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'desktopFile') cb(null, DESKTOP_DIR);
    else if (file.fieldname === 'mobileFile') cb(null, MOBILE_DIR);
    else if (file.fieldname === 'profile') cb(null, PROFILE_DIR);
    else cb(null, UPLOAD_ROOT);
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
});

// Helpers
function escapeHTML(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// List with search/filter
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const cat = (req.query.cat || '').trim();

  const params = [];
  let where = ' WHERE 1=1 ';
  if (q) {
    where += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?) ';
    params.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
  }
  if (cat) {
    where += ' AND category = ? ';
    params.push(cat);
  }

  db.all(`SELECT * FROM apps ${where} ORDER BY datetime(created_at) DESC`, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Unique categories
router.get('/categories', (req, res) => {
  db.all(`SELECT DISTINCT category FROM apps ORDER BY category ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.category));
  });
});

// Detail
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'invalid id' });
  db.get(`SELECT * FROM apps WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });
});

// Create (upload)
router.post(
  '/',
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'desktopFile', maxCount: 1 },
    { name: 'mobileFile', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const name = (req.body.name || '').trim();
      const description = (req.body.description || '').trim();
      const category = (req.body.category || '').trim();
      const desktopVersion = (req.body.desktopVersion || '').trim();
      const mobileVersion = (req.body.mobileVersion || '').trim();

      const profileFile = req.files?.profile?.[0];
      const desktopFile = req.files?.desktopFile?.[0];
      const mobileFile = req.files?.mobileFile?.[0];

      const errors = [];
      if (!name) errors.push('กรุณาใส่ชื่อแอพ');
      if (!description) errors.push('กรุณาใส่คำอธิบาย');
      if (!category) errors.push('กรุณาใส่ประเภทแอพ/เกม');
      if (errors.length) return res.status(400).json({ errors });

      const createdAt = new Date().toISOString();

      db.run(
        `INSERT INTO apps 
         (name, description, category, desktop_version, mobile_version, desktop_file_path, mobile_file_path, profile_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description,
          category,
          desktopVersion || null,
          mobileVersion || null,
          desktopFile ? desktopFile.path : null,
          mobileFile ? mobileFile.path : null,
          profileFile ? profileFile.path : null,
          createdAt
        ],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: this.lastID });
        }
      );
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Download
router.get('/:id/download', (req, res) => {
  const id = Number(req.params.id);
  const device = (req.query.device || '').toLowerCase();

  if (!Number.isInteger(id) || id <= 0) return res.status(400).send('invalid id');

  db.get(`SELECT * FROM apps WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).send('not found');

    let filePath = null;
    if (device === 'mobile') filePath = row.mobile_file_path;
    else if (device === 'desktop') filePath = row.desktop_file_path;
    else filePath = row.desktop_file_path; // default

    if (!filePath || !fs.existsSync(filePath)) return res.status(404).send('file not available');
    res.download(filePath, path.basename(filePath));
  });
});

module.exports = router;