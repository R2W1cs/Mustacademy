import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';

/**
 * EXPORT DATA SCRIPT
 * Groups all semesters, courses, and topics into a single JSON file for production seeding.
 */

const exportData = async () => {
    console.log("🚀 Extracting Synaptic Data for Production Migration...");
    try {
        const semesters = await pool.query('SELECT * FROM semesters');
        const courses = await pool.query('SELECT * FROM courses');
        const topics = await pool.query('SELECT * FROM topics');

        const dump = {
            semesters: semesters.rows,
            courses: courses.rows,
            topics: topics.rows
        };

        const targetPath = path.resolve('scripts/seed-data.json');
        fs.writeFileSync(targetPath, JSON.stringify(dump, null, 2));

        console.log(`✅ Success! Data encapsulated in ${targetPath}`);
        console.log(`📊 Stats: ${semesters.rows.length} Semesters | ${courses.rows.length} Courses | ${topics.rows.length} Topics`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Extraction Failed:", err);
        process.exit(1);
    }
};

exportData();
