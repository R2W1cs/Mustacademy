import axios from 'axios';
import cron from 'node-cron';
import pool from '../config/db.js';
import { callAI } from '../utils/aiClient.js';
import { MARKET_SIGNAL_SYNTHESIS_PROMPT } from '../utils/aiRules.js';

const SERPAPI_KEY = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;

const CURATED_FALLBACKS = [
    {
        title: 'Cloud & Platform Engineers remain in high demand across US and EU',
        content_summary: 'Hiring managers keep prioritizing Kubernetes, observability, and secure multi-cloud delivery for production CS teams.',
        source_url: 'https://www.linkedin.com/jobs/search/?keywords=Platform%20Engineer%20OR%20Kubernetes%20OR%20%22Site%20Reliability%22',
        source_name: 'LinkedIn Jobs',
        company_name: 'Multi-cloud employers',
        job_title: 'Cloud / Platform Engineer',
        category: 'Cloud',
        location: 'Worldwide',
        salary_value: 165000,
        demand_growth: 72,
        salary_index: 78,
        skill_match: 80,
        impact_logic: 'Students who ship networked services stay closest to open roles.',
    },
    {
        title: 'AI infrastructure roles expand beyond model training',
        content_summary: 'Companies need engineers who can move data, serve models over HTTP/gRPC, and keep latency budgets honest.',
        source_url: 'https://www.linkedin.com/jobs/search/?keywords=%22ML%20Infrastructure%22%20OR%20%22LLM%20Inference%22%20OR%20vLLM',
        source_name: 'LinkedIn Jobs',
        company_name: 'AI product companies',
        job_title: 'ML Infrastructure Engineer',
        category: 'AI',
        location: 'Worldwide',
        salary_value: 180000,
        demand_growth: 85,
        salary_index: 88,
        skill_match: 74,
        impact_logic: 'Networking knowledge is a hidden prerequisite for AI infra jobs.',
    },
    {
        title: 'Cybersecurity hiring favors network-fluent graduates',
        content_summary: 'Blue-team and appsec roles expect fluency with TCP/TLS, DNS abuse, and zero-trust network design.',
        source_url: 'https://www.linkedin.com/jobs/search/?keywords=%22Security%20Engineer%22%20OR%20%22Zero%20Trust%22%20OR%20AppSec',
        source_name: 'LinkedIn Jobs',
        company_name: 'Security orgs',
        job_title: 'Security Engineer',
        category: 'Security',
        location: 'Worldwide',
        salary_value: 155000,
        demand_growth: 68,
        salary_index: 76,
        skill_match: 82,
        impact_logic: 'CS 411 topics map directly to interview screens.',
    },
    {
        title: 'Remote-first startups still pay premium for full-stack + API design',
        content_summary: 'Clear HTTP API design, auth, and performance debugging remain the fastest path into product engineering.',
        source_url: 'https://www.linkedin.com/jobs/search/?f_WT=2&keywords=Full%20Stack%20Engineer%20OR%20%22API%20Design%22',
        source_name: 'LinkedIn Jobs',
        company_name: 'Product startups',
        job_title: 'Full-Stack Engineer',
        category: 'Software',
        location: 'Remote',
        salary_value: 145000,
        demand_growth: 60,
        salary_index: 70,
        skill_match: 86,
        impact_logic: 'HTTP pipeline literacy separates juniors who can debug production.',
    },
    {
        title: 'Edge networking and CDN skills surface in web performance job specs',
        content_summary: 'Teams ask for DNS, TLS, caching, and packet-level intuition when optimizing global web apps.',
        source_url: 'https://www.linkedin.com/jobs/search/?keywords=%22Web%20Performance%22%20OR%20CDN%20OR%20%22Edge%20Engineer%22',
        source_name: 'LinkedIn Jobs',
        company_name: 'Web platform teams',
        job_title: 'Web Performance Engineer',
        category: 'Web',
        location: 'Worldwide',
        salary_value: 150000,
        demand_growth: 55,
        salary_index: 72,
        skill_match: 78,
        impact_logic: 'Networks course foundations explain real TTFB incidents.',
    },
];

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
