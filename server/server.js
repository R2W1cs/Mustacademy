import 'dotenv/config';
import { validateEnv } from './src/config/validateEnv.js';
import { runMigrations } from './src/config/runMigrations.js';
validateEnv();

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

const PORT = parseInt(process.env.PORT) || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initIo(server);

// Test DB Connection + run schema migrations
pool.query('SELECT NOW()')
  .then(() => {
    console.log('[DB] Connection Verified.');
    return runMigrations();
  })
  .catch(err => console.error('[DB] Connection FAILED:', err.message));

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
