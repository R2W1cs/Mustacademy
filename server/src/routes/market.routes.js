import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";
import { syncMarketPulse } from "../services/marketSync.service.js";
import { groq } from "../utils/aiClient.js";

const router = express.Router();

// Simple in-memory digest cache (6h TTL)
let digestCache = { text: null, generatedAt: null };
const DIGEST_TTL_MS = 6 * 60 * 60 * 1000;

// GET /api/market/signals — fetch cached signals with optional filters
router.get("/signals", protect, async (req, res) => {
    const { category, location, limit = 30, offset = 0 } = req.query;
    try {
        let query = `SELECT * FROM market_news WHERE expires_at > NOW()`;
        const params = [];
        let idx = 1;

        if (category && category !== "all") {
            query += ` AND category ILIKE $${idx++}`;
            params.push(`%${category}%`);
        }
        if (location && location !== "all") {
            const MAPPING = {
                'USA': ['USA', 'Silicon Valley', 'SF', 'Austin', 'San Francisco', 'Boston'],
                'Europe': ['Europe', 'EU', 'UK', 'London', 'Switzerland', 'European Union', 'Basel'],
                'Asia': ['Asia', 'China', 'Japan', 'Tokyo', 'UAE', 'Singapore', 'Dubai'],
                'Remote': ['Remote', 'Worldwide', 'Global']
            };

            const keywords = MAPPING[location] || [location];
            const patterns = keywords.map((_, i) => `location ILIKE $${idx++}`).join(' OR ');
            query += ` AND (${patterns})`;
            params.push(...keywords.map(k => `%${k}%`));
        }

        query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);
        res.json({ signals: result.rows, count: result.rowCount });
    } catch (err) {
        console.error("[Market] Fetch signals error:", err);
        res.status(500).json({ message: "Failed to fetch market signals", signals: [] });
    }
});

// GET /api/market/trending — top CS tech keywords from recent signals
router.get("/trending", protect, async (_req, res) => {
    try {
        const result = await pool.query(
            `SELECT title FROM market_news WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 60`
        );
        const STOP = new Set(['the','and','for','with','new','how','why','top','are','its','from','this','that','has','was','will','can','not','but','use','via','over','into','more','than','your','their','using','about','after','what','when','who']);
        const freq = {};
        for (const { title } of result.rows) {
            const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
            for (const w of words) {
                if (w.length > 2 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
            }
        }
        const trending = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));
        res.json({ trending, total: result.rowCount });
    } catch (err) {
        console.error("[Market] Trending error:", err);
        res.status(500).json({ trending: [] });
    }
});

// GET /api/market/digest — AI-synthesized weekly CS summary (cached 6h)
router.get("/digest", protect, async (_req, res) => {
    try {
        const now = Date.now();
        if (digestCache.text && digestCache.generatedAt && (now - digestCache.generatedAt) < DIGEST_TTL_MS) {
            return res.json({ digest: digestCache.text, cached: true, generatedAt: digestCache.generatedAt });
        }

        // Pull recent signals for context
        const result = await pool.query(
            `SELECT title, content_summary, category FROM market_news WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 25`
        );

        if (result.rows.length === 0) {
            return res.json({ digest: null, cached: false });
        }

        const headlines = result.rows.map((s, i) =>
            `${i + 1}. [${s.category || 'General'}] ${s.title}${s.content_summary ? ': ' + s.content_summary.slice(0, 120) : ''}`
        ).join('\n');

        let digestText = null;
        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    model: 'llama3-8b-8192',
                    messages: [{
                        role: 'user',
                        content: `You are a senior CS industry analyst. Based on these recent tech headlines, write a "This Week in Computer Science" digest in exactly 4 short paragraphs (2-3 sentences each). Cover: AI/ML trends, job market shifts, new technologies, and what CS students should focus on. Be specific and actionable. No bullet points — flowing prose only.\n\nHeadlines:\n${headlines}`
                    }],
                    max_tokens: 600,
                    temperature: 0.6
                });
                digestText = completion.choices[0]?.message?.content || null;
            } catch (aiErr) {
                console.error("[Market] AI generation failed, falling back:", aiErr);
            }
        }

        if (!digestText) {
            digestText = `The CS landscape this week shows strong momentum across multiple fronts. ${result.rows.slice(0, 3).map(r => r.title).join(', ')} are among the top trending topics.\n\nAI and cloud technologies continue to dominate hiring demand, with companies scaling infrastructure teams rapidly. Full-stack and ML engineering roles are seeing the highest salary growth.\n\nNew frameworks and tools are emerging weekly — staying current with ${result.rows.filter(r => r.category === 'AI').slice(0, 2).map(r => r.category).join(', ') || 'AI and Web'} developments is essential.\n\nFor CS students: prioritize building projects with the technologies appearing most in job postings. Hands-on experience with cloud platforms and AI APIs is now a baseline expectation.`;
        }

        digestCache = { text: digestText, generatedAt: now };
        res.json({ digest: digestText, cached: false, generatedAt: now });
    } catch (err) {
        console.error("[Market] Digest error:", err);
        res.json({ digest: "The CS landscape is evolving rapidly. Stay tuned for our next automated update as we aggregate the latest industry signals.", cached: false });
    }
});

// POST /api/market/sync — manually trigger a market sync (admin / authenticated)
router.post("/sync", protect, async (req, res) => {
    const { category, location } = req.body;
    try {
        const result = await syncMarketPulse({ category, location });
        res.json({ success: true, ...result });
    } catch (err) {
        console.error("[Market] Manual sync error:", err.message);
        res.status(500).json({ message: err.message || "Market sync failed" });
    }
});

export default router;
