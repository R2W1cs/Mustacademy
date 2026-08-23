import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { keyFromStoredUrl, publicUrlForKey } from '../../src/services/objectStorage.service.js';
import { resolveMediaUrl } from '../../src/utils/mediaUrl.js';

describe('object storage URL helpers', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.S3_BUCKET = 'mustacademy';
    process.env.S3_ACCESS_KEY_ID = 'test';
    process.env.S3_SECRET_ACCESS_KEY = 'test';
    process.env.S3_PUBLIC_URL = 'https://cdn.example.com';
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('maps local video path to object key', () => {
    expect(keyFromStoredUrl('/uploads/videos/clip.mp4')).toBe('videos/clip.mp4');
  });

  it('maps CDN URL back to object key', () => {
    expect(keyFromStoredUrl('https://cdn.example.com/videos/clip.mp4')).toBe('videos/clip.mp4');
  });

  it('builds public CDN URL from key', () => {
    expect(publicUrlForKey('videos/clip.mp4')).toBe('https://cdn.example.com/videos/clip.mp4');
  });

  it('resolves relative upload path to CDN URL when storage enabled', () => {
    expect(resolveMediaUrl('/uploads/videos/clip.mp4')).toBe('https://cdn.example.com/videos/clip.mp4');
  });

  it('passes through absolute URLs unchanged', () => {
    expect(resolveMediaUrl('https://blob.vercel-storage.com/x.mp4')).toBe('https://blob.vercel-storage.com/x.mp4');
  });
});