import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id=$1',
    [req.user.id]
  );

  res.json(result.rows[0]);
});

export default router;
