# MustAcademy — Operations Runbook

## Health monitoring

- **Endpoint:** `GET /api/health` returns `{ status, db, uptime }`.
- **Alert when:** HTTP status is not 200, or `db` is not `"ok"`.
- **Suggested tools:** UptimeRobot, Better Stack, or Render health checks (paid tier).

## Error tracking (Sentry)

| Service | Variable |
|---------|----------|
| Backend (Render) | `SENTRY_DSN` |
| Frontend (Vercel) | `VITE_SENTRY_DSN` |

Sentry initializes only when the DSN is present.

## Database backups (Neon)

1. Neon Console -> project -> Backups.
2. Quarterly: restore to a branch, point staging `DATABASE_URL`, run `npm test` in `server/`.

## Migrations

**Canonical path only:** `server/migrations/` via node-pg-migrate (also applied on boot). See `server/MIGRATIONS.md`.

Do not run `server/src/scripts/migration_*.js` or `server/src/migrations/*` — those are legacy.

```bash
cd server
npm run migrate          # apply pending
npm run migrate:status   # dry-run
npm run schema:dump      # dump live schema → tmp/schema-dump.json
```

Optional content seeds (not schema; not on boot):

```bash
npm run seed:course-careers
npm run seed:lesson-content
```

If boot logs `[DB] Connection or migrations FAILED`, fix schema before traffic — migrations no longer continue on failure.

## Rollback

- **Render:** Deploys -> Rollback to last good version -> verify `/api/health`.
- **Vercel:** Deployments -> Promote previous production deploy.