const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'cv');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, 'CV-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /pdf|msword|officedocument/.test(file.mimetype);
    cb(ok ? null : new Error('Only PDF or Word documents are accepted'), ok);
  },
});

// PUBLIC: get latest CV info
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM cv ORDER BY uploaded_at DESC LIMIT 1');
  res.json(rows[0] || null);
});

// PUBLIC: download latest CV
router.get('/download', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM cv ORDER BY uploaded_at DESC LIMIT 1');
  const row = rows[0];
  if (!row) return res.status(404).send('No CV uploaded yet.');
  const filePath = path.join(__dirname, '..', row.file_path.replace('/uploads', 'uploads'));
  res.download(filePath, row.file_name);
});

// ADMIN: upload/replace CV
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const filePath = `/uploads/cv/${req.file.filename}`;
  await pool.execute('INSERT INTO cv (file_name, file_path) VALUES (?, ?)', [req.file.originalname, filePath]);
  res.status(201).json({ ok: true, file_path: filePath });
});

module.exports = router;
