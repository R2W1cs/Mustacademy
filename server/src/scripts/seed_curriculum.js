import pool from "../config/db.js";

const seedData = async () => {
    try {
        console.log("Starting Curriculum Seeding...");

        // Helper to get/create semester
        const getSemesterId = async (y, s) => {
            let res = await pool.query("SELECT id FROM semesters WHERE year_number=$1 AND semester_number=$2", [y, s]);
            if (res.rows.length === 0) {
                res = await pool.query("INSERT INTO semesters (year_number, semester_number) VALUES ($1, $2) RETURNING id", [y, s]);
            }
            return res.rows[0].id;
        };

        // Helper to seed a semester
        const seedSemester = async (year, sem, courses) => {
            console.log(`\n--- Seeding Year ${year} Semester ${sem} ---`);
            const semId = await getSemesterId(year, sem);

            // Clear existing
            await pool.query("DELETE FROM courses WHERE semester_id = $1", [semId]);

            for (const c of courses) {
                if (!c.code || !c.title) {
                    console.error("Missing code or title for course", c);
                    continue;
                }
                const fullName = `${c.code}: ${c.title}`;
                const description = `Credits: ${c.credits}`;
                await pool.query(
                    "INSERT INTO courses (name, description, semester_id) VALUES ($1, $2, $3)",
                    [fullName, description, semId]
                );
                console.log(`Added: ${fullName}`);
            }
        };

        // Y1S1
        await seedSemester(1, 1, [
            { code: "MATH 111", title: "Math I", credits: 6 },
            { code: "CS 121", title: "Programming I", credits: 7 },
            { code: "CS 161", title: "Introduction to computer systems", credits: 7 },
            { code: "CSE 123", title: "Introduction to Digital Systems", credits: 6 },
            { code: "ENG 101", title: "Academic English", credits: 4 },
            { code: "ISS 166", title: "Freshman Seminar", credits: 2 },
        ]);

        // Y1S2
        await seedSemester(1, 2, [
            { code: "MATH 112", title: "Math II", credits: 6 },
            { code: "CS 141", title: "Data structures & algorithms", credits: 7 },
            { code: "CS 203", title: "Introduction to operating systems", credits: 7 },
            { code: "CS 231", title: "Introduction to databases", credits: 4 },
            { code: "ENG 121", title: "English composition", credits: 6 },
            { code: "COM 131", title: "Public Speaking Seminar", credits: 2 },
        ]);

        // Y2S1
        await seedSemester(2, 1, [
            { code: "MATH 270", title: "Probability & statistics", credits: 4 },
            { code: "CS 342", title: "Algorithms & Complexity", credits: 4 },
            { code: "CS 328", title: "OO Software design & construction", credits: 7 },
            { code: "CS 411", title: "Computer Networks", credits: 5 },
            { code: "COM 225", title: "Business & Technical Communication", credits: 4 },
            { code: "CS 321", title: "Principles of software engineering", credits: 6 },
        ]);

        // Y2S2
        await seedSemester(2, 2, [
            { code: "CS 336", title: "Data warehousing & management", credits: 4 },
            { code: "CS 425", title: "Web application development", credits: 5 },
            { code: "CS 428", title: "Software Testing & quality assurance", credits: 5 },
            { code: "CS 481", title: "Artificial intelligence", credits: 4 },
            { code: "PHIL 222", title: "Contemporary Issues in Data Ethics", credits: 6 },
            { code: "CS 370", title: "Human Computer Interaction", credits: 6 },
        ]);

        // Y3S1 (Semester 5)
        await seedSemester(3, 1, [
            { code: "CS 455", title: "Cloud computing", credits: 5 },
            { code: "CS 426", title: "Mobile application development", credits: 5 },
            { code: "CS 412", title: "Computer security", credits: 4 },
            { code: "CS 423", title: "Software architecture & design patterns", credits: 4 },
            { code: "CS 488", title: "Applied AI for Software Engineers", credits: 6 },
            { code: "MGMT 322", title: "Project management", credits: 6 },
        ]);

        console.log("\nSeeding Complete!");
    } catch (err) {
        console.error("Seeding failed", err);
    } finally {
        await pool.end();
    }
};

seedData();
