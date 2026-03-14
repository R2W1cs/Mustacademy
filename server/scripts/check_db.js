
import pool from '../src/config/db.js';
import fs from 'fs';

const run = async () => {
    try {
        const output = {};
        const courses = await pool.query("SELECT id, name, description, semester_id FROM courses WHERE name ILIKE '%Human%Computer%Interaction%' OR name ILIKE '%CS 370%'");
        output.courses = courses.rows;

        output.topics = {};
        for (const course of courses.rows) {
            const topics = await pool.query("SELECT * FROM topics WHERE course_id = $1", [course.id]);
            output.topics[course.id] = topics.rows;
        }

        fs.writeFileSync('db_output.json', JSON.stringify(output, null, 2));
        console.log("Written to db_output.json");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
