import pool from "./db.js";

/**
 * Idempotent schema migrations — safe to run on every server start.
 * Uses ADD COLUMN IF NOT EXISTS so repeated runs are no-ops.
 */
export async function runMigrations() {
    try {
        await pool.query(`
            ALTER TABLE interview_sessions
            ADD COLUMN IF NOT EXISTS scorecard JSONB DEFAULT NULL
        `);
        await pool.query(`
            ALTER TABLE interview_sessions
            ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'STANDARD'
        `);
        console.log('[Migrations] ✓ interview_sessions schema up to date');
    } catch (err) {
        console.error('[Migrations] Schema migration failed:', err.message);
    }

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS squad_messages (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES creator_projects(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                user_name VARCHAR(255),
                text TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('[Migrations] ✓ squad_messages table up to date');
    } catch (err) {
        console.error('[Migrations] squad_messages migration failed:', err.message);
    }

    try {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS elo_rating INT DEFAULT 1200
        `);
        console.log('[Migrations] ✓ users.elo_rating column up to date');
    } catch (err) {
        console.error('[Migrations] elo_rating migration failed:', err.message);
    }

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_tasks (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES creator_projects(id) ON DELETE CASCADE,
                title VARCHAR(300) NOT NULL,
                status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
                assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                assignee_name VARCHAR(255),
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_by_name VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await pool.query(`
            ALTER TABLE creator_projects
            ADD COLUMN IF NOT EXISTS phase VARCHAR(30) DEFAULT 'planning'
        `);
        await pool.query(`
            ALTER TABLE project_members
            ADD COLUMN IF NOT EXISTS role VARCHAR(100)
        `);
        console.log('[Migrations] ✓ project_tasks / phase / member role up to date');
    } catch (err) {
        console.error('[Migrations] project_tasks migration failed:', err.message);
    }

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_weekly_reports (
                id           SERIAL PRIMARY KEY,
                project_id   INTEGER NOT NULL REFERENCES creator_projects(id) ON DELETE CASCADE,
                user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user_name    VARCHAR(255) NOT NULL,
                week_start   DATE NOT NULL,
                what_done    TEXT NOT NULL DEFAULT '',
                what_next    TEXT NOT NULL DEFAULT '',
                blockers     TEXT,
                submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_project_user_week UNIQUE (project_id, user_id, week_start)
            )
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_weekly_reports_project_week
            ON project_weekly_reports (project_id, week_start)
        `);
        console.log('[Migrations] ✓ project_weekly_reports table up to date');
    } catch (err) {
        console.error('[Migrations] project_weekly_reports migration failed:', err.message);
    }

    try {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free'
        `);
        console.log('[Migrations] ✓ users.plan column up to date');
    } catch (err) {
        console.error('[Migrations] plan column migration failed:', err.message);
    }
}
