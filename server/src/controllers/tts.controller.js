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

/**
 * Warm Edge TTS connections on boot so first user request is faster.
 */
export async function warmTtsConnection() {
    const voices = ['en-US-AvaNeural', 'en-US-AndrewMultilingualNeural', 'en-US-BrianNeural'];
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

    // Cache hit — send immediately (typically <100ms)
    if (ttsCache.has(key)) {
        const cached = ttsCache.get(key);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': cached.length,
            'Cache-Control': 'public, max-age=86400',
            'X-TTS-Cache': 'HIT',
        });
        return res.send(cached);
    }

    try {
        const communicate = new Communicate(safeText, { voice });
        const chunks = [];

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('X-TTS-Cache', 'MISS');

        for await (const chunk of communicate.stream()) {
            if (chunk.type === 'audio' && chunk.data) {
                chunks.push(Buffer.from(chunk.data));
                res.write(chunk.data);
            }
        }

        res.end();

        const full = Buffer.concat(chunks);
        if (full.length > 500 && ttsCache.size < MAX_CACHE_ENTRIES) {
            ttsCache.set(key, full);
        }
    } catch (error) {
        console.error('[TTS-Module] Synthesis Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate speech. Service might be temporarily unavailable.' });
        } else {
            res.end();
        }
    }
};
