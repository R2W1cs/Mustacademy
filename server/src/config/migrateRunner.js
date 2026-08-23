import migrate from 'node-pg-migrate';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

export async function runDbMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn('[Migrations] DATABASE_URL not set — skipping');
    return;
  }
  if (process.env.NODE_ENV === 'test') return;

  await migrate({
    databaseUrl: process.env.DATABASE_URL,
    dir: MIGRATIONS_DIR,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: (msg) => console.log(`[Migrations] ${msg}`),
    verbose: false,
  });
  console.log('[Migrations] All migrations applied');
}