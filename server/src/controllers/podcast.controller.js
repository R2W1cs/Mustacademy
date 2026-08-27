/**
 * podcast.controller.js
 * Handles library lectures, podcasts, masterclass, and Nova lesson generation.
 * Extracted from ai.controller.js for single-responsibility and testability.
 */
import pool from "../config/db.js";
import { cacheGet, cacheSet, cacheKey } from "../utils/aiCache.js";
import { callAI } from "../utils/aiClient.js";
import { enqueueMasterclassJob } from "../utils/jobQueue.js";
import { incrementStreak } from "../services/streak.service.js";
import {
    PROFESSOR_LECTURE_PROMPT, PROFESSOR_INTERLUDE_PROMPT, ULTIMATE_PODCAST_PROMPT,
    MASTERCLASS_EPISODE_PROMPT
} from "../utils/aiRules.js";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import path from "path";
import fs from "fs";
import { resolveMediaFields } from "../utils/mediaUrl.js";

const ttsCache = new Map();

// --- LIBRARY LECTURE ---

export const generateLibraryLecture = async (req, res) => {
    const { topicTitle } = req.body;
    if (!topicTitle) return res.status(400).json({ message: "Topic title required" });

    try {
        const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const userName = (userRes.rows[0]?.name || "Student").split(' ')[0];

        const topicRes = await pool.query(
            "SELECT first_principles, architectural_logic, forge_snippet, forge_protocol FROM topics WHERE title = $1 LIMIT 1",
            [topicTitle]
        );
        const topicData = topicRes.rows[0];

        let context = "No specific technical context found. Use internal knowledge but stay focused on the topic.";
        if (topicData) {
            context = `TECHNICAL LOGIC: ${topicData.first_principles}\nARCHITECTURAL BLUEPRINT: ${topicData.architectural_logic}\nCODE SAMPLE: ${topicData.forge_snippet}\nFORGE PROTOCOL: ${topicData.forge_protocol}`;
        }
        const LECTURE_CONTEXT_CAP = 2000;
        if (context.length > LECTURE_CONTEXT_CAP) context = context.slice(0, LECTURE_CONTEXT_CAP);

        const aiData = await callAI({ system: PROFESSOR_LECTURE_PROMPT, user: `USER PROFILE:\nNAME: ${userName}\n\nSTRICT GROUNDING DATA:\n${context}\n\nTOPIC TO LECTURE ON: "${topicTitle}"` }, true, 4096, { route: 'quality' });

        await incrementStreak(req.user.id).catch(e => console.warn("Streak increment failed:", e.message));

        const personalizedConversation = aiData.CONVERSATION?.map(turn => ({
            ...turn,
            text: turn.text.replace(/{USER_NAME}/g, userName)
        })) || null;

        // Async self-learning persistence
        try {
            if (aiData.LECTURE_NOTE || aiData.forge_protocol) {
                await pool.query(`UPDATE topics SET
                    content = COALESCE(content, $1),
                    first_principles = COALESCE(first_principles, $2),
                    architectural_logic = COALESCE(architectural_logic, $3),
                    forge_protocol = COALESCE(forge_protocol, $4)
                    WHERE title = $5`,
                    [aiData.reply || null, JSON.stringify(aiData.LECTURE_NOTE) || null,
                     aiData.VISUAL_SCENES?.[0]?.narrative_trigger || null, aiData.forge_protocol || null, topicTitle]);
            }
        } catch (dbErr) {
            console.warn("[AI] Self-Synthesis persistence failed:", dbErr.message);
        }

        res.json({
            lectureNote: aiData.LECTURE_NOTE || aiData.reply || "Lecture content error.",
            voiceScript: aiData.VOICE_SCRIPT,
            conversation: personalizedConversation,
            scenes: aiData.VISUAL_SCENES || null,
            emotion: aiData.EMOTION || "Neutral",
            forge_protocol: aiData.forge_protocol || topicData?.forge_protocol || null
        });
    } catch (err) {
        console.error("Lecture Generation Error:", err);
        res.status(500).json({ message: "Professor is currently in a faculty meeting. Please try later." });
    }
};

export const interactWithProfessor = async (req, res) => {
    const { topicTitle, question } = req.body;
    if (!topicTitle || !question) return res.status(400).json({ message: "Topic and question required" });

    try {
        const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const userName = (userRes.rows[0]?.name || "Student").split(' ')[0];

        const topicRes = await pool.query(
            "SELECT first_principles, architectural_logic FROM topics WHERE title = $1 LIMIT 1",
            [topicTitle]
        );
        const topicData = topicRes.rows[0];
        const context = topicData
            ? `TECHNICAL LOGIC: ${topicData.first_principles}\nARCHITECTURAL: ${topicData.architectural_logic}`
            : "Generic knowledge context.";

        const aiData = await callAI(
            `${PROFESSOR_INTERLUDE_PROMPT}\n\nUSER: ${userName}\nQUESTION: ${question}\n\nGROUNDING:\n${context}`,
            true, 1024, { route: 'quality' }
        );

        const personalizedConversation = aiData.CONVERSATION?.map(turn => ({
            ...turn,
            text: turn.text.replace(/{USER_NAME}/g, userName)
        })) || null;

        res.json({ conversation: personalizedConversation });
    } catch (err) {
        console.error("Interlude Error:", err);
        res.status(500).json({ message: "Professor is calculating a response..." });
    }
};

// --- PODCAST ---

export const generateTopicPodcast = async (req, res) => {
    const { topicTitle } = req.body;
    if (!topicTitle) return res.status(400).json({ message: 'Topic title required' });

    try {
        const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const userName = (userRes.rows[0]?.name || "Scholar").split(' ')[0];

        const prompt = ULTIMATE_PODCAST_PROMPT.replace(/{topic}/g, topicTitle).replace(/{USER_NAME}/g, userName);

        // Pre-rendered studio fallbacks for well-known topics
        for (const [match, segments] of PRERENDERED_EPISODES) {
            if (topicTitle.toLowerCase().includes(match)) {
                return res.json({ success: true, episode: { title: `Studio Masterclass: ${topicTitle}`, summary: `Pre-rendered studio recording on ${topicTitle}.`, segments } });
            }
        }

        const aiData = await callAI(prompt, true, 4096, { route: 'quality' });

        if (!aiData || !Array.isArray(aiData.segments) || aiData.segments.length === 0) {
            return res.json({ success: true, episode: buildFallbackEpisode(topicTitle) });
        }

        const normalizeSpeaker = (raw, index) => {
            const s = String(raw || '').toLowerCase();
            if (s === 'host' || s === 'aria' || s === 'leo' || s.includes('aria') || s.includes('pragmatist')) return 'host';
            if (s === 'expert' || s === 'nova' || s === 'aris' || s.includes('nova') || s.includes('theorist')) return 'expert';
            // Alternate if the model used unknown labels
            return index % 2 === 0 ? 'host' : 'expert';
        };

        let segments = aiData.segments.map((seg, i) => ({
            ...seg,
            speaker: normalizeSpeaker(seg.speaker, i),
            text: String(seg.text || '').trim(),
        })).filter((seg) => seg.text);

        // Force true Aria↔Nova turn-taking (no monologues)
        const hostCount = segments.filter((s) => s.speaker === 'host').length;
        const expertCount = segments.filter((s) => s.speaker === 'expert').length;
        if (hostCount === 0 || expertCount === 0 || hostCount + expertCount < 4) {
            return res.json({ success: true, episode: buildFallbackEpisode(topicTitle) });
        }
        segments = segments.map((seg, i) => {
            const expected = i % 2 === 0 ? 'host' : 'expert';
            // If two identical speakers in a row, flip to keep conversation rhythm
            if (i > 0 && seg.speaker === segments[i - 1].speaker) {
                return { ...seg, speaker: expected };
            }
            return seg;
        });

        const sanitized = {
            ...aiData,
            title: aiData.title || `Aria × Nova: ${topicTitle}`,
            summary: aiData.summary || `A conversation between Dr. Aria and Dr. Nova on ${topicTitle}.`,
            segments,
        };

        res.json({ success: true, episode: sanitized });
    } catch (err) {
        console.error('[generateTopicPodcast] Critical error:', err.message);
        res.status(500).json({ message: 'Podcast Generation Failure', error: err.message });
    }
};

export const askPodcastQuestion = async (req, res) => {
    const { topicTitle, question, history = [] } = req.body;
    if (!topicTitle || !question) return res.status(400).json({ message: 'Topic title and question required' });

    const pqCk = history.length === 0 ? cacheKey('podcastqa', topicTitle, question.toLowerCase().trim()) : null;
    if (pqCk) {
        const cached = cacheGet(pqCk);
        if (cached) return res.json(cached);
    }

    const conversationContext = history.length > 0
        ? `\n\nPrevious Q&A:\n${history.map(m => `${m.role === 'user' ? 'Student' : 'Dr. Nova'}: ${m.text}`).join('\n')}\n`
        : '';

    const prompt = `You are "Dr. Nova", an expert CS professor who just finished a podcast on "${topicTitle}".${conversationContext}
Student question: "${question}"
Answer directly and technically. 2-3 paragraphs max. Return valid JSON: {"answer": "..."}`;

    try {
        const aiData = await callAI(prompt, true, 1024, { route: 'quality' });
        const result = { success: true, answer: aiData.answer || aiData.reply || "I couldn't process that question." };
        if (pqCk) cacheSet(pqCk, result, 30 * 60 * 1000);
        res.json(result);
    } catch (err) {
        console.error('[askPodcastQuestion] Error:', err.message);
        res.status(500).json({ message: 'Podcast Q&A Failure', error: err.message });
    }
};

// --- TTS ---

const HOST_VOICE = "en-US-JennyNeural";   // Dr. Aria — female host
const EXPERT_VOICE = "en-US-BrianNeural"; // Dr. Nova — male expert

function setPodcastAudioHeaders(res, extra = {}) {
    const origin = res.req?.headers?.origin;
    res.set({
        'Content-Type': 'audio/mpeg',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        ...(origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' } : {}),
        ...extra,
    });
}

export const generatePodcastSpeech = async (req, res) => {
    const text = req.body.text || req.query.text;
    const rawSpeaker = String(req.body.speaker || req.query.speaker || "expert").toLowerCase();
    const speaker = rawSpeaker === "host" || rawSpeaker === "aria" ? "host" : "expert";
    const topicTitle = req.body.topicTitle || req.query.topicTitle;
    const interactive = req.body.interactive || req.query.interactive;

    if (!text) return res.status(400).json({ message: 'Text required' });

    // Never serve a single studio WAV for multi-speaker segments — that makes both voices identical.
    // Only allow pre-rendered files when explicitly requesting a full non-interactive topic dump.
    if (topicTitle && interactive !== 'true' && !req.body.speaker && !req.query.speaker) {
        try {
            const studioDir = path.join(path.resolve(), '..', 'tts-service', 'podcasts', 'google_studio_explanations');
            if (fs.existsSync(studioDir)) {
                const sanitizedTitle = topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const files = fs.readdirSync(studioDir);
                const bestMatch = files.find(f => {
                    const base = f.replace(/\.[^/.]+$/, "").toLowerCase();
                    const lt = topicTitle.toLowerCase();
                    return base === sanitizedTitle || base === lt || lt.startsWith(base) || base.startsWith(lt);
                });
                if (bestMatch) {
                    res.setHeader('Content-Type', 'audio/wav');
                    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
                    res.setHeader('X-Studio-Source', 'Google-AI-Studio');
                    return fs.createReadStream(path.join(studioDir, bestMatch)).pipe(res);
                }
            }
        } catch (e) {
            console.warn("[Neural-TTS] Local file check failed:", e.message);
        }
    }

    const voice = speaker === "host" ? HOST_VOICE : EXPERT_VOICE;
    const ttsCacheKey = `${speaker}:${voice}:${text}`;
    if (ttsCache.has(ttsCacheKey)) {
        const cached = ttsCache.get(ttsCacheKey);
        setPodcastAudioHeaders(res, {
            'Content-Length': cached.length,
            'X-Neural-Voice': voice,
            'X-Podcast-Speaker': speaker,
            'X-TTS-Cache': 'HIT',
        });
        return res.send(cached);
    }

    const trySynthesize = async (chosenVoice, chunkText) => {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(chosenVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
        const buffer = await Promise.race([
            tts.toBuffer(chunkText),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Synthesis Timeout")), 30000))
        ]);
        if (buffer && buffer.length > 500) return buffer;
        throw new Error(`Empty audio for ${chosenVoice}`);
    };

    try {
        const maxChunk = 1000;
        let finalBuffer = Buffer.alloc(0);

        if (text.length > maxChunk) {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let currentChunk = "";
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length > maxChunk && currentChunk) {
                    finalBuffer = Buffer.concat([finalBuffer, await trySynthesize(voice, currentChunk)]);
                    currentChunk = sentence;
                } else {
                    currentChunk += sentence;
                }
            }
            if (currentChunk) {
                finalBuffer = Buffer.concat([finalBuffer, await trySynthesize(voice, currentChunk)]);
            }
        } else {
            finalBuffer = await trySynthesize(voice, text);
        }

        setPodcastAudioHeaders(res, {
            'Content-Length': finalBuffer.length,
            'X-Neural-Voice': voice,
            'X-Podcast-Speaker': speaker,
            'Cache-Control': 'public, max-age=3600',
            'X-TTS-Cache': 'MISS',
        });
        if (ttsCache.size < 500) ttsCache.set(ttsCacheKey, finalBuffer);
        res.send(finalBuffer);
    } catch (err) {
        console.error("[Neural-TTS] All synthesis failed:", err.message);
        res.status(503).json({ message: "TTS service unavailable." });
    }
};

// --- MASTERCLASS ---

export const generateMasterclassEpisode = async (req, res) => {
    const { title, theme, partNumber } = req.body;
    if (!title || !theme) return res.status(400).json({ message: "Title and theme required" });

    const jobId = await enqueueMasterclassJob({ title, theme, partNumber, userId: req.user.id });

    res.json({
        success: true,
        message: "Masterclass synthesis initiated. Check the Studio for progress.",
        status: "PROCESSING",
        jobId,
    });
};

export const getMasterclassEpisodes = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, summary, part_number, chapter_number, video_url, published_at FROM masterclass_episodes ORDER BY part_number ASC"
        );
        res.json(result.rows.map((row) => resolveMediaFields(row)));
    } catch (err) {
        res.status(500).json({ message: "Error fetching episodes" });
    }
};

export const getMasterclassEpisode = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT id, title, summary, segments, part_number, chapter_number, video_url, thumbnail_url, published_at FROM masterclass_episodes WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Episode not found" });
        res.json(resolveMediaFields(result.rows[0]));
    } catch (err) {
        res.status(500).json({ message: "Error fetching episode" });
    }
};

// --- INTERACTIVE / NOVA ---

export const generateInteractivePodcast = async (req, res) => {
    try {
        const { topicTitle, history } = req.body;
        if (!topicTitle || !history || !Array.isArray(history)) {
            return res.status(400).json({ success: false, message: "Missing topicTitle or history" });
        }

        const messages = [
            { role: "system", content: `You are Dr. Nova, an expert AI tutor on "${topicTitle}". Answer naturally, warmly, concisely (1-2 paragraphs). No markdown formatting as output is spoken.` },
            ...history.map(msg => ({ role: msg.role || 'user', content: msg.content }))
        ];

        const reply = await callAI(messages, false, 300, { route: 'quality' });
        res.json({ success: true, reply: typeof reply === 'string' ? reply : (reply?.reply || '') });
    } catch (err) {
        console.error("Interactive Podcast Error:", err);
        res.status(500).json({ success: false, message: "Failed to generate interactive response" });
    }
};

export const generateNovaLesson = async (req, res) => {
    try {
        const { topicTitle } = req.body;
        if (!topicTitle) return res.status(400).json({ success: false, message: "topicTitle required" });

        const lesson = await callAI(
            `You are Dr. Nova, a world-class CS professor. Write a private spoken lecture on "${topicTitle}". No markdown, no formatting — only natural spoken prose. Exactly 4 paragraphs: Hook, Core Concept (with analogy), How It Works, Real World + Invitation. 2-4 sentences per paragraph. Speak directly to the student using "you".`,
            false,
            550,
            { route: 'quality' }
        );

        const lessonText = (typeof lesson === 'string' ? lesson : lesson?.reply || '').trim();
        const paragraphs = lessonText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20);
        res.json({ success: true, lesson: lessonText, paragraphs });
    } catch (err) {
        console.error("Nova Lesson Error:", err);
        res.status(500).json({ success: false, message: "Failed to generate lesson" });
    }
};

// --- PRIVATE HELPERS ---

const PRERENDERED_EPISODES = [
    ["bfs", [
        { speaker: "host", text: "Welcome to the neural studio. Let's explore BFS." },
        { speaker: "expert", text: "BFS utilizes a Queue, ensuring nodes are visited in order of proximity." },
        { speaker: "host", text: "This makes it powerful for shortest-path algorithms in unweighted graphs." },
        { speaker: "expert", text: "Time complexity scales with V plus E." }
    ]],
    ["dfs", [
        { speaker: "host", text: "Today we're diving into DFS." },
        { speaker: "expert", text: "DFS plunges to the deepest node before backtracking, utilizing a Stack." },
        { speaker: "host", text: "It's elegant for topological sorting and maze generation." },
        { speaker: "expert", text: "Be cautious of deep recursion limits and stack overflow in production." }
    ]],
];

const buildFallbackEpisode = (topicTitle) => ({
    title: `Deep Dive: ${topicTitle}`,
    summary: `An expert conversation exploring ${topicTitle} from fundamentals to production use cases.`,
    segments: [
        { speaker: "host", text: `Welcome back. Today we're exploring ${topicTitle}. Dr. Nova, why don't you start us off?` },
        { speaker: "expert", text: `${topicTitle} is a foundational concept in computer science. At its core, it defines how data is stored, processed, and retrieved efficiently.` },
        { speaker: "host", text: "When should engineers reach for this in a real system?" },
        { speaker: "expert", text: "Use it when you need reliability and performance at scale: distributed systems, high-throughput pipelines, anywhere consistency and latency matter." },
        { speaker: "host", text: "Any common pitfalls?" },
        { speaker: "expert", text: "Premature optimization, ignoring failure modes, and not benchmarking under realistic load. Always measure before you optimize." },
        { speaker: "host", text: "Any final advice?" },
        { speaker: "expert", text: "Build something with it. Read real implementations. Understanding the WHY beats memorizing the WHAT." }
    ]
});
