const express = require('express');
const { pool } = require('../db');
const { sendMail } = require('../mailer');
const { requireAuth } = require('../middleware/auth');
const cfg = require('../config');

const router = express.Router();

// PUBLIC: submit contact form
router.post('/', async (req, res) => {
  const { fullName, email, phone, subject, budget, message, consent } = req.body;
  if (!fullName || !email || !message || !consent) {
    return res.status(400).json({ error: 'Full name, email, message and consent are required.' });
  }

  const [result] = await pool.execute(
    `INSERT INTO messages (full_name, email, phone, subject, budget, message) VALUES (?, ?, ?, ?, ?, ?)`,
    [fullName, email, phone || '', subject || '', budget || '', message]
  );

  try {
    await sendMail({
      to: cfg.OWNER_EMAIL,
      subject: `New portfolio enquiry: ${subject || 'General'} — ${fullName}`,
      replyTo: email,
      text: `From: ${fullName} <${email}>\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\nBudget: ${budget || 'N/A'}\n\nMessage:\n${message}`,
      html: `<p><strong>From:</strong> ${fullName} &lt;${email}&gt;</p>
             <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
             <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
             <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
             <p><strong>Message:</strong><br>${(message || '').replace(/\n/g, '<br>')}</p>`,
    });
  } catch (e) {
    console.error('Failed to send notification email:', e.message);
  }

  res.status(201).json({ ok: true, id: result.insertId });
});

// ADMIN: list messages
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(rows);
});

// ADMIN: mark as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  await pool.execute(`UPDATE messages SET status='read' WHERE id=? AND status='new'`, [req.params.id]);
  res.json({ ok: true });
});

// ADMIN: archive
router.patch('/:id/archive', requireAuth, async (req, res) => {
  await pool.execute(`UPDATE messages SET status='archived' WHERE id=?`, [req.params.id]);
  res.json({ ok: true });
});

// ADMIN: reply to a message (sends real email back to the client)
router.post('/:id/reply', requireAuth, async (req, res) => {
  const { replyText } = req.body;
  if (!replyText) return res.status(400).json({ error: 'Reply text is required.' });

  const [rows] = await pool.execute('SELECT * FROM messages WHERE id=?', [req.params.id]);
  const msg = rows[0];
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  try {
    await sendMail({
      to: msg.email,
      subject: `Re: ${msg.subject || 'Your enquiry'} — Victoria Amarachi Philip`,
      replyTo: cfg.OWNER_EMAIL,
      text: replyText,
      html: `<p>${replyText.replace(/\n/g, '<br>')}</p><hr><p style="color:#888;font-size:12px">Victoria Amarachi Philip · IT Administrator & DevOps Professional</p>`,
    });
  } catch (e) {
    console.error('Failed to send reply email:', e.message);
    return res.status(500).json({ error: 'Reply saved, but the email failed to send. Check SMTP settings.' });
  }

  await pool.execute(
    `UPDATE messages SET status='replied', reply_text=?, replied_at=NOW() WHERE id=?`,
    [replyText, req.params.id]
  );

  res.json({ ok: true });
});

module.exports = router;
