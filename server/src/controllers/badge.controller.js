import pool from "../config/db.js";
import { BADGES } from "../utils/badgeRules.js";

export const getMyBadges = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `
      SELECT badge_key, earned_at
      FROM user_badges
      WHERE user_id = $1
      ORDER BY earned_at DESC
      `,
            [userId]
        );

        // Map database results to full badge objects including metadata
        const badges = result.rows.map((row) => {
            const badgeInfo = BADGES[row.badge_key];
            return {
                ...badgeInfo,
                earned_at: row.earned_at,
            };
        });

        res.json(badges);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch badges" });
    }
};
