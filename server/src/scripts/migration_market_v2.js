import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const evolveMarketSchema = async () => {
    try {
        console.log('🚀 Evolving Market Intelligence Schema to v2.0...');

        // Extend market_news table
        await pool.query(`
            ALTER TABLE market_news 
            ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Worldwide',
            ADD COLUMN IF NOT EXISTS salary_value INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS source_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
            ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'Any';
        `);
        console.log('✅ market_news table schema extended.');

        // Clean existing signals to repopulate with high-quality data
        await pool.query('DELETE FROM market_news');
        console.log('🧹 Purged legacy market signals.');

        const globalSignals = [
            // AI & ML
            ['NVIDIA Blackwell Chip Shortage Impacts AI Training Budgets', 'GPU scarcity is forcing startups to optimize models, increasing demand for AI Infrastructure Engineers.', 'https://nvidia.com', { demand_growth: 65, salary_index: 25, skill_match: 90 }, 'AI', 'Global', 185000, 'NVIDIA Blog', 'AI Infrastructure Engineer'],
            ['Swiss AI Hub Attracts 50+ Top-Tier Research Labs', 'Switzerland becomes the "Silicon Valley of AI Research" due to favorable regulations.', 'https://wired.com', { demand_growth: 40, salary_index: 35, skill_match: 85 }, 'AI', 'Switzerland', 210000, 'Wired', 'Research Scientist'],
            ['Prompt Engineering is Dead? Shift to AI Agent Orchestration', 'Market data shows a 200% surge in roles for "Agentic Workflow Architects".', 'https://techcrunch.com', { demand_growth: 50, salary_index: 15, skill_match: 75 }, 'AI', 'USA', 165000, 'TechCrunch', 'Agentic Workflow Architect'],

            // Web & Mobile
            ['Next.js 16 Introduces Native Edge Sync Engine', 'Web performance requirements reaching sub-10ms, driving demand for Edge Specialists.', 'https://vercel.com', { demand_growth: 35, salary_index: 10, skill_match: 70 }, 'Web', 'Global', 145000, 'Vercel', 'Full Stack Engineer'],
            ['Apple Vision Pro 2: Spatial Computing Job Market Triples', 'VR/AR developer demand in Tokyo and SF reaches all-time high.', 'https://apple.com', { demand_growth: 120, salary_index: 20, skill_match: 60 }, 'Mobile', 'Japan', 190000, 'Apple Developer', 'Spatial Computing Dev'],
            ['Progressive Web Apps (PWA) Mandate for EU Public Services', 'New EU regulations favor PWAs over App Store installs for public transparency.', 'https://reuters.com', { demand_growth: 25, salary_index: 5, skill_match: 80 }, 'Web', 'European Union', 110000, 'Reuters', 'PWA Specialist'],

            // Security & Ops
            ['Post-Quantum Cryptography: The 2026 Security Mandate', 'Financial institutions hiring Quant-Hardened Security Engineers globally.', 'https://github.blog', { demand_growth: 85, salary_index: 30, skill_match: 95 }, 'Security', 'Global', 240000, 'GitHub Security', 'Quantum Security Engineer'],
            ['Kubernetes v2.0 Leak: Total API Simplification', 'DevOps engineers shifting focus to "Platform Engineering" over raw K8s management.', 'https://kubernetes.io', { demand_growth: 45, salary_index: 12, skill_match: 85 }, 'Cloud', 'USA', 175000, 'K8s Blog', 'Platform Engineer'],
            ['German Data Sovereign Cloud Project Seeks 5000 Cloud Architects', 'Gov-backed initiative to reduce reliance on non-EU cloud providers.', 'https://dw.com', { demand_growth: 60, salary_index: 18, skill_match: 70 }, 'Cloud', 'Germany', 130000, 'DW News', 'Cloud Sovereignty Architect'],

            // Data & Misc
            ['Real-Time Streaming replaces Batch Processing in Retail Data', 'Kafka/Flink skills see 40% salary premium in London and NYC.', 'https://bloomberg.com', { demand_growth: 55, salary_index: 22, skill_match: 90 }, 'Data', 'UK', 155000, 'Bloomberg', 'Data Streaming Engineer'],
            ['United Arab Emirates Launches $10B "Sustainable Coding" Initiative', 'Tax-free incentives for Green Software Engineers migrating to Dubai.', 'https://aljazeera.com', { demand_growth: 75, salary_index: 45, skill_match: 65 }, 'Embedded', 'UAE', 200000, 'Al Jazeera', 'Green Software Engineer']
        ];

        for (const [title, summary, url, impact, cat, loc, salary, source, job] of globalSignals) {
            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, industrial_impact, category, location, salary_value, source_name, job_title) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [title, summary, url, JSON.stringify(impact), cat, loc, salary, source, job]
            );
        }
        console.log('✅ Global Market Intelligence v2.0 seeded.');

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Market evolution failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

evolveMarketSchema();
