import pool from "../config/db.js";
import { PROFESSOR_TOPIC_SYNTHESIS_PROMPT } from "../utils/aiRules.js";
import { callOllama } from "../utils/aiClient.js";

const batchSync = async () => {
    try {
        console.log("🚀 Starting Batch Academic 4.0 Synchronization...");

        // 1. Fetch topics that need synthesis (placeholder-y content)
        const topicsRes = await pool.query(`
            SELECT id, title FROM topics 
            WHERE first_principles IS NULL 
               OR historical_context LIKE 'Awaiting%' 
               OR first_principles LIKE 'Awaiting%'
            LIMIT 3
        `);

        if (topicsRes.rows.length === 0) {
            console.log("✅ All topics seem to be high-fidelity. No sync needed.");
            process.exit(0);
        }

        console.log(`Found ${topicsRes.rows.length} topics requiring resynthesis.`);

        for (const topic of topicsRes.rows) {
            console.log(`\n[SYNTH] Processing: ${topic.title}`);
            const prompt = PROFESSOR_TOPIC_SYNTHESIS_PROMPT.replace("{topic}", topic.title);

            try {
                const aiData = await callOllama(prompt);
                if (!aiData || aiData.error) throw new Error("Invalid AI response");

                await pool.query(`
                    UPDATE topics SET 
                        breadcrumb_path = $1,
                        difficulty = $2,
                        estimated_time = $3,
                        learning_objectives = $4,
                        historical_context = $5,
                        first_principles = $6,
                        structural_breakdown = $7,
                        deep_dive = $8,
                        applied_practice = $9,
                        failure_analysis = $10,
                        production_standard = $11,
                        scholarly_references = $12,
                        staff_engineer_note = $13,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $14
                `, [
                    aiData.breadcrumb_path || 'General',
                    aiData.difficulty || 'Intermediate',
                    aiData.estimated_time || '1h',
                    JSON.stringify(aiData.learning_objectives || []),
                    aiData.historical_context || 'Awaiting synthesis...',
                    aiData.first_principles || 'Awaiting synthesis...',
                    aiData.structural_breakdown || 'Awaiting synthesis...',
                    JSON.stringify(aiData.deep_dive || {}),
                    JSON.stringify(aiData.applied_practice || []),
                    aiData.failure_analysis || 'Awaiting synthesis...',
                    JSON.stringify(aiData.production_standard || {}),
                    JSON.stringify(aiData.scholarly_references || []),
                    aiData.staff_engineer_note || '',
                    topic.id
                ]);
                console.log(`[SUCCESS] Refreshed: ${topic.title}`);
            } catch (err) {
                console.error(`[FAILED] Topic: ${topic.title}`, err.message);
            }
        }

        console.log("\n✅ Batch Sync Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Fatal Sync Error:", err);
        process.exit(1);
    }
};

batchSync();
