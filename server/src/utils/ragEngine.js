/**
 * ragEngine.js — Lightweight RAG for dynamic prompt composition.
 *
 * Problem solved: aiRules.js is 66KB of monolithic prompts. Sending one full
 * prompt + KB content + history in a single Groq request causes timeouts.
 *
 * Solution: Break rules into tagged modules, chunk KB files, and retrieve only
 * what is relevant to the user's actual query. Cuts token count by 60-80%.
 */

import fs from 'fs';
import path from 'path';

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'src', 'knowledge_base');
const CHUNK_MAX_CHARS = 500;
const TOP_K_CHUNKS = 3;
const MAX_HISTORY_TURNS = 4; // Last 4 messages (2 exchanges)

// ─── RULE MODULES ────────────────────────────────────────────────────────────
// Each module is a focused instruction block. "always" = included in every prompt.
// "tags" = keyword signals in the query that activate this module.

const RULE_MODULES = [
    {
        id: 'persona',
        always: true,
        content: `You are "DR. NOVA" (IQ 160+), the ultimate Computer Science Professor and Principal Architect. TONE: Passionate, elite, intellectually authoritative. Deliver a MASTERCLASS, never a summary.`,
    },
    {
        id: 'formatting',
        always: true,
        content: `VISUAL PROTOCOL: Max 3 sentences per paragraph. Use '***' between major sections. Blockquotes for axioms. All code in fenced blocks with language tag. Dense comparative tables.`,
    },
    {
        id: 'algo_viz',
        tags: [
            'algorithm', 'sort', 'sorting', 'search', 'searching', 'graph', 'tree', 'trees',
            'queue', 'stack', 'heap', 'bfs', 'dfs', 'traverse', 'traversal', 'binary', 'linked list',
            'dynamic programming', 'dp', 'data structure', 'recursion', 'hash', 'trie',
        ],
        content: `ALGORITHM VISUALIZER: For any algorithm or data structure, produce a \`\`\`algo-viz block.
Tag MUST be exactly \`algo-viz\` (NOT json, NOT javascript). Pre-compute ALL steps.
Schema: {"type":"bfs|dfs|sort|tree|stack|queue","title":"...","nodes":[{"id":"X"}],"edges":[{"source":"X","target":"Y"}],"steps":[{"highlight_nodes":[],"visited":[],"queue":[],"description":"..."}]}`,
    },
    {
        id: 'complexity',
        tags: [
            'algorithm', 'sort', 'complexity', 'big o', 'performance', 'efficient', 'optimize',
            'time complexity', 'space complexity', 'runtime', 'worst case', 'average case',
        ],
        content: `COMPLEXITY TABLE: Always include a markdown table with Time and Space complexity per operation (best / average / worst).`,
    },
    {
        id: 'runnable_code',
        tags: [
            'implement', 'code', 'function', 'class', 'build', 'write', 'program', 'example',
            'javascript', 'python', 'typescript', 'show', 'demo', 'algorithm', 'how to',
        ],
        content: `CODE: Provide complete runnable JavaScript (minimum 30 lines). Include:
- console.log() showing actual output
- __step__(label, stateObj) calls at key algorithm steps (for Step-Through mode)
- Realistic variable names and inline comments referencing real-world systems`,
    },
    {
        id: 'deep_narrative',
        tags: [
            'explain', 'what is', 'how does', 'why', 'deep dive', 'breakdown', 'understand',
            'concept', 'theory', 'architecture', 'design', 'principle', 'fundamentals',
        ],
        content: `NARRATIVE PROTOCOL (follow this order):
1. THE HOOK — Why is this fascinating? Why does it matter?
2. REAL-WORLD UTILITY — How does this prevent outages at AWS / enable Netflix at scale?
3. FIRST PRINCIPLE — The irreducible mathematical or logical basis.
4. LOW-LEVEL MECHANICS — Syscalls, memory, or CPU cycle implications.`,
    },
    {
        id: 'json_output',
        always: true,
        content: `Return ONLY VALID JSON (RFC8259):
{"reply": "...", "mission": null, "topic_detected": "Topic Name", "suggested_questions": ["q1", "q2", "q3"], "forge_protocol": null}`,
    },
];

// ─── TOKENIZER ───────────────────────────────────────────────────────────────

function tokenize(text) {
    return text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
}

// ─── TF-IDF SCORING ──────────────────────────────────────────────────────────

function scoreTFIDF(query, document, corpus) {
    const queryTerms = new Set(tokenize(query));
    const docTerms = tokenize(document);
    const termFreq = {};
    for (const t of docTerms) termFreq[t] = (termFreq[t] || 0) + 1;

    let score = 0;
    for (const term of queryTerms) {
        if (!termFreq[term]) continue;
        const tf = termFreq[term] / docTerms.length;
        // Count how many corpus docs contain this term
        const df = corpus.reduce((acc, doc) => acc + (tokenize(doc).includes(term) ? 1 : 0), 0);
        const idf = Math.log((corpus.length + 1) / (df + 1) + 1);
        score += tf * idf;
    }
    return score;
}

// ─── KB CHUNKER ──────────────────────────────────────────────────────────────

function chunkText(text) {
    const chunks = [];
    const paragraphs = text.split(/\n{2,}/);
    let current = '';

    for (const para of paragraphs) {
        const candidate = current ? current + '\n\n' + para : para;
        if (candidate.length > CHUNK_MAX_CHARS && current) {
            chunks.push(current.trim());
            current = para;
        } else {
            current = candidate;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Retrieve the most relevant KB chunks for a query.
 * Replaces full-file KB loading with semantic chunk selection.
 *
 * @param {string} query - User message
 * @param {string|null} topicTitle - Topic hint from DB lookup
 * @param {number} topK - Max chunks to return
 * @returns {string|null}
 */
export function retrieveKBContext(query, topicTitle, topK = TOP_K_CHUNKS) {
    try {
        if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) return null;
        const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md'));
        if (!files.length) return null;

        const queryText = `${topicTitle || ''} ${query}`;
        const allChunks = [];

        for (const file of files) {
            const content = fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, file), 'utf8');
            for (const chunk of chunkText(content)) {
                allChunks.push({ file, content: chunk });
            }
        }

        if (!allChunks.length) return null;

        const corpus = allChunks.map(c => c.content);
        const scored = allChunks
            .map((chunk, i) => ({ ...chunk, score: scoreTFIDF(queryText, chunk.content, corpus) }))
            .filter(c => c.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        if (!scored.length) return null;

        console.log(`[RAG] Retrieved ${scored.length} KB chunks for: "${queryText.slice(0, 60)}..."`);
        return scored.map(c => c.content).join('\n\n---\n\n');
    } catch (err) {
        console.warn('[RAG] KB retrieval error:', err.message);
        return null;
    }
}

/**
 * Select only the rule modules relevant to this query.
 * Reduces system prompt size by 60-80% for non-algorithm queries.
 *
 * @param {string} query - User message
 * @returns {string[]} - Array of module content strings
 */
export function selectRuleModules(query) {
    const queryLower = query.toLowerCase();
    const selected = [];

    for (const mod of RULE_MODULES) {
        if (mod.always) {
            selected.push(mod.content);
            continue;
        }
        const hit = mod.tags.some(tag => queryLower.includes(tag));
        if (hit) selected.push(mod.content);
    }

    return selected;
}

/**
 * Compress chat history to the last N messages.
 * Avoids sending stale context that inflates the prompt.
 *
 * @param {Array<{role: string, message: string}>} history
 * @returns {string}
 */
export function compressHistory(history) {
    if (!history?.length) return 'No previous history.';
    const recent = history.slice(-MAX_HISTORY_TURNS);
    return recent
        .map(h => `${h.role === 'user' ? 'Student' : 'Dr. Nova'}: ${h.message.slice(0, 300)}`)
        .join('\n');
}

/**
 * Build a RAG-composed system prompt.
 * Replaces the static PROFESSOR_IQ_160_PROMPT.replace() pattern.
 *
 * @param {object} opts
 * @param {string} opts.query - User message
 * @param {string|null} opts.topicTitle - Topic hint
 * @param {string|null} opts.preloadedKBContent - Full KB content (if already loaded; skip retrieval)
 * @param {Array} opts.history - Chat history rows
 * @param {string|null} opts.scholarlyContext - Student vault resources
 * @param {boolean} opts.streamMode - If true, omit JSON output instruction
 * @returns {string} - The composed system prompt
 */
export function buildMentorPrompt({
    query,
    topicTitle = null,
    preloadedKBContent = null,
    history = [],
    scholarlyContext = null,
    streamMode = false,
}) {
    // 1. Select relevant rule modules
    const modules = selectRuleModules(query);

    // 2. Retrieve KB context (chunked retrieval)
    const kbContext = preloadedKBContent
        ? preloadedKBContent  // caller already did full-file load (legacy path)
        : retrieveKBContext(query, topicTitle);

    // 3. Compress history
    const historyText = compressHistory(history);

    // 4. Build system prompt sections
    const sections = [];

    // Rule modules (only relevant ones)
    sections.push(modules.join('\n\n'));

    // Context section
    if (kbContext) {
        sections.push(`--- KNOWLEDGE BASE (verified, use this as authoritative source) ---\n${kbContext}\n---`);
    } else {
        sections.push('Context: General CS knowledge. No specific KB entry found.');
    }

    if (scholarlyContext) {
        sections.push(scholarlyContext);
    }

    // History section
    sections.push(`History:\n${historyText}`);

    // Strip JSON output module in stream mode (raw markdown output needed)
    if (streamMode) {
        const idx = sections.findIndex(s => s.startsWith('Return ONLY VALID JSON'));
        if (idx !== -1) sections.splice(idx, 1);
        sections.push('STREAMING MODE: Output raw markdown directly. NO JSON brackets or field names.');
    }

    return sections.join('\n\n');
}
