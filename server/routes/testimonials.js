const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// PUBLIC: get only approved testimonials
router.get('/', async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM testimonials WHERE status='approved' ORDER BY created_at DESC`);
  res.json(rows);
});

// PUBLIC: submit a testimonial (goes to pending, awaits admin approval)
router.post('/', async (req, res) => {
  const { name, role, message, rating } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });
  const [result] = await pool.execute(
    `INSERT INTO testimonials (name, role, message, rating) VALUES (?, ?, ?, ?)`,
    [name, role || '', message, rating || 5]
  );
  res.status(201).json({ ok: true, id: result.insertId });
});

// ADMIN: list all (incl. pending)
router.get('/all', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.json(rows);
});

// ADMIN: approve
router.patch('/:id/approve', requireAuth, async (req, res) => {
  await pool.execute(`UPDATE testimonials SET status='approved' WHERE id=?`, [req.params.id]);
  res.json({ ok: true });
});

// ADMIN: delete
router.delete('/:id', requireAuth, async (req, res) => {
  await pool.execute('DELETE FROM testimonials WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
