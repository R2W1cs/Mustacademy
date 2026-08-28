/**
 * LEGACY — do not run. Covered by server/migrations/1739200000004_career_full_roadmap.js
 * and 1739200000005_schema_snapshot.
 */
console.error('[Migration 003] DEPRECATED — use npm run migrate');
process.exit(1);

/* historical body retained below for reference — unreachable
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
dotenv.config();

import pool from '../config/db.js';

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE career_roadmaps
        ADD COLUMN IF NOT EXISTS full_roadmap_json JSONB,
        ADD COLUMN IF NOT EXISTS career_key VARCHAR(255)
    `);

    await client.query(`
      ALTER TABLE career_roadmaps
        ALTER COLUMN architecture_json DROP NOT NULL,
        ALTER COLUMN roadmap_steps_json DROP NOT NULL
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_career_roadmaps_career_key
        ON career_roadmaps (user_id, career_key)
    `);

    await client.query('COMMIT');
    console.log('[Migration 003] Done — career full_roadmap_json schema applied.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration 003] Failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
*/
