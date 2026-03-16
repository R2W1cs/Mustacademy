import 'dotenv/config';
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

// Test DB Connection
pool.query('SELECT NOW()')
  .then(() => console.log('[DB] Connection Verified.'))
  .catch(err => console.error('[DB] Connection FAILED:', err.message));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[CRITICAL] Port ${PORT} is already in use. Clean up your terminals!`);
  } else {
    console.error('[CRITICAL] Server Error:', err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Dual Stack)`);
});
