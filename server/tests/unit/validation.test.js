import { describe, it, expect } from 'vitest';
import { validateCreateThread, validateVideoFeedback } from '../../src/utils/validate.js';

const run = (middleware, body) => new Promise((resolve) => {
  const req = { body };
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(payload) { resolve({ status: this.statusCode || 200, body: payload }); },
  };
  middleware(req, res, () => resolve({ status: 200, body: null }));
});

describe('route validation schemas', () => {
  it('rejects forum thread without title', async () => {
    const result = await run(validateCreateThread, { content: 'hello world!!!' });
    expect(result.status).toBe(400);
  });

  it('accepts valid forum thread', async () => {
    const result = await run(validateCreateThread, {
      title: 'Valid thread title',
      content: 'Some content here',
      type: 'discussion',
    });
    expect(result.status).toBe(200);
  });

  it('rejects video feedback without text', async () => {
    const result = await run(validateVideoFeedback, { rating: 5 });
    expect(result.status).toBe(400);
  });
});