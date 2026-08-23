import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { ACCESS_COOKIE } from '../utils/authCookies.js';

function extractAccessToken(req) {
  if (req.cookies?.[ACCESS_COOKIE]) return req.cookies[ACCESS_COOKIE];
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return null;
}

export const protect = async (req, res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      'SELECT role, token_version FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { role, token_version } = rows[0];
    const tokenVersion = decoded.tv ?? 0;

    if (tokenVersion !== (token_version ?? 0)) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    req.user = { id: decoded.id, role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requirePremium = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT plan FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0] || rows[0].plan !== 'premium') {
      return res.status(403).json({ error: 'premium_required' });
    }
    next();
  } catch {
    return res.status(500).json({ message: 'Failed to verify plan' });
  }
};
