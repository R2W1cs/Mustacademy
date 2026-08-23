import crypto from 'crypto';
import pool from '../config/db.js';

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

export async function createRefreshToken(userId) {
  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );

  return raw;
}

export async function consumeRefreshToken(raw) {
  const tokenHash = hashToken(raw);

  const claim = await pool.query(
    `UPDATE refresh_tokens
       SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()
     RETURNING id, user_id`,
    [tokenHash]
  );

  if (!claim.rows.length) return null;
  return claim.rows[0];
}

export async function revokeRefreshToken(raw) {
  if (!raw) return;
  const tokenHash = hashToken(raw);
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash]
  );
}

export async function revokeAllUserRefreshTokens(userId) {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId]
  );
}