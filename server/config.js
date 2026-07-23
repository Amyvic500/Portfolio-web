require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,

  // MySQL connection
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'portfolio_db',

  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'changeme123',
  JWT_SECRET: process.env.JWT_SECRET || 'replace-this-secret-in-env',
  OWNER_EMAIL: process.env.OWNER_EMAIL || 'victoriamarachi450@gmail.com',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Victoria Amarachi Portfolio <no-reply@example.com>',
};
