import pool from '../config/db.js';
import { completeSession } from '../controllers/ai.controller.js';

async function testFeedbackLoop() {
    console.log("🚀 Testing Feedback Loop (Session Completion)...");

    const testUserId = 3;
    const today = new Date().toISOString().split('T')[0];

    // 1. Get the current plan
    const planRes = await pool.query("SELECT id, schedule FROM daily_plans WHERE user_id::text = $1 AND date = $2", [testUserId.toString(), today]);
    if (planRes.rows.length === 0) {
        console.error("No plan found for today. Run verification_elite.js first.");
        process.exit(1);
    }

    const planId = planRes.rows[0].id;
    console.log(`Plan ID found: ${planId}`);

    // 2. Call completeSession for the first block (index 0)
    const mockRes = {
        json: (data) => {
            console.log("Session Completion Result:", JSON.stringify(data, null, 2));
            if (data.success && data.schedule[0].status === 'completed') {
                console.log("✅ Feedback Loop Success: Block marked as completed.");
            } else {
                console.error("❌ Feedback Loop Failed: Block status not updated correctly.");
                process.exit(1);
            }
        },
        status: (code) => ({ json: (data) => console.log(`Error ${code}:`, data) })
    };

    await completeSession({ user: { id: testUserId }, body: { blockIndex: 0 } }, mockRes);

    console.log("✅ Feedback Loop Test Complete.");
    process.exit(0);
}

testFeedbackLoop().catch(err => {
    console.error(err);
    process.exit(1);
});
