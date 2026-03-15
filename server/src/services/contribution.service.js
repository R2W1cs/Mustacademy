import pool from "../config/db.js";
import { CONTRIBUTION_RULES, getLevelFromScore } from "../utils/contributionRules.js";

export const addContribution = async ({
  userId,
  actionType,
  courseId = null,
}) => {
  const rule = CONTRIBUTION_RULES[actionType];
  if (!rule) throw new Error("Invalid contribution type");

  const points = rule.points;

  // Insert contribution event
  await pool.query(
    `
    INSERT INTO user_contributions (user_id, action_type, points, course_id)
    VALUES ($1, $2, $3, $4)
    `,
    [userId, actionType, points, courseId]
  );

  // Ensure stats row exists
  await pool.query(
    `
    INSERT INTO user_stats (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO NOTHING
    `,
    [userId]
  );

  // Recalculate score
  const totalRes = await pool.query(
    `
    SELECT COALESCE(SUM(points), 0) AS total
    FROM user_contributions
    WHERE user_id = $1
    `,
    [userId]
  );

  const totalScore = totalRes.rows[0].total;
  const level = getLevelFromScore(totalScore);

  // Update stats
  await pool.query(
    `
    UPDATE user_stats
    SET contribution_score = $1,
        level = $2
    WHERE user_id = $3
    `,
    [totalScore, level, userId]
  );

  return { totalScore, level };
};
