import pool from "../config/db.js";

/**
 * Manages the transition of interview phases
 * INTRO -> TECHNICAL -> BEHAVIORAL -> CLOSING
 */
export const getNextPhase = (currentPhase) => {
    switch (currentPhase) {
        case 'INTRO': return 'EXPERIENCE';
        case 'EXPERIENCE': return 'TECHNICAL';
        case 'TECHNICAL': return 'HIGH_PRESSURE';
        case 'HIGH_PRESSURE': return 'BEHAVIORAL';
        case 'BEHAVIORAL': return 'CLOSING';
        default: return 'CLOSING';
    }
};

/**
 * Persists the interview session state
 */
export const updateInterviewSession = async (userId, conversationId, phase, scoreData) => {
    try {
        await pool.query(
            `UPDATE interview_sessions 
             SET current_phase = $1, metadata = (metadata::jsonb || $2::jsonb), updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND user_id = $4`,
            [phase, JSON.stringify(scoreData), conversationId, userId]
        );
    } catch (err) {
        console.error("Failed to update interview session", err);
    }
};

/**
 * Initializes a new interview session
 */
export const startInterviewSession = async (userId, conversationId, targetJob, mode = 'STANDARD') => {
    await pool.query(
        `INSERT INTO interview_sessions (id, user_id, current_phase, target_job, mode)
         VALUES ($1, $2, 'INTRO', $3, $4)`,
        [conversationId, userId, targetJob, mode]
    );
};
