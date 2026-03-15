import pool from "../config/db.js";

const seedData = async () => {
    try {
        console.log("Seeding data...");

        // 1. Ensure Semesters Exist
        const semesters = [

        ];

        // Helper to get or create semester
        const getSemesterId = async (y, s) => {
            let res = await pool.query("SELECT id FROM semesters WHERE year_number=$1 AND semester_number=$2", [y, s]);
            if (res.rows.length === 0) {
                res = await pool.query(
                    "INSERT INTO semesters (year_number, semester_number) VALUES ($1, $2) RETURNING id",
                    [y, s]
                );
                console.log(`Created Semester Y${y}S${s}`);
            }
            return res.rows[0].id;
        };

        const COURSES = [
            // Year 1 Sem 1
            { y: 1, s: 1, name: "Introduction to Programming", description: "Learn Python basics." },
            { y: 1, s: 1, name: "Calculus I", description: "Limits and derivatives." },
            // Year 1 Sem 2
            { y: 1, s: 2, name: "Data Structures", description: "Arrays, lists, trees." },
            { y: 1, s: 2, name: "Discrete Math", description: "Logic and sets." },
            // Year 2 Sem 1
            { y: 2, s: 1, name: "Algorithms", description: "Sorting, searching, complexity." },
            { y: 2, s: 1, name: "Computer Architecture", description: "CPU, memory, assembly." },
            // Year 2 Sem 2 (The user's likely case)
            { y: 2, s: 2, name: "Operating Systems", description: "Processes, threads, concurrency." },
            { y: 2, s: 2, name: "Database Systems", description: "SQL, normalization, indexing." },
            { y: 2, s: 2, name: "Software Engineering", description: "Agile, design patterns." },
            // Year 3 Sem 1
            { y: 3, s: 1, name: "Web Development", description: "Full stack basics." },
            { y: 3, s: 1, name: "Computer Networks", description: "TCP/IP, HTTP." },
            // Year 3 Sem 2
            { y: 3, s: 2, name: "Artificial Intelligence", description: "Search, ML basics." },
            { y: 3, s: 2, name: "Cloud Computing", description: "AWS, Docker, Kubernetes." },
        ];

        for (const c of COURSES) {
            const semId = await getSemesterId(c.y, c.s);

            // Check if course exists
            const existing = await pool.query("SELECT id FROM courses WHERE name=$1", [c.name]);
            if (existing.rows.length === 0) {
                await pool.query(
                    "INSERT INTO courses (name, description, semester_id) VALUES ($1, $2, $3)",
                    [c.name, c.description, semId]
                );
                console.log(`Created Course: ${c.name}`);
            }
        }

        console.log("Seeding complete!");

    } catch (err) {
        console.error("Seeding failed", err);
    } finally {
        await pool.end();
    }
};

seedData();
