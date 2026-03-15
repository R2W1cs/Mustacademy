import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const topics = [
    "What a computer system is (hardware + software)",
    "Computer system layers",
    "Hardware vs software",
    "CPU basics",
    "ALU",
    "Control Unit",
    "Registers",
    "System bus",
    "Input devices",
    "Output devices",
    "Primary memory (RAM)",
    "Secondary storage (HDD, SSD)",
    "Memory hierarchy",
    "Volatile vs non-volatile memory",
    "Bit, byte, word",
    "Binary representation",
    "Number systems (binary, decimal, hex)",
    "Instruction cycle",
    "Fetch–Decode–Execute cycle",
    "Machine instructions",
    "Assembly vs high-level languages",
    "Operating System role",
    "Kernel",
    "System calls",
    "Process concept",
    "Program vs process",
    "Process states",
    "Threads (intro)",
    "Context switching",
    "CPU scheduling (basic idea)",
    "Interrupts",
    "I/O management",
    "Booting process",
    "Firmware (BIOS / UEFI)",
    "Virtual memory (intro)",
    "Stack vs heap (intro)",
    "Performance basics (CPU, memory, I/O)",
    "Computer architecture vs computer organization"
];

async function seed() {
    try {
        console.log("Seeding CS 161 Topics...");

        // Find CS 161 Course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name LIKE '%CS 161%' LIMIT 1");
        if (courseRes.rows.length === 0) {
            throw new Error("Course CS 161 not found. Run seed_curriculum.js first.");
        }
        const courseId = courseRes.rows[0].id;

        // Clear existing topics for this course to avoid duplicates
        await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

        for (let i = 0; i < topics.length; i++) {
            const title = topics[i];
            const importance = (i < 10) ? 'Essential' : (i < 30) ? 'Advanced' : 'Expert';

            // Generate some dummy content placeholder for now
            // The Professor AI will generate the real content on the fly or we can pre-populate
            const first_principles = JSON.stringify([
                `Fundamental axiom of ${title}`,
                `Layer of abstraction for ${title}`,
                `Physical realization of ${title}`
            ]);

            await pool.query(
                "INSERT INTO topics (title, course_id, importance_level, first_principles, architectural_logic, forge_snippet) VALUES ($1, $2, $3, $4, $5, $6)",
                [title, courseId, importance, first_principles, "graph TD\n  A[Core] -- Flow --> B[Mechanism]", "// High-IQ Implementation pending"]
            );
            console.log(`Synced: ${title}`);
        }

        console.log("CS 161 Seeding Complete.");
    } catch (err) {
        console.error("Seeding CS 161 failed:", err);
    } finally {
        await pool.end();
    }
}

seed();
