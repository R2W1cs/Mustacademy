import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/forgot-password', authLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

export default router;
