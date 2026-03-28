import { describe, it, expect, vi } from 'vitest';
import { validate } from '../../src/utils/validate.js';

const makeRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('validate middleware', () => {
    it('calls next() when all required fields are valid', () => {
        const mw = validate({ name: { required: true, type: 'string' } });
        const req = { body: { name: 'Alice' } };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 400 when required field is missing', () => {
        const mw = validate({ name: { required: true } });
        const req = { body: {} };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'name is required' })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when required field is empty string', () => {
        const mw = validate({ title: { required: true, type: 'string' } });
        const req = { body: { title: '' } };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when field exceeds maxLength', () => {
        const mw = validate({ title: { required: true, type: 'string', maxLength: 5 } });
        const req = { body: { title: 'toolongstring' } };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'title must be at most 5 characters' })
        );
    });

    it('allows optional fields that are absent', () => {
        const mw = validate({ bio: { required: false, type: 'string', maxLength: 100 } });
        const req = { body: {} };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(next).toHaveBeenCalledOnce();
    });

    it('validates pattern when optional field is provided', () => {
        const mw = validate({
            url: { required: false, pattern: /^https:\/\//, patternMsg: 'url must start with https' },
        });
        const req = { body: { url: 'http://example.com' } };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'url must start with https' })
        );
    });

    it('passes when optional field matches pattern', () => {
        const mw = validate({
            url: { required: false, pattern: /^https:\/\/github\.com\/.+/i },
        });
        const req = { body: { url: 'https://github.com/user/repo' } };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(next).toHaveBeenCalledOnce();
    });

    it('returns errors array with all violations', () => {
        const mw = validate({ title: { required: true }, description: { required: true } });
        const req = { body: {} };
        const res = makeRes();
        mw(req, res, next => {});
        const payload = res.json.mock.calls[0][0];
        expect(Array.isArray(payload.errors)).toBe(true);
        expect(payload.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('returns 400 when type is string but value is a number', () => {
        const mw = validate({ count: { required: true, type: 'string' } });
        const req = { body: { count: 42 } };
        const res = makeRes();
        const next = vi.fn();
        mw(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
