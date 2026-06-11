import pool from '../config/db.js';

// ── Students ──────────────────────────────────────────────────────────────────

export const getStudents = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const term = `%${search}%`;

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.year, u.semester,
              u.streak_current, u.created_at, u.last_active_at,
              COUNT(uc.id) FILTER (WHERE uc.status = 'active')     AS active_courses,
              COUNT(uc.id) FILTER (WHERE uc.grade = 'F')           AS failed_courses,
              COUNT(uc.id) FILTER (WHERE uc.status = 'completed')  AS completed_courses
       FROM users u
       LEFT JOIN user_courses uc ON uc.user_id = u.id
       WHERE u.role = 'student'
         AND (u.name ILIKE $1 OR u.email ILIKE $1)
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $2 OFFSET $3`,
      [term, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'student' AND (name ILIKE $1 OR email ILIKE $1)`,
      [term]
    );

    res.json({ students: rows, total: parseInt(total.rows[0].count), page: +page, limit: +limit });
  } catch (err) {
    console.error('[Admin] getStudents:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await pool.query(
      `SELECT id, name, email, role, year, semester, streak_current,
              created_at, last_active_at, bio, passion, dream_job, plan
       FROM users WHERE id = $1 AND role = 'student'`,
      [id]
    );

    if (!student.rows.length) return res.status(404).json({ error: 'Student not found' });

    const enrollments = await pool.query(
      `SELECT uc.id, uc.course_id, c.name AS course_name,
              uc.status, uc.grade, uc.attempt,
              uc.academic_year, uc.semester, uc.notes,
              uc.started_at, uc.completed_at
       FROM user_courses uc
       JOIN courses c ON c.id = uc.course_id
       WHERE uc.user_id = $1
       ORDER BY uc.academic_year DESC, uc.semester DESC, uc.started_at DESC`,
      [id]
    );

    res.json({ student: student.rows[0], enrollments: enrollments.rows });
  } catch (err) {
    console.error('[Admin] getStudentDetail:', err);
    res.status(500).json({ error: 'Failed to fetch student detail' });
  }
};

// ── Enrollments ───────────────────────────────────────────────────────────────

export const enrollStudent = async (req, res) => {
  try {
    const { student_id, course_id, academic_year, semester } = req.body;
    if (!student_id || !course_id) return res.status(400).json({ error: 'student_id and course_id required' });

    // Check existing attempts for this student + course
    const existing = await pool.query(
      `SELECT MAX(attempt) AS max_attempt FROM user_courses
       WHERE user_id = $1 AND course_id = $2`,
      [student_id, course_id]
    );

    const attempt = (existing.rows[0].max_attempt || 0) + 1;

    const { rows } = await pool.query(
      `INSERT INTO user_courses (user_id, course_id, status, attempt, academic_year, semester, started_at)
       VALUES ($1, $2, 'active', $3, $4, $5, NOW())
       RETURNING *`,
      [student_id, course_id, attempt, academic_year || null, semester || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[Admin] enrollStudent:', err);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
};

export const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, status, notes, academic_year, semester } = req.body;

    const { rows } = await pool.query(
      `UPDATE user_courses
       SET grade        = COALESCE($1, grade),
           status       = COALESCE($2, status),
           notes        = COALESCE($3, notes),
           academic_year = COALESCE($4, academic_year),
           semester     = COALESCE($5, semester),
           completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $6
       RETURNING *`,
      [grade, status, notes, academic_year, semester, id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[Admin] updateEnrollment:', err);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
};

// ── Courses ───────────────────────────────────────────────────────────────────

export const getCourses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.description, c.year_id, c.semester_id,
              COUNT(DISTINCT uc.user_id) AS enrolled_students,
              COUNT(DISTINCT t.id)       AS topic_count
       FROM courses c
       LEFT JOIN user_courses uc ON uc.course_id = c.id
       LEFT JOIN topics t        ON t.course_id  = c.id
       GROUP BY c.id
       ORDER BY c.year_id, c.semester_id, c.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('[Admin] getCourses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { name, description, year_id, semester_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const { rows } = await pool.query(
      `INSERT INTO courses (name, description, year_id, semester_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description || null, year_id || null, semester_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[Admin] createCourse:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, year_id, semester_id } = req.body;

    const { rows } = await pool.query(
      `UPDATE courses
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           year_id     = COALESCE($3, year_id),
           semester_id = COALESCE($4, semester_id)
       WHERE id = $5 RETURNING *`,
      [name, description, year_id, semester_id, id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[Admin] updateCourse:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// ── Users / Role Management ───────────────────────────────────────────────────

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at, last_active_at
       FROM users
       ${role ? 'WHERE role = $1' : 'WHERE role IN (\'admin\', \'professor\')'}
       ORDER BY created_at DESC`,
      role ? [role] : []
    );
    res.json(rows);
  } catch (err) {
    console.error('[Admin] getUsers:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowed = ['student', 'professor', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    // Prevent self-demotion
    if (parseInt(id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET role = $1,
           token_version = COALESCE(token_version, 0) + 1
       WHERE id = $2
       RETURNING id, name, email, role`,
      [role, id]
    );

    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[Admin] updateUserRole:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// ── Overview Stats ────────────────────────────────────────────────────────────

export const getStats = async (req, res) => {
  try {
    const [students, courses, enrollments, failing] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`),
      pool.query(`SELECT COUNT(*) FROM courses`),
      pool.query(`SELECT COUNT(*) FROM user_courses WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM user_courses WHERE grade = 'F'`),
    ]);

    res.json({
      total_students:     parseInt(students.rows[0].count),
      total_courses:      parseInt(courses.rows[0].count),
      active_enrollments: parseInt(enrollments.rows[0].count),
      failed_enrollments: parseInt(failing.rows[0].count),
    });
  } catch (err) {
    console.error('[Admin] getStats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
