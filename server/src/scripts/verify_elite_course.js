import pool from "../config/db.js";

const verify = async () => {
    try {
        const res = await pool.query("SELECT id, name FROM courses WHERE name = 'Elite Compiler Engineering & Language Design'");
        const course = res.rows[0];
        if (!course) throw new Error("Course not found");

        const tRes = await pool.query("SELECT id, title, importance_level FROM topics WHERE course_id = $1 ORDER BY id", [course.id]);
        console.log(`Course Found: ${course.name} (ID: ${course.id})`);
        console.log(`Topics Count: ${tRes.rows.length}`);
        tRes.rows.forEach(t => {
            console.log(`- [${t.importance_level}] ${t.title}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
