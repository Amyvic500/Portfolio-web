const jwt = require('jsonwebtoken');
const cfg = require('../config');

function requireAuth(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    jwt.verify(token, cfg.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = { requireAuth };
