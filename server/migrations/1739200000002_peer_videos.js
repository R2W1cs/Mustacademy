export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS peer_videos (
      id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), course_id INTEGER REFERENCES courses(id),
      title TEXT NOT NULL, video_url TEXT NOT NULL, description TEXT, uploader_note TEXT,
      likes INTEGER DEFAULT 0, is_public BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS video_reactions (
      id SERIAL PRIMARY KEY, video_id INTEGER REFERENCES peer_videos(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(video_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS video_feedback (
      id SERIAL PRIMARY KEY, video_id INTEGER REFERENCES peer_videos(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, feedback_text TEXT NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL, message TEXT NOT NULL, related_id INTEGER,
      read BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_peer_videos_course ON peer_videos (course_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
  `);
};
export const down = (pgm) => {
  pgm.dropTable('notifications', { ifExists: true, cascade: true });
  pgm.dropTable('video_feedback', { ifExists: true, cascade: true });
  pgm.dropTable('video_reactions', { ifExists: true, cascade: true });
  pgm.dropTable('peer_videos', { ifExists: true, cascade: true });
};