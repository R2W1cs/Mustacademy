import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const migrateToV3Ultra = async () => {
    try {
        console.log('🚀 Initiating Market Intelligence v3.0 Ultra-Expansion...');

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

        const signals = [
            // Quantum
            { title: 'IBM Osprey 2 Discovery Accelerates Cryptographic Agility', summary: 'New quantum coherence benchmarks surpass expectations, shortening the estimated transition window to post-quantum standards.', url: 'https://ibm.com', source: 'IBM Research', company: 'IBM Quantum', job: 'Quantum Algorithm Dev', cat: 'Quantum', loc: 'USA', salary: 280000, demand: 110, salary_idx: 45, match: 95, logic: 'Quantum advantage proof-of-concepts are moving faster than industry defensive readiness.' },
            { title: 'PsiQuantum Secures $500M for Australian Silicon Lab', summary: 'The race for the first utility-scale quantum computer moves to the Southern Hemisphere.', url: 'https://psiquantum.com', source: 'PsiQuantum Press', company: 'PsiQuantum', job: 'Photonics Engineer', cat: 'Quantum', loc: 'Global', salary: 195000, demand: 65, salary_idx: 22, match: 80, logic: 'Silicon-based quantum architectures are attracting massive sovereign wealth investment.' },

            // Fintech
            { title: 'Visa Integration of USDC on Solana Goes Live', summary: 'Mainstream payment rails are finally decoupling from legacy settlement windows, favoring Solana-certified developers.', url: 'https://visa.com', source: 'Visa Tech Blog', company: 'Visa', job: 'Payments Architect', cat: 'Fintech', loc: 'Global', salary: 210000, demand: 85, salary_idx: 28, match: 85, logic: 'Settlement latency reduction is the primary driver for L1 blockchain integration in traditional finance.' },
            { title: 'Stripe Launches "Dynamic Tax" AI for EU Compliance', summary: 'Automated VAT handling for SaaS reaching perfect accuracy, reducing the need for manual spend audits.', url: 'https://stripe.com', source: 'Stripe News', company: 'Stripe', job: 'Fintech Engineer', cat: 'Fintech', loc: 'European Union', salary: 165000, demand: 55, salary_idx: 15, match: 78, logic: 'Tax-code-as-code is the next major shift in global SaaS accounting automation.' },

            // Biotech
            { title: 'DeepMind AlphaFold 3: Protein Interaction Logic Unlocked', summary: 'The ability to predict DNA/RNA interactions is creating a surge in demand for Computational Biologists.', url: 'https://deepmind.google', source: 'Google DeepMind', company: 'DeepMind', job: 'CompBio Scientist', cat: 'Biotech', loc: 'UK', salary: 230000, demand: 125, salary_idx: 35, match: 92, logic: 'Moving from protein folding to complex molecular binding is a generational shift in drug discovery.' },
            { title: 'Moderna AI-Based Cancer Vaccine Enters Phase 2', summary: 'Personalized mRNA sequences generated in hours, not months, requires massive pipeline automation.', url: 'https://moderna.com', source: 'Moderna Technical', company: 'Moderna', job: 'Bioinformatics Engineer', cat: 'Biotech', loc: 'USA', salary: 190000, demand: 70, salary_idx: 20, match: 85, logic: 'Pipeline concurrency in clinical trials is the primary bottleneck being solved by AI.' },

            // Robotics
            { title: 'Boston Dynamics Atlas Goes Full Electric', summary: 'Hydraulics are dead. Precision electric motors drive demand for embedded control system experts.', url: 'https://bostondynamics.com', source: 'BD Tech Feed', company: 'Boston Dynamics', job: 'Robotics Control Lead', cat: 'Robotics', loc: 'USA', salary: 215000, demand: 90, salary_idx: 32, match: 88, logic: 'The pivot to electric allows for better battery life and more granular torque control logic.' },
            { title: 'Figure AI 2.0 Integration in BMW Spartanburg Plant', summary: 'Humanoid robots taking over sub-assembly tasks, driving demand for fleet management software.', url: 'https://figure.ai', source: 'Figure.ai Official', company: 'Figure AI', job: 'Fleet Systems Engineer', cat: 'Robotics', loc: 'Germany', salary: 155000, demand: 60, salary_idx: 18, match: 75, logic: 'Interoperability between humanoid fleets and existing industrial PLCs is the new core skill.' },

            // DevOps
            { title: 'OpenTofu 2.0: The Terraform Alternative Gains Market Dominance', summary: 'Cloud infrastructure shifts to truly open-weight management tools.', url: 'https://opentofu.org', source: 'OpenTofu Foundation', company: 'Cloud Native Labs', job: 'DevOps Architect', cat: 'DevOps', loc: 'Global', salary: 175000, demand: 45, salary_idx: 12, match: 95, logic: 'Licensing shifts in legacy tools are driving a massive industry-wide migration to OpenTofu.' },

            // Green Tech
            { title: 'Vercel Announces "Negative Carbon" Edge Deployments', summary: 'The Green Compute mandate in the UAE is attracting eco-conscious developers with massive tax breaks.', url: 'https://vercel.com', source: 'Vercel Sustainability', company: 'Vercel', job: 'SRE - Green Compute', cat: 'Green Tech', loc: 'UAE', salary: 245000, demand: 105, salary_idx: 50, match: 70, logic: 'Zero-tax on "Green Salaries" in Dubai is triggering a brain drain from Silicon Valley.' },

            // Gaming
            { title: 'Unreal Engine 6: Procedural World Logic becomes the Base', summary: 'Manual environmental design dying out; demand surges for Procedural Technical Artists.', url: 'https://epicgames.com', source: 'Epic Tech Feed', company: 'Epic Games', job: 'Technical Artist', cat: 'Gaming', loc: 'USA', salary: 160000, demand: 55, salary_idx: 15, match: 82, logic: 'Generative world-building at the engine level reduces asset costs by 70% but requires high-level logic design.' },

            // Blockchain
            { title: 'Ethereum Pectra Upgrade: Account Abstraction Mainstream', summary: 'Wallets become indistinguishable from banking apps. UX engineering for blockchain is the new gold rush.', url: 'https://ethereum.org', source: 'EF Research', company: 'ConsenSys', job: 'Web3 UX Lead', cat: 'Blockchain', loc: 'Switzerland', salary: 190000, demand: 80, salary_idx: 35, match: 88, logic: 'Universal signature schemes allow non-crypto users to interact with dApps via FaceID.' }
        ];

        // Fill in the rest to reach 40+ signals
        const domains = [
            'AI', 'Cloud', 'Security', 'Web', 'Mobile', 'Data', 'Embedded',
            'Quantum', 'Fintech', 'Biotech', 'Robotics', 'DevOps', 'Blockchain',
            'AR/VR', 'Green Tech', 'EdTech', 'E-commerce', 'Gaming'
        ];

        for (const dom of domains) {
            // Check if domain already has a signal, if not add at least one more
            const existing = signals.filter(s => s.cat === dom);
            if (existing.length < 2) {
                signals.push({
                    title: `The Future of ${dom} in the Global Market`,
                    summary: `A comprehensive analysis of how ${dom} is reshaping the industrial landscape in the next 24 months.`,
                    url: 'https://github.com' + '/' + dom.toLowerCase(),
                    source: dom + ' Industry Pulse',
                    company: dom + ' Tech Hub',
                    job: dom + ' Specialist',
                    cat: dom,
                    loc: 'Worldwide',
                    salary: 150000 + Math.floor(Math.random() * 50000),
                    demand: 50 + Math.floor(Math.random() * 50),
                    salary_idx: 10 + Math.floor(Math.random() * 30),
                    match: 70 + Math.floor(Math.random() * 25),
                    logic: `Organic growth in ${dom} driven by digital transformation and increased capital allocation.`
                });
            }
        }

        for (const sig of signals) {
            const expires = new Date();
            expires.setDate(expires.getDate() + 14);

            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, expires_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [sig.title, sig.summary, sig.url, sig.source, sig.company, sig.job, sig.cat, sig.loc, sig.salary, sig.demand, sig.salary_idx, sig.match, sig.logic, expires]
            );
        }
        console.log(`✅ Ultra-Seeding Complete: ${signals.length} signals across ${domains.length} domains.`);

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Ultra-migration failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

migrateToV3Ultra();
