const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const cfg = require('./config');
const { initSchema } = require('./db');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Uploaded files (certs, cv) served statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/messages', require('./routes/messages'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/admin', require('./routes/admin'));

// Serve the frontend (public/) as static site
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

// Fallback to index.html for the root (simple multi-page site, no client routing needed)
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// Basic error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

initSchema()
  .then(() => {
    app.listen(cfg.PORT, () => {
      console.log(`Portfolio server running on http://localhost:${cfg.PORT}`);
    });
  })
  .catch(err => {
    console.error('Could not connect to MySQL. Check DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in your .env file.');
    console.error(err.message);
    process.exit(1);
  });
