import pool from "../config/db.js";

const seedCybersecurity = async () => {
    try {
        console.log("Seeding Cybersecurity Modules...");

        // 1. Get Semester IDs (Map them logically)
        const getSemId = async (y, s) => {
            const res = await pool.query("SELECT id FROM semesters WHERE year_number=$1 AND semester_number=$2", [y, s]);
            return res.rows[0]?.id;
        };

        const y1s1 = await getSemId(1, 1);
        const y2s2 = await getSemId(2, 2);
        const y3s1 = await getSemId(3, 1);

        const cyberData = [
            {
                name: "Linux Administration",
                desc: "Foundation of server security and management.",
                sem: y1s1,
                topics: ["Shell Scripting", "User & Permission Management", "System Hardening"]
            },
            {
                name: "Computer Networking",
                desc: "Understanding the nervous system of the internet.",
                sem: y1s1,
                topics: ["TCP/IP Stack", "DNS & Routing protocols", "Packet Analysis"]
            },
            {
                name: "Network Security",
                desc: "Defending the perimeter.",
                sem: y2s2,
                topics: ["Firewall Configuration", "Intrusion Detection (IDS)", "VPN Architectures"]
            },
            {
                name: "Cryptography",
                desc: "The science of secrets.",
                sem: y2s2,
                topics: ["Symmetric vs Asymmetric", "Hashing & Digital Signatures", "SSL/TLS Handshake"]
            },
            {
                name: "Ethical Hacking",
                desc: "Offensive security techniques.",
                sem: y3s1,
                topics: ["Vulnerability Assessment", "Metasploit Fundamentals", "Web App Pentesting"]
            },
            {
                name: "Digital Forensics",
                desc: "Investigating digital crimes.",
                sem: y3s1,
                topics: ["Disk Imaging", "Memory Forensics", "Chain of Custody"]
            },
            {
                name: "Operating Systems",
                desc: "Architecture and Kernel security.",
                sem: y2s2,
                topics: ["Kernel Exploitation Basics", "Memory Management Security", "Process Isolation"]
            },
            {
                name: "Database Systems",
                desc: "Data integrity and storage security.",
                sem: y2s2,
                topics: ["SQL Injection Defense", "Database Hardening", "ACID Compliance"]
            }
        ];

        for (const data of cyberData) {
            // Check if course exists
            let courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE $1", [`%${data.name}%`]);
            let courseId;

            if (courseRes.rows.length === 0) {
                const newCourse = await pool.query(
                    "INSERT INTO courses (name, description, semester_id) VALUES ($1, $2, $3) RETURNING id",
                    [data.name, data.desc, data.sem]
                );
                courseId = newCourse.rows[0].id;
                console.log(`Created Course: ${data.name}`);
            } else {
                courseId = courseRes.rows[0].id;
                console.log(`Course Found: ${data.name}`);
            }

            // Seed Topics
            for (const topicName of data.topics) {
                const topicExists = await pool.query("SELECT id FROM topics WHERE title = $1 AND course_id = $2", [topicName, courseId]);
                if (topicExists.rows.length === 0) {
                    await pool.query("INSERT INTO topics (title, course_id) VALUES ($1, $2)", [topicName, courseId]);
                    console.log(`  Added Topic: ${topicName}`);
                }
            }
        }

        console.log("Cybersecurity seeding complete!");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await pool.end();
    }
};

seedCybersecurity();
