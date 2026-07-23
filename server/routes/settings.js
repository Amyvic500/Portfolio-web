const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'profile');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
    cb(null, 'profile-' + Date.now() + safeExt);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, or WEBP images are accepted'), ok);
  },
});

// Keys allowed to be edited as plain text via the generic endpoint below.
// Add a new key here whenever a new editable text field is needed on any
// page — no other backend change required.
const TEXT_SETTING_KEYS = new Set(['hero_tagline', 'hero_name', 'about_bio']);

// PUBLIC: get all site settings as a { key: value } map
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
  const map = {};
  rows.forEach(r => { map[r.setting_key] = r.setting_value; });
  res.json(map);
});

// ADMIN: upload/replace the profile (hero) image
router.post('/profile-image', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

  // Remove the previous profile image file (if any) to avoid orphaned uploads
  const [existing] = await pool.query("SELECT setting_value FROM site_settings WHERE setting_key='profile_image'");
  const oldPath = existing[0]?.setting_value;
  if (oldPath) {
    const p = path.join(__dirname, '..', oldPath.replace('/uploads', 'uploads'));
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  const filePath = `/uploads/profile/${req.file.filename}`;
  await pool.execute(
    `INSERT INTO site_settings (setting_key, setting_value) VALUES ('profile_image', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [filePath]
  );
  res.status(201).json({ ok: true, profile_image: filePath });
});

// ADMIN: update a generic text setting (e.g. hero tagline)
router.post('/:key', requireAuth, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (!TEXT_SETTING_KEYS.has(key)) return res.status(400).json({ error: 'Unknown or unsupported setting key.' });
  if (typeof value !== 'string') return res.status(400).json({ error: 'A text value is required.' });

  await pool.execute(
    `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value]
  );
  res.json({ ok: true, [key]: value });
});

module.exports = router;
