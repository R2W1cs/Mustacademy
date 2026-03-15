import 'dotenv/config';
import pool from '../config/db.js';
import { callOllama } from '../utils/aiClient.js';
import { PROFESSOR_THEORY_SYNTHESIS_PROMPT, PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT } from '../utils/aiRules.js';

const mapDifficulty = (val) => {
    const v = (val || "").toLowerCase();
    if (v.includes('advanced')) return 'Advanced';
    if (v.includes('expert')) return 'Expert';
    if (v.includes('intermediate') || v.includes('sophomore')) return 'Intermediate';
    return 'Beginner';
};

const massSynthesize = async () => {
    try {
        console.log("🚀 Starting Massive Intelligence Synthesis Protocol...");

        // 1. Identify topics needing synthesis with course context
        const topicsRes = await pool.query(`
            SELECT t.id, t.title, t.difficulty, c.name as course_title 
            FROM topics t 
            JOIN courses c ON t.course_id = c.id
            WHERE t.content_markdown IS NULL OR t.content_markdown = '' 
            ORDER BY t.id ASC
        `);
        const topics = topicsRes.rows;

        console.log(`📡 Found ${topics.length} topics requiring high-fidelity synthesis.`);

        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            console.log(`\n--- [${i + 1}/${topics.length}] Synthesizing: ${topic.title} ---`);

            try {
                // 2. Logic to detect Theory vs Programming
                const theoryKeywords = ['Best Practices', 'Evolution', 'Design', 'Architecture', 'Management', 'Security', 'Fundamentals', 'Overview'];
                const isTheory = theoryKeywords.some(key => topic.title.includes(key) || topic.course_title.includes(key));

                const level = topic.difficulty || "Sophomore CS Student";
                let prompt = "";

                if (isTheory) {
                    console.log("🏛️  Mode: Theory Professor");
                    prompt = PROFESSOR_THEORY_SYNTHESIS_PROMPT
                        .replace("{topic}", topic.title)
                        .replace("{course}", topic.course_title)
                        .replace("{level}", level);
                } else {
                    console.log("💻 Mode: Programming Senior Engineer");
                    // Detect language from title or default to Generic CS Principles
                    const languageDetect = topic.title.split(' ')[0] || "Universal";
                    prompt = PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT
                        .replace("{topic}", topic.title)
                        .replace("{language}", languageDetect)
                        .replace("{level}", level);
                }

                // 3. Call AI Engine
                const aiData = await callOllama(prompt);

                if (!aiData || aiData.error || !aiData.content_markdown) {
                    console.error(`❌ FAILED: ${topic.title} - AI returned invalid structure.`);
                    continue;
                }

                // 4. Persistence Phase
                console.log(`[DB] Updating topic ${topic.id}: ${topic.title}...`);
                const updateQuery = `
                    UPDATE topics 
                    SET 
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
                        content_markdown = $13,
                        staff_engineer_note = $14,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $15
                `;

                const values = [
                    aiData.breadcrumb_path || `Academy > ${topic.course_title}`,
                    mapDifficulty(aiData.difficulty || level),
                    aiData.estimated_time || "1.5h",
                    JSON.stringify(aiData.learning_objectives || []),
                    aiData.historical_context || "",
                    aiData.first_principles || "",
                    aiData.structural_breakdown || "",
                    JSON.stringify(aiData.deep_dive || {}),
                    JSON.stringify(aiData.applied_practice || []),
                    aiData.failure_analysis || "",
                    JSON.stringify(aiData.production_standard || {}),
                    JSON.stringify(aiData.scholarly_references || []),
                    aiData.content_markdown,
                    aiData.staff_engineer_note || "Mastery of this topic is critical for senior-level architectural intuition.",
                    topic.id
                ];

                try {
                    await pool.query(updateQuery, values);
                    console.log(`✅ SUCCESS: ${topic.title} persists in the synaptic matrix.`);
                } catch (dbErr) {
                    console.error(`❌ DB_UPDATE_FAILED for ${topic.title}:`, dbErr.message);
                    console.error(`[DEBUG] Attempted Query:`, updateQuery);
                    throw dbErr; // Re-throw to trigger the outer catch
                }

                // Rate limiting to preserve OLLAMA stability
                await new Promise(r => setTimeout(r, 2000));

            } catch (innerErr) {
                console.error(`🔥 ERROR synthesizing ${topic.title}:`, innerErr.message);
                // If it's a specific DB error, we might want to exit or stop
                if (innerErr.message.includes('column')) {
                    console.error("🛑 Stopping due to schema mismatch.");
                    process.exit(1);
                }
                await new Promise(r => setTimeout(r, 5000)); // Cool down on error
            }
        }

        console.log("\n✨ Mass Synthesis Protocol Complete.");
        process.exit(0);

    } catch (err) {
        console.error("🛑 CRITICAL PROTOCOL FAILURE:", err);
        process.exit(1);
    }
};

massSynthesize();
