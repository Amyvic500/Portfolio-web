const express = require('express');
const jwt = require('jsonwebtoken');
const cfg = require('../config');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/login  { password }
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== cfg.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = jwt.sign({ admin: true }, cfg.JWT_SECRET, { expiresIn: '12h' });
  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

router.get('/check', requireAuth, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
