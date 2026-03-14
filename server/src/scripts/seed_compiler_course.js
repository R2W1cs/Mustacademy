import pool from "../config/db.js";

const seedCompilerCourse = async () => {
    try {
        console.log("🚀 Starting Elite Compiler Engineering Seeding...");

        // 1. Get/Create Semester (Year 4, Sem 1 for Elite status)
        let semRes = await pool.query("SELECT id FROM semesters WHERE year_number=4 AND semester_number=1");
        let semesterId;
        if (semRes.rows.length === 0) {
            semRes = await pool.query(
                "INSERT INTO semesters (year_number, semester_number) VALUES (4, 1) RETURNING id"
            );
            semesterId = semRes.rows[0].id;
        } else {
            semesterId = semRes.rows[0].id;
        }

        // 2. Create Course
        const courseName = "Elite Compiler Engineering & Language Design";
        const courseDesc = "A master-level course on building production-grade compilers, virtual machines, and runtime systems. From Lexing to LLVM.";

        let courseRes = await pool.query("SELECT id FROM courses WHERE name=$1", [courseName]);
        let courseId;
        if (courseRes.rows.length === 0) {
            courseRes = await pool.query(
                "INSERT INTO courses (name, description, semester_id) VALUES ($1, $2, $3) RETURNING id",
                [courseName, courseDesc, semesterId]
            );
            courseId = courseRes.rows[0].id;
            console.log(`✅ Created Course: ${courseName}`);
        } else {
            courseId = courseRes.rows[0].id;
            console.log(`ℹ️ Course already exists: ${courseName}`);
        }

        // 3. Define Topics
        const topics = [
            {
                title: "Lexical Analysis: The Aperture",
                importance: "Essential",
                easy: "# Lexical Analysis\n\nLexing is the process of turning strings of code into 'tokens'. Think of it like breaking a sentence into words.\n\n- **Regex**: Defines the patterns.\n- **Tokens**: The atomic units (Keywords, IDs, Symbols).",
                deep: "# Formal Automata & Buffering\n\nDeep dive into **Deterministic Finite Automata (DFA)** construction via Thompson's algorithm and subset construction. We cover high-performance buffering using **Double Buffers** and SIMD-accelerated scanning for production-grade speed."
            },
            {
                title: "Recursive Descent & Pratt Parsing",
                importance: "Essential",
                easy: "# Parsing\n\nParsing builds a tree (AST) from tokens. We use 'Pratt Parsing' to handle operator precedence (like 1 + 2 * 3) without complex grammar files.",
                deep: "# Advanced Operator Precedence\n\nImplementing **Pratt Parsing** for complex expressions. Handling associativity, prefix/infix/postfix handlers, and error recovery in LL(k) grammars. We analyze the time complexity of recursive descent vs table-driven LR parsers."
            },
            {
                title: "Semantic Analysis & Symbol Tables",
                importance: "Essential",
                easy: "# Symbol Management\n\nBefore running code, we must ensure variables are defined and types match. The **Symbol Table** tracks scope (local vs global).",
                deep: "# Scoping & Late Binding\n\nFormal semantics of block scoping. Implementing **Nested Symbol Tables** and handling 'Variable Shadowing'. We explore 'Closure Conversion' and how lexical scope is maintained across asynchronous boundaries."
            },
            {
                title: "Type Theory & Inference",
                importance: "Advanced",
                easy: "# Type Systems\n\nEnsuring that you don't add a string and a number. Static vs Dynamic typing.",
                deep: "# Hindley-Milner Type Inference\n\nImplementing the **Algorithm W** for type inference. We cover parametric polymorphism, unification algorithms, and variance (co-variance vs contra-variance) in complex type hierarchies."
            },
            {
                title: "Intermediate Representation (IR) & SSA",
                importance: "Advanced",
                easy: "# Bytecode & IR\n\nCompilers don't jump straight to machine code. They use an Intermediate Representation (IR). We'll build a 'Stack Machine' bytecode.",
                deep: "# Static Single Assignment (SSA)\n\nTransforming code into **SSA Form**. Every variable is assigned exactly once. This allows for powerful data-flow optimizations like GVN (Global Value Numbering) and SCCP."
            },
            {
                title: "Virtual Machine Architecture",
                importance: "Critical",
                easy: "# The Virtual Machine\n\nBuilding a program that runs our bytecode. The 'heart' of languages like Java, Python, and C#.",
                deep: "# Dispatch & JIT Internals\n\nHigh-performance VM design. **Computed Gotos**, Threaded Code, and 'Inline Caching'. Introduction to **Just-In-Time (JIT)** compilation using templates and basic hot-spot detection."
            },
            {
                title: "Memory Management: Garbage Collection",
                importance: "Advanced",
                easy: "# Memory & GC\n\nAutomatically cleaning up memory that is no longer used. mark-and-sweep is the classic algorithm.",
                deep: "# Generational & Concurrent GC\n\nImplementing the **Mark-and-Sweep** collector. Advanced topics: **Baker's Treadmill**, Tri-color marking, and the 'Strum' (Stop-The-World) vs Concurrent collection trade-offs."
            },
            {
                title: "Compiler Optimizations",
                importance: "Advanced",
                easy: "# Making Code Fast\n\nTechniques like 'Constant Folding' (changing 1+2 to 3) and 'Dead Code Elimination'.",
                deep: "# Data-Flow Analysis\n\nImplementing **Reaching Definitions** and **Live Variable Analysis**. We explore Register Allocation via **Graph Coloring (Chaitin's Algorithm)** and loop optimizations like unrolling and vectorization."
            }
        ];

        // 4. Inject Topics
        for (const [idx, t] of topics.entries()) {
            const checkTopic = await pool.query("SELECT id FROM topics WHERE title=$1 AND course_id=$2", [t.title, courseId]);
            if (checkTopic.rows.length === 0) {
                await pool.query(
                    `INSERT INTO topics 
                    (course_id, title, importance_level, content_easy_markdown, content_deep_markdown) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [courseId, t.title, t.importance, t.easy, t.deep]
                );
                console.log(`✅ Injected Topic: ${t.title}`);
            } else {
                console.log(`ℹ️ Topic already exists: ${t.title}`);
            }
        }

        console.log("🚀 Elite Seeding Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding FAILED:", err);
        process.exit(1);
    }
};

seedCompilerCourse();
