import { isObjectStorageEnabled, publicUrlForKey, keyFromStoredUrl } from '../services/objectStorage.service.js';

export function resolveMediaUrl(storedUrl) {
  if (!storedUrl) return storedUrl;
  if (/^https?:\/\//i.test(storedUrl)) return storedUrl;

  if (!isObjectStorageEnabled() || !process.env.S3_PUBLIC_URL) {
    return storedUrl;
  }

  const key = keyFromStoredUrl(storedUrl);
  if (!key) return storedUrl;

  try {
    return publicUrlForKey(key);
  } catch {
    return storedUrl;
  }
}

export function resolveMediaFields(row, fields = ['video_url', 'thumbnail_url']) {
  if (!row) return row;
  const out = { ...row };
  for (const field of fields) {
    if (out[field]) out[field] = resolveMediaUrl(out[field]);
  }
  return out;
}