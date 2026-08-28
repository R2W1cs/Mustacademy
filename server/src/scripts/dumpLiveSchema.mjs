/**
 * Dump public schema (tables/columns/indexes/constraints) + pgmigrations.
 * Does not print DATABASE_URL. Writes JSON to tmp/schema-dump.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { loadServerEnv } from '../config/loadServerEnv.js';

loadServerEnv();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false },
});

await client.connect();

const tables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);

const columns = await client.query(`
  SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`);

const indexes = await client.query(`
  SELECT tablename, indexname, indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname
`);

const constraints = await client.query(`
  SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
  FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
  ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position
`);

const enums = await client.query(`
  SELECT t.typname AS enum_name, e.enumlabel AS enum_value, e.enumsortorder
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
  ORDER BY t.typname, e.enumsortorder
`);

const fks = await client.query(`
  SELECT
    con.conname AS constraint_name,
    rel.relname AS table_name,
    pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = rel.relnamespace
  WHERE n.nspname = 'public' AND con.contype IN ('f', 'u', 'p', 'c')
  ORDER BY rel.relname, con.conname
`);

let pgmigrations = { exists: false, rows: [] };
try {
  const mig = await client.query(
    `SELECT name, run_on FROM pgmigrations ORDER BY run_on`
  );
  pgmigrations = { exists: true, rows: mig.rows };
} catch {
  pgmigrations = { exists: false, rows: [] };
}

await client.end();

const dump = {
  dumpedAt: new Date().toISOString(),
  tables: tables.rows.map((r) => r.table_name),
  columns: columns.rows,
  indexes: indexes.rows,
  constraints: constraints.rows,
  constraintDefs: fks.rows,
  enums: enums.rows,
  pgmigrations,
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../../tmp');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'schema-dump.json');
fs.writeFileSync(outFile, JSON.stringify(dump, null, 2));
console.log(`tables=${dump.tables.length} columns=${dump.columns.length} indexes=${dump.indexes.length}`);
console.log(`pgmigrations exists=${pgmigrations.exists} count=${pgmigrations.rows.length}`);
if (pgmigrations.rows.length) {
  for (const r of pgmigrations.rows) console.log(`  applied: ${r.name}`);
}
console.log(`wrote ${outFile}`);
