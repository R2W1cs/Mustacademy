/**
 * Product feature flags.
 * Flip ENABLE_PODCAST=true when podcast returns as a SaaS/premium product.
 */
export const FEATURES = {
    podcast: process.env.ENABLE_PODCAST === 'true',
};

/** Block podcast APIs while the feature is parked for a later SaaS launch. */
export function requirePodcastEnabled(_req, res, next) {
    if (FEATURES.podcast) return next();
    return res.status(503).json({
        message: 'Podcast is temporarily unavailable. Coming back as a premium feature later.',
        code: 'PODCAST_DISABLED',
    });
}
