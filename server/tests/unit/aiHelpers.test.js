import { describe, it, expect } from 'vitest';
import { sanitizeMermaid } from '../../src/services/ai/aiHelpers.js';

describe('sanitizeMermaid', () => {
  it('strips markdown fences', () => {
    const input = '```mermaid\ngraph TD\nA-->B\n```';
    expect(sanitizeMermaid(input)).toBe('graph TD\nA-->B');
  });

  it('quotes labels with spaces in parentheses', () => {
    expect(sanitizeMermaid('A(My Label Here)')).toBe('A["My Label Here"]');
  });
});