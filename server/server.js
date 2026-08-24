import 'dotenv/config';
import { validateEnv } from './src/config/validateEnv.js';
import { initSentry } from './src/monitoring/sentry.js';
import { runDbMigrations } from './src/config/migrateRunner.js';
import {
  ensureCareerRoadmapSchema,
  ensureCourseCareerSeed,
} from './src/config/ensureCareerSchema.js';
validateEnv();
initSentry();

import http from 'http';
import app from './src/app.js';
import { initIo } from './src/lib/io.js';

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  console.error(err.stack);
  process.exit(1);
});

import pool from './src/config/db.js';
import { redisAvailable } from './src/config/redis.js';
import { startSynthesisWorker } from './src/workers/synthesis.worker.js';
import { startMasterclassWorker } from './src/workers/masterclass.worker.js';

const PORT = parseInt(process.env.PORT) || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initIo(server);

// Test DB Connection + run schema migrations + free-tier schema ensure
pool.query('SELECT NOW()')
  .then(async () => {
    console.log('[DB] Connection Verified.');
    try {
      await runDbMigrations();
    } catch (err) {
      console.error('[DB] node-pg-migrate failed (continuing with ensure):', err.message);
    }
    // Always patch career columns — works without Render shell / migrate CLI
    await ensureCareerRoadmapSchema();
    await ensureCourseCareerSeed();
  })
  .catch(err => console.error('[DB] Connection FAILED:', err.message));

// Start BullMQ workers (no-ops when REDIS_URL is not set)
if (redisAvailable) {
  startSynthesisWorker();
  startMasterclassWorker();
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[CRITICAL] Port ${PORT} is already in use. Clean up your terminals!`);
  } else {
    console.error('[CRITICAL] Server Error:', err);
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
