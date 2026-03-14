import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const seedComplexity = async () => {
    try {
        console.log("Seeding Complexity Course Topics...");

        // Find the course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%CS 342%' OR name ILIKE '%Algorithms & Complexity%'");
        if (courseRes.rows.length === 0) {
            console.error("Course 'Algorithms & Complexity' not found!");
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;
        console.log(`Found Course ID: ${courseId}`);

        // Clear existing topics for this course
        await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

        const topics = [
            {
                title: "Introduction to algorithms. Motivation.",
                description: "Course overview, basic motivation and introduction to the study of algorithms.",
                week: 1,
                importance_level: "FUNDAMENTAL"
            },
            {
                title: "Mathematical foundations & asymptotics",
                description: "Math review (summations, limits, logarithms, induction). Growth functions. Asymptotic analysis.",
                week: 2,
                importance_level: "CORE"
            },
            {
                title: "Algorithm analysis",
                description: "Analysis of non-recursive algorithms. Analysis of recursive algorithms. Solving recurrence relations by forward and backward substitution and using characteristic equations.",
                week: 3,
                importance_level: "CORE"
            },
            {
                title: "Brute Force",
                description: "Selection Sort. Searching for duplicates. Closest pair of points.",
                week: 4,
                importance_level: "FUNDAMENTAL"
            },
            {
                title: "Divide & conquer: Basics",
                description: "Binary Search (1D array). Recursive Merge Sort. Searching a sorted 2D matrix.",
                week: 4,
                importance_level: "CORE"
            },
            {
                title: "Divide and Conquer: Advanced Analysis",
                description: "Using the Master method to solve recurrence relations. Proof of the Master Method. Recursion Trees. Quicksort.",
                week: 5,
                importance_level: "ADVANCED"
            },
            {
                title: "Divide and Conquer: QuickSort & Closest Pair",
                description: "Complexity of QuickSort. Closest pair of points on a plane using divide & conquer. Analysis.",
                week: 6,
                importance_level: "ADVANCED"
            },
            {
                title: "Graph Algorithms: Traversal",
                description: "Graph Algorithms: Representation, Breadth first search, Depth-first search.",
                week: 7,
                importance_level: "CORE"
            },
            {
                title: "Graph Algorithms: Minimum Spanning Trees (Intro)",
                description: "Graph Algorithms: Minimum Spanning Trees. Generic MST algorithm.",
                week: 9,
                importance_level: "CORE"
            },
            {
                title: "Graph Algorithms: Prim & Kruskal",
                description: "Graph Algorithms: MST’s: Prim’s algorithm. Kruskal’s Algorithm.",
                week: 10,
                importance_level: "ADVANCED"
            },
            {
                title: "Graph Algorithms: Shortest Path Algorithms",
                description: "Graph Algorithms: Shortest Path Algorithms.",
                week: 11,
                importance_level: "ADVANCED"
            },
            {
                title: "Dynamic programming",
                description: "Dynamic programming principles and applications.",
                week: 12,
                importance_level: "ADVANCED"
            },
            {
                title: "Complexity Classes",
                description: "Complexity: Tractability, Complexity classes, Reducibility, NP-completeness.",
                week: 13,
                importance_level: "MASTER"
            },
            {
                title: "Decidability & Final Review",
                description: "Decidability. Final Review of the course material.",
                week: 14,
                importance_level: "MASTER"
            }
        ];

        for (const t of topics) {
            await pool.query(
                `INSERT INTO topics 
                 (course_id, title, structural_breakdown, importance_level, 
                 estimated_time, learning_objectives, breadcrumb_path) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    courseId,
                    t.title,
                    t.description,
                    t.importance_level,
                    "120 Minutes",
                    JSON.stringify(["Analyze algorithms in order to determine their asymptotic complexity (CLO2)", "Design and implement algorithms to solve computational problems (CLO4)"]),
                    `CS 342 > Week ${t.week}`
                ]
            );
            console.log(`Added topic: ${t.title}`);
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedComplexity();
