import pool from "../config/db.js";


/**
 * Passively checks user streak status.
 * Resets to 0 if more than 48h has passed.
 * DOES NOT increment.
 */
export const validateStreak = async (userId) => {
    const result = await pool.query(
        "SELECT streak_current, streak_last_active_date FROM users WHERE id = $1",
        [userId]
    );

    if (result.rows.length === 0) return 0;

    const { streak_current, streak_last_active_date } = result.rows[0];
    if (!streak_last_active_date) return streak_current || 0;

    const lastActive = new Date(streak_last_active_date);
    const now = new Date();
    const diffMs = now - lastActive;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 48) {
        // Reset streak if gap too large
        await pool.query(
            "UPDATE users SET streak_current = 0 WHERE id = $1",
            [userId]
        );
        return 0;
    }

    return streak_current || 0;
};

/**
 * Actively increments streak when a mission is completed.
 * Only increments if 24h has passed since last increment.
 */
export const incrementStreak = async (userId) => {
    const result = await pool.query(
        "SELECT streak_current, streak_last_active_date FROM users WHERE id = $1",
        [userId]
    );

    if (result.rows.length === 0) return 0;

    let { streak_current, streak_last_active_date } = result.rows[0];
    streak_current = streak_current || 0;

    let newStreak = streak_current;
    const now = new Date();

    if (!streak_last_active_date) {
        newStreak = 1;
    } else {
        const lastActive = new Date(streak_last_active_date);
        const diffMs = now - lastActive;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            // Cooldown: No increment within 24h
            return streak_current;
        } else if (diffHours < 48) {
            // Valid Increment window
            newStreak += 1;
        } else {
            // Reset and start over
            newStreak = 1;
        }
    }

    await pool.query(
        "UPDATE users SET streak_current = $1, streak_last_active_date = $2 WHERE id = $3",
        [newStreak, now.toISOString(), userId]
    );



    return newStreak;
};


