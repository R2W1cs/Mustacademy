import pool from '../config/db.js';

async function migrate() {
    console.log('--- STARTING CREATOR CORNER MIGRATION ---');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create Projects Table
        console.log('Creating creator_projects table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS creator_projects (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                status TEXT DEFAULT 'open', -- 'open', 'in-progress', 'completed'
                skills_required TEXT[],
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Project Join Requests Table
        console.log('Creating project_requests table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS project_requests (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES creator_projects(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
                message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(project_id, user_id)
            )
        `);

        await client.query('COMMIT');
        console.log('--- MIGRATION SUCCESSFUL ---');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
    }
}

migrate();
