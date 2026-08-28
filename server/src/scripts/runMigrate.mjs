/**
 * Apply node-pg-migrate with UTF-16-safe .env loading.
 * Usage: node src/scripts/runMigrate.mjs [--dry-run]
 */
import { loadServerEnv } from '../config/loadServerEnv.js';
loadServerEnv();

import { runner } from 'node-pg-migrate';
import path from 'path';
import { fileURLToPath } from 'url';

const dryRun = process.argv.includes('--dry-run');
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../migrations');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

await runner({
  databaseUrl: process.env.DATABASE_URL,
  dir,
  direction: 'up',
  migrationsTable: 'pgmigrations',
  ignorePattern: '.*\\.(sql|md)$',
  dryRun,
  log: (msg) => console.log(`[Migrations] ${msg}`),
  verbose: false,
});

console.log(dryRun ? '[Migrations] dry-run complete' : '[Migrations] ✓ All migrations applied');
