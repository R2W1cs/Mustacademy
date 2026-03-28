import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import courseRoutes from './routes/course.routes.js';
import progressRoutes from './routes/progress.routes.js';
import enrollRoutes from './routes/enroll.routes.js';
import profileRoutes from './routes/profile.routes.js';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import badgeRoutes from './routes/badge.routes.js';

import contributionRoutes from './routes/contribution.routes.js';
import videoRoutes from './routes/video.routes.js';
import careerRoutes from './routes/career.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import examRoutes from './routes/exam.routes.js';
import protocolRoutes from './routes/protocol.routes.js';
import forumRoutes from './routes/forum.routes.js';
import marketRoutes from './routes/market.routes.js';
import projectRoutes from './routes/project.routes.js';
import ttsRoutes from './routes/tts.routes.js';
import arenaRoutes from './routes/arena.routes.js';
import adminRoutes from './routes/admin.routes.js';


const app = express();

// Security headers (CSP disabled — API-only server, no HTML)
app.use(helmet({ contentSecurityPolicy: false }));

// HTTP request logging (dev: colorized, production: combined Apache format)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://mustacademy.vercel.app',
  'https://mustacademy-frontend.vercel.app',
  'https://mustAacademy.vercel.app'
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files (videos, images, etc.) with absolute path
import path from 'path';
import pool from './config/db.js';
const __dirname = path.resolve();

// Helmet sets Cross-Origin-Resource-Policy: same-origin globally.
// Static media routes (video/audio) need cross-origin to load in <video>/<audio> tags.
const crossOriginStatic = (dir) => [
    (_req, res, next) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); },
    express.static(dir)
];

const uploadsPath = path.join(__dirname, 'uploads');
logger.info(`[Static] Serving uploads from: ${uploadsPath}`);
app.use('/uploads', ...crossOriginStatic(uploadsPath));
const ttsDocumPath = path.join(__dirname, '..', 'tts-service', 'docum');
app.use('/tts-docum', ...crossOriginStatic(ttsDocumPath));
const ttsPodcastsPath = path.join(__dirname, '..', 'tts-service', 'podcasts');
app.use('/tts-podcasts', ...crossOriginStatic(ttsPodcastsPath));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/badges', badgeRoutes);

app.use('/api/contributions', contributionRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/admin', adminRoutes);


app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok', uptime: Math.floor(process.uptime()) });
  } catch (err) {
    logger.error('[Health] DB ping failed', { err: err.message });
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'MustAcademy API - Precision Sync Active 🚀' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend running successfully 🚀' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('[Global Error]', { msg: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
