/**
 * One-shot lesson markdown sync for CS 342 / CS 321 / MATH 270 (not run on boot).
 * Usage: npm run seed:lesson-content
 */
import { loadServerEnv } from '../config/loadServerEnv.js';
loadServerEnv();

import pool from '../config/db.js';
import { ensureCourseLessonContent } from '../config/ensureCourseLessonContent.js';

await ensureCourseLessonContent();
await pool.end();
console.log('[seed:lesson-content] done');
