import pool from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
    console.log('--- STARTING CREATOR CORNER V2 MIGRATION ---');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding github_repo column to creator_projects...');
        await client.query(`
            ALTER TABLE creator_projects 
            ADD COLUMN IF NOT EXISTS github_repo TEXT
        `);

        console.log('Adding motivation, skills, and contribution columns to project_requests...');
        await client.query(`
            ALTER TABLE project_requests 
            ADD COLUMN IF NOT EXISTS motivation TEXT,
            ADD COLUMN IF NOT EXISTS skills TEXT,
            ADD COLUMN IF NOT EXISTS contribution TEXT
        `);

        await client.query('COMMIT');
        console.log('--- MIGRATION V2 SUCCESSFUL ---');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
