/**
 * One-shot content seed (not run on boot).
 * Usage: npm run seed:course-careers
 */
import { loadServerEnv } from '../config/loadServerEnv.js';
loadServerEnv();

import pool from '../config/db.js';
import { ensureCourseCareerSeed } from '../config/ensureCareerSchema.js';

await ensureCourseCareerSeed();
await pool.end();
console.log('[seed:course-careers] done');
