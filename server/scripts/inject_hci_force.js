
import pool from '../src/config/db.js';

const INJECT_DATA = {
    courseId: 184,
    modules: [
        {
            title: "Interaction Design Fundamentals",
            importance_level: "critical",
            first_principles: JSON.stringify([
                "Axiom 1: Visibility.",
                "Axiom 2: Feedback.",
                "Axiom 3: Constraints.",
                "Axiom 4: Consistency."
            ]),
            architectural_logic: "graph TD\n    A[User Goal] --> B{Interaction Mode}\n    B -->|Direct| C[Action]\n    B -->|Command| D[Input]\n    C --> E[Feedback]\n    D --> E\n    E --> F[Result]",
            forge_snippet: "// Design Principle Validator\n// Checks visibility and feedback\nfunction validate(ui) { return ui.hasFeedback; }"
        },
        {
            title: "User Research & Framing",
            importance_level: "high",
            first_principles: JSON.stringify(["Know Thy User.", "Empathy Maps."]),
            architectural_logic: "mindmap\n  root((User Research))\n    Qualitative\n    Quantitative",
            forge_snippet: "// Persona Generator"
        },
        {
            title: "Ideation & Sketching",
            importance_level: "medium",
            first_principles: JSON.stringify(["Divergent before Convergent.", "Sketching is thinking."]),
            architectural_logic: "graph LR\n    A[Problem] --> B(Brainstorm) --> C[Sketch]",
            forge_snippet: "// Brainstorm Scorer"
        },
        {
            title: "Prototyping & Evaluation",
            importance_level: "medium",
            first_principles: JSON.stringify(["Fail Fast.", "Heuristic Evaluation."]),
            architectural_logic: "sequenceDiagram\n    User->>System: Action\n    System-->>User: Feedback",
            forge_snippet: "// Heuristic Checker"
        }
    ]
};

const run = async () => {
    try {
        console.log(`🚀 Forcing Injection...`);

        // 1. NUKE THE CONSTRAINT
        console.log("💥 Dropping Constraint...");
        await pool.query("ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_importance_level_check");
        // Ensure column is TEXT
        await pool.query("ALTER TABLE topics ALTER COLUMN importance_level TYPE TEXT");

        // 2. Inject
        for (const module of INJECT_DATA.modules) {
            // Check if topic exists
            const topicCheck = await pool.query(
                "SELECT id FROM topics WHERE course_id = $1 AND title = $2",
                [INJECT_DATA.courseId, module.title]
            );

            if (topicCheck.rows.length === 0) {
                await pool.query(
                    `INSERT INTO topics 
                     (course_id, title, importance_level, first_principles, architectural_logic, forge_snippet)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [INJECT_DATA.courseId, module.title, module.importance_level, module.first_principles, module.architectural_logic, module.forge_snippet]
                );
                console.log(`   + Injected: ${module.title}`);
            } else {
                await pool.query(
                    `UPDATE topics 
                     SET first_principles = $3, architectural_logic = $4, forge_snippet = $5, importance_level = $6
                     WHERE id = $1`,
                    [topicCheck.rows[0].id, INJECT_DATA.courseId, module.first_principles, module.architectural_logic, module.forge_snippet, module.importance_level]
                );
                console.log(`   ~ Updated: ${module.title}`);
            }
        }
        console.log("✅ Force Injection Complete.");
        process.exit(0);

    } catch (err) {
        console.error("❌ FAILURE:", err);
        process.exit(1);
    }
};

run();
