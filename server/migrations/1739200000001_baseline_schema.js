export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS scorecard JSONB DEFAULT NULL;
    ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'STANDARD';
    CREATE TABLE IF NOT EXISTS squad_messages (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES creator_projects(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_name VARCHAR(255), text TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS elo_rating INT DEFAULT 1200;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};
export const down = () => {};