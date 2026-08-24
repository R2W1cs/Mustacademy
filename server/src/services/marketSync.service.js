import axios from 'axios';
import cron from 'node-cron';
import pool from '../config/db.js';
import { callAI } from '../utils/aiClient.js';
import { MARKET_SIGNAL_SYNTHESIS_PROMPT } from '../utils/aiRules.js';

const SERPAPI_KEY = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;

const CURATED_FALLBACKS = [
    {
        title: 'Agentic AI tooling races ahead across developer platforms',
        content_summary: 'New agent frameworks and tool-calling APIs are changing how teams automate research, coding, and ops workflows.',
        source_url: 'https://techcrunch.com/category/artificial-intelligence/',
        source_name: 'TechCrunch',
        company_name: 'AI industry',
        job_title: 'AI Engineer',
        category: 'AI',
        location: 'USA',
        salary_value: 185000,
        demand_growth: 88,
        salary_index: 90,
        skill_match: 78,
        impact_logic: 'Ship with LLM APIs and eval harnesses — employers want production agents, not demos.',
    },
    {
        title: 'EU AI Act compliance drives governance and audit tooling demand',
        content_summary: 'European firms are investing in model registries, risk scoring, and audit trails as regulation phases in.',
        source_url: 'https://www.reuters.com/technology/',
        source_name: 'Reuters Technology',
        company_name: 'EU enterprises',
        job_title: 'AI Governance Analyst',
        category: 'AI',
        location: 'Europe',
        salary_value: 140000,
        demand_growth: 70,
        salary_index: 72,
        skill_match: 75,
        impact_logic: 'Pair ML literacy with regulation awareness for EU AI roles.',
    },
    {
        title: 'Asia hyperscalers expand sovereign GPU cloud regions',
        content_summary: 'Regional providers are launching residency-aware AI clusters across Singapore, Tokyo, and the Gulf.',
        source_url: 'https://www.zdnet.com/topic/cloud/',
        source_name: 'ZDNet',
        company_name: 'Hyperscalers',
        job_title: 'Cloud AI Platform Engineer',
        category: 'AI',
        location: 'Asia',
        salary_value: 155000,
        demand_growth: 76,
        salary_index: 80,
        skill_match: 74,
        impact_logic: 'GPU ops + Kubernetes skills travel well in Asia cloud markets.',
    },
    {
        title: 'Platform engineering and GitOps remain the cloud hiring default',
        content_summary: 'Internal developer platforms and declarative delivery pipelines dominate modern cloud job specs.',
        source_url: 'https://www.cncf.io/blog/',
        source_name: 'CNCF Blog',
        company_name: 'Platform teams',
        job_title: 'Platform Engineer',
        category: 'Cloud',
        location: 'Remote',
        salary_value: 165000,
        demand_growth: 72,
        salary_index: 78,
        skill_match: 84,
        impact_logic: 'A small IDP or Helm/GitOps portfolio proves platform fluency.',
    },
    {
        title: 'FinOps moves from niche to board-level cloud priority',
        content_summary: 'Leaders want engineers who cut spend without hurting reliability — rightsizing, spot, and tagging matter.',
        source_url: 'https://www.infoworld.com/category/cloud-computing/',
        source_name: 'InfoWorld',
        company_name: 'Enterprise IT',
        job_title: 'Cloud FinOps Engineer',
        category: 'Cloud',
        location: 'USA',
        salary_value: 150000,
        demand_growth: 65,
        salary_index: 74,
        skill_match: 80,
        impact_logic: 'Combine cloud basics with cost observability projects.',
    },
    {
        title: 'European cloud sovereignty projects accelerate after major outages',
        content_summary: 'Banks and public sector teams diversify away from single-provider dependency.',
        source_url: 'https://www.theregister.com/software/cloud_native/',
        source_name: 'The Register',
        company_name: 'EU public sector',
        job_title: 'Cloud Architect',
        category: 'Cloud',
        location: 'Europe',
        salary_value: 145000,
        demand_growth: 62,
        salary_index: 70,
        skill_match: 82,
        impact_logic: 'Multi-cloud IAM and networking design is high-signal in Europe.',
    },
    {
        title: 'Zero Trust identity architectures replace perimeter security models',
        content_summary: 'Continuous verification and least privilege keep showing up after high-profile breaches.',
        source_url: 'https://www.darkreading.com/',
        source_name: 'Dark Reading',
        company_name: 'Security orgs',
        job_title: 'Zero Trust Engineer',
        category: 'Security',
        location: 'USA',
        salary_value: 160000,
        demand_growth: 74,
        salary_index: 80,
        skill_match: 83,
        impact_logic: 'Learn OIDC, mTLS, and policy engines (OPA) — they appear in interviews.',
    },
    {
        title: 'Post-quantum cryptography pilots begin in finance and government',
        content_summary: 'NIST standards are moving into TLS/PKI upgrade roadmaps for regulated industries.',
        source_url: 'https://spectrum.ieee.org/',
        source_name: 'IEEE Spectrum',
        company_name: 'Finance & government',
        job_title: 'Applied Cryptographer',
        category: 'Security',
        location: 'Europe',
        salary_value: 170000,
        demand_growth: 68,
        salary_index: 85,
        skill_match: 70,
        impact_logic: 'A small PQC demo stands out on student portfolios.',
    },
    {
        title: 'Asia ransomware waves boost MDR and SOC automation hiring',
        content_summary: 'SOCs want analysts who can script detections — not only click dashboards.',
        source_url: 'https://www.bleepingcomputer.com/',
        source_name: 'BleepingComputer',
        company_name: 'MDR vendors',
        job_title: 'SOC Automation Engineer',
        category: 'Security',
        location: 'Asia',
        salary_value: 130000,
        demand_growth: 71,
        salary_index: 68,
        skill_match: 79,
        impact_logic: 'Python + SIEM query skills beat generic certificate stacks.',
    },
    {
        title: 'WebAssembly and edge runtimes reshape modern web delivery',
        content_summary: 'Teams experiment with Wasm at the edge for safer plugins and lower TTFB.',
        source_url: 'https://web.dev/blog/',
        source_name: 'web.dev',
        company_name: 'Web platforms',
        job_title: 'Edge Web Engineer',
        category: 'Web',
        location: 'Remote',
        salary_value: 148000,
        demand_growth: 58,
        salary_index: 72,
        skill_match: 81,
        impact_logic: 'Ship a Wasm or edge-function project to prove performance intuition.',
    },
    {
        title: 'Core Web Vitals and accessibility remain frontend hiring filters',
        content_summary: 'Product companies still screen for LCP/INP literacy and inclusive UI — not only framework trivia.',
        source_url: 'https://www.smashingmagazine.com/',
        source_name: 'Smashing Magazine',
        company_name: 'Product companies',
        job_title: 'Frontend Engineer',
        category: 'Web',
        location: 'USA',
        salary_value: 140000,
        demand_growth: 55,
        salary_index: 70,
        skill_match: 86,
        impact_logic: 'Measure and fix real CWV on a portfolio site.',
    },
    {
        title: 'European privacy-first adtech and open-web stacks keep evolving',
        content_summary: 'First-party data and consent-aware architectures create roles at publishers and platforms.',
        source_url: 'https://www.theverge.com/tech',
        source_name: 'The Verge',
        company_name: 'Publishers / adtech',
        job_title: 'Privacy Web Engineer',
        category: 'Web',
        location: 'Europe',
        salary_value: 135000,
        demand_growth: 52,
        salary_index: 68,
        skill_match: 77,
        impact_logic: 'Understand cookies, consent, and first-party data flows.',
    },
    {
        title: 'On-device ML creates new mobile inference engineering roles',
        content_summary: 'OEMs and app studios need engineers who run models offline under strict battery budgets.',
        source_url: 'https://developer.android.com/',
        source_name: 'Android Developers',
        company_name: 'Mobile OEMs',
        job_title: 'On-device ML Engineer',
        category: 'Mobile',
        location: 'Asia',
        salary_value: 155000,
        demand_growth: 73,
        salary_index: 78,
        skill_match: 72,
        impact_logic: 'TFLite/Core ML demos beat generic todo apps.',
    },
    {
        title: 'Flutter and Kotlin Multiplatform keep winning cross-platform teams',
        content_summary: 'Startups share UI/business logic to ship faster without doubling mobile headcount.',
        source_url: 'https://kotlinlang.org/docs/multiplatform.html',
        source_name: 'Kotlin',
        company_name: 'Startups',
        job_title: 'Cross-Platform Mobile Engineer',
        category: 'Mobile',
        location: 'Remote',
        salary_value: 142000,
        demand_growth: 60,
        salary_index: 71,
        skill_match: 85,
        impact_logic: 'One polished KMP/Flutter app beats five unfinished native clones.',
    },
    {
        title: 'US mobile privacy APIs keep forcing analytics redesigns',
        content_summary: 'Platform privacy rules push mobile engineers toward first-party and privacy-preserving measurement.',
        source_url: 'https://developer.apple.com/news/',
        source_name: 'Apple Developer',
        company_name: 'Consumer apps',
        job_title: 'Mobile Privacy Engineer',
        category: 'Mobile',
        location: 'USA',
        salary_value: 150000,
        demand_growth: 57,
        salary_index: 74,
        skill_match: 80,
        impact_logic: 'Show you can ship analytics that respect platform privacy rules.',
    },
    {
        title: 'Lakehouse formats dominate modern analytics platforms',
        content_summary: 'Iceberg/Delta + streaming is now the default architecture in data engineering job posts.',
        source_url: 'https://www.databricks.com/blog',
        source_name: 'Databricks Blog',
        company_name: 'Data platforms',
        job_title: 'Data Platform Engineer',
        category: 'Data',
        location: 'USA',
        salary_value: 170000,
        demand_growth: 75,
        salary_index: 84,
        skill_match: 76,
        impact_logic: 'Spark + Iceberg/Delta skills show up in most data eng JD lists.',
    },
    {
        title: 'European data residency rules reshape analytics architectures',
        content_summary: 'GDPR and sector rules push region-locked warehouses and careful PII pipelines.',
        source_url: 'https://www.nature.com/subjects/computer-science',
        source_name: 'Nature',
        company_name: 'Regulated industries',
        job_title: 'Privacy Data Engineer',
        category: 'Data',
        location: 'Europe',
        salary_value: 145000,
        demand_growth: 64,
        salary_index: 73,
        skill_match: 78,
        impact_logic: 'Data contracts + anonymization projects signal maturity to EU employers.',
    },
    {
        title: 'Real-time feature stores unlock streaming ML in production',
        content_summary: 'Low-latency feature pipelines need Flink/Kafka literacy plus online store design.',
        source_url: 'https://www.confluent.io/blog/',
        source_name: 'Confluent Blog',
        company_name: 'ML platforms',
        job_title: 'Streaming Data Engineer',
        category: 'Data',
        location: 'Remote',
        salary_value: 165000,
        demand_growth: 70,
        salary_index: 82,
        skill_match: 74,
        impact_logic: 'A Kafka/Flink mini project beats notebook-only ML portfolios.',
    },
    {
        title: 'AI product roles boom as companies industrialize copilots',
        content_summary: 'Business units need people who understand evals, latency, and ROI — not only roadmaps.',
        source_url: 'https://hbr.org/topic/subject/artificial-intelligence',
        source_name: 'Harvard Business Review',
        company_name: 'Enterprises',
        job_title: 'AI Product Manager',
        category: 'Business',
        location: 'USA',
        salary_value: 160000,
        demand_growth: 80,
        salary_index: 86,
        skill_match: 70,
        impact_logic: 'Pair CS fundamentals with product sense and measured AI features.',
    },
    {
        title: 'Remote digital transformation consultancies hire bilingual tech leads',
        content_summary: 'Clients want architects who translate cloud/AI options into board-ready business cases.',
        source_url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights',
        source_name: 'McKinsey Digital',
        company_name: 'Consulting',
        job_title: 'Digital Transformation Lead',
        category: 'Business',
        location: 'Remote',
        salary_value: 155000,
        demand_growth: 59,
        salary_index: 80,
        skill_match: 72,
        impact_logic: 'Practice crisp tech-to-business writing — rare and valuable.',
    },
    {
        title: 'Asia digital banks and fintech keep expanding engineering orgs',
        content_summary: 'Payments, KYC, and fraud ML create hybrid business-engineering roles across SEA and India.',
        source_url: 'https://www.techinasia.com/',
        source_name: 'Tech in Asia',
        company_name: 'Fintech',
        job_title: 'Fintech Engineer',
        category: 'Business',
        location: 'Asia',
        salary_value: 125000,
        demand_growth: 66,
        salary_index: 65,
        skill_match: 80,
        impact_logic: 'Payments systems + secure APIs open doors in Asian fintech.',
    },
    {
        title: 'MIT research advances efficient LLM training and distillation',
        content_summary: 'New work on sparsity and distillation lowers inference cost for startups and labs.',
        source_url: 'https://news.mit.edu/topic/artificial-intelligence2',
        source_name: 'MIT News',
        company_name: 'Research labs',
        job_title: 'ML Research Engineer',
        category: 'AI',
        location: 'USA',
        salary_value: 175000,
        demand_growth: 69,
        salary_index: 88,
        skill_match: 73,
        impact_logic: 'Reproduce a paper result — stronger than tutorial-only repos.',
    },
    {
        title: 'Open-source supply-chain security tooling hits enterprise RFPs',
        content_summary: 'SBOM, signed artifacts, and scanners move from niche to mandatory in many procurement checklists.',
        source_url: 'https://arstechnica.com/information-technology/',
        source_name: 'Ars Technica',
        company_name: 'Enterprise IT',
        job_title: 'AppSec Engineer',
        category: 'Security',
        location: 'Remote',
        salary_value: 152000,
        demand_growth: 67,
        salary_index: 76,
        skill_match: 81,
        impact_logic: 'Add SBOM + CI security scanning to a personal project.',
    },
    {
        title: 'Climate-tech software hiring needs builders who understand domain constraints',
        content_summary: 'Carbon accounting, grid software, and industrial IoT need CS talent beyond generic CRUD apps.',
        source_url: 'https://www.wired.com/tag/climate-change/',
        source_name: 'Wired',
        company_name: 'Climate tech',
        job_title: 'Climate Software Engineer',
        category: 'Business',
        location: 'Europe',
        salary_value: 138000,
        demand_growth: 61,
        salary_index: 70,
        skill_match: 75,
        impact_logic: 'Domain + CS crossover skills differentiate you in climate tech.',
    },
]

const extendExpiry = (days = 21) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    return expires;
};

async function reviveExpiredSignals(limit = 50) {
    const result = await pool.query(
        `UPDATE market_news
         SET expires_at = $1
         WHERE id IN (
           SELECT id FROM market_news
           ORDER BY created_at DESC
           LIMIT $2
         )
         RETURNING id`,
        [extendExpiry(21), limit]
    );
    return result.rowCount || 0;
}

async function upsertSignals(signals, location) {
    let added = 0;
    let refreshed = 0;
    for (const sig of signals) {
        if (!sig?.title) continue;
        try {
            const result = await pool.query(
                `INSERT INTO market_news
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location,
                  salary_value, demand_growth, salary_index, skill_match, impact_logic, expires_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
                 ON CONFLICT (title) DO UPDATE SET
                   content_summary = EXCLUDED.content_summary,
                   expires_at = EXCLUDED.expires_at,
                   impact_logic = COALESCE(EXCLUDED.impact_logic, market_news.impact_logic)
                 RETURNING (xmax = 0) AS inserted`,
                [
                    sig.title,
                    sig.content_summary || sig.title,
                    sig.source_url || null,
                    sig.source_name || 'Unknown',
                    sig.company_name || null,
                    sig.job_title || null,
                    sig.category || 'CS',
                    sig.location || location || 'Worldwide',
                    sig.salary_value || 150000,
                    sig.demand_growth || 50,
                    sig.salary_index || 50,
                    sig.skill_match || 75,
                    sig.impact_logic || null,
                    extendExpiry(21),
                ]
            );
            if (result.rows[0]?.inserted) added += 1;
            else refreshed += 1;
        } catch (innerErr) {
            console.error(`[MarketSync] Upsert failed for "${sig.title}":`, innerErr.message);
        }
    }
    return { added, refreshed };
}

async function ensureLiveFeed(warning, location) {
    const liveCheck = await pool.query(
        `SELECT count(*)::int AS n FROM market_news WHERE expires_at > NOW()`
    );
    let revived_count = 0;
    let fallback_count = 0;
    if ((liveCheck.rows[0]?.n || 0) === 0 || warning) {
        revived_count = await reviveExpiredSignals(50);
        const fb = await upsertSignals(CURATED_FALLBACKS, location);
        fallback_count = fb.added + fb.refreshed;
    }
    const liveAfter = await pool.query(
        `SELECT count(*)::int AS n FROM market_news WHERE expires_at > NOW()`
    );
    return {
        revived_count,
        fallback_count,
        live_count: liveAfter.rows[0]?.n || 0,
    };
}

export const syncMarketPulse = async (options = {}) => {
    const {
        domain = 'Computer Science',
        category = null,
        location = null,
        limit = 20,
    } = options;

    console.log(`[MarketSync] Initiating sync for domain: ${domain}, Category: ${category}, Location: ${location}...`);

    let warning = null;
    let rawCount = 0;
    let synthesizedCount = 0;
    let addedCount = 0;
    let refreshedCount = 0;

    try {
        if (!SERPAPI_KEY) {
            throw Object.assign(new Error('SERPAPI_KEY is missing from environment'), { code: 'MISSING_KEY' });
        }

        let searchQuery = `${domain} technology breakthroughs 2026`;
        if (category && category !== 'all') {
            searchQuery = `${category} breakthroughs and innovations 2026`;
        }
        if (location && location !== 'all') {
            searchQuery += ` in ${location}`;
        }

        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'google_news',
                q: searchQuery,
                api_key: SERPAPI_KEY,
            },
            timeout: 20000,
            validateStatus: () => true,
        });

        if (response.status === 401 || response.status === 403) {
            throw Object.assign(
                new Error('SerpAPI key rejected (401/403). Update SERPAPI_KEY on the server.'),
                { code: 'SERPAPI_AUTH' }
            );
        }
        if (response.status >= 400) {
            throw Object.assign(
                new Error(`SerpAPI HTTP ${response.status}: ${response.data?.error || 'request failed'}`),
                { code: 'SERPAPI_HTTP' }
            );
        }

        const newsResults = response.data.news_results;
        if (!newsResults || newsResults.length === 0) {
            warning = 'SerpAPI returned 0 headlines';
        } else {
            rawCount = newsResults.length;
            const totalToProcess = Math.min(Math.min(limit, 10), newsResults.length);
            const batchSize = 5;
            const allSynthesized = [];
            console.log(`[MarketSync] Processing ${totalToProcess} raw results in batches of ${batchSize}...`);

            for (let i = 0; i < totalToProcess; i += batchSize) {
                const batch = newsResults.slice(i, i + batchSize).map((r) => ({
                    title: r.title,
                    source: r.source,
                    link: r.link,
                    snippet: r.snippet,
                    date: r.date,
                }));

                const prompt = MARKET_SIGNAL_SYNTHESIS_PROMPT
                    .replace('{domain}', domain)
                    .replace('{search_results}', JSON.stringify(batch, null, 2))
                    .replace('{target_category}', category || 'CS')
                    .replace('{target_location}', location || 'Worldwide');

                let batchSignals;
                try {
                    batchSignals = await Promise.race([
                        callAI(prompt),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('AI synthesis timed out after 45s')), 45000)
                        ),
                    ]);
                } catch (aiErr) {
                    console.warn(`[MarketSync] AI batch failed (${aiErr.message}); inserting raw headlines as fallback`);
                    allSynthesized.push(...batch.map((r) => ({
                        title: r.title,
                        content_summary: r.snippet || r.title,
                        source_url: r.link,
                        source_name: typeof r.source === 'string' ? r.source : r.source?.name,
                        category: category || 'CS',
                        location: location || 'Worldwide',
                        impact_logic: 'Raw news ingest — AI synthesis unavailable.',
                        salary_value: 150000,
                        demand_growth: 50,
                        salary_index: 50,
                        skill_match: 70,
                    })));
                    continue;
                }

                let extracted = batchSignals;
                if (!Array.isArray(extracted)) {
                    const firstArrayKey = Object.keys(extracted || {}).find((key) => Array.isArray(extracted[key]));
                    if (firstArrayKey) extracted = extracted[firstArrayKey];
                    else if (extracted?.title && (extracted.content_summary || extracted.impact_logic)) extracted = [extracted];
                    else extracted = [];
                }
                allSynthesized.push(...extracted);
            }

            synthesizedCount = allSynthesized.length;
            console.log(`[MarketSync] Upserting ${allSynthesized.length} synthesized signals...`);
            const up = await upsertSignals(allSynthesized, location);
            addedCount = up.added;
            refreshedCount = up.refreshed;
        }
    } catch (err) {
        warning = err.message;
        console.warn('[MarketSync] Live ingest unavailable:', err.message);
    }

    const recovery = await ensureLiveFeed(warning, location);

    return {
        success: true,
        raw_count: rawCount,
        synthesized_count: synthesizedCount,
        added_count: addedCount,
        refreshed_count: refreshedCount,
        revived_count: recovery.revived_count,
        fallback_count: recovery.fallback_count,
        live_count: recovery.live_count,
        warning: warning || undefined,
        message: warning
            ? `Live news unavailable (${warning}). Showing ${recovery.live_count} recovered signals.`
            : `Synced ${addedCount} new / ${refreshedCount} refreshed signals (${recovery.live_count} live).`,
    };
};

cron.schedule('0 0 * * *', () => {
    console.log('[Cron] Initiating scheduled daily market sync...');
    syncMarketPulse({ domain: 'Computer Science' })
        .then((res) => console.log('[Cron] Daily sync successful:', res))
        .catch((err) => console.error('[Cron] Daily sync failed:', err.message));
});
