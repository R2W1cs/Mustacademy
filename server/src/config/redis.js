/**
 * redis.js
 * Shared Redis connection options for BullMQ queues and workers.
 * BullMQ creates its own ioredis instances using these options.
 * Falls back gracefully when REDIS_URL is not configured.
 */

export const redisAvailable = !!process.env.REDIS_URL;

// BullMQ accepts a `connection` option that is either an ioredis instance
// or a plain connection config object. We export the config object so that
// each Queue/Worker creates its own connection (BullMQ requirement).
export const redisOpts = redisAvailable
    ? {
          // ioredis URL string — BullMQ will create an ioredis instance internally
          url: process.env.REDIS_URL,
          // Required by BullMQ: no retry limit so the worker stays alive
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
      }
    : null;

if (!redisAvailable) {
    console.warn("[Redis] REDIS_URL not set — BullMQ disabled, using in-process job queue.");
}
