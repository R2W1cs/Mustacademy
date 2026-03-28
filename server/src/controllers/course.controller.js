
import { createRequire } from "module";
import pool from "../config/db.js";
import mammoth from "mammoth";
import AdmZip from "adm-zip";

const require = createRequire(import.meta.url);
const _pdfModule = require("pdf-parse");
const pdfParse = typeof _pdfModule === 'function' ? _pdfModule : (_pdfModule.default ?? _pdfModule);

// Auto-create topic_resources table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS topic_resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size INTEGER,
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.warn('[topic_resources] Table init warning:', err.message));

// Get all courses (with optional search + pagination)
export const getAllCourses = async (req, res) => {
  const { search = '', page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let baseQuery = `
    SELECT c.id, c.name, c.description,
           s.year_number, s.semester_number
    FROM courses c
    JOIN semesters s ON c.semester_id = s.id
  `;
  const params = [];

  if (search.trim()) {
    params.push(`%${search.trim()}%`);
    baseQuery += ` WHERE (c.name ILIKE $${params.length} OR c.description ILIKE $${params.length})`;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM (${baseQuery}) AS t`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(parseInt(limit));
  params.push(offset);
  baseQuery += ` ORDER BY s.year_number, s.semester_number LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await pool.query(baseQuery, params);

  res.json({
    courses: result.rows,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
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
// --- NOTEBOOK MODE ENDPOINTS ---

/**
 * @desc Get user note for a specific topic
 * @route GET /api/courses/topics/:id/note
 */
export const getTopicNote = async (req, res) => {
  const userId = req.user.id;
  const { id: topicId } = req.params;

  try {
    const result = await pool.query(
      "SELECT content FROM user_topic_notes WHERE user_id = $1 AND topic_id = $2",
      [userId, topicId]
    );

    if (result.rows.length === 0) {
      return res.json({ content: "" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getTopicNote] Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch topic note' });
  }
};

/**
 * @desc Upsert user note for a specific topic
 * @route POST /api/courses/topics/:id/note
 */
export const updateTopicNote = async (req, res) => {
  const userId = req.user.id;
  const { id: topicId } = req.params;
  const { content } = req.body;

  try {
    await pool.query(
      `INSERT INTO user_topic_notes (user_id, topic_id, content, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, topic_id) 
       DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
      [userId, topicId, content]
    );

    res.json({ message: "Note saved successfully" });
  } catch (err) {
    console.error('[updateTopicNote] Error:', err.message);
    res.status(500).json({ message: 'Failed to save topic note' });
  }
};

// ── TOPIC RESOURCES (Vault) ────────────────────────────────────────────────

const extractTextFromBuffer = async (buffer, mimetype, originalname) => {
  const ext = originalname.split('.').pop().toLowerCase();
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text.replace(/\s+/g, ' ').trim().slice(0, 40000);
  }
  if (ext === 'docx' || mimetype.includes('wordprocessingml')) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.replace(/\s+/g, ' ').trim().slice(0, 40000);
  }
  if (ext === 'pptx' || mimetype.includes('presentationml')) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries().filter(e => e.entryName.match(/ppt\/slides\/slide\d+\.xml$/));
    const text = entries.map(e => {
      const xml = e.getData().toString('utf8');
      return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }).join(' ');
    return text.slice(0, 40000);
  }
  // Plain text / markdown / any other file
  return buffer.toString('utf8').slice(0, 40000);
};

export const uploadTopicResource = async (req, res) => {
  const userId = req.user.id;
  const topicId = req.params.id;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const { originalname, buffer, mimetype, size } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    const extractedText = await extractTextFromBuffer(buffer, mimetype, originalname);

    const result = await pool.query(
      `INSERT INTO topic_resources (user_id, topic_id, title, file_type, file_size, extracted_text)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, file_type, file_size, created_at`,
      [userId, topicId, originalname, ext, size, extractedText]
    );
    res.json({ success: true, resource: result.rows[0] });
  } catch (err) {
    console.error('[uploadTopicResource]', err.message);
    res.status(500).json({ message: 'Failed to process file: ' + err.message });
  }
};

export const getTopicResources = async (req, res) => {
  const userId = req.user.id;
  const topicId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT id, title, file_type, file_size, created_at
       FROM topic_resources WHERE user_id = $1 AND topic_id = $2 ORDER BY created_at DESC`,
      [userId, topicId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

export const deleteTopicResource = async (req, res) => {
  const userId = req.user.id;
  const { id: topicId, resourceId } = req.params;
  try {
    await pool.query(
      `DELETE FROM topic_resources WHERE id = $1 AND user_id = $2 AND topic_id = $3`,
      [resourceId, userId, topicId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};

