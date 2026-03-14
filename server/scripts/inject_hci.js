
import pool from '../src/config/db.js';

const INJECT_DATA = {
    courseName: "Human-Computer Interaction",
    semYear: 2,
    semNum: 2,
    description: "Design of effective human-computer interfaces using a human-centered approach.",
    modules: [
        {
            title: "Interaction Design Fundamentals",
            importance_level: "critical", // Was 1
            first_principles: JSON.stringify([
                "Axiom 1: Visibility. The more visible functions are, the more likely users will be able to know what to do next.",
                "Axiom 2: Feedback. Send information back to the user about what action has been done.",
                "Axiom 3: Constraints. Restricting the kind of interaction that can take place.",
                "Axiom 4: Consistency. Designing interfaces to have similar operations and use similar elements."
            ]),
            architectural_logic: "graph TD\n    A[User Goal] --> B{Interaction Mode}\n    B -->|Direct| C[Action]\n    B -->|Command| D[Input]\n    C --> E[Feedback]\n    D --> E\n    E --> F[Result]",
            forge_snippet: "// Design Principle Validator\nfunction validateInterface(elements) {\n  let score = 0;\n  // 1. Check Visibility\n  if (elements.some(e => e.isVisible)) score += 25;\n  // 2. Check Feedback\n  if (elements.hasFeedbackSystem) score += 25;\n  return score;\n}"
        },
        {
            title: "User Research & Framing",
            importance_level: "high", // Was 2
            first_principles: JSON.stringify([
                "Axiom 1: Know Thy User. You are not the user.",
                "Axiom 2: Empathy Maps. Say, Do, Think, Feel.",
                "Axiom 3: The Persona. A fictional archetype."
            ]),
            architectural_logic: "mindmap\n  root((User Research))\n    Qualitative\n      Interviews\n      Observations\n    Quantitative\n      Surveys\n      Analytics",
            forge_snippet: "// Persona Generator\nconst generatePersona = (demographics, goals) => {\n  return {\n    name: 'Generated User',\n    role: demographics.role,\n    goals: goals\n  };\n}"
        },
        {
            title: "Ideation & Sketching",
            importance_level: "medium", // Was 3
            first_principles: JSON.stringify([
                "Axiom: Divergent before Convergent.",
                "Quantity leads to Quality.",
                "Sketching is thinking."
            ]),
            architectural_logic: "graph LR\n    A[Problem Statement] --> B(Brainstorming)\n    B --> C{Filtering}\n    C -->|Feasibility| D[Selected Ideas]\n    C -->|Impact| D\n    D --> E[Sketching]\n    E --> F[Wireframing]",
            forge_snippet: "// Brainstorm Scorer\nfunction rateIdea(novelty, feasibility) {\n  return (novelty * 0.7) + (feasibility * 0.3);\n}"
        },
        {
            title: "Prototyping & Evaluation",
            importance_level: "medium", // Was 4
            first_principles: JSON.stringify([
                "Axiom: Fail Fast, Fail Cheap.",
                "Lo-Fi for concept, Hi-Fi for look.",
                "Heuristic Evaluation: Nielsen's 10 Principles."
            ]),
            architectural_logic: "sequenceDiagram\n    User->>Interface: Action\n    Interface-->>System: Process\n    System-->>Interface: State Update\n    Interface-->>User: Visual Feedback\n    User->>User: Cognitive Processing",
            forge_snippet: "// Heuristic Checker\nconst heuristics = ['Visibility', 'Real World Match', 'User Control'];\nfunction check(interface) {\n  return heuristics.filter(h => interface.complies(h));\n}"
        }
    ]
};

const run = async () => {
    try {
        console.log("🚀 Starting Scholar's Codex Injection...");

        // 1. Schema Migration
        console.log("🛠️  Migrating Schema...");
        try {
            await pool.query(`
                ALTER TABLE topics 
                ADD COLUMN IF NOT EXISTS first_principles TEXT DEFAULT '[]', 
                ADD COLUMN IF NOT EXISTS architectural_logic TEXT DEFAULT '',
                ADD COLUMN IF NOT EXISTS forge_snippet TEXT DEFAULT '';
            `);
            console.log("✅ Schema Upgraded (Columns Added).");
        } catch (schemaErr) {
            console.warn("⚠️ Schema migration warning:", schemaErr.message);
        }

        // 2. Find Semester
        console.log("🔍 Finding Semester...");
        const semRes = await pool.query(
            "SELECT id FROM semesters WHERE year_number = $1 AND semester_number = $2",
            [INJECT_DATA.semYear, INJECT_DATA.semNum]
        );

        if (semRes.rows.length === 0) {
            console.error("❌ Semester not found! Ensure Year 2 Semester 2 exists.");
            process.exit(1);
        }
        const semesterId = semRes.rows[0].id;

        // 3. Create/Get Course
        let courseId;
        const courseRes = await pool.query("SELECT id FROM courses WHERE name = $1", [INJECT_DATA.courseName]);

        if (courseRes.rows.length > 0) {
            courseId = courseRes.rows[0].id;
            console.log(`ℹ️  Course '${INJECT_DATA.courseName}' exists (ID: ${courseId}). Using existing.`);
        } else {
            console.log("✨ Creating new course...");
            const newCourse = await pool.query(
                "INSERT INTO courses (name, description, semester_id) VALUES ($1, $2, $3) RETURNING id",
                [INJECT_DATA.courseName, INJECT_DATA.description, semesterId]
            );
            courseId = newCourse.rows[0].id;
            console.log(`✅ Created Course '${INJECT_DATA.courseName}' (ID: ${courseId}).`);
        }

        // 4. Inject Topics
        console.log("💉 Injecting Modules...");
        for (const module of INJECT_DATA.modules) {
            const topicCheck = await pool.query(
                "SELECT id FROM topics WHERE course_id = $1 AND title = $2",
                [courseId, module.title]
            );

            if (topicCheck.rows.length === 0) {
                await pool.query(
                    `INSERT INTO topics 
                     (course_id, title, importance_level, first_principles, architectural_logic, forge_snippet)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [courseId, module.title, module.importance_level, module.first_principles, module.architectural_logic, module.forge_snippet]
                );
                console.log(`   + Injected: ${module.title}`);
            } else {
                await pool.query(
                    `UPDATE topics 
                     SET first_principles = $3, architectural_logic = $4, forge_snippet = $5, importance_level = $6
                     WHERE id = $1`,
                    [topicCheck.rows[0].id, courseId, module.first_principles, module.architectural_logic, module.forge_snippet, module.importance_level]
                );
                console.log(`   ~ Updated: ${module.title}`);
            }
        }

        console.log("✨ Scholar's Codex Injection Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ CRITICAL FAILURE:", err);
        process.exit(1);
    }
};

run();
