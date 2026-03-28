import pool from "../config/db.js";
import { addContribution } from "../services/contribution.service.js";
import { getCareerAlignment } from "../services/vocation.service.js";

/* ---------------- GET MY PROFILE ---------------- */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, name, email, avatar_url, bio, passion, year, semester, status, dream_job, target_company, technical_pillar, plan
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const profile = result.rows[0];

    if (!profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Fetch completed courses for alignment calculation
    const coursesRes = await pool.query(
      "SELECT c.name FROM user_courses uc JOIN courses c ON uc.course_id = c.id WHERE uc.user_id = $1 AND uc.status = 'completed'",
      [userId]
    );
    const completedCourses = coursesRes.rows;

    const careerOracle = getCareerAlignment(profile.dream_job, completedCourses);

    res.json({
      ...profile,
      careerOracle
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

/* ---------------- UPDATE PROFILE ---------------- */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      avatar_url = null,
      bio = "",
      passion = "",
      year = null,
      semester = null,
      status = "online",
      dream_job = null,
      target_company = null,
      technical_pillar = null,
    } = req.body;

    // Update profile
    await pool.query(
      `
      UPDATE users
      SET avatar_url=$1,
          bio=$2,
          passion=$3,
          year=$4,
          semester=$5,
          status=$6,
          dream_job=$7,
          target_company=$8,
          technical_pillar=$9
      WHERE id=$10
      `,
      [avatar_url, bio, passion, year, semester, status, dream_job, target_company, technical_pillar, userId]
    );

    /**
     * Add contribution ONLY ON FIRST PROFILE COMPLETION
     * (prevents farming points by editing profile repeatedly)
     */
    const existing = await pool.query(
      `
      SELECT 1
      FROM user_contributions
      WHERE user_id = $1
        AND action_type = 'PROFILE_COMPLETED'
      LIMIT 1
      `,
      [userId]
    );

    if (existing.rows.length === 0) {
      await addContribution({
        userId,
        actionType: "PROFILE_COMPLETED",
      });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* ---------------- UPGRADE PLAN (demo) ---------------- */
export const upgradePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(`UPDATE users SET plan = 'premium' WHERE id = $1`, [userId]);
    res.json({ message: "Plan upgraded to premium", plan: "premium" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upgrade plan" });
  }
};
