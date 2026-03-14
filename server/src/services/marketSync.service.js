import axios from 'axios';
import cron from 'node-cron';
import pool from '../config/db.js';
import { callAI } from '../utils/aiClient.js';
import { MARKET_SIGNAL_SYNTHESIS_PROMPT } from '../utils/aiRules.js';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export const syncMarketPulse = async (options = {}) => {
    const {
        domain = 'Computer Science',
        category = null,
        location = null,
        limit = 20
    } = options;

    try {
        console.log(`[MarketSync] Initiating sync for domain: ${domain}, Category: ${category}, Location: ${location}...`);

        if (!SERPAPI_KEY) {
            throw new Error('SERPAPI_KEY is missing from environment');
        }

        // Construct a surgical query based on filters
        let searchQuery = `${domain} technology breakthroughs 2026`;
        if (category && category !== 'all') {
            searchQuery = `${category} breakthroughs and innovations 2026`;
        }
        if (location && location !== 'all') {
            searchQuery += ` in ${location}`;
        }

        // 1. Fetch News via SerpApi
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'google_news',
                q: searchQuery,
                api_key: SERPAPI_KEY
            }
        });

        const newsResults = response.data.news_results;
        if (!newsResults || newsResults.length === 0) {
            console.warn('[MarketSync] No news results found.');
            return { message: 'No new signals found' };
        }

        // 2. Prepare for AI Processing (Batching to increase signal density)
        const totalToProcess = Math.min(limit, newsResults.length);
        const batchSize = 10;
        const allSynthesized = [];

        console.log(`[MarketSync] Processing ${totalToProcess} raw results in batches of ${batchSize}...`);

        for (let i = 0; i < totalToProcess; i += batchSize) {
            const batch = newsResults.slice(i, i + batchSize).map(r => ({
                title: r.title,
                source: r.source,
                link: r.link,
                snippet: r.snippet,
                date: r.date
            }));

            const prompt = MARKET_SIGNAL_SYNTHESIS_PROMPT
                .replace('{domain}', domain)
                .replace('{search_results}', JSON.stringify(batch, null, 2))
                .replace('{target_category}', category || 'CS')
                .replace('{target_location}', location || 'Worldwide');

            const batchSignals = await callAI(prompt);

            // Robust extraction for batch
            let extracted = batchSignals;
            if (!Array.isArray(extracted)) {
                const firstArrayKey = Object.keys(extracted).find(key => Array.isArray(extracted[key]));
                if (firstArrayKey) {
                    extracted = extracted[firstArrayKey];
                } else if (extracted.title && (extracted.content_summary || extracted.impact_logic)) {
                    extracted = [extracted];
                } else {
                    extracted = [];
                }
            }
            allSynthesized.push(...extracted);
        }

        // 4. Update Database
        console.log(`[MarketSync] Updating database with ${allSynthesized.length} synthesized signals...`);
        let addedCount = 0;

        for (const sig of allSynthesized) {
            try {
                const expires = new Date();
                expires.setDate(expires.getDate() + 14);

                await pool.query(
                    `INSERT INTO market_news 
                     (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, expires_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                     ON CONFLICT (title) DO NOTHING`,
                    [
                        sig.title,
                        sig.content_summary,
                        sig.source_url,
                        sig.source_name,
                        sig.company_name,
                        sig.job_title,
                        sig.category,
                        sig.location || location || 'Worldwide',
                        sig.salary_value || 150000,
                        sig.demand_growth || 50,
                        sig.salary_index || 50,
                        sig.skill_match || 75,
                        sig.impact_logic,
                        expires
                    ]
                );
                addedCount++;
            } catch (innerErr) {
                console.error(`[MarketSync] Failed to insert signal: ${sig.title}`, innerErr.message);
            }
        }

        return {
            success: true,
            raw_count: newsResults.length,
            synthesized_count: allSynthesized.length,
            added_count: addedCount
        };

    } catch (err) {
        console.error('[MarketSync] Critical Error:', err);
        throw err;
    }
};

// Daily Automated Sync at Midnight (00:00)
cron.schedule('0 0 * * *', () => {
    console.log('[Cron] Initiating scheduled daily market sync...');
    syncMarketPulse({ domain: 'Computer Science' })
        .then(res => console.log('[Cron] Daily sync successful:', res.added_count, 'signals added.'))
        .catch(err => console.error('[Cron] Daily sync failed:', err.message));
});
