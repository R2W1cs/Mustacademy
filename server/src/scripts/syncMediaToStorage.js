/**
 * One-time migration: upload local media folders to object storage.
 * Usage (from server/): node src/scripts/syncMediaToStorage.js
 * Requires S3_* env vars. Never run against production DB — files only.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {
  isObjectStorageEnabled,
  uploadLocalFile,
  publicUrlForKey,
} from '../services/objectStorage.service.js';

const MIME = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

async function syncDir(localDir, keyPrefix) {
  if (!fs.existsSync(localDir)) {
    console.log(`[skip] ${localDir} does not exist`);
    return 0;
  }
  let count = 0;
  for (const name of fs.readdirSync(localDir)) {
    const full = path.join(localDir, name);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    const key = `${keyPrefix}/${name}`;
    const url = await uploadLocalFile(full, key, MIME[ext] || 'application/octet-stream');
    console.log(`  uploaded ${name} -> ${url}`);
    count++;
  }
  return count;
}

async function main() {
  if (!isObjectStorageEnabled()) {
    console.error('Object storage is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL.');
    process.exit(1);
  }

  const root = process.cwd();
  let total = 0;
  total += await syncDir(path.join(root, 'uploads', 'videos'), 'videos');
  total += await syncDir(path.join(root, '..', 'tts-service', 'docum'), 'tts/docum');
  total += await syncDir(path.join(root, '..', 'tts-service', 'podcasts'), 'tts/podcasts');
  console.log(`\nDone. ${total} file(s) uploaded. Public base: ${process.env.S3_PUBLIC_URL}`);
  console.log('Update DB video_url values to CDN URLs or keep relative paths (API resolves them).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});