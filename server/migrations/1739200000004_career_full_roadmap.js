export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE career_roadmaps
      ADD COLUMN IF NOT EXISTS full_roadmap_json JSONB,
      ADD COLUMN IF NOT EXISTS career_key VARCHAR(255);

    ALTER TABLE career_roadmaps
      ALTER COLUMN architecture_json DROP NOT NULL,
      ALTER COLUMN roadmap_steps_json DROP NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_career_roadmaps_career_key
      ON career_roadmaps (user_id, career_key);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_career_roadmaps_career_key;
    ALTER TABLE career_roadmaps
      DROP COLUMN IF EXISTS full_roadmap_json,
      DROP COLUMN IF EXISTS career_key;
  `);
};
