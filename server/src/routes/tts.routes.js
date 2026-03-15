import express from 'express';
import { generateTTS } from '../controllers/tts.controller.js';

const router = express.Router();

/**
 * @route POST /api/tts
 * @desc Generate high-quality Neural TTS audio
 * @access Public
 */
router.post('/', generateTTS);

export default router;
