import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";
import { syncMarketPulse } from "../services/marketSync.service.js";

const router = express.Router();

// GET /api/market/signals — fetch cached signals with optional filters
router.get("/signals", protect, async (req, res) => {
    const { category, location, limit = 30 } = req.query;
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

        query += ` ORDER BY created_at DESC LIMIT $${idx}`;
        params.push(parseInt(limit));

        const result = await pool.query(query, params);
        res.json({ signals: result.rows, count: result.rowCount });
    } catch (err) {
        console.error("[Market] Fetch signals error:", err);
        res.status(500).json({ message: "Failed to fetch market signals", signals: [] });
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
