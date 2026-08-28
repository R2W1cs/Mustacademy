import { runner } from 'node-pg-migrate';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

/**
 * Runs versioned SQL migrations via node-pg-migrate.
 * Replaces inline runtime DDL in controllers.
 */
export async function runDbMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn('[Migrations] DATABASE_URL not set — skipping');
    return;
  }

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    await runner({
  databaseUrl: process.env.DATABASE_URL,
  dir: MIGRATIONS_DIR,
  direction: 'up',
  migrationsTable: 'pgmigrations',
  ignorePattern: '.*\\.(sql|md)$',
  log: (msg) => console.log(`[Migrations] ${msg}`),
  verbose: false,
});
    console.log('[Migrations] ✓ All migrations applied');
  } catch (err) {
    console.error('[Migrations] Failed:', err.message);
    throw err;
  }
}