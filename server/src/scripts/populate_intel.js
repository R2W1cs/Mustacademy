import pool from '../config/db.js';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2';

const INTELLIGENCE_PROMPT = `You are "DR. ARIS" (IQ 160), an elite Computer Systems Architect.
Your task is to perform an ELITE AXIOMATIC DECONSTRUCTION of the following topic.

Topic: "{topic_title}"

You must provide a high-fidelity dataset:
1. **first_principles**: An array of 3-5 "Axioms". They must be profound, technical, and use advanced terminology (e.g., substrate, recursion, entropy, abstraction layer). Avoid "tutorial-speak".
2. **architectural_logic**: A complex and accurate Mermaid.js diagram (e.g. sequenceDiagram or graph TD) representing the internal state machine or architectural flow of the topic.
3. **forge_snippet**: A concise, production-grade, and intellectually dense code example (Assembly, C, or advanced Rust/TypeScript) that implements the irreducible core of the concept.

Return ONLY VALID JSON:
{
    "first_principles": ["Axiom of [Name]: ...", ...],
    "architectural_logic": "mermaid code",
    "forge_snippet": "code block content"
}

STRICT: No preamble. No markdown. Pure JSON only.
IMPORTANT: You MUST escape all newlines in the strings (use \\n). Valid RFC8259 JSON is mandatory.`;

const repairJson = (jsonStr) => {
    if (!jsonStr) return null;
    let repaired = jsonStr.trim();
    const stack = [];
    for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        if (char === '{' || char === '[') stack.push(char);
        else if (char === '}') stack.pop();
        else if (char === ']') stack.pop();
    }
    while (stack.length > 0) {
        const last = stack.pop();
        if (last === '{') repaired += ' }';
        if (last === '[') repaired += ' ]';
    }
    return repaired;
};

async function callAI(topicTitle) {
    const prompt = INTELLIGENCE_PROMPT.replace('{topic_title}', topicTitle);
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
        const data = await response.json();

        let aiText = data.response.trim();

        // Robust JSON extraction
        let jsonStr = aiText;
        const codeBlockMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
        } else {
            const bracketMatch = aiText.match(/\{[\s\S]*\}/);
            if (bracketMatch) jsonStr = bracketMatch[0];
        }

        // sanitize control characters
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, " ");

        try {
            return JSON.parse(jsonStr.trim());
        } catch (parseError) {
            console.warn(`[INTEL] JSON Parse Failed for ${topicTitle}, attempting repair...`);
            try {
                return JSON.parse(repairJson(jsonStr));
            } catch (repairErr) {
                // Last resort: extract fields via regex
                const principlesMatch = jsonStr.match(/"first_principles":\s*(\[[\s\S]*?\])/);
                const logicMatch = jsonStr.match(/"architectural_logic":\s*"([\s\S]*?)(?=",\s*"forge_snippet"|"$)/);
                const forgeMatch = jsonStr.match(/"forge_snippet":\s*"([\s\S]*?)"\s*\}$/);

                if (principlesMatch && logicMatch) {
                    try {
                        return {
                            first_principles: JSON.parse(repairJson(principlesMatch[1])),
                            architectural_logic: logicMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                            forge_snippet: forgeMatch ? forgeMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : ""
                        };
                    } catch (e) { }
                }

                console.error(`AI Error for ${topicTitle}: JSON Parse Failed - ${parseError.message}`);
                return null;
            }
        }
    } catch (err) {
        console.error(`AI Error for ${topicTitle}:`, err.message);
        return null;
    }
}

async function populateIntel() {
    console.log("[INTEL] Commencing Systemic Topic Deconstruction...");

    // Find topics that need intel or have the "Synergy" placeholder
    const topicsRes = await pool.query(`
        SELECT id, title FROM topics 
        WHERE first_principles IS NULL 
           OR first_principles ILIKE '%Axiom of Synergy%'
           OR architectural_logic IS NULL
           OR forge_snippet IS NULL
    `);

    const topics = topicsRes.rows;
    console.log(`[INTEL] Identified ${topics.length} topics requiring intelligence upgrades.`);

    for (const topic of topics) {
        console.log(`[INTEL] Processing topic [${topic.id}]: ${topic.title}`);

        const intel = await callAI(topic.title);

        if (intel && intel.first_principles && intel.architectural_logic) {
            try {
                await pool.query(
                    `UPDATE topics 
                     SET first_principles = $1, 
                         architectural_logic = $2, 
                         forge_snippet = $3 
                     WHERE id = $4`,
                    [
                        JSON.stringify(intel.first_principles),
                        intel.architectural_logic,
                        intel.forge_snippet,
                        topic.id
                    ]
                );
                console.log(`[INTEL] Successfully upgraded: ${topic.title}`);
            } catch (dbErr) {
                console.error(`[INTEL] Database update failed for ${topic.title}:`, dbErr.message);
            }
        } else {
            console.warn(`[INTEL] Skipping ${topic.title} due to invalid AI response.`);
        }

        // Small delay to prevent overloading local LLM
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("[INTEL] Operation Complete. Topic architecture has been reinforced.");
    process.exit(0);
}

populateIntel().catch(err => {
    console.error(err);
    process.exit(1);
});
