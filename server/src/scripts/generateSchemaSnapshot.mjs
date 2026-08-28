/**
 * Generate server/migrations/1739200000005_schema_snapshot.js from tmp/schema-dump.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../../..');
const dump = JSON.parse(fs.readFileSync(path.join(root, 'tmp/schema-dump.json'), 'utf8'));

const SKIP_TABLES = new Set(['pgmigrations']);

function sqlType(col) {
  if (col.data_type === 'USER-DEFINED') return col.udt_name;
  if (col.data_type === 'ARRAY') {
    const base = col.udt_name.startsWith('_') ? col.udt_name.slice(1) : col.udt_name;
    return `${base}[]`;
  }
  if (col.data_type === 'character varying') {
    return col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
  }
  if (col.data_type === 'character') {
    return col.character_maximum_length ? `CHAR(${col.character_maximum_length})` : 'CHAR';
  }
  if (col.data_type === 'timestamp without time zone') return 'TIMESTAMP';
  if (col.data_type === 'timestamp with time zone') return 'TIMESTAMPTZ';
  if (col.data_type === 'double precision') return 'DOUBLE PRECISION';
  if (col.data_type === 'time without time zone') return 'TIME';
  return col.data_type.toUpperCase();
}

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function isSerialDefault(def) {
  return typeof def === 'string' && def.startsWith('nextval(');
}

function sequenceName(def) {
  const m = def.match(/nextval\('([^']+)'/);
  return m ? m[1].replace(/::regclass$/, '') : null;
}

const columnsByTable = {};
for (const col of dump.columns) {
  if (SKIP_TABLES.has(col.table_name)) continue;
  (columnsByTable[col.table_name] ||= []).push(col);
}

const pkCols = {};
for (const c of dump.constraints) {
  if (c.constraint_type === 'PRIMARY KEY' && c.column_name) {
    (pkCols[c.table_name] ||= []).push(c.column_name);
  }
}

const fks = dump.constraintDefs.filter((c) => c.definition.startsWith('FOREIGN KEY'));
const uniques = dump.constraintDefs.filter((c) => c.definition.startsWith('UNIQUE'));
const checks = dump.constraintDefs.filter(
  (c) => c.definition.startsWith('CHECK') && !c.definition.includes('IS NOT NULL')
);
const pkeys = dump.constraintDefs.filter((c) => c.definition.startsWith('PRIMARY KEY'));

function referencedTable(def) {
  const m = def.match(/REFERENCES\s+(?:public\.)?(\w+)/i);
  return m ? m[1] : null;
}

const tables = dump.tables.filter((t) => !SKIP_TABLES.has(t));
const deps = Object.fromEntries(tables.map((t) => [t, []]));
for (const fk of fks) {
  const ref = referencedTable(fk.definition);
  if (ref && ref !== fk.table_name && deps[fk.table_name] && tables.includes(ref)) {
    deps[fk.table_name].push(ref);
  }
}

const ordered = [];
const visiting = new Set();
const visited = new Set();
function visit(t) {
  if (visited.has(t)) return;
  if (visiting.has(t)) return;
  visiting.add(t);
  for (const d of deps[t] || []) visit(d);
  visiting.delete(t);
  visited.add(t);
  ordered.push(t);
}
for (const t of tables) visit(t);

const enumMap = {};
for (const e of dump.enums) {
  (enumMap[e.enum_name] ||= []).push(e.enum_value);
}

const lines = [];
lines.push('-- Generated from live Neon schema dump. Idempotent.');
lines.push('-- Do not edit by hand; regenerate with dumpLiveSchema + generateSchemaSnapshot.');
lines.push('');

for (const [name, values] of Object.entries(enumMap)) {
  const list = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');
  lines.push(`DO $$ BEGIN`);
  lines.push(`  CREATE TYPE ${quoteIdent(name)} AS ENUM (${list});`);
  lines.push(`EXCEPTION WHEN duplicate_object THEN NULL;`);
  lines.push(`END $$;`);
  lines.push('');
}

const sequences = new Set();
for (const cols of Object.values(columnsByTable)) {
  for (const col of cols) {
    if (isSerialDefault(col.column_default)) {
      const seq = sequenceName(col.column_default);
      if (seq) sequences.add(seq);
    }
  }
}
for (const seq of [...sequences].sort()) {
  lines.push(`CREATE SEQUENCE IF NOT EXISTS ${quoteIdent(seq)};`);
}
lines.push('');

for (const table of ordered) {
  const cols = columnsByTable[table];
  if (!cols) continue;
  const colSql = cols.map((col) => {
    let def = `  ${quoteIdent(col.column_name)} ${sqlType(col)}`;
    if (col.is_nullable === 'NO') def += ' NOT NULL';
    if (col.column_default != null && col.column_default !== 'null') {
      def += ` DEFAULT ${col.column_default}`;
    }
    return def;
  });
  lines.push(`CREATE TABLE IF NOT EXISTS ${quoteIdent(table)} (`);
  lines.push(colSql.join(',\n'));
  lines.push(');');
  lines.push('');
}

for (const table of ordered) {
  const cols = columnsByTable[table];
  if (!cols) continue;
  for (const col of cols) {
    let type = sqlType(col);
    let extra = '';
    if (col.column_default != null && col.column_default !== 'null') {
      extra += ` DEFAULT ${col.column_default}`;
    }
    lines.push(
      `ALTER TABLE ${quoteIdent(table)} ADD COLUMN IF NOT EXISTS ${quoteIdent(col.column_name)} ${type}${extra};`
    );
  }
  lines.push('');
}

function addConstraint(table, name, definition) {
  lines.push(`DO $$ BEGIN`);
  lines.push(`  IF EXISTS (`);
  lines.push(`    SELECT 1 FROM pg_constraint WHERE conname = '${name.replace(/'/g, "''")}'`);
  lines.push(`  ) THEN`);
  lines.push(`    NULL;`);
  if (definition.startsWith('PRIMARY KEY')) {
    lines.push(`  ELSIF EXISTS (`);
    lines.push(`    SELECT 1`);
    lines.push(`    FROM pg_constraint c`);
    lines.push(`    JOIN pg_class t ON t.oid = c.conrelid`);
    lines.push(`    JOIN pg_namespace n ON n.oid = t.relnamespace`);
    lines.push(`    WHERE n.nspname = 'public' AND t.relname = '${table.replace(/'/g, "''")}' AND c.contype = 'p'`);
    lines.push(`  ) THEN`);
    lines.push(`    NULL;`);
  }
  lines.push(`  ELSE`);
  lines.push(`    ALTER TABLE ${quoteIdent(table)} ADD CONSTRAINT ${quoteIdent(name)} ${definition};`);
  lines.push(`  END IF;`);
  lines.push(`EXCEPTION`);
  lines.push(`  WHEN duplicate_object THEN NULL;`);
  lines.push(`  WHEN others THEN`);
  lines.push(`    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;`);
  lines.push(`END $$;`);
}

for (const c of pkeys) {
  if (SKIP_TABLES.has(c.table_name)) continue;
  addConstraint(c.table_name, c.constraint_name, c.definition);
}
for (const c of uniques) {
  addConstraint(c.table_name, c.constraint_name, c.definition);
}
for (const c of checks) {
  addConstraint(c.table_name, c.constraint_name, c.definition);
}
for (const c of fks) {
  addConstraint(c.table_name, c.constraint_name, c.definition);
}
lines.push('');

const constraintIndexNames = new Set(
  dump.constraintDefs.map((c) => c.constraint_name)
);
for (const idx of dump.indexes) {
  if (SKIP_TABLES.has(idx.tablename)) continue;
  if (constraintIndexNames.has(idx.indexname)) continue;
  if (idx.indexname.endsWith('_pkey')) continue;
  lines.push(`${idx.indexdef};`.replace(/^CREATE UNIQUE INDEX /, 'CREATE UNIQUE INDEX IF NOT EXISTS ')
    .replace(/^CREATE INDEX /, 'CREATE INDEX IF NOT EXISTS '));
}

const sql = lines.join('\n') + '\n';
const sqlPath = path.join(root, 'server/migrations/1739200000005_schema_snapshot.sql');
fs.writeFileSync(sqlPath, sql);

const js = `/** Snapshot of live public schema (dumped ${dump.dumpedAt}). Idempotent. */
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
`;

const out = path.join(root, 'server/migrations/1739200000005_schema_snapshot.js');
fs.writeFileSync(out, js);
console.log('wrote', out, 'and', sqlPath, 'sqlChars', sql.length);
