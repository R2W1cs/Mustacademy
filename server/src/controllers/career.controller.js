import pool from "../config/db.js";
import { CAREER_ARCHITECT_PROMPT, FULL_ROADMAP_PROMPT } from "../utils/aiRules.js";
import { callFastAI } from "../utils/aiClient.js";

const safeStringify = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
        return val.map(item => {
            if (typeof item === 'object' && item !== null) {
                return item.title || item.name || item.text || JSON.stringify(item);
            }
            return String(item);
        }).join('. ');
    }
    if (typeof val === 'object' && val !== null) {
        return val.title || val.name || val.text || JSON.stringify(val);
    }
    return String(val);
};


export const generateCareerArchitecture = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Fetch User Data
        const userRes = await pool.query(
            "SELECT dream_job, passion, bio, year, semester FROM users WHERE id = $1",
            [userId]
        );
        const user = userRes.rows[0];

        if (!user || !user.dream_job || !user.year || !user.semester) {
            return res.status(400).json({ message: "Please complete your career profile setup first, including your Year and Semester." });
        }

        // 2. Fetch Curriculum Context
        const curriculumRes = await pool.query(`
            SELECT c.name, c.description, s.year_number, s.semester_number
            FROM courses c
            JOIN semesters s ON c.semester_id = s.id
            WHERE s.year_number = $1 AND s.semester_number = $2
            ORDER BY c.name
        `, [user.year, user.semester]);
        const rawCurriculum = curriculumRes.rows.map(c =>
            `Year ${c.year_number} Sem ${c.semester_number}: ${c.name} (${c.description})`
        ).join("\n");

        if (!rawCurriculum) {
            throw new Error("No courses found for your current Year and Semester. Please ensure your profile is correct.");
        }

        const RAW_CURRICULUM_CAP = 3000; // ~750 tokens — prevents prompt bloat
        const curriculum = rawCurriculum.length > RAW_CURRICULUM_CAP
            ? rawCurriculum.slice(0, RAW_CURRICULUM_CAP) + '\n[... truncated for token budget]'
            : rawCurriculum;

        // 3. Prepare Prompt
        const prompt = CAREER_ARCHITECT_PROMPT
            .replace(/{target_job}/g, user.dream_job)
            .replace(/{year}/g, user.year)
            .replace(/{semester}/g, user.semester)
            .replace(/{passion}/g, user.passion || "General Computer Science")
            .replace(/{bio}/g, user.bio || "Student at University")
            .replace(/{curriculum}/g, curriculum);

        // 4. Generate Architecture
        console.log(`[Career] Forging trajectory for User ${userId} -> ${user.dream_job}...`);
        const aiData = await callFastAI(prompt, true, 2048);

        // Normalize AI Data with Robust Sanitation (Prevents React [object Object] errors)
        const normalizedRoadmap = (aiData.roadmap || []).map(step => ({
            ...step,
            phase: safeStringify(step.phase),
            title: safeStringify(step.title),
            description: safeStringify(step.description),
            study_list: Array.isArray(step.study_list) ? step.study_list.map(safeStringify) : [],
            preparation_task: safeStringify(step.preparation_task),
            battlefield_scenario: safeStringify(step.battlefield_scenario),
            conceptual_proof: safeStringify(step.conceptual_proof),
            industry_standard: safeStringify(step.industry_standard)
        }));

        const normalizedArchitecture = {
            ...aiData.architecture,
            title: safeStringify(aiData.architecture?.title),
            summary: safeStringify(aiData.architecture?.summary),
            technical_pillars: (aiData.architecture?.technical_pillars || []).map(safeStringify)
        };

        // 5. Save/Update Roadmap in DB
        const roadmapRes = await pool.query(`
            INSERT INTO career_roadmaps (user_id, target_job, architecture_json, roadmap_steps_json)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE SET
                target_job = EXCLUDED.target_job,
                architecture_json = EXCLUDED.architecture_json,
                roadmap_steps_json = EXCLUDED.roadmap_steps_json,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [
            userId,
            user.dream_job,
            JSON.stringify(normalizedArchitecture),
            JSON.stringify(normalizedRoadmap)
        ]);

        res.json(roadmapRes.rows[0]);

    } catch (err) {
        console.error("Career Architect Error:", err);
        res.status(500).json({
            message: "The Professor is currently occupied with a complex derivation. Please retry later.",
            error: err.message
        });
    }
};

export const getCareerRoadmap = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            "SELECT * FROM career_roadmaps WHERE user_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No career trajectory found. Please generate one." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch trajectory archives." });
    }
};

export const generateFullRoadmap = async (req, res) => {
    const { career } = req.body;
    if (!career?.trim()) {
        return res.status(400).json({ message: 'career field is required' });
    }
    try {
        const careerText = career.trim().slice(0, 200); // cap free-text field to ~50 tokens
        const prompt = FULL_ROADMAP_PROMPT.replace(/{career}/g, careerText);
        const data = await callFastAI(prompt, true, 2048);
        res.json(data);
    } catch (err) {
        console.error('[Career] Full roadmap generation error:', err.message);
        res.status(500).json({ message: 'Failed to generate roadmap. Please retry.' });
    }
};
