import pool from "../config/db.js";

export const getMyContributionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 0. Fetch Requesting User's Cohort
    const userCohortRes = await pool.query("SELECT year, semester FROM users WHERE id = $1", [userId]);
    const { year, semester } = userCohortRes.rows[0];

    // 1. Fetch Core Stats
    const statsRes = await pool.query(
      "SELECT contribution_score, level, current_asc FROM user_stats WHERE user_id = $1",
      [userId]
    );

    // Self-Healing: If stats missing, initialize them
    if (statsRes.rows.length === 0) {
      await pool.query("INSERT INTO user_stats (user_id) VALUES ($1)", [userId]);
      // Re-fetch default stats
      const newStats = await pool.query("SELECT contribution_score, level, current_asc FROM user_stats WHERE user_id = $1", [userId]);
      statsRes.rows = newStats.rows; // Replace with fresh stats
    }

    // 2. Mature Assets and Calculate Points
    const pendingMatured = await pool.query(
      `SELECT a.id, a.user_id, COALESCE(AVG(r.rating), 0) as avg_rating
       FROM scholarly_assets a
       LEFT JOIN asset_reviews r ON a.id = r.asset_id
       WHERE a.status = 'pending' AND a.created_at < NOW() - INTERVAL '7 days'
       GROUP BY a.id, a.user_id`
    );

    for (const asset of pendingMatured.rows) {
      const qualityPoints = Math.round((parseFloat(asset.avg_rating) || 0) * 20) + 50;
      await pool.query("BEGIN");
      await pool.query("UPDATE scholarly_assets SET status = 'matured' WHERE id = $1", [asset.id]);
      await pool.query(
        "UPDATE user_stats SET contribution_score = contribution_score + $1 WHERE user_id = $2",
        [qualityPoints, asset.user_id]
      );
      await pool.query(
        "INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'SCHOLARLY_MATURED', $2)",
        [asset.user_id, qualityPoints]
      );
      await pool.query("COMMIT");
    }

    // 3. Fetch Recent Contributions
    const historyRes = await pool.query(
      "SELECT action_type, points, created_at FROM user_contributions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    // 4. Calculate current ASC (Live)
    const rawStats = statsRes.rows[0];
    const contrib = rawStats?.contribution_score || 0;
    const historyPoints = historyRes.rows.reduce((acc, curr) => acc + curr.points, 0);
    const calculatedAsc = Math.floor((contrib * 0.6) + (historyPoints * 0.4));

    if (rawStats && rawStats.current_asc !== calculatedAsc) {
      await pool.query("UPDATE user_stats SET current_asc = $1 WHERE user_id = $2", [calculatedAsc, userId]);
    }

    // 5. Calculate Cohort Velocity (Percentile Rank)
    // Compare this user's score against all users in the same Year/Semester
    const cohortStatsRes = await pool.query(
      `SELECT s.contribution_score 
       FROM user_stats s
       JOIN users u ON s.user_id = u.id
       WHERE u.year = $1 AND u.semester = $2`,
      [year, semester]
    );

    const cohortScores = cohortStatsRes.rows.map(r => r.contribution_score);
    const totalStudents = cohortScores.length;
    const studentsBeneath = cohortScores.filter(score => score < (rawStats?.contribution_score || 0)).length;

    // Calculate percentile (e.g. Top 5% means you are ahead of 95%)
    // If total is 1 (yourself), ranking is "Top 100%" or "N/A"
    const percentile = totalStudents > 1
      ? Math.floor((studentsBeneath / totalStudents) * 100)
      : 100;

    // 6. Fetch Scoped & Privacy-Filtered Trending Assets
    // Logic: 
    // - Same year & semester
    // - Not hidden (is_hidden = false) UNLESS author is the requester
    // - Not hidden from specific user (asset_hiding table)
    const trendingRes = await pool.query(`
      SELECT a.*, u.name as author_name, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
      FROM scholarly_assets a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN asset_reviews r ON a.id = r.asset_id
      LEFT JOIN asset_hiding ah ON a.id = ah.asset_id AND ah.user_id = $3
      WHERE u.year = $1 AND u.semester = $2
      AND (a.is_hidden = false OR a.user_id = $3)
      AND ah.id IS NULL
      GROUP BY a.id, u.name
      ORDER BY avg_rating DESC, created_at DESC
      LIMIT 15
    `, [year, semester, userId]);

    res.json({
      stats: {
        ...rawStats,
        current_asc: calculatedAsc,
        cohort_percentile: percentile,
        total_cohort: totalStudents
      },
      recentActivity: historyRes.rows,
      cheatsheets: trendingRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Contribution protocol failure" });
  }
};

export const uploadAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, fileUrl, assetType, subjectArea } = req.body;

    const result = await pool.query(
      "INSERT INTO scholarly_assets (user_id, title, file_url, asset_type, subject_area, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *",
      [userId, title, fileUrl, assetType, subjectArea]
    );

    await pool.query("INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'INITIAL_UPLOAD', 15)", [userId]);

    res.json({ message: "Asset pushed to Institutional Library. Scoped to same year/semester cohort.", asset: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Asset upload failure" });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    const check = await pool.query("SELECT user_id FROM scholarly_assets WHERE id = $1", [assetId]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Asset not found." });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ message: "Unauthorized for this removal protocol." });

    await pool.query("DELETE FROM scholarly_assets WHERE id = $1", [assetId]);
    res.json({ message: "Asset expunged from Institutional Library." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Expunge protocol failed." });
  }
};

export const toggleVisibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    const check = await pool.query("SELECT user_id, is_hidden FROM scholarly_assets WHERE id = $1", [assetId]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Asset not found." });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ message: "Unauthorized visibility control." });

    const newVisibility = !check.rows[0].is_hidden;
    await pool.query("UPDATE scholarly_assets SET is_hidden = $1 WHERE id = $2", [newVisibility, assetId]);

    res.json({
      message: newVisibility ? "Asset now hidden from general feed." : "Asset synchronized with public feed.",
      isHidden: newVisibility
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Visibility toggle failed." });
  }
};

export const hideFromStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, targetUserId } = req.body;

    const check = await pool.query("SELECT user_id FROM scholarly_assets WHERE id = $1", [assetId]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Asset info not retrieved." });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ message: "Ownership required for granular blocking." });

    await pool.query(
      "INSERT INTO asset_hiding (asset_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [assetId, targetUserId]
    );

    res.json({ message: "Scholarly asset now hidden from specified researcher." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Granular hiding failed." });
  }
};

export const submitReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { assetId, rating, comment } = req.body;

    const asset = await pool.query("SELECT user_id FROM scholarly_assets WHERE id = $1", [assetId]);
    if (asset.rows[0].user_id === reviewerId) {
      return res.status(403).json({ message: "Cannot review your own scholarly production." });
    }

    await pool.query(
      "INSERT INTO asset_reviews (asset_id, reviewer_id, rating, comment) VALUES ($1, $2, $3, $4) ON CONFLICT (asset_id, reviewer_id) DO UPDATE SET rating = $3, comment = $4",
      [assetId, reviewerId, rating, comment]
    );

    await pool.query("INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'PEER_REVIEW', 10)", [reviewerId]);

    res.json({ message: "Review synchronized with Institutional Record." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Review submission failure" });
  }
};

export const getCohortLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's cohort
    const userRes = await pool.query("SELECT year, semester FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });
    const { year, semester } = userRes.rows[0];

    // Fetch top 10 students in the same cohort
    const leaderboardRes = await pool.query(
      `SELECT u.id, u.name, s.contribution_score, s.level, s.current_asc
       FROM users u
       JOIN user_stats s ON u.id = s.user_id
       WHERE u.year = $1 AND u.semester = $2
       ORDER BY s.contribution_score DESC
       LIMIT 10`,
      [year, semester]
    );

    res.json(leaderboardRes.rows);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ message: "Leaderboard sync stalled" });
  }
};

export const uploadSummary = uploadAsset;
export const uploadCheatsheet = uploadAsset;
