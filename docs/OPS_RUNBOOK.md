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

Files: `server/migrations/`. Applied on boot via node-pg-migrate.

```bash
cd server && npm run migrate
```

## Rollback

- **Render:** Deploys -> Rollback to last good version -> verify `/api/health`.
- **Vercel:** Deployments -> Promote previous production deploy.