export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE user_topic_progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_forum_threads_search ON forum_threads
      USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
    CREATE INDEX IF NOT EXISTS idx_forum_comments_thread ON forum_comments (thread_id);
  `);
};
export const down = (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS idx_forum_comments_thread');
  pgm.sql('DROP INDEX IF EXISTS idx_forum_threads_search');
};