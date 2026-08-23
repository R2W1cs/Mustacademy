import 'dotenv/config';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ALLOW_OLLAMA = process.env.ALLOW_OLLAMA === 'true' || process.env.NODE_ENV !== 'production';
// Groq retired the old llama-3.x public IDs for many accounts — use currently available models.
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
export const GROQ_FAST_MODEL = process.env.GROQ_FAST_MODEL || 'groq/compound-mini';

import Groq from "groq-sdk";
export const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY, timeout: 20000, maxRetries: 0 }) : null;

console.log(`[AI Setup] Ollama URL: ${OLLAMA_URL} (enabled=${ALLOW_OLLAMA})`);
console.log(`[AI Setup] Groq Key present: ${!!GROQ_API_KEY}`);
console.log(`[AI Setup] Groq models: primary=${GROQ_MODEL} fast=${GROQ_FAST_MODEL}`);

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

export const callGroq = async (prompt, expectJson = true, model = GROQ_MODEL, maxTokens = 2048) => {
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
            model,
            messages,
            temperature: 0.7,
            max_tokens: maxTokens,
            top_p: 1
        };

        if (expectJson) {
            payload.response_format = { type: "json_object" };
            // Many Groq models need an explicit JSON instruction when response_format is set.
            const hasSystem = messages.some((m) => m.role === 'system');
            if (!hasSystem) {
                messages = [
                    { role: 'system', content: 'You are a JSON API. Always respond with valid JSON only.' },
                    ...messages,
                ];
                payload.messages = messages;
            }
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
        if (err.message.includes("model_not_found") || err.message.includes("does not exist")) {
            console.error(`[AI Groq] Model unavailable: ${model}. Set GROQ_MODEL to a model listed by your Groq account.`);
        }
        throw err;
    }
};

export const streamAI = async (prompt, model = GROQ_MODEL, maxTokens = 4096) => {
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
                model,
                messages,
                temperature: 1,
                max_tokens: maxTokens,
                top_p: 1,
                stream: true,
            });
            return stream;
        } catch (err) {
            console.warn("[AI Groq Stream] Failed:", err.message);
            if (err.message.includes("model_not_found") || err.message.includes("does not exist")) {
                console.error(`[AI Groq Stream] Model unavailable: ${model}. Set GROQ_MODEL on the server.`);
            }
        }
    }

    // 2. Optional Ollama (local/dev only — skipped in production unless ALLOW_OLLAMA=true)
    if (ALLOW_OLLAMA) {
        try {
            console.log("[AI Ollama Stream] Groq unavailable, trying local stream...");
            return await streamOllama(prompt);
        } catch (err) {
            console.warn("[AI Ollama Stream] Failed:", err.message);
        }
    }

    console.warn("[AI Stream] Critical failure. Deploying Mock Stream.");
    const mockReply = getMockResponse('mentor');
    const reason = !GROQ_API_KEY
        ? 'GROQ_API_KEY is not set on the server (Render env). Redeploy after adding it.'
        : `Groq request failed (model=${model}). Check GROQ_MODEL / quota.`;
    return (async function* () {
        const words = `⚠️ [EMERGENCY PROTOCOL ACTIVE] ${reason} ${mockReply}`.split(' ');
        for (const word of words) {
            yield {
                choices: [{
                    delta: { content: word + ' ' }
                }]
            };
            await new Promise(r => setTimeout(r, 50));
        }
    })();
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

// Gemini removed — Groq is the sole cloud provider.

// --- FAST AI WRAPPER (GROQ_FAST_MODEL — for quick-response features) ---
// Use for: project eval, grading, career analysis, quiz, readiness check, goal submission
export const callFastAI = async (prompt, expectJson = true, maxTokens = 512) => {
    if (process.env.GROQ_API_KEY) {
        try {
            console.log(`[callFastAI] Attempting fast Groq protocol (${GROQ_FAST_MODEL})...`);
            const groqRes = await callGroq(prompt, expectJson, GROQ_FAST_MODEL, maxTokens);
            if (groqRes) return groqRes;
        } catch (err) {
            console.warn("[callFastAI] Fast model failed, falling back to primary:", err.message);
        }
    }
    // Fall through to full callAI if fast model fails
    return callAI(prompt, expectJson, maxTokens);
};

// --- PRIMARY AI WRAPPER (Groq only; optional local Ollama in non-production) ---
export const callAI = async (prompt, expectJson = true, maxTokens = 2048) => {
    let lastError = null;
    if (process.env.GROQ_API_KEY) {
        try {
            console.log(`[callAI] Attempting Groq protocol (${GROQ_MODEL})...`);
            const groqRes = await callGroq(prompt, expectJson, GROQ_MODEL, maxTokens);
            if (groqRes) return groqRes;
        } catch (err) {
            lastError = err.message;
            console.warn("[callAI] Groq failed:", err.message);
        }
    }

    if (ALLOW_OLLAMA) {
        try {
            console.log("[callAI] Attempting local Ollama uplink...");
            const ollamaRes = await callOllama(prompt, expectJson);
            if (ollamaRes && !ollamaRes.error) return ollamaRes;
        } catch (err) {
            lastError = err.message;
            console.error("[callAI] Ollama uplink failed:", err.message);
        }
    }

    console.warn("[callAI] Critical failure. Deploying Mock Protocol.");
    const mockReply = getMockResponse('mentor');
    const prefix = !GROQ_API_KEY
        ? "⚠️ [OFFLINE MODE — set GROQ_API_KEY on Render] "
        : `⚠️ [OFFLINE MODE — Groq request failed${lastError ? `: ${lastError.slice(0, 120)}` : ''}] `;
    if (expectJson) {
        return {
            reply: prefix + mockReply,
            segments: [
                { speaker: "host", text: "Neural link unavailable. Set GROQ_MODEL to a model your Groq account can access, then redeploy." },
                { speaker: "expert", text: mockReply }
            ],
            title: "Neural Link Interrupted",
            description: "Operating on emergency local buffers.",
            suggested_questions: ["Why is the AI offline?", "When will it be back?"]
        };
    }
    return prefix + mockReply;
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

