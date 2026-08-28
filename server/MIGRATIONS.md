# Database migrations (canonical)

**Only** `server/migrations/` + `node-pg-migrate` define schema.

| Command | Purpose |
|---------|---------|
| `npm run migrate` | Apply pending migrations |
| `npm run migrate:status` | Dry-run / show what would apply |
| `npm run schema:dump` | Dump live schema to `tmp/schema-dump.json` |
| `npm run schema:snapshot` | Regenerate `1739200000005_schema_snapshot.*` from dump |
| `npm run seed:course-careers` | Optional data seed (course↔career links) |
| `npm run seed:lesson-content` | Optional lesson markdown sync |

## Rules

1. **New schema changes** → add a new timestamped `.js` file under `server/migrations/` (never edit applied ones). Put only `*.js` migration files in that folder (no README — node-pg-migrate loads every file).
2. **Do not** add DDL to controllers or boot-time `ensure*` patches.
3. **Do not** run `server/src/scripts/migration_*.js` or `server/src/migrations/*.js` — those are **legacy one-offs** kept for history only.
4. Boot runs `runDbMigrations()` and **fails the process** if migrations fail (no silent continue).
5. Content seeds are **CLI only**, not boot.

## Snapshot

`1739200000005_schema_snapshot` was generated from the live Neon public schema so a fresh database can recreate structure without replaying dozens of historical scripts. It is idempotent (`IF NOT EXISTS` / exception guards). The companion `.sql` file is loaded by the `.js` migration wrapper.
