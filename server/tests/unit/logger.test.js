import { describe, it, expect, vi, afterEach } from 'vitest';
import logger from '../../src/utils/logger.js';

afterEach(() => vi.restoreAllMocks());

describe('logger', () => {
    it('exposes info, warn, error, debug methods', () => {
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.debug).toBe('function');
    });

    it('does not throw when called with message only', () => {
        expect(() => logger.info('server started')).not.toThrow();
        expect(() => logger.warn('low memory')).not.toThrow();
        expect(() => logger.error('crash')).not.toThrow();
        expect(() => logger.debug('trace')).not.toThrow();
    });

    it('does not throw when called with meta object', () => {
        expect(() => logger.info('user action', { userId: 1 })).not.toThrow();
        expect(() => logger.error('DB error', { err: 'connection refused', code: 500 })).not.toThrow();
    });

    it('writes error level to stderr', () => {
        const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
        logger.error('critical failure', { err: 'boom' });
        expect(spy).toHaveBeenCalled();
        const output = spy.mock.calls[0][0];
        expect(output).toContain('critical failure');
    });

    it('writes warn level to stdout', () => {
        const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        logger.warn('server ready');
        expect(spy).toHaveBeenCalled();
        const output = spy.mock.calls[0][0];
        expect(output).toContain('server ready');
    });

    it('includes ISO timestamp in output', () => {
        const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        logger.warn('timestamped message');
        const output = spy.mock.calls[0][0];
        expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
});
