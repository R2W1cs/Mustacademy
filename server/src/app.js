import express from 'express';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import courseRoutes from './routes/course.routes.js';
import progressRoutes from './routes/progress.routes.js';
import enrollRoutes from './routes/enroll.routes.js';
import profileRoutes from './routes/profile.routes.js';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import chatRoutes from './routes/chat.routes.js';
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


const app = express();

// Universal Request Logging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://mustacademy.vercel.app',
  'https://mustacademy-frontend.vercel.app'
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Sync-ID', 'x-sync-id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files (videos, images, etc.) with absolute path
import path from 'path';
const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`[Static] Serving uploads from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
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


app.get('/api/health', async (req, res) => {
  try {
    const { default: pool } = await import('./config/db.js');
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'MustAcademy API - v16.0 AXIOMATIC_CORE Active 🚀' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend running successfully 🚀' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Global Error]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
