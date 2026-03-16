import pool from '../src/config/db.js';

const fixForeignKeys = async () => {
    try {
        console.log("Applying ON DELETE CASCADE to foreign keys...");

        const queries = [
            // user_stats
            "ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey",
            "ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
            
            // user_contributions
            "ALTER TABLE user_contributions DROP CONSTRAINT IF EXISTS user_contributions_user_id_fkey",
            "ALTER TABLE user_contributions ADD CONSTRAINT user_contributions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
            
            // scholarly_assets
            "ALTER TABLE scholarly_assets DROP CONSTRAINT IF EXISTS scholarly_assets_user_id_fkey",
            "ALTER TABLE scholarly_assets ADD CONSTRAINT scholarly_assets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
            
            // user_courses
            "ALTER TABLE user_courses DROP CONSTRAINT IF EXISTS user_courses_user_id_fkey",
            "ALTER TABLE user_courses ADD CONSTRAINT user_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
            
            // user_topic_progress
            "ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_user_id_fkey",
            "ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
            
            // asset_reviews
            "ALTER TABLE asset_reviews DROP CONSTRAINT IF EXISTS asset_reviews_reviewer_id_fkey",
            "ALTER TABLE asset_reviews ADD CONSTRAINT asset_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE",

            // user_badges
            "ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey",
            "ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
        ];

        for (let q of queries) {
            console.log(`Executing: ${q}`);
            await pool.query(q);
        }

        console.log("SUCCESS: All foreign keys updated with ON DELETE CASCADE.");
        process.exit(0);
    } catch (err) {
        console.error("FAILURE: Error updating foreign keys.");
        console.error(err);
        process.exit(1);
    }
};

fixForeignKeys();
