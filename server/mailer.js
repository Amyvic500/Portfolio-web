const cfg = require('./config');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Sends email via Brevo's HTTP API (port 443) instead of SMTP (port 587).
// Many free-tier hosts block outbound SMTP to prevent spam relay abuse, but
// HTTPS is never blocked since it's how every web request works — this is
// the reliable path for sending from Render, Railway, or similar platforms.
async function sendMail({ to, subject, text, html, replyTo }) {
  if (!cfg.BREVO_API_KEY) {
    console.warn('[mailer] BREVO_API_KEY not set — skipping send. Add it to your .env/host environment variables.');
    return { skipped: true };
  }

  const body = {
    sender: { name: cfg.SENDER_NAME, email: cfg.SENDER_EMAIL },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html || `<p>${(text || '').replace(/\n/g, '<br>')}</p>`,
  };

  if (replyTo) {
    body.replyTo = { email: replyTo };
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': cfg.BREVO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Brevo API error (${res.status}): ${errText}`);
  }

  return res.json();
}

module.exports = { sendMail };