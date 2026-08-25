/**
 * Fast TTS playback — GET streaming so audio starts before synthesis finishes.
 * Avoid responseType: 'blob' POST which waits for the entire MP3 (~20–30s on long text).
 */

function getApiBase() {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const base = import.meta.env.VITE_API_URL
        || (isProduction ? 'https://mustacademy-backend.onrender.com/api' : 'http://localhost:5000/api');
    return base.replace(/\/$/, '');
}

/** Safe max chars for GET URL after encoding */
const MAX_URL_CHARS = 1100;

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

function trimForUrl(text) {
    if (text.length <= MAX_URL_CHARS) return text;
    const cut = text.slice(0, MAX_URL_CHARS);
    const lastStop = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'));
    return lastStop > 60 ? cut.slice(0, lastStop + 1) : cut;
}

export function buildTtsUrl(text, voice) {
    const payload = trimForUrl(cleanSpeechText(text));
    return `${getApiBase()}/tts?text=${encodeURIComponent(payload)}&voice=${encodeURIComponent(voice)}`;
}

/** Split long replies into sentence chunks — first chunk plays in ~2–5s instead of 30s */
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

export function prefetchTts(text, voice) {
    try {
        const audio = new Audio(buildTtsUrl(text, voice));
        audio.preload = 'auto';
        audio.load();
        return audio;
    } catch {
        return null;
    }
}

/**
 * Stream TTS via GET. Audio element starts playback as soon as enough bytes arrive.
 */
export function playStreamingTts(text, voice, {
    audioRef,
    onPlay,
    onEnded,
    onError,
    playbackRate = 1,
} = {}) {
    const url = buildTtsUrl(text, voice);
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.playbackRate = playbackRate;
    if (audioRef) audioRef.current = audio;

    audio.onplay = () => onPlay?.(audio);
    audio.onended = () => onEnded?.(audio);
    audio.onerror = (e) => onError?.(e, audio);

    audio.play().catch((err) => onError?.(err, audio));

    return {
        audio,
        stop: () => {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        },
    };
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

    const stop = () => {
        stopped = true;
        if (audioRef?.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
        }
    };

    if (signal) {
        signal.addEventListener('abort', stop, { once: true });
    }

    const playNext = () => {
        if (stopped || idx >= chunks.length) {
            onEnded?.();
            return;
        }

        const chunk = chunks[idx];
        const chunkIdx = idx;
        idx += 1;

        if (idx < chunks.length) prefetchTts(chunks[idx], voice);

        playStreamingTts(chunk, voice, {
            audioRef,
            onPlay: chunkIdx === 0 ? onPlay : undefined,
            onEnded: playNext,
            onError: (err) => onError?.(err),
        });

        onChunkStart?.(chunkIdx, chunks.length);
    };

    playNext();
    return { stop };
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
