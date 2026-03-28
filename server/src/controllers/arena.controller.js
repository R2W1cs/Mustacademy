import pool from '../config/db.js';

export const getLeaderboard = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, elo_rating,
                   RANK() OVER (ORDER BY elo_rating DESC) AS rank
            FROM users
            WHERE elo_rating IS NOT NULL
            ORDER BY elo_rating DESC
            LIMIT 20
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching arena leaderboard:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
