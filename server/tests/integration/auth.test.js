import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

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

describe('POST /api/auth/register', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 when name is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@test.com', password: 'secret123' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', password: 'secret123' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@test.com' });
        expect(res.status).toBe(400);
    });

    it('returns 409 when email already exists', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@test.com', password: 'secret123' });
        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Email already used');
    });

    it('returns 201 with token and user on success', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] }) // no existing user
            .mockResolvedValueOnce({ rows: [{ id: 42, name: 'Bob', email: 'bob@test.com', role: 'user' }] }) // insert
            .mockResolvedValueOnce({ rows: [] }) // user_stats
            .mockResolvedValueOnce({ rows: [] }); // user_contributions
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@test.com', password: 'secret123' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toMatchObject({ name: 'Bob', email: 'bob@test.com' });
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'secret' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@test.com' });
        expect(res.status).toBe(400);
    });

    it('returns 401 when user does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@test.com', password: 'pass' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('returns 401 when password is wrong', async () => {
        // bcrypt hash for "correctpassword"
        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                email: 'bob@test.com',
                // intentionally invalid hash — bcrypt.compare will return false
                password_hash: '$2b$10$invalidhashvalue000000000000000000000000000',
                role: 'user',
                name: 'Bob',
            }],
        });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@test.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });
});
