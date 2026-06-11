import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getSession,
} from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../utils/validate.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, asyncHandler(register));
router.post('/login', authLimiter, validateLogin, asyncHandler(login));
router.post('/forgot-password', authLimiter, validateForgotPassword, asyncHandler(forgotPassword));
router.post('/reset-password', authLimiter, validateResetPassword, asyncHandler(resetPassword));
router.get('/session', protect, asyncHandler(getSession));

export default router;
