import pool from "../config/db.js";
import { validateStreak } from "../services/streak.service.js";

import { getCareerAlignment } from "../services/vocation.service.js";

export const getDashboardStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Update heartbeat for Online Status
    await pool.query("UPDATE users SET last_active_at = NOW() WHERE id = $1", [userId]);

    // 2. Fetch parallel data
    const [streak, userRes, activityRes, onlineRes, contribStatsRes, cohortPercentileRes, completedNamesRes, activity7WeeksRes, skillsRes, lastInterviewRes, projectStatsRes, recentActivityRes] = await Promise.all([
      validateStreak(userId).catch(e => { console.error("Streak validation failed:", e.message); return 0; }),
      pool.query("SELECT streak_last_active_date, name, year, semester, dream_job FROM users WHERE id = $1", [userId]).catch(e => { console.error("UserRes failed:", e.message); return { rows: [{ streak_last_active_date: null, name: null, year: null, semester: null, dream_job: null }] }; }),
      pool.query(`WITH last_7_days AS (
              SELECT generate_series(current_date - INTERVAL '6 days', current_date, '1 day'::interval)::date AS day
          )
          SELECT to_char(d.day, 'Dy') as day_label, COALESCE(SUM(uc.points), 0) as activity_count
          FROM last_7_days d
          LEFT JOIN user_contributions uc ON d.day = date_trunc('day', uc.created_at) AND uc.user_id = $1
          GROUP BY d.day ORDER BY d.day`, [userId]).catch(e => { console.error("ActivityRes failed:", e.message); return { rows: [] }; }),
      pool.query(`
          SELECT id, name, avatar_url, year 
          FROM users 
          WHERE last_active_at > NOW() - INTERVAL '15 minutes' 
          AND id != $1
          LIMIT 10
      `, [userId]).catch(e => { console.error("OnlineRes failed:", e.message); return { rows: [] }; }),
      pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM scholarly_assets WHERE user_id = $1 AND asset_type = 'summary') as summaries,
            (SELECT COUNT(*) FROM scholarly_assets WHERE user_id = $1 AND asset_type = 'cheatsheet') as cheatsheets,
            (SELECT COUNT(*) FROM asset_reviews WHERE user_id = $1) as reviews
      `, [userId]).catch(e => { console.error("ContribStatsRes failed:", e.message); return { rows: [{ summaries: 0, cheatsheets: 0, reviews: 0 }] }; }),
      pool.query(`
        WITH user_stats AS(
        SELECT
                u.id,
        COALESCE(COUNT(utp.topic_id) FILTER(WHERE utp.completed = true), 0) as completed,
        COALESCE(COUNT(utp.topic_id), 0) as total
            FROM users u
            LEFT JOIN user_topic_progress utp ON u.id = utp.user_id
            WHERE u.year = (SELECT year FROM users WHERE id = $1)
            GROUP BY u.id
      ),
      user_percentages AS(
        SELECT
                id,
        CASE WHEN total = 0 THEN 0 ELSE(completed:: float / total) * 100 END as pct
            FROM user_stats
      ),
      my_pct AS(
        SELECT pct FROM user_percentages WHERE id = $1
      ),
      summary AS(
        SELECT
                COUNT(*) as total_count,
        COUNT(*) FILTER(WHERE pct < (SELECT pct FROM my_pct)) as lower_count
            FROM user_percentages
        )
    SELECT
    CASE
                WHEN total_count <= 1 THEN 0
    ELSE(lower_count:: float / (total_count - 1)) * 100
    END as percentile
        FROM summary
      `, [userId]).catch(e => { console.error("CohortPercentileRes failed:", e.message); return { rows: [{ percentile: 0 }] }; }),
      pool.query("SELECT c.name FROM user_courses uc JOIN courses c ON uc.course_id = c.id WHERE uc.user_id = $1 AND uc.status = 'completed'", [userId]).catch(() => ({ rows: [] })),
      pool.query(`WITH last_49_days AS(
      SELECT generate_series(current_date - INTERVAL '48 days', current_date, '1 day':: interval):: date AS day
    )
          SELECT d.day as exact_date, to_char(d.day, 'Dy') as day_label, to_char(d.day, 'IYYY-IW') as week_num, COALESCE(SUM(uc.points), 0) as activity_count
          FROM last_49_days d
          LEFT JOIN user_contributions uc ON d.day = date_trunc('day', uc.created_at) AND uc.user_id = $1
          GROUP BY d.day ORDER BY d.day`, [userId]).catch(e => { console.error("Activity7WeeksRes failed:", e.message); return { rows: [] }; }),
      pool.query(`
        SELECT t.title as topic, c.name as course,
      COALESCE(utp.completed, false) as completed,
      COALESCE(utp.quiz_score, 0) as score
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        JOIN topics t ON c.id = t.course_id
        LEFT JOIN user_topic_progress utp ON t.id = utp.topic_id AND utp.user_id = $1
        WHERE uc.user_id = $1
      `, [userId]).catch(e => { console.error("SkillsRes failed:", e.message); return { rows: [] }; }),
      pool.query(`
        SELECT target_job, metadata, current_phase, updated_at 
        FROM interview_sessions 
        WHERE user_id = $1 
        ORDER BY updated_at DESC LIMIT 1
      `, [userId]).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM project_requests WHERE user_id = $1 AND status = 'accepted') as joined_projects,
          (SELECT COUNT(*) FROM creator_projects WHERE owner_id = $1) as owned_projects
      `, [userId]).catch(() => ({ rows: [{ joined_projects: 0, owned_projects: 0 }] })),
      pool.query(`
        SELECT p.title, 'new_member' as type, r.created_at 
        FROM project_requests r 
        JOIN creator_projects p ON r.project_id = p.id 
        WHERE (p.owner_id = $1 OR r.user_id = $1) AND r.status = 'accepted'
        ORDER BY r.created_at DESC LIMIT 3
      `, [userId]).catch(() => ({ rows: [] }))
    ]);

    const lastInterview = lastInterviewRes.rows[0] || null;
    const projectStats = projectStatsRes.rows[0] || { joined_projects: 0, owned_projects: 0 };
    const recentActivity = recentActivityRes.rows || [];

    // 2.1 Fetch basic counts separately or reusing original but ensuring counts are accurate
    const courseStatsRes = await pool.query(`SELECT
    COUNT(*) FILTER(WHERE status = 'planned') AS planned,
      COUNT(*) FILTER(WHERE status = 'in_progress') AS in_progress,
        COUNT(*) FILTER(WHERE status = 'completed') AS completed,
          COUNT(*) AS total
           FROM user_courses
           WHERE user_id = $1`, [userId]);

    const topicStatsRes = await pool.query(`
      WITH enrolled_topics AS(
            SELECT t.id
        FROM user_courses uc
        JOIN topics t ON uc.course_id = t.course_id
        WHERE uc.user_id = $1
          )
    SELECT
      (SELECT COUNT(*) FROM user_topic_progress WHERE user_id = $1 AND completed = true) AS completed_topics,
        (SELECT COUNT(*) FROM enrolled_topics) AS total_topics
    `, [userId]);

    // Process results
    const courses = courseStatsRes.rows[0];
    const topics = topicStatsRes.rows[0];
    const { streak_last_active_date, name, year, semester, dream_job } = userRes.rows[0] || {};
    const contribStats = contribStatsRes.rows[0] || { summaries: 0, cheatsheets: 0, reviews: 0 };
    const cohortPercentile = Math.round(cohortPercentileRes.rows[0]?.percentile || 0);



    // Process Activity Data
    const weeklyData = activityRes.rows;
    const weekDays = weeklyData.map(d => d.day_label);
    const weeklyActivity = weeklyData.map(d => parseInt(d.activity_count));
    const progressPercent =
      topics.total_topics > 0
        ? Math.round((topics.completed_topics / topics.total_topics) * 100)
        : 0;

    // Process 7-week Activity Data
    const weeksMap = {};
    let currentWeekIdx = 1;
    let lastWeekNum = null;

    activity7WeeksRes.rows.forEach((row) => {
      if (row.week_num !== lastWeekNum) {
        if (lastWeekNum !== null) currentWeekIdx++;
        lastWeekNum = row.week_num;
      }
      const weekLabel = `Week ${currentWeekIdx} `;
      if (!weeksMap[weekLabel]) {
        weeksMap[weekLabel] = { week: weekLabel, hours: 0, days: [] };
      }
      // Scale activity_count to 'hours' visually (e.g. 10 points = 1 hour)
      const dailyHours = parseFloat((parseInt(row.activity_count) / 10).toFixed(1));
      weeksMap[weekLabel].hours += dailyHours;
      weeksMap[weekLabel].days.push({
        day: row.day_label,
        hours: dailyHours,
        date: row.exact_date
      });
    });

    // Convert to array and round total hours
    const weeklyProgress = Object.values(weeksMap).map(w => ({
      ...w,
      hours: Math.round(w.hours)
    }));

    // Process Skills Data
    const academicCategories = ['CS', 'MATH', 'COM', 'PHY', 'ENG'];
    const generalCategories = ['Algorithms', 'Data Structures', 'System Design', 'Databases', 'Networking', 'Security', 'Web', 'Mobile', 'AI', 'Cloud'];

    let generalSkillsMap = generalCategories.map(skill => ({ skill, value: 0, total: 0 }));
    const courseTracking = {};

    skillsRes.rows.forEach(row => {
      const courseNameUpper = row.course.toUpperCase();
      const isAcademic = academicCategories.some(ac => courseNameUpper.startsWith(ac));

      if (isAcademic) {
        if (!courseTracking[row.course]) {
          courseTracking[row.course] = { skill: row.course, points: 0, maxPoints: 0 };
        }
        // Topic Proficiency Calculation:
        // (Completion = 50% max) + (Quiz Score = 50% max)
        const topicProficency = (row.completed ? 50 : 0) + (row.score * 0.5);
        courseTracking[row.course].points += topicProficency;
        courseTracking[row.course].maxPoints += 100;
      }

      // Generic keyword matching for general skills
      const textToSearch = `${row.topic} ${row.course} `.toLowerCase();
      generalSkillsMap.forEach(gs => {
        if (textToSearch.includes(gs.skill.toLowerCase())) {
          gs.total += 1;
          const topicProficency = (row.completed ? 50 : 0) + (row.score * 0.5);
          gs.value += topicProficency;
        }
      });
    });

    const fallbackAcademic = [
      { skill: 'Intro to AI', value: 0 },
      { skill: 'Data Structures', value: 0 },
      { skill: 'Data Warehousing', value: 0 },
      { skill: 'Software Eng.', value: 0 },
      { skill: 'Operating Systems', value: 0 },
      { skill: 'Networks', value: 0 }
    ];

    let academicSkills = Object.values(courseTracking).map(c => ({
      skill: c.skill.includes(':') ? c.skill.split(':')[1].trim() : c.skill, // Keep readable title
      value: c.maxPoints > 0 ? Math.round((c.points / c.maxPoints) * 100) : 0
    }));

    // Pad to exactly 6 courses as requested by user
    if (academicSkills.length < 6) {
      const needed = 6 - academicSkills.length;
      const placeholders = fallbackAcademic.slice(0, needed);
      academicSkills = [...academicSkills, ...placeholders];
    } else {
      academicSkills = academicSkills.slice(0, 6);
    }

    let generalSkills = generalSkillsMap.map(gs => ({
      skill: gs.skill,
      value: gs.total > 0 ? Math.round((gs.value / gs.total) * 100) : 0
    })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6

    // 3. Career Oracle Data
    const careerOracle = getCareerAlignment(dream_job, completedNamesRes.rows);

    res.json({
      user: { id: userId, name, year, semester },
      courses,
      topics,
      progressPercent,
      streak,
      lastActive: streak_last_active_date,

      weekDays,
      weeklyActivity,
      weeklyProgress,
      skills: {
        academic: academicSkills,
        general: generalSkills
      },
      onlinePeers: onlineRes.rows,
      cohortPercentile,
      stats: {
        summaries: parseInt(contribStats.summaries) || 0,
        cheatsheets: parseInt(contribStats.cheatsheets) || 0,
        reviews: parseInt(contribStats.reviews) || 0,
        lastInterview,
        projectStats,
        recentActivity
      },
      careerOracle
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

export const getKnowledgeMap = async (req, res) => {
  const userId = req.user.id;
  try {
    const resMap = await pool.query(`
    SELECT
    c.id as course_id,
      c.name as course_name,
      t.id as topic_id,
      t.title as topic_name,
      COALESCE(utp.quiz_score, 0) as score,
      COALESCE(utp.completed, false) as completed
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      JOIN topics t ON c.id = t.course_id
      LEFT JOIN user_topic_progress utp ON t.id = utp.topic_id AND utp.user_id = $1
      WHERE uc.user_id = $1
      ORDER BY c.id, t.id
      `, [userId]);

    const dreamJobResult = await pool.query("SELECT dream_job, name FROM users WHERE id = $1", [userId]);
    const { dream_job } = dreamJobResult.rows[0] || {};

    // Get completed courses for percentage
    const completedCoursesRes = await pool.query(
      "SELECT c.name FROM user_courses uc JOIN courses c ON uc.course_id = c.id WHERE uc.user_id = $1 AND uc.status = 'completed'",
      [userId]
    );
    const career = getCareerAlignment(dream_job, completedCoursesRes.rows);

    // 2. Fetch all current map nodes
    const mapNodes = resMap.rows;

    // 3. Inject Holographic Nodes for critical courses NOT in user's library
    if (dream_job && career.criticalPath.length > 0) {
      for (const criticalCourse of career.criticalPath) {
        const alreadyInMap = mapNodes.some(n => n.course_name.toLowerCase().includes(criticalCourse.toLowerCase()));

        if (!alreadyInMap) {
          // Find this course in global DB to get its topics
          const globalCourseRes = await pool.query("SELECT id, name FROM courses WHERE name ILIKE $1 LIMIT 1", [`% ${criticalCourse}% `]);
          if (globalCourseRes.rows.length > 0) {
            const course = globalCourseRes.rows[0];
            const topicsRes = await pool.query("SELECT id, title FROM topics WHERE course_id = $1 LIMIT 3", [course.id]);

            topicsRes.rows.forEach(t => {
              mapNodes.push({
                course_id: course.id,
                course_name: course.name,
                topic_id: t.id,
                topic_name: t.title,
                score: 0,
                completed: false,
                isHologram: true,
                isCritical: true
              });
            });
          }
        }
      }
    }

    res.json({
      map: mapNodes,
      career
    });
  } catch (err) {
    console.error("Knowledge map error:", err);
    res.status(500).json({ message: "Neural map extraction failed." });
  }
};
