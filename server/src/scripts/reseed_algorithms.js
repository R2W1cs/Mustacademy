import pool from '../config/db.js';

const courseCode = 'CS 342';

const syllabusData = [
    {
        week: 1,
        title: "Foundations & Asymptotic Analysis",
        learning_objectives: [
            "Introduction to algorithms",
            "Math review (summations, limits, logarithms, proof techniques)",
            "Growth functions",
            "Asymptotic analysis and notation"
        ],
        pre_class: [
            "Chapter 1 & 2, CLRS",
            "Appendix A, CLRS - Summations (PDF)",
            "Math Review (PDF)",
            "Proof by Induction (Tutorial & examples)",
            "Sum of powers (derivations)",
            "Some logarithms identities (derivations)"
        ],
        lecture_notes: [
            "Introduction to Algorithms - Foundations & asymptotic analysis (PDF)",
            "Introduction to Algorithms - Foundations & asymptotic analysis (PPT)"
        ],
        tutorials: [
            "Tutorial 1A on asymptotic analysis (PDF)",
            "Tutorial 1B on asymptotic analysis (PDF)",
            "Tutorial 1C Solutions"
        ]
    },
    {
        week: 2,
        title: "Algorithm Analysis (Non-Recursive & Recursive)",
        learning_objectives: [
            "Develop an understanding of the general approach to algorithm complexity analysis",
            "Analyze the complexity of non-recursive algorithms",
            "Analyze the complexity of recursive algorithms by solving recurrence relations",
            "Apply Forward and Backward Substitution, Characteristic equations, and the Master Method"
        ],
        pre_class: [
            "Solving recurrence relations by forward substitution (Video)",
            "Solving recurrence relations by characteristic equations (Video)",
            "Appendix B (Levitin) - Recurrence Relations (PDF)",
            "Chapter 2 (Levitin)"
        ],
        lecture_notes: [
            "Algorithm analysis - non-recursive algorithms",
            "Algorithm analysis - recursive algorithms",
            "Interactive Board Log"
        ]
    },
    {
        week: 3,
        title: "Divide & Conquer Strategies",
        learning_objectives: [
            "Brute force strategies: examples and analysis",
            "Divide & conquer strategies: general approach",
            "Search, MergeSort, QuickSort, Closest points on a plane",
            "Analyzing complexity using substitution, recursion trees, and Master Theorem"
        ],
        pre_class: [
            "Introducing the Master Theorem (Video)",
            "Proof of the Master Theorem (Video)",
            "QuickSort in Java - using Divide and Conquer (Video)",
            "Efficient closest pair of points on a plane (Video)"
        ],
        lecture_notes: [
            "Divide & conquer strategy - part I - Examples and General approach",
            "Divide & conquer strategy - part II - Master Theorem",
            "Divide & conquer strategy - Part III - Quicksort & closest pair of points"
        ]
    },
    {
        week: 4,
        title: "Elementary Graph Algorithms - Graph Search",
        learning_objectives: [
            "Fundamental Concepts of Graph Theory (connectedness, cycles, trees, etc.)",
            "Implement and apply traversal algorithms: DFS and BFS",
            "Analyze Efficiency focusing on asymptotic time complexity",
            "Solve Practical Problems Using Graph-Based Models"
        ],
        pre_class: [
            "Graph Basics (Video)",
            "Representing Graphs (Video)",
            "Applications of Graph Search Algorithms",
            "Exploring Graphs - DFS",
            "BFS"
        ],
        lecture_notes: [
            "Graph Algorithms - Part I - Introduction to Graph Theory",
            "Graph Algorithms - Part II - Graph Search - BFS & DFS Algorithms"
        ]
    },
    {
        week: 5,
        title: "Graph Algorithms - MSTs & Shortest Paths",
        learning_objectives: [
            "Understand Concepts of Spanning Trees and Minimum Spanning Trees",
            "Apply Prim's Algorithm to find MST",
            "Apply Kruskal's Algorithm to find MST",
            "Implement and analyze Dijkstra's shortest path algorithm"
        ],
        pre_class: [
            "Minimum Spanning Trees",
            "Prim's Algorithm",
            "Kruskal's Algorithm"
        ],
        lecture_notes: [
            "Graph Algorithms - Part III - Minimum Spanning Trees - Prim's and Kruskal's algorithms",
            "Dijkstra's Shortest Path Algorithm"
        ]
    },
    {
        week: 6,
        title: "Dynamic Programming",
        learning_objectives: [
            "Demonstrate understanding of the dynamic programming approach",
            "Explain optimal substructure and overlapping subproblems",
            "Distinguish between DP and divide-and-conquer",
            "Apply DP to 0-1 knapsack and Fibonacci numbers"
        ],
        pre_class: [
            "Dynamic Programming Theory (Video)",
            "Knapsack DP Walkthrough (Video)"
        ],
        lecture_notes: [
            "Dynamic Programming - The 0-1 Knapsack problem & Fibonacci numbers",
            "Dynamic Programming - LIS & Min Coin Change"
        ]
    },
    {
        week: 7,
        title: "Complexity Classes, Reducibility & Decidability",
        learning_objectives: [
            "Complexity classes: P, NP, and EXP",
            "P =? NP",
            "Reducibility & Polynomial-time reductions",
            "NP-complete & NP-hard problems",
            "Formal Models of Computations & Decidability"
        ],
        pre_class: [
            "Solving 2SAT using Implication Graphs (Video)"
        ],
        lecture_notes: [
            "Complexity classes and P vs NP - Part I"
        ]
    }
];

async function reseed() {
    try {
        const courseRes = await pool.query("SELECT id FROM courses WHERE name LIKE $1", [`%${courseCode}%`]);
        if (courseRes.rows.length === 0) {
            console.error("Course not found");
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;

        // Clear existing topics for this course to re-seed cleanly
        await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

        for (const data of syllabusData) {
            await pool.query(
                `INSERT INTO topics 
         (course_id, title, learning_objectives, breadcrumb_path, structural_breakdown) 
         VALUES ($1, $2, $3, $4, $5)`,
                [
                    courseId,
                    data.title,
                    JSON.stringify(data.learning_objectives),
                    `CS 342 > Week ${data.week}`,
                    `PRE-CLASS: ${data.pre_class.join(', ')}\n\nLECTURES: ${data.lecture_notes.join(', ')}`
                ]
            );
            console.log(`Updated: ${data.title}`);
        }

        console.log("Syllabus enriched successfully.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reseed();
