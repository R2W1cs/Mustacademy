import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Missing fields' });

  const exists = await pool.query(
    'SELECT id FROM users WHERE email=$1',
    [email]
  );

  if (exists.rows.length > 0)
    return res.status(409).json({ message: 'Email already used' });

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1,$2,$3)
     RETURNING id, name, email, role`,
    [name, email, hash]
  );

  const user = result.rows[0];

  // Initialize User Stats
  await pool.query(
    "INSERT INTO user_stats (user_id) VALUES ($1)",
    [user.id]
  );
  await pool.query(
    "INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'INIT_PROFILE', 5)",
    [user.id]
  );

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ user, token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ message: 'Invalid credentials' });

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  delete user.password_hash;

  res.json({ user, token });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // If no email creds are set, log the link for dev testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('================================================');
      console.log('DEV MODE - Password Reset Link:', resetLink);
      console.log('Setup EMAIL_USER and EMAIL_PASS in .env to send real emails');
      console.log('================================================');

      // Still return success so frontend flow works
      return res.json({ message: 'Password reset link sent (Check server logs in Dev mode)' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      text: `Click the link to reset your password: ${resetLink}`,
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to your email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash=$1 WHERE id=$2',
      [hash, decoded.id]
    );

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
