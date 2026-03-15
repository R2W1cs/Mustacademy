import 'dotenv/config';
import pool from '../config/db.js';
import fs from 'fs';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const PROGRESS_FILE = 'synthesis_progress.json';
const LOG_FILE = 'synthesis_log.txt';

const log = (msg) => {
    const text = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(LOG_FILE, text);
};

// Sanitize llama3.2's quirky JSON outputs (backtick strings, unescaped newlines)
function sanitizeOllamaJson(raw) {
    if (!raw) return null;

    let text = raw.trim();

    // Remove markdown code fences if present
    text = text.replace(/^```(?:json)?\n?/im, '').replace(/\n?```$/m, '').trim();

    // Replace backtick-delimited strings with double-quoted strings
    // Pattern: key: `value` -> key: "value"
    text = text.replace(/:\s*`([\s\S]*?)`/g, (match, inner) => {
        const escaped = inner
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '')
            .replace(/\t/g, '\\t');
        return `: "${escaped}"`;
    });

    // Fix bare unescaped newlines inside already-quoted strings
    // (between opening " and closing " that span multiple lines)
    text = text.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, inner) => {
        const fixed = inner.replace(/\n/g, '\\n').replace(/\r/g, '');
        return `"${fixed}"`;
    });

    return text;
}

// Call Ollama with native JSON mode - most reliable approach
async function callOllama(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 min timeout

    try {
        const res = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                format: 'json',  // Forces Ollama to output valid JSON
                options: {
                    temperature: 0.4,
                    num_predict: 4096
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

        const data = await res.json();
        const text = data.response;
        if (!text) throw new Error('Empty response from Ollama');

        // Try direct parse first
        try {
            return JSON.parse(text);
        } catch {
            // Try sanitizing then parsing
            const sanitized = sanitizeOllamaJson(text);
            try {
                return JSON.parse(sanitized);
            } catch (e2) {
                // Last resort: extract the JSON block manually
                const startIdx = sanitized.indexOf('{');
                const endIdx = sanitized.lastIndexOf('}');
                if (startIdx !== -1 && endIdx > startIdx) {
                    return JSON.parse(sanitized.substring(startIdx, endIdx + 1));
                }
                throw new Error(`Could not parse JSON: ${e2.message}`);
            }
        }
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

function buildTheoryPrompt(topicTitle, courseName) {
    return `You are a CS professor. Write a structured lesson on "${topicTitle}" for the course "${courseName}".

Return a JSON object with these exact fields:

{
  "content_markdown": "## 1️⃣ Topic Header\\n**Topic:** ${topicTitle}\\n**Course:** ${courseName}\\n**Level:** Intermediate\\n\\n## 2️⃣ Conceptual Overview\\n[3-4 sentences defining the key concepts. Use → for associations.]\\n\\n## 3️⃣ Real-World Context\\nImagine a [company/scenario].\\n- When [action] → [concept] handles it\\n- When [action2] → [concept2] handles it\\n\\nReal companies:\\n- [Company 1] uses [tech] for [purpose]\\n- [Company 2] uses [tech] for [purpose]\\n\\n## 4️⃣ Core Concepts\\n### 4.1 [First Concept]\\nCharacteristics:\\n- [detail 1]\\n- [detail 2]\\n- [detail 3]\\n\\nDesign goal: [goal]\\n\\n### 4.2 [Second Concept or Architecture]\\nCharacteristics:\\n- [detail 1]\\n- [detail 2]\\n\\nDesign goal: [goal]\\n\\n## 5️⃣ Comparison Table\\n| Feature | [Option A] | [Option B] |\\n|---------|-----------|-----------|\\n| Purpose | ... | ... |\\n| Data | ... | ... |\\n| Users | ... | ... |\\n| Example | ... | ... |\\n\\n## 6️⃣ Deep Conceptual Insight\\n**Why [concept] works this way?**\\n- [reason 1]\\n- [reason 2]\\n\\nThis is the key intellectual understanding.\\n\\n## 7️⃣ System Flow\\nData flows like this:\\n1. [Step 1]\\n2. [Step 2]\\n3. [Step 3]\\n\\nTools used: [Tool 1], [Tool 2]\\n\\n## 8️⃣ Common Misconceptions\\n❌ [Myth 1] → [Correction]\\n❌ [Myth 2] → [Correction]\\n❌ [Myth 3] → [Correction]\\n\\nStudents must unlearn these.\\n\\n## 9️⃣ Industry Perspective\\nModern systems use: [tech 1], [tech 2]\\nTrend: [key trend]\\n\\n## 🔟 Case Study\\n**Scenario:** [realistic scenario for ${topicTitle}]\\n\\nCorrect solution:\\n- [component 1]\\n- [component 2]\\n\\nIf a student can architect this → they understand the topic.\\n\\n## 1️⃣1️⃣ Interview Questions\\n1. [conceptual question]\\n2. [practical question]\\n3. [design question]\\n4. [comparison question]\\n\\n## 1️⃣2️⃣ Summary\\n[Concept A] = [short analogy]\\n[Concept B] = [short analogy]\\n\\nThe mistake beginners make: [common misunderstanding]",
  "breadcrumb_path": "${courseName} > ${topicTitle}",
  "difficulty": "Intermediate",
  "estimated_time": "45 min",
  "learning_objectives": ["understand the core concepts of ${topicTitle}", "apply knowledge to real systems"],
  "historical_context": "Brief history of how ${topicTitle} emerged in computer science.",
  "staff_engineer_note": "Senior engineer insight about ${topicTitle} in production systems."
}

CRITICAL: Fill in ALL placeholder text [like this] with real, specific content about "${topicTitle}". Return valid JSON only.`;
}

function buildProgrammingPrompt(topicTitle, courseName) {
    const lang = courseName.match(/java|python|c\+\+|javascript|js|react|node/i)?.[0] || 'code';
    return `You are a programming professor. Write a structured lesson on "${topicTitle}" in ${lang} for "${courseName}".

Return a JSON object with these exact fields:

{
  "content_markdown": "## 1️⃣ Topic Header\\n**Topic:** ${topicTitle}\\n**Language:** ${lang}\\n**Level:** Intermediate\\n\\n## 2️⃣ Concept Definition\\n[What is ${topicTitle}?] → [core purpose]\\nWhy it exists: [problem it solves]\\n\\n## 3️⃣ Mental Model\\nThink of ${topicTitle} like [real-world analogy].\\n[2-3 sentences expanding on the analogy]\\n\\n## 4️⃣ Syntax\\n\`\`\`${lang}\\n[basic syntax example]\\n\`\`\`\\n- [Part 1]: [meaning]\\n- [Part 2]: [meaning]\\n\\n## 5️⃣ Basic Example\\n\`\`\`${lang}\\n[minimal working code]\\n\`\`\`\\nLine-by-line: [explanation of each line]\\n\\n## 6️⃣ Intermediate Example\\n\`\`\`${lang}\\n[realistic use case code]\\n\`\`\`\\n[What this demonstrates]\\n\\n## 7️⃣ Internal Mechanism\\n[How ${topicTitle} works under the hood]\\nDesign goal: Performance + Predictability\\n\\n## 8️⃣ Common Mistakes\\n❌ [Mistake 1] → [Fix]\\n❌ [Mistake 2] → [Fix]\\n❌ [Mistake 3] → [Fix]\\n\\n## 9️⃣ Best Practices\\n- [Practice 1]\\n- [Practice 2]\\n- [Practice 3]\\n\\n## 🔟 Real-World Usage\\n- [Framework 1]: [use case]\\n- [Framework 2]: [use case]\\n\\n## 1️⃣1️⃣ Edge Cases\\n- [Edge case 1]: [handling]\\n- [Edge case 2]: [handling]\\n\\n## 1️⃣2️⃣ Mini Case Scenario\\n**Scenario:** [small practical problem]\\n\`\`\`${lang}\\n[solution code]\\n\`\`\`\\n\\n## 1️⃣3️⃣ Interview Questions\\n1. [conceptual question]\\n2. [code/practical question]\\n3. [performance question]\\n4. [design question]",
  "breadcrumb_path": "${courseName} > ${topicTitle}",
  "difficulty": "Intermediate",
  "estimated_time": "45 min",
  "learning_objectives": ["understand ${topicTitle} in ${lang}", "write correct and idiomatic ${lang} code"],
  "historical_context": "Brief history of ${topicTitle} in ${lang} development.",
  "staff_engineer_note": "Senior engineer tip about ${topicTitle} in production ${lang} code."
}

CRITICAL: Fill ALL placeholders [like this] with specific, correct ${lang} content about "${topicTitle}". Include real working code examples. Return valid JSON only.`;
}

async function massPopulate() {
    console.log("🚀 Starting static content generation with Ollama...");
    console.log(`Using model: ${OLLAMA_MODEL} at ${OLLAMA_URL}`);

    const topicsRes = await pool.query(`
        SELECT t.id, t.title, c.name as course_name 
        FROM topics t
        JOIN courses c ON t.course_id = c.id
        WHERE t.content_markdown IS NULL
        ORDER BY t.id ASC
    `);

    const topics = topicsRes.rows;
    console.log(`📋 Found ${topics.length} topics without content.`);

    if (topics.length === 0) {
        console.log("✅ All topics already have content!");
        process.exit(0);
    }

    let progress = { total: topics.length, completed: 0, current_topic: '' };
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        console.log(`\n[${i + 1}/${topics.length}] "${topic.title}" | ${topic.course_name}`);

        progress.completed = i;
        progress.current_topic = topic.title;
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

        try {
            const isProgramming = /java|python|c\+\+|js|javascript|web|react|node|programming|frontend|backend/i.test(topic.course_name);
            const prompt = isProgramming
                ? buildProgrammingPrompt(topic.title, topic.course_name)
                : buildTheoryPrompt(topic.title, topic.course_name);

            console.log(`  [${isProgramming ? 'PROG' : 'THEORY'}] Calling Ollama...`);

            const aiData = await callOllama(prompt);

            if (!aiData || !aiData.content_markdown) {
                log(`⚠️ SKIP: "${topic.title}" — no content_markdown in response`);
                errorCount++;
                continue;
            }

            await pool.query(`
                UPDATE topics 
                SET 
                    content_markdown = $1,
                    breadcrumb_path = COALESCE($2, breadcrumb_path),
                    difficulty = COALESCE($3, difficulty),
                    estimated_time = COALESCE($4, estimated_time),
                    learning_objectives = COALESCE($5::jsonb, learning_objectives),
                    historical_context = COALESCE($6, historical_context),
                    staff_engineer_note = COALESCE($7, staff_engineer_note),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
            `, [
                aiData.content_markdown,
                aiData.breadcrumb_path || null,
                aiData.difficulty || null,
                aiData.estimated_time || null,
                aiData.learning_objectives?.length ? JSON.stringify(aiData.learning_objectives) : null,
                aiData.historical_context || null,
                aiData.staff_engineer_note || null,
                topic.id
            ]);

            log(`✨ SUCCESS: "${topic.title}" (ID: ${topic.id})`);
            successCount++;

            // Small delay to avoid overloading Ollama
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            log(`💥 ERROR: "${topic.title}" — ${err.message}`);
            errorCount++;
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    progress.completed = topics.length;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    console.log(`\n🏆 DONE. Success: ${successCount} | Errors: ${errorCount}`);
    process.exit(0);
}

massPopulate().catch(e => {
    console.error("FATAL:", e);
    process.exit(1);
});
