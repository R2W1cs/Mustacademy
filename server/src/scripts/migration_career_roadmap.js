import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Career Roadmap Migration...");

        // Create career_roadmaps table
        // This table stores the Professor's AI-generated trajectory for each user
        await pool.query(`
            CREATE TABLE IF NOT EXISTS career_roadmaps (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                target_job VARCHAR(255) NOT NULL,
                architecture_json JSONB NOT NULL,
                roadmap_steps_json JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        console.log("✅ Career Roadmaps table initialized.");

        // Add a trigger for updated_at
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        await pool.query(`
            DROP TRIGGER IF EXISTS update_career_roadmaps_updated_at ON career_roadmaps;
            CREATE TRIGGER update_career_roadmaps_updated_at
            BEFORE UPDATE ON career_roadmaps
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
        `);

        console.log("✅ Update trigger enabled.");
        console.log("🚀 Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
