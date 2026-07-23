// Run once with: node server/seed.js
// Populates the MySQL database with Victoria's real certificates and projects.
// Safe to re-run — only inserts if the tables are empty.

const { pool, initSchema } = require('./db');

async function seed() {
  await initSchema();

  const [[{ c: certCount }]] = await pool.query('SELECT COUNT(*) c FROM certificates');
  if (certCount === 0) {
    const certs = [
      ['DevOps Professional Certificate', 'PagerDuty & LinkedIn Learning', 'Nov 2025', 'devops', 'earned', '/uploads/certs/devops-pagerduty.pdf', '8bf6fe3e15ea9d6dbdee31bce8ca88339372314dd988cdd2f315c6170037457d'],
      ['Microsoft SQL Server 2022 Essential Training', 'LinkedIn Learning', 'Nov 2025', 'database', 'earned', '/uploads/certs/sqlserver2022.pdf', 'd461a3030a08267cbaba93934522637f93187072122fe9986bdbe4a9ef39640e'],
      ['Ubuntu Linux: Essential Commands & System Administration', 'LinkedIn Learning', 'Oct 2025', 'networking', 'earned', '/uploads/certs/ubuntu-linux.pdf', 'fb935c2261b618f2e99afbef02ce7d218924694571ba6dccff51070869c2c410'],
      ['CompTIA+', 'CompTIA', '', 'other', 'in-progress', null, ''],
      ['Ethical Hacking', '', '', 'security', 'in-progress', null, ''],
    ];
    for (const c of certs) {
      await pool.execute(
        `INSERT INTO certificates (name, issuer, issue_date, category, status, file_path, cert_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        c
      );
    }
    console.log('Seeded certificates.');
  }

  const [[{ c: projCount }]] = await pool.query('SELECT COUNT(*) c FROM projects');
  if (projCount === 0) {
    const projects = [
      ['CareQueue', 'healthcare', 'Healthcare Queue Management System — DevOps Engineer & Backend Developer',
        'A microservices-based healthcare queue management platform built during the Women Techsters Fellowship DevOps scholarship. Handles real-time queue management, AI-powered wait time predictions, and SMS notifications via Twilio, with a staff admin dashboard.',
        'Docker,Docker Compose,Nginx,Flask,React,FastAPI,PostgreSQL,Redis,Celery,AWS EC2,Render.com,Twilio',
        'Wrote 4 Dockerfiles across services (Flask/Gunicorn, React/Nginx, FastAPI)\nOrchestrated a 6-container Docker Compose stack\nConfigured Nginx reverse proxy with WebSocket upgrade support\nDeployed to Render.com (staging) and AWS EC2 (production)\nImplemented RBAC and NDPR-compliant data handling',
        'https://github.com/Amyvic500/Portfolio-web', 'https://nexus-carequeue-backend.onrender.com', 1, 1],
      ['ITForm Enterprise', 'web', 'Custom IT Request Management System — Sole Developer',
        'A pure PHP 7.1 MVC application (no framework) built from the ground up for Prime Bisco Nigeria Limited, running on SQL Server 2025 Express. Handles company-wide IT request submission, HOD/IT HOD approval workflows, and admin management — with a public-facing request form as the homepage and a separate secure admin login.',
        'PHP,MVC (custom),SQL Server,PDO/sqlsrv,PSR-4 Autoloading,HTML/CSS/JS',
        'Built full MVC architecture without a framework, including manual PSR-4 autoloading\nResolved UTF-8 BOM and PDO/sqlsrv configuration issues\nDesigned public request form as homepage with a separate secure admin login\nDelivered Phases 1–4 and pushed to a private GitHub repository',
        'https://github.com/Amyvic500/ITForm-Enterprise', '', 1, 2],
      ['ITForms — Applications & Approval Workflow', 'web', 'Laravel Web Application — IT Administrator & Application Support',
        "An internal Laravel application (PHP 7.1, SQL Server via sqlsrv) supporting Prime Bisco's IT request process. Migrated the system from a hardcoded legacy field structure to a dynamic Applications system, and built per-item approve/dismiss functionality into the HOD/IT HOD approval workflow.",
        'PHP,Laravel,SQL Server,Blade,XAMPP,Brevo SMTP',
        'Migrated legacy hardcoded fields to a dynamic req_applications system\nBuilt shared Blade partials for consistent request views across the app\nDiagnosed and fixed a queue worker hang that was blocking email delivery\nResolved a SQL Server UPDATE error caused by a column type mismatch',
        '', '', 0, 3],
      ['IT Infrastructure Deployment', 'network', '',
        'Coordinated installation of 68 network cameras and multi-site infrastructure for a large organisation.',
        'LAN/WAN,CCTV,Networking,Windows Server',
        '99.9% network uptime achieved\n68 cameras successfully installed', '', '', 0, 4],
      ['Automated Database Backup System', 'database', '',
        'Implemented an automated SQL Server backup solution for critical business data, later hardened further with an rclone-based Google Drive sync after a production incident on a legacy server.',
        'SQL Server,SQL Agent,T-SQL,rclone,Windows Server',
        '35% increase in system uptime\nZero data loss incidents post-deployment', '', '', 0, 5],
      ['Inventory Tracking Automation', 'automation', '',
        'Built an automated inventory management system using Google Sheets with Apps Script triggers, automated alerts, and reporting workflows.',
        'Google Sheets,Apps Script,Automation,Reporting',
        '40% improvement in tracking efficiency\nEliminated manual data entry errors', '', '', 0, 6],
      ['Business Data Dashboard Suite', 'dashboard', '',
        'Created interactive dashboards for performance tracking, sales analytics, and inventory reporting.',
        'Excel,Power BI,Pivot Tables,Charts',
        'Used by leadership for decision making\nReduced reporting time significantly', '', '', 0, 7],
    ];
    for (const p of projects) {
      await pool.execute(
        `INSERT INTO projects (title, category, subtitle, description, stack, outcomes, github_url, demo_url, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p
      );
    }
    console.log('Seeded projects.');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
