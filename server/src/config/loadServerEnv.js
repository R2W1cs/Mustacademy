/**
 * Load server/.env even when saved as UTF-16 (Windows notepad).
 * Safe no-op if file missing or already loaded via process env (Render).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

export function loadServerEnv() {
  const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const envPath = path.join(serverRoot, '.env');
  if (!fs.existsSync(envPath)) {
    dotenv.config();
    return;
  }

  const buf = fs.readFileSync(envPath);
  let text;
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    text = buf.toString('utf16le');
  } else if (buf[0] === 0xfe && buf[1] === 0xff) {
    text = Buffer.from(buf.swap16()).toString('utf16le');
  } else {
    text = buf.toString('utf8');
  }
  const parsed = dotenv.parse(text.replace(/^\uFEFF/, ''));
  for (const [k, v] of Object.entries(parsed)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}
