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

const synthesizeTopic = async (topicId) => {
    try {
        console.log(`🚀 Starting Targeted Synthesis for Topic ID: ${topicId}...`);

        const res = await pool.query(`
            SELECT t.id, t.title, t.difficulty, c.name as course_title 
            FROM topics t 
            JOIN courses c ON t.course_id = c.id
            WHERE t.id = $1
        `, [topicId]);

        if (res.rows.length === 0) {
            console.error("Topic not found.");
            process.exit(1);
        }

        const topic = res.rows[0];
        console.log(`Synthesizing: ${topic.title} [${topic.course_title}]`);

        const theoryKeywords = ['Best Practices', 'Evolution', 'Design', 'Architecture', 'Management', 'Security', 'Fundamentals', 'Overview'];
        const isTheory = theoryKeywords.some(key => topic.title.includes(key) || topic.course_title.includes(key));
        const level = topic.difficulty || "Sophomore CS Student";
        let prompt = "";

        if (isTheory) {
            console.log("🏛️ Mode: Theory Professor");
            prompt = PROFESSOR_THEORY_SYNTHESIS_PROMPT
                .replace("{topic}", topic.title)
                .replace("{course}", topic.course_title)
                .replace("{level}", level);
        } else {
            console.log("💻 Mode: Programming Senior Engineer");
            const languageDetect = topic.title.split(' ')[0] || "Universal";
            prompt = PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT
                .replace("{topic}", topic.title)
                .replace("{language}", languageDetect)
                .replace("{level}", level);
        }

        const aiData = await callOllama(prompt);

        if (!aiData || aiData.error || !aiData.content_markdown) {
            console.error("AI returned invalid structure.");
            process.exit(1);
        }

        await pool.query(`
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
        `, [
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
            aiData.staff_engineer_note || "Mastery of this topic is critical for architectural intuition.",
            topic.id
        ]);

        console.log("✅ SUCCESS: Topic synthesized and persisted.");
        process.exit(0);

    } catch (err) {
        console.error("Critical Failure:", err);
        process.exit(1);
    }
};

synthesizeTopic(412);
