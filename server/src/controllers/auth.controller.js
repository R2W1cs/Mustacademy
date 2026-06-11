import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '1h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RESET_GENERIC_MSG = 'If an account exists for that email, a reset link has been sent.';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, tv: user.token_version ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const isLocked = (user) =>
  user.locked_until && new Date(user.locked_until) > new Date();

const recordFailedLogin = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
         locked_until = CASE
           WHEN COALESCE(failed_login_attempts, 0) + 1 >= $2
           THEN NOW() + ($3 || ' minutes')::interval
           ELSE locked_until
         END
     WHERE id = $1
     RETURNING failed_login_attempts, locked_until`,
    [userId, MAX_FAILED_ATTEMPTS, String(LOCKOUT_MINUTES)]
  );
  return rows[0];
};

const clearFailedLogins = async (userId) => {
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
    [userId]
  );
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (exists.rows.length > 0) {
    return res.status(409).json({ message: 'Email already used' });
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1,$2,$3)
     RETURNING id, name, email, role, token_version`,
    [name, email, hash]
  );

  const user = result.rows[0];

  await pool.query('INSERT INTO user_stats (user_id) VALUES ($1)', [user.id]);
  await pool.query(
    "INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'INIT_PROFILE', 5)",
    [user.id]
  );

  const token = signAccessToken(user);
  res.status(201).json({ user, token });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT id, name, email, role, password_hash, token_version,
              failed_login_attempts, locked_until
       FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (isLocked(user)) {
      return res.status(423).json({
        message: `Account temporarily locked. Try again after ${LOCKOUT_MINUTES} minutes.`,
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await recordFailedLogin(user.id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await clearFailedLogins(user.id);

    const token = signAccessToken(user);
    delete user.password_hash;
    delete user.failed_login_attempts;
    delete user.locked_until;

    res.json({ user, token });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again shortly.' });
  }
};

export const getSession = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, plan FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  res.json({ user: rows[0] });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT id FROM users WHERE email=$1', [email]);

    if (result.rows.length === 0) {
      return res.json({ message: RESET_GENERIC_MSG });
    }

    const user = result.rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query('DELETE FROM password_resets WHERE user_id=$1', [user.id]);
    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
      [user.id, tokenHash, expiresAt]
    );

    const resetLink = `${FRONTEND_URL}/reset-password/${rawToken}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('================================================');
      console.log('DEV MODE - Password Reset Link:', resetLink);
      console.log('Set EMAIL_USER and EMAIL_PASS in .env to send real emails');
      console.log('================================================');
      return res.json({ message: RESET_GENERIC_MSG });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      text: `Click the link to reset your password (valid for 15 minutes): ${resetLink}`,
      html: `<p>Click the link to reset your password (valid for 15 minutes): <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.json({ message: RESET_GENERIC_MSG });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const tokenHash = hashToken(token);

    const claim = await pool.query(
      `UPDATE password_resets
         SET used_at = NOW()
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       RETURNING user_id`,
      [tokenHash]
    );

    if (claim.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userId = claim.rows[0].user_id;
    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await pool.query(
      `UPDATE users
       SET password_hash=$1,
           token_version = COALESCE(token_version, 0) + 1,
           failed_login_attempts = 0,
           locked_until = NULL
       WHERE id=$2`,
      [hash, userId]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
