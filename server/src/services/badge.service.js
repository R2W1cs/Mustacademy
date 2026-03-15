import pool from "../config/db.js";
import { BADGES } from "../utils/badgeRules.js";

export const checkAndAwardBadges = async (userId, totalScore) => {
  const badgesToCheck = [];

  // Profile completed badge
  if (totalScore >= 10) {
    badgesToCheck.push(BADGES.PROFILE_COMPLETED);
  }

  // First contribution
  if (totalScore > 0) {
    badgesToCheck.push(BADGES.FIRST_CONTRIBUTION);
  }

  // ACS-based badges
  if (totalScore >= 30) {
    badgesToCheck.push(BADGES.ACTIVE_STUDENT);
  }
  if (totalScore >= 80) {
    badgesToCheck.push(BADGES.CONTRIBUTOR);
  }
  if (totalScore >= 150) {
    badgesToCheck.push(BADGES.TRUSTED_PEER);
  }

  for (const badge of badgesToCheck) {
    await pool.query(
      `
      INSERT INTO user_badges (user_id, badge_key)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [userId, badge.key]
    );
  }
};
