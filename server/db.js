const mysql = require('mysql2/promise');
const cfg = require('./config');

const pool = mysql.createPool({
  host: cfg.DB_HOST,
  port: cfg.DB_PORT,
  user: cfg.DB_USER,
  password: cfg.DB_PASSWORD,
  database: cfg.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Creates all tables if they don't exist yet. Called once on server startup.
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255),
      budget VARCHAR(100),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'new',
      reply_text TEXT,
      replied_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      issuer VARCHAR(255),
      issue_date VARCHAR(50),
      category VARCHAR(50) DEFAULT 'other',
      status VARCHAR(20) DEFAULT 'earned',
      file_path VARCHAR(500),
      cert_id VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(50),
      subtitle VARCHAR(255),
      description TEXT,
      stack TEXT,
      outcomes TEXT,
      github_url VARCHAR(500),
      demo_url VARCHAR(500),
      featured TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      message TEXT NOT NULL,
      rating INT DEFAULT 5,
      status VARCHAR(20) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cv (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255),
      file_path VARCHAR(500),
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Generic key/value store for editable site content (profile photo, hero
  // tagline, etc). New editable fields can be added later just by reading/
  // writing a new setting_key here — no schema change required.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

module.exports = { pool, initSchema };
