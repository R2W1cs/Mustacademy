import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const migrateToV3Expanded = async () => {
    try {
        console.log('🚀 Initiating Market Intelligence v3.0 High-Volume Expansion...');

        // 1. Drop and rebuild
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
                demand_growth INTEGER DEFAULT 0,
                salary_index INTEGER DEFAULT 0,
                skill_match INTEGER DEFAULT 0,
                impact_logic TEXT,
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Normalized market_news table established.');

        const structuredSignals = [
            // AI Signals
            { title: 'OpenAI DevDay: Custom GPTs Shift Demand to Integration Experts', summary: 'The ability to build custom AI agents is commoditizing raw prompt engineering, favoring architects who can chain complex workflows.', url: 'https://openai.com', source: 'OpenAI Official', company: 'OpenAI', job: 'AI Integration Architect', cat: 'AI', loc: 'USA', salary: 195000, demand: 75, salary_idx: 15, match: 90, logic: 'High demand triggered by the release of Assistants API and custom GPTs.', ttl_days: 7 },
            { title: 'NVIDIA H200 Benchmarks Disrupt LLM Training ROI', summary: 'New hardware performance gains are reducing training costs by 40%, allowing mid-sized firms to enter the LLM market.', url: 'https://nvidia.com', source: 'NVIDIA Technical News', company: 'NVIDIA', job: 'Performance Engineer', cat: 'AI', loc: 'Global', salary: 220000, demand: 60, salary_idx: 20, match: 85, logic: 'Hardware optimization becomes critical as firms move from model-generic to model-optimized infrastructure.', ttl_days: 14 },
            { title: 'Anthropic Launches Claude 4: Cognitive Logic Surges', summary: 'Claude 4 showing near-human reasoning in legal and medical coding domains, driving demand for specialized fine-tuners.', url: 'https://anthropic.com', source: 'Anthropic Blog', company: 'Anthropic', job: 'Fine-tuning Specialist', cat: 'AI', loc: 'USA', salary: 185000, demand: 45, salary_idx: 12, match: 88, logic: 'Context-specific reasoning capabilities are the new frontier beyond raw parameter count.', ttl_days: 10 },
            { title: 'Mistral Large 3: The European Open Source Renaissance', summary: 'Leading the charge in Sovereign AI, Mistral is becoming the standard for EU-based enterprise deployments.', url: 'https://mistral.ai', source: 'Mistral.ai News', company: 'Mistral AI', job: 'MLOps Engineer', cat: 'AI', loc: 'European Union', salary: 160000, demand: 55, salary_idx: 18, match: 75, logic: 'Data sovereignty mandates in the EU are favoring local, open-weight models.', ttl_days: 20 },

            // Security Signals
            { title: 'Zero-Knowledge Proofs (ZKP) Mainstream in EU Fintech', summary: 'New privacy regulations in the EU are mandating ZKP for digital identity verification.', url: 'https://reuters.com', source: 'Reuters Technology', company: 'European Central Bank (Project Partner)', job: 'ZKP Cryptographer', cat: 'Security', loc: 'European Union', salary: 170000, demand: 85, salary_idx: 30, match: 95, logic: 'Regulatory pressure (GDPR 2.0) is forcing financial institutions to adopt non-custodial identity patterns.', ttl_days: 30 },
            { title: 'Post-Quantum Cryptography: NIST Finalizes Core Standards', summary: 'The shift to quantum-resistant algorithms begins now for all federal and financial systems.', url: 'https://nist.gov', source: 'NIST Security Feed', company: 'Google Security', job: 'Quantum Security Engineer', cat: 'Security', loc: 'Global', salary: 250000, demand: 95, salary_idx: 40, match: 92, logic: 'The "Q-Day" threat is driving massive preventive investment in cryptographical agility.', ttl_days: 365 },
            { title: 'SolarWinds Part 2? New Supply Chain Attack Targets npm', summary: 'Over 5000 packages compromised in a coordinated credential-stuffing attack on major open-source maintainers.', url: 'https://github.blog', source: 'GitHub Security', company: 'GitHub', job: 'SecDevOps Engineer', cat: 'Security', loc: 'Global', salary: 190000, demand: 70, salary_idx: 25, match: 80, logic: 'Supply chain security is being elevated to a Board-level concern following another major infrastructure breach.', ttl_days: 5 },

            // Cloud & Ops
            { title: 'Platform Engineering Overtakes DevOps in Salary Benchmarks', summary: 'Companies are moving away from raw Jenkins pipelines to internal developer portals (IDP) like Backstage.', url: 'https://github.blog', source: 'GitHub Engineering', company: 'GitHub', job: 'Platform Engineer', cat: 'Cloud', loc: 'Worldwide', salary: 180000, demand: 55, salary_idx: 12, match: 80, logic: 'The shift from "You build it, you run it" to self-service infrastructure platforms.', ttl_days: 21 },
            { title: 'AWS Lambda 2.0: Sub-10ms Cold Starts with Firecracker Next', summary: 'Serverless performance parity with long-running instances achieved, triggering a massive migration from EC2.', url: 'https://aws.amazon.com', source: 'AWS Blog', company: 'Amazon Web Services', job: 'Serverless Architect', cat: 'Cloud', loc: 'USA', salary: 210000, demand: 40, salary_idx: 15, match: 70, logic: 'Cold start elimination removes the single biggest hurdle for enterprise serverless adoption.', ttl_days: 14 },
            { title: 'Google Cloud Vertex AI Adoption Surges by 300%', summary: 'GCP is winning the enterprise AI battle through superior model-as-a-service (MaaS) abstractions.', url: 'https://cloud.google.com', source: 'GCP News', company: 'Google Cloud', job: 'Cloud AI Architect', cat: 'Cloud', loc: 'Global', salary: 195000, demand: 65, salary_idx: 22, match: 85, logic: 'Integration ease between BigQuery and Vertex AI is the primary conversion driver.', ttl_days: 30 },

            // Web & Mobile
            { title: 'Next.js 16 Introduces Native Edge Sync Engine', summary: 'Web performance requirements reaching sub-10ms, driving demand for Edge Specialists.', url: 'https://vercel.com', source: 'Vercel Blog', company: 'Vercel', job: 'Full Stack Engineer', cat: 'Web', loc: 'Global', salary: 145000, demand: 35, salary_idx: 10, match: 70, logic: 'Streaming SSR and Edge-based data fetching are now the standard for high-fidelity web apps.', ttl_days: 14 },
            { title: 'Apple Vision Pro 2: Spatial Computing Job Market Triples', summary: 'VR/AR developer demand in Tokyo and SF reaches all-time high.', url: 'https://apple.com', source: 'Apple Developer', company: 'Apple', job: 'Spatial Computing Dev', cat: 'Mobile', loc: 'Japan', salary: 190000, demand: 120, salary_idx: 20, match: 60, logic: 'Hardware mass-adoption is creating a vacuum for native spatial experiences.', ttl_days: 60 },
            { title: 'React Native 0.80: Bridgeless Mode becomes the Standard', summary: 'Performance parity with Swift/Kotlin achieved. Massive enterprise migration from native to RN 0.80.', url: 'https://reactnative.dev', source: 'Meta Engineering', company: 'Meta', job: 'Mobile Engineer', cat: 'Mobile', loc: 'USA', salary: 175000, demand: 50, salary_idx: 15, match: 90, logic: 'Bridge elimination removes threading bottlenecks, making RN indistinguishable from native performance.', ttl_days: 90 },

            // Data & Misc
            { title: 'London Fintechs Pilot CBDC Node Infrastructure', summary: 'The UK Treasury launches "Digital Pound" testnet, requiring thousands of DLT node operators.', url: 'https://bloomberg.com', source: 'Bloomberg Finance', company: 'Bank of England', job: 'DLT Architect', cat: 'Data', loc: 'UK', salary: 155000, demand: 80, salary_idx: 25, match: 70, logic: 'National-scale blockchain infrastructure is transitioning from R&D to primary financial rails.', ttl_days: 120 },
            { title: 'Dubai Launches "Green Labs" Coding Tax Incentives', summary: 'Sustainable Software Engineering becomes a high-growth niche in the Middle East.', url: 'https://aljazeera.com', source: 'Al Jazeera', company: 'Dubai Future Foundation', job: 'Green Engineer', cat: 'Embedded', loc: 'UAE', salary: 200000, demand: 75, salary_idx: 45, match: 65, logic: 'Zero-tax incentives for engineers specializing in low-carbon compute architectures.', ttl_days: 180 },
            { title: 'Tesla Bot AI Training Seeks 500 Vision ML Engineers', summary: 'The race for General Purpose Robotics moves into high-volume manufacturing simulation.', url: 'https://tesla.com', source: 'Tesla Careers', company: 'Tesla', job: 'Vision ML Engineer', cat: 'AI', loc: 'USA', salary: 240000, demand: 110, salary_idx: 35, match: 80, logic: 'Real-world coordination is the next major bottleneck for AI, moving from digital to physical atoms.', ttl_days: 45 }
        ];

        for (const sig of structuredSignals) {
            const expires = new Date();
            expires.setDate(expires.getDate() + (sig.ttl_days || 7));

            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, expires_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [sig.title, sig.summary, sig.url, sig.source, sig.company, sig.job, sig.cat, sig.loc, sig.salary, sig.demand, sig.salary_idx, sig.match, sig.logic, expires]
            );
        }
        console.log(`✅ Expanded Market Intelligence v3.0 seeded with ${structuredSignals.length} high-fidelity signals.`);

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration v3.0 expansion failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

migrateToV3Expanded();
