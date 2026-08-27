import { Communicate } from 'edge-tts-universal';

/** In-memory cache — instant replay for repeated phrases */
const ttsCache = new Map();
const MAX_CACHE_ENTRIES = 800;
const MAX_CACHE_TEXT = 4000;

function cacheKey(voice, text) {
    return `${voice}:${text}`;
}

function trimForCache(text) {
    if (text.length <= MAX_CACHE_TEXT) return text;
    return text.slice(0, MAX_CACHE_TEXT);
}

function setAudioHeaders(res, extra = {}) {
    const origin = res.req?.headers?.origin;
    res.set({
        'Content-Type': 'audio/mpeg',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        ...(origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' } : {}),
        ...extra,
    });
}

/**
 * Warm Edge TTS connections on boot so first user request is faster.
 */
export async function warmTtsConnection() {
    const voices = ['en-US-AvaNeural', 'en-US-AndrewMultilingualNeural', 'en-US-BrianNeural', 'en-US-JennyNeural'];
    for (const voice of voices) {
        try {
            const communicate = new Communicate('Ready.', { voice });
            for await (const chunk of communicate.stream()) {
                if (chunk.type === 'audio' && chunk.data?.length > 100) break;
            }
            console.log(`[TTS-Module] Warmed ${voice}`);
        } catch (e) {
            console.warn(`[TTS-Module] Warm-up skipped for ${voice}:`, e.message);
        }
    }
}

/**
 * Controller for Standalone Neural TTS
 * Converts text to high-quality speech using Microsoft Edge Neural voices.
 */
export const generateTTS = async (req, res) => {
    const { text, voice = 'en-US-AvaNeural' } = req.method === 'GET' ? req.query : req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required for synthesis.' });
    }

    const safeText = trimForCache(String(text));
    const key = cacheKey(voice, safeText);

    console.log(`[TTS-Module] Synthesizing (${safeText.length} chars) voice=${voice}`);

    if (ttsCache.has(key)) {
        const cached = ttsCache.get(key);
        setAudioHeaders(res, {
            'Content-Length': cached.length,
            'Cache-Control': 'public, max-age=86400',
            'X-TTS-Cache': 'HIT',
        });
        return res.send(cached);
    }

    try {
        const communicate = new Communicate(safeText, { voice });
        const chunks = [];

        // Buffer fully then send — reliable for cross-origin audio / blob clients
        for await (const chunk of communicate.stream()) {
            if (chunk.type === 'audio' && chunk.data) {
                chunks.push(Buffer.from(chunk.data));
            }
        }

        const full = Buffer.concat(chunks);
        if (full.length > 500 && ttsCache.size < MAX_CACHE_ENTRIES) {
            ttsCache.set(key, full);
        }

        setAudioHeaders(res, {
            'Content-Length': full.length,
            'Cache-Control': 'public, max-age=3600',
            'X-TTS-Cache': 'MISS',
        });
        return res.send(full);
    } catch (error) {
        console.error('[TTS-Module] Synthesis Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate speech. Service might be temporarily unavailable.' });
        } else {
            res.end();
        }
    }
};
