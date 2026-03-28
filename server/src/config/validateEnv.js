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
  { key: 'GROQ_API_KEY', hint: 'Groq API key — AI features will use fallback without it' },
  { key: 'GEMINI_API_KEY', hint: 'Google Gemini key — needed for AI fallback chain' },
  { key: 'FRONTEND_URL', hint: 'Frontend origin for CORS (e.g. https://mustacademy.vercel.app)' },
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

  console.log('[ENV] ✓ Environment validated');
}
