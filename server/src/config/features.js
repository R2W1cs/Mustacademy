/**
 * Product feature flags.
 * Podcast + Dr. Nova lessons are free for all authenticated users for now.
 * Set ENABLE_PODCAST=false to kill-switch podcast/Nova audio APIs.
 * Later SaaS: gate with requirePremium again and/or plan checks.
 */
export const FEATURES = {
    podcast: process.env.ENABLE_PODCAST !== 'false',
};

export function requirePodcastEnabled(_req, res, next) {
    if (FEATURES.podcast) return next();
    return res.status(503).json({
        message: 'Podcast is temporarily unavailable.',
        code: 'PODCAST_DISABLED',
    });
}
