import 'dotenv/config';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const INCEPTION_API_KEY = process.env.INCEPTION_API_KEY;
const INCEPTION_BASE_URL = (process.env.INCEPTION_BASE_URL || 'https://api.inceptionlabs.ai/v1').replace(/\/$/, '');
export const INCEPTION_MODEL = process.env.INCEPTION_MODEL || 'mercury-2';
const INCEPTION_REASONING = process.env.INCEPTION_REASONING_EFFORT || 'low';
const ORCAROUTER_API_KEY = process.env.ORCAROUTER_API_KEY;
const ORCAROUTER_BASE_URL = (process.env.ORCAROUTER_BASE_URL || 'https://api.orcarouter.ai/v1').replace(/\/$/, '');
export const ORCAROUTER_MODEL = process.env.ORCAROUTER_MODEL || 'deepseek/deepseek-v4-flash-free';

/** OpenRouter (OpenAI-compatible) — https://openrouter.ai/api/v1 */
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const OPENROUTER_HTTP_REFERER = process.env.OPENROUTER_HTTP_REFERER || 'https://mustacademy.vercel.app';
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE || 'MustAcademy';
export const OPENROUTER_MODEL_QUALITY = process.env.OPENROUTER_MODEL_QUALITY || 'openai/gpt-4o';
export const OPENROUTER_MODEL_BOARDROOM = process.env.OPENROUTER_MODEL_BOARDROOM || 'openai/gpt-4o';
export const OPENROUTER_MODEL_FAST = process.env.OPENROUTER_MODEL_FAST || 'openai/gpt-4o-mini';

const ALLOW_OLLAMA = process.env.ALLOW_OLLAMA === 'true' || process.env.NODE_ENV !== 'production';
// Groq retired legacy public Llama IDs — remap even if Render still has GROQ_MODEL=llama-3.3-70b-versatile.
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_GROQ_FAST_MODEL = 'groq/compound-mini';
const RETIRED_GROQ_MODELS = new Set([
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'gemma-7b-it',
]);

export const resolveGroqModel = (requested, fallback = DEFAULT_GROQ_MODEL) => {
    const id = String(requested || '').trim();
    if (!id) return fallback;
    const retired = RETIRED_GROQ_MODELS.has(id) || /^llama-3\./i.test(id) || /^llama3-/i.test(id);
    if (retired) {
        console.warn(`[AI Setup] Remapping retired Groq model "${id}" → ${fallback}`);
        return fallback;
    }
    return id;
};

export const GROQ_MODEL = resolveGroqModel(process.env.GROQ_MODEL, DEFAULT_GROQ_MODEL);
export const GROQ_FAST_MODEL = resolveGroqModel(process.env.GROQ_FAST_MODEL, DEFAULT_GROQ_FAST_MODEL);
/** Prefer openrouter | orca | inception | groq | auto */
const AI_PRIMARY = (process.env.AI_PRIMARY || 'auto').toLowerCase();

const OPENROUTER_ROUTE_MODELS = {
    quality: OPENROUTER_MODEL_QUALITY,
    boardroom: OPENROUTER_MODEL_BOARDROOM,
    fast: OPENROUTER_MODEL_FAST,
};

export const resolveOpenRouterModel = (route = 'quality') =>
    OPENROUTER_ROUTE_MODELS[route] || OPENROUTER_MODEL_QUALITY;

const hasCloudAiKey = () =>
    !!(OPENROUTER_API_KEY || GROQ_API_KEY || INCEPTION_API_KEY || ORCAROUTER_API_KEY);

/** Prefer OpenRouter whenever the key is set (falls back to Groq/Orca/Inception). */
const preferOpenRouterFirst = () => !!OPENROUTER_API_KEY;
import Groq from "groq-sdk";
export const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY, timeout: 20000, maxRetries: 0 }) : null;

console.log(`[AI Setup] Ollama URL: ${OLLAMA_URL} (enabled=${ALLOW_OLLAMA})`);
console.log(`[AI Setup] Groq Key present: ${!!GROQ_API_KEY}`);
console.log(`[AI Setup] Groq models: primary=${GROQ_MODEL} fast=${GROQ_FAST_MODEL}`);
console.log(`[AI Setup] Inception Key present: ${!!INCEPTION_API_KEY} model=${INCEPTION_MODEL}`);
console.log(`[AI Setup] Orca Router Key present: ${!!ORCAROUTER_API_KEY} model=${ORCAROUTER_MODEL}`);
console.log(`[AI Setup] OpenRouter Key present: ${!!OPENROUTER_API_KEY}`);
console.log(`[AI Setup] OpenRouter models: quality=${OPENROUTER_MODEL_QUALITY} boardroom=${OPENROUTER_MODEL_BOARDROOM} fast=${OPENROUTER_MODEL_FAST} primary=${AI_PRIMARY}`);

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

const buildMessages = (prompt) => {
    if (Array.isArray(prompt)) return prompt;
    if (prompt && typeof prompt === 'object' && prompt.system && prompt.user) {
        return [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
        ];
    }
    return [{ role: 'user', content: typeof prompt === 'string' ? prompt : JSON.stringify(prompt) }];
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

    let messages = buildMessages(prompt);
    const resolvedModel = resolveGroqModel(model, GROQ_MODEL);

    console.log(`[AI Groq] Attempting reasoning via ${resolvedModel} (expectJson=${expectJson}, maxTokens=${maxTokens})...`);
    try {
        const payload = {
            model: resolvedModel,
            messages,
            temperature: 0.7,
            max_tokens: maxTokens,
            top_p: 1
        };

        if (expectJson) {
            payload.response_format = { type: "json_object" };
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
            console.error(`[AI Groq] Model unavailable: ${resolvedModel}. Set GROQ_MODEL to a model listed by your Groq account.`);
        }
        throw err;
    }
};

/** Inception Labs Mercury (OpenAI-compatible) — https://api.inceptionlabs.ai/v1 */
export const callInception = async (prompt, expectJson = true, model = INCEPTION_MODEL, maxTokens = 2048) => {
    if (!INCEPTION_API_KEY) throw new Error("INCEPTION_API_KEY missing from environment");

    let messages = buildMessages(prompt);
    if (expectJson) {
        const hasSystem = messages.some((m) => m.role === 'system');
        if (!hasSystem) {
            messages = [
                { role: 'system', content: 'You are a JSON API. Always respond with valid JSON only. No markdown.' },
                ...messages,
            ];
        } else {
            messages = messages.map((m) =>
                m.role === 'system'
                    ? { ...m, content: `${m.content}\n\nAlways respond with valid JSON only.` }
                    : m
            );
        }
    }

    console.log(`[AI Inception] Calling ${model} (expectJson=${expectJson}, maxTokens=${maxTokens})...`);

    // Mercury spends tokens on reasoning — keep a floor so content is not truncated to empty.
    const tokenBudget = Math.max(maxTokens, expectJson ? 2048 : 512);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let response;
    try {
        response = await fetch(`${INCEPTION_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${INCEPTION_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages,
                reasoning_effort: INCEPTION_REASONING,
                temperature: 0.75,
                max_tokens: tokenBudget,
            }),
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Inception HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    if (!aiText) throw new Error("Inception returned empty response");

    if (!expectJson) return aiText;

    try {
        return JSON.parse(aiText);
    } catch (e) {
        console.warn("[AI Inception] JSON Parse Failed, attempting Repair:", e.message);
        return parseAiJson(aiText);
    }
};

const openRouterHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    };
    if (OPENROUTER_HTTP_REFERER) headers['HTTP-Referer'] = OPENROUTER_HTTP_REFERER;
    if (OPENROUTER_APP_TITLE) headers['X-Title'] = OPENROUTER_APP_TITLE;
    return headers;
};

/**
 * OpenRouter chat completions (OpenAI-compatible).
 * @param {{ messages: Array, model?: string, maxTokens?: number, stream?: boolean, expectJson?: boolean }} opts
 */
export const callOpenRouter = async ({
    messages,
    model = OPENROUTER_MODEL_QUALITY,
    maxTokens = 2048,
    stream = false,
    expectJson = false,
} = {}) => {
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing from environment");

    let msgs = Array.isArray(messages) ? [...messages] : buildMessages(messages);
    if (expectJson) {
        const hasSystem = msgs.some((m) => m.role === 'system');
        if (!hasSystem) {
            msgs = [
                { role: 'system', content: 'You are a JSON API. Always respond with valid JSON only. No markdown.' },
                ...msgs,
            ];
        } else {
            msgs = msgs.map((m) =>
                m.role === 'system'
                    ? { ...m, content: `${m.content}\n\nAlways respond with valid JSON only.` }
                    : m
            );
        }
    }

    const tokenBudget = Math.max(maxTokens, expectJson ? 1024 : 256);
    console.log(`[AI OpenRouter] Calling ${model} (expectJson=${expectJson}, maxTokens=${tokenBudget}, stream=${!!stream})...`);

    const body = {
        model,
        messages: msgs,
        temperature: 0.7,
        max_tokens: tokenBudget,
        stream: !!stream,
    };
    if (expectJson && !stream) {
        body.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), stream ? 90000 : 60000);

    let response;
    try {
        response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: openRouterHeaders(),
            body: JSON.stringify(body),
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`OpenRouter HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    if (stream) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        return (async function* () {
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n');
                    buffer = parts.pop() || '';
                    for (const line of parts) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data:')) continue;
                        const payload = trimmed.slice(5).trim();
                        if (!payload || payload === '[DONE]') continue;
                        try {
                            const json = JSON.parse(payload);
                            const content = json.choices?.[0]?.delta?.content;
                            if (content) {
                                yield { choices: [{ delta: { content } }] };
                            }
                        } catch {
                            // ignore partial JSON lines
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        })();
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    if (!aiText) throw new Error("OpenRouter returned empty response");

    if (!expectJson) return aiText;

    try {
        return JSON.parse(aiText);
    } catch (e) {
        console.warn("[AI OpenRouter] JSON Parse Failed, attempting Repair:", e.message);
        return parseAiJson(aiText);
    }
};

/** Orca Router (OpenAI-compatible) — https://api.orcarouter.ai/v1 */
export const callOrca = async (prompt, expectJson = true, model = ORCAROUTER_MODEL, maxTokens = 2048) => {
    if (!ORCAROUTER_API_KEY) throw new Error("ORCAROUTER_API_KEY missing from environment");

    let messages = buildMessages(prompt);
    if (expectJson) {
        const hasSystem = messages.some((m) => m.role === 'system');
        if (!hasSystem) {
            messages = [
                { role: 'system', content: 'You are a JSON API. Always respond with valid JSON only. No markdown.' },
                ...messages,
            ];
        } else {
            messages = messages.map((m) =>
                m.role === 'system'
                    ? { ...m, content: `${m.content}\n\nAlways respond with valid JSON only.` }
                    : m
            );
        }
    }

    console.log(`[AI Orca] Calling ${model} (expectJson=${expectJson}, maxTokens=${maxTokens})...`);

    // Flash models may spend tokens on reasoning — keep a floor so content is not empty.
    const tokenBudget = Math.max(maxTokens, expectJson ? 1024 : 256);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let response;
    try {
        response = await fetch(`${ORCAROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ORCAROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.75,
                max_tokens: tokenBudget,
            }),
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Orca HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const aiText = message?.content || message?.reasoning_content;
    if (!aiText) throw new Error("Orca returned empty response");

    if (!expectJson) return aiText;

    try {
        return JSON.parse(aiText);
    } catch (e) {
        console.warn("[AI Orca] JSON Parse Failed, attempting Repair:", e.message);
        return parseAiJson(aiText);
    }
};

const streamOrca = async (prompt, model = ORCAROUTER_MODEL, maxTokens = 4096) => {
    if (!ORCAROUTER_API_KEY) throw new Error("ORCAROUTER_API_KEY missing from environment");
    const messages = buildMessages(prompt);

    console.log(`[AI Orca] Streaming via ${model}...`);
    const response = await fetch(`${ORCAROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ORCAROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.75,
            max_tokens: maxTokens,
            stream: true,
        }),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Orca stream HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return (async function* () {
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() || '';
                for (const line of parts) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const payload = trimmed.slice(5).trim();
                    if (!payload || payload === '[DONE]') continue;
                    try {
                        const json = JSON.parse(payload);
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) {
                            yield { choices: [{ delta: { content } }] };
                        }
                    } catch {
                        // ignore partial JSON lines
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    })();
};

const streamInception = async (prompt, model = INCEPTION_MODEL, maxTokens = 4096) => {
    if (!INCEPTION_API_KEY) throw new Error("INCEPTION_API_KEY missing from environment");
    const messages = buildMessages(prompt);

    console.log(`[AI Inception] Streaming via ${model}...`);
    const response = await fetch(`${INCEPTION_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${INCEPTION_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages,
            reasoning_effort: INCEPTION_REASONING,
            temperature: 0.75,
            max_tokens: Math.max(maxTokens, 512),
            stream: true,
        }),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Inception stream HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return (async function* () {
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() || '';
                for (const line of parts) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const payload = trimmed.slice(5).trim();
                    if (!payload || payload === '[DONE]') continue;
                    try {
                        const json = JSON.parse(payload);
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) {
                            yield { choices: [{ delta: { content } }] };
                        }
                    } catch {
                        // ignore partial JSON lines
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    })();
};

const providerOrder = (preferFirst, rest) => {
    if (!preferFirst) return rest;
    return [preferFirst, ...rest.filter((fn) => fn !== preferFirst)];
};

export const streamAI = async (prompt, model = GROQ_MODEL, maxTokens = 4096, options = {}) => {
    const route = options.route || 'fast';
    const messages = buildMessages(prompt);
    const openRouterModel = options.openRouterModel || resolveOpenRouterModel(route);
    const resolvedGroqModel = resolveGroqModel(model || (route === 'fast' ? GROQ_FAST_MODEL : GROQ_MODEL), route === 'fast' ? GROQ_FAST_MODEL : GROQ_MODEL);

    const tryOpenRouter = async () => {
        if (!OPENROUTER_API_KEY) return null;
        return callOpenRouter({
            messages,
            model: openRouterModel,
            maxTokens,
            stream: true,
            expectJson: false,
        });
    };

    const tryGroq = async () => {
        if (!(process.env.GROQ_API_KEY && groq)) return null;
        console.log(`[AI Groq] Initiating stream via ${resolvedGroqModel} (maxTokens=${maxTokens})...`);
        return groq.chat.completions.create({
            model: resolvedGroqModel,
            messages,
            temperature: 1,
            max_tokens: maxTokens,
            top_p: 1,
            stream: true,
        });
    };

    const tryOrca = async () => {
        if (!ORCAROUTER_API_KEY) return null;
        return streamOrca(prompt, ORCAROUTER_MODEL, maxTokens);
    };

    const tryInception = async () => {
        if (!INCEPTION_API_KEY) return null;
        return streamInception(prompt, INCEPTION_MODEL, maxTokens);
    };

    const prefer =
        AI_PRIMARY === 'orca' ? tryOrca
            : AI_PRIMARY === 'inception' ? tryInception
                : AI_PRIMARY === 'groq' ? tryGroq
                    : AI_PRIMARY === 'openrouter' ? tryOpenRouter
                        : null;

    let order = providerOrder(prefer, [tryGroq, tryOrca, tryInception]);
    if (preferOpenRouterFirst() || AI_PRIMARY === 'openrouter') {
        order = providerOrder(tryOpenRouter, order);
    }

    for (const attempt of order) {
        try {
            const stream = await attempt();
            if (stream) return stream;
        } catch (err) {
            console.warn("[AI Stream] Provider failed:", err.message);
        }
    }

    // Optional Ollama (local/dev only — skipped in production unless ALLOW_OLLAMA=true)
    if (ALLOW_OLLAMA) {
        try {
            console.log("[AI Ollama Stream] Cloud providers unavailable, trying local stream...");
            return await streamOllama(prompt);
        } catch (err) {
            console.warn("[AI Ollama Stream] Failed:", err.message);
        }
    }

    console.warn("[AI Stream] Critical failure. Deploying Mock Stream.");
    const mockReply = getMockResponse('mentor');
    const reason = !hasCloudAiKey()
        ? 'Set OPENROUTER_API_KEY, GROQ_API_KEY, ORCAROUTER_API_KEY, or INCEPTION_API_KEY on the server (Render env). Redeploy after adding it.'
        : 'Cloud AI request failed. Check provider keys / models.';
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

// Cloud providers: OpenRouter + Groq + Orca Router + Inception Labs. Optional local Ollama in non-production.

// --- FAST AI WRAPPER (OpenRouter fast / Orca flash / GROQ_FAST_MODEL — for quick-response features) ---
// Use for: project eval, grading, career analysis, quiz, readiness check, goal submission
export const callFastAI = async (prompt, expectJson = true, maxTokens = 512, options = {}) => {
    const route = options.route || 'fast';
    if (OPENROUTER_API_KEY) {
        try {
            const model = resolveOpenRouterModel(route);
            console.log(`[callFastAI] Attempting OpenRouter (${model})...`);
            const orRes = await callOpenRouter({
                messages: buildMessages(prompt),
                model,
                maxTokens,
                expectJson,
            });
            if (orRes) return orRes;
        } catch (err) {
            console.warn("[callFastAI] OpenRouter fast failed, trying fallbacks:", err.message);
        }
    }
    if (ORCAROUTER_API_KEY) {
        try {
            console.log(`[callFastAI] Attempting Orca flash (${ORCAROUTER_MODEL})...`);
            const orcaRes = await callOrca(prompt, expectJson, ORCAROUTER_MODEL, maxTokens);
            if (orcaRes) return orcaRes;
        } catch (err) {
            console.warn("[callFastAI] Orca fast failed, trying Groq:", err.message);
        }
    }
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
    return callAI(prompt, expectJson, maxTokens, { route });
};

// --- PRIMARY AI WRAPPER (OpenRouter / Groq / Orca / Inception; optional local Ollama in non-production) ---
export const callAI = async (prompt, expectJson = true, maxTokens = 2048, options = {}) => {
    let lastError = null;
    const route = options.route || 'quality';

    const tryOpenRouter = async () => {
        if (!OPENROUTER_API_KEY) return null;
        const model = options.openRouterModel || resolveOpenRouterModel(route);
        console.log(`[callAI] Attempting OpenRouter protocol (${model}, route=${route})...`);
        return callOpenRouter({
            messages: buildMessages(prompt),
            model,
            maxTokens,
            expectJson,
        });
    };

    const tryGroq = async () => {
        if (!process.env.GROQ_API_KEY) return null;
        console.log(`[callAI] Attempting Groq protocol (${GROQ_MODEL})...`);
        return callGroq(prompt, expectJson, GROQ_MODEL, maxTokens);
    };

    const tryOrca = async () => {
        if (!ORCAROUTER_API_KEY) return null;
        console.log(`[callAI] Attempting Orca protocol (${ORCAROUTER_MODEL})...`);
        return callOrca(prompt, expectJson, ORCAROUTER_MODEL, maxTokens);
    };

    const tryInception = async () => {
        if (!INCEPTION_API_KEY) return null;
        console.log(`[callAI] Attempting Inception protocol (${INCEPTION_MODEL})...`);
        return callInception(prompt, expectJson, INCEPTION_MODEL, maxTokens);
    };

    const prefer =
        AI_PRIMARY === 'orca' ? tryOrca
            : AI_PRIMARY === 'inception' ? tryInception
                : AI_PRIMARY === 'groq' ? tryGroq
                    : AI_PRIMARY === 'openrouter' ? tryOpenRouter
                        : null;

    let order = providerOrder(prefer, [tryGroq, tryOrca, tryInception]);
    if (preferOpenRouterFirst() || AI_PRIMARY === 'openrouter') {
        order = providerOrder(tryOpenRouter, order);
    }

    for (const attempt of order) {
        try {
            const res = await attempt();
            if (res) return res;
        } catch (err) {
            lastError = err.message;
            console.warn("[callAI] Provider failed:", err.message);
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
    const prefix = !hasCloudAiKey()
        ? "⚠️ [OFFLINE MODE — set OPENROUTER_API_KEY, GROQ_API_KEY, ORCAROUTER_API_KEY, or INCEPTION_API_KEY on Render] "
        : `⚠️ [OFFLINE MODE — AI request failed${lastError ? `: ${lastError.slice(0, 120)}` : ''}] `;
    if (expectJson) {
        return {
            reply: prefix + mockReply,
            segments: [
                { speaker: "host", text: "Neural link unavailable. Set OPENROUTER_API_KEY, ORCAROUTER_API_KEY, GROQ_API_KEY, or INCEPTION_API_KEY, then redeploy." },
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
        if (retries > 0) return callOllama(prompt, expectJson, retries - 1);
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

