import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../src/config/db.js', () => ({
    default: { query: vi.fn().mockResolvedValue({ rows: [] }) }
}));
vi.mock('../../src/middleware/rateLimiter.js', () => ({
    authLimiter: (_req, _res, next) => next(),
    aiLimiter:   (_req, _res, next) => next(),
    generalLimiter: (_req, _res, next) => next(),
    heavyAiLimiter: (_req, _res, next) => next(),
}));

import app from '../../src/app.js';
import pool from '../../src/config/db.js';

describe('GET /api/health', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 200 with ok status when DB is reachable', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.db).toBe('ok');
        expect(typeof res.body.uptime).toBe('number');
    });

    it('returns 503 when DB is unreachable', async () => {
        pool.query.mockRejectedValueOnce(new Error('Connection refused'));
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('error');
        expect(res.body.db).toBe('unreachable');
    });

    it('responds with JSON content-type', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get('/api/health');
        expect(res.headers['content-type']).toMatch(/json/);
    });
});
