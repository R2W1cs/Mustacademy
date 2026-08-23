import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { listKBFiles, readKBFile, writeKBFile, deleteKBFile } from '../controllers/admin.controller.js';
import {
  getStats,
  getStudents, getStudentDetail,
  enrollStudent, updateEnrollment,
  getCourses, createCourse, updateCourse,
  getUsers, updateUserRole,
} from '../controllers/adminDashboard.controller.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireAdminOrProfessor = (req, res, next) => {
  if (!['admin', 'professor'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

router.use(protect);

// ── Knowledge Base (admin only) ───────────────────────────────────────────────
router.get('/kb',        requireAdmin, listKBFiles);
router.get('/kb/:name',  requireAdmin, readKBFile);
router.put('/kb/:name',  requireAdmin, writeKBFile);
router.delete('/kb/:name', requireAdmin, deleteKBFile);

// ── Overview ──────────────────────────────────────────────────────────────────
router.get('/stats', requireAdminOrProfessor, getStats);

// ── Students ──────────────────────────────────────────────────────────────────
router.get('/students',      requireAdminOrProfessor, getStudents);
router.get('/students/:id',  requireAdminOrProfessor, getStudentDetail);

// ── Enrollments ───────────────────────────────────────────────────────────────
router.post('/enrollments',        requireAdmin, enrollStudent);
router.put('/enrollments/:id',     requireAdminOrProfessor, updateEnrollment);

// ── Courses ───────────────────────────────────────────────────────────────────
router.get('/courses',      requireAdminOrProfessor, getCourses);
router.post('/courses',     requireAdmin, createCourse);
router.put('/courses/:id',  requireAdmin, updateCourse);

// ── Users / Role Management ───────────────────────────────────────────────────
router.get('/users',         requireAdmin, getUsers);
router.put('/users/:id/role', requireAdmin, updateUserRole);

export default router;
