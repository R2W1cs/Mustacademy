/**
 * Neural TTS playback via authenticated POST → blob URL.
 * Avoids cross-origin <audio src="/tts?..."> which Chrome blocks with
 * ERR_BLOCKED_BY_RESPONSE.NotSameOrigin under CORP/same-origin policies.
 */

import api from '../api/axios';

/** Safe max chars per request */
const MAX_CHUNK = 900;

export function cleanSpeechText(text) {
    return String(text || '')
        .replace(/```[\s\S]*?```/g, ' code block ')
        .replace(/\*\*/g, '')
        .replace(/###?\s/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[PAUSE\]/g, '')
        .replace(/\[SPEED:[\d.]+\]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
}

function trimForChunk(text) {
    if (text.length <= MAX_CHUNK) return text;
    const cut = text.slice(0, MAX_CHUNK);
    const lastStop = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'));
    return lastStop > 60 ? cut.slice(0, lastStop + 1) : cut;
}

/** @deprecated kept for callers that still build GET URLs — prefer fetchTtsObjectUrl */
export function buildTtsUrl(text, voice) {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const base = import.meta.env.VITE_API_URL
        || (isProduction ? 'https://mustacademy-backend.onrender.com/api' : 'http://localhost:5000/api');
    const payload = trimForChunk(cleanSpeechText(text));
    return `${base.replace(/\/$/, '')}/tts?text=${encodeURIComponent(payload)}&voice=${encodeURIComponent(voice)}`;
}

export function splitSpeechChunks(text, maxLen = 320) {
    const clean = cleanSpeechText(text);
    if (clean.length <= maxLen) return [clean];

    const parts = clean.match(/[^.!?]+[.!?]+|\S+/g) || [clean];
    const chunks = [];
    let buf = '';

    for (const part of parts) {
        if ((buf + part).length > maxLen && buf) {
            chunks.push(buf.trim());
            buf = part;
        } else {
            buf += part;
        }
    }
    if (buf.trim()) chunks.push(buf.trim());
    return chunks.length ? chunks : [clean.slice(0, maxLen)];
}

const blobUrlCache = new Map();

export async function fetchTtsObjectUrl(text, voice) {
    const clean = trimForChunk(cleanSpeechText(text));
    const key = `${voice}:${clean}`;
    if (blobUrlCache.has(key)) return blobUrlCache.get(key);

    const res = await api.post(
        '/tts',
        { text: clean, voice },
        { responseType: 'blob', timeout: 60000 }
    );
    if (!(res.data instanceof Blob) || res.data.size < 200) {
        throw new Error('Empty TTS audio');
    }
    const url = URL.createObjectURL(res.data);
    if (blobUrlCache.size > 40) {
        const oldest = blobUrlCache.keys().next().value;
        const oldUrl = blobUrlCache.get(oldest);
        blobUrlCache.delete(oldest);
        try { URL.revokeObjectURL(oldUrl); } catch { /* ignore */ }
    }
    blobUrlCache.set(key, url);
    return url;
}

export function prefetchTts(text, voice) {
    fetchTtsObjectUrl(text, voice).catch(() => null);
    return null;
}

/**
 * Play one TTS clip via blob URL (same-origin object URL → no CORP block).
 */
export function playStreamingTts(text, voice, {
    audioRef,
    onPlay,
    onEnded,
    onError,
    playbackRate = 1,
} = {}) {
    let stopped = false;
    let audio = null;
    let objectUrl = null;

    const cleanupSrc = () => {
        if (objectUrl && !blobUrlCache.has(`${voice}:${trimForChunk(cleanSpeechText(text))}`)) {
            try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
        }
    };

    const stop = () => {
        stopped = true;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            try { audio.load(); } catch { /* ignore */ }
        }
    };

    const pause = () => { audio?.pause(); };
    const resume = () => { audio?.play().catch(() => {}); };

    (async () => {
        try {
            objectUrl = await fetchTtsObjectUrl(text, voice);
            if (stopped) return;

            audio = new Audio(objectUrl);
            audio.preload = 'auto';
            audio.playbackRate = playbackRate;
            if (audioRef) audioRef.current = audio;

            audio.onplay = () => onPlay?.(audio);
            audio.onended = () => onEnded?.(audio);
            audio.onerror = (e) => onError?.(e, audio);

            await audio.play();
        } catch (err) {
            if (!stopped) onError?.(err, audio);
        }
    })();

    return { stop, pause, resume, get audio() { return audio; } };
}

/** Play long text as sequential chunks; prefetches the next chunk while current plays */
export function playStreamingTtsQueued(text, voice, {
    audioRef,
    onPlay,
    onEnded,
    onError,
    onChunkStart,
    signal,
} = {}) {
    const chunks = splitSpeechChunks(text);
    let idx = 0;
    let stopped = false;
    let paused = false;
    let continueAfterPause = false;
    let currentControl = null;

    const stop = () => {
        stopped = true;
        paused = false;
        continueAfterPause = false;
        currentControl?.stop?.();
        if (audioRef?.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            try { audioRef.current.load(); } catch { /* ignore */ }
        }
    };

    const pause = () => {
        if (stopped) return;
        paused = true;
        currentControl?.pause?.();
        audioRef?.current?.pause();
    };

    const resume = () => {
        if (stopped || !paused) return;
        paused = false;
        if (continueAfterPause) {
            continueAfterPause = false;
            playNext();
            return;
        }
        currentControl?.resume?.();
        audioRef?.current?.play().catch((err) => onError?.(err));
    };

    if (signal) {
        signal.addEventListener('abort', stop, { once: true });
    }

    const playNext = () => {
        if (stopped) return;
        if (paused) {
            continueAfterPause = true;
            return;
        }
        if (idx >= chunks.length) {
            onEnded?.();
            return;
        }

        const chunk = chunks[idx];
        const chunkIdx = idx;
        idx += 1;

        if (idx < chunks.length) prefetchTts(chunks[idx], voice);

        currentControl = playStreamingTts(chunk, voice, {
            audioRef,
            onPlay: chunkIdx === 0 ? onPlay : undefined,
            onEnded: () => {
                if (paused) {
                    continueAfterPause = true;
                    return;
                }
                playNext();
            },
            onError: (err) => {
                // Fall back to browser voice for this chunk, then continue — do NOT skip the whole script
                const recovered = browserSpeechFallback(chunk, () => {
                    if (paused) {
                        continueAfterPause = true;
                        return;
                    }
                    playNext();
                });
                if (!recovered) onError?.(err);
            },
        });

        onChunkStart?.(chunkIdx, chunks.length);
    };

    playNext();
    return { stop, pause, resume };
}

export function browserSpeechFallback(text, onEnd) {
    try {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(cleanSpeechText(text));
        u.rate = 1.02;
        u.onend = () => onEnd?.();
        u.onerror = () => onEnd?.();
        window.speechSynthesis?.speak(u);
        return true;
    } catch {
        onEnd?.();
        return false;
    }
}
