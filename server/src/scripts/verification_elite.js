import 'dotenv/config';
import pool from '../config/db.js';
import { generateDailyPlan } from '../controllers/ai.controller.js';

// Mock Response/Request
const mockRes = {
    json: (data) => console.log("Plan Generated:", JSON.stringify(data, null, 2)),
    status: (code) => ({ json: (data) => console.log(`Error ${code}:`, data) })
};

async function testStressScenarios() {
    console.log("🚀 Starting Elite Stress Tests...");

    const testUserId = 3; // Using real integer ID found in DB

    // 1. SCENARIO: User failed same topic twice
    console.log("\n--- Scenario 1: Repeated Failures ---");
    // We'll insert mock goals and submissions for this user
    await pool.query("DELETE FROM goal_submissions WHERE user_id::text = $1", [testUserId]);
    await pool.query("DELETE FROM daily_goals WHERE user_id::text = $1", [testUserId]);

    const goal = await pool.query(
        "INSERT INTO daily_goals (user_id, description, deadline) VALUES ($1, 'Implement Binary Search Tree', NOW()) RETURNING id",
        [testUserId]
    );

    await pool.query(
        "INSERT INTO goal_submissions (goal_id, user_id, submission_text, ai_grade, ai_feedback) VALUES ($1, $2, 'Failed attempt', 45, 'Fundamental misunderstanding of pointers.')",
        [goal.rows[0].id, testUserId]
    );
    await pool.query(
        "INSERT INTO goal_submissions (goal_id, user_id, submission_text, ai_grade, ai_feedback) VALUES ($1, $2, 'Failed attempt 2', 55, 'Still struggling with recursion depth.')",
        [goal.rows[0].id, testUserId]
    );

    await generateDailyPlan({ user: { id: testUserId }, body: { hours: 4, technique: 'pomodoro' } }, mockRes);

    // 2. SCENARIO: User skipped 2 days
    // This is implicitly handled by the lack of recent plans in the context if we were checking dates, 
    // but our context focuses on pending missions.

    console.log("\n--- Scenario 2: High Pressure (Pending Missions) ---");
    await pool.query(
        "INSERT INTO daily_goals (user_id, description, deadline, is_completed) VALUES ($1, 'Final Project Submission', NOW() + interval '1 day', false)",
        [testUserId]
    );
    await generateDailyPlan({ user: { id: testUserId }, body: { hours: 6, technique: 'deep_work' } }, mockRes);

    console.log("\n✅ Stress Tests Complete.");
    process.exit(0);
}

testStressScenarios().catch(err => {
    console.error(err);
    process.exit(1);
});
