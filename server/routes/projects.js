const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC'
  );
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { title, category, subtitle, description, stack, outcomes, github_url, demo_url, featured } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
  const [result] = await pool.execute(
    `INSERT INTO projects (title, category, subtitle, description, stack, outcomes, github_url, demo_url, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, category || 'other', subtitle || '', description, stack || '', outcomes || '', github_url || '', demo_url || '', featured ? 1 : 0]
  );
  res.status(201).json({ ok: true, id: result.insertId });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await pool.execute('DELETE FROM projects WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
