import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const domains = [
    'AI', 'Cloud', 'Security', 'Web', 'Mobile', 'Data', 'Embedded',
    'Quantum', 'Fintech', 'Biotech', 'Robotics', 'DevOps', 'Blockchain',
    'AR/VR', 'Green Tech', 'EdTech', 'E-commerce', 'Gaming'
];

const locations = ['USA', 'European Union', 'Switzerland', 'UK', 'Japan', 'UAE', 'Worldwide'];

// Generate REAL, working source URLs that actually exist
const generateSourceUrl = (sourceName, domain, company, jobTitle) => {
    const domainMap = {
        'AI': 'artificial-intelligence',
        'Cloud': 'cloud-computing',
        'Security': 'cybersecurity',
        'Web': 'web-development',
        'Mobile': 'mobile-development',
        'Data': 'data-science',
        'Embedded': 'embedded-systems',
        'Quantum': 'quantum-computing',
        'Fintech': 'fintech',
        'Biotech': 'biotechnology',
        'Robotics': 'robotics',
        'DevOps': 'devops',
        'Blockchain': 'blockchain',
        'AR/VR': 'augmented-reality',
        'Green Tech': 'clean-tech',
        'EdTech': 'edtech',
        'E-commerce': 'ecommerce',
        'Gaming': 'game-development'
    };

    const searchTerm = domainMap[domain] || domain.toLowerCase().replace(/\s+/g, '-');
    const jobSearch = jobTitle.toLowerCase().replace(/\s+/g, '%20');

    const sourceTemplates = {
        'Bloomberg Terminal': `https://www.bloomberg.com/technology`,
        'tietalent.com': `https://www.linkedin.com/jobs/search/?keywords=${jobSearch}`,
        'BioSpace Index': `https://www.biospace.com/jobs`,
        'GitHub Trends': domain === 'AI' ? 'https://github.com/trending/python' :
            domain === 'Web' ? 'https://github.com/trending/javascript' :
                domain === 'Mobile' ? 'https://github.com/trending/kotlin' :
                    'https://github.com/trending',
        'NVIDIA Research': `https://developer.nvidia.com/blog`,
        'PsiQuantum Technical': `https://arxiv.org/list/quant-ph/recent`,
        'Visa Tech Blog': `https://usa.visa.com/visa-everywhere/blog.html`,
        'Google DeepMind': `https://deepmind.google/discover/blog`,
        'Moderna Technical': `https://www.modernatx.com/newsroom`,
        'Boston Dynamics Feed': `https://bostondynamics.com/blog`,
        'OpenTofu Foundation': `https://opentofu.org/blog`,
        'Epic Tech Feed': `https://www.unrealengine.com/en-US/blog`,
        'ConsenSys Research': `https://consensys.io/blog`,
        'Standard Chartered Global': `https://www.sc.com/en/insights`,
        'Massachusetts Biotech News': `https://www.massbio.org/news`
    };

    return sourceTemplates[sourceName] || `https://news.ycombinator.com/newest`;
};

const sources = [
    'Bloomberg Terminal', 'tietalent.com', 'BioSpace Index', 'GitHub Trends',
    'NVIDIA Research', 'PsiQuantum Technical', 'Visa Tech Blog', 'Google DeepMind',
    'Moderna Technical', 'Boston Dynamics Feed', 'OpenTofu Foundation', 'Epic Tech Feed',
    'ConsenSys Research', 'Standard Chartered Global', 'Massachusetts Biotech News'
];

const companies = {
    Quantum: ['IBM Quantum', 'PsiQuantum', 'IonQ', 'Google Quantum AI', 'Rigetti'],
    Biotech: ['Moderna', 'DeepMind', 'Vertex Pharmaceuticals', 'BioNTech', 'Genentech'],
    Robotics: ['Boston Dynamics', 'Figure AI', 'Tesla Optimus', 'ABB Robotics', 'KUKA'],
    Fintech: ['Visa', 'Stripe', 'Standard Chartered', 'Revolut', 'Coinbase'],
    DevOps: ['HashiCorp', 'Red Hat', 'AWS', 'Google Cloud', 'Microsoft'],
    'Green Tech': ['Tesla Energy', 'Vercel', 'NextEra Energy', 'Vestas', 'Orsted'],
    Blockchain: ['ConsenSys', 'Ethereum Foundation', 'Solana Labs', 'Polygon', 'OpenSea'],
    'AR/VR': ['Meta Reality Labs', 'Apple Vision Pro', 'Unity', 'Niantic', 'Unreal Engine'],
    EdTech: ['Coursera', 'Duolingo', 'Udacity', 'Khan Academy', 'MasterClass'],
    'E-commerce': ['Amazon', 'Shopify', 'Mercado Libre', 'Alibaba', 'Wayfair'],
    Gaming: ['Epic Games', 'Electronic Arts', 'Sony Interactive', 'Nintendo', 'Ubisoft'],
    AI: ['OpenAI', 'Anthropic', 'NVIDIA', 'Meta AI', 'Mistral'],
    Cloud: ['AWS', 'Azure', 'Google Cloud', 'Cloudflare', 'DigitalOcean'],
    Security: ['CrowdStrike', 'Palo Alto Networks', 'Zscaler', 'Cloudflare', 'Okta'],
    Web: ['Vercel', 'Netlify', 'Wix', 'Squarespace', 'Webflow'],
    Mobile: ['Apple', 'Google', 'Meta', 'TikTok', 'Snapchat'],
    Data: ['Snowflake', 'Databricks', 'MongoDB', 'Confluent', 'Palantir'],
    Embedded: ['Intel', 'AMD', 'NXP Semiconductors', 'STMicroelectronics', 'ARM']
};

const jobTitles = {
    Quantum: ['Quantum Algorithm Developer', 'Photonics Engineer', 'Qiskit Lead', 'Cryogenic Systems Architect'],
    Biotech: ['Computational Biologist', 'Bioinformatics Engineer', 'Lead Scientist', 'Genetic Pipeline Architect'],
    Robotics: ['Robotics Control Lead', 'Fleet Systems Engineer', 'Embedded Robotics Dev', 'Actuation Logic Specialist'],
    Fintech: ['Payments Architect', 'Fintech Platform Engineer', 'Compliance Logic Lead', 'Transaction Integrity Dev'],
    AI: ['AI Infrastructure Lead', 'LLM Alignment Engineer', 'Neural Logic Designer', 'Inference Optimization Specialist'],
    // ... basic fallbacks
    Default: ['Senior Industrial Lead', 'Principal Architect', 'Full Stack Specialist', 'Domain Lead']
};

const migrateMegaV5 = async () => {
    try {
        console.log('🚀 Initiating Market Intelligence Mega-Seeding v5.0...');

        // Clear existing signals
        await pool.query('DELETE FROM market_news');
        console.log('🧹 Purged legacy signal reservoir.');

        const valuesInput = [];
        let counter = 1;

        for (const dom of domains) {
            console.log(`📡 Synthesizing High-Fidelity Signals for domain: ${dom}...`);
            for (let i = 1; i <= 52; i++) {
                const loc = locations[Math.floor(Math.random() * locations.length)];
                const src = sources[Math.floor(Math.random() * sources.length)];
                const company = companies[dom] ? companies[dom][Math.floor(Math.random() * companies[dom].length)] : dom + ' Labs';
                const job = jobTitles[dom] ? jobTitles[dom][Math.floor(Math.random() * jobTitles[dom].length)] : (dom + ' Specialist');

                const salary = 130000 + Math.floor(Math.random() * 120000);
                const demand = 40 + Math.floor(Math.random() * 110);
                const salary_idx = 10 + Math.floor(Math.random() * 40);
                const match = 65 + Math.floor(Math.random() * 30);

                // Add variety to dates over the last 90 days to test temporal filtering
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 90));

                const title = `Industrial Shift in ${dom}: Signal #${i}`;
                const summary = `Deep market analysis across ${loc} reveals a transformative shift in ${dom} deployment. ${company} is leading a new initiative for ${job} roles, driven by the latest 2024 industrial standards. This signal indicates a surge in demand for specialized skills in ${dom} logic architectures.`;
                const logic = `Research from ${src} indicates that ${dom} is entering a utility-scale phase. The synergy between ${dom} and automated governance is creating a 3:1 talent gap, with salaries in ${loc} rising twice as fast as the global index.`;

                const sourceUrl = generateSourceUrl(src, dom, company, job);

                valuesInput.push([
                    title, summary, sourceUrl, src, company, job, dom, loc,
                    salary, demand, salary_idx, match, logic, new Date(date.getTime() + 1209600000), date
                ]);
            }
        }

        console.log(`📦 Preparing to batch insert ${valuesInput.length} signals...`);

        // Batch insert for performance
        const chunk = 100;
        for (let i = 0; i < valuesInput.length; i += chunk) {
            const currentChunk = valuesInput.slice(i, i + chunk);
            const placeholders = currentChunk.map((_, idx) =>
                `($${idx * 15 + 1}, $${idx * 15 + 2}, $${idx * 15 + 3}, $${idx * 15 + 4}, $${idx * 15 + 5}, $${idx * 15 + 6}, $${idx * 15 + 7}, $${idx * 15 + 8}, $${idx * 15 + 9}, $${idx * 15 + 10}, $${idx * 15 + 11}, $${idx * 15 + 12}, $${idx * 15 + 13}, $${idx * 15 + 14}, $${idx * 15 + 15})`
            ).join(',');

            const flatValues = currentChunk.flat();
            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, expires_at, created_at) 
                 VALUES ${placeholders}`,
                flatValues
            );
        }

        console.log(`✅ Mega-Seeding v5.0 Complete: ${valuesInput.length} signals across 18 specialized domains.`);

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Mega-migration v5.0 failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

migrateMegaV5();
