import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret-not-real-32chars-long';
const signToken = (payload) => jwt.sign(payload, JWT_SECRET);

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

    it('returns 201 with user and auth cookies on success', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] }) // no existing user
            .mockResolvedValueOnce({ rows: [{ id: 42, name: 'Bob', email: 'bob@test.com', role: 'user', token_version: 0 }] }) // insert
            .mockResolvedValueOnce({ rows: [] }) // user_stats
            .mockResolvedValueOnce({ rows: [] }) // user_contributions
            .mockResolvedValueOnce({ rows: [] }); // refresh_tokens insert
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@test.com', password: 'secret123' });
        expect(res.status).toBe(201);
        expect(res.body).not.toHaveProperty('token');
        expect(res.body.user).toMatchObject({ name: 'Bob', email: 'bob@test.com' });
        expect(res.headers['set-cookie']).toBeDefined();
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
                token_version: 0,
                failed_login_attempts: 0,
                locked_until: null,
            }],
        })
            .mockResolvedValueOnce({ rows: [{ failed_login_attempts: 1, locked_until: null }] });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@test.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });
});

describe('Security hardening', () => {
    beforeEach(() => vi.clearAllMocks());

    it('PATCH /api/profile/plan returns 403', async () => {
        const token = signToken({ id: 1, role: 'student', tv: 0 });
        pool.query.mockResolvedValueOnce({ rows: [{ role: 'student', token_version: 0 }] });
        const res = await request(app)
            .patch('/api/profile/plan')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('GET /api/admin/stats returns 401 without token', async () => {
        const res = await request(app).get('/api/admin/stats');
        expect(res.status).toBe(401);
    });

    it('GET /api/admin/stats returns 403 for student', async () => {
        const token = signToken({ id: 2, role: 'student', tv: 0 });
        pool.query.mockResolvedValueOnce({ rows: [{ role: 'student', token_version: 0 }] });
        const res = await request(app)
            .get('/api/admin/stats')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('protect rejects revoked token_version', async () => {
        const token = signToken({ id: 4, role: 'student', tv: 0 });
        pool.query.mockResolvedValueOnce({ rows: [{ role: 'student', token_version: 1 }] });
        const res = await request(app)
            .get('/api/auth/session')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Token revoked');
    });

    it('POST /api/auth/register rejects weak password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@test.com', password: 'short' });
        expect(res.status).toBe(400);
    });
});
