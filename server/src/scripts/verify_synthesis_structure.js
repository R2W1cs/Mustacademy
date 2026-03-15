import pool from '../config/db.js';

async function verify() {
    console.log("Verifying structural integrity of latest synthesis...");
    try {
        const res = await pool.query(`
            SELECT title, content_markdown 
            FROM topics 
            WHERE content_markdown IS NOT NULL 
            ORDER BY updated_at DESC 
            LIMIT 1
        `);

        if (res.rows.length === 0) {
            console.log("No synthesized topics found yet.");
            process.exit(0);
        }

        const topic = res.rows[0];
        console.log(`\n--- TOPIC: ${topic.title} ---`);
        console.log("CONTENT PREVIEW (First 2000 chars):");
        console.log(topic.content_markdown.substring(0, 2000));
        console.log("\n--- END PREVIEW ---");

        // Checklist verification
        const checks = [
            { name: "2️⃣ Conceptual Overview", regex: /2️⃣[\s\S]*Conceptual Overview/ },
            { name: "3️⃣ Real-World Context", regex: /3️⃣[\s\S]*Real-World Context/ },
            { name: "Comparison Table", regex: /\|.*\|.*\|/ },
            { name: "4.1 / 4.2 Subsections", regex: /4\.[12]/ },
            { name: "❌ Misconception Marker", regex: /❌/ },
        ];

        console.log("\nStructural Audit:");
        checks.forEach(c => {
            const passed = c.regex.test(topic.content_markdown);
            console.log(`${passed ? '✅' : '❌'} ${c.name}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Verification FAILED:", err.message);
        process.exit(1);
    }
}

verify();
