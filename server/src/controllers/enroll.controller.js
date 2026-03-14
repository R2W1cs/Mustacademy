import pool from "../config/db.js";

/**
 * Enroll user in a course
 */
export const enrollInCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  // prevent duplicate enroll
  const exists = await pool.query(
    "SELECT id FROM user_courses WHERE user_id=$1 AND course_id=$2",
    [userId, courseId]
  );

  if (exists.rows.length > 0) {
    return res.status(409).json({ message: "Already enrolled" });
  }

  await pool.query(
    `INSERT INTO user_courses (user_id, course_id)
     VALUES ($1, $2)`,
    [userId, courseId]
  );

  res.status(201).json({ message: "Enrolled successfully" });
};

/**
 * Get logged-in user's courses
 */
export const getMyCourses = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT c.id, c.name, c.description,
             s.year_number, s.semester_number,
             uc.status
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      JOIN semesters s ON c.semester_id = s.id
      WHERE uc.user_id = $1
      ORDER BY s.year_number, s.semester_number
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in getMyCourses:", err);
    res.status(500).json({ message: "Failed to retrieve courses" });
  }
};

/**
 * Update course progress status
 */
export const updateCourseStatus = async (req, res) => {
  const userId = req.user.id;
  const { courseId, status } = req.body;

  const allowed = ["planned", "in_progress", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  await pool.query(
    `
    UPDATE user_courses
    SET status = $1
    WHERE user_id = $2 AND course_id = $3
    `,
    [status, userId, courseId]
  );

  res.json({ message: "Status updated" });
};
