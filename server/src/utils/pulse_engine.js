import axios from 'axios';
import { fileURLToPath } from 'url';
import pool from "../config/db.js";

/**
 * PulseEngine: High-Fidelity Market Signal Orchestrator
 * Fetches real-time technical telemetry from GitHub and Hacker News.
 */
export const fetchGitHubTrends = async () => {
    try {
        console.log('📡 Fetching GitHub Trends (Top Repos)...');
        // Search for repositories created in the last 7 days with > 100 stars
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const formattedDate = date.toISOString().split('T')[0];

        const response = await axios.get(`https://api.github.com/search/repositories`, {
            params: {
                q: `created:>${formattedDate} stars:>50`,
                sort: 'stars',
                order: 'desc',
                per_page: 10
            },
            headers: {
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const repos = response.data.items;
        for (const repo of repos) {
            const externalId = `github_${repo.id}`;
            const metrics = { stars: repo.stargazers_count, forks: repo.forks_count, language: repo.language };

            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, trend_context, verification_type, external_id, live_metrics, is_live) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                 ON CONFLICT (external_id) DO UPDATE SET 
                    live_metrics = EXCLUDED.live_metrics,
                    title = EXCLUDED.title,
                    content_summary = EXCLUDED.content_summary`,
                [
                    `GitHub Trend: ${repo.name}`,
                    repo.description || `New trending repository in ${repo.language}.`,
                    repo.html_url,
                    'GitHub',
                    repo.owner.login,
                    'Open Source Maintainer / Core Dev',
                    repo.language || 'Software',
                    'Worldwide',
                    0, 100, 0, 80,
                    `Rapid community adoption on GitHub suggests a significant shift or new tool in the ${repo.language} ecosystem.`,
                    `Real-time GitHub Search API: >${repo.stargazers_count} stars in 7 days.`,
                    'Live Repo Metric',
                    externalId,
                    JSON.stringify(metrics),
                    true
                ]
            );
        }
        console.log(`✅ GitHub Trends Processed: ${repos.length} signals.`);
    } catch (error) {
        console.error('❌ GitHub Trends failed:', error.message);
    }
};

export const fetchHackerNewsTop = async () => {
    try {
        console.log('📡 Fetching Hacker News Top Stories...');
        // Use hnrss.org for easy JSON access to top stories
        const response = await axios.get('https://hnrss.org/frontpage.json?points=100');
        const stories = response.data.items;

        for (const story of stories) {
            const externalId = `hn_${story.guid}`;
            const metrics = { points: story.points, comments: story.comments };

            await pool.query(
                `INSERT INTO market_news 
                 (title, content_summary, source_url, source_name, company_name, job_title, category, location, salary_value, demand_growth, salary_index, skill_match, impact_logic, trend_context, verification_type, external_id, live_metrics, is_live) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                 ON CONFLICT (external_id) DO UPDATE SET 
                    live_metrics = EXCLUDED.live_metrics,
                    title = EXCLUDED.title,
                    content_summary = EXCLUDED.content_summary`,
                [
                    story.title,
                    story.description || 'High-fidelity technical discussion on Hacker News.',
                    story.link,
                    'Hacker News',
                    'Community Search',
                    'Industrial Lead / Researcher',
                    'CS Research',
                    'Worldwide',
                    0, 100, 0, 75,
                    `High engagement on Hacker News indicates a topic of critical interest to the engineering community.`,
                    `hnrss.org Frontpage: ${story.points} points.`,
                    'Live Discussion',
                    externalId,
                    JSON.stringify(metrics),
                    true
                ]
            );
        }
        console.log(`✅ Hacker News Processed: ${stories.length} signals.`);
    } catch (error) {
        console.error('❌ Hacker News failed:', error.message);
    }
};

export const runPulseEngine = async () => {
    await fetchGitHubTrends();
    await fetchHackerNewsTop();
    console.log('📅 Live Pulse Engine Run Complete.');
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runPulseEngine().then(() => process.exit(0)).catch(() => process.exit(1));
}
