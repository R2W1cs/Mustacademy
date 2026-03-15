
import pool from "../config/db.js";
import { callAI } from "../utils/aiClient.js";
import { EXAM_READINESS_PROMPT, EXAM_GENERATION_PROMPT, EXAM_INTEGRITY_PROMPT, EXAM_GRADING_PROMPT } from "../utils/aiRules.js";

export const checkReadiness = async (req, res) => {
    const userId = req.user.id;
    const { courseId } = req.params;

    try {
        // 1. Get Course Info
        const courseRes = await pool.query("SELECT name FROM courses WHERE id = $1", [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: "Course not found" });
        const courseName = courseRes.rows[0].name;

        // 2. Get User Progress for this course
        const progressRes = await pool.query(`
            SELECT t.title, COALESCE(ut.completed, false) as completed
            FROM topics t
            LEFT JOIN user_topic_progress ut ON t.id = ut.topic_id AND ut.user_id = $1
            WHERE t.course_id = $2
        `, [userId, courseId]);

        const completedCount = progressRes.rows.filter(r => r.completed).length;
        const totalCount = progressRes.rows.length;
        const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        const progressSummary = `The student has completed ${completedCount}/${totalCount} topics (${completionRate.toFixed(1)}%). Topics include: ${progressRes.rows.map(r => r.title).join(", ")}.`;

        // 3. Call AI for Readiness Verdict
        const prompt = EXAM_READINESS_PROMPT
            .replace("{course_name}", courseName)
            .replace("{progress_summary}", progressSummary);

        const aiData = await callAI(prompt);

        res.json(aiData);
    } catch (err) {
        console.error("Readiness Check Error:", err);
        res.status(500).json({ message: "Professor is currently debating your academic worth. Try again later." });
    }
};

export const generateExam = async (req, res) => {
    const userId = req.user.id;
    const { courseId, mode, selectedTopics } = req.body; // mode: 'Midterm' | 'Final'

    try {
        const courseRes = await pool.query("SELECT name FROM courses WHERE id = $1", [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: "Course not found" });
        const courseName = courseRes.rows[0].name;

        console.log(`[Exam Generator] Request - Course: ${courseName}, Mode: ${mode}, Topics: ${selectedTopics ? selectedTopics.length : 'All'}`);

        // Implicit Enrollment: Ensure user is connected to the course for progress tracking
        const enrollmentCheck = await pool.query(
            "SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2",
            [userId, courseId]
        );
        if (enrollmentCheck.rows.length === 0) {
            await pool.query(
                "INSERT INTO user_courses (user_id, course_id, status) VALUES ($1, $2, 'in_progress')",
                [userId, courseId]
            );
        }

        let topicsToCover = "";
        if (mode === 'Midterm' && selectedTopics) {
            topicsToCover = selectedTopics.join(", ");
        } else {
            const allTopicsRes = await pool.query("SELECT title FROM topics WHERE course_id = $1", [courseId]);
            topicsToCover = allTopicsRes.rows.map(r => r.title).join(", ");
        }

        const prompt = EXAM_GENERATION_PROMPT
            .replace(/{course_name}/g, courseName)
            .replace("{exam_mode}", mode)
            .replace("{topics}", topicsToCover);

        console.log(`[Exam Generator] Triggering AI for ${courseName} (${mode})...`);
        const examData = await callAI(prompt);

        if (!examData.mcqs) {
            console.warn("[Exam Generator] AI failed to return valid exam structure. Data:", JSON.stringify(examData).substring(0, 200));
        } else {
            console.log(`[Exam Generator] Success. MCQs: ${examData.mcqs.length}, Short: ${examData.short_answers?.length}`);
        }

        res.json(examData);
    } catch (err) {
        console.error("Exam Generation Error:", err);
        res.status(500).json({ message: "Failed to print exam papers. System error." });
    }
};

export const submitExam = async (req, res) => {
    const userId = req.user.id;
    const { responses, examTitle, examContext } = req.body;

    try {
        console.log(`[Exam Submission] Processing submission for: ${examTitle}`);

        // 1. AI Integrity Check
        const integrityPrompt = EXAM_INTEGRITY_PROMPT.replace("{student_responses}", JSON.stringify(responses));
        const integrityAudit = await callAI(integrityPrompt);

        if (integrityAudit.verdict === 'FAIL') {
            return res.json({
                success: false,
                message: "ACADEMIC DISHONESTY DETECTED. The auditor has flagged your responses as AI-generated/Plagiarized.",
                audit: {
                    integrity_score: integrityAudit.integrity_score || 0,
                    ai_confidence: integrityAudit.ai_confidence || 0,
                    reasoning: integrityAudit.reasoning || "Integrity violation detected.",
                    flagged_passages: integrityAudit.flagged_passages || []
                },
                grade: { total_score: 0, letter_grade: 'F', verdict: 'FAIL', summary_feedback: "Submission rejected due to integrity violations." }
            });
        }

        // 2. AI Grading (Only if integrity passes)
        const gradingPrompt = EXAM_GRADING_PROMPT
            .replace("{exam_title}", examTitle)
            .replace("{student_responses}", JSON.stringify({
                exam_questions: examContext,
                student_answers: responses
            }));

        console.log(`[Exam Grader] grading ${examTitle}...`);
        const gradingResult = await callAI(gradingPrompt);

        res.json({
            success: true,
            message: "Exam graded successfully.",
            audit: integrityAudit,
            grade: {
                total_score: gradingResult.total_score || 0,
                letter_grade: gradingResult.letter_grade || 'F',
                verdict: gradingResult.verdict || 'FAIL',
                summary_feedback: gradingResult.summary_feedback || gradingResult.reply || "No feedback provided.",
                section_scores: gradingResult.section_scores || {
                    mcq: { score: 0, total: 30 },
                    short_answer: { score: 0, total: 30 },
                    case_study: { score: 0, total: 40 }
                },
                feedback_by_question: gradingResult.feedback_by_question || []
            }
        });

    } catch (err) {
        console.error("Exam Submission Error:", err);
        res.status(500).json({ message: "Audit system failure." });
    }
};
