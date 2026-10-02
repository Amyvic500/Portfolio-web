require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,

  // MySQL connection
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'portfolio_db',

  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Portfolio2026',
  JWT_SECRET: process.env.JWT_SECRET || 'QA9xTGpgPOZiv75FXDeR4YHyNw1ILUbsVndc6KE0',
  OWNER_EMAIL: process.env.OWNER_EMAIL || 'victoriamarachi450@gmail.com',

  // Brevo HTTP API (sends over HTTPS/443 — not blocked by free-tier host firewalls,
  // unlike SMTP on port 587)
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  SENDER_EMAIL: process.env.SENDER_EMAIL || 'victoriamarachi450@gmail.com',
  SENDER_NAME: process.env.SENDER_NAME || 'Victoria Amarachi Philip',
};