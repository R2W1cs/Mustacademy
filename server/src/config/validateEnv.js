/**
 * Validates required environment variables before the server starts.
 * Call this once at the top of server.js — any missing var will crash fast
 * with a clear message instead of failing silently at runtime.
 */

const REQUIRED = [
  { key: 'DATABASE_URL', hint: 'PostgreSQL connection string (e.g. from Neon or Render)' },
  { key: 'JWT_SECRET', hint: 'Random 32+ char string — run: openssl rand -hex 32' },
];

const RECOMMENDED = [
  { key: 'GROQ_API_KEY', hint: 'Groq API key — Dr Nova / Boardroom (or use ORCAROUTER_API_KEY)' },
  { key: 'ORCAROUTER_API_KEY', hint: 'Orca Router key — OpenAI-compatible fallback (deepseek flash-free)' },
  { key: 'FRONTEND_URL', hint: 'Frontend origin for CORS (e.g. https://mustacademy.vercel.app)' },
  { key: 'SERPAPI_KEY', hint: 'SerpAPI key — Market Pulse live sync will fail without it' },
];

const PRODUCTION_STORAGE = [
  { key: 'S3_BUCKET', hint: 'Object storage bucket (Cloudflare R2 or AWS S3)' },
  { key: 'S3_ACCESS_KEY_ID', hint: 'R2/S3 access key ID' },
  { key: 'S3_SECRET_ACCESS_KEY', hint: 'R2/S3 secret access key' },
  { key: 'S3_PUBLIC_URL', hint: 'Public CDN base URL for media (e.g. https://pub-xxx.r2.dev)' },
  { key: 'S3_ENDPOINT', hint: 'R2 endpoint (https://<accountid>.r2.cloudflarestorage.com)' },
];

export function validateEnv() {
  const missing = REQUIRED.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n[ENV] ❌ Missing required environment variables:\n');
    missing.forEach(({ key, hint }) => {
      console.error(`  • ${key}\n    → ${hint}`);
    });
    console.error('\nSet them in .env (local) or in your deployment dashboard, then restart.\n');
    process.exit(1);
  }

  const absent = RECOMMENDED.filter(({ key }) => !process.env[key]);
  if (absent.length > 0) {
    console.warn('\n[ENV] ⚠️  Missing recommended environment variables (non-fatal):');
    absent.forEach(({ key, hint }) => console.warn(`  • ${key} — ${hint}`));
    console.warn('');
  }

  if (process.env.NODE_ENV === 'production') {
    const storageMissing = PRODUCTION_STORAGE.filter(({ key }) => !process.env[key]);
    if (storageMissing.length > 0) {
      console.warn('[ENV] ⚠️  Object storage not fully configured — uploads use ephemeral disk:');
      storageMissing.forEach(({ key, hint }) => console.warn(`  • ${key} — ${hint}`));
      console.warn('');
    } else {
      console.log('[ENV] ✓ Object storage configured');
    }
  }

  console.log('[ENV] ✓ Environment validated');
}
