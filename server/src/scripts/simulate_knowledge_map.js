import pool from "../config/db.js";

const simulate = async () => {
    const userId = 3;
    const query = `
        SELECT 
            c.id as course_id, 
            c.name as course_name,
            t.id as topic_id,
            t.title as topic_name,
            COALESCE(utp.quiz_score, 0) as score,
            COALESCE(utp.completed, false) as completed
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        JOIN topics t ON c.id = t.course_id
        LEFT JOIN user_topic_progress utp ON (t.id = utp.topic_id AND utp.user_id = $1)
        WHERE uc.user_id = $1
    `;
    const res = await pool.query(query, [userId]);
    console.log("KNOWLEDGE MAP NODES:");
    console.log(res.rows.filter(r => r.course_id === 412 || r.topic_id === 412));
    process.exit(0);
};

simulate();
