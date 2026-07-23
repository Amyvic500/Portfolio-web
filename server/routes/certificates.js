const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'certs');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, or PDF files are accepted'), ok);
  },
});

// PUBLIC: list certificates
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM certificates ORDER BY created_at DESC');
  res.json(rows);
});

// ADMIN: upload a new certificate
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  const { name, issuer, issue_date, category, status, cert_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Certificate name is required.' });

  const filePath = req.file ? `/uploads/certs/${req.file.filename}` : null;
  const [result] = await pool.execute(
    `INSERT INTO certificates (name, issuer, issue_date, category, status, file_path, cert_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, issuer || '', issue_date || '', category || 'other', status || 'earned', filePath, cert_id || '']
  );
  res.status(201).json({ ok: true, id: result.insertId, file_path: filePath });
});

// ADMIN: delete a certificate
router.delete('/:id', requireAuth, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM certificates WHERE id=?', [req.params.id]);
  const cert = rows[0];
  if (cert && cert.file_path) {
    const p = path.join(__dirname, '..', cert.file_path.replace('/uploads', 'uploads'));
    fs.existsSync(p) && fs.unlinkSync(p);
  }
  await pool.execute('DELETE FROM certificates WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
