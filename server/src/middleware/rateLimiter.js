import rateLimit from "express-rate-limit";

// General API limiter — 100 req/min per IP
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Slow down." },
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

// Heavy AI limiter — 20 req/min per IP (chat, synthesis, quiz)
export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "AI request limit reached. Wait a moment before trying again." },
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

// Auth brute-force limiter — 10 attempts per 15 min per IP
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Try again in 15 minutes." },
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

// Expensive AI limiter — 5 req/min per IP (podcast generation, synthesis)
export const heavyAiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Generation limit reached. Please wait 60 seconds." },
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});
