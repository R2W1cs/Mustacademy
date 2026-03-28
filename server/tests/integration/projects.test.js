import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock("../../src/config/db.js", () => ({
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

const makeToken = (id = 1) =>
    jwt.sign({ id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('GET /api/projects', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 401 without auth token', async () => {
        const res = await request(app).get('/api/projects');
        expect(res.status).toBe(401);
    });

    it('returns paginated project list', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 1, title: 'AI Tool', owner_name: 'Alice' }] })
            .mockResolvedValueOnce({ rows: [{ count: '1' }] });
        const res = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('projects');
        expect(res.body).toHaveProperty('total', 1);
        expect(res.body).toHaveProperty('totalPages');
        expect(Array.isArray(res.body.projects)).toBe(true);
    });

    it('supports ?page and ?limit params', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ count: '50' }] });
        const res = await request(app)
            .get('/api/projects?page=2&limit=10')
            .set('Authorization', `Bearer ${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body.page).toBe(2);
        expect(res.body.totalPages).toBe(5);
    });
});

describe('POST /api/projects', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 401 without auth token', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ title: 'P', description: 'D' });
        expect(res.status).toBe(401);
    });

    it('returns 400 when title is missing', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ description: 'A cool project' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/title/i);
    });

    it('returns 400 when description is missing', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'My Project' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/description/i);
    });

    it('returns 400 when title exceeds 100 characters', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'a'.repeat(101), description: 'Valid description' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when github_repo is not a GitHub URL', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'My Project', description: 'Desc', github_repo: 'http://notgithub.com/repo' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/github/i);
    });

    it('returns 201 on successful creation', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 10, title: 'My Project', description: 'Desc', owner_id: 1, skills_required: [] }],
        });
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'My Project', description: 'Desc' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id', 10);
        expect(res.body.title).toBe('My Project');
    });

    it('accepts a valid GitHub URL', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 11, title: 'OSS', description: 'Open source', github_repo: 'https://github.com/user/repo', owner_id: 1, skills_required: [] }],
        });
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'OSS', description: 'Open source', github_repo: 'https://github.com/user/repo' });
        expect(res.status).toBe(201);
    });
});
