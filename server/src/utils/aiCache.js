/**
 * Simple in-memory LRU-style cache for AI responses.
 * Prevents re-hitting the AI API for identical prompts within the TTL window.
 */

const cache = new Map();
const MAX_ENTRIES = 200;
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function evictOldest() {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
}

export function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    // Move to end (LRU touch)
    cache.delete(key);
    cache.set(key, entry);
    return entry.value;
}

export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
    if (cache.size >= MAX_ENTRIES) evictOldest();
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheKey(...parts) {
    return parts.map(p => String(p).slice(0, 200)).join('||');
}

export function cacheStats() {
    return { size: cache.size, maxEntries: MAX_ENTRIES };
}
