import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not defined');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  // --- RESILIENCE FOR NEON/SERVERLESS ---
  max: 20,                // Higher limit for multi-user/multi-window testing
  idleTimeoutMillis: 30000,   // Wait longer before killing idles (30s)
  connectionTimeoutMillis: 20000, // Fail faster if acquiring is impossible (20s)
  allowExitOnIdle: false,
  keepAlive: true,        // Heartbeat active
  keepAliveInitialDelayMillis: 10000, // Start heartbeat after 10s
  statement_timeout: 60000 // Kill hanging queries after 60s
});

// Handle pool errors to prevent crashes
pool.on('error', (err, client) => {
  console.error('[DB POOL ERROR] Unexpected error on idle client', err);
  // Don't exit the process, just log the error
});

// Handle connection events
pool.on('connect', (client) => {
  console.log('[DB] New client connected to pool');
});

pool.on('acquire', (client) => {
  console.log('[DB] Client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('[DB] Client removed from pool');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[DB] Closing pool on SIGINT');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[DB] Closing pool on SIGTERM');
  await pool.end();
  process.exit(0);
});

export default pool;
