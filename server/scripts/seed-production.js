import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';

/**
 * PRODUCTION SEEDING SCRIPT
 * This script populates the 'semesters', 'courses', and 'topics' tables.
 * It is designed to be run locally while pointing to the Render DATABASE_URL.
 */

const SEED_DATA_PATH = path.resolve('scripts/seed-data.json');

const seed = async () => {
    console.log("🚀 Starting Production Seeding Protocol...");
    
    if (!process.env.DATABASE_URL) {
        console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
        console.log("Usage: DATABASE_URL=your_render_url node scripts/seed-production.js");
        process.exit(1);
    }

    try {
        // 1. Verify connection
        const { rows } = await pool.query('SELECT NOW()');
        console.log("✅ Connected to Database at:", rows[0].now);

        // 2. Load Seed Data
        // Note: We expect a JSON file with structure: { semesters: [], courses: [], topics: [] }
        if (!fs.existsSync(SEED_DATA_PATH)) {
            console.error(`❌ ERROR: Seed data file not found at ${SEED_DATA_PATH}`);
            process.exit(1);
        }
        
        const data = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
        console.log(`📦 Loaded ${data.semesters?.length || 0} semesters, ${data.courses?.length || 0} courses, and ${data.topics?.length || 0} topics.`);

        // 3. Seed Semesters
        console.log("⏳ Seeding Semesters...");
        for (const sem of data.semesters) {
            await pool.query(
                `INSERT INTO semesters (id, year_number, semester_number) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (id) DO UPDATE SET year_number = EXCLUDED.year_number, semester_number = EXCLUDED.semester_number`,
                [sem.id, sem.year_number, sem.semester_number]
            );
        }

        // 4. Seed Courses
        console.log("⏳ Seeding Courses...");
        for (const course of data.courses) {
            await pool.query(
                `INSERT INTO courses (id, name, description, semester_id) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, semester_id = EXCLUDED.semester_id`,
                [course.id, course.name, course.description, course.semester_id]
            );
        }

        // 5. Seed Topics
        console.log("⏳ Seeding Topics...");
        for (const topic of data.topics) {
            await pool.query(
                `INSERT INTO topics (
                    id, title, importance_level, course_id, 
                    first_principles, architectural_logic, forge_snippet, forge_protocol, ethical_dilemma,
                    breadcrumb_path, difficulty, estimated_time, prerequisites, learning_objectives,
                    historical_context, structural_breakdown, deep_dive, applied_practice, 
                    failure_analysis, production_standard, scholarly_references,
                    content_markdown, content_easy_markdown, content_deep_markdown, staff_engineer_note,
                    song_url, song_lyrics
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
                ) ON CONFLICT (id) DO UPDATE SET 
                    title = EXCLUDED.title, 
                    content_markdown = EXCLUDED.content_markdown,
                    content_easy_markdown = EXCLUDED.content_easy_markdown,
                    content_deep_markdown = EXCLUDED.content_deep_markdown,
                    song_url = EXCLUDED.song_url`,
                [
                    topic.id, topic.title, topic.importance_level, topic.course_id,
                    topic.first_principles, topic.architectural_logic, topic.forge_snippet, topic.forge_protocol, topic.ethical_dilemma,
                    topic.breadcrumb_path, topic.difficulty, topic.estimated_time, topic.prerequisites, topic.learning_objectives,
                    topic.historical_context, topic.structural_breakdown, topic.deep_dive, topic.applied_practice,
                    topic.failure_analysis, topic.production_standard, topic.scholarly_references,
                    topic.content_markdown, topic.content_easy_markdown, topic.content_deep_markdown, topic.staff_engineer_note,
                    topic.song_url, topic.song_lyrics
                ]
            );
        }

        console.log("✨ Seeding Complete! System Synchronized.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Failed:", err);
        process.exit(1);
    }
};

seed();
