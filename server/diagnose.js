
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
import Groq from 'groq-sdk';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function diagnose() {
    console.log("--- DIAGNOSTIC START ---");

    // 1. DB Connectivity
    try {
        const dbRes = await pool.query("SELECT NOW()");
        console.log("✅ DB Connected:", dbRes.rows[0].now);
    } catch (e) {
        console.error("❌ DB Connection Failed:", e.message);
    }

    // 2. Table Presence
    try {
        const tableRes = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'interview_sessions'");
        if (tableRes.rows.length > 0) {
            console.log("✅ Table 'interview_sessions' exists.");
            const schemaRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'interview_sessions'");
            schemaRes.rows.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));
        } else {
            console.error("❌ Table 'interview_sessions' MISSING!");
            console.log("   Checking all available tables...");
            const allTables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            allTables.rows.forEach(t => console.log(`   - Found table: ${t.table_name}`));
        }
    } catch (e) {
        console.error("❌ Table Check Failed:", e.message);
    }

    // 3. AI Keys
    console.log("AI Keys:");
    console.log("   - GROQ:", process.env.GROQ_API_KEY ? "Present (Starts with " + process.env.GROQ_API_KEY.substring(0, 5) + "...)" : "MISSING");
    console.log("   - GEMINI:", process.env.GEMINI_API_KEY ? "Present" : "MISSING");
    console.log("   - OLLAMA URL:", process.env.OLLAMA_URL || "Default localhost");

    // 4. Test Groq
    if (process.env.GROQ_API_KEY) {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            console.log("Attempting test Groq completion...");
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "hi" }],
                max_completion_tokens: 5
            });
            console.log("✅ Groq API Working:", completion.choices[0]?.message?.content);
        } catch (e) {
            console.error("❌ Groq API Failed:", e.message);
        }
    }

    console.log("--- DIAGNOSTIC END ---");
    process.exit();
}

diagnose();
