
import pool from "../config/db.js";
// Get all courses
export const getAllCourses = async (req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.name, c.description,
           s.year_number, s.semester_number
    FROM courses c
    JOIN semesters s ON c.semester_id = s.id
    ORDER BY s.year_number, s.semester_number
  `);

  res.json(result.rows);
};

// Get ALL topics across all courses (for Podcast Studio)
export const getAllTopics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.title, t.course_id, c.name as course_name
      FROM topics t
      JOIN courses c ON t.course_id = c.id
      ORDER BY t.title ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[getAllTopics] Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch topics pool' });
  }
};

// Get courses by semester
export const getCoursesBySemester = async (req, res) => {
  const { year, semester } = req.params;

  const result = await pool.query(
    `
    SELECT c.id, c.name, c.description
    FROM courses c
    JOIN semesters s ON c.semester_id = s.id
    WHERE s.year_number = $1 AND s.semester_number = $2
    `,
    [year, semester]
  );

  res.json(result.rows);
};

// Get single course
export const getCourseById = async (req, res) => {
  const { id } = req.params;
  console.log(`[getCourseById] Received params:`, req.params);
  console.log(`[getCourseById] Received id="${id}" type=${typeof id}`);

  if (!id || id === 'undefined' || isNaN(Number(id))) {
    console.log(`[getCourseById] ❌ Invalid ID: ${id}`);
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  console.log(`[getCourseById] 🚀 Querying database for id=${id}`);
  const result = await pool.query(
    'SELECT * FROM courses WHERE id = $1',
    [id]
  );

  console.log(`[getCourseById] ✅ id=${id} returned ${result.rows.length} rows`);

  if (result.rows.length === 0) {
    console.log(`[getCourseById] ❗ Course NOT FOUND: id=${id}`);
    return res.status(404).json({ message: 'Course not found' });
  }

  res.json(result.rows[0]);
};


export const getCourseTopics = async (req, res) => {
  const { id } = req.params;

  if (!id || id === 'undefined' || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  const result = await pool.query(
    "SELECT id, title, importance_level FROM topics WHERE course_id = $1",
    [id]
  );

  res.json(result.rows);
};


export const toggleTopicCompletion = async (req, res) => {
  const userId = req.user.id;
  const { topicId } = req.body;

  const exists = await pool.query(
    `
    SELECT completed FROM user_topic_progress
    WHERE user_id = $1 AND topic_id = $2
    `,
    [userId, topicId]
  );

  if (exists.rows.length === 0) {
    await pool.query(
      `
      INSERT INTO user_topic_progress (user_id, topic_id, completed, quiz_score)
      VALUES ($1, $2, true, 80)
      `,
      [userId, topicId]
    );
  } else {
    await pool.query(
      `
      UPDATE user_topic_progress
      SET completed = NOT completed,
          quiz_score = CASE WHEN NOT completed THEN 100 ELSE quiz_score END
      WHERE user_id = $1 AND topic_id = $2
      `,
      [userId, topicId]
    );
  }

  res.json({ message: "Topic progress updated" });
};

export const getTopicProgress = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!courseId || courseId === "undefined" || isNaN(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  const result = await pool.query(
    `
    SELECT t.id, t.title, t.importance_level,
           COALESCE(ut.completed, false) AS completed
    FROM topics t
    LEFT JOIN user_topic_progress ut
      ON t.id = ut.topic_id AND ut.user_id = $1
    WHERE t.course_id = $2
    ORDER BY t.id ASC
    `,
    [userId, courseId]
  );

  res.json(result.rows);
};

export const getTopicById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id || id === 'undefined' || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Invalid topic ID' });
  }

  try {
    const result = await pool.query(
      `
      SELECT t.id, t.title, t.importance_level, t.course_id,
             t.first_principles, t.architectural_logic, t.forge_snippet, t.forge_protocol, t.ethical_dilemma,
             t.breadcrumb_path, t.difficulty, t.estimated_time, t.prerequisites, t.learning_objectives,
             t.historical_context, t.structural_breakdown, t.deep_dive, t.applied_practice, 
             t.failure_analysis, t.production_standard, t.scholarly_references, t.updated_at,
             t.content_markdown, t.content_easy_markdown, t.content_deep_markdown, t.staff_engineer_note,
             t.song_url,
             COALESCE(ut.completed, false) AS completed
      FROM topics t
      LEFT JOIN user_topic_progress ut
        ON t.id = ut.topic_id AND ut.user_id = $1
      WHERE t.id = $2
      `,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getTopicById] DB error:', err.message);
    res.status(500).json({ message: 'Failed to load topic' });
  }
};

export const getRecommendedCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's academic profile
    const userRes = await pool.query(
      `
      SELECT year, semester
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { year, semester } = userRes.rows[0];
    console.log(`[Recommended Courses] User ID: ${userId} | Year: ${year}, Semester: ${semester}`);

    // Get matching courses
    const coursesRes = await pool.query(
      `
      SELECT c.*, s.year_number, s.semester_number
      FROM courses c
      JOIN semesters s ON c.semester_id = s.id
      WHERE s.year_number = $1
        AND s.semester_number = $2
      ORDER BY c.name
      `,
      [year, semester]
    );

    const returnedIds = coursesRes.rows.map(r => r.id);
    console.log(`[Recommended Courses] Found ${coursesRes.rows.length} courses for Y${year}S${semester}. IDs: ${returnedIds.join(', ')}`);

    // Cross-check: verify those IDs exist in courses table directly
    if (returnedIds.length > 0) {
      const verifyRes = await pool.query(
        `SELECT id, name FROM courses WHERE id = ANY($1)`,
        [returnedIds]
      );
      console.log(`[Recommended Courses] Cross-check: ${verifyRes.rows.length}/${returnedIds.length} IDs exist directly in courses table`);
      if (verifyRes.rows.length !== returnedIds.length) {
        const foundIds = verifyRes.rows.map(r => r.id);
        const missingIds = returnedIds.filter(id => !foundIds.includes(id));
        console.error(`[Recommended Courses] ⚠️ MISSING IDs in courses table: ${missingIds.join(', ')}`);
      }
    }

    res.json({
      year,
      semester,
      courses: coursesRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load recommended courses" });
  }
};