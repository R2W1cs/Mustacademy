import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No auth header' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bad auth format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
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
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify plan' });
  }
};
