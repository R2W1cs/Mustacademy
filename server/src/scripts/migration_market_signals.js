import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const setupMarketSignals = async () => {
    try {
        console.log('🛠️ Establishing Market Intelligence Infrastructure...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS market_news (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content_summary TEXT NOT NULL,
                source_url TEXT,
                industrial_impact JSONB DEFAULT '{ "demand_growth": 0, "salary_index": 0, "skill_match": 0 }',
                category VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ market_news table established.');

        // Seed some initial data
        const initialSignals = [
            ['OpenAI Releases GPT-5 Preliminary Technical Report', 'The report outlines massive shifts in logic-based reasoning and multi-modal integration, impacting AI Engineer roles.', 'https://openai.com', { demand_growth: 45, salary_index: 12, skill_match: 88 }, 'AI'],
            ['Cloud Architecture Migration: The Shift to Edge Computing', 'Major tech firms are decentralizing data processing, increasing demand for Edge Computing specialists.', 'https://techcrunch.com', { demand_growth: 30, salary_index: 8, skill_match: 65 }, 'Cloud'],
            ['Rust Adoption Grows 300% in Systems Engineering', 'Market data shows Rust overtaking C++ for safety-critical systems in 2026.', 'https://github.blog', { demand_growth: 55, salary_index: 15, skill_match: 92 }, 'Systems']
        ];

        for (const [title, summary, url, impact, cat] of initialSignals) {
            await pool.query(
                'INSERT INTO market_news (title, content_summary, source_url, industrial_impact, category) VALUES ($1, $2, $3, $4, $5)',
                [title, summary, url, JSON.stringify(impact), cat]
            );
        }
        console.log('✅ Initial Market Signals seeded.');

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Market migration failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

setupMarketSignals();
