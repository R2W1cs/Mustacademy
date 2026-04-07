import 'dotenv/config';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

import Groq from "groq-sdk";
export const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY, timeout: 20000, maxRetries: 0 }) : null;

console.log(`[AI Setup] Ollama URL: ${OLLAMA_URL}`);
console.log(`[AI Setup] Gemini Key present: ${!!GEMINI_API_KEY}`);
console.log(`[AI Setup] Groq Key present: ${!!GROQ_API_KEY} (${GROQ_API_KEY ? GROQ_API_KEY.substring(0, 10) + "..." : "NONE"})`);

const MOCK_FALLBACKS = {
    mentor: [
        "That's an excellent question. Based on the current syllabus, I'd suggest focusing on the core data structures first.",
        "Interesting angle. In computer science, we often trade space for time. How might that apply here?"
    ],
    companion: [
        "I'm feeling great today! How is your energy level? Don't forget to hydrate!",
        "Success is a habit, not an act. You're doing great, keep pushing!"
    ]
};

const getMockResponse = (type) => {
    const responses = MOCK_FALLBACKS[type] || MOCK_FALLBACKS.mentor;
    return responses[Math.floor(Math.random() * responses.length)];
};

export const repairJson = (jsonStr) => {
    if (!jsonStr) return null;
    let repaired = jsonStr.trim();

    // 0. Remove markdown code block markers if present
    repaired = repaired.replace(/```(?:json)?/g, '').trim();

    // 1. Remove trailing commas in arrays/objects
    repaired = repaired.replace(/,\s*([\]}])/g, '$1');

    // 2. Fix unquoted property names
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

    // 3. Auto-close JSON
    const stack = [];
    for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        if (char === '{' || char === '[') stack.push(char);
        else if (char === '}') {
            if (stack[stack.length - 1] === '{') stack.pop();
        }
        else if (char === ']') {
            if (stack[stack.length - 1] === '[') stack.pop();
        }
    }

    while (stack.length > 0) {
        const last = stack.pop();
        if (last === '{') repaired += ' }';
        if (last === '[') repaired += ' ]';
    }

    return repaired;
};

export const callGroq = async (prompt, expectJson = true, model = "llama-3.3-70b-versatile", maxTokens = 2048) => {
    if (!groq) throw new Error("GROQ_API_KEY missing from environment");

    // Build messages array — supports string, { system, user }, or raw messages[]
    let messages;
    if (Array.isArray(prompt)) {
        messages = prompt;
    } else if (prompt && typeof prompt === 'object' && prompt.system && prompt.user) {
        messages = [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
        ];
    } else {
        messages = [{ role: 'user', content: prompt }];
    }

    console.log(`[AI Groq] Attempting reasoning via ${model} (expectJson=${expectJson}, maxTokens=${maxTokens})...`);
    try {
        const payload = {
            model: model,
            messages,
            temperature: 0.7,
            max_completion_tokens: maxTokens,
            top_p: 1
        };

        if (expectJson) {
            payload.response_format = { type: "json_object" };
        }

        const completion = await groq.chat.completions.create(payload);

        const aiText = completion.choices[0]?.message?.content;
        if (!aiText) throw new Error("Groq returned empty response");

        if (!expectJson) return aiText;

        try {
            return JSON.parse(aiText);
        } catch (e) {
            console.warn("[AI Groq] JSON Parse Failed, attempting Repair:", e.message);
            return parseAiJson(aiText);
        }
    } catch (err) {
        console.error("[AI Groq] Fatal Error:", err.message);
        if (err.message.includes("401") || err.message.includes("API key")) {
            console.error("[AI Groq] Authentication failure. Verification of GROQ_API_KEY recommended.");
        }
        throw err;
    }
};

export const streamAI = async (prompt, model = "llama-3.3-70b-versatile", maxTokens = 4096) => {
    // Build messages array — same overload support as callGroq
    let messages;
    if (Array.isArray(prompt)) {
        messages = prompt;
    } else if (prompt && typeof prompt === 'object' && prompt.system && prompt.user) {
        messages = [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
        ];
    } else {
        messages = [{ role: 'user', content: prompt }];
    }

    // 1. Try Groq first
    if (process.env.GROQ_API_KEY && groq) {
        try {
            console.log(`[AI Groq] Initiating stream via ${model} (maxTokens=${maxTokens})...`);
            const stream = await groq.chat.completions.create({
                model: model,
                messages,
                temperature: 1,
                max_completion_tokens: maxTokens,
                top_p: 1,
                stream: true,
            });
            return stream;
        } catch (err) {
            console.warn("[AI Groq Stream] Failed, falling back to Gemini:", err.message);
        }
    }

    // 2. Fallback to Gemini (Simulated Stream)
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log("[AI Gemini Stream] Groq failed, simulating text-to-stream via Gemini...");
            const fullResponseText = await callGemini(prompt, false);
            
            return (async function* () {
                const words = fullResponseText.split(' ');
                for (let i = 0; i < words.length; i += 3) {
                    const chunk = words.slice(i, i + 3).join(' ') + ' ';
                    yield { choices: [{ delta: { content: chunk } }] };
                    await new Promise(r => setTimeout(r, 20)); // Simulated stream tick
                }
            })();
        } catch (err) {
            console.warn("[AI Gemini Stream] Fallback failed:", err.message);
        }
    }

    // 3. Fallback to Ollama stream
    try {
        console.log("[AI Ollama Stream] Cloud channels failed, initiating local stream...");
        return await streamOllama(prompt);
    } catch (err) {
        console.warn("[AI Stream] Critical failure on all nodes. Deploying Mock Stream.");

        const mockReply = getMockResponse('mentor');
        return (async function* () {
            const words = `⚠️ [EMERGENCY PROTOCOL ACTIVE] ${mockReply}`.split(' ');
            for (const word of words) {
                yield {
                    choices: [{
                        delta: { content: word + ' ' }
                    }]
                };
                await new Promise(r => setTimeout(r, 50));
            }
        })();
    }
};

export const streamOllama = async (prompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s aggressive TTL

    let response;
    try {
        response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: true
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(`Ollama Stream Connectivity Error: ${e.message}`);
    }

    if (!response.ok) throw new Error(`Ollama Stream Error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Create an async generator that matches expected OpenAI/Groq stream structure
    return (async function* () {
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.response) {
                            yield {
                                choices: [{
                                    delta: { content: json.response }
                                }]
                            };
                        }
                        if (json.done) return;
                    } catch (e) {
                        console.warn("[Ollama Stream] JSON Parse Error in chunk:", e.message);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    })();
};

export const callGemini = async (prompt, expectJson = true, maxTokens = 2048) => {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing from environment");

    // Flatten structured prompts to a single string for Gemini
    let promptText;
    if (typeof prompt === 'string') {
        promptText = prompt;
    } else if (prompt && typeof prompt === 'object' && prompt.system && prompt.user) {
        promptText = `${prompt.system}\n\n${prompt.user}`;
    } else {
        promptText = String(prompt);
    }

    console.log(`[AI Gemini] Attempting synthesis via Gemini (maxTokens=${maxTokens})...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // Strict 25s timeout

    let response;
    try {
        response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: maxTokens,
                    responseMimeType: expectJson ? "application/json" : undefined
                }
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(`Gemini Connectivity Error: ${e.message}`);
    }

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Gemini Error: ${errData.error?.message || response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) throw new Error("Gemini returned empty candidate");

    if (!expectJson) return aiText;

    try {
        return parseAiJson(aiText);
    } catch (e) {
        console.warn("[AI Gemini] JSON Parse Failed, using Rescue:", e.message);
        console.log("RAW AI TEXT:", aiText);

        const extractString = (key) => {
            const regex = new RegExp(`"?${key}"?\\s*:\\s*(?:"|'|\`)?([\\s\\S]*?)(?=(?:"|'|\`)?\\s*[,}]|\\s*"?\\w+"?\\s*:)`, 'i');
            const match = aiText.match(regex);
            return match ? match[1].trim() : null;
        };

        const extractArray = (key) => {
            const regex = new RegExp(`"?${key}"?\\s*:\\s*(\\[[\\s\\S]*?\\])(?=\\s*[,}])`, 'i');
            const match = aiText.match(regex);
            if (match) {
                try {
                    return JSON.parse(repairJson(match[1]));
                } catch (e) { return null; }
            }
            return null;
        };

        const cleanup = (t) => t ? t.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/^["'`]|["'`]$/g, '').trim() : null;

        return {
            content_markdown: cleanup(extractString("content_markdown")),
            historical_context: cleanup(extractString("historical_context")),
            first_principles: cleanup(extractString("first_principles")),
            structural_breakdown: cleanup(extractString("structural_breakdown")),
            deep_dive: extractArray("deep_dive") || {},
            applied_practice: extractArray("applied_practice") || [],
            failure_analysis: cleanup(extractString("failure_analysis")),
            production_standard: extractArray("production_standard") || {},
            scholarly_references: extractArray("scholarly_references") || [],
            staff_engineer_note: cleanup(extractString("staff_engineer_note")),
            breadcrumb_path: cleanup(extractString("breadcrumb_path")),
            difficulty: cleanup(extractString("difficulty")),
            estimated_time: cleanup(extractString("estimated_time")),
            learning_objectives: extractArray("learning_objectives") || [],
            reply: cleanup(extractString("reply")) || "Synthesis complete."
        };
    }
};

// --- FAST AI WRAPPER (llama-3.1-8b-instant — ~5× faster, for quick-response features) ---
// Use for: project eval, grading, career analysis, quiz, readiness check, goal submission
export const callFastAI = async (prompt, expectJson = true, maxTokens = 512) => {
    if (process.env.GROQ_API_KEY) {
        try {
            console.log("[callFastAI] Attempting fast Groq protocol (8b-instant)...");
            const groqRes = await callGroq(prompt, expectJson, "llama-3.1-8b-instant", maxTokens);
            if (groqRes) return groqRes;
        } catch (err) {
            console.warn("[callFastAI] Fast model failed, falling back to 70b:", err.message);
        }
    }
    // Fall through to full callAI if fast model fails
    return callAI(prompt, expectJson, maxTokens);
};

// --- PRIMARY AI WRAPPER (Prioritizes Groq) ---
export const callAI = async (prompt, expectJson = true, maxTokens = 2048) => {
    // 1. Prioritize Groq if available
    if (process.env.GROQ_API_KEY) {
        try {
            console.log("[callAI] Attempting Groq protocol...");
            const groqRes = await callGroq(prompt, expectJson, "llama-3.3-70b-versatile", maxTokens);
            if (groqRes) return groqRes;
        } catch (err) {
            console.warn("[callAI] Groq failed, falling back to Gemini:", err.message);
        }
    }

    // 2. Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log("[callAI] Attempting Gemini protocol...");
            return await callGemini(prompt, expectJson, maxTokens);
        } catch (err) {
            console.error("[callAI] Gemini fallback also failed:", err.message);
        }
    }

    // 3. Last resort: Ollama (if running locally)
    try {
        console.log("[callAI] Attempting local Ollama uplink...");
        const ollamaRes = await callOllama(prompt, expectJson);
        if (ollamaRes && !ollamaRes.error) return ollamaRes;
    } catch (err) {
        console.error("[callAI] Ollama uplink failed:", err.message);
    }

    // 4. Dead-End Fallback: Mock Data
    console.warn("[callAI] Critical failure on all nodes. Deploying Mock Protocol.");
    const mockReply = getMockResponse('mentor');
    if (expectJson) {
        return {
            reply: "⚠️ [OFFLINE MODE] " + mockReply,
            segments: [
                { speaker: "host", text: "Dr. Aria here. We're experiencing some technical interference with our primary neural link." },
                { speaker: "expert", text: "Dr. Nova confirming. I'll provide a simplified overview until full synthesis is restored." },
                { speaker: "host", text: mockReply }
            ],
            title: "Neural Link Interrupted",
            description: "Operating on emergency local buffers.",
            suggested_questions: ["Why is the AI offline?", "When will it be back?"]
        };
    }
    return "⚠️ [LATENCY ALERT] " + mockReply;
};

export const callOllama = async (prompt, expectJson = true, retries = 2) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced from 300s to 5s

    try {
        console.log(`[AI Ollama] Sending request to local instance...`);
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Ollama API Error: ${response.status}`);

        const data = await response.json();
        let aiText = data.response;
        if (!aiText) throw new Error("Ollama returned empty response");

        return parseAiJson(aiText);
    } catch (e) {
        clearTimeout(timeoutId);
        if (retries > 0) return callOllama(prompt, retries - 1);
        return { reply: "⚠️ Intelligence Synthesis Compromised. Local engine unreachable.", error: e.message };
    }
};

// Unified JSON Parser for all AI Engines
const parseAiJson = (aiText) => {
    if (!aiText) return { reply: "Empty response from AI." };

    // Robust JSON extraction
    let jsonStr = aiText.trim();
    
    // Try to extract from ```json ... ``` or fallback to outermost brackets
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonBlockMatch && (jsonBlockMatch[1].trim().startsWith('{') || jsonBlockMatch[1].trim().startsWith('['))) {
        jsonStr = jsonBlockMatch[1].trim();
    } else {
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');
        
        // Find the outermost structure that surrounds the payload
        let startIdx = firstBrace;
        let endIdx = lastBrace;
        
        if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
            // It might be an array
            if (lastBracket !== -1 && lastBracket > endIdx) {
                startIdx = firstBracket;
                endIdx = lastBracket;
            }
        }
        
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1).trim();
        }
    }

    // Sanitize control characters
    jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    try {
        return JSON.parse(jsonStr);
    } catch (parseError) {
        console.warn("[AI Parser] JSON Parse Failed, attempting Repair:", parseError.message);
        try {
            return JSON.parse(repairJson(jsonStr));
        } catch (repairError) {
            console.warn("[AI Parser] Final Regex Rescue forced.");

            const extractString = (key) => {
                // More robust string extraction including handling for missing closing quotes
                const regex = new RegExp(`"?${key}"?\\s*:\\s*(?:"|'|\`)?([\\s\\S]*?)(?=(?:"|'|\`)?\\s*[,}]|\\s*"?\\w+"?\\s*:|$)`, 'i');
                const match = aiText.match(regex);
                return match ? match[1].trim() : null;
            };

            const extractArray = (key) => {
                // More robust array extraction
                const regex = new RegExp(`"?${key}"?\\s*:\\s*(\\[[\\s\\S]*?\\])(?=\\s*[,}]|$)`, 'i');
                const match = aiText.match(regex);
                if (match) {
                    try { return JSON.parse(repairJson(match[1])); } catch (e) { return null; }
                }
                return null;
            };

            const cleanup = (t) => t ? t.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/^["'`]|["'`]$/g, '').trim() : null;

            const result = {
                reply: cleanup(extractString("reply")),
                phase: cleanup(extractString("phase")),
                attitude: cleanup(extractString("attitude")),
                live_reaction: cleanup(extractString("live_reaction")),
                suggested_questions: extractArray("suggested_questions") || [],
                questions: extractArray("questions") || [],
                scorecard: null,
                // --- NEW: Podcast & Lecture Support ---
                segments: extractArray("segments") || extractArray("CONVERSATION") || extractArray("DIALOGUE") || extractArray("SCRIPT") || [],
                CONVERSATION: extractArray("CONVERSATION") || [],
                VISUAL_SCENES: extractArray("VISUAL_SCENES") || [],
                title: cleanup(extractString("title")) || cleanup(extractString("TOPIC_ANALYSIS")) || "Podcast Deep Dive",
                description: cleanup(extractString("description")) || cleanup(extractString("summary")) || cleanup(extractString("LECTURE_NOTE")) || "A technical exploration of the topic.",
                lecture_note: cleanup(extractString("LECTURE_NOTE")),
                summary: cleanup(extractString("summary"))
            };

            if (!result.reply && !result.segments?.length && !result.CONVERSATION?.length && aiText) {
                result.reply = aiText.trim().substring(0, 1000);
            }
            return result;
        }
    }
};

