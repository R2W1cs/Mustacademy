import { runDbMigrations } from './migrateRunner.js';

/**
 * @deprecated Use runDbMigrations from migrateRunner.js (node-pg-migrate).
 * Kept for scripts that still import this module.
 */
export async function runMigrations() {
  return runDbMigrations();
}
