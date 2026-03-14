import pool from "../config/db.js";

export const getAggregatedProtocols = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.id, 
                t.title, 
                t.forge_protocol, 
                t.importance_level,
                c.name as course_name,
                s.year_number,
                s.semester_number
            FROM topics t
            JOIN courses c ON t.course_id = c.id
            JOIN semesters s ON c.semester_id = s.id
            WHERE t.forge_protocol IS NOT NULL
            ORDER BY s.year_number, s.semester_number, t.id
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Failed to fetch protocols:", err);
        res.status(500).json({ message: "Internal server error fetching protocols archives." });
    }
};
