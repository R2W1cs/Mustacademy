import pool from "../config/db.js";
import { CAREER_ARCHITECT_PROMPT, ATS_SCANNER_PROMPT } from "../utils/aiRules.js";
import { callAI } from "../utils/aiClient.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

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

export const scanResume = async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    console.log(`[ATS Backend] Scan requested by User ${userId}. File:`, file ? `${file.originalname} (${file.size} bytes)` : "NONE");

    if (!file) {
        return res.status(400).json({ message: "No resume file provided." });
    }

    try {
        // 1. Extract Text from File
        let resumeText = "";
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        console.log(`[ATS Backend] Extracting text from ${fileExtension}...`);

        if (fileExtension === 'pdf') {
            const PDFParseClass = pdf.PDFParse || (pdf.default && pdf.default.PDFParse);

            if (typeof pdf === 'function') {
                const data = await pdf(file.buffer);
                resumeText = data.text;
            } else if (PDFParseClass) {
                const parser = new PDFParseClass({ data: file.buffer });
                const result = await parser.getText();
                resumeText = result.text;
            } else if (pdf.default && typeof pdf.default === 'function') {
                const data = await pdf.default(file.buffer);
                resumeText = data.text;
            } else {
                console.error("[ATS Backend] PDF parser discovery failed. Keys:", Object.keys(pdf));
                throw new Error("PDF internal parser protocol mismatch.");
            }
        } else if (fileExtension === 'docx') {
            const extractFunc = mammoth.extractRawText || (mammoth.default && mammoth.default.extractRawText);
            if (typeof extractFunc !== 'function') {
                throw new Error("DOCX internal parser protocol mismatch.");
            }
            const result = await extractFunc({ buffer: file.buffer });
            resumeText = result.value;
        } else {
            console.warn(`[ATS Backend] Unsupported format: ${fileExtension}`);
            return res.status(400).json({ message: "Unsupported file format. Please upload PDF or DOCX." });
        }

        console.log(`[ATS Backend] Extraction complete. Text length: ${resumeText.length}`);

        if (!resumeText.trim()) {
            throw new Error("Unable to extract text from the document. Please ensure it's not scanned or empty.");
        }

        // 2. Get User Context (Target Job)
        const userRes = await pool.query("SELECT dream_job FROM users WHERE id = $1", [userId]);
        const targetJob = userRes.rows[0]?.dream_job || "Software Engineer";
        console.log(`[ATS Backend] User Job: ${targetJob}`);

        // 3. Call AI for Analysis
        console.log(`[ATS Backend] Invoking AI (Ollama)...`);
        const prompt = ATS_SCANNER_PROMPT
            .replace(/{target_job}/g, targetJob)
            .replace(/{resume_text}/g, resumeText.substring(0, 10000)); // Limit text to prevent prompt overflow

        const analysis = await callAI(prompt);
        console.log(`[ATS Backend] AI Analysis complete.`);

        // Robust Sanitization for Frontend Stability
        const sanitizedAnalysis = {
            score: typeof analysis.score === 'number' ? analysis.score : parseInt(analysis.score) || 0,
            keywords_found: Array.isArray(analysis.keywords_found) ? analysis.keywords_found : [],
            keywords_missing: Array.isArray(analysis.keywords_missing) ? analysis.keywords_missing : [],
            formatting_issues: Array.isArray(analysis.formatting_issues) ? analysis.formatting_issues : [],
            improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
            summary: analysis.summary || "Analysis incomplete.",
            status: "Protocol Success"
        };

        res.json(sanitizedAnalysis);

    } catch (err) {
        console.error("[ATS Backend] ERROR:", err);
        res.status(500).json({
            message: "The Analyst is currently busy auditing another security clearance. Please retry.",
            error: err.message
        });
    }
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
        const curriculum = curriculumRes.rows.map(c =>
            `Year ${c.year_number} Sem ${c.semester_number}: ${c.name} (${c.description})`
        ).join("\n");

        if (!curriculum) {
            throw new Error("No courses found for your current Year and Semester. Please ensure your profile is correct.");
        }

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
        const aiData = await callAI(prompt);

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
