
import pool from '../src/config/db.js';

const INJECT_DATA = {
    courseName: "CS 370: Human Computer Interaction",
    modules: [
        {
            title: "Interaction Design Fundamentals",
            importance_level: "critical",
            first_principles: JSON.stringify([
                "Mentor: What constitutes the boundary between human intent and machine execution?",
                "Student: The interface, or rather, the syntactic layer of interaction.",
                "Mentor: Precisely. Axiom 1: Visibility. If the state is opaque, the user is blind. The system must project its internal topology onto the sensory surface.",
                "Student: But too much visibility leads to cognitive noise.",
                "Mentor: Axiom 2: Constraints. We must bound the agent's agency to prevent state-space collapse. Direct the user's flow through logical and physical barriers.",
                "Axiom 3: Feedback. Every action must have an equal and perceptible reaction. The cybernetic loop must be closed within milliseconds."
            ]),
            architectural_logic: "graph TD\n    subgraph Human [The Human Cognitive Processor]\n        A[Goal] --> B[Intention]\n        B --> C[Action Sequence]\n    end\n    subgraph Machine [The Machine Syntactic Processor]\n        E[Display] --> F[Interpretation]\n        F --> G[Evaluation]\n    end\n    C -->|Interface| E\n    G -->|Feedback| A\n    style Human fill:#1e1b4b,stroke:#6366f1\n    style Machine fill:#0f172a,stroke:#4f46e5",
            forge_snippet: "// Cognitive Load Optimizer\nconst calculateHeuristicScore = (ui) => {\n  const visibility = ui.statusIsVisible ? 1.0 : 0.0;\n  const mapping = ui.naturalMapping ? 1.0 : 0.2;\n  const constraints = ui.preventErrors ? 1.0 : 0.0;\n  \n  return (visibility * 0.4) + (mapping * 0.3) + (constraints * 0.3);\n};"
        },
        {
            title: "User Research & Framing",
            importance_level: "high",
            first_principles: JSON.stringify([
                "Axiom 1: Radical Empathy. Transcending personal projection to perceive the user's authentic phenomenological experience.",
                "Axiom 2: Framing. The cognitive scaffolding that dictates how information is processed and interpreted.",
                "Student: Is research the search for truth or the search for utility?",
                "Mentor: In HCI, utility IS the truth. Axiom 3: Personas as Behavioral Models. Escaping demographic caricatures to focus on goal-oriented archetypes."
            ]),
            architectural_logic: "mindmap\n  root((User Research Architecture))\n    Qualitative Epistemology\n      Phenomenological Interviews\n      Ethnographic Observation\n      Contextual Inquiry\n    Quantitative Analysis\n      Statistical Significance\n      A-B Multivariate Testing\n      Eye-Tracking Heatmaps",
            forge_snippet: "// Behavioral Persona Simulator\nfunction simulateUser(persona, interface) {\n  const successRate = persona.expertise * interface.usabilityIndex;\n  return {\n    completed: successRate > 0.7,\n    timeOnTask: successRate < 0.5 ? 'Timeout' : (100 / successRate) + 's'\n  };\n}"
        },
        {
            title: "Ideation & Sketching",
            importance_level: "medium",
            first_principles: JSON.stringify([
                "Axiom 1: Ideational Variance. Maximizing the entropy of the design space before selecting for convergence.",
                "Axiom 2: The Sketch as Cognitive Tool. Externalizing thoughts through low-fidelity representations to facilitate reflective dialogue.",
                "Mentor: Why sketch when you can prototype?",
                "Student: To minimize the cost of being wrong."
            ]),
            architectural_logic: "graph LR\n    A[Problem Space] --> B((Divergence))\n    B --> C(Brainstorming)\n    C --> D(Sketching)\n    D --> E((Convergence))\n    E --> F{Selection}\n    F --> G[Design Solution]",
            forge_snippet: "// Ideational Entropy Calculator\nfunction calculateVariance(ideas) {\n  const uniqueThemes = new Set(ideas.map(i => i.theme));\n  return uniqueThemes.size / ideas.length;\n}"
        },
        {
            title: "Prototyping & Evaluation",
            importance_level: "medium",
            first_principles: JSON.stringify([
                "Axiom 1: Fidelity-Goal Isomorphism. Selecting the minimum viable representation to answer specific research hypotheses.",
                "Axiom 2: Heuristic Rigor. Systematic evaluation against formal usability principles to identify latent design flaws.",
                "Student: When is a prototype 'finished'?",
                "Mentor: When it reveals the truth about the user's struggle."
            ]),
            architectural_logic: "sequenceDiagram\n    participant U as User\n    participant P as Prototype\n    participant E as Evaluator\n    U->>P: Action (Mental Model Application)\n    P-->>U: State Feedback\n    U-->>E: Verbal Protocol (Thinking Aloud)\n    E->>E: Note Heuristic Violation",
            forge_snippet: "// Heuristic Compliance Checker\nconst NIELSEN_HEURISTICS = [\n  'Visibility of system status',\n  'Match between system and real world',\n  'User control and freedom',\n  'Consistency and standards'\n];\nfunction evaluate(ui) {\n  return NIELSEN_HEURISTICS.filter(h => ui.fails(h));\n}"
        }
    ]
};

const run = async () => {
    try {
        console.log("🚀 Starting Advanced Scholar's Codex Injection...");

        // 1. Find Course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name = $1", [INJECT_DATA.courseName]);
        if (courseRes.rows.length === 0) {
            console.error(`❌ Course '${INJECT_DATA.courseName}' not found!`);
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;

        // 2. Inject/Update Topics
        for (const module of INJECT_DATA.modules) {
            const topicCheck = await pool.query(
                "SELECT id FROM topics WHERE course_id = $1 AND title = $2",
                [courseId, module.title]
            );

            if (topicCheck.rows.length > 0) {
                await pool.query(
                    `UPDATE topics 
                     SET first_principles = $2, architectural_logic = $3, forge_snippet = $4, importance_level = $5
                     WHERE id = $1`,
                    [topicCheck.rows[0].id, module.first_principles, module.architectural_logic, module.forge_snippet, module.importance_level]
                );
                console.log(`   ~ Refined: ${module.title}`);
            } else {
                await pool.query(
                    `INSERT INTO topics 
                     (course_id, title, importance_level, first_principles, architectural_logic, forge_snippet)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [courseId, module.title, module.importance_level, module.first_principles, module.architectural_logic, module.forge_snippet]
                );
                console.log(`   + Injected: ${module.title}`);
            }
        }

        console.log("✨ Advanced Injection Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ CRITICAL FAILURE:", err);
        process.exit(1);
    }
};

run();
