const nodemailer = require('nodemailer');
const cfg = require('./config');

let transporter = null;

function getTransporter() {
  if (!cfg.SMTP_USER || !cfg.SMTP_PASS) {
    return null; // Not configured yet — caller should handle gracefully
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: cfg.SMTP_HOST,
      port: cfg.SMTP_PORT,
      secure: false, // Brevo uses STARTTLS on 587
      auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html, replyTo }) {
  const t = getTransporter();
  if (!t) {
    console.warn('[mailer] SMTP not configured — skipping send. Set SMTP_USER/SMTP_PASS in .env');
    return { skipped: true };
  }
  return t.sendMail({
    from: cfg.SMTP_FROM,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

module.exports = { sendMail };
