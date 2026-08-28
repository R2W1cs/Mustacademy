/** Snapshot of live public schema (dumped 2026-08-27T11:16:21.285Z). Idempotent. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const up = (pgm) => {
  const sql = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '1739200000005_schema_snapshot.sql'),
    'utf8'
  );
  pgm.sql(sql);
};

export const down = () => {
  // Irreversible snapshot — restore from backup instead of dropping 50+ tables.
};
