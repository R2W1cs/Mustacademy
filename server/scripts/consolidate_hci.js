
import pool from '../src/config/db.js';

const run = async () => {
    try {
        console.log("🛠️  Consolidating HCI Courses...");

        // 1. Find the duplicates
        const courses = await pool.query(
            "SELECT id, name FROM courses WHERE name ILIKE '%Human%Computer%Interaction%' OR name ILIKE '%CS 370%'"
        );
        console.log("Found:", courses.rows);

        if (courses.rows.length < 2) {
            console.log("⚠️ Less than 2 courses found. Nothing to merge.");
            process.exit(0);
        }

        // Identify Source (The one I injected - likely ID > original) and Target
        // Logic: Target should be the one with "CS 370" in name usually, or the lower ID.
        // Let's assume the one with "CS 370" is the main one.

        let targetCourse = courses.rows.find(c => c.name.includes("CS 370"));
        let sourceCourse = courses.rows.find(c => !c.name.includes("CS 370") && c.name.includes("Human-Computer Interaction"));

        if (!targetCourse || !sourceCourse) {
            // Fallback: Sort by ID. Keep the older one (Target), merge newer (Source).
            const sorted = courses.rows.sort((a, b) => a.id - b.id);
            targetCourse = sorted[0];
            sourceCourse = sorted[1];
        }

        console.log(`🎯 Target (Official): ${targetCourse.name} (ID: ${targetCourse.id})`);
        console.log(`📦 Source (Duplicate): ${sourceCourse.name} (ID: ${sourceCourse.id})`);

        // 2. Move Topics from Source to Target
        const moveRes = await pool.query(
            "UPDATE topics SET course_id = $1 WHERE course_id = $2",
            [targetCourse.id, sourceCourse.id]
        );
        console.log(`🚚 Moved ${moveRes.rowCount} topics.`);

        // 3. Move Peer Videos
        await pool.query("UPDATE peer_videos SET course_id = $1 WHERE course_id = $2", [targetCourse.id, sourceCourse.id]);

        // 4. Delete Source Course
        await pool.query("DELETE FROM courses WHERE id = $1", [sourceCourse.id]);
        console.log("🗑️  Deleted duplicate course.");

        // 5. Update Target Metadata (optional)
        // Ensure the official course has the nice description
        await pool.query(
            "UPDATE courses SET description = 'Design of effective human-computer interfaces using a human-centered approach. (Includes Codex Content)' WHERE id = $1",
            [targetCourse.id]
        );

        console.log("✅ Consolidation Complete.");
        process.exit(0);

    } catch (err) {
        console.error("❌ CRITICAL FAILURE:", err);
        process.exit(1);
    }
};

run();
