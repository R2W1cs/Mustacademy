import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const migrateToV3 = async () => {
    try {
        console.log('🚀 Initiating Market Intelligence v3.0 Normalization...');

        // 1. Drop the legacy table and rebuild for perfect normalization
        await pool.query('DROP TABLE IF EXISTS market_news');
        console.log('🧹 Purged legacy table infrastructure.');

        await pool.query(`
            CREATE TABLE market_news (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content_summary TEXT NOT NULL,
                source_url TEXT,
                source_name VARCHAR(100),
                company_name VARCHAR(100),
                job_title VARCHAR(100),
                category VARCHAR(50),
                location VARCHAR(100) DEFAULT 'Worldwide',
                salary_value INTEGER DEFAULT 0,
                
                -- Normalized Impact Metrics
                demand_growth INTEGER DEFAULT 0,
                salary_index INTEGER DEFAULT 0,
                skill_match INTEGER DEFAULT 0,
                
                -- Explainability & Lifecycle
                impact_logic TEXT,
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Normalized market_news table established.');

        const structuredSignals = [
            // AI Signals
            {
                title: 'OpenAI DevDay: Custom GPTs Shift Demand to Integration Experts',
                summary: 'The ability to build custom AI agents is commoditizing raw prompt engineering, favoring architects who can chain complex workflows.',
                url: 'https://openai.com',
                source: 'OpenAI Official',
                company: 'OpenAI',
                job: 'AI Integration Architect',
                cat: 'AI',
                loc: 'USA',
                salary: 195000,
                demand: 75,
                salary_idx: 15,
                match: 90,
                logic: 'High demand triggered by the release of Assistants API and custom GPTs, requiring LangChain and Vector DB proficiency.',
                ttl_days: 7
            },
            {
                title: 'NVIDIA H200 Benchmarks Disrupt LLM Training ROI',
                summary: 'New hardware performance gains are reducing training costs by 40%, allowing mid-sized firms to enter the LLM market.',
                url: 'https://nvidia.com',
                source: 'NVIDIA Technical News',
                company: 'NVIDIA',
                job: 'Performance Engineer',
                cat: 'AI',
                loc: 'Global',
                salary: 220000,
                demand: 60,
                salary_idx: 20,
                match: 85,
                logic: 'Hardware optimization becomes critical as firms move from model-generic to model-optimized infrastructure.',
                ttl_days: 14
            },

            // Security Signals
            {
                title: 'Zero-Knowledge Proofs (ZKP) Mainstream in EU Fintech',
                summary: 'New privacy regulations in the EU are mandating ZKP for digital identity verification, creating a massive gap in ZK-circuit design.',
                url: 'https://reuters.com',
                source: 'Reuters Technology',
                company: 'European Central Bank (Project Partner)',
                job: 'ZKP Cryptographer',
                cat: 'Security',
                loc: 'European Union',
                salary: 170000,
                demand: 85,
                salary_idx: 30,
                match: 95,
                logic: 'Regulatory pressure (GDPR 2.0) is forcing financial institutions to adopt non-custodial identity patterns.',
                ttl_days: 30
            },

            // Cloud & Ops
            {
                title: 'Platform Engineering Overtakes DevOps in Salary Benchmarks',
                summary: 'Companies are moving away from raw Jenkins pipelines to internal developer portals (IDP) like Backstage.',
                url: 'https://github.blog',
                source: 'GitHub Engineering',
                company: 'GitHub',
                job: 'Platform Engineer',
                cat: 'Cloud',
                loc: 'Worldwide',
                salary: 180000,
                demand: 55,
                salary_idx: 12,
                match: 80,
                logic: 'The shift from "You build it, you run it" to self-service infrastructure platforms is the primary driver.',
                ttl_days: 21
            }
        ];

        for (const sig of structuredSignals) {
            const expires = new Date();
            expires.setDate(expires.getDate() + sig.ttl_days);

            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, expires_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [sig.title, sig.summary, sig.url, sig.source, sig.company, sig.job, sig.cat, sig.loc, sig.salary, sig.demand, sig.salary_idx, sig.match, sig.logic, expires]
            );
        }
        console.log('✅ Refined Market Intelligence v3.0 seeded.');

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration v3.0 failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

migrateToV3();
